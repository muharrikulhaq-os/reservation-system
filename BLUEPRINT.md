# Halaman 1

DOKUMEN ANALISIS FITUR Reservation Booking System Blueprint Platform
Pemesanan Kendaraan & Ruangan

Disusun berdasarkan analisis kebutuhan user. Versi 1.0, Maret 2026

------------------------------------------------------------------------

# Halaman 2

Reservation Booking System · Dokumen Analisis Fitur & Activity Diagram
Halaman 1 Rahasia & Konfidensial © 2026 Daftar Isi Daftar Isi
...........................................................................................................................................
1 1.
Pendahuluan.................................................................................................................................
4 1.1 Teknologi yang Digunakan
......................................................................................................
4 1.2 Role Pengguna
.......................................................................................................................
4 1.3 Status Booking
........................................................................................................................
4 2. Daftar Fitur Lengkap
.....................................................................................................................
5 2.1 Autentikasi
..............................................................................................................................
5 2.2 Dashboard
..............................................................................................................................
5 2.3 Resource (Kendaraan &
Ruangan).........................................................................................
5 2.4 Kalender Resource & Booking
................................................................................................
6 2.5 Booking Saya (My
Bookings)..................................................................................................
7 2.6 Semua Booking (Admin & Approver)
......................................................................................
7 2.7 Booking --- Antarmuka Driver
.................................................................................................
8 2.8 Manajemen Maintenance
.......................................................................................................
9 2.9 Manajemen Bahan Bakar (Fuel Expense)
..............................................................................
9 2.10 Manajemen Lampiran (Attachment)
....................................................................................
10 2.11 Foto Profil
...........................................................................................................................
10 2.12 Manajemen User (Admin)
...................................................................................................
11 2.13 Laporan & Analitik (Admin)
.................................................................................................
11 2.14 UI & Navigasi
.....................................................................................................................
11 3. Alur kerja
....................................................................................................................................
13 3.1 Diagram 1: Autentikasi (Login & Logout)
...............................................................................
13 3.2 Diagram 2: Alur peminjaman
.................................................................................................
14 3.3 Diagram 3: Alur peminjaman -- user/karyawan
......................................................................
14 3.4 Diagram 4: Alur peminjaman -- Admin
...................................................................................
15 3.5 Diagram 5: Alur peminjaman -- Driver
....................................................................................
15 3.6 Diagram 6: Alur peminjaman -- Pengawas ruangan
............................................................... 16 3.7
Diagram 7: Pengembalian kendaraan
...................................................................................
16 3.8 Diagram 8: Penyelesaian peminjaman ruangan
.................................................................... 17
3.9 Diagram 9: Manajemen User (Admin)
...................................................................................
17 3.10 Diagram 10: Laporan & Analitik (Admin)
..............................................................................
18 3.11 Diagram 11: Pengisian bahan bakar (Driver)
.......................................................................
18 3.12 Diagram 12: Maintenance (Admin)
......................................................................................
19 4. Ringkasan Alur Status Booking
...................................................................................................
20 4.1 Status Booking Internal (Employee)
......................................................................................
20 4.2 Matriks Aksi per Role
............................................................................................................
20 5. Entity Relationship Diagram
........................................................................................................
21 1. Domain Pengguna &
Autentikasi..........................................................................................
21

------------------------------------------------------------------------

# Halaman 3

Reservation Booking System · Dokumen Analisis Fitur & Activity Diagram
Halaman 2 Rahasia & Konfidensial © 2026 2. Domain Resource (Kendaraan &
Ruangan)
.........................................................................
22 3. Domain Booking
..................................................................................................................
22 4. Domain Driver
......................................................................................................................
22 5. Domain Operasional Kendaraan
..........................................................................................
22 6. Domain Sistem & Utilitas
.....................................................................................................
23 6. Usecase Diagram
.......................................................................................................................
24 7. Penutup
......................................................................................................................................
25

------------------------------------------------------------------------

# Halaman 4

Reservation Booking System · Dokumen Analisis Fitur & Activity Diagram
Halaman 3 Rahasia & Konfidensial © 2026 Daftar Gambar Gambar 1 Alur
Login
.......................................................................................................................
13 Gambar 2 Alur Peminjaman
............................................................................................................
14 Gambar 3 Alur peminjaman - user/karyawan
..................................................................................
14 Gambar 4 Alur peminjaman - Admin
...............................................................................................
15 Gambar 5 Alur peminjaman -- Driver
...............................................................................................
15 Gambar 6 Alur peminjaman -- Pengawas ruangan
..........................................................................
16 Gambar 7 Pengembalian kendaraan
..............................................................................................
16 Gambar 8 Penyelesaian peminjaman ruangan
...............................................................................
17 Gambar 9 Manajemen User (Admin)
..............................................................................................
17 Gambar 10 Laporan & Analitik (Admin)
...........................................................................................
18 Gambar 11 Pengisian bahan bakar (Driver)
....................................................................................
18 Gambar 12 Maintenance (Admin)
...................................................................................................
19 Gambar 13 Entiti Relationship Diagram
..........................................................................................
21 Gambar 14 Usecase Diagram
.........................................................................................................
24

------------------------------------------------------------------------

# Halaman 5

Reservation Booking System · Dokumen Analisis Fitur & Activity Diagram
Halaman 4 Rahasia & Konfidensial © 2026 1. Pendahuluan Reservation
Booking System adalah platform web dan mobile berbasis React +
TypeScript dan Flutter yang digunakan untuk mengelola pemesanan
(booking) kendaraan dan ruangan secara digital. Dokumen ini berisi: •
Daftar lengkap seluruh fitur yang terdapat dalam sistem • Alur kerja
(workflow) tiap fitur secara detail • Diagram Activity UML untuk
masing-masing fitur utama • Entity Relationship Diagram 1.1 Teknologi
yang Digunakan Frontend: React 18, TypeScript, Tailwind CSS, shadcn/ui,
Vite, React Router v6, Flutter Backend: Python, PostgreSQL, fastapi, JWT
Auth, REST API 1.2 Role Pengguna Sistem memiliki empat jenis role dengan
hak akses berbeda: • EMPLOYEE --- Pengguna biasa; dapat booking resource
dan melihat booking sendiri • DRIVER --- Role khusus pengemudi kendaraan
• ADMIN --- Akses penuh: semua fitur termasuk manajemen user, guest
booking, dan laporan • CUSTODIAN --- Role yang memiliki fitur paling
sedikit, karena hanya menerima booking untuk ruangan 1.3 Status Booking
Setiap booking memiliki siklus status sebagai berikut: PENDING →
APPROVED → ONGOING → COMPLETED atau: PENDING → REJECTED \|
PENDING/APPROVED → CANCELLED \| ONGOING → OVERDUE

