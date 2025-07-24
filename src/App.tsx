import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { BarChart3, DollarSign, PieChart, Settings, CreditCard, Bell } from 'lucide-react'

// Demo Banner Component
const DemoBanner = () => (
  <div className="demo-banner">
    🚀 FinSense Portfolio Demo - This is a simulated financial app with fake data for demonstration purposes
  </div>
)

// Navigation Component
const Navigation = () => (
  <nav className="bg-white border-r border-gray-200 w-64 min-h-screen p-6">
    <div className="flex items-center gap-3 mb-8">
      <DollarSign className="w-8 h-8 text-primary-600" />
      <h1 className="text-xl font-bold text-gray-900">FinSense</h1>
    </div>
    
    <div className="space-y-2">
      <NavItem icon={<BarChart3 className="w-5 h-5" />} label="Dashboard" active />
      <NavItem icon={<CreditCard className="w-5 h-5" />} label="Transactions" />
      <NavItem icon={<PieChart className="w-5 h-5" />} label="Budget" />
      <NavItem icon={<Bell className="w-5 h-5" />} label="Alerts" />
      <NavItem icon={<Settings className="w-5 h-5" />} label="Settings" />
    </div>
  </nav>
)

const NavItem = ({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) => (
  <a 
    href="#" 
    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
      active 
        ? 'bg-primary-50 text-primary-700 border border-primary-200' 
        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </a>
)

// Dashboard Component
const Dashboard = () => (
  <div className="flex-1 p-8">
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h2>
      <p className="text-gray-600">Welcome to your financial overview</p>
    </div>
    
    {/* Overview Cards */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <OverviewCard 
        title="Total Balance" 
        value="$24,532.18" 
        change="+2.5%" 
        positive 
      />
      <OverviewCard 
        title="Monthly Income" 
        value="$6,500.00" 
        change="+5.2%" 
        positive 
      />
      <OverviewCard 
        title="Monthly Expenses" 
        value="$4,823.45" 
        change="-1.8%" 
        positive 
      />
      <OverviewCard 
        title="Savings Rate" 
        value="25.8%" 
        change="+3.1%" 
        positive 
      />
    </div>
    
    {/* Charts Placeholder */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Spending Categories</h3>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Pie Chart Coming Soon</p>
        </div>
      </div>
      
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Monthly Trends</h3>
        <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">Bar Chart Coming Soon</p>
        </div>
      </div>
    </div>
    
    {/* Cash Flow Forecast */}
    <div className="card mt-6">
      <h3 className="text-lg font-semibold mb-4">30-Day Cash Flow Forecast</h3>
      <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">AI-Powered Forecast Coming Soon</p>
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
