'use client'

import * as React from 'react'
import { Check, ChevronDown, Loader2, Search } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Command as CommandPrimitive } from 'cmdk'
import { cn } from '@/lib/utils'
import { AppFieldError, AppFieldHint, AppLabel } from './Appinput'

// ─────────────────────────────────────────
// SEARCHABLE SELECT
// Dropdown dengan pencarian langsung (tanpa tombol cari): begitu dibuka
// kursor ada di kotak cari, daftar tersaring setiap huruf diketik.
// Tiap opsi: label + baris keterangan + badge status; opsi `disabled` tetap
// tampil (abu-abu) supaya alasannya terlihat. Keyboard: ↑ ↓ Enter, Esc.
// Pakai untuk daftar yang bisa panjang / butuh konteks; InputSelect biasa
// tetap cocok untuk pilihan pendek & statis.
// ─────────────────────────────────────────

export type SearchableOptionTone = 'success' | 'warning' | 'danger' | 'neutral'

export interface SearchableOption {
  value: string
  label: string
  /** Baris kedua di bawah label (boleh berisi ikon). */
  description?: React.ReactNode
  /** Teks tambahan yang ikut dicari (NIP, plat, nama pasangan, dll). */
  keywords?: string[]
  disabled?: boolean
  badge?: { text: string; tone?: SearchableOptionTone }
}

export interface SearchableSelectProps {
  label?: string
  required?: boolean
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  options: SearchableOption[]
  value: string
  onChange: (value: string) => void
  error?: string
  hint?: React.ReactNode
  loading?: boolean
  disabled?: boolean
  id?: string
}

const BADGE_TONE: Record<SearchableOptionTone, string> = {
  success: 'bg-[#DCFCE7] text-[#166534]',
  warning: 'bg-[#FEF3C7] text-[#92400E]',
  danger: 'bg-[#FEE2E2] text-[#991B1B]',
  neutral: 'bg-[var(--bg-subtle)] text-[var(--text-secondary)]',
}

// Cocok bila SEMUA kata yang diketik ada di label/keyword (bukan fuzzy -
// "bud" tidak boleh mencocokkan "B 1234 UD").
const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim()
const matches = (haystack: string, search: string) => {
  const words = normalize(search).split(' ').filter(Boolean)
  const h = normalize(haystack)
  return words.every((w) => h.includes(w))
}

const OptionBadge = ({ badge }: { badge: NonNullable<SearchableOption['badge']> }) => (
  <span
    className={cn(
      'shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold',
      BADGE_TONE[badge.tone ?? 'neutral'],
    )}
  >
    {badge.text}
  </span>
)

