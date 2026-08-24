import React from 'react'
import { getCategoryColor } from '../../constants/categories'

export default function CategoryBadge({ category, className = '' }) {
  const color = getCategoryColor(category)
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${className}`}
      style={{ backgroundColor: `${color}20`, color }}
    >
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
      {category}
    </span>
  )
}
