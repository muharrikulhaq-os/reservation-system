// ─────────────────────────────────────────
// SERVICES — BARREL EXPORT
// import { bookingService, vehicleService } from '@/services'
// ─────────────────────────────────────────

// ⚠ vehicle / room / booking / driver / user service telah pindah ke modules/*/api
// import dari module barrel: import { bookingService } from '@/modules/booking'
//                            import { userApi } from '@/modules/users'
export { authService }        from './auth.service'
export { fuelService }        from './fuel.service'
export { maintenanceService } from './maintenance.service'
export { guestBookingService }from './guestBooking.service'
export { reportService }      from './report.service'
export { settingService }     from './setting.service'
export { attachmentService }  from './attachment.service'
