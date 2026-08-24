import React, { useState, useCallback } from 'react'
import { Plus, TrendingUp, TrendingDown } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import api from '../../services/api'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import TransactionFilters from '../../components/transactions/TransactionFilters'
import TransactionTable from '../../components/transactions/TransactionTable'
import AddTransactionModal from '../../components/transactions/AddTransactionModal'
import EditTransactionModal from '../../components/transactions/EditTransactionModal'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import Pagination from '../../components/common/Pagination'
import { formatCurrency } from '../../utils/formatters'
import { useTransactions } from '../../hooks/useTransactions'

export default function TransactionsPage() {
  const { user } = useAuth()
  const currency = user?.currency || 'INR'
  const [filters, setFilters] = useState({ page: 1, limit: 10 })
  const [addOpen, setAddOpen] = useState(false)
  const [editTx, setEditTx] = useState(null)
  const [deleteTx, setDeleteTx] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const { transactions, pagination, loading, fetchTransactions } = useTransactions(filters)

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  const handleDelete = async () => {
    if (!deleteTx) return
    setDeleteLoading(true)
    try {
      await api.delete(`/transactions/${deleteTx._id}`)
      toast.success('Transaction deleted')
      fetchTransactions()
      setDeleteTx(null)
    } catch (err) {
      toast.error(err.message || 'Failed to delete')
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div className="space-y-5 fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">All Transactions</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage and track all your transactions</p>
        </div>
        <Button onClick={() => setAddOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Add Transaction
        </Button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Income (filtered)</span>
          </div>
          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalIncome, currency)}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-4 h-4 text-red-500" />
            <span className="text-xs font-medium text-red-600 dark:text-red-400">Expenses (filtered)</span>
          </div>
          <p className="text-xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalExpense, currency)}</p>
        </div>
      </div>

      {/* Filters */}
      <TransactionFilters filters={filters} onChange={setFilters} />

      {/* Table */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
        <TransactionTable
          transactions={transactions}
          loading={loading}
          onEdit={setEditTx}
          onDelete={setDeleteTx}
          currency={currency}
        />
        <Pagination
          pagination={pagination}
          onPageChange={(p) => setFilters(f => ({ ...f, page: p }))}
        />
      </div>

      <AddTransactionModal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={() => { setAddOpen(false); fetchTransactions() }}
      />
      <EditTransactionModal
        isOpen={!!editTx}
        onClose={() => setEditTx(null)}
        transaction={editTx}
        onSuccess={() => { setEditTx(null); fetchTransactions() }}
      />
      <ConfirmDialog
        isOpen={!!deleteTx}
        onClose={() => setDeleteTx(null)}
        onConfirm={handleDelete}
        title="Delete Transaction"
        message={`Are you sure you want to delete "${deleteTx?.description}"? This action cannot be undone.`}
        confirmText="Delete"
        isLoading={deleteLoading}
        variant="danger"
      />
    </div>
  )
}
