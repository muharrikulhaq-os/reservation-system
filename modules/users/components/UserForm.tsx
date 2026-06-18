'use client'

import { useRouter } from 'next/navigation'
import { useForm, Controller, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle } from 'lucide-react'
import { Card, CardHeader } from '@/components/common'
import { AppButton, InputText, InputPassword, InputSelect } from '@/components/ui-custom'
import { getErrorMessage } from '@/lib'
import type { User, SelectOption } from '@/types'
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserFormData,
} from '@/schemas/user.schema'
import {
  useCreateUser,
  useUpdateUser,
  useUserRoles,
  useUserDepartments,
} from '../hooks/useUsers'

// ─────────────────────────────────────────
// USER FORM — create & edit
// ─────────────────────────────────────────

interface UserFormProps {
  initialData?: User
  onSuccess?: () => void
}

export const UserForm = ({ initialData, onSuccess }: UserFormProps) => {
  const router = useRouter()
  const isEdit = !!initialData

  const { data: roles } = useUserRoles()
  const { data: departments } = useUserDepartments()

  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser(initialData?.id ?? 0)
  const { isPending, error } = isEdit ? updateMutation : createMutation

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    // Resolver dipilih sesuai mode; field ekstra (password/employeeId)
    // diabaikan oleh updateUserSchema saat edit.
    resolver: zodResolver(
      isEdit ? updateUserSchema : createUserSchema,
    ) as unknown as Resolver<CreateUserFormData>,
    defaultValues: initialData
      ? {
          employeeId: initialData.employeeId,
          name: initialData.name,
          email: initialData.email,
          roleId: initialData.role.id,
          departmentId: initialData.department.id,
        }
      : undefined,
  })

  const roleOptions: SelectOption<number>[] = (roles ?? []).map((r) => ({
    value: r.id,
    label: r.name,
  }))
  const deptOptions: SelectOption<number>[] = (departments ?? []).map((d) => ({
    value: d.id,
    label: d.name,
  }))

  const onSubmit = (data: CreateUserFormData) => {
    if (isEdit) {
      updateMutation.mutate(
        {
          name: data.name,
          email: data.email,
          roleId: data.roleId,
          departmentId: data.departmentId,
        },
        {
          onSuccess: () => {
            onSuccess?.()
            router.push(`/users/${initialData!.id}`)
          },
        },
      )
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          onSuccess?.()
          router.push('/users')
        },
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader
          title={isEdit ? 'Data Pengguna' : 'Tambah Pengguna'}
          description="Lengkapi informasi pengguna di bawah ini"
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Row 1: employeeId (create-only / disabled saat edit) + name */}
          <InputText
            label="Employee ID"
            required
            placeholder="cth. EMP-001"
            disabled={isEdit}
            error={errors.employeeId?.message}
            {...register('employeeId')}
          />
          <InputText
            label="Nama Lengkap"
            required
            placeholder="cth. Budi Santoso"
            error={errors.name?.message}
            {...register('name')}
          />

          {/* Row 2: email (full width) */}
          <div className="sm:col-span-2">
            <InputText
              label="Email"
              type="email"
              required
              placeholder="nama@perusahaan.com"
              error={errors.email?.message}
              {...register('email')}
            />
          </div>

          {/* Row 3: password (create-only, full width) */}
          {!isEdit && (
            <div className="sm:col-span-2">
              <InputPassword
                label="Password"
                required
                placeholder="Minimal 8 karakter"
                error={errors.password?.message}
                {...register('password')}
              />
            </div>
          )}

          {/* Row 4: role + department */}
          <Controller
            control={control}
            name="roleId"
            render={({ field }) => (
              <InputSelect
                label="Role"
                required
                placeholder="Pilih role"
                options={roleOptions}
                error={errors.roleId?.message}
                value={field.value ?? ''}
                onChange={(e) =>
                  field.onChange(e.target.value ? Number(e.target.value) : undefined)
                }
              />
            )}
          />
          <Controller
            control={control}
            name="departmentId"
            render={({ field }) => (
              <InputSelect
                label="Departemen"
                required
                placeholder="Pilih departemen"
                options={deptOptions}
                error={errors.departmentId?.message}
                value={field.value ?? ''}
                onChange={(e) =>
                  field.onChange(e.target.value ? Number(e.target.value) : undefined)
                }
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
        <AppButton type="button" variant="secondary" onClick={() => router.back()}>
          Batal
        </AppButton>
        <AppButton type="submit" variant="primary" loading={isPending}>
          {isEdit ? 'Perbarui' : 'Simpan'}
        </AppButton>
      </div>
    </form>
  )
}
