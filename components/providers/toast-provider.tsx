'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
  id: string
  type: ToastType
  title: string
  message?: string
}

interface ToastContextType {
  toast: (type: ToastType, title: string, message?: string) => void
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  warning: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (type: ToastType, title: string, message?: string) => {
      const id = Math.random().toString(36).substring(2, 9)
      setToasts((prev) => [...prev, { id, type, title, message }])

      // Auto remove after 5 seconds
      setTimeout(() => removeToast(id), 5000)
    },
    [removeToast]
  )

  const success = useCallback(
    (title: string, message?: string) => toast('success', title, message),
    [toast]
  )
  const error = useCallback(
    (title: string, message?: string) => toast('error', title, message),
    [toast]
  )
  const warning = useCallback(
    (title: string, message?: string) => toast('warning', title, message),
    [toast]
  )
  const info = useCallback(
    (title: string, message?: string) => toast('info', title, message),
    [toast]
  )

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
    info: Info,
  }

  const colors = {
    success: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500',
    error: 'bg-red-500/10 border-red-500/20 text-red-500',
    warning: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
    info: 'bg-blue-500/10 border-blue-500/20 text-blue-500',
  }

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
        <AnimatePresence mode="popLayout">
          {toasts.map((t) => {
            const Icon = icons[t.type]
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 100, scale: 0.95 }}
                layout
                className={`flex items-start gap-3 rounded-lg border p-4 shadow-lg backdrop-blur-sm ${colors[t.type]} min-w-[300px] max-w-[400px]`}
              >
                <Icon className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{t.title}</p>
                  {t.message && (
                    <p className="text-sm opacity-90 mt-1">{t.message}</p>
                  )}
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