------------------------------------------------------------------------

# Halaman 6

Reservation Booking System · Dokumen Analisis Fitur & Activity Diagram
Halaman 5 Rahasia & Konfidensial © 2026 2. Daftar Fitur Lengkap 2.1
Autentikasi Semua pengguna wajib login untuk mengakses aplikasi. Tidak
ada lagi halaman atau akses publik tanpa autentikasi. \# Nama Fitur
Deskripsi Aktor Endpoint API F01 Login User memasukkan email & password.
Sistem memvalidasi field wajib, lalu mengirim ke API. JWT access token
disimpan di localStorage setelah berhasil. Tersedia toggle show/hide
password. Semua Role POST /auth/login F02 Logout Menghapus token dan
data user dari localStorage, mereset state aplikasi global, lalu
mengarahkan kembali ke halaman Login. Semua Role --- (local state) F03
Auto-login Saat aplikasi dibuka, sistem memeriksa keberadaan token di
localStorage. Jika valid, langsung boot ke Dashboard tanpa perlu login
ulang. Semua Role --- (local state)

2.2 Dashboard Halaman pertama setelah login. Menampilkan ringkasan
statistik dan akses cepat ke resource tersedia. \# Nama Fitur Deskripsi
Aktor Endpoint API F04 Stat Cards Menampilkan 4 kartu statistik
ringkasan: Total Kendaraan, Total Ruangan, jumlah booking berstatus
PENDING, dan jumlah booking berstatus ONGOING. Semua Role GET /vehicles,
/rooms, /bookings F05 Tabel Booking Terbaru Menampilkan 8 booking
terbaru milik user yang sedang login dengan kolom: resource, tanggal
mulai, status, dan tombol detail (👁). Semua Role GET /bookings?limit=100
F06 Panel Resource Tersedia Panel sisi kanan dashboard menampilkan
kendaraan dan ruangan berstatus AVAILABLE. Terdapat tombol kalender
untuk langsung membuka kalender resource tersebut. Semua Role GET
/vehicles, /rooms

2.3 Resource (Kendaraan & Ruangan) Halaman penelusuran semua resource.
Pengguna dapat melihat ketersediaan dan langsung melakukan booking dari
sini. \# Nama Fitur Deskripsi Aktor Endpoint API F07 Tampil Grid
Resource Menampilkan semua kendaraan dan ruangan dalam bentuk kartu
grid. Setiap kartu memuat ikon tipe, nama, info detail
(merek/model/lokasi), tag kategori, dan status resource. Semua Role GET
/vehicles, /rooms F08 Filter Tipe Chip filter untuk menyaring grid
berdasarkan tipe: Semua / Kendaraan (VEHICLE) / Ruangan (ROOM). Berjalan
di sisi klien tanpa request ulang ke server. Semua Role ---
(client-side) F09 Filter Status Dropdown untuk menyaring resource
berdasarkan status: AVAILABLE, MAINTENANCE, atau INACTIVE. Semua Role
--- (client-side)

------------------------------------------------------------------------

# Halaman 7

Reservation Booking System · Dokumen Analisis Fitur & Activity Diagram
Halaman 6 Rahasia & Konfidensial © 2026 \# Nama Fitur Deskripsi Aktor
Endpoint API F10 Search Resource Pencarian real-time saat user mengetik.
Mencari berdasarkan nama resource, nomor plat kendaraan, atau lokasi
ruangan. Semua Role --- (client-side) F11 Indikator Status Dot berwarna
di pojok setiap kartu resource: Hijau = AVAILABLE, Kuning = MAINTENANCE,
Abu- abu = INACTIVE. Kartu resource non-AVAILABLE ditampilkan memudar
dan tombol booking dinonaktifkan. Semua Role --- (UI only)

2.4 Kalender Resource & Booking Modal kalender interaktif per resource.
Memperlihatkan ketersediaan dan memungkinkan user membuat booking
langsung dari tampilan kalender. \# Nama Fitur Deskripsi Aktor Endpoint
API F12 Buka Kalender Resource Klik tombol 'Lihat Kalender' pada kartu
resource (hanya aktif jika status AVAILABLE) untuk membuka modal
kalender. Sistem langsung mengambil data booking aktif resource
tersebut. Semua Role GET /bookings?resourceId={id} F13 Render Grid
Kalender Kalender bulanan merender setiap tanggal dengan dot berwarna
sesuai status booking aktif: PENDING (kuning), APPROVED (hijau), ONGOING
(biru), OVERDUE (oranye). Tanggal lampau ditampilkan abu-abu. Semua Role
--- (client-side) F14 Navigasi Bulan Tombol ‹ dan › untuk berpindah
antar bulan dalam kalender. Data booking yang sudah difetch digunakan
kembali selama masih dalam rentang yang tersedia. Semua Role ---
(client-side) F15 Pilih Tanggal (Range) Klik tanggal pertama untuk
memilih tanggal mulai, klik tanggal kedua untuk memilih tanggal selesai.
Rentang yang dipilih ditampilkan dengan highlight biru. Klik ketiga
mereset pilihan. Employee, Admin --- (client-side) F16 Tooltip Detail
Hari Hover pada hari yang memiliki booking menampilkan tooltip berisi
status dan nama pemesan untuk setiap booking aktif di hari tersebut.
Semua Role --- (client-side) F17 Klik Hari Berisi Booking Klik pada hari
yang memiliki booking aktif menampilkan daftar detail booking tersebut
(keperluan, pemesan, rentang waktu, status) di panel kiri modal
kalender. Semua Role --- (client-side) F18 Form Booking dari Kalender
Setelah rentang tanggal dipilih, user mengisi jam mulai, jam selesai,
dan keperluan. Klik 'Book Sekarang' untuk mengajukan booking. Employee,
Admin POST /bookings F19 Validasi Form Booking Sistem memvalidasi
sebelum submit: minimal satu tanggal dipilih, jam mulai dan selesai
tidak kosong, keperluan terisi, dan waktu selesai harus lebih besar dari
waktu mulai. Sistem --- (client-side)

