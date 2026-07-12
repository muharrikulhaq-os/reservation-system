# Reservation System — Frontend & API Reference

Platform peminjaman **kendaraan & ruang rapat** internal perusahaan.
Dokumen ini adalah **acuan lengkap** (web + kontrak API + aturan bisnis) yang dipakai
untuk menyamakan implementasi di **mobile (Flutter)**.

> Fokus dokumen: **kontrak API**, **bentuk data**, dan **aturan bisnis/alur** — bukan detail
> internal web. Setiap kali web & README berbeda, **kode Go backend adalah sumber kebenaran**.

---

## 1. Stack

| | Web | Mobile (target) |
|---|---|---|
| Framework | Next.js 16 (App Router), React 19, TS | Flutter |
| State/Data | TanStack Query v5, Zustand v5 | GetX + Dio |
| Form/Validasi | React Hook Form + Zod v4 | (setara) |
| Backend | Go (Fiber) · PostgreSQL · REST | — |
| Base URL | `http://localhost:8080` · prefix `/api/v1` | LAN-IP + `/api/v1` |

---

## 2. Konvensi API (WAJIB diikuti mobile)

### Header
```
Authorization: Bearer <accessToken>
Content-Type: application/json           # kecuali upload → multipart/form-data
```

### Bentuk response — SELALU envelope
```jsonc
// sukses tunggal
{ "success": true, "message": "...", "data": { ... } }
// sukses list + pagination
{ "success": true, "message": "...", "data": [ ... ],
  "pagination": { "total": 0, "page": 1, "limit": 20, "totalPages": 0 } }
// error
{ "success": false, "message": "...", "error": { "code": "...", "message": "..." } }
```
> Mobile harus **unwrap `data`** dari envelope. Jangan pakai body mentah.

### Tanggal
- Semua tanggal dikirim/diterima sebagai **ISO-8601 / RFC3339** (`2026-07-10T03:00:00+07:00`).
- Query filter tanggal (`startDate`, `endDate`) **harus RFC3339 penuh**; format tanggal saja
  (`2026-07-10`) akan **diabaikan** oleh backend (filter jadi non-aktif).

### File / foto
- Backend menyajikan file di `GET /uploads/*` dan `GET /files/*`.
- Field foto berisi **path relatif** (mis. `/uploads/fuel_proofs/x.jpg`).
- **Resolusi URL:** kalau path diawali `http` pakai apa adanya; selain itu prepend base URL.
  Web helper: `resolveFileUrl(path) = path.startsWith('http') ? path : API_BASE_URL + path`.

### Nilai numerik (penting)
- sqlc menserialisasi kolom `numeric`/`SUM(...)` secara **tidak konsisten**: bisa `number`,
  `string`, atau `null`. Mobile harus **coerce** (`num.tryParse`) sebelum dipakai/format.

---

## 3. Enum & Peran

```
RoleName      : ADMIN | EMPLOYEE | DRIVER | ROOM_KEEPER
ResourceType  : VEHICLE | ROOM
ResourceStatus: AVAILABLE | MAINTENANCE | INACTIVE
BookingStatus : PENDING | APPROVED | REJECTED | ONGOING | COMPLETED | CANCELLED | OVERDUE | EXPIRED | IGNORED
EnergyType    : BBM | LISTRIK          (jenis energi kendaraan/pengisian)
FuelUnit      : LITER | KWH
```

**Peran & akses ringkas:**
- **ADMIN** — akses penuh (approve/reject, alihkan, merge, reports, users, settings).
- **EMPLOYEE** — buat booking; hanya lihat booking miliknya.
- **DRIVER** — mulai perjalanan, isi BBM; lihat booking yang ditugaskan padanya.
- **ROOM_KEEPER** — kelola & selesaikan booking ruangan.

---

## 4. Autentikasi

**Alur:**
```
POST /auth/login {email,password} → { user, accessToken, refreshToken }
  simpan token (mobile: secure storage) + set header Authorization
GET  /auth/me                       → hydrate user saat buka app / refresh
POST /auth/refresh {refreshToken}   → accessToken baru saat 401
POST /auth/logout
```
- Interceptor: pada **401**, refresh token → retry request; jika refresh gagal → logout.
- Web menyimpan cookie `access_token` + `user_role` untuk route-guard server; **mobile cukup**
  simpan token di secure storage + cek role di app.

