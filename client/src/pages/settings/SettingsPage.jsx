import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Shield, Palette, AlertTriangle, Sun, Moon, Monitor, LogOut } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../context/ThemeContext'
import api from '../../services/api'
import toast from 'react-hot-toast'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import ConfirmDialog from '../../components/common/ConfirmDialog'
import { CURRENCIES } from '../../constants'
import { useNavigate } from 'react-router-dom'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email(),
  currency: z.string().min(1),
})

const pwSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string().min(8, 'At least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })

const TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'account', label: 'Account', icon: AlertTriangle },
]

export default function SettingsPage() {
  const { user, logout, refreshUser } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('profile')
  const [profileLoading, setProfileLoading] = useState(false)
  const [pwLoading, setPwLoading] = useState(false)
  const [logoutOpen, setLogoutOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '', email: user?.email || '', currency: user?.currency || 'INR' },
  })

  const pwForm = useForm({ resolver: zodResolver(pwSchema) })

  const handleProfileSave = async (data) => {
    setProfileLoading(true)
    try {
      await api.patch('/users/profile', data)
      await refreshUser()
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err.message || 'Failed to update profile')
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePwChange = async (data) => {
    setPwLoading(true)
    try {
      await api.patch('/users/change-password', { currentPassword: data.currentPassword, newPassword: data.newPassword })
      toast.success('Password changed!')
      pwForm.reset()
    } catch (err) {
      toast.error(err.message || 'Failed to change password')
    } finally {
      setPwLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/login')
    toast.success('Logged out')
  }

  const currencyOptions = CURRENCIES.map(c => ({ value: c.code, label: `${c.symbol} ${c.name}` }))

  return (
    <div className="space-y-5 fade-in max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Settings</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Manage your account preferences</p>
      </div>

      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={[
              'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all',
              activeTab === id
                ? 'bg-white dark:bg-slate-700 text-primary-500 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300',
            ].join(' ')}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6">
        {activeTab === 'profile' && (
          <form onSubmit={profileForm.handleSubmit(handleProfileSave)} className="space-y-4">
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-4">Profile Information</h3>
            <Input label="Full Name" required {...profileForm.register('name')} error={profileForm.formState.errors.name?.message} />
            <Input label="Email" type="email" required {...profileForm.register('email')} error={profileForm.formState.errors.email?.message} />
            <Select label="Currency" options={currencyOptions} {...profileForm.register('currency')} error={profileForm.formState.errors.currency?.message} />
            <Button type="submit" loading={profileLoading}>Save Changes</Button>
          </form>
        )}

        {activeTab === 'security' && (
          <form onSubmit={pwForm.handleSubmit(handlePwChange)} className="space-y-4">
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-4">Change Password</h3>
            <Input label="Current Password" type="password" required {...pwForm.register('currentPassword')} error={pwForm.formState.errors.currentPassword?.message} />
            <Input label="New Password" type="password" required {...pwForm.register('newPassword')} error={pwForm.formState.errors.newPassword?.message} />
            <Input label="Confirm New Password" type="password" required {...pwForm.register('confirmPassword')} error={pwForm.formState.errors.confirmPassword?.message} />
            <Button type="submit" loading={pwLoading}>Change Password</Button>
          </form>
        )}

        {activeTab === 'appearance' && (
          <div>
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-4">Theme</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'light', label: 'Light', icon: Sun, preview: 'bg-white border-slate-200' },
                { value: 'dark', label: 'Dark', icon: Moon, preview: 'bg-slate-900 border-slate-700' },
                { value: 'system', label: 'System', icon: Monitor, preview: 'bg-gradient-to-br from-white to-slate-900 border-slate-400' },
              ].map(({ value, label, icon: Icon, preview }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  className={[
                    'flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all',
                    theme === value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300',
                  ].join(' ')}
                >
                  <div className={`w-16 h-10 rounded-lg border ${preview}`} />
                  <div className="flex items-center gap-1.5">
                    <Icon className={`w-4 h-4 ${theme === value ? 'text-primary-500' : 'text-slate-400'}`} />
                    <span className={`text-sm font-medium ${theme === value ? 'text-primary-500' : 'text-slate-600 dark:text-slate-400'}`}>{label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'account' && (
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-700 dark:text-slate-300 mb-4">Account Actions</h3>
            <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl">
              <p className="font-medium text-slate-700 dark:text-slate-300 mb-1">Sign Out</p>
              <p className="text-sm text-slate-400 mb-3">Sign out from your account on this device</p>
              <Button variant="outline" onClick={() => setLogoutOpen(true)} leftIcon={<LogOut className="w-4 h-4" />}>
                Sign Out
              </Button>
            </div>
            <div className="p-4 border border-red-200 dark:border-red-800 rounded-xl bg-red-50 dark:bg-red-900/10">
              <p className="font-medium text-red-600 dark:text-red-400 mb-1">Delete Account</p>
              <p className="text-sm text-slate-400 mb-3">Permanently delete your account and all data. This cannot be undone.</p>
              <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>Delete Account</Button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        confirmText="Sign Out"
        variant="warning"
      />
      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={async () => {
          try {
            await api.delete('/users/account')
            await logout()
            navigate('/login')
          } catch (err) {
            toast.error(err.message || 'Failed to delete account')
          }
        }}
        title="Delete Account"
        message="This will permanently delete your account and ALL your data. This action cannot be undone!"
        confirmText="Delete Account"
        variant="danger"
      />
    </div>
  )
}
