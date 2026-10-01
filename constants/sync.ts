// ─────────────────────────────────────────
// DATA SYNC - event WebSocket DATA_CHANGED
// Backend mengirim `{ type: "DATA_CHANGED", topics: [...] }` ke SEMUA klien
// setiap ada request tulis yang sukses (lihat booking-system-api
// internal/middleware/data_changed.go). Web meng-invalidate query key yang
// bergantung pada topik itu: query yang sedang tampil langsung di-fetch
// ulang, sisanya ditandai basi & di-fetch saat dibuka - tanpa polling.
// Nama topik = kontrak dengan backend & mobile (SyncTopic.wireName).
// ─────────────────────────────────────────

import type { QueryKey } from "@tanstack/react-query";
import type { SyncTopic } from "@/types";
import { QUERY_KEYS } from "./config";

export const DATA_CHANGED_EVENT = "DATA_CHANGED" as const;

// Topik = data yang DITULIS; daftar di bawah menyertakan data TURUNAN yang
// ikut berubah di server (mis. status kendaraan saat booking dimulai,
// ringkasan dashboard, dan laporan - audit log mencatat setiap perubahan,
// jadi SEMUA topik menyertakan ["reports"]).
// Dipakai untuk perubahan LOKAL (header X-Data-Changed) maupun REMOTE
// (WebSocket) - satu daftar untuk semua menu.
export const SYNC_TOPIC_QUERY_KEYS: Record<SyncTopic, readonly QueryKey[]> = {
  booking: [
    QUERY_KEYS.BOOKINGS,
    QUERY_KEYS.GUEST_BOOKINGS,
    QUERY_KEYS.VEHICLES,
    // Odometer mulai/akhir trip memajukan hak saldo BBM.
    QUERY_KEYS.FUEL_BALANCES,
    QUERY_KEYS.ROOMS,
    QUERY_KEYS.DRIVERS,
    QUERY_KEYS.DASHBOARD,
    ["reports"],
  ],
  vehicle: [
    QUERY_KEYS.VEHICLES,
    // Odometer kendaraan menentukan hak saldo BBM.
    QUERY_KEYS.FUEL_BALANCES,
    QUERY_KEYS.DRIVERS,
    QUERY_KEYS.DASHBOARD,
    ["reports"],
  ],
  room: [
    QUERY_KEYS.ROOMS,
    QUERY_KEYS.ROOM_KEEPERS,
    QUERY_KEYS.DASHBOARD,
    ["reports"],
  ],
  driver: [
    QUERY_KEYS.DRIVERS,
    QUERY_KEYS.VEHICLES,
    QUERY_KEYS.DASHBOARD,
    ["reports"],
  ],
  user: [
    QUERY_KEYS.USERS,
    QUERY_KEYS.DRIVERS,
    QUERY_KEYS.ROOM_KEEPERS,
    // Profil sendiri → Navbar/Sidebar ikut (lihat useSyncAuthUser).
    QUERY_KEYS.AUTH_ME,
    QUERY_KEYS.DASHBOARD,
    ["reports"],
  ],
  roomKeeper: [QUERY_KEYS.ROOM_KEEPERS, QUERY_KEYS.ROOMS, ["reports"]],
  fuel: [
    QUERY_KEYS.FUEL,
    QUERY_KEYS.FUEL_TYPES,
    QUERY_KEYS.FUEL_BALANCES,
    QUERY_KEYS.FUEL_STATIONS,
    QUERY_KEYS.FUEL_VOUCHERS,
    QUERY_KEYS.SETTINGS,
    // Pengisian BBM memajukan odometer kendaraan.
    QUERY_KEYS.VEHICLES,
    ["reports"],
  ],
  maintenance: [
    QUERY_KEYS.MAINTENANCE,
    QUERY_KEYS.VEHICLE_ISSUES,
    // Serah terima / kembali dari vendor mengubah status & odometer kendaraan.
    QUERY_KEYS.VEHICLES,
    QUERY_KEYS.FUEL_BALANCES,
    QUERY_KEYS.DASHBOARD,
    ["reports"],
  ],
  vendor: [
    QUERY_KEYS.VENDORS,
    // Nama vendor tampil di kendaraan (pemilik sewa) & maintenance.
    QUERY_KEYS.VEHICLES,
    QUERY_KEYS.MAINTENANCE,
  ],
};

/** Jeda penggabungan event beruntun (mis. substitute + approve) jadi satu. */
export const DATA_SYNC_DEBOUNCE_MS = 300;
