// ─────────────────────────────────────────
// ATTACHMENT SERVICE
// Endpoint global DELETE /attachments/:id
// berlaku untuk semua jenis attachment
// ─────────────────────────────────────────

import { apiClient } from '@/lib'
import { API_ENDPOINTS } from '@/constants'
import type { ApiResponse } from '@/types'

export const attachmentService = {
  delete: (id: number) =>
    apiClient
      .delete<ApiResponse<null>>(API_ENDPOINTS.ATTACHMENTS.BY_ID(id))
      .then((r) => r.data),
}
