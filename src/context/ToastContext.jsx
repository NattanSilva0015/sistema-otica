import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'

// ─── Tipos de toast ──────────────────────────────────────────────────────────

const ICONS = {
  success: CheckCircle2,
  error:   XCircle,
  warning: AlertTriangle,
  info:    Info,
}

const STYLES = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error:   'bg-red-50   border-red-200   text-red-800',
  warning: 'bg-amber-50  border-amber-200  text-amber-800',
  info:    'bg-indigo-50 border-indigo-200 text-indigo-800',
}

const ICON_STYLES = {
  success: 'text-emerald-500',
  error:   'text-red-500',
  warning: 'text-amber-500',
  info:    'text-indigo-500',
}

// ─── Componente individual ───────────────────────────────────────────────────

function Toast({ id, type = 'info', title, message, onRemove }) {
  const Icon = ICONS[type]
  const timerRef = useRef(null)

  // Auto-dismiss em 4 s (erros ficam 6 s)
  const duration = type === 'error' ? 6000 : 4000

  useEffect(() => {
    timerRef.current = setTimeout(() => onRemove(id), duration)
    return () => clearTimeout(timerRef.current)
  }, [id, duration, onRemove])

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`
        flex items-start gap-3 w-80 px-4 py-3 rounded-xl border shadow-lg
        animate-in fade-in slide-in-from-right-4 duration-200
        ${STYLES[type]}
      `}
    >
      <Icon size={18} className={`shrink-0 mt-0.5 ${ICON_STYLES[type]}`} aria-hidden="true" />

      <div className="flex-1 min-w-0">
        {title && <p className="text-sm font-semibold leading-tight mb-0.5">{title}</p>}
        {message && <p className="text-xs leading-relaxed opacity-90">{message}</p>}
      </div>

      <button
        type="button"
        onClick={() => onRemove(id)}
        aria-label="Fechar notificação"
        className="shrink-0 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X size={15} />
      </button>
    </div>
  )
}

// ─── Context ─────────────────────────────────────────────────────────────────

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const add = useCallback(({ type = 'info', title, message }) => {
    const id = `toast-${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev, { id, type, title, message }])
  }, [])

  // Atalhos semânticos
  const toast = {
    success: (title, message) => add({ type: 'success', title, message }),
    error:   (title, message) => add({ type: 'error',   title, message }),
    warning: (title, message) => add({ type: 'warning', title, message }),
    info:    (title, message) => add({ type: 'info',    title, message }),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Container fixo no canto inferior direito */}
      {toasts.length > 0 && (
        <div
          aria-label="Notificações"
          className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 items-end"
        >
          {toasts.map((t) => (
            <Toast key={t.id} {...t} onRemove={remove} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast deve ser usado dentro de ToastProvider')
  return ctx
}
