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
src/
├── app/
│   ├── layout.tsx                    # Root layout — QueryClientProvider + AuthProvider
│   ├── (auth)/
│   │   ├── layout.tsx                # Auth layout (no sidebar)
│   │   └── login/page.tsx            # ✅ SELESAI
│   └── (dashboard)/                  # Semua halaman protected (belum dibuat)
│
├── components/
│   ├── ui/                           # Shadcn generated — JANGAN edit manual
│   ├── common/                       # Reusable lintas fitur — SEMUA SELESAI
│   │   ├── AuthProvider.tsx          # Hydrate Zustand dari localStorage on mount
│   │   ├── Button.tsx                # Button + IconButton (5 variant, 5 size)
│   │   ├── Card.tsx                  # Card + CardHeader + CardDivider + CardSection
│   │   ├── Input.tsx                 # Input, InputLabel, InputError, InputHint,
│   │   │                             # InputField (composed), PasswordInput
│   │   ├── RoleGuard.tsx             # RoleGuard + AdminOnly + DriverOnly + UserOnly
│   │   ├── StatusBadge.tsx           # BookingStatusBadge + ResourceStatusBadge
│   │   └── index.ts                  # Barrel export
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
├── middleware.ts                     # Route protection + role-based redirect (Edge)
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
│   ├── room.service.ts               # CRUD + photo + attachments
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
│   └── globals.css                   # CSS variables + Tailwind base + font imports
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
| `components/common/` | ✅ Selesai | Input, Button, Card, StatusBadge, RoleGuard, AuthProvider |
| `store/` | ✅ Selesai | Zustand auth store |
| `middleware.ts` | ✅ Selesai | Route guard + role redirect |
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

## 8. UI Implementation Rules (WAJIB DIIKUTI)

> **PENTING:** Section ini berisi Tailwind className yang HARUS dipakai.
> Jangan interpretasi bebas dari tabel design token — SALIN className dari sini.

### 8.1 Shadcn Override Wajib

Semua komponen Shadcn yang dipakai **HARUS** di-override class-nya agar sesuai design system.
Jangan pernah pakai Shadcn default styling tanpa override.

```tsx
// ✗ JANGAN — Shadcn default (warna hitam, rounded kecil)
<Button>Submit</Button>
<Input placeholder="..." />

// ✓ HARUS — selalu override className
<Button className="h-10 rounded-lg bg-[var(--primary)] hover:bg-[var(--primary-dark)] text-white">
  Submit
</Button>
<Input className="h-10 rounded-lg border-[var(--border-input)] focus-visible:ring-0 focus-visible:border-[1.5px] focus-visible:border-[var(--primary)]" />
```

### 8.2 Card Container — Wajib Wrap Konten

Setiap grup form, tabel, atau konten panel HARUS dibungkus card:

```tsx
// ✗ JANGAN — konten tanpa card wrapper
<form className="space-y-4">
  <Input />
  <Button>Submit</Button>
</form>

// ✓ HARUS — selalu pakai card wrapper
<div className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-7 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
  <form className="space-y-5">
    <Input />
    <Button>Submit</Button>
  </form>
</div>
```

### 8.3 Input Field — Struktur Lengkap

Setiap input HARUS memiliki: label atas, wrapper `relative` untuk icon, dan error bawah.

```tsx
{/* POLA WAJIB untuk setiap input field */}
<div className="w-full">
  {/* Label */}
  <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--text-secondary)]">
    EMAIL <span className="text-[var(--danger)]">*</span>
  </label>

  {/* Input wrapper — HARUS relative untuk icon positioning */}
  <div className="relative">
    {/* Left icon — HARUS pointer-events-none + absolute */}
    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[var(--text-secondary)]">
      <Mail className="h-4 w-4" />
    </span>

    {/* Input — HARUS ada semua class ini */}
    <input
      type="email"
      className="h-10 w-full rounded-lg border border-[var(--border-input)] bg-[var(--bg-card)] pl-9 pr-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] transition-all duration-150 focus:outline-none focus:border-[1.5px] focus:border-[var(--primary)] disabled:bg-[var(--bg-subtle)] disabled:cursor-not-allowed"
      placeholder="nama@perusahaan.com"
    />
  </div>

  {/* Error — hanya tampil kalau ada error */}
  <p className="mt-1.5 flex items-center gap-1 text-xs text-[var(--danger)]">
    <AlertCircle className="h-3 w-3" /> Email wajib diisi
  </p>
</div>
```

### 8.4 Password Input — Toggle HARUS di dalam input

```tsx
<div className="relative">
  <input
    type={show ? 'text' : 'password'}
    className="h-10 w-full rounded-lg border border-[var(--border-input)] bg-[var(--bg-card)] pl-3 pr-10 text-sm ..."
  />
  {/* Toggle — HARUS absolute di DALAM input, bukan di luar */}
  <button
    type="button"
    tabIndex={-1}
    className="absolute inset-y-0 right-3 flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
  >
    {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
  </button>
</div>
```

### 8.5 Button — Class Lengkap

```tsx
{/* Primary button */}
<button className="h-10 w-full rounded-lg bg-[var(--primary)] px-4 text-sm font-semibold text-white transition-all hover:bg-[var(--primary-dark)] hover:shadow-[0_2px_8px_rgba(45,44,232,0.25)] disabled:bg-[var(--border-card)] disabled:text-[var(--text-disabled)] disabled:shadow-none">
  Masuk
</button>

{/* Secondary button */}
<button className="h-10 rounded-lg border border-[var(--border-input)] bg-[var(--bg-card)] px-4 text-sm font-medium text-[var(--text-primary)] transition-all hover:bg-[var(--bg-page)]">
  Batal
</button>
```

