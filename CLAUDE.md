# CLAUDE.md — Reservation System

> Dibaca otomatis oleh Claude Code setiap sesi.
> Letakkan di **root proyek**, sejajar dengan `package.json`.
> Jangan hapus atau pindahkan.

---

## 1. Identitas Proyek

| | |
|---|---|
| **Nama** | Reservation System |
| **Deskripsi** | Platform peminjaman kendaraan & ruang rapat internal perusahaan |
| **Backend** | Golang · PostgreSQL · REST API · Base URL: `http://localhost:8080` · Prefix: `/api/v1` |
| **Frontend** | Next.js 14 (App Router) · TypeScript · Tailwind CSS · Shadcn/ui |
| **State & Data** | TanStack Query v5 · Zustand · React Hook Form · Zod · Axios |
| **Target** | Web (sekarang) → Android & iOS (ekspansi) |

---

## 2. Struktur Direktori (Aktual)

```
./                                    # @/* alias mengarah ke sini (tsconfig: "@/*": ["./*"])
├── app/
│   ├── layout.tsx                    # Root layout — QueryClientProvider + AuthProvider (import langsung)
│   ├── page.tsx                      # Root page (redirect atau landing)
│   ├── (auth)/
│   │   ├── layout.tsx                # Auth layout (no sidebar)
│   │   └── login/page.tsx            # ✅ SELESAI
│   └── (dashboard)/                  # Semua halaman protected (belum dibuat)
│
├── components/
│   ├── ui/                           # Shadcn generated — JANGAN edit manual
│   ├── common/                       # Reusable lintas fitur
│   │   ├── Provider/
│   │   │   └── AuthProvider.tsx      # Hydrate Zustand dari localStorage on mount
│   │   ├── Button/
│   │   │   └── Button.tsx            # Button + IconButton (5 variant, 5 size)
│   │   ├── Card/
│   │   │   └── Card.tsx              # Card + CardHeader + CardDivider + CardSection
│   │   ├── Input/
│   │   │   └── Input.tsx             # Input, InputLabel, InputError, InputHint,
│   │   │                             # InputField (composed), PasswordInput
│   │   ├── RoleGuard/
│   │   │   └── RoleGuard.tsx         # RoleGuard + AdminOnly + DriverOnly + UserOnly
│   │   ├── Badge/
│   │   │   └── StatusBadge.tsx       # BookingStatusBadge + ResourceStatusBadge
│   │   └── index.ts                  # Barrel export ⚠ AuthProvider & RoleGuard belum di-export
│   └── features/
│       └── auth/
│           └── LoginForm.tsx         # ✅ SELESAI
│
├── constants/                        # SEMUA nilai konstan — edit di sini, berlaku global
│   ├── api.ts                        # API_ENDPOINTS (semua endpoint, fungsi helper)
│   ├── booking.ts                    # BOOKING_STATUS, RESOURCE_TYPE, RESOURCE_STATUS,
│   │                                 # APPROVAL_ACTION, FUEL_TYPE, ROLE,
│   │                                 # BOOKING_STATUS_CONFIG, RESOURCE_STATUS_CONFIG
│   ├── config.ts                     # APP_CONFIG, TOKEN_CONFIG, QUERY_KEYS,
│   │                                 # QUERY_CONFIG, PAGINATION, SETTING_KEYS
│   └── index.ts                      # Barrel export
│
├── hooks/
│   ├── api/                          # TanStack Query hooks — SEMUA SELESAI
│   │   ├── useAuth.ts                # useMe, useLogin, useLogout, useChangePassword,
│   │   │                             # useUpdateProfilePhoto, useDeleteProfilePhoto
│   │   ├── useUsers.ts               # useUsers, useUser, useUserRoles, useUserDepartments,
│   │   │                             # useCreateUser, useUpdateUser, useToggleUserActive,
│   │   │                             # useDeleteUser, useUpdateUserPhoto
│   │   ├── useVehicles.ts            # useVehicles, useVehicle, useVehicleCategories,
│   │   │                             # useVehicleAttachments, useCreateVehicle,
│   │   │                             # useUpdateVehicle, useUpdateVehicleStatus,
│   │   │                             # useUpdateVehiclePhoto, useDeleteVehicle,
│   │   │                             # useCreateVehicleCategory, useDeleteVehicleCategory,
│   │   │                             # useUploadVehicleAttachment
│   │   ├── useRooms.ts               # useRooms, useRoom, useRoomAttachments,
│   │   │                             # useCreateRoom, useUpdateRoom, useUpdateRoomStatus,
│   │   │                             # useUpdateRoomPhoto, useDeleteRoom,
│   │   │                             # useUploadRoomAttachment
│   │   ├── useBookings.ts            # useBookings, useBooking, useBookingApprovalLog,
│   │   │                             # useDriverRatings, useBookingAttachments,
│   │   │                             # useCreateBooking, useCancelBooking, useApproveBooking,
│   │   │                             # useRejectBooking, useAssignVehicle, useStartBooking,
│   │   │                             # useCompleteBooking, useRateDriver,
│   │   │                             # useUploadBookingAttachment
│   │   ├── useDrivers.ts             # useDrivers, useDriver, useDriverAssignmentHistory,
│   │   │                             # useCreateDriver, useUpdateDriver, useToggleDriverActive,
│   │   │                             # useAssignDriverToVehicle, useReleaseDriverFromVehicle
│   │   ├── useFuel.ts                # useFuelExpenses, useFuelExpense,
│   │   │                             # useCreateBbmExpense, useCreateListrikExpense,
│   │   │                             # useDeleteFuelExpense
│   │   ├── useMaintenance.ts         # useMaintenanceRecords, useMaintenanceRecord,
│   │   │                             # useCreateMaintenance, useUpdateMaintenance,
│   │   │                             # useDeleteMaintenance
│   │   ├── useGuestBookings.ts       # useGuestBookingByToken, useGuestBookings,
│   │   │                             # useCreateGuestBooking, useCompleteGuestBookingByToken,
│   │   │                             # useCancelGuestBookingByToken, useApproveGuestBooking,
│   │   │                             # useRejectGuestBooking, useStartGuestBooking
│   │   ├── useReports.ts             # useBookingSummaryReport, useResourceUsageReport,
│   │   │                             # useFuelExpenseReport, useMaintenanceCostReport,
│   │   │                             # useDriverRatingsReport, useDriverActivityReport,
│   │   │                             # useOverdueBookingsReport, useAuditLogs
│   │   ├── useSettings.ts            # useMasterSettings, useMasterSetting, useUpsertSetting
│   │   └── useAttachments.ts         # useDeleteAttachment
│   ├── ui/                           # UI/behavior hooks — SEMUA SELESAI
│   │   ├── useDebounce.ts            # Delay value update (default 400ms)
│   │   ├── useDisclosure.ts          # open/close state untuk modal, drawer, dropdown
│   │   ├── usePagination.ts          # page + limit state management
│   │   ├── useTableFilter.ts         # search + pagination + filters (composed)
│   │   ├── useFileUpload.ts          # validasi & preview file sebelum upload
│   │   └── useConfirm.ts             # state untuk confirm dialog + generic data <T>
│   └── index.ts                      # Barrel export semua hooks
│
├── lib/
│   ├── axios.ts                      # Axios instance + interceptors + cookie sync
│   │                                 # syncTokensToCookies(), clearTokenCookies()
│   ├── queryClient.ts                # QueryClient config (retry logic, stale time)
│   ├── token.ts                      # tokenStorage (abstraksi localStorage)
│   ├── utils.ts                      # cn(), getErrorMessage(), formatDate/DateTime,
│   │                                 # formatCurrency, formatOdometer, getInitials,
│   │                                 # resolveFileUrl, isFileTooLarge, formatFileSize
│   └── index.ts                      # Barrel export
│
├── middleware.ts                     # 🔲 BELUM DIBUAT — Route protection + role-based redirect (Edge)
│
├── schemas/
│   └── auth.schema.ts                # loginSchema + LoginFormData
│
├── services/                         # API call layer — SEMUA SELESAI
│   ├── auth.service.ts               # register, login, refresh, logout, forgotPassword,
│   │                                 # verifyOtp, resetPassword, changePassword, getMe,
│   │                                 # updateProfilePhoto, deleteProfilePhoto
│   ├── user.service.ts               # getAll, getById, getMe, getRoles, getDepartments,
│   │                                 # create, update, toggleActive, delete, updatePhotoById
│   ├── vehicle.service.ts            # CRUD + categories + photo + attachments
│   ├── room.service.ts               # CRUD + photo + attachments  ⚠ file aktual: room.services.ts (typo, perlu rename)
│   ├── booking.service.ts            # CRUD + approve/reject/assign/start/complete +
│   │                                 # rateDriver + approvalLog + attachments
│   ├── driver.service.ts             # CRUD + toggleActive + assign/release + history
│   ├── fuel.service.ts               # getAll, getById, createBbm, createListrik, delete
│   ├── maintenance.service.ts        # CRUD
│   ├── guestBooking.service.ts       # Public (token-based) + Admin
│   ├── report.service.ts             # 8 laporan
│   ├── setting.service.ts            # getAll, getByKey, upsert
│   ├── attachment.service.ts         # delete global
│   └── index.ts                      # Barrel export
│
├── store/
│   └── auth.store.ts                 # Zustand: user, accessToken, isAuthenticated,
│                                     # setAuth, setAccessToken, clearAuth,
│                                     # hasRole(), isAdmin(), isDriver()
│
├── styles/
│   └── globals.css                   # CSS variables + Tailwind base + font imports (ini yang aktif)
│                                     # ⚠ app/globals.css = sisa boilerplate Next.js, tidak diimport, bisa dihapus
│
└── types/                            # TypeScript interfaces — SEMUA SELESAI
    ├── index.ts                      # Barrel export
    ├── enums.ts                      # RoleName, ResourceType, ResourceStatus,
    │                                 # BookingStatus, ApprovalAction, FuelType
    ├── common.ts                     # ApiResponse<T>, PaginatedResponse<T>,
    │                                 # PaginationMeta, BaseQueryParams, SelectOption
    ├── auth.ts                       # User, UserSummary, AuthUser, Role, Department,
    │                                 # LoginPayload/Response, RegisterPayload,
    │                                 # ChangePasswordPayload, AuthState, UserQueryParams
    ├── resource.ts                   # Vehicle, VehicleSummary, VehicleRef, Room,
    │                                 # RoomSummary, ResourceRef, VehicleCategory,
    │                                 # Attachment + semua payload
    ├── driver.ts                     # Driver, DriverSummary, DriverAssignment,
    │                                 # DriverRating + semua payload
    ├── booking.ts                    # Booking, GuestBooking, GuestBookingCreated,
    │                                 # ApprovalLog, BookingStatusResponse,
    │                                 # DriverRatingResponse + semua payload
    └── operational.ts                # FuelExpense (BBM & LISTRIK), MaintenanceRecord,
                                      # MasterSetting, AuditLog, HealthStatus +
                                      # 5 tipe laporan + semua payload
```

