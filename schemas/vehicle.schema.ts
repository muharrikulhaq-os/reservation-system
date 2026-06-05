import { z } from 'zod'

// ─────────────────────────────────────────
// VEHICLE SCHEMAS
// ─────────────────────────────────────────

// --- Create Vehicle ---

export const createVehicleSchema = z.object({
  name: z.string().min(1, 'Nama kendaraan wajib diisi'),
  plateNumber: z.string().min(1, 'Plat nomor wajib diisi'),
  brand: z.string().min(1, 'Merek wajib diisi'),
  model: z.string().min(1, 'Model wajib diisi'),
  year: z
    .number({ error: 'Tahun wajib diisi' })
    .int()
    .min(1990, 'Tahun tidak valid')
    .max(2030, 'Tahun tidak valid'),
  currentOdometer: z
    .number({ error: 'Odometer wajib diisi' })
    .min(0, 'Odometer tidak valid'),
  capacity: z
    .number({ error: 'Kapasitas wajib diisi' })
    .int()
    .min(1, 'Kapasitas minimal 1')
    .max(60, 'Kapasitas maksimal 60'),
  categoryId: z
    .number({ error: 'Pilih kategori' })
    .int()
    .positive('Pilih kategori'),
})

// --- Update Vehicle (PUT = semua field wajib) ---

export const updateVehicleSchema = createVehicleSchema

// --- Create Category ---

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Nama kategori wajib diisi'),
})

// --- Inferred Types ---

export type CreateVehicleFormData = z.infer<typeof createVehicleSchema>
export type UpdateVehicleFormData = z.infer<typeof updateVehicleSchema>
export type CreateCategoryFormData = z.infer<typeof createCategorySchema>
