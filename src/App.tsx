import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { BarChart3, DollarSign, PieChart, Settings, CreditCard, Bell, LogOut, User } from 'lucide-react'
import { AuthProvider, useAuth } from './components/Auth/AuthContext'
import AuthPage from './components/Auth/AuthPage'
import FileUpload from './components/FileUpload'
import { useFinanceStore } from './store/useFinanceStore'
import {
  SpendingCategoriesPieChart,
  MonthlyTrendsLineChart,
  CashFlowForecastChart as CashFlowChart
} from './components/Charts'
import { TransactionManagement } from './components/TransactionManagement'

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



// Navigation Component
const Navigation = () => {
  const { user, logout } = useAuth()
  const unreadCount = useFinanceStore((state) => state.getUnreadNotificationCount())
  const location = useLocation()
  
  const handleLogout = () => {
    logout()
  }
  
  return (
    <nav className="bg-white border-r border-gray-200 w-64 min-h-screen p-6 flex flex-col">
      <div className="flex items-center gap-3 mb-8">
        <DollarSign className="w-8 h-8 text-primary-600" />
        <h1 className="text-xl font-bold text-gray-900">FinSense</h1>
      </div>
      
      <div className="space-y-2 flex-1">
        <NavItem 
          icon={<BarChart3 className="w-5 h-5" />} 
          label="Dashboard" 
          active={location.pathname === '/'} 
          href="/"
        />
        <NavItem 
          icon={<CreditCard className="w-5 h-5" />} 
          label="Transactions" 
          active={location.pathname === '/transactions'}
          href="/transactions"
        />
        <NavItem 
          icon={<PieChart className="w-5 h-5" />} 
          label="Budget" 
          active={location.pathname === '/budget'}
          href="/budget"
        />
        <NavItem 
          icon={<Bell className="w-5 h-5" />} 
          label="Alerts" 
          badge={unreadCount > 0 ? unreadCount : undefined}
          active={location.pathname === '/alerts'}
          href="/alerts"
        />
        <NavItem 
          icon={<Settings className="w-5 h-5" />} 
          label="Settings" 
          active={location.pathname === '/settings'}
          href="/settings"
        />
      </div>

      {/* User Profile Section */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="flex items-center gap-3 mb-3">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={`${user.firstName} ${user.lastName}`}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary-600" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </nav>
  )
}

const NavItem = ({ 
  icon, 
  label, 
  active = false, 
  badge,
  href 
}: { 
  icon: React.ReactNode
  label: string
  active?: boolean
  badge?: number
  href: string
}) => (
  <Link 
    to={href}
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
  </Link>
)

// Dashboard Component
const Dashboard = () => {
  const {
    transactions,
    getTotalBalance,
    getMonthlyIncome,
    getMonthlyExpenses,
    getSavingsRate,
    isLoading,
    error,
    loadTransactionsFromFile
  } = useFinanceStore()

  const handleDataLoaded = (uploadedTransactions: any[]) => {
    loadTransactionsFromFile(uploadedTransactions)
  }

  // Show file upload if no transactions exist
  if (!isLoading && transactions.length === 0) {
    return <FileUpload onDataLoaded={handleDataLoaded} />
  }

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="flex-1 p-8">
        <div className="bg-danger-50 border border-danger-200 rounded-lg p-4 text-center">
          <p className="text-danger-800">Error: {error}</p>
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
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Spending Categories</h3>
          <SpendingCategoriesPieChart />
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Monthly Trends</h3>
          <MonthlyTrendsLineChart />
        </div>
      </div>
      
      {/* Cash Flow Forecast */}
      <div className="card mt-6">
        <h3 className="text-lg font-semibold mb-4">14-Day AI Cash Flow Forecast</h3>
        <CashFlowChart />
      </div>
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

// Protected Routes Component
const ProtectedApp = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Navigation />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/transactions" element={<TransactionManagement />} />
        </Routes>
      </div>
    </div>
  )
}

// Main App Component with Auth
const AppContent = () => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return isAuthenticated ? <ProtectedApp /> : <AuthPage />
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App