---

## 3. Status Pengerjaan

| Layer | Status | Catatan |
|---|---|---|
| `types/` | ✅ Selesai | Semua domain, disesuaikan dengan API aktual |
| `constants/` | ✅ Selesai | Enum, endpoints, query keys, UI config |
| `lib/` | ✅ Selesai | axios + refresh queue + cookie sync |
| `services/` | ✅ Selesai | 12 service, semua endpoint |
| `hooks/api/` | ✅ Selesai | 12 file, semua query + mutation |
| `hooks/ui/` | ✅ Selesai | 6 utility hooks |
| `components/common/` | ⚠ Parsial | Semua komponen ada, tapi AuthProvider & RoleGuard belum di-export dari barrel |
| `store/` | ✅ Selesai | Zustand auth store |
| `middleware.ts` | 🔲 Belum | File belum dibuat |
| `schemas/auth` | ✅ Selesai | Login schema |
| Auth UI | ✅ Selesai | Login page + LoginForm |
| Dashboard layout | 🔲 Belum | Sidebar, navbar, layout wrapper |
| Fitur booking | 🔲 Belum | List, form, detail, approval flow |
| Fitur vehicle | 🔲 Belum | Katalog, CRUD, status |
| Fitur room | 🔲 Belum | Katalog, CRUD, status |
| Fitur driver | 🔲 Belum | List, assignment, rating |
| Fitur fuel | 🔲 Belum | Input BBM/listrik |
| Fitur reports | 🔲 Belum | Dashboard admin |
| Fitur settings | 🔲 Belum | Master settings |

