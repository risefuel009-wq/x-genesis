import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary: 'bg-gold-500 text-midnight-950 hover:bg-gold-400 font-semibold',
  secondary: 'bg-midnight-800 text-zinc-100 hover:bg-midnight-700',
  ghost: 'bg-transparent text-zinc-400 hover:bg-midnight-800 hover:text-zinc-100',
  outline: 'border border-white/10 bg-transparent text-zinc-100 hover:bg-midnight-800',
  danger: 'bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20',
};

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-sm',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-md transition-all duration-150',
          'disabled:opacity-40 disabled:cursor-not-allowed',
          'focus:outline-none focus:ring-2 focus:ring-gold-500/20',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
