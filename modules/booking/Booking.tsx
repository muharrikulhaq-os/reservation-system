"use client";

import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { DataTable, PageHeader } from "@/components/shared";
import { AppButton, InputText, InputSelect } from "@/components/ui-custom";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTableFilter } from "@/hooks";
import { BOOKING_STATUS_CONFIG, RESOURCE_TYPE } from "@/constants";
import type { BookingStatus, ResourceType, SelectOption } from "@/types";
import { useBookings } from "./hooks/useBookings";
import { bookingColumns } from "./utils/columns";

// ─────────────────────────────────────────
// BOOKING PAGE — daftar semua booking
// ─────────────────────────────────────────

// Opsi status dari config (satu sumber kebenaran)
const STATUS_OPTIONS: SelectOption[] = Object.entries(BOOKING_STATUS_CONFIG).map(
  ([value, cfg]) => ({ value, label: cfg.label }),
);

// Tab tipe resource — "ALL" = semua
const RESOURCE_TABS = [
  { value: "ALL", label: "Semua" },
  { value: RESOURCE_TYPE.VEHICLE, label: "Kendaraan" },
  { value: RESOURCE_TYPE.ROOM, label: "Ruangan" },
] as const;

export const BookingPage = () => {
  const { search, setSearch, filters, setFilter, setPage, params } =
    useTableFilter({
      status: undefined as BookingStatus | undefined,
      resourceType: undefined as ResourceType | undefined,
    });

  const { data, isLoading } = useBookings(params);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <PageHeader
        title="Booking"
        description="Kelola seluruh peminjaman kendaraan & ruangan"
        actions={
          <Link href="/booking/new">
            <AppButton variant="primary" leftIcon={<Plus className="h-4 w-4" />}>
              Buat Booking
            </AppButton>
          </Link>
        }
      />

      {/* Card: filter + tabel */}
      <div className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-5 shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        {/* Resource type tabs */}
        <Tabs
          value={filters.resourceType ?? "ALL"}
          onValueChange={(v) =>
            setFilter(
              "resourceType",
              v === "ALL" ? undefined : (v as ResourceType),
            )
          }
          className="mb-4"
        >
          <TabsList className="rounded-lg bg-[var(--bg-subtle)] p-1">
            {RESOURCE_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="rounded-md px-4 text-sm font-medium text-[var(--text-secondary)] data-[state=active]:bg-[var(--bg-card)] data-[state=active]:text-[var(--primary)] data-[state=active]:shadow-sm"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Filter row */}
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div className="w-full max-w-xs">
            <InputText
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari booking..."
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>

          <div className="w-full max-w-[200px]">
            <InputSelect
              value={filters.status ?? ""}
              onChange={(e) =>
                setFilter(
                  "status",
                  (e.target.value || undefined) as BookingStatus | undefined,
                )
              }
              placeholder="Semua Status"
              options={STATUS_OPTIONS}
            />
          </div>
        </div>

        {/* Tabel */}
        <DataTable
          data={data?.data ?? []}
          columns={bookingColumns}
          isLoading={isLoading}
          pagination={data?.pagination}
          onPageChange={setPage}
          emptyMessage="Belum ada booking"
        />
      </div>
    </div>
  );
};
