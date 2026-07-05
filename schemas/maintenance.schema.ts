import { z } from 'zod'

// ─────────────────────────────────────────
// MAINTENANCE SCHEMAS
// ─────────────────────────────────────────

export const createMaintenanceSchema = z.object({
  resourceId: z
    .number({ error: 'Resource wajib dipilih' })
    .int()
    .positive('Resource wajib dipilih'),
  type: z.enum(['RUTIN', 'PERBAIKAN', 'PENGGANTIAN', 'BODY'], {
    error: 'Tipe maintenance wajib dipilih',
  }),
  description: z.string().min(5, 'Deskripsi minimal 5 karakter'),
  startDate: z.string().min(1, 'Tanggal mulai wajib diisi'),
  vendor: z.string().optional(),
  odometer: z.number().optional(),
  cost: z.number().optional(),
})

export type CreateMaintenanceFormData = z.infer<typeof createMaintenanceSchema>
