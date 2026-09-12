import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import React, { forwardRef } from 'react';

export const Button = forwardRef<HTMLButtonElement, any>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, asChild, children, ...props }, ref) => {
    const variants: Record<string, string> = {
      primary: 'bg-gold-500 text-midnight-950 hover:bg-gold-400 font-semibold',
      secondary: 'bg-midnight-800 text-zinc-100 hover:bg-midnight-700',
      ghost: 'bg-transparent text-zinc-400 hover:bg-midnight-800 hover:text-zinc-100',
      outline: 'border border-white/10 bg-transparent text-zinc-100 hover:bg-midnight-800',
      danger: 'bg-rose-500/10 text-rose-300 border border-rose-500/20 hover:bg-rose-500/20',
    };

    const sizes: Record<string, string> = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm',
      lg: 'px-5 py-2.5 text-sm',
    };

    const classes = cn(
      'inline-flex items-center justify-center gap-2 rounded-md transition-all duration-150',
      'disabled:opacity-40 disabled:cursor-not-allowed',
      'focus:outline-none focus:ring-2 focus:ring-gold-500/20',
      variants[variant],
      sizes[size],
      className
    );

    if (loading) {
      return (
        <button ref={ref} disabled className={classes} {...props}>
          <Loader2 className="h-4 w-4 animate-spin" />
          {children}
        </button>
      );
    }

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        className: cn(classes, (children as any).props.className),
      });
    }

    return (
      <button ref={ref} disabled={disabled} className={classes} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
