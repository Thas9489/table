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

export interface SubscriptionPlan {
  id: string
  name: string
  display_name: string
  description: string | null
  price: number
  currency: string
  interval_type: string
  interval_count: number
  features: string[]
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface UserSubscription {
  id: string
  user_id: string
  plan_id: string | null
  status: 'free' | 'active' | 'cancelled' | 'expired'
  started_at: string | null
  expires_at: string | null
  next_billing_at: string | null
  auto_renew: boolean
  cancelled_at: string | null
  created_at: string
  updated_at: string
  plan?: SubscriptionPlan
}

export interface PaymentTransaction {
  id: string
  user_id: string
  subscription_id: string | null
  plan_id: string | null
  invoice_number: string
  myfatoorah_invoice_id: string | null
  myfatoorah_payment_id: string | null
  amount: number
  currency: string
  status: 'pending' | 'paid' | 'failed' | 'expired' | 'cancelled'
  payment_method: string | null
  error_message: string | null
  raw_response: Record<string, unknown> | null
  created_at: string
  updated_at: string
  plan?: SubscriptionPlan
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
      subscription_plans: {
        Row: SubscriptionPlan
        Insert: Omit<SubscriptionPlan, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<SubscriptionPlan, 'id' | 'created_at' | 'updated_at'>>
      }
      user_subscriptions: {
        Row: UserSubscription
        Insert: Omit<UserSubscription, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<UserSubscription, 'id' | 'created_at' | 'updated_at'>>
      }
      payment_transactions: {
        Row: PaymentTransaction
        Insert: Omit<PaymentTransaction, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<PaymentTransaction, 'id' | 'created_at' | 'updated_at'>>
      }
    }
  }
}
