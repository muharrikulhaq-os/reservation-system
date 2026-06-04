// ─────────────────────────────────────────
// SERVICES — BARREL EXPORT
// import { bookingService, vehicleService } from '@/services'
// ─────────────────────────────────────────

// ⚠ vehicle / room / booking / driver service telah pindah ke modules/*/api
// import dari module barrel: import { bookingService } from '@/modules/booking'
export { authService }        from './auth.service'
export { userService }        from './user.service'
export { fuelService }        from './fuel.service'
export { maintenanceService } from './maintenance.service'
export { guestBookingService }from './guestBooking.service'
export { reportService }      from './report.service'
export { settingService }     from './setting.service'
export { attachmentService }  from './attachment.service'