---

## 5. Model Data Inti (bentuk response)

### Booking (`GET /bookings`, `GET /bookings/:id`)
```jsonc
{
  "id": 13,
  "status": "APPROVED",
  "purpose": "ke bandara",
  "user": { "id": 1, "name": "...", "employeeId": "ADM001", "department": "IT" },
  "resource": { "id": 7, "name": "Avanza - B 1234 XY", "type": "VEHICLE", "status": "AVAILABLE" },
  "startDate": "2026-07-10T03:00:00+07:00",
  "endDate":   "2026-07-10T17:00:00+07:00",
  "approvedBy": { "id": 1, "name": "Admin" } ,   // atau null
  "approvedAt": "...", "assignedAt": "...", "returnedAt": null,
  "assignedDriver":  { "id": 1, "name": "Pak Supir", "phoneNumber": "+62..." }, // atau null
  "assignedVehicle": { "id": 1, "plateNumber": "B 1234 XY", "brand": "Toyota", "model": "Avanza", "capacity": 7 }, // atau null

  // — Pengalihan resource (admin ganti kendaraan/ruangan saat approve) —
  "isReassigned": true,
  "originalResource": { "id": 4, "name": "L300 - B 2222 EF" },  // asal, null jika tak dialihkan

  // — Penggabungan (merge) — ada di LIST maupun detail —
  "hasMergeSuggestion": false, // true = ada booking PENDING lain di resource sama, overlap
  "isMerged": true,
  "mergedIntoId": 12,          // booking ini digabung KE #12 (dia sekunder); null jika bukan
  "mergeCount": 0              // jml booking yang digabung KE booking ini (dia main/primary)
}
```

### Driver (`GET /drivers`, `GET /drivers/:id`)
```jsonc
{ "id":1,"userId":9,"name":"Pak Supir","employeeId":"DRV001","email":"...",
  "profilePhoto":null,"licenseNumber":"...","phoneNumber":"+62...",
  "isActive":true,"assignedPlate":"B 1234 XY" }   // assignedPlate = kendaraan yang SEDANG dipegang, atau null
```

### AvailableDriver (`GET /drivers/available?startDate=&endDate=`)
```jsonc
// Supir "kosong" (belum pegang kendaraan) → vehicle* & remainingSeats NULL
{ "driverId":1,"driverName":"...","employeeId":"DRV001",
  "vehicleId":null,"plateNumber":null,"vehicleCapacity":null,
  "overlappingPassengers":0,"remainingSeats":null,"overlappingPurpose":"" }
// Supir "sibuk" (sudah pegang kendaraan dari booking aktif)
{ "driverId":2,"driverName":"...","vehicleId":5,"plateNumber":"B 9 CD",
  "vehicleCapacity":7,"overlappingPassengers":3,"remainingSeats":4,
  "overlappingPurpose":"ke gudang" }
```

### FuelExpense (`GET /fuel-expenses`)
```jsonc
{ "id":1,"bookingId":13,"vehicleId":1,"driverId":1,"driverName":"...",
  "fuelType":"BBM",                 // BBM | LISTRIK (dari jenis bahan bakar terpilih)
  "liter":30,"pricePerLiter":13000, // BBM (null jika LISTRIK)
  "kwh":null,"pricePerKwh":null,    // LISTRIK (null jika BBM)
  "totalCost":390000,
  "odometerBefore":10000,"odometerAfter":10120,
  "note":null,"proofPhotoUrl":"/uploads/fuel_proofs/x.jpg","createdAt":"..." }
```

### FuelTypeMaster (`GET /fuel-types`)
```jsonc
{ "id":2,"name":"Pertalite","type":"BBM","unit":"LITER","defaultPrice":10000,"isActive":true }
```

