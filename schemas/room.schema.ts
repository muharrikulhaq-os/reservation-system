import { z } from 'zod'

// ─────────────────────────────────────────
// ROOM SCHEMAS
// ─────────────────────────────────────────

// --- Create Room ---

export const createRoomSchema = z.object({
  name: z.string().min(1, 'Nama ruangan wajib diisi'),
  location: z.string().min(1, 'Lokasi wajib diisi'),
  capacity: z
    .number({ error: 'Kapasitas wajib diisi' })
    .int()
    .min(1, 'Kapasitas minimal 1')
    .max(500, 'Kapasitas maksimal 500'),
})

// --- Update Room (PUT = semua field wajib) ---

export const updateRoomSchema = createRoomSchema

// --- Inferred Types ---

export type CreateRoomFormData = z.infer<typeof createRoomSchema>
export type UpdateRoomFormData = z.infer<typeof updateRoomSchema>
