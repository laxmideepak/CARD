import React, { useState, useMemo } from 'react'
import { Search, Filter, Plus, Calendar, DollarSign, Tag, MoreVertical, Edit2, Trash2, ArrowUpDown } from 'lucide-react'
import { useFinanceStore } from '../store/useFinanceStore'
import type { Transaction, TransactionCategory } from '../types'

// Utility function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Category colors and icons
const categoryConfig: Record<TransactionCategory, { color: string; bgColor: string; icon: string }> = {
  food: { color: '#10B981', bgColor: 'bg-green-100', icon: '🍽️' },
  housing: { color: '#3B82F6', bgColor: 'bg-blue-100', icon: '🏠' },
  transportation: { color: '#F59E0B', bgColor: 'bg-yellow-100', icon: '🚗' },
  entertainment: { color: '#EF4444', bgColor: 'bg-red-100', icon: '🎭' },
  utilities: { color: '#8B5CF6', bgColor: 'bg-purple-100', icon: '⚡' },
  shopping: { color: '#06B6D4', bgColor: 'bg-cyan-100', icon: '🛍️' },
  healthcare: { color: '#EC4899', bgColor: 'bg-pink-100', icon: '🏥' },
  income: { color: '#059669', bgColor: 'bg-emerald-100', icon: '💰' },
  other: { color: '#6B7280', bgColor: 'bg-gray-100', icon: '📝' }
}

// Sort options
const sortOptions = [
  { value: 'date-desc', label: 'Date (Newest)' },
  { value: 'date-asc', label: 'Date (Oldest)' },
  { value: 'amount-desc', label: 'Amount (High to Low)' },
  { value: 'amount-asc', label: 'Amount (Low to High)' },
  { value: 'category', label: 'Category' },
]

