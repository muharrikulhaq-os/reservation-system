'use client'

import * as React from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib'

// ─────────────────────────────────────────
// BASE INPUT
// Atomic — hanya rendering input element
// ─────────────────────────────────────────

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, hasError, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        // Base
        'flex h-10 w-full rounded-lg px-3 py-2',
        'bg-[var(--bg-card)] text-[var(--text-primary)]',
        'text-sm font-body placeholder:text-[var(--text-disabled)]',
        // Border
        'border border-[var(--border-input)]',
        'transition-all duration-150',
        // Focus
        'focus:outline-none focus:border-[1.5px] focus:border-[var(--primary)]',
        // Disabled
        'disabled:bg-[var(--bg-subtle)] disabled:text-[var(--text-disabled)] disabled:cursor-not-allowed',
        // Error
        hasError && 'border-[var(--danger)] focus:border-[var(--danger)]',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

// ─────────────────────────────────────────
// INPUT LABEL
// ─────────────────────────────────────────

export interface InputLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean
}

export const InputLabel = ({ children, required, className, ...props }: InputLabelProps) => (
  <label
    className={cn(
      'block text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)] mb-1.5',
      className,
    )}
    {...props}
  >
    {children}
    {required && <span className="ml-0.5 text-[var(--danger)]">*</span>}
  </label>
)

// ─────────────────────────────────────────
// INPUT ERROR
// ─────────────────────────────────────────

export const InputError = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  if (!children) return null
  return (
    <p className={cn('mt-1.5 flex items-center gap-1 text-xs text-[var(--danger)]', className)}>
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      <span>{children}</span>
    </p>
  )
}

// ─────────────────────────────────────────
// INPUT HINT
// ─────────────────────────────────────────

export const InputHint = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  if (!children) return null
  return (
    <p className={cn('mt-1.5 text-xs text-[var(--text-secondary)]', className)}>
      {children}
    </p>
  )
}

// ─────────────────────────────────────────
// INPUT WRAPPER (Label + Input + Error/Hint)
// Composed — paling sering dipakai
// ─────────────────────────────────────────

export interface InputFieldProps extends InputProps {
  label?: string
  error?: string
  hint?: string
  required?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  rightAction?: React.ReactNode // misal: tombol show/hide password
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      label,
      error,
      hint,
      required,
      leftIcon,
      rightIcon,
      rightAction,
      className,
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        {label && (
          <InputLabel htmlFor={inputId} required={required}>
            {label}
          </InputLabel>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[var(--text-secondary)]">
              {leftIcon}
            </div>
          )}

          <Input
            ref={ref}
            id={inputId}
            hasError={!!error}
            className={cn(
              leftIcon  && 'pl-9',
              (rightIcon || rightAction) && 'pr-10',
              className,
            )}
            {...props}
          />

          {(rightIcon || rightAction) && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-[var(--text-secondary)]">
              {rightAction ?? rightIcon}
            </div>
          )}
        </div>

        {error ? <InputError>{error}</InputError> : <InputHint>{hint}</InputHint>}
      </div>
    )
  },
)
InputField.displayName = 'InputField'

// ─────────────────────────────────────────
// PASSWORD INPUT
// InputField dengan toggle show/hide
// ─────────────────────────────────────────

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export type PasswordInputProps = Omit<InputFieldProps, 'type' | 'rightAction'>

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  (props, ref) => {
    const [show, setShow] = useState(false)

    return (
      <InputField
        ref={ref}
        type={show ? 'text' : 'password'}
        rightAction={
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
            tabIndex={-1}
            aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}
          >
            {show
              ? <EyeOff className="h-4 w-4" />
              : <Eye className="h-4 w-4" />
            }
          </button>
        }
        {...props}
      />
    )
  },
)
PasswordInput.displayName = 'PasswordInput'