import React from 'react'

export default function ProgressBar({ value = 0, max = 100, showLabel = true, height = 'h-2', className = '' }) {
  const percentage = Math.min((value / max) * 100, 150)
  const capped = Math.min(percentage, 100)

  const color = percentage >= 100
    ? 'bg-red-500'
    : percentage >= 80
    ? 'bg-amber-500'
    : 'bg-emerald-500'

  return (
    <div className={`w-full ${className}`}>
      <div className={`w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden ${height}`}>
        <div
          className={`${height} ${color} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${capped}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-end mt-1">
          <span className={`text-xs font-medium ${percentage >= 100 ? 'text-red-500' : percentage >= 80 ? 'text-amber-500' : 'text-emerald-500'}`}>
            {percentage.toFixed(0)}%
          </span>
        </div>
      )}
    </div>
  )
}
