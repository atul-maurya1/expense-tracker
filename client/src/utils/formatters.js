import { format, parseISO, isValid } from 'date-fns'

export function formatCurrency(amount, currency = 'INR') {
  const num = parseFloat(amount) || 0
  const localeMap = { INR: 'en-IN', USD: 'en-US', EUR: 'de-DE', GBP: 'en-GB' }
  const locale = localeMap[currency] || 'en-IN'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}

export function formatDate(date, fmt = 'MMM dd, yyyy') {
  if (!date) return ''
  try {
    const d = typeof date === 'string' ? parseISO(date) : new Date(date)
    if (!isValid(d)) return ''
    return format(d, fmt)
  } catch {
    return ''
  }
}

export function formatPercentage(value, decimals = 1) {
  return `${parseFloat(value || 0).toFixed(decimals)}%`
}

export function getPercentageChange(current, previous) {
  if (!previous || previous === 0) return { value: 0, isPositive: true }
  const value = ((current - previous) / Math.abs(previous)) * 100
  return { value: Math.abs(value).toFixed(1), isPositive: value >= 0 }
}

export function formatFileSize(bytes) {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  let size = bytes
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024
    i++
  }
  return `${size.toFixed(1)} ${units[i]}`
}

export function formatCompact(amount) {
  const num = parseFloat(amount) || 0
  if (num >= 1e7) return `${(num / 1e7).toFixed(1)}Cr`
  if (num >= 1e5) return `${(num / 1e5).toFixed(1)}L`
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`
  return num.toFixed(0)
}
