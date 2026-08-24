import React, { useState, useEffect } from 'react'
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns'
import api from '../../services/api'
import { useAuth } from '../../hooks/useAuth'
import toast from 'react-hot-toast'
import AnalyticsStats from '../../components/analytics/AnalyticsStats'
import MonthlyChart from '../../components/analytics/MonthlyChart'
import CategoryChart from '../../components/analytics/CategoryChart'
import SavingsTrendChart from '../../components/analytics/SavingsTrendChart'
import { getCategoryColor } from '../../constants/categories'
import { formatCurrency } from '../../utils/formatters'
import { SkeletonCard } from '../../components/common/Skeleton'

const PRESETS = [
  { label: 'This Month', months: 0 },
  { label: 'Last 3 Months', months: 3 },
  { label: 'Last 6 Months', months: 6 },
  { label: 'This Year', months: 12 },
]

export default function AnalyticsPage() {
  const { user } = useAuth()
  const currency = user?.currency || 'INR'
  const [preset, setPreset] = useState(1)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      try {
        const months = PRESETS[preset].months
        const endDate = format(endOfMonth(new Date()), 'yyyy-MM-dd')
        const startDate = format(startOfMonth(subMonths(new Date(), months || 1)), 'yyyy-MM-dd')
        const res = await api.get('/analytics/analytics', { params: { startDate, endDate } })
        setData(res.data.data || res.data)
      } catch (err) {
        toast.error('Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [preset])

  const topCategories = data?.categoryBreakdown?.slice(0, 5) || []

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Analytics</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Deep insights into your spending patterns</p>
        </div>
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
          {PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => setPreset(i)}
              className={[
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                preset === i
                  ? 'bg-white dark:bg-slate-700 text-primary-500 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300',
              ].join(' ')}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <AnalyticsStats data={data} loading={loading} currency={currency} />

      {/* Charts 2x2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MonthlyChart data={data?.monthlyData || []} loading={loading} currency={currency} />
        <CategoryChart data={data?.categoryBreakdown || []} loading={loading} currency={currency} />
        <SavingsTrendChart data={data?.savingsTrend || []} loading={loading} currency={currency} />

        {/* Top Categories */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-4">Top Spending Categories</h3>
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-10 skeleton rounded-lg" />
              ))}
            </div>
          ) : topCategories.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No data available</p>
          ) : (
            <ul className="space-y-3">
              {topCategories.map((cat, i) => {
                const color = getCategoryColor(cat.category || cat.name)
                const total = data?.totalExpenses || 1
                const pct = ((cat.total || cat.amount || 0) / total * 100).toFixed(1)
                return (
                  <li key={i} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-400 w-4">{i + 1}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{cat.category || cat.name}</span>
                        <span className="text-slate-500">{formatCurrency(cat.total || cat.amount || 0, currency)}</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full">
                        <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 w-10 text-right">{pct}%</span>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
