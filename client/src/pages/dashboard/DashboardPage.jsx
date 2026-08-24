import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useDashboard } from '../../hooks/useDashboard'
import { MONTHS } from '../../constants'
import DashboardStats from '../../components/dashboard/DashboardStats'
import IncomeExpenseChart from '../../components/dashboard/IncomeExpenseChart'
import CategoryChart from '../../components/dashboard/CategoryChart'
import SpendingTrendChart from '../../components/dashboard/SpendingTrendChart'
import RecentTransactions from '../../components/dashboard/RecentTransactions'
import AddTransactionModal from '../../components/transactions/AddTransactionModal'
import Select from '../../components/common/Select'
import Button from '../../components/common/Button'
import { Plus, RefreshCw } from 'lucide-react'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

const now = new Date()
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i).map(y => ({ value: y, label: String(y) }))
const MONTH_OPTIONS = MONTHS.map((m, i) => ({ value: i + 1, label: m }))

export default function DashboardPage() {
  const { user } = useAuth()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [addOpen, setAddOpen] = useState(false)
  const { data, loading, error, refetch } = useDashboard(month, year)

  const currency = user?.currency || 'INR'
  const recentTransactions = data?.recentTransactions || []

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'there'} 👋
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Here's your financial overview for {MONTHS[month - 1]} {year}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            options={MONTH_OPTIONS}
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
            className="w-36"
          />
          <Select
            options={YEAR_OPTIONS}
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            className="w-24"
          />
          <button
            onClick={refetch}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Button onClick={() => setAddOpen(true)} leftIcon={<Plus className="w-4 h-4" />} className="sm:hidden">
            Add
          </Button>
        </div>
      </div>

      {/* Stats */}
      <DashboardStats data={data} loading={loading} currency={currency} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <IncomeExpenseChart data={data} loading={loading} currency={currency} />
        <CategoryChart data={data} loading={loading} currency={currency} />
      </div>

      {/* Spending Trend */}
      <SpendingTrendChart data={data} loading={loading} currency={currency} />

      {/* Recent Transactions */}
      <RecentTransactions
        transactions={recentTransactions}
        loading={loading}
        currency={currency}
      />

      <AddTransactionModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={() => { setAddOpen(false); refetch() }}
      />
    </div>
  )
}