------------------------------------------------------------------------

# Halaman 8

Reservation Booking System · Dokumen Analisis Fitur & Activity Diagram
Halaman 7 Rahasia & Konfidensial © 2026 2.5 Booking Saya (My Bookings)
Halaman untuk melihat dan mengelola seluruh booking yang dibuat oleh
pengguna yang sedang login. \# Nama Fitur Deskripsi Aktor Endpoint API
F20 Daftar Booking Saya Tabel semua booking milik user yang sedang
login, diurutkan dari terbaru. Kolom: nomor ID, resource, tanggal mulai,
tanggal selesai, keperluan, status, dan kolom aksi. Employee, Admin GET
/bookings?limit=100 F21 Filter Status Booking Dropdown untuk menyaring
daftar booking berdasarkan status: PENDING, APPROVED, ONGOING,
COMPLETED, REJECTED, CANCELLED, atau OVERDUE. Employee, Admin GET
/bookings?status={s} F22 Detail Booking Modal detail lengkap satu
booking: informasi resource, data pemohon (nama, ID karyawan,
departemen), tanggal mulai dan selesai, keperluan, status saat ini, nama
approver, dan waktu diproses. Employee, Admin GET /bookings/{id} F23
Batalkan Booking User dapat membatalkan booking miliknya yang masih
berstatus PENDING. Sistem menampilkan dialog konfirmasi sebelum
eksekusi. Status berubah menjadi CANCELLED. Employee, Admin PATCH
/bookings/{id}/cancel F24 Lampiran Booking Ikon di setiap baris tabel
membuka modal Attachment berisi daftar lampiran terkait booking
tersebut. Employee, Admin GET /bookings/{id}/attachments F25 Rating &
Review Driver Setelah booking berstatus COMPLETED dan melibatkan driver,
user dapat memberikan penilaian berupa rating bintang (1--5) dan
komentar review kepada driver yang bertugas. Employee, Admin POST
/bookings/{id}/rate- driver

2.6 Semua Booking (Admin & Approver) Halaman manajemen booking untuk
Admin dan Approver. Menampilkan seluruh booking dari semua pengguna dan
menyediakan aksi approval serta transisi status.

# 

Nama Fitur Deskripsi Aktor Endpoint API F26 Daftar Semua Booking Tabel
semua booking dari seluruh pengguna sistem, default filter PENDING.
Kolom: nomor ID, pemohon (nama + ID karyawan), resource (nama + tipe),
tanggal, status, dan kolom aksi. Admin, Approver GET /bookings?limit=100
F27 Filter Semua Booking Filter berdasarkan status booking (PENDING,
APPROVED, ONGOING, COMPLETED, REJECTED, OVERDUE) dan tipe resource
(Kendaraan / Ruangan). Keduanya dapat dikombinasikan. Admin, Approver
GET /bookings?status=&resourceType= F28 Approve Booking Klik tombol ✓
hijau pada booking PENDING → modal konfirmasi dengan isian catatan
(opsional) → klik Approve → status berubah menjadi APPROVED. Admin,
Approver POST /bookings/{id}/approve F29 Reject Booking Klik tombol ✗
merah pada booking PENDING → modal konfirmasi dengan isian alasan
penolakan (WAJIB diisi) → klik Admin, Approver POST
/bookings/{id}/reject

------------------------------------------------------------------------

# Halaman 9

Reservation Booking System · Dokumen Analisis Fitur & Activity Diagram
Halaman 8 Rahasia & Konfidensial © 2026 \# Nama Fitur Deskripsi Aktor
Endpoint API Reject → status berubah menjadi REJECTED. F30 Mulai Booking
(ONGOING) Klik tombol ▶ pada booking berstatus APPROVED → dialog
konfirmasi → status berubah menjadi ONGOING. Resource dianggap sedang
digunakan. Admin, Approver PATCH /bookings/{id}/start F31 Selesaikan
Booking Klik tombol ■ pada booking berstatus ONGOING atau OVERDUE →
dialog konfirmasi → status berubah menjadi COMPLETED. Resource
dikembalikan. Admin, Approver PATCH /bookings/{id}/complete F32 Lampiran
di All Bookings Ikon tersedia di setiap baris tabel. Admin dan Approver
dapat melihat, menambah, dan menghapus lampiran terkait booking
tersebut. Admin, Approver GET/POST /bookings/{id}/attachments

2.7 Booking --- Antarmuka Driver Halaman khusus untuk peran Driver.
Driver hanya melihat booking yang terkait dengan kendaraan yang
ditugaskan kepadanya. \# Nama Fitur Deskripsi Aktor Endpoint API F33
Halaman Booking Driver Menampilkan daftar booking masuk yang menggunakan
kendaraan yang ditugaskan kepada Driver tersebut. Driver tidak dapat
melihat booking kendaraan milik driver lain. Driver GET
/bookings?driverId={id} F34 Detail Booking Driver Driver dapat membuka
detail satu booking: informasi kendaraan, identitas penyewa (nama,
departemen), tanggal dan waktu perjalanan, keperluan, serta status saat
ini. Driver GET /bookings/{id} F35 Terima Booking Driver mengonfirmasi
kesanggupan untuk menjalankan penugasan sebelum perjalanan dimulai.
Driver PATCH /bookings/{id}/accept F36 Mulai Perjalanan Saat waktu yang
ditentukan tiba, Driver mengubah status booking menjadi ONGOING dengan
menekan tombol 'Mulai Perjalanan'. Driver PATCH /bookings/{id}/start F37
History Perjalanan Driver Driver dapat melihat riwayat semua perjalanan
yang telah diselesaikan beserta informasi: kendaraan, penyewa, tanggal,
dan durasi perjalanan. Driver GET
/bookings?driverId={id}&status=COMPLETED

