import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { 
  AppState, 
  User, 
  Account, 
  Transaction, 
  Budget, 
  Notification, 
  MonthlyInsight,
  CashFlowForecast,
  TransactionCategory 
} from '../types'
import { initializeMockData, generateMonthlyInsights, generateCashFlowForecast } from '../data/mockData'

interface FinanceStore extends AppState {
  // Actions
  setUser: (user: User) => void
  setAccounts: (accounts: Account[]) => void
  addTransaction: (transaction: Transaction) => void
  updateTransaction: (id: string, updates: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  setBudgets: (budgets: Budget[]) => void
  updateBudget: (id: string, updates: Partial<Budget>) => void
  addNotification: (notification: Notification) => void
  markNotificationRead: (id: string) => void
  setInsights: (insights: MonthlyInsight[]) => void
  setCashFlowForecast: (forecast: CashFlowForecast[]) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  toggleDemoMode: () => void
  
  // Computed values
  getTotalBalance: () => number
  getMonthlyIncome: () => number
  getMonthlyExpenses: () => number
  getSavingsRate: () => number
  getCategorySpending: () => { category: TransactionCategory; amount: number; count: number }[]
  getRecentTransactions: (limit?: number) => Transaction[]
  getUnreadNotificationCount: () => number
  
  // Data loading
  loadTransactionsFromFile: (transactions: Transaction[]) => void
  loadDemoData: () => void
  refreshData: () => Promise<void>
}

export const useFinanceStore = create<FinanceStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      accounts: [],
      transactions: [],
      budgets: [],
      notifications: [],
      insights: [],
      cashFlowForecast: [],
      isLoading: false,
        error: null,
  demoMode: false,

      // Actions
      setUser: (user) => set({ user }),
      
      setAccounts: (accounts) => set({ accounts }),
      
      addTransaction: (transaction) => 
        set((state) => ({
          transactions: [transaction, ...state.transactions]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        })),
      
      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),
      
      deleteTransaction: (id) =>
        set((state) => ({
          transactions: state.transactions.filter((t) => t.id !== id),
        })),
      
      setBudgets: (budgets) => set({ budgets }),
      
      updateBudget: (id, updates) =>
        set((state) => ({
          budgets: state.budgets.map((b) =>
            b.id === id ? { ...b, ...updates } : b
          ),
        })),
      
      addNotification: (notification) =>
        set((state) => ({
          notifications: [notification, ...state.notifications],
        })),
      
      markNotificationRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        })),
      
      setInsights: (insights) => set({ insights }),
      setCashFlowForecast: (cashFlowForecast) => set({ cashFlowForecast }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      toggleDemoMode: () => set((state) => ({ demoMode: !state.demoMode })),

      // Computed values
      getTotalBalance: () => {
        const { accounts } = get()
        return accounts.reduce((total, account) => total + account.balance, 0)
      },

      getMonthlyIncome: () => {
        const { transactions } = get()
        const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
        return transactions
          .filter((t) => t.type === 'income' && t.date.startsWith(currentMonth))
          .reduce((total, t) => total + t.amount, 0)
      },

      getMonthlyExpenses: () => {
        const { transactions } = get()
        const currentMonth = new Date().toISOString().slice(0, 7)
        return transactions
          .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonth))
          .reduce((total, t) => total + t.amount, 0)
      },

      getSavingsRate: () => {
        const income = get().getMonthlyIncome()
        const expenses = get().getMonthlyExpenses()
        if (income === 0) return 0
        return ((income - expenses) / income) * 100
      },

      getCategorySpending: () => {
        const { transactions } = get()
        const currentMonth = new Date().toISOString().slice(0, 7)
        const categoryMap = new Map<TransactionCategory, { amount: number; count: number }>()

        transactions
          .filter((t) => t.type === 'expense' && t.date.startsWith(currentMonth))
          .forEach((t) => {
            const existing = categoryMap.get(t.category) || { amount: 0, count: 0 }
            categoryMap.set(t.category, {
              amount: existing.amount + t.amount,
              count: existing.count + 1,
            })
          })

        return Array.from(categoryMap.entries())
          .map(([category, data]) => ({ category, ...data }))
          .sort((a, b) => b.amount - a.amount)
      },

      getRecentTransactions: (limit = 10) => {
        const { transactions } = get()
        return transactions.slice(0, limit)
      },

      getUnreadNotificationCount: () => {
        const { notifications } = get()
        return notifications.filter((n) => !n.isRead).length
      },

      // Data loading
      loadTransactionsFromFile: (transactions: Transaction[]) => {
        set({ isLoading: true })
        try {
          // Generate insights and forecasts based on uploaded transactions
          const insights = generateMonthlyInsights(transactions)
          const cashFlowForecast = generateCashFlowForecast()
          
          // Create a basic user account for uploaded data
          const uploadedAccount: Account = {
            id: 'uploaded-account',
            name: 'Uploaded Account',
            type: 'checking',
            balance: transactions.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0),
            currency: 'USD',
            lastSynced: new Date().toISOString(),
            bankName: 'Uploaded Data',
            accountNumber: 'XXXX-0000',
            isDemo: false
          }

          set({
            transactions,
            accounts: [uploadedAccount],
            insights,
            cashFlowForecast,
            isLoading: false,
            error: null,
            demoMode: false
          })
        } catch (error) {
          set({
            isLoading: false,
            error: 'Failed to process uploaded data'
          })
        }
      },

      loadDemoData: () => {
        set({ isLoading: true })
        
        try {
          const mockData = initializeMockData()
          
          set({
            user: mockData.user,
            accounts: mockData.accounts,
            transactions: mockData.transactions,
            budgets: mockData.budgets,
            notifications: mockData.notifications,
            insights: mockData.insights,
            cashFlowForecast: mockData.cashFlowForecast,
            isLoading: false,
            error: null
          })
        } catch (error) {
          set({ 
            isLoading: false, 
            error: 'Failed to load demo data' 
          })
        }
      },

      refreshData: async () => {
        set({ isLoading: true })
        try {
          // In a real app, this would make API calls
          // For demo, we'll refresh the mock data
          get().loadDemoData()
        } catch (error) {
          set({ error: 'Failed to refresh data' })
        } finally {
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'finsense-storage',
      partialize: (state) => ({
        demoMode: state.demoMode,
        user: state.user,
        // Don't persist transactions and other data - always load fresh demo data
      }),
    }
  )
) 