---

## 4. Aturan Wajib (Tidak Boleh Dilanggar)

### Import paths
```ts
// ✗ JANGAN — import langsung dari file
import type { Booking } from '@/types/booking'
import { BOOKING_STATUS } from '@/constants/booking'
import { bookingService } from '@/services/booking.service'

// ✓ HARUS — selalu dari barrel
import type { Booking } from '@/types'
import { BOOKING_STATUS } from '@/constants'
import { bookingService } from '@/services'
import { useBookings } from '@/hooks'
```

### Constants — tidak boleh hardcode string enum
```ts
// ✗ JANGAN
if (booking.status === 'APPROVED') { ... }

// ✓ HARUS
if (booking.status === BOOKING_STATUS.APPROVED) { ... }
```

### API — selalu lewat service layer
```ts
// ✗ JANGAN — langsung fetch di hook/komponen
useQuery({ queryFn: () => apiClient.get('/bookings') })

// ✓ HARUS
useQuery({ queryFn: () => bookingService.getAll(params) })
```

### Query keys — selalu dari QUERY_KEYS
```ts
// ✗ JANGAN
useQuery({ queryKey: ['bookings'] })

// ✓ HARUS
useQuery({ queryKey: [...QUERY_KEYS.BOOKINGS, params] })
```

### Form — selalu RHF + Zod
```ts
const form = useForm<BookingFormData>({
  resolver: zodResolver(bookingSchema),
})
```

