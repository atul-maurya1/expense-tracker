import React, { useState } from 'react'
import { Pencil, Trash2, ArrowUpRight, ArrowDownLeft, ChevronUp, ChevronDown } from 'lucide-react'
import { formatCurrency, formatDate } from '../../utils/formatters'
import { getCategoryColor, getCategoryIcon } from '../../constants/categories'
import CategoryBadge from '../common/CategoryBadge'
import { SkeletonTable } from '../common/Skeleton'
import EmptyState from '../common/EmptyState'

export default function TransactionTable({ transactions, loading, onEdit, onDelete, currency = 'INR' }) {
  const [sortField, setSortField] = useState('date')
  const [sortDir, setSortDir] = useState('desc')

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
  }

  const SortIcon = ({ field }) => (
    sortField === field
      ? sortDir === 'asc' ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />
      : <ChevronDown className="w-3.5 h-3.5 opacity-30" />
  )

  const sorted = [...transactions].sort((a, b) => {
    let aVal = a[sortField], bVal = b[sortField]
    if (sortField === 'date') { aVal = new Date(aVal); bVal = new Date(bVal) }
    if (sortField === 'amount') { aVal = parseFloat(aVal); bVal = parseFloat(bVal) }
    if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
    if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  if (loading) return <SkeletonTable rows={8} cols={6} />

  if (!transactions.length) {
    return (
      <EmptyState
        title="No transactions found"
        description="Try adjusting your filters or add a new transaction"
      />
    )
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-slate-700">
              {[
                { key: 'date', label: 'Date' },
                { key: 'description', label: 'Description' },
                { key: 'category', label: 'Category' },
                { key: 'type', label: 'Type' },
                { key: 'amount', label: 'Amount' },
                { key: 'actions', label: '', sortable: false },
              ].map(({ key, label, sortable = true }) => (
                <th
                  key={key}
                  onClick={sortable ? () => toggleSort(key) : undefined}
                  className={[
                    'text-left p-3 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider',
                    sortable ? 'cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 select-none' : '',
                  ].join(' ')}
                >
                  <span className="flex items-center gap-1">
                    {label}
                    {sortable && <SortIcon field={key} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
            {sorted.map((tx) => {
              const isIncome = tx.type === 'income'
              const color = getCategoryColor(tx.category)
              const Icon = getCategoryIcon(tx.category)
              return (
                <tr key={tx._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                  <td className="p-3 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {formatDate(tx.date, 'MMM dd, yyyy')}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}20` }}>
                        <Icon className="w-4 h-4" style={{ color }} />
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-48">
                        {tx.description}
                      </span>
                    </div>
                  </td>
                  <td className="p-3"><CategoryBadge category={tx.category} /></td>
                  <td className="p-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${isIncome ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {isIncome ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                      {tx.type}
                    </span>
                  </td>
                  <td className={`p-3 text-sm font-semibold ${isIncome ? 'text-emerald-500' : 'text-red-500'}`}>
                    {isIncome ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit(tx)}
                        className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 text-slate-400 hover:text-primary-500 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDelete(tx)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {sorted.map((tx) => {
          const isIncome = tx.type === 'income'
          const color = getCategoryColor(tx.category)
          const Icon = getCategoryIcon(tx.category)
          return (
            <div key={tx._id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/30">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}20` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">{tx.description}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">{formatDate(tx.date)}</span>
                  <CategoryBadge category={tx.category} />
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`text-sm font-semibold ${isIncome ? 'text-emerald-500' : 'text-red-500'}`}>
                  {isIncome ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => onEdit(tx)} className="p-1 text-slate-400 hover:text-primary-500">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => onDelete(tx)} className="p-1 text-slate-400 hover:text-red-500">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
