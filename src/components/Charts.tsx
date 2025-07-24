import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Pie, Line, Bar } from 'react-chartjs-2'
import { useFinanceStore } from '../store/useFinanceStore'
import type { TransactionCategory } from '../types'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Utility function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Category colors mapping
const categoryColors: Record<TransactionCategory, string> = {
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

// Spending Categories Pie Chart
export const SpendingCategoriesPieChart: React.FC = () => {
  const getCategorySpending = useFinanceStore((state) => state.getCategorySpending())
  const categoryData = getCategorySpending.filter(item => item.category !== 'income').slice(0, 8) // Top 8 expense categories

  if (categoryData.length === 0) {
    return (
      <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No spending data available</p>
      </div>
    )
  }

  const data = {
    labels: categoryData.map(item => 
      item.category.charAt(0).toUpperCase() + item.category.slice(1)
    ),
    datasets: [
      {
        data: categoryData.map(item => item.amount),
        backgroundColor: categoryData.map(item => categoryColors[item.category]),
        borderColor: categoryData.map(item => categoryColors[item.category]),
        borderWidth: 2,
        hoverBorderWidth: 3,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || ''
            const value = context.parsed
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0)
            const percentage = ((value / total) * 100).toFixed(1)
            return `${label}: ${formatCurrency(value)} (${percentage}%)`
          }
        }
      }
    },
  }

  return (
    <div className="h-64">
      <Pie data={data} options={options} />
    </div>
  )
}

// Monthly Trends Line Chart
export const MonthlyTrendsLineChart: React.FC = () => {
  const insights = useFinanceStore((state) => state.insights)
  const recentInsights = insights.slice(0, 6).reverse() // Last 6 months, chronological order

  if (recentInsights.length === 0) {
    return (
      <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading trends data...</p>
      </div>
    )
  }

  const labels = recentInsights.map(insight => {
    const date = new Date(insight.month + '-01')
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  })

  const data = {
    labels,
    datasets: [
      {
        label: 'Income',
        data: recentInsights.map(insight => insight.totalIncome),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Expenses',
        data: recentInsights.map(insight => insight.totalExpenses),
        borderColor: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#EF4444',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        label: 'Net Savings',
        data: recentInsights.map(insight => insight.netSavings),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: false,
        tension: 0.4,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 11,
          },
          callback: function(value: any) {
            return formatCurrency(value)
          }
        },
      },
    },
  }

  return (
    <div className="h-64">
      <Line data={data} options={options} />
    </div>
  )
}

// Cash Flow Forecast Area Chart
export const CashFlowForecastChart: React.FC = () => {
  const cashFlowForecast = useFinanceStore((state) => state.cashFlowForecast)
  const forecast = cashFlowForecast.slice(0, 14) // Next 14 days

  if (forecast.length === 0) {
    return (
      <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">AI Forecast Loading...</p>
      </div>
    )
  }

  const labels = forecast.map(day => {
    const date = new Date(day.date)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })

  const data = {
    labels,
    datasets: [
      {
        label: 'Projected Balance',
        data: forecast.map(day => day.cumulativeBalance),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Net Daily Flow',
        data: forecast.map(day => day.projectedIncome - day.projectedExpenses),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 2,
        fill: false,
        tension: 0.3,
        pointBackgroundColor: '#10B981',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            if (context.dataset.label === 'Projected Balance') {
              const dayData = forecast[context.dataIndex]
              return [
                `Balance: ${formatCurrency(context.parsed.y)}`,
                `Confidence: ${(dayData.confidence * 100).toFixed(0)}%`
              ]
            } else {
              const dayData = forecast[context.dataIndex]
              return [
                `Net Flow: ${formatCurrency(context.parsed.y)}`,
                `Income: ${formatCurrency(dayData.projectedIncome)}`,
                `Expenses: ${formatCurrency(dayData.projectedExpenses)}`
              ]
            }
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 11,
          },
          callback: function(value: any) {
            return formatCurrency(value)
          }
        },
      },
    },
  }

  return (
    <div className="h-80">
      <Line data={data} options={options} />
    </div>
  )
}

// Monthly Spending Bar Chart (Alternative view)
export const MonthlySpendingBarChart: React.FC = () => {
  const insights = useFinanceStore((state) => state.insights)
  const recentInsights = insights.slice(0, 6).reverse()

  if (recentInsights.length === 0) {
    return (
      <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Loading spending data...</p>
      </div>
    )
  }

  const labels = recentInsights.map(insight => {
    const date = new Date(insight.month + '-01')
    return date.toLocaleDateString('en-US', { month: 'short' })
  })

  const data = {
    labels,
    datasets: [
      {
        label: 'Total Expenses',
        data: recentInsights.map(insight => insight.totalExpenses),
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: '#EF4444',
        borderWidth: 2,
        borderRadius: 4,
        borderSkipped: false,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `Expenses: ${formatCurrency(context.parsed.y)}`
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          font: {
            size: 11,
          },
          callback: function(value: any) {
            return formatCurrency(value)
          }
        },
      },
    },
  }

  return (
    <div className="h-64">
      <Bar data={data} options={options} />
    </div>
  )
} 