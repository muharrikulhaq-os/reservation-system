// ─────────────────────────────────────────
// DATA SYNC - invalidasi query per topik (lihat constants/sync.ts)
// Bebas window/document: dipakai hook socket yang juga siap React Native.
// ─────────────────────────────────────────

import type { QueryClient } from "@tanstack/react-query";
import { DATA_SYNC_DEBOUNCE_MS, SYNC_TOPIC_QUERY_KEYS } from "@/constants";
import type { SyncTopic } from "@/types";

const ALL_TOPICS = Object.keys(SYNC_TOPIC_QUERY_KEYS) as SyncTopic[];

const isSyncTopic = (t: unknown): t is SyncTopic =>
  typeof t === "string" && t in SYNC_TOPIC_QUERY_KEYS;

export interface TopicInvalidator {
  /** Tandai topik berubah; kosong/tak dikenal = semua topik. */
  push: (topics?: readonly unknown[]) => void;
  dispose: () => void;
}

/**
 * Gabungkan event DATA_CHANGED beruntun lalu invalidate query terkait sekali.
 * `cancelRefetch: false`: bila query sedang fetch (mis. baru di-invalidate
 * onSuccess mutasi di tab ini), jangan batalkan & fetch dobel.
 */
export const createTopicInvalidator = (qc: QueryClient): TopicInvalidator => {
  const pending = new Set<SyncTopic>();
  let timer: ReturnType<typeof setTimeout> | null = null;

  const flush = () => {
    timer = null;
    const keys = new Map<string, readonly unknown[]>();
    for (const topic of pending) {
      for (const key of SYNC_TOPIC_QUERY_KEYS[topic]) {
        keys.set(JSON.stringify(key), key);
      }
    }
    pending.clear();
    for (const queryKey of keys.values()) {
      qc.invalidateQueries({ queryKey }, { cancelRefetch: false });
    }
  };

  return {
    push: (topics) => {
      const known = (topics ?? []).filter(isSyncTopic);
      for (const t of known.length > 0 ? known : ALL_TOPICS) pending.add(t);
      if (timer) clearTimeout(timer);
      timer = setTimeout(flush, DATA_SYNC_DEBOUNCE_MS);
    },
    dispose: () => {
      if (timer) clearTimeout(timer);
      timer = null;
      pending.clear();
    },
  };
};