------------------------------------------------------------------------

# Halaman 10

Reservation Booking System · Dokumen Analisis Fitur & Activity Diagram
Halaman 9 Rahasia & Konfidensial © 2026

2.8 Manajemen Maintenance Fitur baru. Mengelola jadwal dan riwayat
perawatan untuk kendaraan maupun ruangan. Admin mengubah status resource
dan mencatat detail pekerjaan maintenance. \# Nama Fitur Deskripsi Aktor
Endpoint API F38 Halaman Maintenance Menampilkan daftar semua resource
(kendaraan dan ruangan) beserta status maintenance terkini. Tersedia
filter berdasarkan tipe resource (kendaraan/ruangan) dan status. Admin
GET /vehicles, /rooms F39 Detail Resource & Riwayat Maintenance Admin
membuka halaman detail satu resource untuk melihat seluruh riwayat
maintenance yang pernah dilakukan: tanggal, deskripsi pekerjaan, biaya,
dan status tiap sesi. Admin GET /maintenance?resourceId={id} F40 Tambah
Catatan Maintenance Admin membuat entri maintenance baru dengan mengisi:
resource yang dirawat, tanggal mulai, estimasi tanggal selesai,
deskripsi pekerjaan, biaya estimasi, dan status awal (ONGOING). Admin
POST /maintenance F41 Update / Selesaikan Maintenance Admin memperbarui
catatan maintenance yang sedang berjalan, misalnya mengubah status dari
ONGOING menjadi COMPLETED, mengisi biaya aktual, dan menambahkan catatan
hasil pekerjaan. Admin PATCH /maintenance/{id} F42 Ubah Status Resource
ke MAINTENANCE Admin mengubah status resource menjadi MAINTENANCE
sehingga resource tidak dapat dipesan oleh pengguna lain selama proses
perawatan berlangsung. Admin PATCH /resources/{id}/status F43 Ubah
Status Resource ke AVAILABLE Setelah pekerjaan maintenance selesai,
Admin mengubah status resource kembali menjadi AVAILABLE agar dapat
dipesan kembali oleh pengguna. Admin PATCH /resources/{id}/status

2.9 Manajemen Bahan Bakar (Fuel Expense) Fitur baru. Mencatat setiap
pengisian bahan bakar (BBM bensin/solar) atau pengisian daya listrik
untuk kendaraan. Driver menginput data, Admin memverifikasi. \# Nama
Fitur Deskripsi Aktor Endpoint API F44 Halaman Bahan Bakar Menampilkan
daftar seluruh kendaraan beserta ringkasan total pengisian bahan bakar
atau daya listrik terkini. Tersedia filter berdasarkan jenis kendaraan
dan rentang tanggal. Admin, Driver GET /fuel-expenses F45 Detail
Kendaraan & Riwayat BBM Membuka halaman detail satu kendaraan yang
memuat seluruh riwayat pengisian: tanggal, jenis (BBM/Listrik), jumlah
(liter/kWh), harga per satuan, total biaya, dan status verifikasi.
Admin, Driver GET /fuel- expenses?vehicleId={id} F46 Tambah Pengisian
Bahan Bakar Driver atau Admin membuat entri pengisian baru dengan
mengisi: kendaraan, tanggal pengisian, jenis bahan bakar (BBM atau
Listrik), jumlah (liter atau kWh), harga per satuan, total biaya, dan
catatan opsional. Admin, Driver POST /fuel-expenses

------------------------------------------------------------------------

# Halaman 11

Reservation Booking System · Dokumen Analisis Fitur & Activity Diagram
Halaman 10 Rahasia & Konfidensial © 2026 \# Nama Fitur Deskripsi Aktor
Endpoint API F47 Verifikasi Pengisian BBM Admin memverifikasi entri
pengisian yang diinput oleh Driver untuk memastikan kebenaran data dan
nominal sebelum dicatat sebagai data final dan masuk ke laporan. Admin
PATCH /fuel- expenses/{id}/verify F48 Hapus Entri Pengisian BBM Admin
dapat menghapus entri pengisian yang salah atau duplikat. Sistem
menampilkan dialog konfirmasi sebelum penghapusan permanen dilakukan.
Admin DELETE /fuel- expenses/{id}

2.10 Manajemen Lampiran (Attachment) Sistem lampiran berlaku untuk tiga
entitas: Resource (kendaraan/ruangan), Booking, dan Maintenance. Semua
role dapat melihat; hanya Admin yang dapat menambah dan menghapus. \#
Nama Fitur Deskripsi Aktor Endpoint API F49 Lampiran Resource Tombol di
kartu resource membuka modal daftar lampiran dokumen terkait resource
tersebut, misalnya STNK, foto kendaraan, atau denah ruangan. Semua Role
GET /vehicles\|rooms/{id}/attachments F50 Lampiran Booking Lampiran
terkait transaksi booking, misalnya surat izin perjalanan, bukti
pembayaran, atau dokumen pendukung lainnya. Semua Role GET/POST
/bookings/{id}/attachments F51 Tambah Lampiran Form untuk menambah
lampiran baru: URL file, nama file, tipe dokumen (PDF / Image / Word /
Excel / ZIP), dan deskripsi opsional. Hanya Admin yang dapat menambah.
Admin POST /\[type\]/{id}/attachments F52 Hapus Lampiran Tombol hanya
tampil untuk Admin. Sistem menampilkan dialog konfirmasi sebelum
lampiran dihapus secara permanen. Admin DELETE /attachments/{id} F53
Buka / Preview Lampiran Ikon di setiap item lampiran membuka URL file di
tab browser baru sehingga user dapat melihat atau mengunduh dokumen.
Semua Role --- (external link)

2.11 Foto Profil Semua pengguna dapat mengatur foto profil pribadi
mereka masing-masing.

# 

