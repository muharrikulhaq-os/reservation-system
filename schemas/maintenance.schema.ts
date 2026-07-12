import { z } from 'zod'

// ─────────────────────────────────────────
// MAINTENANCE SCHEMAS (VEHICLE only)
// ─────────────────────────────────────────

export const createMaintenanceSchema = z.object({
  vehicleId: z
    .number({ error: 'Kendaraan wajib dipilih' })
    .int()
    .positive('Kendaraan wajib dipilih'),
  type: z.string().min(1, 'Tipe wajib dipilih'),
  description: z.string().min(5, 'Deskripsi minimal 5 karakter'),
  location: z.string().min(1, 'Lokasi wajib diisi'),
  startDate: z.string().min(1, 'Tanggal mulai wajib diisi'),
  vendorName: z.string().optional(),
  odometer: z.number().optional(),
  totalCost: z.number().optional(),
})

export type CreateMaintenanceFormData = z.infer<typeof createMaintenanceSchema>
