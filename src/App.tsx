import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { BarChart3, DollarSign, PieChart, Settings, CreditCard, Bell } from 'lucide-react'
import { useFinanceStore } from './store/useFinanceStore'

// Utility function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

// Utility function to format percentage
const formatPercentage = (value: number) => {
  return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
}

// Demo Banner Component
const DemoBanner = () => (
  <div className="demo-banner">
    🚀 FinSense Portfolio Demo - This is a simulated financial app with fake data for demonstration purposes
  </div>
)

// Navigation Component
const Navigation = () => {
  const unreadCount = useFinanceStore((state) => state.getUnreadNotificationCount())
  
  return (
    <nav className="bg-white border-r border-gray-200 w-64 min-h-screen p-6">
      <div className="flex items-center gap-3 mb-8">
        <DollarSign className="w-8 h-8 text-primary-600" />
        <h1 className="text-xl font-bold text-gray-900">FinSense</h1>
      </div>
      
      <div className="space-y-2">
        <NavItem icon={<BarChart3 className="w-5 h-5" />} label="Dashboard" active />
        <NavItem icon={<CreditCard className="w-5 h-5" />} label="Transactions" />
        <NavItem icon={<PieChart className="w-5 h-5" />} label="Budget" />
        <NavItem 
          icon={<Bell className="w-5 h-5" />} 
          label="Alerts" 
          badge={unreadCount > 0 ? unreadCount : undefined}
        />
        <NavItem icon={<Settings className="w-5 h-5" />} label="Settings" />
      </div>
    </nav>
  )
}

const NavItem = ({ 
  icon, 
  label, 
  active = false, 
  badge 
}: { 
  icon: React.ReactNode
  label: string
  active?: boolean
  badge?: number
}) => (
  <a 
    href="#" 
    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors relative ${
      active 
        ? 'bg-primary-50 text-primary-700 border border-primary-200' 
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
    {badge && (
      <span className="ml-auto bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
        {badge}
      </span>
    )}
  </a>
)

// Dashboard Component
const Dashboard = () => {
  const {
    getTotalBalance,
    getMonthlyIncome,
    getMonthlyExpenses,
    getSavingsRate,
    isLoading,
    error,
    loadDemoData
  } = useFinanceStore()

  // Load demo data on component mount
  useEffect(() => {
    loadDemoData()
  }, [loadDemoData])

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="flex-1 p-8">
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 text-center">
          <p className="text-danger-800">Error: {error}</p>
          <button 
            onClick={loadDemoData}
            className="btn-primary mt-4"
          >
            Retry Loading Data
          </button>
        </div>
      </div>
    )
  }

  const totalBalance = getTotalBalance()
  const monthlyIncome = getMonthlyIncome()
  const monthlyExpenses = getMonthlyExpenses()
  const savingsRate = getSavingsRate()

  return (
    <div className="flex-1 p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">Welcome to your financial overview</p>
      </div>
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <OverviewCard 
          title="Total Balance" 
          value={formatCurrency(totalBalance)}
          change="+2.5%" 
          positive 
        />
        <OverviewCard 
          title="Monthly Income" 
          value={formatCurrency(monthlyIncome)}
          change="+5.2%" 
          positive 
        />
        <OverviewCard 
          title="Monthly Expenses" 
          value={formatCurrency(monthlyExpenses)}
          change="-1.8%" 
          positive 
        />
        <OverviewCard 
          title="Savings Rate" 
          value={formatPercentage(savingsRate)}
          change="+3.1%" 
          positive 
        />
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingCategoriesChart />
        <MonthlyTrendsChart />
      </div>
      
      {/* Cash Flow Forecast */}
      <CashFlowForecastChart />
    </div>
  )
}

// Loading skeleton component
const DashboardSkeleton = () => (
  <div className="flex-1 p-8 animate-pulse">
    <div className="mb-8">
      <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-64"></div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="card">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-32"></div>
        </div>
      ))}
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card">
        <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
      <div className="card">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    </div>
  </div>
)

