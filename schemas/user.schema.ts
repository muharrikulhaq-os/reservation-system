import { z } from 'zod'

// ─────────────────────────────────────────
// USER SCHEMAS
// Create punya password; Update TIDAK -
// admin tidak mengubah password user lain.
// ─────────────────────────────────────────

// --- Create User ---

export const createUserSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID wajib diisi'),
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  password: z.string().min(8, 'Password minimal 8 karakter'),
  roleId: z.number({ error: 'Pilih role' }).int().positive('Pilih role'),
  departmentId: z
    .number({ error: 'Pilih departemen' })
    .int()
    .positive('Pilih departemen'),
  licenseNumber: z.string().optional(),
  phoneNumber: z.string().optional(),
})

// --- Update User (tanpa password & employeeId) ---

export const updateUserSchema = z.object({
  name: z.string().min(1, 'Nama wajib diisi'),
  email: z.string().min(1, 'Email wajib diisi').email('Format email tidak valid'),
  roleId: z.number({ error: 'Pilih role' }).int().positive('Pilih role'),
  departmentId: z
    .number({ error: 'Pilih departemen' })
    .int()
    .positive('Pilih departemen'),
  licenseNumber: z.string().optional(),
  phoneNumber: z.string().optional(),
})

// --- Inferred Types ---

export type CreateUserFormData = z.infer<typeof createUserSchema>
export type UpdateUserFormData = z.infer<typeof updateUserSchema>
