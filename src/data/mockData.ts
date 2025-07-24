import { addDays, subDays, format } from 'date-fns'
import type { 
  User, 
  Account, 
  Transaction, 
  Budget, 
  Notification, 
  MonthlyInsight,
  CashFlowForecast,
  TransactionCategory 
} from '../types'

// Demo User
export const mockUser: User = {
  id: 'demo-user-1',
  name: 'Alex Johnson',
  email: 'alex.johnson@demo.com',
  profileImage: undefined,
  createdAt: '2024-01-01T00:00:00Z'
}

// Demo Accounts
export const mockAccounts: Account[] = [
  {
    id: 'acc-1',
    name: 'Main Checking',
    type: 'checking',
    balance: 8742.18,
    currency: 'USD',
    lastSynced: new Date().toISOString(),
    bankName: 'Chase Bank',
    accountNumber: '****1234',
    isDemo: true
  },
  {
    id: 'acc-2',
    name: 'High Yield Savings',
    type: 'savings',
    balance: 15790.00,
    currency: 'USD',
    lastSynced: new Date().toISOString(),
    bankName: 'Ally Bank',
    accountNumber: '****5678',
    isDemo: true
  },
  {
    id: 'acc-3',
    name: 'Freedom Credit Card',
    type: 'credit',
    balance: -1247.32,
    currency: 'USD',
    lastSynced: new Date().toISOString(),
    bankName: 'Chase Bank',
    accountNumber: '****9012',
    isDemo: true
  }
]

// Merchant names for realistic transactions
const merchants = {
  food: ['Starbucks', 'Whole Foods', 'Chipotle', 'Uber Eats', 'DoorDash', 'Trader Joe\'s', 'McDonald\'s', 'Local Deli'],
  housing: ['Rent Payment', 'Mortgage Corp', 'Pacific Gas & Electric', 'Comcast', 'Water Dept', 'HOA Fees'],
  transportation: ['Shell Gas Station', 'Uber', 'Lyft', 'Metro Transit', 'Parking Meter', 'Auto Insurance'],
  entertainment: ['Netflix', 'Spotify', 'AMC Theaters', 'Steam Games', 'Apple Music', 'Gym Membership'],
  utilities: ['AT&T', 'Verizon', 'Internet Provider', 'Electric Company', 'Water Utility', 'Waste Management'],
  shopping: ['Amazon', 'Target', 'Best Buy', 'Apple Store', 'Nike', 'H&M', 'Home Depot', 'CVS Pharmacy'],
  healthcare: ['Kaiser Permanente', 'Walgreens', 'Dental Office', 'Vision Center', 'Lab Services'],
  income: ['Salary - Tech Corp', 'Freelance Payment', 'Investment Dividend', 'Side Project'],
  other: ['Bank Fee', 'ATM Withdrawal', 'Transfer', 'Cash Deposit', 'Miscellaneous']
}

// Transaction amounts by category (min, max)
const amountRanges = {
  food: [8, 85],
  housing: [150, 2500],
  transportation: [12, 150],
  entertainment: [9, 120],
  utilities: [45, 280],
  shopping: [15, 350],
  healthcare: [25, 450],
  income: [500, 6500],
  other: [5, 200]
}

// Generate realistic transaction amount
function generateAmount(category: TransactionCategory): number {
  const [min, max] = amountRanges[category]
  const amount = Math.random() * (max - min) + min
  
  // Add some realistic patterns
  if (category === 'housing' && Math.random() > 0.7) {
    return Math.round(amount / 10) * 10 // Round housing to nearest $10
  }
  
  if (category === 'income') {
    return Math.round(amount / 100) * 100 // Round income to nearest $100
  }
  
  return Math.round(amount * 100) / 100 // Round to cents
}

