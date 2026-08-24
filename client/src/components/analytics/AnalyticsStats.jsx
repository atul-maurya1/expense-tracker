import React from 'react'
import { TrendingUp, TrendingDown, PiggyBank, Percent, Activity, Calendar } from 'lucide-react'
import { formatCurrency, formatPercentage } from '../../utils/formatters'
import { SkeletonCard } from '../common/Skeleton'

export default function AnalyticsStats({ data, loading, currency = 'INR' }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  const stats = [
    { label: 'Total Income', value: formatCurrency(data?.totalIncome || 0, currency), icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { label: 'Total Expenses', value: formatCurrency(data?.totalExpenses || 0, currency), icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
    { label: 'Net Savings', value: formatCurrency(data?.netSavings || 0, currency), icon: PiggyBank, color: 'text-primary-500', bg: 'bg-primary-100 dark:bg-primary-900/30' },
    { label: 'Savings Rate', value: formatPercentage(data?.savingsRate || 0), icon: Percent, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
    { label: 'Avg Daily Spend', value: formatCurrency(data?.avgDailySpending || 0, currency), icon: Activity, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { label: 'Avg Monthly Spend', value: formatCurrency(data?.avgMonthlySpending || 0, currency), icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {stats.map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
          </div>
          <p className={`text-xl font-bold ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  )
}
