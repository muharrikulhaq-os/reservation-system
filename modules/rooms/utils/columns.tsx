"use client";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { ResourceStatusBadge } from "@/components/shared/badge/StatusBadge";
import {
  createColumnHelper,
  type ColumnDef,
} from "@/components/shared/table/DataTable";
import type { Room } from "@/types";

// ─────────────────────────────────────────
// ROOM COLUMNS
// Jembatan antara <DataTable/> dan data Room.
// ─────────────────────────────────────────

const ch = createColumnHelper<Room>();

export const roomColumns: ColumnDef<Room, unknown>[] = [
  ch.accessor("name", {
    header: "Ruangan",
    cell: ({ getValue }) => (
      <span className="text-sm font-medium text-[var(--text-primary)]">
        {getValue()}
      </span>
    ),
  }),

  ch.accessor("location", {
    header: "Lokasi",
    cell: ({ getValue }) => (
      <span className="inline-flex items-center gap-1.5 text-sm text-[var(--text-secondary)]">
        <MapPin className="h-3.5 w-3.5 text-[var(--text-disabled)]" />
        {getValue()}
      </span>
    ),
  }),

  ch.accessor("capacity", {
    header: "Kapasitas",
    size: 120,
    cell: ({ getValue }) => (
      <span className="text-sm text-[var(--text-secondary)]">
        {getValue()} org
      </span>
    ),
  }),

  ch.accessor("status", {
    header: "Status",
    size: 120,
    cell: ({ getValue }) => <ResourceStatusBadge status={getValue()} />,
  }),

  ch.display({
    id: "actions",
    size: 60,
    header: "",
    cell: ({ row }) => (
      <Link
        href={`/dashboard/rooms/${row.original.id}`}
        className="text-xs font-medium text-[var(--primary)] hover:underline"
      >
        Detail
      </Link>
    ),
  }),
] as ColumnDef<Room, unknown>[];
