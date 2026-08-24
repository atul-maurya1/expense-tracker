import React, { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '../../services/api'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES, getCategoryColor, getCategoryIcon } from '../../constants/categories'
import { SkeletonCard } from '../../components/common/Skeleton'

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  type: z.enum(['income', 'expense']),
  color: z.string().min(1),
  icon: z.string().optional(),
})

const COLOR_OPTIONS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899',
  '#8b5cf6', '#14b8a6', '#f97316', '#84cc16', '#0ea5e9', '#f43f5e',
]

function CategoryCard({ cat, isDefault, onEdit, onDelete }) {
  const color = cat.color || getCategoryColor(cat.name)
  const Icon = getCategoryIcon(cat.name)
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 flex items-center gap-3 hover:shadow-md transition-all group">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}20` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 truncate">{cat.name}</p>
        {isDefault && <p className="text-xs text-slate-400">Default</p>}
      </div>
      {!isDefault && (
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(cat)} className="p-1.5 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-900/20 text-slate-400 hover:text-primary-500">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(cat)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

function CategoryForm({ onSubmit, defaultValues, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { type: 'expense', color: '#6366f1', ...defaultValues },
  })
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Select label="Type" options={[{ value: 'expense', label: 'Expense' }, { value: 'income', label: 'Income' }]} required {...register('type')} error={errors.type?.message} />
      <Input label="Category Name" placeholder="e.g. Groceries" required {...register('name')} error={errors.name?.message} />
      <div>
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">Color</label>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map(c => (
            <label key={c} className="cursor-pointer">
              <input type="radio" value={c} {...register('color')} className="sr-only" />
              <div className="w-7 h-7 rounded-lg border-2 border-transparent hover:scale-110 transition-transform" style={{ backgroundColor: c }} />
            </label>
          ))}
        </div>
      </div>
      <Button type="submit" fullWidth loading={loading}>{defaultValues?._id ? 'Update' : 'Add'} Category</Button>
    </form>
  )
}

export default function CategoriesPage() {
  const [customCats, setCustomCats] = useState([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [editCat, setEditCat] = useState(null)
  const [deleteCat, setDeleteCat] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchCats = async () => {
    setLoading(true)
    try {
      const res = await api.get('/categories')
      const all = res.data.data?.categories || res.data.data || res.data || []
      setCustomCats(all.filter(c => !c.isDefault))
    } catch {
      setCustomCats([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchCats() }, [])

  const handleAdd = async (data) => {
    setFormLoading(true)
    try {
      await api.post('/categories', data)
      toast.success('Category added!')
      fetchCats(); setAddOpen(false)
    } catch (err) { toast.error(err.message) } finally { setFormLoading(false) }
  }

  const handleEdit = async (data) => {
    setFormLoading(true)
    try {
      await api.patch(`/categories/${editCat._id}`, data)
      toast.success('Category updated!')
      fetchCats(); setEditCat(null)
    } catch (err) { toast.error(err.message) } finally { setFormLoading(false) }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await api.delete(`/categories/${deleteCat._id}`)
      toast.success('Category deleted')
      fetchCats(); setDeleteCat(null)
    } catch (err) { toast.error(err.message) } finally { setDeleteLoading(false) }
  }

  const expenseCustom = customCats.filter(c => c.type === 'expense')
  const incomeCustom = customCats.filter(c => c.type === 'income')

  return (
    <div className="space-y-6 fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Categories</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your transaction categories</p>
        </div>
        <Button onClick={() => setAddOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>Add Category</Button>
      </div>

      {/* Expense */}
      <div>
        <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-3">Expense Categories</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {EXPENSE_CATEGORIES.map(c => <CategoryCard key={c.name} cat={c} isDefault onEdit={() => {}} onDelete={() => {}} />)}
          {expenseCustom.map(c => <CategoryCard key={c._id} cat={c} isDefault={false} onEdit={setEditCat} onDelete={setDeleteCat} />)}
        </div>
      </div>

      {/* Income */}
      <div>
        <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-3">Income Categories</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {INCOME_CATEGORIES.map(c => <CategoryCard key={c.name} cat={c} isDefault onEdit={() => {}} onDelete={() => {}} />)}
          {incomeCustom.map(c => <CategoryCard key={c._id} cat={c} isDefault={false} onEdit={setEditCat} onDelete={setDeleteCat} />)}
        </div>
      </div>

      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add Category" size="sm">
        <CategoryForm onSubmit={handleAdd} loading={formLoading} />
      </Modal>
      <Modal isOpen={!!editCat} onClose={() => setEditCat(null)} title="Edit Category" size="sm">
        {editCat && <CategoryForm onSubmit={handleEdit} defaultValues={editCat} loading={formLoading} />}
      </Modal>
      <ConfirmDialog isOpen={!!deleteCat} onClose={() => setDeleteCat(null)} onConfirm={handleDelete} title="Delete Category" message={`Delete "${deleteCat?.name}"?`} confirmText="Delete" isLoading={deleteLoading} variant="danger" />
    </div>
  )
}
