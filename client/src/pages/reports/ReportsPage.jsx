import React, { useState, useEffect } from 'react'
import { Download, FileText, TrendingUp, TrendingDown, DollarSign } from 'lucide-react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/common/Button'
import DateRangePicker from '../../components/common/DateRangePicker'
import { formatCurrency, formatDate } from '../../utils/formatters'
import CategoryBadge from '../../components/common/CategoryBadge'
import EmptyState from '../../components/common/EmptyState'
import { SkeletonTable } from '../../components/common/Skeleton'

export default function ReportsPage() {
  const { user } = useAuth()
  const currency = user?.currency || 'INR'
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'))
  const [endDate, setEndDate] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'))
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true)
      try {
        const res = await api.get('/transactions', { params: { startDate, endDate, limit: 500 } })
        const data = res.data.data || res.data
        setTransactions(data.transactions || data || [])
      } catch (err) {
        toast.error('Failed to load transactions')
      } finally {
        setLoading(false)
      }
    }
    fetchTransactions()
  }, [startDate, endDate])

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)
  const netBalance = totalIncome - totalExpense

  const exportCSV = async () => {
    setExporting(true)
    try {
      const response = await api.get('/transactions', { params: { startDate, endDate, limit: 10000 } })
      const txs = response.data.data?.transactions || response.data.data || response.data.transactions || []
      const headers = ['Date', 'Description', 'Category', 'Type', 'Amount', 'Notes']
      const rows = txs.map(t => [
        formatDate(t.date),
        `"${(t.description || '').replace(/"/g, '""')}"`,
        t.category,
        t.type,
        t.amount,
        `"${(t.notes || '').replace(/"/g, '""')}"`,
      ])
      const csv = [headers, ...rows].map(r => r.join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `transactions-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Exported successfully!')
    } catch (err) {
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Reports</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">View and export your transaction reports</p>
        </div>
        <Button
          onClick={exportCSV}
          loading={exporting}
          leftIcon={<Download className="w-4 h-4" />}
          variant="outline"
        >
          Export CSV
        </Button>
      </div>

      {/* Date Range */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">Date Range</p>
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartChange={setStartDate}
          onEndChange={setEndDate}
        />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Income', value: formatCurrency(totalIncome, currency), color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: TrendingUp },
          { label: 'Total Expenses', value: formatCurrency(totalExpense, currency), color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', icon: TrendingDown },
          { label: 'Net Balance', value: formatCurrency(netBalance, currency), color: netBalance >= 0 ? 'text-primary-500' : 'text-red-500', bg: 'bg-primary-50 dark:bg-primary-900/20', icon: DollarSign },
        ].map(({ label, value, color, bg, icon: Icon }) => (
          <div key={label} className={`rounded-2xl border border-slate-200 dark:border-slate-700 p-4 ${bg}`}>
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`w-4 h-4 ${color}`} />
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</span>
            </div>
            <p className={`text-lg font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-700 dark:text-slate-300">
            Transactions ({transactions.length})
          </h3>
        </div>
        {loading ? (
          <SkeletonTable rows={8} cols={5} />
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No transactions"
            description="No transactions found for the selected date range"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-700">
                  {['Date', 'Description', 'Category', 'Type', 'Amount'].map(h => (
                    <th key={h} className="text-left p-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                {transactions.map(tx => (
                  <tr key={tx._id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="p-3 text-sm text-slate-500">{formatDate(tx.date)}</td>
                    <td className="p-3 text-sm font-medium text-slate-700 dark:text-slate-300 max-w-xs truncate">{tx.description}</td>
                    <td className="p-3"><CategoryBadge category={tx.category} /></td>
                    <td className="p-3 text-sm capitalize text-slate-500">{tx.type}</td>
                    <td className={`p-3 text-sm font-semibold ${tx.type === 'income' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
