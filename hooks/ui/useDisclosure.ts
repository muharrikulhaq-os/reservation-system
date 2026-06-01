// ─────────────────────────────────────────
// useDisclosure
// Kontrol open/close state untuk modal,
// dialog, drawer, dropdown, dll
// ─────────────────────────────────────────

import { useState, useCallback } from 'react'

interface DisclosureReturn {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export const useDisclosure = (initial = false): DisclosureReturn => {
  const [isOpen, setIsOpen] = useState(initial)

  const open   = useCallback(() => setIsOpen(true), [])
  const close  = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((v) => !v), [])

  return { isOpen, open, close, toggle }
}
