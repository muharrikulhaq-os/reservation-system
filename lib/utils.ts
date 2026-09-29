// ─────────────────────────────────────────
// UTILITIES
// Helper functions yang dipakai lintas fitur
// ─────────────────────────────────────────

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { isAxiosError } from "axios";
import { WIB_TIME_ZONE, wibHM, wibYMD } from "./wib";

// ── Shadcn / Tailwind ────────────────────

/** Merge Tailwind class names dengan conflict resolution */
export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs));

// ── Error Handling ───────────────────────

/**
 * Ekstrak pesan error yang aman ditampilkan ke UI.
 * Tidak pernah expose stack trace atau internal message.
 */
export const getErrorMessage = (
  error: unknown,
  fallback = "Terjadi kesalahan, coba lagi.",
): string => {
  if (isAxiosError(error)) {
    // Pesan dari API (error.message field dalam response body)
    return (
      error.response?.data?.error?.message ??
      error.response?.data?.message ??
      fallback
    );
  }
  if (error instanceof Error) return error.message;
  return fallback;
};

// ── Date Formatting ──────────────────────
// Semua formatter memakai WIB tetap (lihat lib/wib.ts). Tanpa `timeZone`,
// Intl memakai zona browser: komputer ber-zona lain menampilkan jam lain
// dari mobile untuk booking yang sama.

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  timeZone: WIB_TIME_ZONE,
});

const dateTimeFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "long",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: WIB_TIME_ZONE,
});

const shortDateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: WIB_TIME_ZONE,
});

type DateInput = string | number | Date | null | undefined;

/** Parse aman - kembalikan Date valid atau null (tanpa melempar). */
const parseDate = (value: DateInput): Date | null => {
  if (value === null || value === undefined || value === "") return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

/** "26 Mei 2025" - fallback "-" jika tanggal kosong/invalid */
export const formatDate = (iso: DateInput, fallback = "-"): string => {
  const d = parseDate(iso);
  return d ? dateFormatter.format(d) : fallback;
};

/** "26 Mei 2025, 10.00" - fallback "-" jika tanggal kosong/invalid */
export const formatDateTime = (iso: DateInput, fallback = "-"): string => {
  const d = parseDate(iso);
  return d ? dateTimeFormatter.format(d) : fallback;
};

/** "26 Mei 2025" singkat → "26 Mei '25" */
export const formatShortDate = (iso: DateInput, fallback = "-"): string => {
  const d = parseDate(iso);
  return d ? shortDateFormatter.format(d) : fallback;
};

/** Durasi antar dua ISO string → "2 jam 30 menit" */
export const formatDuration = (
  start: DateInput,
  end: DateInput,
  fallback = "-",
): string => {
  const s = parseDate(start);
  const e = parseDate(end);
  if (!s || !e) return fallback;

  const ms = e.getTime() - s.getTime();
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);

  if (hours === 0) return `${minutes} menit`;
  if (minutes === 0) return `${hours} jam`;
  return `${hours} jam ${minutes} menit`;
};

/** Format ISO ke value input datetime-local (jam WIB) - "" jika invalid.
 * Dulu `toISOString().slice(0, 16)` = jam UTC, 7 jam lebih awal. */
export const toDatetimeLocal = (iso: DateInput): string => {
  const d = parseDate(iso);
  return d ? `${wibYMD(d)}T${wibHM(d)}` : "";
};

/** Format datetime-local value (jam WIB) ke RFC3339 UTC untuk API */
export const toRFC3339 = (datetimeLocal: string): string => {
  const [ymd, time = "00:00"] = datetimeLocal.split("T");
  const withSeconds = time.length === 5 ? `${time}:00` : time;
  return new Date(`${ymd}T${withSeconds}+07:00`).toISOString();
};

// ── Number Formatting ────────────────────

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

/** "Rp 305.000" */
export const formatCurrency = (amount: number): string =>
  currencyFormatter.format(amount);

/** "305.000" tanpa simbol */
export const formatNumber = (n: number): string =>
  new Intl.NumberFormat("id-ID").format(n);

/** "15.350 km" */
export const formatOdometer = (km: number): string => `${formatNumber(km)} km`;

/** "30,5 L" */
export const formatLiter = (liter: number): string =>
  `${liter.toLocaleString("id-ID")} L`;

/** "25,5 kWh" */
export const formatKwh = (kwh: number): string =>
  `${kwh.toLocaleString("id-ID")} kWh`;

// ── File Utilities ───────────────────────

/** Ukuran file dalam satuan yang mudah dibaca - "204,8 KB" */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1_048_576).toFixed(1)} MB`;
};

/** Cek apakah file melebihi batas ukuran */
export const isFileTooLarge = (file: File, maxMb: number): boolean =>
  file.size > maxMb * 1_048_576;

// ── String Utilities ─────────────────────

/** Inisial dari nama - "Budi Santoso" → "BS" */
export const getInitials = (name: string): string =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

/** URL foto profil dengan fallback ke API base */
export const resolveFileUrl = (
  path: string | null | undefined,
): string | null => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
  return `${base}${path}`;
};

/** Ringkasan singkat dari User-Agent mentah, mis. "Chrome · Windows" - dipakai
 * audit log untuk menunjukkan device/browser tanpa menampilkan string UA
 * penuh yang panjang. Deteksi ringan berbasis substring, bukan library
 * UA-parser lengkap - cukup untuk kasus umum. */
export const parseUserAgent = (ua: string | null | undefined): string => {
  if (!ua) return "-";

  let browser = "Browser lain";
  if (/Edg\//.test(ua)) browser = "Edge";
  else if (/OPR\//.test(ua)) browser = "Opera";
  else if (/Chrome\//.test(ua)) browser = "Chrome";
  else if (/Firefox\//.test(ua)) browser = "Firefox";
  else if (/Safari\//.test(ua)) browser = "Safari";

  let os = "OS lain";
  if (/Windows/.test(ua)) os = "Windows";
  else if (/Mac OS X/.test(ua)) os = "macOS";
  else if (/Android/.test(ua)) os = "Android";
  else if (/iPhone|iPad|iOS/.test(ua)) os = "iOS";
  else if (/Linux/.test(ua)) os = "Linux";

  return `${browser} · ${os}`;
};

/**
 * URL koneksi WebSocket notifikasi (ws/wss + token via query param, karena
 * WebSocket browser & React Native tidak bisa set header Authorization saat
 * handshake). Backend: middleware.Auth() baca `?token=` sebagai fallback.
 */
export const buildWsUrl = (path: string, token: string): string => {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";
  const wsBase = base.replace(/^http/, "ws");
  return `${wsBase}${path}?token=${encodeURIComponent(token)}`;
};

/** "Baru saja" / "5 menit lalu" / "3 jam lalu" / "2 hari lalu", jatuh ke
 * formatShortDate untuk yang lebih lama dari seminggu. */
export const formatRelativeTime = (iso: DateInput, fallback = "-"): string => {
  if (!iso) return fallback;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return fallback;

  const diffSec = Math.round((Date.now() - date.getTime()) / 1000);
  if (diffSec < 60) return "Baru saja";
  const diffMin = Math.round(diffSec / 60);
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.round(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  const diffDay = Math.round(diffHour / 24);
  if (diffDay < 7) return `${diffDay} hari lalu`;
  return formatShortDate(iso, fallback);
};
