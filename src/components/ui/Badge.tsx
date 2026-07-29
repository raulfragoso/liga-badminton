import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/styles';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'primary', children, ...props }, ref) => {
    
    const variants = {
      primary: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
      secondary: 'bg-slate-800 text-slate-300 border border-slate-700',
      success: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      danger: 'bg-rose-500/20 text-rose-400 border border-rose-500/30',
      warning: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
      info: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    };

    return (
      <span
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider',
          variants[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