// Spending Categories Chart Component
const SpendingCategoriesChart = () => {
  const getCategorySpending = useFinanceStore((state) => state.getCategorySpending())
  const categoryData = getCategorySpending.slice(0, 6) // Top 6 categories

  const categoryColors = {
    food: '#10B981',
    housing: '#3B82F6',
    transportation: '#F59E0B',
    entertainment: '#EF4444',
    utilities: '#8B5CF6',
    shopping: '#06B6D4',
    healthcare: '#EC4899',
    income: '#059669',
    other: '#6B7280'
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Spending Categories</h3>
      {categoryData.length > 0 ? (
        <div className="space-y-3">
          {categoryData.map(({ category, amount, count }) => (
            <div key={category} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: categoryColors[category] || '#6B7280' }}
                />
                <span className="font-medium capitalize">{category}</span>
                <span className="text-sm text-gray-500">({count} transactions)</span>
              </div>
              <span className="font-semibold">{formatCurrency(amount)}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">No spending data available</p>
        </div>
      )}
    </div>
  )
}

// Monthly Trends Chart Component  
const MonthlyTrendsChart = () => {
  const insights = useFinanceStore((state) => state.insights)
  const recentInsights = insights.slice(0, 6).reverse() // Last 6 months, chronological order

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Monthly Trends</h3>
      {recentInsights.length > 0 ? (
        <div className="space-y-4">
          {recentInsights.map((insight) => {
            const month = new Date(insight.month + '-01').toLocaleDateString('en-US', { 
              month: 'short', 
              year: 'numeric' 
            })
            return (
              <div key={insight.month} className="flex items-center justify-between">
                <span className="font-medium">{month}</span>
                <div className="flex gap-4 text-sm">
                  <span className="text-success-600">
                    Income: {formatCurrency(insight.totalIncome)}
                  </span>
                  <span className="text-gray-600">
                    Expenses: {formatCurrency(insight.totalExpenses)}
                  </span>
                  <span className={`font-semibold ${
                    insight.netSavings >= 0 ? 'text-success-600' : 'text-danger-600'
                  }`}>
                    Net: {formatCurrency(insight.netSavings)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Loading trends data...</p>
        </div>
      )}
    </div>
  )
}

// Cash Flow Forecast Chart Component
const CashFlowForecastChart = () => {
  const cashFlowForecast = useFinanceStore((state) => state.cashFlowForecast)
  const forecast = cashFlowForecast.slice(0, 7) // Next 7 days

  return (
    <div className="card mt-6">
      <h3 className="text-lg font-semibold mb-4">7-Day Cash Flow Forecast</h3>
      {forecast.length > 0 ? (
        <div className="space-y-3">
          {forecast.map((day) => {
            const date = new Date(day.date).toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric' 
            })
            const netFlow = day.projectedIncome - day.projectedExpenses
            return (
              <div key={day.date} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center gap-4">
                  <span className="font-medium w-20">{date}</span>
                  <span className="text-sm text-gray-500">
                    Confidence: {(day.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  {day.projectedIncome > 0 && (
                    <span className="text-success-600">
                      +{formatCurrency(day.projectedIncome)}
                    </span>
                  )}
                  <span className="text-danger-600">
                    -{formatCurrency(day.projectedExpenses)}
                  </span>
                  <span className={`font-semibold ${
                    netFlow >= 0 ? 'text-success-600' : 'text-danger-600'
                  }`}>
                    {netFlow >= 0 ? '+' : ''}{formatCurrency(netFlow)}
                  </span>
                  <span className="text-gray-600 w-24 text-right">
                    Balance: {formatCurrency(day.cumulativeBalance)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">AI Forecast Loading...</p>
        </div>
      )}
    </div>
  )
}

const OverviewCard = ({ 
  title, 
  value, 
  change, 
  positive = true 
}: { 
  title: string
  value: string
  change: string
  positive?: boolean 
}) => (
  <div className="card card-hover">
    <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
    <div className="flex items-end justify-between">
      <span className="text-2xl font-bold text-gray-900">{value}</span>
      <span className={`text-sm font-medium ${positive ? 'text-success-600' : 'text-danger-600'}`}>
        {change}
      </span>
    </div>
  </div>
)

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <DemoBanner />
        <div className="flex">
          <Navigation />
          <Routes>
            <Route path="/" element={<Dashboard />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
