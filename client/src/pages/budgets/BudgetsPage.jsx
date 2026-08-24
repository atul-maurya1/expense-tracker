import React, { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import Modal from '../../components/common/Modal'
import BudgetCard from '../../components/budgets/BudgetCard'
import BudgetForm from '../../components/budgets/BudgetForm'
import BudgetSummary from '../../components/budgets/BudgetSummary'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import EmptyState from '../../components/common/EmptyState'
import { SkeletonCard } from '../../components/common/Skeleton'
import Select from '../../components/common/Select'
import { MONTHS } from '../../constants'
import { Target } from 'lucide-react'

const now = new Date()
const YEAR_OPTIONS = Array.from({ length: 5 }, (_, i) => now.getFullYear() - 2 + i).map(y => ({ value: y, label: String(y) }))
const MONTH_OPTIONS = MONTHS.map((m, i) => ({ value: i + 1, label: m }))

export default function BudgetsPage() {
  const { user } = useAuth()
  const currency = user?.currency || 'INR'
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [budgets, setBudgets] = useState([])
  const [loading, setLoading] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [editBudget, setEditBudget] = useState(null)
  const [deleteBudget, setDeleteBudget] = useState(null)
  const [formLoading, setFormLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchBudgets = async () => {
    setLoading(true)
    try {
      const res = await api.get('/budgets', { params: { month, year } })
      setBudgets(res.data.data?.budgets || res.data.data || res.data || [])
    } catch (err) {
      toast.error('Failed to load budgets')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBudgets() }, [month, year])

  const handleAdd = async (data) => {
    setFormLoading(true)
    try {
      await api.post('/budgets', data)
      toast.success('Budget created!')
      fetchBudgets()
      setAddOpen(false)
    } catch (err) {
      toast.error(err.message || 'Failed to create budget')
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = async (data) => {
    setFormLoading(true)
    try {
      await api.patch(`/budgets/${editBudget._id}`, data)
      toast.success('Budget updated!')
      fetchBudgets()
      setEditBudget(null)
    } catch (err) {
      toast.error(err.message || 'Failed to update budget')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await api.delete(`/budgets/${deleteBudget._id}`)
      toast.success('Budget deleted')
      fetchBudgets()
      setDeleteBudget(null)
    } catch (err) {
      toast.error(err.message || 'Failed to delete')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Budgets</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Set and track your spending limits</p>
        </div>
        <div className="flex items-center gap-2">
          <Select options={MONTH_OPTIONS} value={month} onChange={e => setMonth(Number(e.target.value))} className="w-32" />
          <Select options={YEAR_OPTIONS} value={year} onChange={e => setYear(Number(e.target.value))} className="w-20" />
          <Button onClick={() => setAddOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
            Add Budget
          </Button>
        </div>
      </div>

      {/* Summary */}
      {!loading && budgets.length > 0 && (
        <BudgetSummary budgets={budgets} currency={currency} />
      )}

      {/* Budget Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : budgets.length === 0 ? (
        <EmptyState
          icon={Target}
          title="No budgets set"
          description={`No budgets for ${MONTHS[month - 1]} ${year}. Create one to start tracking.`}
          action={() => setAddOpen(true)}
          actionLabel="Set Budget"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map(b => (
            <BudgetCard
              key={b._id}
              budget={b}
              onEdit={setEditBudget}
              onDelete={setDeleteBudget}
              currency={currency}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Set Budget" size="sm">
        <BudgetForm onSubmit={handleAdd} loading={formLoading} defaultValues={{ month, year }} />
      </Modal>
      <Modal isOpen={!!editBudget} onClose={() => setEditBudget(null)} title="Edit Budget" size="sm">
        {editBudget && <BudgetForm onSubmit={handleEdit} loading={formLoading} defaultValues={editBudget} />}
      </Modal>
      <ConfirmDialog
        isOpen={!!deleteBudget}
        onClose={() => setDeleteBudget(null)}
        onConfirm={handleDelete}
        title="Delete Budget"
        message={`Delete budget for "${deleteBudget?.category}"?`}
        confirmText="Delete"
        isLoading={deleteLoading}
        variant="danger"
      />
    </div>
  )
}