// Generate realistic transaction description
function generateDescription(category: TransactionCategory, merchant: string): string {
  const descriptions = {
    food: [`${merchant}`, `${merchant} - Food & Dining`, `${merchant} - Grocery Store`],
    housing: [`${merchant}`, `${merchant} - Monthly`, `${merchant} - Utilities`],
    transportation: [`${merchant}`, `${merchant} - Gas`, `${merchant} - Ride`],
    entertainment: [`${merchant}`, `${merchant} - Subscription`, `${merchant} - Entertainment`],
    utilities: [`${merchant}`, `${merchant} - Monthly Service`, `${merchant} - Bill Payment`],
    shopping: [`${merchant}`, `${merchant} - Purchase`, `${merchant} - Online Order`],
    healthcare: [`${merchant}`, `${merchant} - Medical`, `${merchant} - Prescription`],
    income: [`${merchant}`, `${merchant} - Salary`, `${merchant} - Payment`],
    other: [`${merchant}`, `${merchant} - Service`, `${merchant} - Fee`]
  }
  
  const options = descriptions[category]
  return options[Math.floor(Math.random() * options.length)]
}

// Generate transactions for the last 6 months
export function generateMockTransactions(): Transaction[] {
  const transactions: Transaction[] = []
  const startDate = subDays(new Date(), 180) // 6 months ago
  const endDate = new Date()
  
  // Generate 2-8 transactions per day
  for (let date = startDate; date <= endDate; date = addDays(date, 1)) {
    const transactionCount = Math.floor(Math.random() * 7) + 2
    
    for (let i = 0; i < transactionCount; i++) {
      // Determine if this is income or expense (90% expense, 10% income)
      const isIncome = Math.random() < 0.1
      const type = isIncome ? 'income' : 'expense'
      
      // Select category
      const categories: TransactionCategory[] = isIncome 
        ? ['income']
        : ['food', 'housing', 'transportation', 'entertainment', 'utilities', 'shopping', 'healthcare', 'other']
      
      const category = categories[Math.floor(Math.random() * categories.length)]
      
      // Select merchant
      const merchantList = merchants[category]
      const merchant = merchantList[Math.floor(Math.random() * merchantList.length)]
      
      // Generate amount
      const amount = generateAmount(category)
      
      // Select account (favor checking for expenses, allow any for income)
      const accountIds = mockAccounts.map(a => a.id)
      const accountId = type === 'expense' 
        ? (Math.random() > 0.3 ? 'acc-1' : accountIds[Math.floor(Math.random() * accountIds.length)])
        : accountIds[Math.floor(Math.random() * accountIds.length)]
      
      // Add some time to the date
      const transactionDate = new Date(date)
      transactionDate.setHours(Math.floor(Math.random() * 24))
      transactionDate.setMinutes(Math.floor(Math.random() * 60))
      
      const transaction: Transaction = {
        id: `txn-${transactions.length + 1}`,
        accountId,
        amount,
        description: generateDescription(category, merchant),
        category,
        date: transactionDate.toISOString(),
        type,
        merchant,
        location: category === 'food' ? 'San Francisco, CA' : undefined,
        isRecurring: category === 'housing' || category === 'utilities' || (category === 'income' && Math.random() > 0.7),
        tags: category === 'food' ? ['dining'] : category === 'entertainment' ? ['leisure'] : []
      }
      
      transactions.push(transaction)
    }
  }
  
  // Sort by date (newest first)
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

// Generate budgets based on spending patterns
export function generateMockBudgets(transactions: Transaction[]): Budget[] {
  const currentMonth = new Date().toISOString().slice(0, 7)
  const monthlySpending = new Map<TransactionCategory, number>()
  
  // Calculate current month spending
  transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
    .forEach(t => {
      const current = monthlySpending.get(t.category) || 0
      monthlySpending.set(t.category, current + t.amount)
    })
  
  const budgets: Budget[] = []
  const categories: TransactionCategory[] = ['food', 'housing', 'transportation', 'entertainment', 'utilities', 'shopping', 'healthcare']
  
  categories.forEach((category, index) => {
    const spent = monthlySpending.get(category) || 0
    const limit = Math.max(spent * 1.2, 100) // Set budget 20% above current spending or $100 minimum
    
    budgets.push({
      id: `budget-${index + 1}`,
      category,
      limit: Math.round(limit),
      spent: Math.round(spent),
      period: 'monthly',
      startDate: `${currentMonth}-01`,
      endDate: `${currentMonth}-31`
    })
  })
  
  return budgets
}

// Generate notifications
export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'alert',
    title: 'Budget Alert: Food & Dining',
    message: 'You\'ve spent 85% of your monthly food budget. Consider meal planning to stay on track.',
    isRead: false,
    createdAt: subDays(new Date(), 1).toISOString()
  },
  {
    id: 'notif-2',
    type: 'insight',
    title: 'Spending Insight',
    message: 'Your entertainment spending is 15% lower this month compared to last month. Great job!',
    isRead: false,
    createdAt: subDays(new Date(), 2).toISOString()
  },
  {
    id: 'notif-3',
    type: 'milestone',
    title: 'Savings Milestone',
    message: 'Congratulations! You\'ve saved $500 more than last month.',
    isRead: true,
    createdAt: subDays(new Date(), 5).toISOString()
  }
]

