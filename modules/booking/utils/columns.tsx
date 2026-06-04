'use client'

import Link from "next/link";
import { Car, DoorOpen, Eye, X } from "lucide-react";
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

// Icon + label per tipe resource
const RESOURCE_META = {
  [RESOURCE_TYPE.VEHICLE]: { Icon: Car, label: "Kendaraan" },
  [RESOURCE_TYPE.ROOM]: { Icon: DoorOpen, label: "Ruangan" },
} as const;

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
    cell: ({ getValue }) => {
      const resource = getValue();
      const meta = RESOURCE_META[resource.type];
      const Icon = meta.Icon;
      return (
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
            <Icon className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-[var(--text-primary)]">
              {resource.name}
            </p>
            <p className="truncate text-xs text-[var(--text-secondary)]">
              {meta.label}
            </p>
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
