// ─────────────────────────────────────────
// DATA SYNC - invalidasi query per topik (lihat constants/sync.ts)
// Bebas window/document: siap dipakai ulang di React Native.
//
// Dua sumber perubahan, satu jalur invalidasi:
// - LOKAL  : respons request tulis membawa header X-Data-Changed (topik dari
//            backend) → interceptor axios → invalidate segera. Tidak
//            bergantung pada WebSocket dan tidak perlu daftar key per mutasi.
// - REMOTE : event WebSocket DATA_CHANGED dari tab/perangkat/pengguna lain
//            → digabung sebentar lalu invalidate. Event dengan `origin` =
//            CLIENT_ID diabaikan (sudah ditangani jalur lokal).
// ─────────────────────────────────────────

import { DATA_SYNC_DEBOUNCE_MS, SYNC_TOPIC_QUERY_KEYS } from "@/constants";
import type { SyncTopic } from "@/types";
import { queryClient } from "./queryClient";

/** Id acak per tab - dikirim sebagai header X-Client-Id. */
export const CLIENT_ID: string =
  globalThis.crypto?.randomUUID?.() ??
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

const ALL_TOPICS = Object.keys(SYNC_TOPIC_QUERY_KEYS) as SyncTopic[];

const isSyncTopic = (t: unknown): t is SyncTopic =>
  typeof t === "string" && t in SYNC_TOPIC_QUERY_KEYS;

/** "booking,vehicle" (header X-Data-Changed) → topik yang dikenal. */
export const parseSyncTopicsHeader = (value: unknown): SyncTopic[] =>
  typeof value === "string"
    ? value.split(",").map((t) => t.trim()).filter(isSyncTopic)
    : [];

const pending = new Set<SyncTopic>();
let timer: ReturnType<typeof setTimeout> | null = null;
let dueAt = Number.POSITIVE_INFINITY;

const flush = () => {
  timer = null;
  dueAt = Number.POSITIVE_INFINITY;
  const keys = new Map<string, readonly unknown[]>();
  for (const topic of pending) {
    for (const key of SYNC_TOPIC_QUERY_KEYS[topic]) {
      keys.set(JSON.stringify(key), key);
    }
  }
  pending.clear();
  for (const queryKey of keys.values()) {
    // cancelRefetch:false - query yang SUDAH sedang fetch (mis. baru
    // di-invalidate onSuccess mutasi) tidak dibatalkan & di-fetch dobel.
    queryClient.invalidateQueries({ queryKey }, { cancelRefetch: false });
  }
};

const schedule = (delayMs: number) => {
  const due = Date.now() + delayMs;
  if (timer && dueAt <= due) return; // jadwal yang ada sudah lebih awal
  if (timer) clearTimeout(timer);
  dueAt = due;
  timer = setTimeout(flush, delayMs);
};

const add = (topics: readonly unknown[] | undefined) => {
  const known = (topics ?? []).filter(isSyncTopic);
  for (const t of known.length > 0 ? known : ALL_TOPICS) pending.add(t);
};

// Sudah pernah menerima header X-Data-Changed? Bila proxy di depan API
// ternyata membuang header itu, jalur lokal mati - maka event WebSocket
// milik tab ini TIDAK boleh diabaikan (lihat isOwnChange).
let localHeaderSeen = false;

export const dataSync = {
  /**
   * Perubahan dari request tulis tab ini. Dijalankan di task berikutnya
   * (setelah onSuccess mutasi sempat me-refetch key-nya sendiri), sehingga
   * key tersebut tidak di-fetch dua kali.
   */
  pushLocal: (topics: readonly SyncTopic[]) => {
    if (topics.length === 0) return;
    localHeaderSeen = true;
    add(topics);
    schedule(0);
  },
  /**
   * Event DATA_CHANGED berasal dari tab ini DAN jalur lokal terbukti jalan
   * → aman diabaikan. Selain itu tetap diproses (lebih baik fetch dua kali
   * daripada menu tertinggal).
   */
  isOwnChange: (origin: unknown) => localHeaderSeen && origin === CLIENT_ID,
  /** Perubahan dari luar (WebSocket). Kosong/tak dikenal = semua topik. */
  pushRemote: (topics?: readonly unknown[]) => {
    add(topics);
    schedule(DATA_SYNC_DEBOUNCE_MS);
  },
};
