import React from 'react'
import { Calendar } from 'lucide-react'
import Input from './Input'

export default function DateRangePicker({ startDate, endDate, onStartChange, onEndChange, className = '' }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Input
        type="date"
        value={startDate || ''}
        onChange={(e) => onStartChange(e.target.value)}
        leftIcon={<Calendar className="w-4 h-4" />}
        className="w-44"
      />
      <span className="text-slate-400 text-sm">to</span>
      <Input
        type="date"
        value={endDate || ''}
        onChange={(e) => onEndChange(e.target.value)}
        leftIcon={<Calendar className="w-4 h-4" />}
        min={startDate || ''}
        className="w-44"
      />
    </div>
  )
}
