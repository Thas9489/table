import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

const SEED_TRANSACTIONS = [
  { description: 'Monthly Salary',        type: 'income',  amount: 3500.00, categoryName: 'Income',         date: '2026-06-01' },
  { description: 'Grocery Shopping',      type: 'expense', amount: 85.50,   categoryName: 'Food',           date: '2026-06-03' },
  { description: 'Uber Ride',             type: 'expense', amount: 18.75,   categoryName: 'Transport',      date: '2026-06-04' },
  { description: 'Electricity Bill',      type: 'expense', amount: 124.00,  categoryName: 'Bills',          date: '2026-06-05' },
  { description: 'Netflix Subscription',  type: 'expense', amount: 15.99,   categoryName: 'Entertainment',  date: '2026-06-06' },
  { description: 'Pharmacy Purchase',     type: 'expense', amount: 42.30,   categoryName: 'Health',         date: '2026-06-07' },
  { description: 'Online Course',         type: 'expense', amount: 49.00,   categoryName: 'Education bill', date: '2026-06-08' },
  { description: 'Clothing Purchase',     type: 'expense', amount: 93.00,   categoryName: 'Shopping',       date: '2026-06-10' },
  { description: 'Fuel Expense',          type: 'expense', amount: 55.20,   categoryName: 'Transport',      date: '2026-06-12' },
  { description: 'Freelance Payment',     type: 'income',  amount: 800.00,  categoryName: 'Income',         date: '2026-06-14' },
] as const

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient()

    // Get authenticated user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const userId = user.id

    // Avoid re-seeding if user already has transactions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase as any)
      .from('transactions')
      .select('id')
      .eq('user_id', userId)
      .limit(1)

    if (existing && existing.length > 0) {
      return NextResponse.json({ message: 'Already seeded', count: 0 })
    }

    // Fetch all categories to map by name
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: categories } = await (supabase as any)
      .from('categories')
      .select('id, name')

    const catMap = new Map<string, string>()
    if (categories) {
      for (const cat of categories) {
        catMap.set(cat.name.toLowerCase(), cat.id)
      }
    }

    const rows = SEED_TRANSACTIONS.map(tx => ({
      user_id:         userId,
      type:            tx.type,
      amount:          tx.amount,
      description:     tx.description,
      date:            tx.date,
      category_id:     catMap.get(tx.categoryName.toLowerCase()) ?? null,
      notes:           null,
      attachment_url:  null,
      attachment_name: null,
      attachment_type: null,
    }))

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('transactions').insert(rows)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'Seeded successfully', count: rows.length })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
