import React, { useState, useCallback } from 'react'
import { Upload, File, AlertCircle, CheckCircle2, X, FileText, Table, FileSpreadsheet } from 'lucide-react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import { useFinanceStore } from '../store/useFinanceStore'
import type { Transaction, TransactionCategory } from '../types'

// Configure PDF.js worker
GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`

interface FileUploadProps {
  onDataLoaded: (transactions: Transaction[]) => void
}

interface ParsedTransaction {
  date: string
  description: string
  amount: number
  category: TransactionCategory
  type: 'income' | 'expense'
  merchant?: string
  location?: string
}

const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const [isDragOver, setIsDragOver] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [parsedCount, setParsedCount] = useState(0)

  // Generate sample data for demo purposes
  const generateSampleData = () => {
    // Generate dates within last 30 days for better AI analysis
    const today = new Date()
    const getRecentDate = (daysAgo: number) => {
      const date = new Date(today)
      date.setDate(date.getDate() - daysAgo)
      return date.toISOString().split('T')[0]
    }

    const sampleTransactions: ParsedTransaction[] = [
      // Income transactions
      {
        date: getRecentDate(2),
        description: 'Salary Deposit',
        amount: 4500,
        category: 'income',
        type: 'income',
        merchant: 'Tech Company Inc'
      },
      {
        date: getRecentDate(8),
        description: 'Freelance Web Design',
        amount: 800,
        category: 'income',
        type: 'income',
        merchant: 'Client XYZ'
      },
      // Food & Groceries
      {
        date: getRecentDate(1),
        description: 'Morning Coffee',
        amount: 5.75,
        category: 'food',
        type: 'expense',
        merchant: 'Starbucks'
      },
      {
        date: getRecentDate(3),
        description: 'Grocery Shopping',
        amount: 127.43,
        category: 'food',
        type: 'expense',
        merchant: 'Whole Foods Market'
      },
      {
        date: getRecentDate(6),
        description: 'Restaurant Dinner',
        amount: 67.50,
        category: 'food',
        type: 'expense',
        merchant: 'Italian Bistro'
      },
      // Transportation
      {
        date: getRecentDate(4),
        description: 'Gas Station Fill-up',
        amount: 52.30,
        category: 'transportation',
        type: 'expense',
        merchant: 'Shell'
      },
      {
        date: getRecentDate(7),
        description: 'Uber Ride',
        amount: 18.45,
        category: 'transportation',
        type: 'expense',
        merchant: 'Uber'
      },
      // Utilities & Bills
      {
        date: getRecentDate(5),
        description: 'Electric Bill',
        amount: 143.22,
        category: 'utilities',
        type: 'expense',
        merchant: 'PG&E'
      },
      {
        date: getRecentDate(12),
        description: 'Internet Service',
        amount: 79.99,
        category: 'utilities',
        type: 'expense',
        merchant: 'Xfinity'
      },
      // Entertainment & Subscriptions
      {
        date: getRecentDate(9),
        description: 'Netflix Subscription',
        amount: 15.99,
        category: 'entertainment',
        type: 'expense',
        merchant: 'Netflix'
      },
      {
        date: getRecentDate(14),
        description: 'Movie Theater',
        amount: 24.50,
        category: 'entertainment',
        type: 'expense',
        merchant: 'AMC Theaters'
      },
      // Shopping
      {
        date: getRecentDate(10),
        description: 'Amazon Office Supplies',
        amount: 89.47,
        category: 'shopping',
        type: 'expense',
        merchant: 'Amazon'
      },
      {
        date: getRecentDate(16),
        description: 'Clothing Purchase',
        amount: 156.80,
        category: 'shopping',
        type: 'expense',
        merchant: 'Target'
      },
      // Healthcare
      {
        date: getRecentDate(11),
        description: 'Pharmacy - Prescription',
        amount: 32.15,
        category: 'healthcare',
        type: 'expense',
        merchant: 'CVS Pharmacy'
      },
      {
        date: getRecentDate(18),
        description: 'Doctor Visit Copay',
        amount: 40.00,
        category: 'healthcare',
        type: 'expense',
        merchant: 'Medical Center'
      },
      // Late night impulse purchase (should be flagged as bad)
      {
        date: getRecentDate(13),
        description: 'Late Night Food Delivery',
        amount: 34.67,
        category: 'food',
        type: 'expense',
        merchant: 'DoorDash'
      }
    ]

    return sampleTransactions
  }

  // Category mapping for common transaction descriptions
  const categorizeTransaction = (description: string, amount: number): TransactionCategory => {
    const desc = description.toLowerCase()
    
    if (desc.includes('salary') || desc.includes('income') || desc.includes('deposit') || amount > 0) {
      return 'income'
    } else if (desc.includes('grocery') || desc.includes('food') || desc.includes('restaurant') || desc.includes('starbucks')) {
      return 'food'
    } else if (desc.includes('rent') || desc.includes('mortgage') || desc.includes('housing')) {
      return 'housing'
    } else if (desc.includes('gas') || desc.includes('uber') || desc.includes('taxi') || desc.includes('transport')) {
      return 'transportation'
    } else if (desc.includes('movie') || desc.includes('netflix') || desc.includes('entertainment')) {
      return 'entertainment'
    } else if (desc.includes('electric') || desc.includes('water') || desc.includes('utility') || desc.includes('phone')) {
      return 'utilities'
    } else if (desc.includes('amazon') || desc.includes('shopping') || desc.includes('store')) {
      return 'shopping'
    } else if (desc.includes('doctor') || desc.includes('hospital') || desc.includes('pharmacy') || desc.includes('medical')) {
      return 'healthcare'
    }
    return 'other'
  }

  // Parse CSV file
  const parseCSV = (file: File): Promise<ParsedTransaction[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            if (!results.data || results.data.length === 0) {
              reject(new Error('No data found in CSV file'))
              return
            }

            // Get column names for better error reporting
            const headers = Object.keys(results.data[0] as any)
            
            const transactions: ParsedTransaction[] = []
            const errors: string[] = []

            results.data.forEach((row: any, index: number) => {
              try {
                // Handle various CSV formats (common bank export formats) - more flexible matching
                const date = row.Date || row.date || row.DATE || row['Transaction Date'] || 
                           row['Date Posted'] || row.timestamp || row.Timestamp || row.TIMESTAMP ||
                           row['Post Date'] || row['Posting Date'] || row.TransactionDate

                const description = row.Description || row.description || row.DESCRIPTION || 
                                  row.merchant || row.Merchant || row.MERCHANT ||
                                  row.Payee || row.payee || row.PAYEE ||
                                  row.Reference || row.reference || row.REFERENCE ||
                                  row.Details || row.details || row.DETAILS ||
                                  row.Memo || row.memo || row.MEMO ||
                                  row['Transaction Details'] || row['TRANSACTION DETAILS'] ||
                                  row.Narrative || row.narrative || row.NARRATIVE ||
                                  row.Commentary || row.commentary || row.COMMENTARY

                let amountStr = row.Amount || row.amount || row.AMOUNT || 
                                row.Debit || row.debit || row.DEBIT ||
                                row.Credit || row.credit || row.CREDIT ||
                                row.Value || row.value || row.VALUE ||
                                row.Balance || row.balance || row.BALANCE ||
                                row.TransactionAmount || row['Transaction Amount']

                // Fallback: look for any column that might contain numeric amount data
                if (!amountStr && amountStr !== 0) {
                  const possibleAmountColumns = headers.filter(header => {
                    const value = row[header]
                    if (!value) return false
                    // Check if it looks like a number (contains digits, decimal, currency symbols)
                    const stringValue = value.toString().trim()
                    return /^[-$€£¥₹(]?[\d,]+\.?\d*[)]?$/.test(stringValue) || 
                           /^[\d,]+\.?\d*$/.test(stringValue)
                  })
                  if (possibleAmountColumns.length > 0) {
                    amountStr = row[possibleAmountColumns[0]]
                  }
                }

                if (!date || !description || (!amountStr && amountStr !== 0)) {
                  errors.push(`Row ${index + 1}: Missing fields (found: ${headers.join(', ')})`)
                  return
                }

                // Parse amount - handle different formats
                let amount = parseFloat(amountStr.toString().replace(/[,$()]/g, ''))
                
                // Handle negative amounts in parentheses (e.g., "(100.00)")
                if (amountStr.toString().includes('(') && amountStr.toString().includes(')')) {
                  amount = -Math.abs(amount)
                }

                if (isNaN(amount)) {
                  errors.push(`Row ${index + 1}: Invalid amount format: ${amountStr}`)
                  return
                }

                // Determine transaction type
                const type: 'income' | 'expense' = amount > 0 ? 'income' : 'expense'
                const finalAmount = Math.abs(amount)

                const category = categorizeTransaction(description, finalAmount)

                // Parse date more flexibly
                let parsedDate: string
                try {
                  const dateObj = new Date(date)
                  if (isNaN(dateObj.getTime())) {
                    throw new Error('Invalid date')
                  }
                  parsedDate = dateObj.toISOString().split('T')[0]
                } catch {
                  errors.push(`Row ${index + 1}: Invalid date format: ${date}`)
                  return
                }

                transactions.push({
                  date: parsedDate,
                  description: description.toString().trim(),
                  amount: finalAmount,
                  category,
                  type,
                  merchant: row.Merchant || row.merchant || row.MERCHANT || '',
                  location: row.Location || row.location || row.LOCATION || ''
                })
              } catch (error) {
                errors.push(`Row ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
              }
            })

            if (transactions.length === 0) {
              reject(new Error(`No valid transactions found. Issues: ${errors.slice(0, 3).join('; ')}${errors.length > 3 ? ` (and ${errors.length - 3} more)` : ''}`))
            } else {
              // Show warnings if some rows failed but others succeeded
              if (errors.length > 0 && transactions.length > 0) {
                console.warn(`Parsed ${transactions.length} transactions, skipped ${errors.length} rows due to errors`)
              }
              resolve(transactions)
            }
          } catch (error) {
            reject(error)
          }
        },
        error: (error) => {
          reject(new Error(`CSV parsing error: ${error.message}`))
        }
      })
    })
  }

  // Parse Excel file
  const parseExcel = (file: File): Promise<ParsedTransaction[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(worksheet)

          if (!jsonData || jsonData.length === 0) {
            reject(new Error('No data found in Excel file'))
            return
          }

          // Get column names for better error reporting
          const headers = Object.keys(jsonData[0] as any)
          
          const transactions: ParsedTransaction[] = []
          const errors: string[] = []

          jsonData.forEach((row: any, index: number) => {
            try {
              // Handle various Excel formats (common bank export formats) - more flexible matching
              const date = row.Date || row.date || row.DATE || row['Transaction Date'] || 
                         row['Date Posted'] || row.timestamp || row.Timestamp || row.TIMESTAMP ||
                         row['Post Date'] || row['Posting Date'] || row.TransactionDate

              const description = row.Description || row.description || row.DESCRIPTION || 
                                row.merchant || row.Merchant || row.MERCHANT ||
                                row.Payee || row.payee || row.PAYEE ||
                                row.Reference || row.reference || row.REFERENCE ||
                                row.Details || row.details || row.DETAILS ||
                                row.Memo || row.memo || row.MEMO ||
                                row['Transaction Details'] || row['TRANSACTION DETAILS'] ||
                                row.Narrative || row.narrative || row.NARRATIVE ||
                                row.Commentary || row.commentary || row.COMMENTARY

              let amountStr = row.Amount || row.amount || row.AMOUNT || 
                              row.Debit || row.debit || row.DEBIT ||
                              row.Credit || row.credit || row.CREDIT ||
                              row.Value || row.value || row.VALUE ||
                              row.Balance || row.balance || row.BALANCE ||
                              row.TransactionAmount || row['Transaction Amount']

              // Fallback: look for any column that might contain numeric amount data
              if (!amountStr && amountStr !== 0) {
                const possibleAmountColumns = headers.filter(header => {
                  const value = row[header]
                  if (!value) return false
                  // Check if it looks like a number (contains digits, decimal, currency symbols)
                  const stringValue = value.toString().trim()
                  return /^[-$€£¥₹(]?[\d,]+\.?\d*[)]?$/.test(stringValue) || 
                         /^[\d,]+\.?\d*$/.test(stringValue)
                })
                if (possibleAmountColumns.length > 0) {
                  amountStr = row[possibleAmountColumns[0]]
                }
              }

              if (!date || !description || (!amountStr && amountStr !== 0)) {
                errors.push(`Row ${index + 1}: Missing fields (found: ${headers.join(', ')})`)
                return
              }

              // Parse amount - handle different formats including Excel numbers
              let amount: number
              if (typeof amountStr === 'number') {
                amount = amountStr
              } else {
                amount = parseFloat(amountStr.toString().replace(/[,$()]/g, ''))
                
                // Handle negative amounts in parentheses (e.g., "(100.00)")
                if (amountStr.toString().includes('(') && amountStr.toString().includes(')')) {
                  amount = -Math.abs(amount)
                }
              }

              if (isNaN(amount)) {
                errors.push(`Row ${index + 1}: Invalid amount format: ${amountStr}`)
                return
              }

              const type: 'income' | 'expense' = amount > 0 ? 'income' : 'expense'
              const finalAmount = Math.abs(amount)

              const category = categorizeTransaction(description, finalAmount)

              // Parse date more flexibly
              let parsedDate: string
              try {
                let dateObj: Date
                if (typeof date === 'number') {
                  // Excel date serial number
                  dateObj = XLSX.SSF.parse_date_code(date)
                } else {
                  dateObj = new Date(date)
                }
                
                if (isNaN(dateObj.getTime())) {
                  throw new Error('Invalid date')
                }
                parsedDate = dateObj.toISOString().split('T')[0]
              } catch {
                errors.push(`Row ${index + 1}: Invalid date format: ${date}`)
                return
              }

              transactions.push({
                date: parsedDate,
                description: description.toString().trim(),
                amount: finalAmount,
                category,
                type,
                merchant: row.Merchant || row.merchant || row.MERCHANT || '',
                location: row.Location || row.location || row.LOCATION || ''
              })
            } catch (error) {
              errors.push(`Row ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`)
            }
          })

          if (transactions.length === 0) {
            reject(new Error(`No valid transactions found. Issues: ${errors.slice(0, 3).join('; ')}${errors.length > 3 ? ` (and ${errors.length - 3} more)` : ''}`))
          } else {
            // Show warnings if some rows failed but others succeeded
            if (errors.length > 0 && transactions.length > 0) {
              console.warn(`Parsed ${transactions.length} transactions, skipped ${errors.length} rows due to errors`)
            }
            resolve(transactions)
          }
        } catch (error) {
          reject(new Error(`Excel parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`))
        }
      }
      reader.onerror = () => reject(new Error('Failed to read Excel file'))
      reader.readAsArrayBuffer(file)
    })
  }

  // Parse PDF file (basic text extraction for bank statements)
  const parsePDF = async (file: File): Promise<ParsedTransaction[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = async (e) => {
        try {
          const typedArray = new Uint8Array(e.target?.result as ArrayBuffer)
          const pdf = await getDocument(typedArray).promise
          let allText = ''

          // Extract text from all pages
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i)
            const textContent = await page.getTextContent()
            const pageText = textContent.items.map((item: any) => item.str).join(' ')
            allText += pageText + '\n'
          }

          // Simple regex patterns for common bank statement formats
          // This is a basic implementation - real-world usage would need more sophisticated parsing
          const transactionPattern = /(\d{1,2}\/\d{1,2}\/\d{2,4})\s+([^$-]+?)\s+([-]?\$?[\d,]+\.?\d*)/g
          const transactions: ParsedTransaction[] = []
          let match

          while ((match = transactionPattern.exec(allText)) !== null) {
            try {
              const [, dateStr, description, amountStr] = match
              const amount = Math.abs(parseFloat(amountStr.replace(/[,$]/g, '')))
              
              if (isNaN(amount) || amount === 0) continue

              const type: 'income' | 'expense' = amountStr.includes('-') ? 'expense' : 'income'
              const category = categorizeTransaction(description, amount)

              transactions.push({
                date: new Date(dateStr).toISOString().split('T')[0],
                description: description.trim(),
                amount,
                category,
                type
              })
            } catch (error) {
              // Skip invalid transactions
              continue
            }
          }

          if (transactions.length === 0) {
            reject(new Error('No valid transactions found in PDF. Please ensure it\'s a bank statement with transaction data.'))
          } else {
            resolve(transactions)
          }
        } catch (error) {
          reject(new Error(`PDF parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`))
        }
      }
      reader.onerror = () => reject(new Error('Failed to read PDF file'))
      reader.readAsArrayBuffer(file)
    })
  }

  // Handle file processing
  const processFile = async (file: File) => {
    setIsProcessing(true)
    setUploadStatus('idle')
    setErrorMessage('')
    setUploadedFile(file)

    try {
      let parsedTransactions: ParsedTransaction[] = []

      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        parsedTransactions = await parseCSV(file)
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
                 file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        parsedTransactions = await parseExcel(file)
      } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        parsedTransactions = await parsePDF(file)
      } else {
        throw new Error('Unsupported file type. Please upload a CSV, Excel, or PDF file.')
      }

      await finalizeTransactions(parsedTransactions, file.name)
    } catch (error) {
      setUploadStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle sample data loading
  const loadSampleData = async () => {
    setIsProcessing(true)
    setUploadStatus('idle')
    setErrorMessage('')
    setUploadedFile(null)

    try {
      const sampleTransactions = generateSampleData()
      await finalizeTransactions(sampleTransactions, 'Sample Data')
    } catch (error) {
      setUploadStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  // Finalize and load transactions
  const finalizeTransactions = async (parsedTransactions: ParsedTransaction[], sourceName: string) => {
    // Convert to Transaction format with IDs
    const transactions: Transaction[] = parsedTransactions.map((parsed, index) => ({
      id: `uploaded-${Date.now()}-${index}`,
      accountId: 'uploaded-account',
      ...parsed,
      isRecurring: false,
      tags: []
    }))

    setParsedCount(transactions.length)
    setUploadStatus('success')
    
    // Add transactions to store
    onDataLoaded(transactions)
  }

  // Handle file drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      processFile(files[0])
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processFile(files[0])
    }
  }

  const resetUpload = () => {
    setUploadedFile(null)
    setUploadStatus('idle')
    setErrorMessage('')
    setParsedCount(0)
  }

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.pdf')) return <FileText className="w-8 h-8 text-red-500" />
    if (fileName.endsWith('.csv')) return <Table className="w-8 h-8 text-green-500" />
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) return <FileSpreadsheet className="w-8 h-8 text-blue-500" />
    return <File className="w-8 h-8 text-gray-500" />
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Financial Data</h2>
        <p className="text-gray-600">
          Upload your bank statements or transaction data in CSV, Excel, or PDF format to get started
        </p>
      </div>

      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragOver
            ? 'border-primary-400 bg-primary-50'
            : uploadStatus === 'success'
            ? 'border-green-400 bg-green-50'
            : uploadStatus === 'error'
            ? 'border-red-400 bg-red-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        {isProcessing ? (
          <div className="space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600">Processing your file...</p>
          </div>
        ) : uploadStatus === 'success' ? (
          <div className="space-y-4">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
            <div>
              <p className="text-green-700 font-medium">
                {uploadedFile ? 'File uploaded successfully!' : 'Sample data loaded successfully!'}
              </p>
              <p className="text-sm text-gray-600">
                Parsed {parsedCount} transactions {uploadedFile ? `from ${uploadedFile.name}` : 'from sample data'}
              </p>
            </div>
            <button
              onClick={resetUpload}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              {uploadedFile ? 'Upload Another File' : 'Load Different Data'}
            </button>
          </div>
        ) : uploadStatus === 'error' ? (
          <div className="space-y-4">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
            <div>
              <p className="text-red-700 font-medium">Upload failed</p>
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
            <button
              onClick={resetUpload}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Try Again
            </button>
          </div>
        ) : (
          <>
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">
                  Drop your files here, or{' '}
                  <label className="text-primary-600 hover:text-primary-700 cursor-pointer underline">
                    browse
                    <input
                      type="file"
                      className="hidden"
                      accept=".csv,.xlsx,.xls,.pdf"
                      onChange={handleFileSelect}
                    />
                  </label>
                </p>
                <p className="text-sm text-gray-500">
                  Supports CSV, Excel (.xlsx, .xls), and PDF files up to 10MB
                </p>
              </div>
              
              <div className="flex items-center justify-center">
                <div className="flex items-center space-x-4">
                  <div className="h-px bg-gray-300 flex-1"></div>
                  <span className="text-sm text-gray-500 px-4">or</span>
                  <div className="h-px bg-gray-300 flex-1"></div>
                </div>
              </div>

              <button
                onClick={loadSampleData}
                className="btn-secondary w-full inline-flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Use Sample Data (16 transactions)
              </button>
            </div>

            {/* Supported Formats */}
            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <Table className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-sm font-medium">CSV</p>
                <p className="text-xs text-gray-500">Spreadsheet data</p>
              </div>
              <div className="text-center">
                <FileSpreadsheet className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="text-sm font-medium">Excel</p>
                <p className="text-xs text-gray-500">XLSX, XLS files</p>
              </div>
              <div className="text-center">
                <FileText className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <p className="text-sm font-medium">PDF</p>
                <p className="text-xs text-gray-500">Bank statements</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Sample Format Guide */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Expected CSV Format:</h3>
        <div className="text-sm text-blue-800 font-mono bg-white p-2 rounded border">
          Date, Description, Amount, Merchant (optional)<br />
          2024-01-15, "Coffee Shop", -4.50, "Starbucks"<br />
          2024-01-15, "Salary Deposit", 3000.00, "Company Inc"
        </div>
        <p className="text-xs text-blue-700 mt-2">
          * Negative amounts for expenses, positive for income
        </p>
      </div>
    </div>
  )
}

export default FileUpload 