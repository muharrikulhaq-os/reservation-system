"use client";

import { useState } from "react";
import { FileCheck, MapPin } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Card, CardSection } from "@/components/common";
import { formatDateTime, resolveFileUrl } from "@/lib";
import type { ReturnReportPhoto } from "@/types";
import { useReturnReport } from "../hooks/useBookings";

// ─────────────────────────────────────────
// RETURN REPORT CARD (admin review, read-only)
// Tampil hanya jika return report sudah disubmit driver.
// ─────────────────────────────────────────

interface ReturnReportCardProps {
  bookingId: number;
}

export const ReturnReportCard = ({ bookingId }: ReturnReportCardProps) => {
  const { data: report, isError } = useReturnReport(bookingId);
  const [preview, setPreview] = useState<ReturnReportPhoto | null>(null);

  // 404 / belum ada report → jangan tampilkan apa pun
  if (isError || !report) return null;  

  return (
    <Card>
      <h3
        className="mb-5 flex items-center gap-2 text-base font-bold text-[var(--text-primary)]"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        <FileCheck className="h-4 w-4 text-[#0284C7]" /> Laporan Pengembalian
      </h3>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-[var(--text-primary)]">
            Dikirim oleh{" "}
            <span className="font-semibold">{report.submittedBy.name}</span>
          </p>
          <p className="text-xs text-[var(--text-secondary)]">
            {formatDateTime(report.submittedAt)}
          </p>
        </div>

        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--text-secondary)]">
            Catatan
          </p>
          <CardSection>
            <p className="text-sm leading-relaxed text-[var(--text-primary)]">
              {report.note}
            </p>
          </CardSection>
        </div>

        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--text-secondary)]">
            Lokasi
          </p>
          <p className="flex items-start gap-1.5 text-sm text-[var(--text-primary)]">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-secondary)]" />
            {report.location}
          </p>
        </div>

        {report.photos.length > 0 && (
          <div>
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--text-secondary)]">
              Foto Kondisi
            </p>
            <div className="grid grid-cols-3 gap-2">
              {report.photos.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setPreview(photo)}
                  className="aspect-square overflow-hidden rounded-lg border border-[var(--border-card)]"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={resolveFileUrl(photo.filePath) ?? ""}
                    alt={photo.fileName}
                    className="h-full w-full object-cover"
                  />
                  {/* {photo.filePath} */}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-[var(--text-disabled)]">
              Klik untuk perbesar
            </p>
          </div>
        )}
      </div>

      {/* Preview foto full size */}
      <Dialog
        open={!!preview}
        onOpenChange={(open) => !open && setPreview(null)}
      >
        <DialogContent className="max-w-2xl rounded-2xl p-2 shadow-[var(--shadow-modal)]">
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolveFileUrl(preview.filePath) ?? ""}
              alt={preview.fileName}
              className="max-h-[80vh] w-full rounded-xl object-contain"
            />
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};
