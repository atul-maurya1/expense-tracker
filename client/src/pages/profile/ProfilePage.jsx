import React from 'react'
import { Link } from 'react-router-dom'
import { Settings, Mail, Calendar, ArrowLeftRight, User } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { formatDate } from '../../utils/formatters'
import Button from '../../components/common/Button'

export default function ProfilePage() {
  const { user } = useAuth()

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  return (
    <div className="space-y-5 fade-in max-w-2xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Profile</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Your account information</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {initials}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800 flex items-center justify-center">
              <User className="w-3 h-3 text-white" />
            </div>
          </div>
          {/* Info */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{user?.name || 'User'}</h3>
            <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 mt-1">
              <Mail className="w-4 h-4" />
              <span className="text-sm">{user?.email || ''}</span>
            </div>
            {user?.createdAt && (
              <div className="flex items-center gap-1.5 text-slate-400 mt-0.5">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">Joined {formatDate(user.createdAt, 'MMMM yyyy')}</span>
              </div>
            )}
          </div>
          <Link to="/settings">
            <Button variant="outline" size="sm" leftIcon={<Settings className="w-4 h-4" />}>
              Edit Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: 'Currency', value: user?.currency || 'INR', icon: '₹' },
          { label: 'Account Status', value: 'Active', icon: '✓' },
        ].map(({ label, value, icon }) => (
          <div key={label} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4">
            <p className="text-xs text-slate-400 dark:text-slate-500 mb-1">{label}</p>
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              {icon} {value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Links */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
        <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-3">Quick Links</h3>
        <div className="space-y-2">
          {[
            { to: '/settings', label: 'Account Settings', icon: Settings },
            { to: '/transactions', label: 'View Transactions', icon: ArrowLeftRight },
          ].map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                <Icon className="w-4 h-4 text-primary-500" />
              </div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