// Main Transaction Management Component
export const TransactionManagement: React.FC = () => {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useFinanceStore()
  
  // State for filters and search
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<TransactionCategory | 'all'>('all')
  const [selectedType, setSelectedType] = useState<'all' | 'income' | 'expense'>('all')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const [amountRange, setAmountRange] = useState({ min: '', max: '' })
  const [sortBy, setSortBy] = useState('date-desc')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)

  // Filtered and sorted transactions
  const filteredTransactions = useMemo(() => {
    let filtered = transactions.filter(transaction => {
      // Search term filter
      if (searchTerm && !transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !transaction.merchant?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      // Category filter
      if (selectedCategory !== 'all' && transaction.category !== selectedCategory) {
        return false
      }

      // Type filter
      if (selectedType !== 'all' && transaction.type !== selectedType) {
        return false
      }

      // Date range filter
      if (dateRange.start && new Date(transaction.date) < new Date(dateRange.start)) {
        return false
      }
      if (dateRange.end && new Date(transaction.date) > new Date(dateRange.end)) {
        return false
      }

      // Amount range filter
      if (amountRange.min && transaction.amount < parseFloat(amountRange.min)) {
        return false
      }
      if (amountRange.max && transaction.amount > parseFloat(amountRange.max)) {
        return false
      }

      return true
    })

    // Sort transactions
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc': return new Date(b.date).getTime() - new Date(a.date).getTime()
        case 'date-asc': return new Date(a.date).getTime() - new Date(b.date).getTime()
        case 'amount-desc': return b.amount - a.amount
        case 'amount-asc': return a.amount - b.amount
        case 'category': return a.category.localeCompare(b.category)
        default: return 0
      }
    })

    return filtered
  }, [transactions, searchTerm, selectedCategory, selectedType, dateRange, amountRange, sortBy])

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedTransactions = filteredTransactions.slice(startIndex, startIndex + itemsPerPage)

  // Reset pagination when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedCategory, selectedType, dateRange, amountRange, sortBy])

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedCategory('all')
    setSelectedType('all')
    setDateRange({ start: '', end: '' })
    setAmountRange({ min: '', max: '' })
    setSortBy('date-desc')
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Transactions</h1>
          <p className="text-gray-600">
            {filteredTransactions.length} of {transactions.length} transactions
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary mt-4 md:mt-0 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Transaction
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="card mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search transactions, merchants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as TransactionCategory | 'all')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Categories</option>
              {Object.keys(categoryConfig).map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>

            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as 'all' | 'income' | 'expense')}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="all">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expenses</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 border rounded-lg flex items-center gap-2 transition-colors ${
                showFilters ? 'bg-primary-50 border-primary-200 text-primary-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>

            {(searchTerm || selectedCategory !== 'all' || selectedType !== 'all' || 
              dateRange.start || dateRange.end || amountRange.min || amountRange.max) && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Clear All
              </button>
            )}
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount</label>
                <input
                  type="number"
                  placeholder="0"
                  value={amountRange.min}
                  onChange={(e) => setAmountRange(prev => ({ ...prev, min: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount</label>
                <input
                  type="number"
                  placeholder="10000"
                  value={amountRange.max}
                  onChange={(e) => setAmountRange(prev => ({ ...prev, max: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Transaction List */}
      <div className="space-y-3 mb-6">
        {paginatedTransactions.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500 mb-4">No transactions found matching your criteria</p>
            <button
              onClick={clearFilters}
              className="btn-secondary"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          paginatedTransactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              onEdit={setEditingTransaction}
              onDelete={deleteTransaction}
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-700">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTransactions.length)} of {filteredTransactions.length} results
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Previous
            </button>
            <span className="px-3 py-2 text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Transaction Modal */}
      {(showAddModal || editingTransaction) && (
        <TransactionModal
          transaction={editingTransaction}
          onClose={() => {
            setShowAddModal(false)
            setEditingTransaction(null)
          }}
          onSave={(transactionData) => {
            if (editingTransaction) {
              updateTransaction(editingTransaction.id, transactionData)
            } else {
              // Ensure required fields are present for new transactions
              const newTransaction: Transaction = {
                id: Date.now().toString(),
                accountId: 'demo-account-1',
                amount: transactionData.amount || 0,
                description: transactionData.description || '',
                category: transactionData.category || 'other',
                date: transactionData.date || new Date().toISOString().split('T')[0],
                type: transactionData.type || 'expense',
                merchant: transactionData.merchant || '',
                location: transactionData.location || '',
                isRecurring: false,
                tags: []
              }
              addTransaction(newTransaction)
            }
            setShowAddModal(false)
            setEditingTransaction(null)
          }}
        />
      )}
    </div>
  )
}

// Transaction Card Component
const TransactionCard: React.FC<{
  transaction: Transaction
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
}> = ({ transaction, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false)
  const config = categoryConfig[transaction.category]

  return (
    <div className="card hover:shadow-card-hover transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          {/* Category Icon */}
          <div className={`w-12 h-12 rounded-full ${config.bgColor} flex items-center justify-center text-lg`}>
            {config.icon}
          </div>

          {/* Transaction Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 truncate">{transaction.description}</h3>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                transaction.type === 'income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {transaction.type}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}
              </span>
              {transaction.merchant && (
                <span>{transaction.merchant}</span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(transaction.date).toLocaleDateString()}
              </span>
              {transaction.location && (
                <span className="truncate">{transaction.location}</span>
              )}
            </div>
          </div>
        </div>

        {/* Amount and Actions */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className={`text-lg font-bold ${
              transaction.type === 'income' ? 'text-green-600' : 'text-gray-900'
            }`}>
              {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
            </div>
          </div>

          {/* Actions Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => {
                    onEdit(transaction)
                    setShowMenu(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Edit2 className="w-3 h-3" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this transaction?')) {
                      onDelete(transaction.id)
                    }
                    setShowMenu(false)
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center gap-2"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Transaction Modal Component
const TransactionModal: React.FC<{
  transaction?: Transaction | null
  onClose: () => void
  onSave: (data: Partial<Transaction>) => void
}> = ({ transaction, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    description: transaction?.description || '',
    amount: transaction?.amount?.toString() || '',
    category: transaction?.category || 'other' as TransactionCategory,
    type: transaction?.type || 'expense' as 'income' | 'expense',
    date: transaction?.date || new Date().toISOString().split('T')[0],
    merchant: transaction?.merchant || '',
    location: transaction?.location || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      amount: parseFloat(formData.amount)
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">
            {transaction ? 'Edit Transaction' : 'Add Transaction'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                required
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Transaction description"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'income' | 'expense' }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as TransactionCategory }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {Object.keys(categoryConfig).map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Merchant (Optional)</label>
              <input
                type="text"
                value={formData.merchant}
                onChange={(e) => setFormData(prev => ({ ...prev, merchant: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Store or company name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location (Optional)</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="City, State"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 btn-primary"
              >
                {transaction ? 'Save Changes' : 'Add Transaction'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 