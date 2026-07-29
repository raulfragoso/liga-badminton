import { SelectHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/styles';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string | number; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, id, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label htmlFor={id} className="block text-xs font-semibold text-slate-300 ml-1">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={id}
            ref={ref}
            className={cn(
              'w-full bg-slate-900/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-white text-sm transition-all outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 hover:border-slate-600',
              error && 'border-rose-500/50 focus:ring-rose-500/50 focus:border-rose-500/50',
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-slate-900 text-white">
                {opt.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
        {error && (
          <p className="text-xs text-rose-400 font-medium ml-1 animate-slideUp">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
