// User and Account Types
export interface User {
  id: string
  name: string
  email: string
  profileImage?: string
  createdAt: string
}

export interface Account {
  id: string
  name: string
  type: 'checking' | 'savings' | 'credit' | 'investment'
  balance: number
  currency: string
  lastSynced: string
  bankName: string
  accountNumber: string
  isDemo: boolean
}

// Transaction Types
export interface Transaction {
  id: string
  accountId: string
  amount: number
  description: string
  category: TransactionCategory
  date: string
  type: 'income' | 'expense'
  merchant?: string
  location?: string
  isRecurring: boolean
  tags: string[]
}

export type TransactionCategory = 
  | 'food' 
  | 'housing' 
  | 'transportation' 
  | 'entertainment' 
  | 'utilities' 
  | 'shopping' 
  | 'healthcare' 
  | 'income'
  | 'other'

// Budget Types
export interface Budget {
  id: string
  category: TransactionCategory
  limit: number
  spent: number
  period: 'monthly' | 'yearly'
  startDate: string
  endDate: string
}

export interface BudgetAlert {
  id: string
  budgetId: string
  type: 'warning' | 'overspend' | 'milestone'
  message: string
  threshold: number
  isRead: boolean
  createdAt: string
}

// Analytics and Insights
export interface MonthlyInsight {
  month: string
  totalIncome: number
  totalExpenses: number
  netSavings: number
  savingsRate: number
  topCategories: CategorySpending[]
}

export interface CategorySpending {
  category: TransactionCategory
  amount: number
  percentage: number
  transactionCount: number
}

export interface CashFlowForecast {
  date: string
  projectedIncome: number
  projectedExpenses: number
  confidence: number
  cumulativeBalance: number
}

// Notification Types
export interface Notification {
  id: string
  type: 'alert' | 'insight' | 'milestone' | 'security'
  title: string
  message: string
  isRead: boolean
  createdAt: string
  actionUrl?: string
}

// App State Types
export interface AppState {
  user: User | null
  accounts: Account[]
  transactions: Transaction[]
  budgets: Budget[]
  notifications: Notification[]
  insights: MonthlyInsight[]
  cashFlowForecast: CashFlowForecast[]
  isLoading: boolean
  error: string | null
  demoMode: boolean
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  error?: string
}

// Chart Data Types
export interface ChartDataPoint {
  label: string
  value: number
  color?: string
}

export interface TimeSeriesPoint {
  date: string
  value: number
}

// Settings Types
export interface UserSettings {
  currency: string
  dateFormat: string
  notifications: {
    email: boolean
    push: boolean
    budgetAlerts: boolean
    weeklyReports: boolean
  }
  privacy: {
    shareData: boolean
    analytics: boolean
  }
} 