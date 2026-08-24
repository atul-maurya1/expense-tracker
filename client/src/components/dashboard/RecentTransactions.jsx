import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, ArrowDownLeft, ChevronRight } from 'lucide-react'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { getCategoryColor, getCategoryIcon } from '../../constants/categories'
import CategoryBadge from '../common/CategoryBadge'
import { SkeletonList } from '../common/Skeleton'
import EmptyState from '../common/EmptyState'

export default function RecentTransactions({ transactions = [], loading, currency = 'INR' }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-700">
        <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">Recent Transactions</h3>
        <Link
          to="/transactions"
          className="flex items-center gap-1 text-sm text-primary-500 hover:text-primary-600 font-medium transition-colors"
        >
          View all <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
      <div className="p-5">
        {loading ? (
          <SkeletonList rows={5} />
        ) : transactions.length === 0 ? (
          <EmptyState
            title="No transactions yet"
            description="Add your first transaction to get started"
          />
        ) : (
          <ul className="space-y-3">
            {transactions.map((tx) => {
              const isIncome = tx.type === 'income'
              const color = getCategoryColor(tx.category)
              const Icon = getCategoryIcon(tx.category)
              return (
                <li key={tx._id} className="flex items-center gap-3 group">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    <Icon className="w-5 h-5" style={{ color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{tx.description}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-400">{formatDate(tx.date)}</span>
                      <CategoryBadge category={tx.category} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {isIncome ? (
                      <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <ArrowDownLeft className="w-4 h-4 text-red-400" />
                    )}
                    <span className={`text-sm font-semibold ${isIncome ? 'text-emerald-500' : 'text-red-500'}`}>
                      {isIncome ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
