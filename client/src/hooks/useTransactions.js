import { useState, useEffect, useCallback } from 'react'
import api from '../services/api'

export function useTransactions(filters = {}) {
  const [transactions, setTransactions] = useState([])
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const filterKey = JSON.stringify(filters)

  const fetchTransactions = useCallback(async (params = {}) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.get('/transactions', { params: { ...filters, ...params } })
      const data = response.data.data || response.data
      setTransactions(data.transactions || data || [])
      if (data.pagination) setPagination(data.pagination)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey])

  useEffect(() => { fetchTransactions() }, [fetchTransactions])

  const createTransaction = async (data) => {
    const response = await api.post('/transactions', data)
    await fetchTransactions()
    return response.data
  }

  const updateTransaction = async (id, data) => {
    const response = await api.patch(`/transactions/${id}`, data)
    await fetchTransactions()
    return response.data
  }

  const deleteTransaction = async (id) => {
    await api.delete(`/transactions/${id}`)
    await fetchTransactions()
  }

  return { transactions, pagination, loading, error, fetchTransactions, createTransaction, updateTransaction, deleteTransaction }
}

export default useTransactions