### 8.6 Error Alert — Pola Wajib

```tsx
<div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
  <span>Terjadi kesalahan pada server.</span>
</div>
```

### 8.7 Login Page — Pola Layout Lengkap

```tsx
{/* POLA WAJIB: centered layout + card wrapper */}
<main className="relative min-h-screen overflow-hidden flex items-center justify-center p-4"
  style={{ backgroundColor: 'var(--bg-page)' }}>

  {/* Decorative blobs */}
  <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
    <div className="absolute -top-32 -left-32 h-80 w-80 rounded-full opacity-50 blur-3xl"
      style={{ backgroundColor: 'var(--primary-light)' }} />
    <div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full opacity-35 blur-3xl"
      style={{ backgroundColor: 'var(--primary-light)' }} />
  </div>

  <div className="relative z-10 w-full max-w-[400px]">

    {/* Brand — di luar card */}
    <div className="mb-8 flex flex-col items-center text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ backgroundColor: 'var(--primary)' }}>
        {/* icon */}
      </div>
      <h1 className="text-[28px] font-bold" style={{ fontFamily: "'Plus Jakarta Sans'" }}>
        Reservation System
      </h1>
      <p className="mt-1.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
        Masuk untuk melanjutkan
      </p>
    </div>

    {/* Card — WAJIB ada rounded, border, shadow, padding */}
    <div className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-7"
      style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
      {/* Form di dalam sini */}
      <form className="space-y-5">
        {/* error alert */}
        {/* input email */}
        {/* input password */}
        {/* submit button */}
      </form>
    </div>

    {/* Footer */}
    <p className="mt-6 text-center text-xs" style={{ color: 'var(--text-disabled)' }}>
      © 2026 Reservation System
    </p>
  </div>
</main>
```

### 8.8 Spacing Rules

```
Form fields  → space-y-5    (20px gap antar field)
Card padding → p-5 atau p-7 (20px atau 28px)
Page content → space-y-6    (24px gap antar section)
Stat cards   → gap-4        (16px antar card)
List items   → divide-y     (border di antara item)
```

### 8.9 Anti-Patterns (JANGAN LAKUKAN)

```tsx
// ✗ JANGAN — input tanpa border radius
className="border border-gray-300"
// ✓ HARUS
className="rounded-lg border border-[var(--border-input)]"

// ✗ JANGAN — icon di luar div relative
<div>
  <input />
</div>
<EyeIcon />
// ✓ HARUS — icon di dalam div relative
<div className="relative">
  <input className="pr-10" />
  <button className="absolute inset-y-0 right-3 flex items-center">
    <EyeIcon />
  </button>
</div>

// ✗ JANGAN — pakai Tailwind color langsung
className="bg-blue-600 text-gray-900 border-gray-200"
// ✓ HARUS — pakai CSS variable
className="bg-[var(--primary)] text-[var(--text-primary)] border-[var(--border-card)]"

// ✗ JANGAN — konten tanpa card wrapper
<form>...</form>
// ✓ HARUS — bungkus dalam card
<div className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-7 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
  <form>...</form>
</div>

// ✗ JANGAN — focus:ring default Shadcn (biru ring lebar)
className="focus:ring-2 focus:ring-blue-500"
// ✓ HARUS — border thicken, no ring
className="focus-visible:ring-0 focus-visible:border-[1.5px] focus-visible:border-[var(--primary)]"

// ✗ JANGAN — hardcode font-family di setiap elemen
style={{ fontFamily: 'Inter' }}
// ✓ HARUS — heading pakai Plus Jakarta Sans, body otomatis Inter dari globals.css
// Heading:
style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
// Body: tidak perlu style, sudah default Inter dari body css
```

### 8.10 Tailwind Class Cheat Sheet

| Elemen | className WAJIB |
|---|---|
| Page bg | `bg-[var(--bg-page)]` atau `style={{ backgroundColor: 'var(--bg-page)' }}` |
| Card | `rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]` |
| Input | `h-10 w-full rounded-lg border border-[var(--border-input)] bg-[var(--bg-card)] px-3 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-disabled)] focus-visible:ring-0 focus-visible:border-[1.5px] focus-visible:border-[var(--primary)]` |
| Input error state | tambah `border-[var(--danger)] focus-visible:border-[var(--danger)]` |
| Input disabled | tambah `disabled:bg-[var(--bg-subtle)] disabled:cursor-not-allowed` |
| Label | `text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--text-secondary)] mb-1.5` |
| Error text | `text-xs text-[var(--danger)] mt-1.5` |
| Button primary | `h-10 rounded-lg bg-[var(--primary)] text-white font-semibold hover:bg-[var(--primary-dark)]` |
| Button secondary | `h-10 rounded-lg border border-[var(--border-input)] bg-[var(--bg-card)] text-[var(--text-primary)]` |
| Badge pill | `rounded-full px-2.5 py-0.5 text-xs font-semibold` |
| Avatar | `rounded-full` dengan size `h-9 w-9` |
| Heading | `font-bold text-[var(--text-primary)]` + `style={{ fontFamily: "'Plus Jakarta Sans'" }}` |
| Body text | `text-sm text-[var(--text-primary)]` (Inter default) |
| Secondary text | `text-sm text-[var(--text-secondary)]` |
| Disabled text | `text-xs text-[var(--text-disabled)]` |

---

## 9. API Reference Ringkas

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