import { z } from 'zod'

// ─────────────────────────────────────────
// MAINTENANCE SCHEMAS - pengajuan ke vendor/bengkel luar
// ─────────────────────────────────────────

export const maintenancePlanSchema = z.object({
  vehicleId: z
    .number({ error: 'Kendaraan wajib dipilih' })
    .int()
    .positive('Kendaraan wajib dipilih'),
  vendorId: z.number().int().positive().optional(),
  category: z.enum(['ROUTINE', 'REPAIR', 'PARTS', 'BODY', 'OTHER'], {
    error: 'Pilih jenis pekerjaan',
  }),
  description: z.string().trim().min(5, 'Uraian pekerjaan minimal 5 karakter'),
  complaint: z.string().optional(),
  location: z.string().optional(),
  /** "YYYY-MM-DDTHH:mm" (datetime-local, WIB). */
  plannedDate: z.string().optional(),
  estimatedDays: z
    .number({ error: 'Isi estimasi lama pengerjaan' })
    .int()
    .min(1, 'Minimal 1 hari')
    .max(365, 'Maksimal 365 hari'),
  pickupMethod: z.enum(['DROP_OFF', 'PICKUP']).optional(),
  estimatedCost: z.number().min(0).optional(),
  costBearer: z.enum(['COMPANY', 'VENDOR', 'UNDECIDED']).optional(),
  odometer: z.number().int().min(0).optional(),
})

export type MaintenancePlanFormData = z.infer<typeof maintenancePlanSchema>

export const vendorSchema = z.object({
  name: z.string().trim().min(2, 'Nama vendor wajib diisi'),
  type: z.enum(['OWNER', 'WORKSHOP', 'BOTH'], { error: 'Pilih jenis vendor' }),
  address: z.string().optional(),
  picName: z.string().optional(),
  phone: z.string().optional(),
  email: z.union([z.literal(''), z.string().email('Format email tidak valid')]).optional(),
  note: z.string().optional(),
})

export type VendorFormData = z.infer<typeof vendorSchema>

export const documentSettingsSchema = z.object({
  companyName: z.string().trim().min(2, 'Nama perusahaan wajib diisi'),
  companyAddress: z.string(),
  companyPhone: z.string(),
  companyEmail: z.union([z.literal(''), z.string().email('Format email tidak valid')]),
  signerName: z.string(),
  signerTitle: z.string(),
  letterCode: z
    .string()
    .trim()
    .min(1, 'Kode surat wajib diisi')
    .max(30, 'Maksimal 30 karakter')
    .regex(/^[^\s/]+$/, "Tanpa spasi atau '/'"),
})

export type DocumentSettingsFormData = z.infer<typeof documentSettingsSchema>
