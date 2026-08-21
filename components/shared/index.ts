// ─────────────────────────────────────────
// SHARED COMPONENTS - BARREL EXPORT
// Reusable lintas fitur (table, avatar, badge, dll)
// ─────────────────────────────────────────

export { DataTable, createColumnHelper } from './table/DataTable'
export type { ColumnDef } from './table/DataTable'

export { CardGrid } from './card-grid/CardGrid'

export { Pagination } from './pagination/Pagination'

export { ViewToggle } from './view-toggle/ViewToggle'
export type { ViewMode } from './view-toggle/ViewToggle'

export { UserAvatar } from './avatar/Avatar'

export { SafeImage } from './media/SafeImage'

export { BookingStatusBadge, ResourceStatusBadge, Badge } from './badge/StatusBadge'

export { PageHeader } from './page-header/PageHeader'

export { StatCard } from './stat-card/StatCard'

export { StarRating } from './rating/StarRating'

export { AvailabilityCalendar } from './calendar/AvailabilityCalendar'
export type {
  AvailabilityCalendarProps,
  CalendarEvent,
  CalendarDayData,
  DateTimeRange,
} from './calendar/AvailabilityCalendar'

export * from './Resource'

export { ConfirmDialog } from './ConfirmDialog'
export type { ConfirmDialogProps } from './ConfirmDialog'
