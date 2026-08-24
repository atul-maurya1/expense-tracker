import React from 'react'
import { Target, TrendingDown, Wallet, Activity } from 'lucide-react'
import { formatCurrency, formatPercentage } from '../../utils/formatters'
import ProgressBar from '../common/ProgressBar'

export default function BudgetSummary({ budgets, currency = 'INR' }) {
  const totalBudget = budgets.reduce((s, b) => s + (b.amount || 0), 0)
  const totalSpent = budgets.reduce((s, b) => s + (b.spent || 0), 0)
  const remaining = Math.max(0, totalBudget - totalSpent)
  const percentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

  const stats = [
    { label: 'Total Budget', value: formatCurrency(totalBudget, currency), icon: Target, color: 'text-primary-500', bg: 'bg-primary-100 dark:bg-primary-900/30' },
    { label: 'Total Spent', value: formatCurrency(totalSpent, currency), icon: TrendingDown, color: 'text-red-500', bg: 'bg-red-100 dark:bg-red-900/30' },
    { label: 'Remaining', value: formatCurrency(remaining, currency), icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { label: 'Used', value: formatPercentage(percentage), icon: Activity, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
  ]

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
      <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-4">Overall Budget Summary</h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500">{label}</p>
              <p className={`font-semibold text-sm ${color}`}>{value}</p>
            </div>
          </div>
        ))}
      </div>
      <ProgressBar value={totalSpent} max={totalBudget} />
    </div>
  )
}
