import React from 'react'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { formatCurrency } from '../../utils/formatters'
import { CHART_COLORS } from '../../constants/categories'
import { SkeletonCard } from '../common/Skeleton'

const CustomTooltip = ({ active, payload, currency }) => {
  if (!active || !payload?.length) return null
  const { name, value, percent } = payload[0]
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-lg text-sm">
      <p className="font-semibold text-slate-700 dark:text-slate-300">{name}</p>
      <p className="text-slate-500">{formatCurrency(value, currency)}</p>
      <p className="text-slate-400">{(percent * 100).toFixed(1)}%</p>
    </div>
  )
}

export default function CategoryChart({ data, loading, currency = 'INR' }) {
  if (loading) return <SkeletonCard className="h-72" />

  const raw = data?.categoryData || []
  const chartData = raw.map((c) => ({ name: c.category || c.name, value: c.total || c.amount || 0 }))

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
      <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-4">
        Expense by Category
      </h3>
      {chartData.length === 0 ? (
        <div className="h-56 flex items-center justify-center text-slate-400 text-sm">No expenses yet</div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
            >
              {chartData.map((_, index) => (
                <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip currency={currency} />} />
            <Legend
              formatter={(value) => (
                <span className="text-xs text-slate-500 dark:text-slate-400">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