Nama Fitur Deskripsi Aktor Endpoint API F54 Buka Modal Profil Klik
avatar user di sidebar membuka modal pengaturan foto profil. Semua Role
--- (modal) F55 Preview Foto User memasukkan URL foto lalu menekan
tombol 'Preview' untuk melihat tampilan foto sebelum disimpan ke server.
Semua Role --- (client-side) F56 Simpan Foto Profil Menyimpan URL foto
ke server. Avatar di sidebar diperbarui secara real-time dan data
disinkronkan ke localStorage. Semua Role PUT /users/me/profile- photo
F57 Hapus Foto Profil Menghapus foto profil dari server. Avatar kembali
menampilkan inisial huruf pertama nama pengguna. Semua Role DELETE
/users/me/profile-photo

------------------------------------------------------------------------

# Halaman 12

Reservation Booking System · Dokumen Analisis Fitur & Activity Diagram
Halaman 11 Rahasia & Konfidensial © 2026

2.12 Manajemen User (Admin) Hanya Admin yang dapat mengakses halaman ini
untuk mengelola seluruh akun pengguna sistem. \# Nama Fitur Deskripsi
Aktor Endpoint API F58 Daftar User Tabel semua user terdaftar dengan
kolom: Employee ID, Nama, Email, Role, Departemen, Status Aktif, dan
kolom Aksi. Admin GET /users?limit=100 F59 Filter & Search User Filter
berdasarkan role (Employee / Approver / Admin / Driver) dan pencarian
real-time berdasarkan nama atau alamat email. Admin GET
/users?search=&roleId= F60 Ubah Role User Admin dapat mengubah peran
pengguna antara: Employee ↔ Approver ↔ Admin ↔ Driver. Admin PUT
/users/{id}/role F61 Aktifkan / Nonaktifkan User Toggle status aktif
pengguna. User yang dinonaktifkan tidak dapat login ke sistem. Data akun
tetap tersimpan (soft disable, bukan hapus permanen). Admin PATCH
/users/{id}/status

2.13 Laporan & Analitik (Admin) Dashboard analitik khusus Admin. Semua
data laporan diambil secara paralel dari beberapa endpoint sekaligus. \#
Nama Fitur Deskripsi Aktor Endpoint API F62 Ringkasan Booking Statistik
total booking beserta breakdown per status (PENDING, APPROVED, ONGOING,
REJECTED, OVERDUE) dan daftar resource yang paling sering dipesan. Admin
GET /reports/bookings F63 Booking Overdue Daftar booking yang melewati
batas waktu selesai tanpa ditandai COMPLETED. Informasi: nama user,
resource, dan tanggal seharusnya selesai. Admin GET /reports/overdue-
bookings F64 Laporan BBM Ringkasan penggunaan bahan bakar seluruh
kendaraan: total liter / kWh, total biaya (Rp), jumlah transaksi
pengisian, dan trend per bulan. Admin GET /reports/fuel- expenses F65
Laporan Maintenance Rekap maintenance semua resource: total biaya
keseluruhan, jumlah pekerjaan yang sudah selesai, dan jumlah pekerjaan
yang masih berjalan. Admin GET /reports/maintenance- cost

2.14 UI & Navigasi Komponen antarmuka yang berjalan lintas halaman dan
digunakan oleh semua role.

# 

Nama Fitur Deskripsi Aktor Endpoint API F66 Sidebar Navigasi Sidebar
menampilkan avatar, nama, dan role pengguna. Menu yang ditampilkan
berbeda berdasarkan role: Employee hanya melihat menu dasar; Approver
mendapat All Bookings; Admin mendapat semua menu. Semua Role --- (UI)
F67 Sidebar Responsif Pada layar mobile (lebar \< 992px), sidebar
tersembunyi dan dapat ditampilkan / Semua Role --- (UI)

------------------------------------------------------------------------

# Halaman 13

Reservation Booking System · Dokumen Analisis Fitur & Activity Diagram
Halaman 12 Rahasia & Konfidensial © 2026 \# Nama Fitur Deskripsi Aktor
Endpoint API disembunyikan menggunakan tombol hamburger (☰). F68 Toast
Notifikasi Notifikasi singkat muncul di pojok layar setelah setiap aksi:
hijau untuk sukses, merah untuk error, biru untuk informasi. Hilang
otomatis setelah ±3,8 detik. Sistem --- (UI) F69 Skeleton Loading
Animasi placeholder blok abu-abu ditampilkan selama data sedang dimuat
dari API, mencegah tampilan kosong yang membingungkan pengguna. Sistem
--- (UI) F70 Empty State Tampilan informatif dengan ikon dan pesan
ketika tidak ada data yang ditemukan di tabel atau grid resource. Sistem
--- (UI) F71 Status Badge Lencana berwarna untuk setiap status booking:
PENDING (kuning), APPROVED (hijau), ONGOING (biru), COMPLETED (abu-abu),
REJECTED (merah), CANCELLED (ungu), OVERDUE (oranye). Sistem --- (UI)
F72 Role-based Navigation Visibilitas menu sidebar dan tombol aksi di
setiap halaman dikontrol oleh role. Pengguna tidak dapat mengakses
halaman di luar hak aksesnya meskipun URL diakses langsung. Sistem ---
(UI)

------------------------------------------------------------------------

# Halaman 14

Reservation Booking System · Dokumen Analisis Fitur & Activity Diagram
Halaman 13 Rahasia & Konfidensial © 2026 3. Alur kerja Alur kerja
berikut menggambarkan setiap fitur yang akan diimplementasikan dalam
project. Setiap alur menggunakan simbol standar: • Rounded persegi
panjang = Activity Start&Final Node (titik awal dan akhir alur) •
Persegi panjang = Action/Activity (langkah/tindakan) • Belah ketupat =
Decision Node (percabangan kondisi) • Panah = Control Flow (arah alur)
3.1 Diagram 1: Autentikasi (Login & Logout) Alur autentikasi dimulai
dari pemeriksaan token tersimpan. Jika token valid maka langsung masuk
Dashboard. Jika tidak, user mengisi form login yang divalidasi
client-side sebelum dikirim ke API. Token JWT disimpan di localStorage
setelah berhasil.

