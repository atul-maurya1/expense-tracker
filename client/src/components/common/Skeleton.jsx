import React from 'react'

function SkeletonBase({ className = '' }) {
  return <div className={`skeleton rounded-lg ${className}`} />
}

export function SkeletonText({ lines = 3, className = '' }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBase
          key={i}
          className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  )
}

export function SkeletonCard({ className = '' }) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 ${className}`}>
      <div className="flex items-center gap-4 mb-4">
        <SkeletonBase className="w-12 h-12 rounded-xl" />
        <div className="flex-1">
          <SkeletonBase className="h-4 w-24 mb-2" />
          <SkeletonBase className="h-6 w-32" />
        </div>
      </div>
      <SkeletonBase className="h-3 w-20" />
    </div>
  )
}

export function SkeletonList({ rows = 5, className = '' }) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <SkeletonBase className="w-10 h-10 rounded-full shrink-0" />
          <div className="flex-1">
            <SkeletonBase className="h-4 w-3/4 mb-1.5" />
            <SkeletonBase className="h-3 w-1/2" />
          </div>
          <SkeletonBase className="h-4 w-16 shrink-0" />
        </div>
      ))}
    </div>
  )
}

export function SkeletonTable({ rows = 5, cols = 5 }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="p-3 text-left">
                <SkeletonBase className="h-4 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="border-b border-slate-100 dark:border-slate-800">
              {Array.from({ length: cols }).map((_, j) => (
                <td key={j} className="p-3">
                  <SkeletonBase className="h-4 w-full" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default SkeletonBase
