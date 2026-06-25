import "jsr:@supabase/functions-js/edge-runtime.d.ts"

const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY')
const MODEL = 'openai/gpt-oss-120b:free'

function corsHeaders(req: Request) {
  const origin = req.headers.get('origin') ?? ''
  const allowed =
    origin === 'http://localhost:3000' ||
    origin.endsWith('.vercel.app') ||
    origin === (Deno.env.get('APP_URL') ?? '')
  return {
    'Access-Control-Allow-Origin': allowed ? origin : 'null',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }
}

/** Category names matching DB values exactly (case-sensitive). */
const CATEGORIES = [
  'Bills',
  'Education bill',
  'Entertainment',
  'Food',
  'Health',
  'Income',
  'Other',
  'Shopping',
  'Transport',
]

Deno.serve(async (req: Request) => {
  const CORS = corsHeaders(req)

  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: CORS })
  }

  try {
    const body = await req.json()
    const description: string = (body?.description ?? '').trim()

    // Guard: too short to classify
    if (description.length < 2) {
      return json({ category: 'Other', source: 'default' }, 200, CORS)
    }

    // Guard: API key not configured
    if (!OPENROUTER_API_KEY) {
      console.error('OPENROUTER_API_KEY secret is not set')
      return json({ category: 'Other', source: 'error' }, 500, CORS)
    }

    const systemPrompt =
      `You are a precise financial transaction categorizer.\n` +
      `Classify the given transaction description into EXACTLY ONE of these categories:\n` +
      CATEGORIES.map(c => `- ${c}`).join('\n') + '\n\n' +
      `Rules:\n` +
      `- Reply with ONLY the category name — no punctuation, explanation, or extra text.\n` +
      `- Match capitalisation exactly as shown above.\n` +
      `- Use "Other" when no category fits well.`

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://budgetai.app',
        'X-Title': 'BudgetAI',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user',   content: `Transaction: "${description}"` },
        ],
        max_tokens: 16,
        temperature: 0,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('OpenRouter error', response.status, errText)
      throw new Error(`OpenRouter returned ${response.status}`)
    }

    const data = await response.json()
    const raw: string = data.choices?.[0]?.message?.content?.trim() ?? 'Other'

    // Normalise — case-insensitive match against our list, fall back to Other
    const matched = CATEGORIES.find(c => c.toLowerCase() === raw.toLowerCase()) ?? 'Other'

    console.log(`[categorize] "${description}" => "${matched}" (raw: "${raw}")`)

    return json({ category: matched, source: 'ai', model: MODEL }, 200, CORS)
  } catch (err) {
    console.error('[categorize] Error:', err)
    return json({ category: 'Other', source: 'error' }, 500, CORS)
  }
})

function json(data: unknown, status = 200, cors: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...cors },
  })
}
