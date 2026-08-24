import React from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { SkeletonCard } from './Skeleton'
import { formatCurrency } from '../../utils/formatters'

export default function StatCard({
  label,
  amount,
  icon: Icon,
  iconBg = 'bg-primary-100 dark:bg-primary-900/30',
  iconColor = 'text-primary-500',
  change,
  isPositiveGood = true,
  currency = 'INR',
  loading = false,
  className = '',
}) {
  if (loading) return <SkeletonCard className={className} />

  const isPositive = change >= 0
  const isGood = isPositiveGood ? isPositive : !isPositive

  return (
    <div className={[
      'bg-white dark:bg-slate-800 rounded-2xl p-5',
      'border border-slate-200 dark:border-slate-700',
      'hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5',
      className,
    ].join(' ')}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {formatCurrency(amount, currency)}
          </p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
      {change !== undefined && (
        <div className="flex items-center gap-1.5">
          <div className={`flex items-center gap-0.5 text-xs font-semibold ${isGood ? 'text-emerald-500' : 'text-red-500'}`}>
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {Math.abs(change).toFixed(1)}%
          </div>
          <span className="text-xs text-slate-400 dark:text-slate-500">vs last month</span>
        </div>
      )}
    </div>
  )
}