### Error — jangan expose stack trace
```ts
// ✓ HARUS — pakai helper dari @/lib
import { getErrorMessage } from '@/lib'
const message = getErrorMessage(error) // aman untuk ditampilkan ke UI
```

### Web-only API — jangan di hooks/api/
```ts
// ✗ JANGAN di hooks/api/ (tidak kompatibel React Native)
localStorage.getItem('token')

// ✓ HARUS — pakai abstraksi
import { tokenStorage } from '@/lib'
tokenStorage.getAccess()
```

### Role protection — dua lapisan
```tsx
// Lapisan 1: middleware.ts (server-side, tidak bisa di-bypass)
// Lapisan 2: RoleGuard (client-side, untuk tampil/sembunyikan UI)
<AdminOnly>
  <ApproveButton />
</AdminOnly>
```

---

## 5. Pola Standar — Template Siap Pakai

### Menambah fitur baru (urutan wajib)
1. Types di `types/[domain].ts`
2. Constants (jika ada enum/endpoint baru) di `constants/`
3. Zod schema di `schemas/[feature].schema.ts`
4. Service di `services/[feature].service.ts`
5. Hook di `hooks/api/use[Feature].ts`
6. Component di `components/features/[feature]/`
7. Page di `app/(dashboard)/[feature]/page.tsx`

### Hook pattern
```ts
// hooks/api/use[Feature].ts
export const use[Feature]s = (params?: [Feature]QueryParams) =>
  useQuery({
    queryKey: [...QUERY_KEYS.[FEATURE], params],
    queryFn:  () => [feature]Service.getAll(params).then((r) => r.data),
  })

export const useCreate[Feature] = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: Create[Feature]Payload) => [feature]Service.create(payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: QUERY_KEYS.[FEATURE] }),
  })
}
```

### Service pattern
```ts
// services/[feature].service.ts
export const [feature]Service = {
  getAll: (params?: [Feature]QueryParams) =>
    apiClient
      .get<PaginatedResponse<[Feature]>>(API_ENDPOINTS.[FEATURE].BASE, { params })
      .then((r) => r.data),
  getById: (id: number) =>
    apiClient
      .get<ApiResponse<[Feature]>>(API_ENDPOINTS.[FEATURE].BY_ID(id))
      .then((r) => r.data),
  create: (payload: Create[Feature]Payload) =>
    apiClient
      .post<ApiResponse<[Feature]>>(API_ENDPOINTS.[FEATURE].BASE, payload)
      .then((r) => r.data),
  update: (id: number, payload: Update[Feature]Payload) =>
    apiClient
      .put<ApiResponse<[Feature]>>(API_ENDPOINTS.[FEATURE].BY_ID(id), payload)
      .then((r) => r.data),
  delete: (id: number) =>
    apiClient
      .delete<ApiResponse<null>>(API_ENDPOINTS.[FEATURE].BY_ID(id))
      .then((r) => r.data),
}
```