// Generate cash flow forecast
export function generateCashFlowForecast(): CashFlowForecast[] {
  const forecast: CashFlowForecast[] = []
  const startBalance = mockAccounts.reduce((sum, acc) => sum + acc.balance, 0)
  let cumulativeBalance = startBalance
  
  for (let i = 0; i < 30; i++) {
    const date = addDays(new Date(), i)
    
    // Simulate income (weekly pattern)
    const projectedIncome = date.getDay() === 5 ? 1625 + (Math.random() * 200 - 100) : 0 // Bi-weekly salary with variation
    
    // Simulate expenses (daily pattern with weekend variation)
    const baseExpense = date.getDay() === 0 || date.getDay() === 6 ? 85 : 125 // Lower on weekends
    const projectedExpenses = baseExpense + (Math.random() * 60 - 30) // Add variation
    
    // Confidence decreases over time
    const confidence = Math.max(0.95 - (i * 0.02), 0.65)
    
    cumulativeBalance += projectedIncome - projectedExpenses
    
    forecast.push({
      date: format(date, 'yyyy-MM-dd'),
      projectedIncome: Math.round(projectedIncome * 100) / 100,
      projectedExpenses: Math.round(projectedExpenses * 100) / 100,
      confidence: Math.round(confidence * 100) / 100,
      cumulativeBalance: Math.round(cumulativeBalance * 100) / 100
    })
  }
  
  return forecast
}

// Generate monthly insights
export function generateMonthlyInsights(transactions: Transaction[]): MonthlyInsight[] {
  const insights: MonthlyInsight[] = []
  const months = ['2024-07', '2024-06', '2024-05', '2024-04', '2024-03', '2024-02']
  
  months.forEach(month => {
    const monthTransactions = transactions.filter(t => t.date.startsWith(month))
    const income = monthTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0)
    const expenses = monthTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    
    // Calculate category spending
    const categoryMap = new Map<TransactionCategory, number>()
    monthTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const current = categoryMap.get(t.category) || 0
        categoryMap.set(t.category, current + t.amount)
      })
    
    const topCategories = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({
        category,
        amount: Math.round(amount * 100) / 100,
        percentage: Math.round((amount / expenses) * 100 * 100) / 100,
        transactionCount: monthTransactions.filter(t => t.category === category).length
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5)
    
    insights.push({
      month,
      totalIncome: Math.round(income * 100) / 100,
      totalExpenses: Math.round(expenses * 100) / 100,
      netSavings: Math.round((income - expenses) * 100) / 100,
      savingsRate: income > 0 ? Math.round(((income - expenses) / income) * 100 * 100) / 100 : 0,
      topCategories
    })
  })
  
  return insights
}

// Initialize all mock data
export function initializeMockData() {
  const transactions = generateMockTransactions()
  const budgets = generateMockBudgets(transactions)
  const insights = generateMonthlyInsights(transactions)
  const cashFlowForecast = generateCashFlowForecast()
  
  return {
    user: mockUser,
    accounts: mockAccounts,
    transactions,
    budgets,
    notifications: mockNotifications,
    insights,
    cashFlowForecast
  }
} 