Gambar 1 Alur Login

------------------------------------------------------------------------

# Halaman 15

Reservation Booking System · Dokumen Analisis Fitur & Activity Diagram
Halaman 14 Rahasia & Konfidensial © 2026 3.2 Diagram 2: Alur peminjaman
Alur peminjaman secara menyeluruh akan dibahas di diagram selanjutnya

Gambar 2 Alur Peminjaman 3.3 Diagram 3: Alur peminjaman -- user/karyawan
User login ke dalam aplikasi, membuka halaman booking dan melihat daftar
resource yang tersedia. Kalender pop up akan muncul ketika user
memilihsalah satu resource untuk dipinjam/booking. User akan mengunggu
setelah berhasil mengirm form peminjaman. Jika diterima oleh Admin maka
tahap selanjutnya adalah mengunggu jadwal tiba, dan jika ditolak maka
akan diberikan opsi untuk mengajukan ulang atau tidak.

Gambar 3 Alur peminjaman - user/karyawan

------------------------------------------------------------------------

# Halaman 16

Reservation Booking System · Dokumen Analisis Fitur & Activity Diagram
Halaman 15 Rahasia & Konfidensial © 2026

3.4 Diagram 4: Alur peminjaman -- Admin Setelah booking dibuat, Admin
melihat daftar booking PENDING di halaman All Bookings. Approval
diberikan dengan opsional catatan. Dan Reject memerlukan alasan wajib.

Gambar 4 Alur peminjaman - Admin 3.5 Diagram 5: Alur peminjaman --
Driver Driver akan mendapatkan pesan setelah admin Approved dan memilih
driver. Driver diwajibkan untuk mengisi kilometer awal. Setelah jadwal
tiba, Driver akan bersiap untuk keberangkatan

Gambar 5 Alur peminjaman -- Driver

------------------------------------------------------------------------

# Halaman 17

Reservation Booking System · Dokumen Analisis Fitur & Activity Diagram
Halaman 16 Rahasia & Konfidensial © 2026

3.6 Diagram 6: Alur peminjaman -- Pengawas ruangan Pengawas akan
mendapatkan pesan bahwa ruangan akan dipakai. Pengawas mempersiapkan
ruangan. Update ketika ruangan telah siap digunakan

Gambar 6 Alur peminjaman -- Pengawas ruangan 3.7 Diagram 7: Pengembalian
kendaraan Pengembalian kendaraan dimulai dari Driver membuka peminjaman
yang sedang berlanjut. Mengisi kilometer akhir setelah digunakan. Dan
sistem akan mengirimkan pesan kepada user untuk mengisi rating dan
review kepada Driver.

Gambar 7 Pengembalian kendaraan

------------------------------------------------------------------------

# Halaman 18

Reservation Booking System · Dokumen Analisis Fitur & Activity Diagram
Halaman 17 Rahasia & Konfidensial © 2026 3.8 Diagram 8: Penyelesaian
peminjaman ruangan User mengisi rating dan survey kepuasan. Peminjaman
selesai ketika rating dan survey berhasil terkirim.

Gambar 8 Penyelesaian peminjaman ruangan 3.9 Diagram 9: Manajemen User
(Admin) Halaman khusus admin yang berurusan dengan data user, admin
dapat menambahkan akun user dengan role yang berbeda sesuai kebutuhan,
lalu admin dapat merubah informasi user jika diperlukan.

Gambar 9 Manajemen User (Admin)

------------------------------------------------------------------------

# Halaman 19

Reservation Booking System · Dokumen Analisis Fitur & Activity Diagram
Halaman 18 Rahasia & Konfidensial © 2026 3.10 Diagram 10: Laporan &
Analitik (Admin) Halaman Laporan melakukan fetch data secara serentak
dengan data sebagai berikut: List peminjaman/booking, biaya maintenance,
total asset, audit log, list pengisian bahan bakar dan lain- lain.

Gambar 10 Laporan & Analitik (Admin) 3.11 Diagram 11: Pengisian bahan
bakar (Driver) Pengisian bahan bakar dilakukan oleh Driver secara manual
dengan cara : Login ke aplikasi dan memasuki menu Bahan bakar. Masuk ke
tambah pengeluaran dan mengisi formulir pengeluaran dengan benar, lalu
Submit untuk menyelesaikan.

Gambar 11 Pengisian bahan bakar (Driver)

------------------------------------------------------------------------

# Halaman 20

Reservation Booking System · Dokumen Analisis Fitur & Activity Diagram
Halaman 19 Rahasia & Konfidensial © 2026 3.12 Diagram 12: Maintenance
(Admin) Maintenance digunakan ketika dalam kurun waktu tertentu Resource
membutuhkan perawatan, dan menghindari peminjaman ketika Resource
sedangtidak tersedia akibat perbaikan/perawatan.

Gambar 12 Maintenance (Admin)

------------------------------------------------------------------------

# Halaman 21

Reservation Booking System · Dokumen Analisis Fitur & Activity Diagram
Halaman 20 Rahasia & Konfidensial © 2026

