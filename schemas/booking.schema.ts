import { z } from 'zod'

// ─────────────────────────────────────────
// BOOKING SCHEMAS
// ─────────────────────────────────────────

// --- Create Booking ---

export const createBookingSchema = z.object({
  resourceId: z
    .number({ error: 'Resource wajib dipilih' })
    .int()
    .positive('Resource wajib dipilih'),
  startDate: z.string().min(1, 'Tanggal mulai wajib diisi'),
  endDate: z.string().min(1, 'Tanggal selesai wajib diisi'),
  purpose: z
    .string()
    .min(10, 'Minimal 10 karakter')
    .max(500, 'Maksimal 500 karakter'),
  passengerCount: z
    .number({ error: 'Jumlah penumpang wajib diisi' })
    .min(1, 'Minimal 1 penumpang'),
  driverId: z.number().optional(),
  // Opsional, VEHICLE saja - default NON_SPD di backend bila tidak dikirim.
  bookingType: z.enum(['SPD', 'NON_SPD']).optional(),
  // Validasi kapasitas dilakukan di komponen (butuh data kapasitas kendaraan)
})

// --- Approve Booking ---

export const approveBookingSchema = z.object({
  note: z.string().optional(),
})

// --- Reject Booking ---

export const rejectBookingSchema = z.object({
  note: z.string().min(1, 'Alasan penolakan wajib diisi'),
})

// --- Assign Vehicle ---

export const assignVehicleSchema = z.object({
  driverId: z
    .number({ error: 'Driver wajib dipilih' })
    .int()
    .positive('Driver wajib dipilih'),
  vehicleId: z
    .number({ error: 'Kendaraan wajib dipilih' })
    .int()
    .positive('Kendaraan wajib dipilih'),
})

// --- Merge Booking ---

export const mergeBookingSchema = z.object({
  targetBookingId: z
    .number({ error: 'Pilih booking yang akan digabungkan' })
    .int()
    .positive('Pilih booking yang akan digabungkan'),
  reason: z.string().min(1, 'Alasan penggabungan wajib diisi'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
})

// --- Rate Driver ---

export const rateDriverSchema = z.object({
  rating: z
    .number({ error: 'Rating wajib diisi' })
    .min(1, 'Rating minimal 1')
    .max(5, 'Rating maksimal 5'),
  review: z.string().optional(),
})

// ─────────────────────────────────────────
// INFERRED TYPES
// ─────────────────────────────────────────

export type CreateBookingFormData = z.infer<typeof createBookingSchema>
export type ApproveBookingFormData = z.infer<typeof approveBookingSchema>
export type RejectBookingFormData = z.infer<typeof rejectBookingSchema>
export type AssignVehicleFormData = z.infer<typeof assignVehicleSchema>
export type MergeBookingFormData = z.infer<typeof mergeBookingSchema>
export type RateDriverFormData = z.infer<typeof rateDriverSchema>
