export type TransactionType = 'income' | 'expense'

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  is_default: boolean
  user_id: string | null
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  amount: number
  category_id: string | null
  description: string | null
  notes: string | null
  date: string
  attachment_url: string | null
  attachment_name: string | null
  attachment_type: string | null
  created_at: string
  updated_at: string
  categories?: Category
}

export interface Budget {
  id: string
  user_id: string
  category_id: string | null
  month: number
  year: number
  amount: number
  alert_threshold: number
  created_at: string
  updated_at: string
  categories?: Category
}

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: Category
        Insert: Omit<Category, 'id' | 'created_at'>
        Update: Partial<Omit<Category, 'id' | 'created_at'>>
      }
      transactions: {
        Row: Transaction
        Insert: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Transaction, 'id' | 'created_at' | 'updated_at'>>
      }
      budgets: {
        Row: Budget
        Insert: Omit<Budget, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Budget, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}
