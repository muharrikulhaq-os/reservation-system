'use client'

import { InputSelect } from '@/components/ui-custom'
import { RESOURCE_STATUS, RESOURCE_STATUS_CONFIG } from '@/constants'
import type { ResourceStatus, SelectOption } from '@/types'

// ─────────────────────────────────────────
// STATUS CHANGER
// Dropdown admin untuk ubah status resource.
// ─────────────────────────────────────────

interface StatusChangerProps {
  currentStatus: ResourceStatus
  onStatusChange: (status: ResourceStatus) => void
  loading?: boolean
}

const STATUS_OPTIONS: SelectOption<ResourceStatus>[] = Object.values(
  RESOURCE_STATUS,
).map((status) => ({
  value: status,
  label: RESOURCE_STATUS_CONFIG[status].label,
}))

export const StatusChanger = ({
  currentStatus,
  onStatusChange,
  loading = false,
}: StatusChangerProps) => (
  <InputSelect
    label="Status"
    value={currentStatus}
    disabled={loading}
    options={STATUS_OPTIONS}
    onChange={(e) => onStatusChange(e.target.value as ResourceStatus)}
  />
)
