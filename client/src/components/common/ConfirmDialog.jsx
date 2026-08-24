import React from 'react'
import Modal from './Modal'
import Button from './Button'
import { AlertTriangle, Info } from 'lucide-react'

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false,
  variant = 'danger',
}) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" title={null} showClose={false}>
      <div className="flex flex-col items-center text-center gap-4 py-2">
        <div className={`p-4 rounded-full ${variant === 'danger' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
          {variant === 'danger' ? (
            <AlertTriangle className="w-8 h-8 text-red-500" />
          ) : (
            <Info className="w-8 h-8 text-amber-500" />
          )}
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">{title}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
        </div>
        <div className="flex gap-3 w-full">
          <Button variant="outline" onClick={onClose} fullWidth disabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            variant={variant === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={isLoading}
            fullWidth
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