### Form component pattern
```tsx
// components/features/[feature]/[Feature]Form.tsx
'use client'

export const [Feature]Form = ({ onSuccess }: { onSuccess?: () => void }) => {
  const { mutate, isPending, error } = useCreate[Feature]()
  const { register, handleSubmit, formState: { errors } } = useForm<[Feature]FormData>({
    resolver: zodResolver([feature]Schema),
  })

  return (
    <form onSubmit={handleSubmit((data) => mutate(data, { onSuccess }))}>
      {error && (
        <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-[var(--danger)]">
          {getErrorMessage(error)}
        </div>
      )}
      <InputField label="..." error={errors.field?.message} {...register('field')} />
      <Button type="submit" loading={isPending} fullWidth>Simpan</Button>
    </form>
  )
}
```

### Halaman list dengan filter
```tsx
// app/(dashboard)/[feature]/page.tsx
'use client'

export default function [Feature]Page() {
  const { params, search, setSearch, setFilter, page, setPage } =
    useTableFilter({ status: undefined as BookingStatus | undefined })

  const { data, isLoading } = use[Feature]s(params)

  return (
    <div>
      <input value={search} onChange={(e) => setSearch(e.target.value)} />
      {/* render data.data */}
      {/* pagination: data.pagination */}
    </div>
  )
}
```

---

## 6. Auth Architecture

### Flow lengkap
```
Login form submit
  → authService.login()
  → onSuccess: setAuth(user, accessToken, refreshToken)   ← Zustand store
             + syncTokensToCookies(accessToken, role)      ← cookie untuk middleware
             + router.replace('/dashboard')

Request selanjutnya
  → axios interceptor inject Authorization header
  → Jika 401: queue request, refresh token, retry
  → Jika refresh gagal: clearAuth() + clearTokenCookies() + redirect /login

Page refresh / reload
  → AuthProvider mount → cek localStorage → fetch /me → hydrate Zustand

Route protection
  → middleware.ts (Edge): baca cookie, redirect jika perlu
  → RoleGuard (client): sembunyikan UI berdasarkan role
```

### Cookie yang digunakan
| Cookie | Isi | Tujuan |
|---|---|---|
| `access_token` | JWT access token | Middleware route protection |
| `user_role` | `ADMIN` / `USER` / `DRIVER` | Middleware role-based redirect |

### Middleware routes
| Prefix | Proteksi |
|---|---|
| `/login`, `/register` | Redirect ke `/dashboard` jika sudah login |
| Semua route lain | Redirect ke `/login` jika belum login |
| `/admin`, `/reports`, `/users`, `/settings` | Admin only |
| `/driver` | Driver only |

---

## 7. Design System

### Font
- **Display/Heading:** Plus Jakarta Sans (700, 800)
- **Body/UI:** Inter (400, 500, 600)

### Background — 3 Layer
| Layer | Hex | Dipakai pada |
|---|---|---|
| `--bg-page` | `#F5F6FA` | Body halaman |
| `--bg-card` | `#FFFFFF` | Card, panel, modal, form |
| `--bg-subtle` | `#F8F9FB` | Nested section, disabled input, zebra row |

> **Aturan:** Card di atas `bg-page`. Nested di dalam card pakai `bg-subtle`. Jangan white di atas white.

### Warna Brand & Semantic
| Token | Hex |
|---|---|
| `--primary` | `#2D2CE8` |
| `--primary-dark` | `#1A19B5` |
| `--primary-light` | `#E8E8FC` |
| `--success` | `#16A34A` |
| `--warning` | `#D97706` |
| `--danger` | `#DC2626` |
| `--info` | `#0284C7` |
| `--text-primary` | `#111827` |
| `--text-secondary` | `#6B7280` |
| `--text-disabled` | `#9CA3AF` |
| `--border-card` | `#E8EAED` |
| `--border-input` | `#DDE1E7` |
| `--border-divider` | `#F0F2F5` |

### Border Radius
| Elemen | Radius |
|---|---|
| Card, Panel, Modal, Image | `12px` — `rounded-xl` |
| Input, Select, Button | `8px` — `rounded-lg` |
| Badge, Chip, Tag | `20px` — `rounded-full` |
| Avatar | `9999px` — `rounded-full` |

### Shadow
| Konteks | Value |
|---|---|
| Card/Panel | `0 1px 4px rgba(0,0,0,0.06)` |
| Dropdown | `0 4px 16px rgba(0,0,0,0.10)` |
| Modal | `0 8px 32px rgba(0,0,0,0.12)` |

