// ─────────────────────────────────────────
// SERVICES - BARREL EXPORT
// import { bookingService, vehicleService } from '@/services'
// ─────────────────────────────────────────

// ⚠ vehicle / room / booking / driver / user service telah pindah ke modules/*/api
// import dari module barrel: import { bookingService } from '@/modules/booking'
//                            import { userApi } from '@/modules/users'
// ⚠ fuel / maintenance service telah pindah ke modules/*/api
// import: import { fuelApi } from '@/modules/fuel'
//         import { maintenanceApi } from '@/modules/maintenance'
export { authService }        from './auth.service'
export { guestBookingService }from './guestBooking.service'
export { reportService }      from './report.service'
export { settingService }     from './setting.service'
export { attachmentService }  from './attachment.service'
