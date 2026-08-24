import React from 'react'
import { Pencil, Trash2, AlertTriangle } from 'lucide-react'
import { formatCurrency } from '../../utils/formatters'
import { getCategoryColor, getCategoryIcon } from '../../constants/categories'
import ProgressBar from '../common/ProgressBar'

export default function BudgetCard({ budget, onEdit, onDelete, currency = 'INR' }) {
  const spent = budget.spent || 0
  const amount = budget.amount || 0
  const remaining = Math.max(0, amount - spent)
  const percentage = amount > 0 ? (spent / amount) * 100 : 0
  const isOver = percentage >= 100
  const isWarning = percentage >= 80 && !isOver

  const color = getCategoryColor(budget.category)
  const Icon = getCategoryIcon(budget.category)

  return (
    <div className={[
      'bg-white dark:bg-slate-800 rounded-2xl p-5',
      'border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5',
      isOver
        ? 'border-red-300 dark:border-red-700'
        : isWarning
        ? 'border-amber-300 dark:border-amber-700'
        : 'border-slate-200 dark:border-slate-700',
    ].join(' ')}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
            <Icon className="w-5 h-5" style={{ color }} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 text-sm">{budget.category}</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {budget.month && `${budget.month}/${budget.year}`}
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(budget)}
            className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 text-slate-400 hover:text-primary-500 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(budget)}
            className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {isOver && (
        <div className="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-lg px-3 py-2 mb-3 text-xs font-medium">
          <AlertTriangle className="w-3.5 h-3.5" />
          Budget exceeded!
        </div>
      )}

      <ProgressBar value={spent} max={amount} />

      <div className="grid grid-cols-3 gap-2 mt-4 text-center">
        <div>
          <p className="text-xs text-slate-400 dark:text-slate-500">Budget</p>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(amount, currency)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400 dark:text-slate-500">Spent</p>
          <p className={`text-sm font-semibold ${isOver ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
            {formatCurrency(spent, currency)}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-400 dark:text-slate-500">Left</p>
          <p className={`text-sm font-semibold ${remaining === 0 ? 'text-red-500' : 'text-emerald-500'}`}>
            {formatCurrency(remaining, currency)}
          </p>
        </div>
      </div>
    </div>
  )
}