### Ukuran
| Elemen | Nilai |
|---|---|
| Input/Button height | `40px` |
| Navbar height | `56px` |
| Sidebar width | `240px` |
| Card padding | `20–24px` |
| Section gap | `24px` |

### Booking Status
| Status | BG | Text | Dot |
|---|---|---|---|
| PENDING | `#FEF9C3` | `#854D0E` | `#D97706` |
| APPROVED | `#DCFCE7` | `#166534` | `#16A34A` |
| REJECTED | `#FEE2E2` | `#991B1B` | `#DC2626` |
| ONGOING | `#DBEAFE` | `#1E40AF` | `#0284C7` |
| COMPLETED | `#F0FDF4` | `#166534` | `#16A34A` |
| CANCELLED | `#F3F4F6` | `#374151` | `#9CA3AF` |
| OVERDUE | `#FEF3C7` | `#92400E` | `#D97706` |

---

## 8. API Reference Ringkas

**Base:** `http://localhost:8080/api/v1`  
**Auth:** `Authorization: Bearer <access_token>`

| Modul | Endpoints |
|---|---|
| Auth | POST /auth/login, /auth/logout, /auth/refresh, GET /auth/me |
| Users | GET/POST /users, GET/PUT/DELETE /users/:id, PATCH /users/:id/toggle-active |
| Vehicles | GET/POST /vehicles, GET/PUT/DELETE /vehicles/:id, PATCH status/photo |
| Rooms | GET/POST /rooms, GET/PUT/DELETE /rooms/:id, PATCH status/photo |
| Bookings | GET/POST /bookings, POST approve/reject/assign-vehicle/start/complete |
| Drivers | GET/POST /drivers, PUT /drivers/:id, PATCH toggle/assign/release |
| Fuel | GET /fuel-expenses, POST /fuel-expenses/bbm, POST /fuel-expenses/listrik |
| Maintenance | CRUD /maintenance |
| Guest | POST/GET /guest-bookings, PATCH via token |
| Settings | GET/PUT /master-settings/:key |
| Reports | GET /reports/bookings, resource-usage, fuel-expenses, dll |

**Response selalu:**
```json
{ "success": true, "message": "...", "data": {} }
{ "success": true, "message": "...", "data": [], "pagination": { "total": 0, "page": 1, "limit": 20, "totalPages": 0 } }
{ "success": false, "message": "...", "error": { "code": "...", "message": "..." } }
```

**Role:** `ADMIN` (akses penuh) · `USER` (buat booking) · `DRIVER` (input BBM, start perjalanan)

---

## 9. ERD Ringkas

**Enums:** `RoleName`: USER/ADMIN/DRIVER · `ResourceType`: VEHICLE/ROOM · `ResourceStatus`: AVAILABLE/MAINTENANCE/INACTIVE · `BookingStatus`: PENDING/APPROVED/REJECTED/ONGOING/COMPLETED/CANCELLED/OVERDUE · `FuelType`: BBM/LISTRIK

**Relasi:**
- `users` → `roles` (N:1) + `departments` (N:1)
- `drivers` → `users` (1:1)
- `vehicles` → `resources` (1:1) + `vehicle_categories` (N:1)
- `rooms` → `resources` (1:1)
- `bookings` → `users` + `resources` + optional `drivers` + optional `vehicles`
- `fuel_expenses` → `drivers` + `vehicles` + optional `bookings`
- `attachments` → polymorphic: vehicleId XOR roomId XOR bookingId
- `driver_assignments` → `drivers` + `vehicles`

---

## 10. Mobile Expansion

Siapkan dari sekarang agar tidak perlu refactor besar:
- `hooks/api/` bebas dari `window`, `document`, `localStorage`
- `types/` dan `schemas/` akan di-share ke React Native repo
- `constants/` tidak ada browser-specific import
- `tokenStorage` di `lib/token.ts` adalah abstraksi — saat RN, ganti isinya dengan `AsyncStorage`
- Pertimbangkan Turborepo monorepo saat mulai ekspansi

---

## 11. Yang Tidak Boleh Diubah Tanpa Diskusi

- Struktur barrel export (`types/index.ts`, `constants/index.ts`, `services/index.ts`, `hooks/index.ts`)
- Nama dan struktur `QUERY_KEYS` — breaking change ke seluruh cache
- `lib/axios.ts` — interceptors refresh token ada di sini
- `middleware.ts` — route protection
- CSS variable names di `globals.css` — dipakai di seluruh komponen