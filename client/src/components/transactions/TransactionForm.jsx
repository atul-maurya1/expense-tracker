import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DollarSign } from 'lucide-react'
import Input from '../common/Input'
import Select from '../common/Select'
import Button from '../common/Button'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../../constants/categories'
import { format } from 'date-fns'

const schema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required').max(150),
  date: z.string().min(1, 'Date is required'),
  notes: z.string().max(500).optional(),
})

export default function TransactionForm({ onSubmit, defaultValues, loading = false }) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      type: 'expense',
      amount: '',
      category: '',
      description: '',
      date: format(new Date(), 'yyyy-MM-dd'),
      notes: '',
      ...defaultValues,
    },
  })

  useEffect(() => {
    if (defaultValues) {
      const formattedDate = defaultValues.date
        ? format(new Date(defaultValues.date), 'yyyy-MM-dd')
        : format(new Date(), 'yyyy-MM-dd')
      reset({
        type: 'expense',
        amount: '',
        category: '',
        description: '',
        notes: '',
        ...defaultValues,
        date: formattedDate,
      })
    }
  }, [defaultValues, reset])

  const type = watch('type')

  const categories = type === 'income'
    ? INCOME_CATEGORIES.map(c => ({ value: c.name, label: c.name }))
    : EXPENSE_CATEGORIES.map(c => ({ value: c.name, label: c.name }))

  const handleTypeChange = (newType) => {
    setValue('type', newType)
    setValue('category', '')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Type Toggle */}
      <div>
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
          Transaction Type
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleTypeChange('expense')}
            className={[
              'py-2.5 rounded-xl text-sm font-semibold transition-all',
              type === 'expense'
                ? 'bg-red-500 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600',
            ].join(' ')}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('income')}
            className={[
              'py-2.5 rounded-xl text-sm font-semibold transition-all',
              type === 'income'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600',
            ].join(' ')}
          >
            Income
          </button>
        </div>
        {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type.message}</p>}
      </div>

      {/* Amount */}
      <Input
        label="Amount"
        type="number"
        step="0.01"
        min="0"
        placeholder="0.00"
        leftIcon={<DollarSign className="w-4 h-4" />}
        error={errors.amount?.message}
        required
        {...register('amount')}
      />

      {/* Category */}
      <Select
        label="Category"
        options={categories}
        placeholder="Select category"
        error={errors.category?.message}
        required
        {...register('category')}
      />

      {/* Description */}
      <Input
        label="Description"
        type="text"
        placeholder="e.g. Grocery shopping"
        error={errors.description?.message}
        required
        {...register('description')}
      />

      {/* Date */}
      <Input
        label="Date"
        type="date"
        error={errors.date?.message}
        required
        {...register('date')}
      />

      {/* Notes */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Notes <span className="text-slate-400">(optional)</span>
        </label>
        <textarea
          rows={3}
          placeholder="Additional notes..."
          className="w-full rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
          {...register('notes')}
        />
        {errors.notes && <p className="text-xs text-red-500">{errors.notes.message}</p>}
      </div>

      <Button type="submit" fullWidth loading={loading} size="lg">
        {defaultValues ? 'Update Transaction' : 'Add Transaction'}
      </Button>
    </form>
  )
}
