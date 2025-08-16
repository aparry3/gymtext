"use client";
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

export type Toast = { id: number; message: string; type?: 'success' | 'error' | 'info' };

type ToastContextType = {
  showToast: (message: string, type?: Toast['type']) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Date.now() + Math.floor(Math.random() * 1000);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div style={{ position: 'fixed', right: 16, bottom: 16, display: 'grid', gap: 8, zIndex: 1000 }}>
        {toasts.map((t) => (
          <div key={t.id} style={{
            background: t.type === 'error' ? '#fee2e2' : t.type === 'success' ? '#dcfce7' : '#f3f4f6',
            color: '#111827',
            border: '1px solid #e5e7eb',
            borderLeft: `4px solid ${t.type === 'error' ? '#ef4444' : t.type === 'success' ? '#10b981' : '#6b7280'}`,
            padding: 12,
            borderRadius: 6,
            minWidth: 260,
            boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
          }}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
