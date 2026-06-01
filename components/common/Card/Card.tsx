import * as React from 'react'
import { cn } from '@/lib'

// ─────────────────────────────────────────
// CARD — container utama
// ─────────────────────────────────────────

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean
}

export const Card = ({ children, className, noPadding = false, ...props }: CardProps) => (
  <div
    className={cn(
      'bg-[var(--bg-card)]',
      'border border-[var(--border-card)]',
      'rounded-[var(--radius-card)]',
      'shadow-[var(--shadow-card)]',
      !noPadding && 'p-6',
      className,
    )}
    {...props}
  >
    {children}
  </div>
)

// ─────────────────────────────────────────
// CARD HEADER
// Title + optional description + optional action
// ─────────────────────────────────────────

export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  action?: React.ReactNode
}

export const CardHeader = ({ title, description, action, className, ...props }: CardHeaderProps) => (
  <div
    className={cn('flex items-start justify-between gap-4 mb-5', className)}
    {...props}
  >
    <div className="min-w-0">
      <h2 className="text-base font-display font-bold text-[var(--text-primary)] leading-tight">
        {title}
      </h2>
      {description && (
        <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
          {description}
        </p>
      )}
    </div>
    {action && <div className="shrink-0">{action}</div>}
  </div>
)

// ─────────────────────────────────────────
// CARD DIVIDER
// ─────────────────────────────────────────

export const CardDivider = ({ className }: { className?: string }) => (
  <hr className={cn('border-none border-t border-[var(--border-divider)] -mx-6 my-5', className)} />
)

// ─────────────────────────────────────────
// CARD SECTION
// Nested section dengan bg-subtle
// ─────────────────────────────────────────

export const CardSection = ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'bg-[var(--bg-subtle)] rounded-lg p-4',
      className,
    )}
    {...props}
  >
    {children}
  </div>
)