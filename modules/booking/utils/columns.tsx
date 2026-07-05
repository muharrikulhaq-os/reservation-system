'use client'

import Link from "next/link";
import { ArrowRightLeft, Building2, Car, Eye, GitMerge, X, Zap } from "lucide-react";
import { UserAvatar } from "@/components/shared/avatar/Avatar";
import { BookingStatusBadge } from "@/components/shared/badge/StatusBadge";
import {
  createColumnHelper,
  type ColumnDef,
} from "@/components/shared/table/DataTable";
import { AppButton } from "@/components/ui-custom/Appbutton";
import { formatDate } from "@/lib";
import { BOOKING_STATUS, RESOURCE_TYPE } from "@/constants";
import { useCancelBooking } from "../hooks/useBookings";
import type { Booking } from "@/types";

// ─────────────────────────────────────────
// BOOKING COLUMNS
// Jembatan antara <DataTable/> dan data Booking.
// ─────────────────────────────────────────

const ch = createColumnHelper<Booking>();

// ─────────────────────────────────────────
// ROW ACTIONS — detail + cancel (saat PENDING)
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
      // TODO: ganti cast `any` setelah backend mengonfirmasi field `isMerged`
      // ada di response list booking. Jika tidak, label hanya tampil di detail.
      const isMerged = (booking as { isMerged?: boolean }).isMerged === true;
      const isVehicle = resource.type === RESOURCE_TYPE.VEHICLE;

      return (
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
            {isVehicle ? (
              <Car className="h-4 w-4" />
            ) : (
              <Building2 className="h-4 w-4" />
            )}
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="truncate text-sm font-medium text-[var(--text-primary)]">
                {resource.name}
              </span>
              {isReassigned && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-purple-50 px-1.5 py-0.5 text-[9px] font-semibold text-purple-600">
                  <ArrowRightLeft className="h-2.5 w-2.5" /> Dialihkan
                </span>
              )}
              {isMerged && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-sky-50 px-1.5 py-0.5 text-[9px] font-semibold text-sky-600">
                  <GitMerge className="h-2.5 w-2.5" /> Digabungkan
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
