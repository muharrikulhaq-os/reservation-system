'use client'

import { useState } from 'react'
import { Plus, Trash2, Edit2, Check, X, Building2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { AppButton, InputText } from '@/components/ui-custom'
import { ConfirmDialog } from '@/components/shared'
import {
  useUserDepartments,
  useCreateDepartment,
  useUpdateDepartment,
  useDeleteDepartment,
} from '../hooks/useUsers'

export const DepartmentManageModal = ({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) => {
  const { data: departments, isLoading } = useUserDepartments()
  const createDept = useCreateDepartment()
  const updateDept = useUpdateDepartment()
  const deleteDept = useDeleteDepartment()

  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [deptToDelete, setDeptToDelete] = useState<{ id: number; name: string } | null>(null)

  const handleCreate = () => {
    if (!newName.trim()) return
    createDept.mutate(newName.trim(), {
      onSuccess: () => setNewName(''),
    })
  }

  const handleStartEdit = (id: number, name: string) => {
    setEditingId(id)
    setEditName(name)
  }

  const handleSaveEdit = (id: number) => {
    if (!editName.trim()) return
    updateDept.mutate(
      { id, name: editName.trim() },
      {
        onSuccess: () => {
          setEditingId(null)
          setEditName('')
        },
      }
    )
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditName('')
  }

  const handleDelete = (dept: { id: number; name: string }) => {
    setDeptToDelete(dept)
  }

  const handleConfirmDelete = () => {
    if (!deptToDelete) return
    deleteDept.mutate(deptToDelete.id, {
      onSettled: () => {
        setDeptToDelete(null)
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl p-6 shadow-[var(--shadow-modal)] sm:max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle
            className="text-lg font-bold text-[var(--text-primary)] font-display"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[var(--primary)]" />
              Kelola Departemen
            </div>
          </DialogTitle>
          <DialogDescription className="text-xs text-[var(--text-secondary)]">
            Tambah, ubah nama, atau hapus departemen organisasi.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex flex-col flex-1 overflow-hidden">
          {/* Add Form */}
          <div className="flex gap-2 mb-6">
            <InputText
              placeholder="Nama departemen baru..."
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              disabled={createDept.isPending}
            />
            <AppButton
              variant="primary"
              onClick={handleCreate}
              loading={createDept.isPending}
              disabled={!newName.trim()}
            >
              <Plus className="h-4 w-4" />
            </AppButton>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto pr-1">
            {isLoading ? (
              <p className="text-center text-sm text-[var(--text-secondary)] py-4">
                Memuat departemen...
              </p>
            ) : departments?.length === 0 ? (
              <p className="text-center text-sm text-[var(--text-secondary)] py-4">
                Belum ada departemen
              </p>
            ) : (
              <ul className="space-y-2">
                {departments?.map((dept) => (
                  <li
                    key={dept.id}
                    className="flex items-center justify-between gap-2 rounded-lg border border-[var(--border-divider)] p-2 hover:bg-[var(--bg-subtle)] transition-colors"
                  >
                    {editingId === dept.id ? (
                      <>
                        <InputText
                          className="flex-1 h-8"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(dept.id)}
                          autoFocus
                        />
                        <div className="flex gap-1">
                          <AppButton
                            variant="primary"
                            size="sm"
                            className="h-8 w-8 px-0"
                            onClick={() => handleSaveEdit(dept.id)}
                            loading={updateDept.isPending}
                          >
                            <Check className="h-4 w-4" />
                          </AppButton>
                          <AppButton
                            variant="secondary"
                            size="sm"
                            className="h-8 w-8 px-0"
                            onClick={handleCancelEdit}
                            disabled={updateDept.isPending}
                          >
                            <X className="h-4 w-4" />
                          </AppButton>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="text-sm font-medium text-[var(--text-primary)]">
                          {dept.name}
                        </span>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(dept.id, dept.name)}
                            className="p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-[var(--primary)] rounded-md transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(dept)}
                            className="p-1.5 text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-red-600 rounded-md transition-colors"
                            disabled={deleteDept.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </DialogContent>

      <ConfirmDialog
        open={!!deptToDelete}
        onOpenChange={(openState) => {
          if (!openState) setDeptToDelete(null)
        }}
        title="Hapus Departemen"
        description={
          <span>
            Apakah Anda yakin ingin menghapus departemen{' '}
            <strong className="font-semibold text-[var(--text-primary)]">
              &ldquo;{deptToDelete?.name}&rdquo;
            </strong>
            ? Tindakan ini tidak dapat dibatalkan.
          </span>
        }
        confirmText="Ya, Hapus"
        cancelText="Batal"
        variant="danger"
        loading={deleteDept.isPending}
        onConfirm={handleConfirmDelete}
      />
    </Dialog>
  )
}
