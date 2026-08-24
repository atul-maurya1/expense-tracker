import React, { useState, useCallback } from 'react'
import { Search, X, Filter } from 'lucide-react'
import Input from '../common/Input'
import Select from '../common/Select'
import Button from '../common/Button'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, ALL_CATEGORIES } from '../../constants/categories'

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
]

const CATEGORY_OPTIONS = [
  { value: '', label: 'All Categories' },
  ...ALL_CATEGORIES.map(c => ({ value: c.name, label: c.name })),
]

function useDebounce(fn, delay) {
  const timer = React.useRef(null)
  return useCallback((...args) => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => fn(...args), delay)
  }, [fn, delay])
}

export default function TransactionFilters({ filters, onChange }) {
  const hasFilters = filters.search || filters.type || filters.category || filters.startDate || filters.endDate

  const handleSearch = useDebounce((val) => onChange({ ...filters, search: val, page: 1 }), 400)

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
      <div className="flex flex-wrap gap-3 items-end">
        {/* Search */}
        <div className="flex-1 min-w-48">
          <Input
            placeholder="Search transactions..."
            leftIcon={<Search className="w-4 h-4" />}
            defaultValue={filters.search || ''}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        {/* Type */}
        <div className="w-36">
          <Select
            options={TYPE_OPTIONS}
            value={filters.type || ''}
            onChange={(e) => onChange({ ...filters, type: e.target.value, page: 1 })}
          />
        </div>

        {/* Category */}
        <div className="w-44">
          <Select
            options={CATEGORY_OPTIONS}
            value={filters.category || ''}
            onChange={(e) => onChange({ ...filters, category: e.target.value, page: 1 })}
          />
        </div>

        {/* Date Range */}
        <Input
          type="date"
          value={filters.startDate || ''}
          onChange={(e) => onChange({ ...filters, startDate: e.target.value, page: 1 })}
          className="w-40"
          placeholder="From"
        />
        <Input
          type="date"
          value={filters.endDate || ''}
          onChange={(e) => onChange({ ...filters, endDate: e.target.value, page: 1 })}
          min={filters.startDate || ''}
          className="w-40"
          placeholder="To"
        />

        {/* Clear */}
        {hasFilters && (
          <Button
            variant="ghost"
            size="md"
            onClick={() => onChange({ page: 1, limit: 10 })}
            leftIcon={<X className="w-4 h-4" />}
          >
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
