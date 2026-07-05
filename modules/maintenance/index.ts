// ─────────────────────────────────────────
// MAINTENANCE MODULE — public API
// import { Maintenance, useMaintenanceRecords } from '@/modules/maintenance'
// ─────────────────────────────────────────

export { Maintenance } from './Maintenance'
export { MaintenanceForm } from './components/MaintenanceForm'
export { MaintenanceDetail } from './components/MaintenanceDetail'
export { CompleteMaintenanceModal } from './components/CompleteMaintenanceModal'
export { maintenanceColumns } from './utils/columns'
export { maintenanceApi } from './api/maintenance.api'
export * from './hooks/useMaintenance'
