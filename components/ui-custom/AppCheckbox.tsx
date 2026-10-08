'use client'

import { Checkbox as CheckboxPrimitive } from 'radix-ui'
import { Check, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────
// APP CHECKBOX - pengganti <input type="checkbox"> bawaan browser.
// Boleh dibungkus <label>: klik teks label ikut mencentang.
// ─────────────────────────────────────────

export interface AppCheckboxProps {
  checked: boolean | 'indeterminate'
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  id?: string
  name?: string
  className?: string
  'aria-label'?: string
}

export const AppCheckbox = ({
  checked,
  onCheckedChange,
  className,
  ...props
}: AppCheckboxProps) => (
  <CheckboxPrimitive.Root
    checked={checked}
    onCheckedChange={(c) => onCheckedChange(c === true)}
    className={cn(
      'peer flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border border-[var(--border-input)] bg-[var(--bg-card)] text-white transition-colors',
      'hover:border-[var(--primary)]',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-light)] focus-visible:ring-offset-1',
      'data-[state=checked]:border-[var(--primary)] data-[state=checked]:bg-[var(--primary)]',
      'data-[state=indeterminate]:border-[var(--primary)] data-[state=indeterminate]:bg-[var(--primary)]',
      'disabled:cursor-not-allowed disabled:border-[var(--border-card)] disabled:bg-[var(--bg-subtle)] disabled:hover:border-[var(--border-card)]',
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center">
      {checked === 'indeterminate' ? (
        <Minus className="h-3 w-3" strokeWidth={3} />
      ) : (
        <Check className="h-3 w-3" strokeWidth={3} />
      )}
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
)
