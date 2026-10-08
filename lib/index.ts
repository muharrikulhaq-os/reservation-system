// ─────────────────────────────────────────
// LIB - BARREL EXPORT
// ─────────────────────────────────────────

// axios instance - gunakan ini untuk semua API call
export { apiClient, clearTokenCookies, syncTokensToCookies } from "./axios";

// query client - pass ke QueryClientProvider di layout
export { queryClient } from "./queryClient";

// token storage - gunakan ini, jangan akses localStorage langsung
export { tokenStorage } from "./token";

// utilities
export * from "./utils";

// zona waktu - semua tampilan & input tanggal/jam memakai WIB
export * from "./wib";

// sinkronisasi data realtime - invalidasi query per topik DATA_CHANGED
export * from "./dataSync";
export * from "./geocode";
export * from "./odometer";
