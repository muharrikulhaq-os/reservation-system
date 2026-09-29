// ─────────────────────────────────────────
// ZONA WAKTU WIB
// Konvensi (sama dengan backend & mobile):
// - API mengirim & menerima waktu RFC3339 UTC ("...Z").
// - Semua yang dilihat & dipilih pengguna - jam, "hari ini", tanggal
//   kalender, awal bulan - memakai WIB (UTC+7), APA PUN zona waktu
//   browser/komputer. Indonesia tidak memakai DST, jadi offset selalu +07:00.
//
// Ada dua jenis Date di UI:
// 1. Instant - titik waktu nyata: dari API atau `new Date()`. Kirim ke API
//    lewat `toISOString()`. Jangan baca getHours()/getDate()-nya: itu zona
//    browser. Pakai wibParts()/wibYMD()/wibHM().
// 2. Tanggal kalender - Date lokal jam 00:00 yang field getFullYear/getMonth/
//    getDate-nya ADALAH tanggalnya (sel kalender). Turunkan dari instant lewat
//    wibCalendarDate(), lalu gabungkan kembali dengan jam lewat wibToISO().
// ─────────────────────────────────────────

export const WIB_TIME_ZONE = "Asia/Jakarta";
export const WIB_OFFSET = "+07:00";

const WIB_OFFSET_MS = 7 * 3_600_000;
const pad = (n: number) => String(n).padStart(2, "0");

export interface WibParts {
  year: number;
  /** 1-12 */
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

/** Komponen jam dinding WIB dari sebuah instant. */
export const wibParts = (value: Date | string | number): WibParts => {
  const d = new Date(new Date(value).getTime() + WIB_OFFSET_MS);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
    second: d.getUTCSeconds(),
  };
};

/**
 * Jam dinding WIB → instant. `month` 1-12; nilai di luar rentang dinormalkan
 * seperti `Date.UTC` (mis. month 13 = Januari tahun berikutnya).
 */
export const fromWib = (
  year: number,
  month: number,
  day = 1,
  hour = 0,
  minute = 0,
  second = 0,
): Date =>
  new Date(Date.UTC(year, month - 1, day, hour, minute, second) - WIB_OFFSET_MS);

/** "YYYY-MM-DD" tanggal WIB dari sebuah instant. */
export const wibYMD = (value: Date | string | number): string => {
  const p = wibParts(value);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
};

/** "HH:mm" jam WIB dari sebuah instant. */
export const wibHM = (value: Date | string | number): string => {
  const p = wibParts(value);
  return `${pad(p.hour)}:${pad(p.minute)}`;
};

/** "YYYY-MM-DD" + "HH:mm" (jam WIB) → ISO UTC untuk API. */
export const wibToISO = (ymd: string, hm = "00:00", seconds = "00"): string =>
  new Date(`${ymd}T${hm}:${seconds}${WIB_OFFSET}`).toISOString();

/** Tanggal kalender (Date lokal 00:00) dari tanggal WIB sebuah instant. */
export const wibCalendarDate = (value: Date | string | number): Date => {
  const p = wibParts(value);
  return new Date(p.year, p.month - 1, p.day);
};

/** "YYYY-MM-DD" dari field tanggal kalender (Date lokal, BUKAN instant). */
export const calendarYMD = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

/** Awal & akhir bulan WIB tempat `value` berada, sebagai ISO UTC. */
export const wibMonthBounds = (
  value: Date | string | number = new Date(),
): { start: string; end: string } => {
  const p = wibParts(value);
  const start = fromWib(p.year, p.month);
  const end = new Date(fromWib(p.year, p.month + 1).getTime() - 1000);
  return { start: start.toISOString(), end: end.toISOString() };
};

/** `true` bila dua instant jatuh di tanggal WIB yang sama. */
export const isSameWibDay = (
  a: Date | string | number,
  b: Date | string | number,
): boolean => wibYMD(a) === wibYMD(b);

/** `true` bila dua instant jatuh di bulan WIB yang sama. */
export const isSameWibMonth = (
  a: Date | string | number,
  b: Date | string | number,
): boolean => wibYMD(a).slice(0, 7) === wibYMD(b).slice(0, 7);
