import React, { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '../../utils/formatters'
import { SkeletonCard } from '../common/Skeleton'

const PERIODS = ['7D', '30D', '3M', '6M', '1Y']

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-lg text-sm">
      <p className="text-slate-500 dark:text-slate-400 mb-1">{label}</p>
      <p className="font-semibold text-primary-500">{formatCurrency(payload[0]?.value, currency)}</p>
    </div>
  )
}

export default function SpendingTrendChart({ data, loading, currency = 'INR' }) {
  const [period, setPeriod] = useState('30D')

  if (loading) return <SkeletonCard className="h-72" />

  const trendData = data?.spendingTrend?.[period] || data?.spendingTrend || []

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300">Spending Trend</h3>
        <div className="flex gap-1 bg-slate-100 dark:bg-slate-700/50 rounded-lg p-1">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={[
                'px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                period === p
                  ? 'bg-white dark:bg-slate-700 text-primary-500 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200',
              ].join(' ')}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      {trendData.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-slate-400 text-sm">No trend data available</div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="spendGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => `${v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}`} />
            <Tooltip content={<CustomTooltip currency={currency} />} />
            <Area
              type="monotone"
              dataKey="amount"
              stroke="#6366f1"
              strokeWidth={2}
              fill="url(#spendGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