4.  Ringkasan Alur Status Booking 4.1 Status Booking Internal (Employee)
    Booking yang dibuat oleh Employee melalui aplikasi mengikuti alur:
    PENDING → APPROVED → ONGOING → COMPLETED • PENDING: Booking baru,
    menunggu keputusan Admin/Approver • APPROVED: Booking disetujui,
    menunggu resource diambil • ONGOING: Resource sedang digunakan •
    COMPLETED: Resource dikembalikan, booking selesai • REJECTED:
    Booking ditolak Admin (alasan wajib diberikan) • CANCELLED:
    Dibatalkan oleh Employee sendiri saat masih PENDING • OVERDUE:
    Booking ONGOING melewati batas waktu yang ditetapkan 4.2 Matriks
    Aksi per Role Fitur/Aksi Employee Driver Admin Custodian Login &
    Logout ✓ ✓ ✓ ✓ Lihat Dashboard ✓ ✓ ✓ ✓ Browse Resource ✓ ✓ ✓ ✗ Buka
    Kalender Resource ✓ ✓ ✓ ✗ Buat Booking ✓ ✗ ✓ ✗ Batalkan Booking
    Sendiri ✓ ✗ ✓ ✗ Lihat Booking Sendiri ✓ ✓ ✓ ✗ Approve / Reject
    Booking ✗ ✗ ✓ ✗ Ajukan Booking ✓ ✗ ✓ ✗ Selesaikan Booking ✗ ✓ ✓ ✓
    Lihat Semua Booking ✓ ✗ ✓ ✗ Pemberian rating ✓ ✗ ✓ ✗ Lihat Lampiran
    ✓ ✓ ✓ ✓ Update Foto Profil ✓ ✓ ✓ ✓ Pengisian bahan bakar ✗ ✓ ✓ ✗
    Maintenance Resource ✗ ✗ ✓ ✗ Manajemen User ✗ ✗ ✓ ✗ Akses Laporan ✗
    ✗ ✓ ✗

Keterangan: ✓ = memiliki akses, ✗ = tidak memiliki akses

------------------------------------------------------------------------

# Halaman 22

Reservation Booking System · Dokumen Analisis Fitur & Activity Diagram
Halaman 21 Rahasia & Konfidensial © 2026 5. Entity Relationship Diagram
Reservation Booking System dibangun di atas basis data relasional
PostgreSQL yang terdiri dari 22 tabel, dikelompokkan menjadi enam domain
fungsional: Pengguna & Autentikasi, Resource (Kendaraan & Ruangan),
Booking, Driver, Operasional Kendaraan, serta Sistem & Utilitas. Setiap
domain dirancang agar dapat berkembang secara independen tanpa merusak
integritas data di domain lain.

Gambar 13 Entiti Relationship Diagram Link lengkap ERD :
https://dbdiagram.io/d/Reservation-System-v2-69a0ff3da3f0aa31e14040db

1.  Domain Pengguna & Autentikasi Sistem mengelola pengguna melalui
    tabel users yang menyimpan identitas lengkap setiap karyawan: ID
    karyawan, nama, email, kata sandi terenkripsi, foto profil, dan
    status aktif. Setiap pengguna dikaitkan dengan satu departemen
    (tabel departments) dan satu peran akses (tabel roles). Peran yang
    tersedia adalah EMPLOYEE, ADMIN, dan DRIVER, masing-masing memiliki
    hak akses yang berbeda di lapisan aplikasi.

------------------------------------------------------------------------

# Halaman 23

Reservation Booking System · Dokumen Analisis Fitur & Activity Diagram
Halaman 22 Rahasia & Konfidensial © 2026 Autentikasi menggunakan
mekanisme JWT dua lapisan. Access token berumur pendek digunakan untuk
setiap permintaan API, sementara refresh token yang berumur lebih
panjang disimpan di tabel refresh_tokens dan dapat dicabut (revoke)
secara individual tanpa memengaruhi sesi pengguna lain. Sistem juga
menyediakan alur reset kata sandi berbasis OTP melalui tabel
password_reset_otps, di mana setiap kode OTP dibatasi waktu berlakunya
dan hanya dapat digunakan satu kali. 2. Domain Resource (Kendaraan &
Ruangan) Seluruh aset yang dapat dipesan --- baik kendaraan maupun
ruangan rapat --- dikelola melalui tabel resources sebagai induk
bersama. Tabel ini menyimpan nama, tipe (VEHICLE atau ROOM), dan status
resource (AVAILABLE, MAINTENANCE, atau INACTIVE). Desain ini
memungkinkan logika pemesanan, pengecekan ketersediaan, dan manajemen
status ditangani di satu titik tanpa duplikasi kode. Untuk kendaraan,
tabel vehicles menyimpan atribut spesifik seperti nomor plat, merek,
model, tahun, odometer saat ini, kapasitas penumpang, dan kategori
kendaraan (MPV, SUV, Sedan, Pickup, Bus, atau EV) yang mengacu ke tabel
vehicle_categories. Untuk ruangan, tabel rooms menyimpan lokasi dan
kapasitas ruang. Kedua tabel ini berelasi one-to-one dengan resources
menggunakan referensi resourceId, sehingga penghapusan resource secara
otomatis menghapus detail kendaraan atau ruangan yang terkait (cascade
delete). 3. Domain Booking Inti dari sistem ini adalah tabel bookings
yang merekam setiap permintaan peminjaman resource. Setiap booking
menyimpan siapa yang memesan (userId), resource apa yang dipesan
(resourceId), rentang waktu (startDate dan endDate), keperluan
(purpose), serta status yang berjalan melalui siklus: PENDING → APPROVED
→ ONGOING → COMPLETED. Status lain yang mungkin adalah REJECTED (ditolak
admin), CANCELLED (dibatalkan pemesan), dan OVERDUE (melewati batas
waktu tanpa diselesaikan). Ketika booking disetujui, Admin dapat
menugaskan driver dan kendaraan spesifik melalui kolom assignedDriverId
dan assignedVehicleId di tabel bookings. Seluruh riwayat keputusan
approval --- siapa yang menyetujui atau menolak, kapan, dan dengan
catatan apa --- dicatat secara permanen di tabel approval_logs. Hal ini
memastikan jejak audit yang lengkap untuk setiap perubahan status
booking. Setelah booking selesai, pengguna yang melakukan pemesanan
dapat memberikan penilaian kepada driver yang bertugas melalui tabel
driver_ratings. Setiap booking hanya dapat dinilai satu kali (unique
constraint pada bookingId), dengan skala rating 1 hingga 5 disertai
komentar opsional. 4. Domain Driver Pengguna dengan peran DRIVER
memiliki profil tambahan di tabel drivers yang menyimpan nomor SIM dan
nomor telepon. Penugasan driver ke kendaraan tertentu dikelola melalui
tabel driver_assignments: setiap baris mencatat kapan seorang driver
mulai (assignedAt) dan selesai (releasedAt) bertanggung jawab atas
kendaraan tertentu. Kolom releasedAt bernilai NULL selama penugasan
masih aktif. 5. Domain Operasional Kendaraan Sistem mencatat dua jenis
operasional kendaraan: pengisian bahan bakar dan perawatan
(maintenance). Tabel fuel_expenses mendukung dua jenis bahan bakar: BBM
konvensional (bensin/solar) dan Listrik (kendaraan EV). Untuk BBM, kolom
yang diisi meliputi jumlah liter, harga per liter, dan pembacaan
odometer sebelum dan sesudah pengisian. Untuk listrik, yang diisi adalah
jumlah kWh, harga per kWh, serta persentase baterai sebelum dan sesudah
pengisian. Harga acuan

