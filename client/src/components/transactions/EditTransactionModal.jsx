import React, { useState } from 'react'
import Modal from '../common/Modal'
import TransactionForm from './TransactionForm'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function EditTransactionModal({ isOpen, onClose, transaction, onSuccess }) {
  const [loading, setLoading] = useState(false)

  if (!transaction) return null

  const handleSubmit = async (data) => {
    setLoading(true)
    try {
      await api.patch(`/transactions/${transaction._id}`, data)
      toast.success('Transaction updated successfully!')
      onSuccess?.()
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to update transaction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Transaction" size="md">
      <TransactionForm
        onSubmit={handleSubmit}
        loading={loading}
        defaultValues={transaction}
      />
    </Modal>
  )
}
