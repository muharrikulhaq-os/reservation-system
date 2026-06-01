// ─────────────────────────────────────────
// ATTACHMENT HOOKS
// Global delete — berlaku untuk semua jenis
// ─────────────────────────────────────────

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants'
import { attachmentService } from '@/services'

export const useDeleteAttachment = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => attachmentService.delete(id),
    onSuccess: () => {
      // Invalidate semua yang mungkin punya attachments
      qc.invalidateQueries({ queryKey: QUERY_KEYS.VEHICLES })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.ROOMS })
      qc.invalidateQueries({ queryKey: QUERY_KEYS.BOOKINGS })
    },
  })
}
