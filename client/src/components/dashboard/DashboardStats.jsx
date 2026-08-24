import React from 'react'
import { Wallet, TrendingUp, TrendingDown, Calendar } from 'lucide-react'
import StatCard from '../common/StatCard'

export default function DashboardStats({ data, loading, currency = 'INR' }) {
  const totalBalance = data?.totalBalance ?? 0
  const totalIncome = data?.totalIncome ?? 0
  const totalExpenses = data?.totalExpenses ?? 0
  const monthlyIncome = data?.monthlyIncome ?? 0
  const monthlyExpenses = data?.monthlyExpenses ?? 0
  const previousMonthIncome = data?.previousMonthIncome ?? 0
  const previousMonthExpenses = data?.previousMonthExpenses ?? 0

  // Calculate changes vs previous month
  const incomeChange = previousMonthIncome > 0 
    ? ((monthlyIncome - previousMonthIncome) / previousMonthIncome) * 100 
    : undefined

  const expenseChange = previousMonthExpenses > 0 
    ? ((monthlyExpenses - previousMonthExpenses) / previousMonthExpenses) * 100 
    : undefined

  const currentMonthBalance = monthlyIncome - monthlyExpenses
  const previousMonthBalance = previousMonthIncome - previousMonthExpenses
  const balanceChange = previousMonthBalance !== 0 
    ? ((currentMonthBalance - previousMonthBalance) / Math.abs(previousMonthBalance)) * 100 
    : undefined
  
  const monthChange = previousMonthExpenses > 0 
    ? ((monthlyExpenses - previousMonthExpenses) / previousMonthExpenses) * 100 
    : undefined

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <StatCard
        label="Total Balance"
        amount={totalBalance}
        icon={Wallet}
        iconBg="bg-primary-100 dark:bg-primary-900/30"
        iconColor="text-primary-500"
        change={balanceChange}
        currency={currency}
        loading={loading}
      />
      <StatCard
        label="Total Income"
        amount={totalIncome}
        icon={TrendingUp}
        iconBg="bg-emerald-100 dark:bg-emerald-900/30"
        iconColor="text-emerald-500"
        change={incomeChange}
        currency={currency}
        loading={loading}
      />
      <StatCard
        label="Total Expenses"
        amount={totalExpenses}
        icon={TrendingDown}
        iconBg="bg-red-100 dark:bg-red-900/30"
        iconColor="text-red-500"
        change={expenseChange}
        isPositiveGood={false}
        currency={currency}
        loading={loading}
      />
      <StatCard
        label="This Month"
        amount={monthlyExpenses}
        icon={Calendar}
        iconBg="bg-amber-100 dark:bg-amber-900/30"
        iconColor="text-amber-500"
        change={monthChange}
        isPositiveGood={false}
        currency={currency}
        loading={loading}
      />
    </div>
  )
}