### MaintenanceRecord (`GET /maintenance`) — VEHICLE only
```jsonc
{ "id":3,"vehicleId":1,"vehicleName":"Avanza","plateNumber":"B 1234 XY",
  "maintenanceTypeId":null,"type":"routine","status":"completed","description":"...",
  "odometer":10200,"totalCost":"250000","vendorName":null,"location":"Bengkel A",
  "startDate":"...","endDate":"...","completedAt":"...","proofPhotos":["/uploads/..."],
  "createdBy":"Admin","createdAt":"..." }
```

---

## 6. Endpoint Reference

Semua di bawah prefix `/api/v1`. Endpoint list mendukung query `page`, `limit`, dan filter khusus.

| Modul | Endpoint |
|---|---|
| **Auth** | `POST /auth/login` · `POST /auth/logout` · `POST /auth/refresh` · `GET /auth/me` |
| **Dashboard** | `GET /dashboard/summary` → `{ total_bookings, total_vehicles, total_rooms, total_drivers }` |
| **Users** | `GET/POST /users` · `GET/PUT/DELETE /users/:id` · `PATCH /users/:id/toggle-active` |
| **Vehicles** | `GET/POST /vehicles` · `GET/PUT/DELETE /vehicles/:id` · `PATCH /vehicles/:id/status` · `PATCH /vehicles/:id/photo` · `GET /vehicles/categories` |
| **Rooms** | `GET/POST /rooms` · `GET/PUT/DELETE /rooms/:id` · `PATCH /rooms/:id/status` · `PATCH /rooms/:id/photo` |
| **Bookings** | lihat §7 |
| **Drivers** | `GET/POST /drivers` · `GET /drivers/:id` · `PUT /drivers/:id` · `PATCH /drivers/:id/toggle-active` · `PATCH /drivers/:id/assign` · `PATCH /drivers/:id/release` · `GET /drivers/:id/assignments` · `GET /drivers/available?startDate=&endDate=` |
| **Fuel** | `GET /fuel-expenses?vehicleId=&driverId=&fuelType=&bookingId=` · `POST /fuel-expenses` (multipart) · `DELETE /fuel-expenses/:id` |
| **Fuel Types** | `GET /fuel-types` · admin `POST/PUT/DELETE /fuel-types/:id` |
| **Maintenance** | `GET/POST /maintenance` · `GET /maintenance/:id` · `PUT /maintenance/:id` · `PATCH /maintenance/:id/complete` (multipart `photos`) |
| **Settings** | `GET /master-settings` · `GET/PUT /master-settings/:key` |
| **Reports** | lihat §11 |

---

## 7. Booking — Endpoint & Alur

### Endpoint
```
GET   /bookings?status=&resourceType=&resourceId=&driverId=&userId=&startDate=&endDate=&search=&page=&limit=
GET   /bookings/:id
POST  /bookings                        { resourceId, startDate, endDate, purpose, passengerCount(min1), driverId? }
PATCH /bookings/:id/cancel
POST  /bookings/:id/approve            (admin)  { note? }
POST  /bookings/:id/reject             (admin)  { note }         // wajib alasan
PATCH /bookings/:id/substitute-resource(admin)  { resourceId, note? }   // ganti RUANGAN
POST  /bookings/:id/assign-vehicle     (admin)  { driverId, vehicleId } // ganti supir+kendaraan (status harus APPROVED)
POST  /bookings/:id/merge              (admin)  { targetBookingId, reason, startDate?, endDate?, driverId? }
GET   /bookings/:id/merge-info         (auth)
PATCH /bookings/:id/start              (admin|driver)
PATCH /bookings/:id/complete           (admin|room_keeper)
POST  /bookings/:id/rate-driver        (pemilik) { rating(1-5), review? }
GET   /bookings/:id/driver-rating      (auth)   // rating booking ini, 404 jika belum
GET   /bookings/drivers/:driverId/ratings (admin) // { averageRating, totalRatings, ratings:[...] }
GET   /bookings/:id/activity           (admin|pemilik|driver-ditugaskan)
GET   /bookings/:id/attachments · POST /bookings/:id/attachments
POST  /bookings/:id/return-report (driver) · GET /bookings/:id/return-report
```

