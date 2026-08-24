import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DollarSign } from 'lucide-react'
import Input from '../common/Input'
import Select from '../common/Select'
import Button from '../common/Button'
import { EXPENSE_CATEGORIES } from '../../constants/categories'
import { MONTHS } from '../../constants'

const schema = z.object({
  category: z.string().min(1, 'Category is required'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2020).max(2030),
})

const now = new Date()
const YEAR_OPTIONS = Array.from({ length: 6 }, (_, i) => now.getFullYear() - 2 + i).map(y => ({ value: y, label: String(y) }))

export default function BudgetForm({ onSubmit, defaultValues, loading = false }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      category: '',
      amount: '',
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      ...defaultValues,
    },
  })

  const categoryOptions = EXPENSE_CATEGORIES.map(c => ({ value: c.name, label: c.name }))
  const monthOptions = MONTHS.map((m, i) => ({ value: i + 1, label: m }))

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Select
        label="Category"
        options={categoryOptions}
        placeholder="Select category"
        error={errors.category?.message}
        required
        {...register('category')}
      />
      <Input
        label="Budget Amount"
        type="number"
        step="0.01"
        min="0"
        placeholder="0.00"
        leftIcon={<DollarSign className="w-4 h-4" />}
        error={errors.amount?.message}
        required
        {...register('amount')}
      />
      <div className="grid grid-cols-2 gap-3">
        <Select
          label="Month"
          options={monthOptions}
          error={errors.month?.message}
          required
          {...register('month')}
        />
        <Select
          label="Year"
          options={YEAR_OPTIONS}
          error={errors.year?.message}
          required
          {...register('year')}
        />
      </div>
      <Button type="submit" fullWidth loading={loading} size="lg">
        {defaultValues?._id ? 'Update Budget' : 'Set Budget'}
      </Button>
    </form>
  )
}