export const SearchableSelect = ({
  label,
  required,
  placeholder = 'Pilih…',
  searchPlaceholder = 'Ketik untuk mencari…',
  emptyText = 'Tidak ditemukan',
  options,
  value,
  onChange,
  error,
  hint,
  loading,
  disabled,
  id,
}: SearchableSelectProps) => {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')
  const triggerId = id ?? `searchable-${label?.toLowerCase().replace(/\s+/g, '-')}`
  const selected = options.find((o) => o.value === value)

  // Dibuat sendiri (bukan filter bawaan cmdk) supaya urutan opsi dari
  // pemanggil tetap terjaga & pencocokan per kata, bukan fuzzy.
  const visible = React.useMemo(
    () =>
      search.trim()
        ? options.filter((o) => matches([o.label, ...(o.keywords ?? [])].join(' '), search))
        : options,
    [options, search],
  )

  return (
    <div className="w-full">
      {label && (
        <AppLabel htmlFor={triggerId} required={required}>
          {label}
        </AppLabel>
      )}
      {/* modal: popover jadi lapisan scroll sendiri - tanpa ini daftar tidak
          bisa di-scroll saat dropdown dipakai di dalam Dialog. */}
      <Popover
        modal
        open={open}
        onOpenChange={(o) => {
          setOpen(o)
          if (!o) setSearch('')
        }}
      >
        <PopoverTrigger asChild>
          <button
            id={triggerId}
            type="button"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn(
              'flex min-h-10 w-full items-center gap-2 rounded-lg border bg-[var(--bg-card)] px-3 py-1.5 text-left text-sm transition-all duration-150',
              'focus:outline-none focus-visible:border-[1.5px] focus-visible:border-[var(--primary)]',
              'disabled:cursor-not-allowed disabled:bg-[var(--bg-subtle)]',
              error ? 'border-[var(--danger)]' : 'border-[var(--border-input)]',
              open && 'border-[1.5px] border-[var(--primary)]',
            )}
          >
            <span className="min-w-0 flex-1">
              {selected ? (
                <>
                  <span className="block truncate text-[var(--text-primary)]">{selected.label}</span>
                  {selected.description && (
                    <span className="block truncate text-xs text-[var(--text-secondary)]">
                      {selected.description}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-[var(--text-disabled)]">{placeholder}</span>
              )}
            </span>
            {loading ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[var(--text-secondary)]" />
            ) : (
              <ChevronDown className="h-4 w-4 shrink-0 text-[var(--text-secondary)]" />
            )}
          </button>
        </PopoverTrigger>
        {/* Tinggi dibatasi ruang yang tersisa di layar supaya kotak cari
            tidak terpotong saat popup membuka ke atas. */}
        <PopoverContent
          align="start"
          collisionPadding={8}
          className="flex max-h-[min(24rem,var(--radix-popover-content-available-height))] w-[var(--radix-popover-trigger-width)] min-w-72 flex-col gap-0 overflow-hidden rounded-xl bg-[var(--bg-card)] p-0 shadow-[0_4px_16px_rgba(0,0,0,0.10)]"
        >
          <Command shouldFilter={false} className="flex min-h-0 flex-1 flex-col bg-transparent">
            <div className="flex items-center gap-2 border-b border-[var(--border-divider)] px-3">
              <Search className="h-4 w-4 shrink-0 text-[var(--text-secondary)]" />
              <CommandPrimitive.Input
                autoFocus
                value={search}
                onValueChange={setSearch}
                placeholder={searchPlaceholder}
                className="h-10 w-full bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-disabled)]"
              />
            </div>
            <CommandList className="max-h-none min-h-0 flex-1 overflow-y-auto p-1">
              {loading && options.length === 0 ? (
                <div className="py-6 text-center text-sm text-[var(--text-secondary)]">Memuat…</div>
              ) : (
                <CommandEmpty className="py-6 text-center text-sm text-[var(--text-secondary)]">
                  {emptyText}
                </CommandEmpty>
              )}
              {visible.map((o) => (
                <CommandItem
                  key={o.value}
                  value={o.value}
                  disabled={o.disabled}
                  onSelect={() => {
                    onChange(o.value)
                    setOpen(false)
                    setSearch('')
                  }}
                  className={cn(
                    'items-start gap-2 rounded-lg px-2.5 py-2 data-selected:bg-[var(--bg-subtle)]',
                    // CheckIcon bawaan CommandItem disembunyikan; tanda pilih di bawah.
                    '[&>svg:last-child]:hidden',
                    o.disabled && 'data-[disabled=true]:opacity-60',
                  )}
                >
                  <span className="min-w-0 flex-1">
                    <span
                      className={cn(
                        'block truncate text-sm',
                        o.disabled ? 'text-[var(--text-secondary)]' : 'text-[var(--text-primary)]',
                      )}
                    >
                      {o.label}
                    </span>
                    {o.description && (
                      <span className="block text-xs text-[var(--text-secondary)]">{o.description}</span>
                    )}
                  </span>
                  {o.badge && <OptionBadge badge={o.badge} />}
                  <Check
                    className={cn(
                      'mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]',
                      o.value === value ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <AppFieldError>{error}</AppFieldError>
      <AppFieldHint>{hint}</AppFieldHint>
    </div>
  )
}
