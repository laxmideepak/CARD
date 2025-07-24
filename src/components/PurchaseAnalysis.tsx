import React, { useMemo, useState } from 'react'
import { 
  TrendingUp, TrendingDown, Target, AlertTriangle, CheckCircle, 
  XCircle, Activity, Calendar, DollarSign, BarChart3, PieChart,
  ArrowUp, ArrowDown, Minus, Brain, Lightbulb, Shield
} from 'lucide-react'
import { useFinanceStore } from '../store/useFinanceStore'
import { purchaseAnalyzer } from '../services/purchaseAnalyzer'
import type { PurchaseAnalysis, PurchaseInsights } from '../services/purchaseAnalyzer'

const PurchaseAnalysisDashboard: React.FC = () => {
  const { transactions } = useFinanceStore()
  const [activeTab, setActiveTab] = useState<'overview' | 'good' | 'bad' | 'predictions'>('overview')

  const insights = useMemo(() => {
    if (transactions.length === 0) return null
    return purchaseAnalyzer.analyzeAllPurchases(transactions)
  }, [transactions])

  if (!insights) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="text-center py-12">
          <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No Data to Analyze</h2>
          <p className="text-gray-600">Upload some transactions to get AI-powered purchase insights</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🧠 AI Purchase Analysis
        </h1>
        <p className="text-gray-600">
          Smart insights into your spending habits and future predictions
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'good', label: 'Good Purchases', icon: CheckCircle },
            { id: 'bad', label: 'Bad Purchases', icon: XCircle },
            { id: 'predictions', label: 'Next Month', icon: Calendar }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      {activeTab === 'overview' && <OverviewTab insights={insights} />}
      {activeTab === 'good' && <GoodPurchasesTab purchases={insights.goodPurchases} />}
      {activeTab === 'bad' && <BadPurchasesTab purchases={insights.badPurchases} />}
      {activeTab === 'predictions' && <PredictionsTab prediction={insights.monthlyPrediction} />}
    </div>
  )
}

