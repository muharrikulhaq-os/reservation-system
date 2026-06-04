import { z } from 'zod'

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  password: z
    .string()
    .min(1, 'Password wajib diisi')
    .min(4, 'Password minimal 4 karakter'),
})

export type LoginFormData = z.infer<typeof loginSchema>