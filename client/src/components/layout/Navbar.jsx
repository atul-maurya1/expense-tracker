import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Menu, Bell, Plus, Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import Button from '../common/Button'
import { useAuth } from '../../hooks/useAuth'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/transactions': 'Transactions',
  '/budgets': 'Budgets',
  '/analytics': 'Analytics',
  '/categories': 'Categories',
  '/reports': 'Reports',
  '/settings': 'Settings',
  '/profile': 'Profile',
}

export default function Navbar({ onMenuClick, onAddTransaction }) {
  const { pathname } = useLocation()
  const { theme, setTheme, isDark } = useTheme()
  const { user } = useAuth()
  const navigate = useNavigate()

  const title = PAGE_TITLES[pathname] || 'FinTrack'

  const cycleTheme = () => {
    const themes = ['light', 'dark', 'system']
    const idx = themes.indexOf(theme)
    setTheme(themes[(idx + 1) % themes.length])
  }

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'light' ? Sun : Monitor

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center px-4 gap-3">
      {/* Hamburger */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Page Title */}
      <div className="flex-1">
        <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">{title}</h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={cycleTheme}
          title={`Theme: ${theme}`}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
        >
          <ThemeIcon className="w-5 h-5" />
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Add Transaction */}
        <Button
          size="sm"
          onClick={onAddTransaction}
          leftIcon={<Plus className="w-4 h-4" />}
          className="hidden sm:inline-flex"
        >
          Add
        </Button>

        {/* Avatar */}
        <button
          onClick={() => navigate('/profile')}
          className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold hover:opacity-90 transition-opacity shrink-0"
        >
          {initials}
        </button>
      </div>
    </header>
  )
}
