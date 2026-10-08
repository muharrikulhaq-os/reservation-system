'use client'

import { Select as SelectPrimitive } from 'radix-ui'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SelectOption } from '@/types'
import { AppFieldError, AppFieldHint, AppLabel } from './Appinput'

// ─────────────────────────────────────────
// 7. INPUT SELECT - dropdown bertema (Radix Select), pengganti <select>
// bawaan browser yang daftar pilihannya tidak bisa diberi tema. Keyboard
// tetap jalan: panah, Enter, dan ketik huruf untuk lompat ke opsi.
// onChange tetap berbentuk event ({ target: { value } }) - nilai selalu
// string, sama seperti <select> - supaya pemanggil lama tidak berubah.
// Untuk daftar data yang panjang/butuh keterangan, pakai SearchableSelect.
// ─────────────────────────────────────────

/** Radix Select tidak menerima value "" untuk item. */
const EMPTY = '__empty__'

export interface SelectChangeEvent {
  target: { name?: string; value: string }
}

export interface InputSelectProps {
  label?: string
  error?: string
  hint?: string
  required?: boolean
  /** Teks saat kosong. Bila tidak `required`, juga jadi opsi pertama (nilai ""). */
  placeholder?: string
  options: SelectOption[]
  value?: string | number | null
  onChange?: (e: SelectChangeEvent) => void
  onBlur?: () => void
  name?: string
  id?: string
  disabled?: boolean
  className?: string
  /** `sm` = tinggi 32px (toolbar/pagination). */
  size?: 'md' | 'sm'
  'aria-label'?: string
}

export const InputSelect = ({
  label,
  error,
  hint,
  required,
  placeholder,
  options,
  value,
  onChange,
  onBlur,
  name,
  id,
  disabled,
  className,
  size = 'md',
  'aria-label': ariaLabel,
}: InputSelectProps) => {
  const selectId = id ?? (label ? `select-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined)
  const current = value == null ? '' : String(value)
  const emptyItem = !!placeholder && !required
  const isEmpty = current === ''

  return (
    <div className="w-full space-y-0">
      {label && (
        <AppLabel htmlFor={selectId} required={required}>
          {label}
        </AppLabel>
      )}
      <SelectPrimitive.Root
        name={name}
        disabled={disabled}
        value={isEmpty ? (emptyItem ? EMPTY : '') : current}
        onValueChange={(v) => onChange?.({ target: { name, value: v === EMPTY ? '' : v } })}
        onOpenChange={(o) => {
          if (!o) onBlur?.()
        }}
      >
        <SelectPrimitive.Trigger
          id={selectId}
          aria-label={ariaLabel}
          aria-invalid={!!error || undefined}
          className={cn(
            'group flex w-full items-center justify-between gap-2 rounded-lg border bg-[var(--bg-card)] text-left transition-all duration-150',
            size === 'sm' ? 'h-8 px-2.5 text-xs font-medium' : 'h-10 px-3 text-sm',
            'focus:outline-none focus-visible:border-[1.5px] focus-visible:border-[var(--primary)]',
            'data-[state=open]:border-[1.5px] data-[state=open]:border-[var(--primary)]',
            'disabled:cursor-not-allowed disabled:bg-[var(--bg-subtle)] disabled:text-[var(--text-disabled)]',
            error ? 'border-[var(--danger)]' : 'border-[var(--border-input)]',
            isEmpty ? 'text-[var(--text-disabled)]' : 'text-[var(--text-primary)]',
            className,
          )}
        >
          <span className="min-w-0 flex-1 truncate">
            <SelectPrimitive.Value placeholder={placeholder ?? 'Pilih'} />
          </span>
          <SelectPrimitive.Icon asChild>
            <ChevronDown
              className={cn(
                'shrink-0 text-[var(--text-secondary)] transition-transform duration-150 group-data-[state=open]:rotate-180',
                size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4',
              )}
            />
          </SelectPrimitive.Icon>
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Content
            position="popper"
            sideOffset={4}
            collisionPadding={8}
            className={cn(
              'relative z-50 max-h-[min(20rem,var(--radix-select-content-available-height))] min-w-[var(--radix-select-trigger-width)] overflow-hidden',
              'rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] text-[var(--text-primary)] shadow-[0_4px_16px_rgba(0,0,0,0.10)]',
              'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95',
              'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
            )}
          >
            <SelectPrimitive.ScrollUpButton className="flex h-6 items-center justify-center text-[var(--text-secondary)]">
              <ChevronUp className="h-4 w-4" />
            </SelectPrimitive.ScrollUpButton>
            <SelectPrimitive.Viewport className="p-1">
              {emptyItem && <Item value={EMPTY} label={placeholder!} muted size={size} />}
              {options.map((opt) => (
                <Item
                  key={String(opt.value)}
                  value={String(opt.value)}
                  label={opt.label}
                  disabled={opt.disabled}
                  size={size}
                />
              ))}
            </SelectPrimitive.Viewport>
            <SelectPrimitive.ScrollDownButton className="flex h-6 items-center justify-center text-[var(--text-secondary)]">
              <ChevronDown className="h-4 w-4" />
            </SelectPrimitive.ScrollDownButton>
          </SelectPrimitive.Content>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
      <AppFieldError>{error}</AppFieldError>
      <AppFieldHint>{hint}</AppFieldHint>
    </div>
  )
}

const Item = ({
  value,
  label,
  disabled,
  muted,
  size,
}: {
  value: string
  label: string
  disabled?: boolean
  muted?: boolean
  size: 'md' | 'sm'
}) => (
  <SelectPrimitive.Item
    value={value}
    disabled={disabled}
    className={cn(
      'relative flex w-full cursor-pointer select-none items-center rounded-lg pl-3 pr-8 outline-none transition-colors',
      size === 'sm' ? 'py-1.5 text-xs' : 'py-2 text-sm',
      muted ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)]',
      'data-[highlighted]:bg-[var(--primary-light)] data-[highlighted]:text-[var(--primary)]',
      'data-[state=checked]:font-semibold data-[state=checked]:text-[var(--primary)]',
      'data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
    )}
  >
    <SelectPrimitive.ItemText>{label}</SelectPrimitive.ItemText>
    <SelectPrimitive.ItemIndicator className="absolute right-2.5 flex items-center">
      <Check className="h-4 w-4" />
    </SelectPrimitive.ItemIndicator>
  </SelectPrimitive.Item>
)
