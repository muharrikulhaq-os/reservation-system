'use client'

import Link from "next/link";
import { ArrowRightLeft, Building2, Car, Eye, GitMerge, X, Zap } from "lucide-react";
import { UserAvatar } from "@/components/shared/avatar/Avatar";
import { BookingStatusBadge } from "@/components/shared/badge/StatusBadge";
import { SafeImage } from "@/components/shared/media/SafeImage";
import {
  createColumnHelper,
  type ColumnDef,
} from "@/components/shared/table/DataTable";
import { AppButton } from "@/components/ui-custom/Appbutton";
import { formatDate, resolveFileUrl } from "@/lib";
import { BOOKING_STATUS, RESOURCE_TYPE } from "@/constants";
import { useCancelBooking } from "../hooks/useBookings";
import type { Booking } from "@/types";

// ─────────────────────────────────────────
// BOOKING COLUMNS
// Jembatan antara <DataTable/> dan data Booking.
// ─────────────────────────────────────────

const ch = createColumnHelper<Booking>();

// ─────────────────────────────────────────
// ROW ACTIONS - detail + cancel (saat PENDING)
// Dipisah jadi komponen agar bisa pakai hook.
// ─────────────────────────────────────────

const RowActions = ({ booking }: { booking: Booking }) => {
  const { mutate, isPending } = useCancelBooking();

  const handleCancel = () => {
    if (window.confirm("Batalkan booking ini?")) mutate(booking.id);
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/booking/${booking.id}`}
        aria-label="Lihat detail"
      >
        <AppButton variant="ghost" size="icon-sm">
          <Eye className="h-4 w-4" />
        </AppButton>
      </Link>

      {booking.status === BOOKING_STATUS.PENDING && (
        <AppButton
          variant="ghost"
          size="icon-sm"
          loading={isPending}
          onClick={handleCancel}
          aria-label="Batalkan booking"
          className="text-[var(--danger)] hover:text-[var(--danger)]"
        >
          <X className="h-4 w-4" />
        </AppButton>
      )}
    </div>
  );
};

export const bookingColumns: ColumnDef<Booking, unknown>[] = [
  ch.accessor("id", {
    header: "ID",
    size: 70,
    cell: ({ getValue }) => (
      <span className="text-sm font-semibold text-[var(--text-primary)]">
        #{getValue()}
      </span>
    ),
  }),

  ch.accessor("user", {
    header: "Pemohon",
    size: 220,
    cell: ({ getValue }) => {
      const user = getValue();
      return (
        <div className="flex items-center gap-2.5">
          <UserAvatar name={user.name} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[var(--text-primary)]">
              {user.name}
            </p>
            <p className="truncate text-xs text-[var(--text-secondary)]">
              {user.department}
            </p>
          </div>
        </div>
      );
    },
  }),

  ch.accessor("resource", {
    header: "Resource",
    cell: ({ row }) => {
      const booking = row.original;
      const resource = booking.resource;
      const isReassigned = booking.isReassigned === true;
      const mergedIntoId = booking.mergedIntoId ?? null; // digabung KE booking ini (sekunder)
      const mergeCount = booking.mergeCount ?? 0; // punya gabungan (main/primary)
      const isVehicle = resource.type === RESOURCE_TYPE.VEHICLE;

      return (
        <div className="flex items-center gap-2.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
            <SafeImage
              src={resolveFileUrl(resource.photoUrl)}
              alt={resource.name}
              className="h-full w-full object-cover"
              fallback={
                isVehicle ? (
                  <Car className="h-5 w-5" />
                ) : (
                  <Building2 className="h-5 w-5" />
                )
              }
            />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="truncate text-sm font-medium text-[var(--text-primary)]">
                {resource.name}
              </span>
              {isReassigned && (
                <span
                  className="inline-flex items-center gap-0.5 rounded-full bg-purple-50 px-1.5 py-0.5 text-[9px] font-semibold text-purple-600"
                  title={
                    booking.originalResource
                      ? `Dialihkan dari ${booking.originalResource.name}`
                      : "Dialihkan"
                  }
                >
                  <ArrowRightLeft className="h-2.5 w-2.5" />
                  {booking.originalResource
                    ? `Dialihkan dari ${booking.originalResource.name}`
                    : "Dialihkan"}
                </span>
              )}
              {mergedIntoId != null && (
                <span
                  className="inline-flex items-center gap-0.5 rounded-full bg-sky-50 px-1.5 py-0.5 text-[9px] font-semibold text-sky-600"
                  title={`Digabung ke booking #${mergedIntoId}`}
                >
                  <GitMerge className="h-2.5 w-2.5" /> Digabung ke #{mergedIntoId}
                </span>
              )}
              {mergeCount > 0 && (
                <span
                  className="inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-600"
                  title={`Booking utama · ${mergeCount} booking digabung ke sini`}
                >
                  <GitMerge className="h-2.5 w-2.5" /> Main · {mergeCount} gabungan
                </span>
              )}
              {booking.hasMergeSuggestion && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-50 px-1.5 py-0.5 text-[9px] font-semibold text-orange-600">
                  <Zap className="h-2.5 w-2.5" /> Kandidat Merge
                </span>
              )}
            </div>
            <span className="text-xs text-[var(--text-secondary)]">
              {isVehicle ? "Kendaraan" : "Ruangan"}
            </span>
          </div>
        </div>
      );
    },
  }),

  ch.accessor("startDate", {
    header: "Mulai",
    size: 120,
    cell: ({ getValue }) => (
      <span className="text-sm text-[var(--text-secondary)]">
        {formatDate(getValue())}
      </span>
    ),
  }),

  ch.accessor("endDate", {
    header: "Selesai",
    size: 120,
    cell: ({ getValue }) => (
      <span className="text-sm text-[var(--text-secondary)]">
        {formatDate(getValue())}
      </span>
    ),
  }),

  ch.accessor("status", {
    header: "Status",
    size: 130,
    cell: ({ getValue }) => <BookingStatusBadge status={getValue()} />,
  }),

  ch.display({
    id: "actions",
    size: 90,
    header: "",
    cell: ({ row }) => <RowActions booking={row.original} />,
  }),
] as ColumnDef<Booking, unknown>[];
