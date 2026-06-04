'use client'

import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { Button as ShadcnButton } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ui/button tidak mengekspor tipe props — turunkan dari komponennya
type ShadcnButtonProps = React.ComponentProps<typeof ShadcnButton>

// ─────────────────────────────────────────
// APP BUTTON
// Wrapper Shadcn Button dengan design token
// proyek + loading state + icon helpers
// ─────────────────────────────────────────

type AppVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link'
type AppSize   = 'sm' | 'md' | 'lg' | 'icon' | 'icon-sm'

export interface AppButtonProps
  extends Omit<ShadcnButtonProps, 'variant' | 'size'> {
  variant?:   AppVariant
  size?:      AppSize
  loading?:   boolean
  leftIcon?:  React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
}

// Map ke Shadcn variant + custom className
const VARIANT_MAP: Record<AppVariant, { variant: ShadcnButtonProps['variant']; className: string }> = {
  primary: {
    variant: 'default',
    className: [
      'bg-[var(--primary)] text-white',
      'hover:bg-[var(--primary-dark)]',
      'disabled:bg-[var(--border-card)] disabled:text-[var(--text-disabled)]',
      'shadow-none hover:shadow-[0_2px_8px_rgba(45,44,232,0.25)]',
      'transition-all duration-150',
    ].join(' '),
  },
  secondary: {
    variant: 'outline',
    className: [
      'bg-[var(--bg-card)] text-[var(--text-primary)]',
      'border-[var(--border-input)]',
      'hover:bg-[var(--bg-page)] hover:text-[var(--text-primary)]',
      'disabled:text-[var(--text-disabled)]',
      'transition-all duration-150',
    ].join(' '),
  },
  ghost: {
    variant: 'ghost',
    className: [
      'text-[var(--text-secondary)]',
      'hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]',
      'transition-all duration-150',
    ].join(' '),
  },
  danger: {
    variant: 'destructive',
    className: [
      'bg-[var(--danger)] text-white',
      'hover:bg-red-700',
      'transition-all duration-150',
    ].join(' '),
  },
  link: {
    variant: 'link',
    className: 'text-[var(--primary)] p-0 h-auto',
  },
}

const SIZE_MAP: Record<AppSize, string> = {
  sm:       'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md:       'h-10 px-4 text-sm gap-2 rounded-lg',
  lg:       'h-11 px-6 text-sm gap-2 rounded-lg',
  icon:     'h-10 w-10 p-0 rounded-lg',
  'icon-sm':'h-8 w-8 p-0 rounded-lg',
}

export const AppButton = React.forwardRef<HTMLButtonElement, AppButtonProps>(
  (
    {
      variant   = 'primary',
      size      = 'md',
      loading   = false,
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
    const { variant: shadcnVariant, className: variantClass } = VARIANT_MAP[variant]
    const sizeClass = SIZE_MAP[size]
    const isDisabled = disabled || loading

    return (
      <ShadcnButton
        ref={ref}
        variant={shadcnVariant}
        disabled={isDisabled}
        className={cn(
          'font-medium font-sans inline-flex items-center justify-center',
          'focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2',
          variantClass,
          sizeClass,
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
      </ShadcnButton>
    )
  },
)
AppButton.displayName = 'AppButton'

// ── Icon Button ──────────────────────────

export interface IconButtonProps
  extends Omit<AppButtonProps, 'leftIcon' | 'rightIcon' | 'fullWidth' | 'children'> {
  icon: React.ReactNode
  'aria-label': string
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'icon', variant = 'secondary', className, ...props }, ref) => (
    <AppButton
      ref={ref}
      size={size}
      variant={variant}
      className={cn('shrink-0', className)}
      {...props}
    >
      {icon}
    </AppButton>
  ),
)
IconButton.displayName = 'IconButton'