import { subMonths, format, addMonths, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns'
import type { Transaction, TransactionCategory } from '../types'

export interface PurchaseAnalysis {
  id: string
  transaction: Transaction
  classification: 'good' | 'bad' | 'neutral'
  score: number // -100 to 100, negative = bad, positive = good
  reasoning: string
  category: 'essential' | 'investment' | 'entertainment' | 'impulse' | 'waste'
  impact: 'positive' | 'negative' | 'neutral'
}

export interface MonthlyPrediction {
  month: string
  totalEstimated: number
  categoryBreakdown: {
    category: TransactionCategory
    estimated: number
    confidence: number
    trend: 'increasing' | 'decreasing' | 'stable'
  }[]
  riskLevel: 'low' | 'medium' | 'high'
  recommendations: string[]
}

export interface PurchaseInsights {
  goodPurchases: PurchaseAnalysis[]
  badPurchases: PurchaseAnalysis[]
  neutralPurchases: PurchaseAnalysis[]
  totalGoodValue: number
  totalBadValue: number
  goodBadRatio: number
  monthlyPrediction: MonthlyPrediction
  trends: {
    improvementScore: number // -100 to 100
    spendingPattern: 'improving' | 'declining' | 'stable'
    riskAreas: string[]
    strengths: string[]
  }
}

class PurchaseAnalyzer {
  // Define good vs bad purchase criteria
  private goodPurchaseCriteria = {
    essential: ['food', 'housing', 'utilities', 'healthcare', 'transportation'],
    investment: ['education', 'health', 'career', 'assets'],
    reasonable: {
      food: { dailyLimit: 50, monthlyLimit: 800 },
      entertainment: { dailyLimit: 30, monthlyLimit: 300 },
      shopping: { dailyLimit: 100, monthlyLimit: 500 }
    }
  }

  private badPurchaseIndicators = {
    impulse: ['amazon', 'online', 'late night', 'weekend splurge'],
    excessive: { singlePurchase: 500, dailyTotal: 200 },
    wasteful: ['subscription', 'unused', 'duplicate', 'luxury'],
    timing: ['3am', '2am', '1am', '4am'] // Late night purchases often impulse
  }

  analyzePurchase(transaction: Transaction): PurchaseAnalysis {
    const { amount, description, category, date, type } = transaction
    
    if (type === 'income') {
      return {
        id: transaction.id,
        transaction,
        classification: 'good',
        score: 100,
        reasoning: 'Income is always positive for financial health',
        category: 'essential',
        impact: 'positive'
      }
    }

    let score = 0
    let reasoning = ''
    let analysisCategory: 'essential' | 'investment' | 'entertainment' | 'impulse' | 'waste' = 'entertainment'
    const reasons: string[] = []

    // Essential categories are generally good
    if (this.goodPurchaseCriteria.essential.includes(category)) {
      score += 30
      reasons.push('Essential category')
      analysisCategory = 'essential'
      
      // But check if amount is reasonable
      if (category === 'food' && amount > 100) {
        score -= 20
        reasons.push('High food expense')
      } else if (category === 'utilities' && amount > 300) {
        score -= 15
        reasons.push('High utility bill')
      }
    }

    // Investment-like purchases
    const desc = description.toLowerCase()
    if (desc.includes('book') || desc.includes('course') || desc.includes('education') || 
        desc.includes('gym') || desc.includes('health') || desc.includes('medical')) {
      score += 40
      reasons.push('Investment in personal development')
      analysisCategory = 'investment'
    }

    // Impulse purchase indicators
    const hour = new Date(date).getHours()
    if (hour < 6 || hour > 22) {
      score -= 25
      reasons.push('Late night purchase (potential impulse)')
      analysisCategory = 'impulse'
    }

    // Shopping analysis
    if (category === 'shopping') {
      if (amount > 200) {
        score -= 30
        reasons.push('Large shopping expense')
        analysisCategory = 'impulse'
      } else if (amount < 50) {
        score += 10
        reasons.push('Reasonable shopping amount')
      }
    }

    // Entertainment analysis
    if (category === 'entertainment') {
      if (amount > 100) {
        score -= 20
        reasons.push('High entertainment cost')
      } else if (amount < 30) {
        score += 15
        reasons.push('Moderate entertainment expense')
      }
      analysisCategory = 'entertainment'
    }

    // Frequency analysis (check for similar transactions)
    // This would be enhanced with actual transaction history
    if (desc.includes('subscription') || desc.includes('monthly')) {
      if (amount > 50) {
        score -= 15
        reasons.push('Expensive recurring subscription')
        analysisCategory = 'waste'
      } else {
        score += 5
        reasons.push('Reasonable subscription service')
      }
    }

    // Amount-based scoring
    if (amount > 1000) {
      score -= 40
      reasons.push('Very large expense')
    } else if (amount > 500) {
      score -= 20
      reasons.push('Large expense')
    } else if (amount < 20) {
      score += 10
      reasons.push('Small, manageable amount')
    }

    // Waste indicators
    if (desc.includes('cancel') || desc.includes('refund') || desc.includes('unused')) {
      score -= 50
      reasons.push('Potentially wasteful purchase')
      analysisCategory = 'waste'
    }

    // Clamp score between -100 and 100
    score = Math.max(-100, Math.min(100, score))
    reasoning = reasons.join(', ')

    let classification: 'good' | 'bad' | 'neutral'
    let impact: 'positive' | 'negative' | 'neutral'

    if (score >= 20) {
      classification = 'good'
      impact = 'positive'
    } else if (score <= -20) {
      classification = 'bad'
      impact = 'negative'
    } else {
      classification = 'neutral'
      impact = 'neutral'
    }

    return {
      id: transaction.id,
      transaction,
      classification,
      score,
      reasoning: reasoning || 'Standard transaction',
      category: analysisCategory,
      impact
    }
  }

  generateMonthlyPrediction(transactions: Transaction[]): MonthlyPrediction {
    const nextMonth = addMonths(new Date(), 1)
    const monthName = format(nextMonth, 'MMMM yyyy')
    
    // Analyze historical patterns (last 3 months)
    const now = new Date()
    const threeMonthsAgo = subMonths(now, 3)
    const recentTransactions = transactions.filter(t => 
      new Date(t.date) >= threeMonthsAgo && t.type === 'expense'
    )

    // Calculate category averages
    const categoryTotals: Record<TransactionCategory, number[]> = {
      food: [], housing: [], transportation: [], entertainment: [],
      utilities: [], shopping: [], healthcare: [], income: [], other: []
    }

    // Group by month and category
    for (let i = 0; i < 3; i++) {
      const monthStart = startOfMonth(subMonths(now, i))
      const monthEnd = endOfMonth(subMonths(now, i))
      
      Object.keys(categoryTotals).forEach(cat => {
        const category = cat as TransactionCategory
        const monthlyTotal = recentTransactions
          .filter(t => {
            const tDate = new Date(t.date)
            return t.category === category && tDate >= monthStart && tDate <= monthEnd
          })
          .reduce((sum, t) => sum + t.amount, 0)
        
        categoryTotals[category].push(monthlyTotal)
      })
    }

    // Calculate predictions
    const categoryBreakdown = Object.entries(categoryTotals).map(([cat, amounts]) => {
      const category = cat as TransactionCategory
      if (amounts.length === 0) {
        return {
          category,
          estimated: 0,
          confidence: 0,
          trend: 'stable' as const
        }
      }

      const average = amounts.reduce((sum, amt) => sum + amt, 0) / amounts.length
             const trend: 'increasing' | 'decreasing' | 'stable' = amounts.length >= 2 ? 
         (amounts[0] > amounts[amounts.length - 1] * 1.1 ? 'increasing' :
          amounts[0] < amounts[amounts.length - 1] * 0.9 ? 'decreasing' : 'stable') : 'stable'
      
      // Add trend adjustment
      let estimated = average
      if (trend === 'increasing') estimated *= 1.1
      if (trend === 'decreasing') estimated *= 0.9

      const confidence = Math.min(90, amounts.length * 30) // More data = higher confidence

      return {
        category,
        estimated: Math.round(estimated),
        confidence,
        trend
      }
    }).filter(item => item.estimated > 0)

    const totalEstimated = categoryBreakdown.reduce((sum, item) => sum + item.estimated, 0)
    
    // Determine risk level
    const previousMonthTotal = recentTransactions
      .filter(t => {
        const tDate = new Date(t.date)
        return tDate >= startOfMonth(subMonths(now, 1)) && tDate <= endOfMonth(subMonths(now, 1))
      })
      .reduce((sum, t) => sum + t.amount, 0)

    const riskLevel: 'low' | 'medium' | 'high' = 
      totalEstimated > previousMonthTotal * 1.2 ? 'high' :
      totalEstimated > previousMonthTotal * 1.1 ? 'medium' : 'low'

    // Generate recommendations
    const recommendations: string[] = []
    
    if (riskLevel === 'high') {
      recommendations.push('Consider reducing discretionary spending this month')
    }
    
    const highestCategory = categoryBreakdown.reduce((max, item) => 
      item.estimated > max.estimated ? item : max, categoryBreakdown[0])
    
    if (highestCategory && highestCategory.estimated > totalEstimated * 0.3) {
      recommendations.push(`Monitor ${highestCategory.category} spending - it's your largest predicted expense`)
    }

    categoryBreakdown.forEach(item => {
      if (item.trend === 'increasing' && item.estimated > 200) {
        recommendations.push(`${item.category} spending is trending upward`)
      }
    })

    if (recommendations.length === 0) {
      recommendations.push('Your spending patterns look stable for next month')
    }

    return {
      month: monthName,
      totalEstimated,
      categoryBreakdown,
      riskLevel,
      recommendations
    }
  }

  analyzeAllPurchases(transactions: Transaction[]): PurchaseInsights {
    const analyses = transactions.map(t => this.analyzePurchase(t))
    
    const goodPurchases = analyses.filter(a => a.classification === 'good')
    const badPurchases = analyses.filter(a => a.classification === 'bad')
    const neutralPurchases = analyses.filter(a => a.classification === 'neutral')
    
    const totalGoodValue = goodPurchases
      .filter(p => p.transaction.type === 'expense')
      .reduce((sum, p) => sum + p.transaction.amount, 0)
    
    const totalBadValue = badPurchases
      .filter(p => p.transaction.type === 'expense')
      .reduce((sum, p) => sum + p.transaction.amount, 0)
    
    const goodBadRatio = totalBadValue > 0 ? totalGoodValue / totalBadValue : totalGoodValue > 0 ? 10 : 1

    const monthlyPrediction = this.generateMonthlyPrediction(transactions)

    // Calculate improvement trends
    const recentAnalyses = analyses.filter(a => {
      const transactionDate = new Date(a.transaction.date)
      const thirtyDaysAgo = subMonths(new Date(), 1)
      return transactionDate >= thirtyDaysAgo
    })

    const olderAnalyses = analyses.filter(a => {
      const transactionDate = new Date(a.transaction.date)
      const thirtyDaysAgo = subMonths(new Date(), 1)
      const sixtyDaysAgo = subMonths(new Date(), 2)
      return transactionDate >= sixtyDaysAgo && transactionDate < thirtyDaysAgo
    })

    const recentAvgScore = recentAnalyses.length > 0 
      ? recentAnalyses.reduce((sum, a) => sum + a.score, 0) / recentAnalyses.length : 0
    const olderAvgScore = olderAnalyses.length > 0 
      ? olderAnalyses.reduce((sum, a) => sum + a.score, 0) / olderAnalyses.length : 0

    const improvementScore = recentAvgScore - olderAvgScore
    const spendingPattern = improvementScore > 10 ? 'improving' : 
                          improvementScore < -10 ? 'declining' : 'stable'

    // Identify risk areas and strengths
    const riskAreas: string[] = []
    const strengths: string[] = []

    const badCategories = badPurchases.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    Object.entries(badCategories).forEach(([category, count]) => {
      if (count >= 3) {
        riskAreas.push(`Frequent ${category} purchases`)
      }
    })

    const goodCategories = goodPurchases.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    Object.entries(goodCategories).forEach(([category, count]) => {
      if (count >= 5) {
        strengths.push(`Strong ${category} spending habits`)
      }
    })

    if (goodBadRatio > 2) {
      strengths.push('Overall positive spending patterns')
    }

    return {
      goodPurchases,
      badPurchases,
      neutralPurchases,
      totalGoodValue,
      totalBadValue,
      goodBadRatio,
      monthlyPrediction,
      trends: {
        improvementScore,
        spendingPattern,
        riskAreas,
        strengths
      }
    }
  }
}

export const purchaseAnalyzer = new PurchaseAnalyzer() 