// ─────────────────────────────────────────
// useConfirm
// State untuk confirm dialog — delete,
// toggle active, reject booking, dll
// ─────────────────────────────────────────

import { useState, useCallback } from 'react'

interface ConfirmState<T> {
  isOpen: boolean
  data: T | null
}

interface ConfirmReturn<T> {
  isOpen: boolean
  data: T | null
  confirm: (data: T) => void  // buka dialog dengan data
  cancel: () => void
  resolve: () => void         // eksekusi aksi dan tutup
}

export const useConfirm = <T = unknown>(): ConfirmReturn<T> => {
  const [state, setState] = useState<ConfirmState<T>>({
    isOpen: false,
    data:   null,
  })

  const confirm = useCallback((data: T) => {
    setState({ isOpen: true, data })
  }, [])

  const cancel = useCallback(() => {
    setState({ isOpen: false, data: null })
  }, [])

  const resolve = useCallback(() => {
    setState({ isOpen: false, data: null })
  }, [])

  return {
    isOpen: state.isOpen,
    data:   state.data,
    confirm,
    cancel,
    resolve,
  }
}
