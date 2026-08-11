// ─────────────────────────────────────────
// VEHICLES MODULE — public API
// import { VehiclesPage, useVehicles } from '@/modules/vehicles'
// ─────────────────────────────────────────

export { VehiclesPage } from './Vehicles'
export { VehicleForm } from './components/VehicleForm'
export { VehicleDetail } from './components/VehicleDetail'
export { VehicleCreate } from './components/VehicleCreate'
export { VehicleEdit } from './components/VehicleEdit'
export { VehicleCard } from './components/VehicleCard'
export { vehicleColumns } from './utils/columns'
export { vehicleService } from './api/vehicle.api'
export * from './hooks/useVehicles'
