import React, { useState } from 'react'
import Modal from '../common/Modal'
import TransactionForm from './TransactionForm'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function AddTransactionModal({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (data) => {
    setLoading(true)
    try {
      await api.post('/transactions', data)
      toast.success('Transaction added successfully!')
      onSuccess?.()
      onClose()
    } catch (err) {
      toast.error(err.message || 'Failed to add transaction')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Transaction" size="md">
      <TransactionForm onSubmit={handleSubmit} loading={loading} />
    </Modal>
  )
}
