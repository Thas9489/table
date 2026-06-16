import { NextRequest, NextResponse } from 'next/server'

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
const MODEL = 'openai/gpt-oss-120b:free'

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const description: string = (body?.description ?? '').trim()

    if (description.length < 2) {
      return NextResponse.json({ category: 'Other', source: 'default' })
    }

    if (!OPENROUTER_API_KEY) {
      console.error('[categorize] OPENROUTER_API_KEY is not set in environment')
      return NextResponse.json(
        { category: 'Other', source: 'error', error: 'API key not configured' },
        { status: 500 }
      )
    }

    const systemPrompt =
      `You are a precise financial transaction categorizer.\n` +
      `Classify the given transaction description into EXACTLY ONE of these categories:\n` +
      CATEGORIES.map(c => `- ${c}`).join('\n') + '\n\n' +
      `Rules:\n` +
      `- Reply with ONLY the category name, no punctuation or explanation.\n` +
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
      console.error('[categorize] OpenRouter error', response.status, errText)
      return NextResponse.json(
        { category: 'Other', source: 'error', error: `OpenRouter returned ${response.status}` },
        { status: 502 }
      )
    }

    const data = await response.json()
    const raw: string = data.choices?.[0]?.message?.content?.trim() ?? 'Other'

    // Normalise — case-insensitive match, fall back to Other
    const matched = CATEGORIES.find(c => c.toLowerCase() === raw.toLowerCase()) ?? 'Other'

    console.log(`[categorize] "${description}" => "${matched}" (raw: "${raw}")`)

    return NextResponse.json({ category: matched, source: 'ai', model: MODEL })
  } catch (err) {
    console.error('[categorize] Error:', err)
    return NextResponse.json(
      { category: 'Other', source: 'error', error: String(err) },
      { status: 500 }
    )
  }
}
