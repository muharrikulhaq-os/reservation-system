'use client'

import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib'

// ─────────────────────────────────────────
// BUTTON VARIANTS & SIZES
// ─────────────────────────────────────────

const variants = {
  primary:   [
    'bg-[var(--primary)] text-white',
    'hover:bg-[var(--primary-dark)]',
    'disabled:bg-[var(--border-card)] disabled:text-[var(--text-disabled)]',
    'shadow-sm hover:shadow-[0_2px_8px_rgba(45,44,232,0.25)]',
  ],
  secondary: [
    'bg-[var(--bg-card)] text-[var(--text-primary)]',
    'border border-[var(--border-input)]',
    'hover:bg-[var(--bg-page)]',
    'disabled:text-[var(--text-disabled)]',
  ],
  ghost: [
    'bg-transparent text-[var(--text-secondary)]',
    'hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]',
    'disabled:text-[var(--text-disabled)]',
  ],
  danger: [
    'bg-[var(--danger)] text-white',
    'hover:bg-red-700',
    'disabled:bg-[var(--border-card)] disabled:text-[var(--text-disabled)]',
  ],
  link: [
    'bg-transparent text-[var(--primary)] underline-offset-4',
    'hover:underline',
    'disabled:text-[var(--text-disabled)]',
    'p-0 h-auto',
  ],
} as const

const sizes = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-6 text-sm gap-2',
  icon: 'h-10 w-10 p-0',
  'icon-sm': 'h-8 w-8 p-0',
} as const

// ─────────────────────────────────────────
// BUTTON PROPS
// ─────────────────────────────────────────

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants
  size?: keyof typeof sizes
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

// ─────────────────────────────────────────
// BUTTON
// ─────────────────────────────────────────

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      children,
      className,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          // Base
          'inline-flex items-center justify-center',
          'rounded-lg font-medium font-body',
          'transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:pointer-events-none',
          // Variant
          variants[variant],
          // Size
          sizes[size],
          // Full width
          fullWidth && 'w-full',
          className,
        )}
        {...props}
      >
        {loading
          ? <Loader2 className="h-4 w-4 animate-spin" />
          : leftIcon
        }
        {children}
        {!loading && rightIcon}
      </button>
    )
  },
)
Button.displayName = 'Button'

// ─────────────────────────────────────────
// ICON BUTTON
// Button khusus icon — rounded-lg, no label
// ─────────────────────────────────────────

export interface IconButtonProps extends Omit<ButtonProps, 'leftIcon' | 'rightIcon' | 'fullWidth' | 'children'> {
  icon: React.ReactNode
  'aria-label': string
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'icon', variant = 'secondary', className, ...props }, ref) => (
    <Button
      ref={ref}
      size={size}
      variant={variant}
      className={cn('shrink-0', className)}
      {...props}
    >
      {icon}
    </Button>
  ),
)
IconButton.displayName = 'IconButton'