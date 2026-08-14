'use client'

import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle } from 'lucide-react'
import { Card, CardHeader } from '@/components/common'
import { AppButton, InputText, InputNumber } from '@/components/ui-custom'
import { getErrorMessage } from '@/lib'
import type { Room } from '@/types'
import { createRoomSchema, type CreateRoomFormData } from '@/schemas/room.schema'
import { useCreateRoom, useUpdateRoom } from '../hooks/useRooms'

// ─────────────────────────────────────────
// ROOM FORM - create & edit
// ─────────────────────────────────────────

interface RoomFormProps {
  initialData?: Room
  onSuccess?: () => void
}

export const RoomForm = ({ initialData, onSuccess }: RoomFormProps) => {
  const router = useRouter()
  const isEdit = !!initialData

  const createMutation = useCreateRoom()
  const updateMutation = useUpdateRoom(initialData?.id ?? 0)
  const { mutate, isPending, error } = isEdit ? updateMutation : createMutation

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateRoomFormData>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: initialData
      ? {
          name: initialData.name,
          location: initialData.location,
          capacity: initialData.capacity,
        }
      : undefined,
  })

  const onSubmit = (data: CreateRoomFormData) =>
    mutate(data, {
      onSuccess: () => {
        onSuccess?.()
        router.push('/rooms')
      },
    })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader
          title={isEdit ? 'Data Ruangan' : 'Tambah Ruangan'}
          description="Lengkapi informasi ruangan di bawah ini"
        />

        <div className="space-y-5">
          <InputText
            label="Nama Ruangan"
            required
            placeholder="cth. Ruang Rapat Garuda"
            error={errors.name?.message}
            {...register('name')}
          />
          <InputText
            label="Lokasi"
            required
            placeholder="cth. Lantai 3, Gedung A"
            error={errors.location?.message}
            {...register('location')}
          />
          <Controller
            control={control}
            name="capacity"
            render={({ field }) => (
              <InputNumber
                label="Kapasitas (Orang)"
                required
                placeholder="cth. 20"
                min={1}
                max={500}
                value={field.value ?? ''}
                onChange={field.onChange}
                error={errors.capacity?.message}
              />
            )}
          />
        </div>
      </Card>

      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{getErrorMessage(error)}</span>
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <AppButton
          type="button"
          variant="secondary"
          onClick={() => router.push('/rooms')}
        >
          Batal
        </AppButton>
        <AppButton type="submit" variant="primary" loading={isPending}>
          {isEdit ? 'Perbarui' : 'Simpan'}
        </AppButton>
      </div>
    </form>
  )
}