------------------------------------------------------------------------

# Halaman 24

Reservation Booking System · Dokumen Analisis Fitur & Activity Diagram
Halaman 23 Rahasia & Konfidensial © 2026 per liter dan per kWh dikelola
secara terpusat di tabel master_settings agar dapat diperbarui tanpa
perlu mengubah kode aplikasi. Perawatan resource --- baik kendaraan
maupun ruangan --- dicatat di tabel maintenance_records. Setiap entri
menyimpan resource yang dirawat, deskripsi pekerjaan, tanggal mulai,
tanggal selesai (NULL jika masih berjalan), biaya aktual, dan siapa yang
mencatat. Selama resource dalam status MAINTENANCE, statusnya di tabel
resources diubah menjadi MAINTENANCE sehingga resource tersebut tidak
dapat dipesan. 6. Domain Sistem & Utilitas Tabel audit_logs mencatat
seluruh aksi penting yang terjadi di sistem --- mulai dari login,
pembuatan booking, perubahan status, persetujuan, hingga penghapusan
data. Setiap baris mencatat pelaku aksi (userId, bernilai NULL untuk
aksi otomatis oleh sistem/scheduler), jenis aksi, tipe entitas yang
terdampak, ID entitas, dan deskripsi singkat. Log ini tidak dapat diubah
dan berfungsi sebagai jejak audit penuh untuk keperluan keamanan dan
audit internal. Tabel attachments menyimpan lampiran dokumen yang dapat
dikaitkan ke tiga jenis entitas: kendaraan (vehicleId), ruangan
(roomId), atau booking (bookingId). Satu lampiran hanya dikaitkan ke
satu entitas; setidaknya satu dari tiga kolom referensi tersebut harus
terisi. Lampiran disimpan sebagai URL eksternal, sehingga file fisik
dapat di-hosting di layanan penyimpanan cloud terpisah. Terakhir, tabel
guest_bookings dipertahankan di skema untuk kompatibilitas data
historis, meskipun fitur Guest Booking tidak lagi tersedia di antarmuka
aplikasi versi saat ini. Seluruh akses baru kini mewajibkan autentikasi
melalui akun terdaftar.

------------------------------------------------------------------------

# Halaman 25

Reservation Booking System · Dokumen Analisis Fitur & Activity Diagram
Halaman 24 Rahasia & Konfidensial © 2026 6. Usecase Diagram

Gambar 14 Usecase Diagram Usecase diagram menggambarkan secara jelas
tentang pembagian kewenangan dalam setiap role, tergambar jelas pada
gambar 14, berikut penjelasan lebih detail : -- Admin memiliki akses
paling luas. Selain dapat melakukan login, Admin bertanggung jawab atas
Approve Peminjaman yang secara otomatis memicu pengiriman notifikasi ke
driver dan user (relasi extend), serta melibatkan proses update status
dan validasi status (relasi include). Admin juga mengelola keseluruhan
sistem melalui use case Kelola Resources, Kelola Maintenance (yang
meng-include Update Status Kendaraan), Kelola User, Audit Log, dan
Laporan. -- User/Karyawan adalah aktor utama yang mengajukan peminjaman.
Use case Ajukan Peminjaman merupakan yang paling kompleks --- secara
otomatis meng-include tiga proses: Cek Ketersediaan Resources, Validasi
Jadwal, dan Hitung Durasi. Selain itu, user dapat meng-extend ajuan
dengan Upload Dokumen Pendukung jika diperlukan. Setelah peminjaman
selesai, User/Karyawan dapat memberikan Pemberian Rating dan Review yang
ditujukan ke driver. User juga dapat melihat Riwayat Peminjaman yang
bisa di-extend menjadi Cetak Riwayat Peminjaman, serta melihat Lihat
Detail Peminjaman.

------------------------------------------------------------------------

# Halaman 26

Reservation Booking System · Dokumen Analisis Fitur & Activity Diagram
Halaman 25 Rahasia & Konfidensial © 2026 -- Custodian memiliki akses
yang lebih terbatas, yaitu: Riwayat Peminjaman, Lihat Detail Peminjaman,
dan Penyelesaian Booking --- kemungkinan berperan dalam memverifikasi
bahwa resource sudah selesai secara fisik. -- Driver dapat mengakses
Lihat Detail Peminjaman, Penyelesaian Booking, dan Pengisian BBM di mana
pengisian BBM dapat di-extend dengan Upload Dokumen Pendukung sebagai
bukti pengisian. 7. Penutup Dokumen ini mencakup 72 fitur yang
terdistribusi dalam 14 kategori fungsional pada Reservation Booking
System. Diagram activity yang disertakan merepresentasikan alur kerja
utama menggunakan notasi UML standar, mulai dari proses autentikasi,
peminjaman resource, hingga operasional kendaraan. Sistem ini dirancang
dengan arsitektur multi-role (Employee, Driver, Custodian , Admin) yang
memastikan setiap pengguna hanya dapat mengakses fitur sesuai dengan hak
aksesnya. Alur booking yang terstruktur (PENDING → APPROVED → ONGOING →
COMPLETED) memberikan visibilitas penuh terhadap penggunaan resource,
sementara modul Maintenance dan Fuel Expense memastikan kondisi dan
operasional seluruh aset tercatat dengan akurat. Basis data yang terdiri
dari 22 tabel yang terbagi dalam 6 domain fungsional dirancang untuk
mendukung skalabilitas sistem seiring bertambahnya pengguna dan resource
yang dikelola.
