import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/styles';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, rightIcon, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label htmlFor={id} className="block text-xs font-semibold text-slate-300 ml-1">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
              {leftIcon}
            </div>
          )}
          <input
            id={id}
            ref={ref}
            className={cn(
              'w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-sm transition-all outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 hover:border-slate-600',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              error && 'border-rose-500/50 focus:ring-rose-500/50 focus:border-rose-500/50',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-rose-400 font-medium ml-1 animate-slideUp">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
