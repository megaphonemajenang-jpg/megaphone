import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastProps) {
  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onRemove={() => onRemove(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onRemove }: { toast: ToastMessage; onRemove: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onRemove, 5000);
    return () => clearTimeout(timer);
  }, [onRemove]);

  const bgStyles = {
    success: 'bg-emerald-900/90 border-emerald-700 text-emerald-100',
    error: 'bg-rose-900/90 border-rose-700 text-rose-100',
    info: 'bg-sky-900/90 border-sky-700 text-sky-100',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />,
    info: <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`pointer-events-auto p-4 rounded-xl shadow-xl border backdrop-blur-md flex items-start gap-3 ${bgStyles[toast.type]}`}
    >
      {icons[toast.type]}
      <div className="flex-1">
        <h4 className="font-bold text-sm leading-tight">{toast.title}</h4>
        <p className="text-xs opacity-90 mt-1 leading-relaxed">{toast.message}</p>
      </div>
      <button
        onClick={onRemove}
        className="text-white/60 hover:text-white transition-colors p-1 cursor-pointer"
        aria-label="Tutup notifikasi"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

export function Toast({
  message,
  type = 'info',
  onClose,
}: {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4500);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgStyles = {
    success: 'bg-emerald-900/95 border-emerald-700 text-emerald-100',
    error: 'bg-rose-900/95 border-rose-700 text-rose-100',
    warning: 'bg-amber-900/95 border-amber-700 text-amber-100',
    info: 'bg-stone-900/95 border-stone-700 text-stone-100',
  };

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />,
    info: <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />,
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm pointer-events-auto animate-in fade-in slide-in-from-bottom-2">
      <div
        className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-md flex items-start gap-3 ${
          bgStyles[type] || bgStyles.info
        }`}
      >
        {icons[type] || icons.info}
        <div className="flex-1 text-xs">
          <p className="font-bold leading-relaxed">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white transition-colors p-1 cursor-pointer"
          aria-label="Tutup notifikasi"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

