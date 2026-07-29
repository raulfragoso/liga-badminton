import { CheckCircle2, AlertTriangle } from 'lucide-react';

interface ToastProps {
  message: {
    type: 'success' | 'error' | 'warning' | string;
    title: string;
    desc: string;
  } | null;
}

export function Toast({ message }: ToastProps) {
  if (!message) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md bg-slate-900 border border-orange-500/40 text-slate-100 p-4 rounded-2xl shadow-2xl backdrop-blur-xl flex items-start gap-3 animate-bounce">
      {message.type === 'success' ? (
        <CheckCircle2 className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
      ) : (
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
      )}
      <div>
        <h4 className="font-bold text-sm text-white">{message.title}</h4>
        <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{message.desc}</p>
      </div>
    </div>
  );
}