// Overview Tab Component
const OverviewTab: React.FC<{ insights: PurchaseInsights }> = ({ insights }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getTrendIcon = (pattern: string) => {
    switch (pattern) {
      case 'improving':
        return <TrendingUp className="w-5 h-5 text-green-500" />
      case 'declining':
        return <TrendingDown className="w-5 h-5 text-red-500" />
      default:
        return <Minus className="w-5 h-5 text-gray-500" />
    }
  }

  const getTrendColor = (pattern: string) => {
    switch (pattern) {
      case 'improving':
        return 'text-green-700 bg-green-50 border-green-200'
      case 'declining':
        return 'text-red-700 bg-red-50 border-red-200'
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200'
    }
  }

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Good Purchases</p>
              <p className="text-2xl font-bold text-green-600">
                {formatCurrency(insights.totalGoodValue)}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {insights.goodPurchases.length} transactions
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bad Purchases</p>
              <p className="text-2xl font-bold text-red-600">
                {formatCurrency(insights.totalBadValue)}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {insights.badPurchases.length} transactions
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Good/Bad Ratio</p>
              <p className="text-2xl font-bold text-primary-600">
                {insights.goodBadRatio.toFixed(1)}:1
              </p>
            </div>
            <Target className="w-8 h-8 text-primary-500" />
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {insights.goodBadRatio > 2 ? 'Excellent' : insights.goodBadRatio > 1 ? 'Good' : 'Needs work'}
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Spending Trend</p>
              <div className="flex items-center gap-2">
                {getTrendIcon(insights.trends.spendingPattern)}
                <p className="text-lg font-bold text-gray-900 capitalize">
                  {insights.trends.spendingPattern}
                </p>
              </div>
            </div>
            <Activity className="w-8 h-8 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Trends Analysis */}
      <div className={`border rounded-lg p-6 ${getTrendColor(insights.trends.spendingPattern)}`}>
        <div className="flex items-center gap-3 mb-4">
          {getTrendIcon(insights.trends.spendingPattern)}
          <h3 className="text-lg font-semibold">Spending Pattern Analysis</h3>
        </div>
        <p className="mb-4">
          Your spending habits are <strong>{insights.trends.spendingPattern}</strong> with an 
          improvement score of <strong>{insights.trends.improvementScore.toFixed(1)}</strong>.
        </p>
        
        {insights.trends.strengths.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium text-green-800 mb-2">✅ Your Strengths:</h4>
            <ul className="list-disc list-inside space-y-1">
              {insights.trends.strengths.map((strength, index) => (
                <li key={index} className="text-sm">{strength}</li>
              ))}
            </ul>
          </div>
        )}

        {insights.trends.riskAreas.length > 0 && (
          <div>
            <h4 className="font-medium text-red-800 mb-2">⚠️ Areas to Watch:</h4>
            <ul className="list-disc list-inside space-y-1">
              {insights.trends.riskAreas.map((risk, index) => (
                <li key={index} className="text-sm">{risk}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Next Month Preview */}
      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-6 h-6 text-primary-600" />
          <h3 className="text-lg font-semibold">Next Month Prediction</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            insights.monthlyPrediction.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
            insights.monthlyPrediction.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {insights.monthlyPrediction.riskLevel} risk
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Estimated Total Spending</p>
            <p className="text-3xl font-bold text-gray-900">
              {formatCurrency(insights.monthlyPrediction.totalEstimated)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              for {insights.monthlyPrediction.month}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-2">Top Recommendations:</p>
            <ul className="space-y-1">
              {insights.monthlyPrediction.recommendations.slice(0, 3).map((rec, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// Good Purchases Tab
const GoodPurchasesTab: React.FC<{ purchases: PurchaseAnalysis[] }> = ({ purchases }) => {
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'essential':
        return <Shield className="w-5 h-5 text-blue-500" />
      case 'investment':
        return <TrendingUp className="w-5 h-5 text-green-500" />
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'essential':
        return 'bg-blue-50 text-blue-800 border-blue-200'
      case 'investment':
        return 'bg-green-50 text-green-800 border-green-200'
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center p-6 bg-green-50 rounded-lg border border-green-200">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
        <h2 className="text-xl font-semibold text-green-900 mb-2">
          Great Job! 🎉
        </h2>
        <p className="text-green-700">
          You have {purchases.length} good purchases totaling{' '}
          <strong>
            {formatCurrency(purchases.reduce((sum, p) => sum + p.transaction.amount, 0))}
          </strong>
        </p>
      </div>

      <div className="grid gap-4">
        {purchases.map((analysis) => (
          <div key={analysis.id} className="card hover-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getCategoryIcon(analysis.category)}
                  <h3 className="font-semibold text-gray-900">
                    {analysis.transaction.description}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(analysis.category)}`}>
                    {analysis.category}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{analysis.reasoning}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{new Date(analysis.transaction.date).toLocaleDateString()}</span>
                  <span className="capitalize">{analysis.transaction.category}</span>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-lg font-semibold text-green-600">
                  {formatCurrency(analysis.transaction.amount)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${Math.max(0, analysis.score)}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {analysis.score > 0 ? '+' : ''}{analysis.score}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Bad Purchases Tab
const BadPurchasesTab: React.FC<{ purchases: PurchaseAnalysis[] }> = ({ purchases }) => {
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'impulse':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />
      case 'waste':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <AlertTriangle className="w-5 h-5 text-red-500" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'impulse':
        return 'bg-orange-50 text-orange-800 border-orange-200'
      case 'waste':
        return 'bg-red-50 text-red-800 border-red-200'
      default:
        return 'bg-red-50 text-red-800 border-red-200'
    }
  }

  if (purchases.length === 0) {
    return (
      <div className="text-center p-12 bg-green-50 rounded-lg border border-green-200">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-green-900 mb-2">
          Excellent! No Bad Purchases Found! 🎉
        </h2>
        <p className="text-green-700">
          All your recent transactions show good financial decision-making. Keep it up!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center p-6 bg-red-50 rounded-lg border border-red-200">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-semibold text-red-900 mb-2">
          Areas for Improvement
        </h2>
        <p className="text-red-700">
          {purchases.length} purchases need attention, totaling{' '}
          <strong>
            {formatCurrency(purchases.reduce((sum, p) => sum + p.transaction.amount, 0))}
          </strong>
        </p>
      </div>

      <div className="grid gap-4">
        {purchases.map((analysis) => (
          <div key={analysis.id} className="card hover-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  {getCategoryIcon(analysis.category)}
                  <h3 className="font-semibold text-gray-900">
                    {analysis.transaction.description}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(analysis.category)}`}>
                    {analysis.category}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-2">{analysis.reasoning}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{new Date(analysis.transaction.date).toLocaleDateString()}</span>
                  <span className="capitalize">{analysis.transaction.category}</span>
                </div>
              </div>
              
              <div className="text-right">
                <p className="text-lg font-semibold text-red-600">
                  {formatCurrency(analysis.transaction.amount)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full"
                      style={{ width: `${Math.abs(Math.min(0, analysis.score))}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500">
                    {analysis.score}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Predictions Tab
const PredictionsTab: React.FC<{ prediction: any }> = ({ prediction }) => {
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <ArrowUp className="w-4 h-4 text-red-500" />
      case 'decreasing':
        return <ArrowDown className="w-4 h-4 text-green-500" />
      default:
        return <Minus className="w-4 h-4 text-gray-500" />
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'bg-red-50 text-red-800 border-red-200'
      case 'medium':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200'
      default:
        return 'bg-green-50 text-green-800 border-green-200'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className={`rounded-lg border p-6 ${getRiskColor(prediction.riskLevel)}`}>
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-8 h-8" />
          <div>
            <h2 className="text-2xl font-bold">{prediction.month}</h2>
            <p className="text-sm opacity-75">Spending Prediction</p>
          </div>
          <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium border ${getRiskColor(prediction.riskLevel)}`}>
            {prediction.riskLevel} risk
          </span>
        </div>
        
        <div className="text-center">
          <p className="text-4xl font-bold mb-2">
            {formatCurrency(prediction.totalEstimated)}
          </p>
          <p className="opacity-75">Estimated total spending</p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <PieChart className="w-5 h-5" />
          Category Breakdown
        </h3>
        
        <div className="space-y-4">
          {prediction.categoryBreakdown.map((item: any) => (
            <div key={item.category} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full bg-primary-500`} />
                <div>
                  <p className="font-medium capitalize">{item.category}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {getTrendIcon(item.trend)}
                    <span className="capitalize">{item.trend}</span>
                    <span>•</span>
                    <span>{item.confidence}% confidence</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <p className="font-semibold text-lg">
                  {formatCurrency(item.estimated)}
                </p>
                <p className="text-sm text-gray-500">
                  {((item.estimated / prediction.totalEstimated) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          AI Recommendations
        </h3>
        
        <div className="space-y-3">
          {prediction.recommendations.map((rec: string, index: number) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
              <p className="text-blue-800">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PurchaseAnalysisDashboard 