### Aturan penting
- **`POST /bookings` memakai `driverId`** (BUKAN `assignedDriverId`). Wajib `passengerCount ≥ 1`.
- **Akses `GET /bookings/:id` & `/activity`**: ADMIN/ROOM_KEEPER bebas, EMPLOYEE hanya pemilik,
  DRIVER hanya bila dia supir yang ditugaskan. (Mobile: jangan tampilkan activity kalau 403.)
- **Ketersediaan per-jendela-waktu**: filter overlap `startDate < end AND endDate > start`,
  hanya menghitung booking `APPROVED`/`ONGOING`. Supir yang ada trip **hari ini** tetap
  **tersedia** untuk **besok**.

### Siklus status
```
PENDING → (approve) APPROVED → (start) ONGOING → (complete) COMPLETED
        ↘ (reject)  REJECTED
        ↘ (cancel)  CANCELLED
APPROVED/ONGOING lewat waktu → OVERDUE
```

---

## 8. Model Alokasi Supir ↔ Kendaraan (WAJIB dipahami mobile)

Konsep inti: **supir tidak permanen memiliki kendaraan.** Kepemilikan mengikuti **siklus booking**.

1. **Awal:** setiap supir punya **0 kendaraan** (`assignedPlate = null`).
2. **Pilih supir "kosong"** (belum pegang kendaraan) di form booking → booking memakai
   **kendaraan yang kamu booking** (resource). Kapasitas/sisa kursi mengikuti kendaraan itu.
3. **Pilih supir "sibuk"** (sudah pegang kendaraan dari booking aktif) → memilihnya berarti
   **digabung (merge) ke tripnya** & memakai **kendaraan supir itu**; cek **kapasitas**
   (penumpang trip lama + baru ≤ kapasitas). UI menampilkan pemberitahuan merge.
4. **Tanpa memilih supir** (booking kendaraan) → sistem **auto-assign** supir kosong senggang.
   Bila **tak ada** yang senggang → booking tetap **PENDING tanpa supir** → admin bisa
   **menolak** dengan alasan "tidak ada supir available".
5. **Saat APPROVE** → supir "memegang" kendaraan booking (muncul `assignedPlate`).
6. **Saat COMPLETE** → kepemilikan **dilepas** (kecuali supir masih punya booking
   APPROVED/ONGOING lain).

