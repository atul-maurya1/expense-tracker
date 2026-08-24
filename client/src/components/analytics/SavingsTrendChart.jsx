import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { formatCurrency } from '../../utils/formatters'

const CustomTooltip = ({ active, payload, label, currency }) => {
  if (!active || !payload?.length) return null
  const value = payload[0]?.value || 0
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-lg text-sm">
      <p className="text-slate-500 mb-1">{label}</p>
      <p className={`font-semibold ${value >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>{formatCurrency(value, currency)}</p>
    </div>
  )
}

export default function SavingsTrendChart({ data = [], loading, currency = 'INR' }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700">
      <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-4">Savings Trend</h3>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} />
          <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={v => `${v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}`} />
          <Tooltip content={<CustomTooltip currency={currency} />} />
          <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="3 3" />
          <Line type="monotone" dataKey="savings" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
