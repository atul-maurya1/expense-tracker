import {
  ShoppingCart, Utensils, Car, Home, Zap, Heart, GraduationCap,
  Plane, Gamepad2, Shirt, Dumbbell, Baby, PawPrint, Wrench,
  Gift, Coffee, Music, BookOpen, Laptop, TrendingUp, Briefcase,
  Building2, Coins, Trophy, Repeat, DollarSign, Wallet,
} from 'lucide-react'

export const EXPENSE_CATEGORIES = [
  { name: 'Food & Dining', icon: 'Utensils', color: '#f59e0b' },
  { name: 'Shopping', icon: 'ShoppingCart', color: '#6366f1' },
  { name: 'Transportation', icon: 'Car', color: '#3b82f6' },
  { name: 'Housing', icon: 'Home', color: '#8b5cf6' },
  { name: 'Utilities', icon: 'Zap', color: '#14b8a6' },
  { name: 'Healthcare', icon: 'Heart', color: '#ef4444' },
  { name: 'Education', icon: 'GraduationCap', color: '#0ea5e9' },
  { name: 'Travel', icon: 'Plane', color: '#f97316' },
  { name: 'Entertainment', icon: 'Gamepad2', color: '#ec4899' },
  { name: 'Clothing', icon: 'Shirt', color: '#a855f7' },
  { name: 'Fitness', icon: 'Dumbbell', color: '#10b981' },
  { name: 'Kids', icon: 'Baby', color: '#fb923c' },
  { name: 'Pets', icon: 'PawPrint', color: '#84cc16' },
  { name: 'Maintenance', icon: 'Wrench', color: '#64748b' },
  { name: 'Gifts', icon: 'Gift', color: '#f43f5e' },
  { name: 'Coffee & Tea', icon: 'Coffee', color: '#92400e' },
  { name: 'Subscriptions', icon: 'Repeat', color: '#6366f1' },
  { name: 'Other', icon: 'DollarSign', color: '#94a3b8' },
]

export const INCOME_CATEGORIES = [
  { name: 'Salary', icon: 'Briefcase', color: '#10b981' },
  { name: 'Freelance', icon: 'Laptop', color: '#6366f1' },
  { name: 'Business', icon: 'Building2', color: '#3b82f6' },
  { name: 'Investments', icon: 'TrendingUp', color: '#f59e0b' },
  { name: 'Rental', icon: 'Home', color: '#8b5cf6' },
  { name: 'Gifts Received', icon: 'Gift', color: '#ec4899' },
  { name: 'Bonus', icon: 'Trophy', color: '#f97316' },
  { name: 'Dividends', icon: 'Coins', color: '#14b8a6' },
  { name: 'Other Income', icon: 'Wallet', color: '#94a3b8' },
]

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES]

export const CATEGORY_ICONS = {
  ShoppingCart, Utensils, Car, Home, Zap, Heart, GraduationCap,
  Plane, Gamepad2, Shirt, Dumbbell, Baby, PawPrint, Wrench,
  Gift, Coffee, Music, BookOpen, Laptop, TrendingUp, Briefcase,
  Building2, Coins, Trophy, Repeat, DollarSign, Wallet,
}

export const CHART_COLORS = [
  '#6366f1', '#10b981', '#f59e0b', '#ef4444',
  '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6',
  '#f97316', '#84cc16', '#0ea5e9', '#f43f5e',
]

export function getCategoryColor(name) {
  const cat = ALL_CATEGORIES.find(c => c.name === name)
  return cat?.color || '#94a3b8'
}

export function getCategoryIcon(name) {
  const cat = ALL_CATEGORIES.find(c => c.name === name)
  return cat ? CATEGORY_ICONS[cat.icon] : DollarSign
}
