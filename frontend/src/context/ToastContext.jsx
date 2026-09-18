import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

const ToastContext = createContext(null);

let toastIdCounter = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type = 'info', title, message, duration = 4000 }) => {
      const id = ++toastIdCounter;
      const newToast = { id, type, title, message, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast]
  );

  const toast = {
    success: (message, title = 'Success') =>
      addToast({ type: 'success', title, message }),
    error: (message, title = 'Error') =>
      addToast({ type: 'error', title, message: message || 'An unexpected error occurred.' }),
    info: (message, title = 'Notice') =>
      addToast({ type: 'info', title, message }),
    warning: (message, title = 'Warning') =>
      addToast({ type: 'warning', title, message }),
    dismiss: (id) => removeToast(id),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Floating Toast Notification Stack (Bottom Right) */}
      <div
        aria-live="polite"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onDismiss }) => {
  const { type, title, message } = toast;

  const config = {
    success: {
      icon: CheckCircle2,
      iconColor: 'text-emerald-500 dark:text-emerald-400',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/50',
      border: 'border-emerald-200 dark:border-emerald-800/60',
      accentGlow: 'shadow-emerald-500/10',
    },
    error: {
      icon: AlertCircle,
      iconColor: 'text-rose-500 dark:text-rose-400',
      iconBg: 'bg-rose-50 dark:bg-rose-950/50',
      border: 'border-rose-200 dark:border-rose-800/60',
      accentGlow: 'shadow-rose-500/10',
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-amber-500 dark:text-amber-400',
      iconBg: 'bg-amber-50 dark:bg-amber-950/50',
      border: 'border-amber-200 dark:border-amber-800/60',
      accentGlow: 'shadow-amber-500/10',
    },
    info: {
      icon: Info,
      iconColor: 'text-indigo-500 dark:text-indigo-400',
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/50',
      border: 'border-indigo-200 dark:border-indigo-800/60',
      accentGlow: 'shadow-indigo-500/10',
    },
  }[type] || {
    icon: Info,
    iconColor: 'text-indigo-500',
    iconBg: 'bg-indigo-50',
    border: 'border-slate-200',
    accentGlow: '',
  };

  const Icon = config.icon;

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-md border ${config.border} shadow-xl ${config.accentGlow} text-slate-900 dark:text-slate-100 transition-all animate-in slide-in-from-bottom-5 fade-in duration-200`}
    >
      <div className={`p-1.5 rounded-xl ${config.iconBg} ${config.iconColor} flex-shrink-0 mt-0.5`}>
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0 pr-1">
        {title && (
          <h4 className="text-xs font-bold leading-tight mb-0.5 text-slate-900 dark:text-white">
            {title}
          </h4>
        )}
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed break-words">
          {message}
        </p>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors flex-shrink-0"
        aria-label="Close notification"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