**Implikasi untuk UI pemilihan supir (`/drivers/available`):**
- Daftar berisi **supir kosong** (badge "Kosong", info "akan pakai kendaraan yang kamu
  booking") **dan** **supir sibuk** (tampilkan sisa kursi + banner merge saat dipilih).
- Untuk supir kosong: `vehicleId/plateNumber/vehicleCapacity/remainingSeats = null` →
  gunakan **kapasitas kendaraan yang dibooking** sebagai kapasitas efektif; `remainingSeats`
  efektif = kapasitas itu (belum ada trip).
- **Auto-suggest** memprioritaskan supir **kosong**.

---

## 9. Pengalihan (Reassign) & Penggabungan (Merge)

### Alihkan (admin, saat approve)
- **VEHICLE**: `approve` lalu `assign-vehicle {driverId, vehicleId}` — juga memindah resource,
  set `originalResource`, `isReassigned=true`.
- **ROOM**: `substitute-resource {resourceId}` lalu `approve`.

### Merge (`POST /bookings/:id/merge`)
- `:id` (path) = **PRIMARY** (booking utama, APPROVED). Body `targetBookingId` = booking yang
  digabung (PENDING/APPROVED). Keduanya harus **VEHICLE**.
- Efek: target **dipindah ke kendaraan/resource PRIMARY** (resourceId + assignedVehicle +
  assignedDriver ikut primary; `originalResource` target tersimpan → hemat kendaraan).
- Kandidat "booking utama" di UI = booking **APPROVED** di **hari yang sama** (siapa pun
  pemiliknya). Jendela waktu gabungan = union kedua booking (bisa dioverride via `startDate`/`endDate`).

### Penanda di LIST booking (field di §5)
- `isReassigned + originalResource` → badge **"Dialihkan dari {nama asal}"**.
- `mergedIntoId` → badge **"Digabung ke #{id}"** (booking sekunder).
- `mergeCount > 0` → badge **"Main · {n} gabungan"** (booking utama).
- `hasMergeSuggestion` → badge **"Kandidat Merge"**.

---

## 10. Fuel, Maintenance, Rating, Settings

### Fuel (`POST /fuel-expenses`, multipart)
Field: `vehicleId`, `bookingId?`, **`fuelTypeId`** (referensi master, WAJIB), `fuelGrade?`,
`liter/pricePerLiter` (BBM) atau `kwh/pricePerKwh` (LISTRIK), `odometerBefore/After`, `note?`,
**`proofPhoto`** (file, WAJIB). `totalCost` dihitung backend (`quantity × pricePerUnit`).
- **BBM vs LISTRIK ditentukan `type` dari fuel-type terpilih.** Di form: pilih **Tipe Energi
  (BBM/Listrik)** dulu → daftar jenis difilter (BBM → Solar/Pertalite/…, Listrik → jenis listrik).
- **Riwayat per booking**: `GET /fuel-expenses?bookingId=<id>` — tampilkan di detail booking.

### Maintenance (VEHICLE-only)
- `POST /maintenance` (JSON) wajib: `vehicleId, type, status, description, location, startDate`;
  opsional `maintenanceTypeId, odometer, totalCost, vendorName, endDate`.
- **Selesaikan**: `PUT /maintenance/:id` (payload lengkap, `totalCost` final) lalu
  `PATCH /maintenance/:id/complete` (multipart `photos` → `proofPhotos[]`, status → completed).
- Status derivable dari `endDate` (null = berjalan).

### Rating driver
- Muncul **hanya** untuk **pemilik** booking yang **COMPLETED** (kendaraan + ada supir).
- Modal auto-muncul **sekali** (tandai lokal per booking id); sisanya via tombol "Beri Rating".
- Cek sudah dirating: `GET /bookings/:id/driver-rating` (404 = belum). Sudah → tampilkan
  bintang + ulasan (read-only).
- Detail supir menampilkan daftar rating: `GET /bookings/drivers/:driverId/ratings`
  → `{ averageRating, totalRatings, ratings: [{ id, rating, review, ratedBy:{id,name}, createdAt }] }`.

### Settings
- `GET /master-settings`, `GET/PUT /master-settings/:key` → `{ key, value(string), unit, description }`.
- Harga acuan BBM/listrik dikelola via **Fuel Types** (`defaultPrice`), bukan master-settings.

---

## 11. Reports (semua admin)

> **Perhatian bentuk data** (sudah diselaraskan ke struct Go asli). Envelope tetap `{data}`.

| Endpoint | Query | Bentuk `data` |
|---|---|---|
| `/reports/overview` | `period=monthly\|quarterly\|yearly` | `{ totalBookings, totalCost, avgUtilization, overdueCount, previousPeriod{…}, changePercent{bookings,cost,utilization,overdue} }` |
| `/reports/bookings` | `startDate,endDate` | `{ total, completed, pending, approved, ongoing, cancelled, rejected, overdue }` |
| `/reports/bookings/trend` | `groupBy,periods` | `[{ period, count, vehicle, room }]` |
| `/reports/bookings/by-department` | `startDate,endDate` | `[{ departmentId, departmentName, total, pending, approved, completed, cancelled, rejected }]` |
| `/reports/bookings/by-resource` | `startDate,endDate` | `[{ resourceId, resourceName, resourceType, totalBookings, totalHours }]` |
| `/reports/bookings/approval-performance` | `startDate,endDate` | **objek** `{ avgApprovalTimeHours, approvedWithin24h, totalProcessed }` |
| `/reports/cost-summary` | `startDate,endDate` | `{ totalFuelCost, totalMaintenanceCost, totalCost, previousPeriod{…}, changePercent{fuel,maintenance,total} }` |
| `/reports/cost/by-vehicle` | `startDate,endDate` | `[{ vehicleId, name, plateNumber, fuelCost, maintenanceCost, totalCost, totalKm, avgCostPerKm }]` |
| `/reports/cost/by-department` | `startDate,endDate` | `[{ departmentId, departmentName, bookingCount, fuelCost, maintenanceCost, totalCost }]` |
| `/reports/cost/trend` | `groupBy,periods` | `[{ period, fuelCost, maintenanceCost, totalCost }]` |
| `/reports/driver-performance` | `startDate,endDate` | `[{ driverId, driverName, totalTrips, totalKm, totalFuelCost, avgCostPerKm, avgRating, totalReviews, onTimeRate, lateCount }]` |
| `/reports/department-summary` | `startDate,endDate` | `[{ departmentId, departmentName, bookingCount, fuelCost, maintenanceCost, totalCost, topResource }]` |
| `/reports/resource-usage` | — | `[v_vehicle_summary]` (snake_case: `vehicle_name, total_bookings, completed_bookings, total_fuel_cost…`) |
| `/reports/driver-ratings` | — | `[v_driver_ratings_summary]` (snake_case: `driver_name, average_rating(string), bintang_5..1`) |
| `/reports/driver-activity` | — | `[{ driver_id, driver_name, total_bookings, completed_bookings, total_fuel_expenses }]` |
| `/reports/audit-logs` | `page,limit,entityType,userId` | paginated `[{ id, userName, action, entityType, entityId, description, createdAt }]` |

> Endpoint report memfilter berdasarkan `fuel_expenses."createdAt"` / `maintenance_records."startDate"`.
> Data di luar rentang → 0 (bukan error).

---

## 12. Design System (untuk konsistensi mobile)

**Font:** Heading = Plus Jakarta Sans (700/800); Body/UI = Inter (400/500/600).

**Warna:**
| Token | Hex | | Token | Hex |
|---|---|---|---|---|
| primary | `#2D2CE8` | | success | `#16A34A` |
| primary-dark | `#1A19B5` | | warning | `#D97706` |
| primary-light | `#E8E8FC` | | danger | `#DC2626` |
| bg-page | `#F5F6FA` | | info | `#0284C7` |
| bg-card | `#FFFFFF` | | text-primary | `#111827` |
| bg-subtle | `#F8F9FB` | | text-secondary | `#6B7280` |
| border-card | `#E8EAED` | | text-disabled | `#9CA3AF` |

**Radius:** Card/Modal `12px` · Input/Button `8px` · Badge/Chip `full` · Avatar `full`.
**Tinggi:** Input/Button `40px` · Navbar `56px` · Sidebar `240px`.

**Booking Status (bg / text / dot):**
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

## 13. Menjalankan (web)

```bash
pnpm install
pnpm dev                     # http://localhost:3000
pnpm exec tsc --noEmit       # gate verifikasi (ESLint rusak — jangan diandalkan)
```
Konfigurasi base URL API: `NEXT_PUBLIC_API_BASE_URL` (default `http://localhost:8080`).
Mobile: gunakan **LAN-IP** perangkat host (bukan `localhost`).

---

## 14. Changelog kontrak (perubahan terbaru — perlu diikuti mobile)

- **Alokasi supir ↔ kendaraan berbasis siklus booking** (§8): supir 0 kendaraan → dapat saat
  approve → lepas saat complete; `/drivers/available` kini menyertakan **supir kosong** (vehicle
  fields nullable); auto-assign supir senggang bila tak dipilih.
- **List booking**: field baru `originalResource`, `mergedIntoId`, `mergeCount`, `isMerged` →
  penanda "Dialihkan dari X" / "Digabung ke #Y" / "Main · N gabungan" (§9).
- **Merge memindah resource** target ke kendaraan primary (hemat kendaraan).
- **Fuel**: `proofPhotoUrl` di response; filter `bookingId`; pemilihan **Tipe Energi** lalu
  jenis BBM/Listrik terfilter; riwayat pengisian di detail booking.
- **Rating**: modal sekali-tampil per booking; `GET /bookings/:id/driver-rating`; daftar rating
  di detail supir.
- **Activity**: akses diperluas ke **driver yang ditugaskan** (bukan cuma admin/pemilik).
- **Reports**: seluruh nama field diselaraskan ke struct Go (§11) — banyak yang sebelumnya
  salah (mis. `totalBookings`→`total`, `vehicleName`→`name`, `totalFuelCost`→`fuelCost`).
