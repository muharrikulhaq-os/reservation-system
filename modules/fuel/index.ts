// ─────────────────────────────────────────
// FUEL MODULE — public API
// import { Fuel, useFuelExpenses } from '@/modules/fuel'
// ─────────────────────────────────────────

export { Fuel } from './Fuel'
export { FuelInputModal } from './components/FuelInputModal'
export { FuelDetailModal } from './components/FuelDetailModal'
export { fuelColumns } from './utils/columns'
export { fuelApi } from './api/fuel.api'
export { fuelTypeApi } from './api/fuelType.api'
export * from './hooks/useFuel'
export * from './hooks/useFuelTypes'
