import React from 'react'

const sizes = {
  xs: 'w-3 h-3 border',
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-3',
  xl: 'w-16 h-16 border-4',
}

export default function LoadingSpinner({ size = 'md', centered = false, className = '' }) {
  const spinner = (
    <div
      className={[
        'rounded-full border-slate-200 dark:border-slate-700 border-t-primary-500 animate-spin',
        sizes[size],
        className,
      ].join(' ')}
    />
  )

  if (centered) {
    return (
      <div className="flex items-center justify-center w-full h-full min-h-[200px]">
        {spinner}
      </div>
    )
  }

  return spinner
}
