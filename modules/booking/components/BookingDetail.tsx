"use client";

import { useState } from "react";
import {
  AlertCircle,
  Car,
  Check,
  Clock,
  DoorOpen,
  Download,
  Paperclip,
  Phone,
  Play,
  X,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardSection,
  CardDivider,
  AdminOnly,
} from "@/components/common";
import {
  AvailabilityCalendar,
  BookingStatusBadge,
  UserAvatar,
} from "@/components/shared";
import {
  AppButton,
  InputTextArea,
  InputSelect,
  InputFile,
} from "@/components/ui-custom";
import {
  formatDate,
  formatDateTime,
  formatDuration,
  getErrorMessage,
  resolveFileUrl,
  formatFileSize,
} from "@/lib";
import { BOOKING_STATUS, RESOURCE_TYPE, APPROVAL_ACTION } from "@/constants";
import type { SelectOption } from "@/types";
import {
  useBooking,
  useBookingApprovalLog,
  useBookingAttachments,
  useApproveBooking,
  useRejectBooking,
  useAssignVehicle,
  useStartBooking,
  useCompleteBooking,
  useUploadBookingAttachment,
} from "../hooks/useBookings";
import { useDrivers } from "@/modules/drivers/hooks/useDrivers";
import { useVehicles } from "@/modules/vehicles/hooks/useVehicles";

// ─────────────────────────────────────────
// BOOKING DETAIL
// ─────────────────────────────────────────

interface BookingDetailProps {
  bookingId: number;
}

export const BookingDetail = ({ bookingId }: BookingDetailProps) => {
  const { data: booking, isLoading } = useBooking(bookingId);
  const { data: approvalLog } = useBookingApprovalLog(bookingId);
  const { data: attachments } = useBookingAttachments(bookingId);

  if (isLoading) {
    return (
      <p className="py-16 text-center text-sm text-[var(--text-secondary)]">
        Memuat detail booking…
      </p>
    );
  }

  if (!booking) {
    return (
      <Card>
        <p className="py-8 text-center text-sm text-[var(--text-secondary)]">
          Booking tidak ditemukan
        </p>
      </Card>
    );
  }

  const isVehicle = booking.resource.type === RESOURCE_TYPE.VEHICLE;
  const ResourceIcon = isVehicle ? Car : DoorOpen;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[3fr_2fr]">
      {/* ══ KOLOM KIRI ══ */}
      <div className="flex flex-col gap-5">
        {/* a + b + c: Info utama */}
        <Card>
          <div className="mb-5">
            <BookingStatusBadge
              status={booking.status}
              className="px-3 py-1 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Peminjam */}
            <InfoBlock label="Peminjam">
              <div className="flex items-center gap-2.5">
                <UserAvatar name={booking.user.name} size="md" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                    {booking.user.name}
                  </p>
                  <p className="truncate text-xs text-[var(--text-secondary)]">
                    {booking.user.department}
                  </p>
                </div>
              </div>
            </InfoBlock>

            {/* Resource */}
            <InfoBlock label="Resource">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
                  <ResourceIcon className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                    {booking.resource.name}
                  </p>
                  <p className="truncate text-xs text-[var(--text-secondary)]">
                    {booking.assignedVehicle?.plateNumber ??
                      (isVehicle ? "Kendaraan" : "Ruangan")}
                  </p>
                </div>
              </div>
            </InfoBlock>

            <InfoBlock label="Tanggal Mulai">
              <p className="text-sm text-[var(--text-primary)]">
                {formatDateTime(booking.startDate)}
              </p>
            </InfoBlock>

            <InfoBlock label="Tanggal Selesai">
              <p className="text-sm text-[var(--text-primary)]">
                {formatDateTime(booking.endDate)}
              </p>
            </InfoBlock>

            <InfoBlock label="Durasi">
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-primary)]">
                <Clock className="h-3.5 w-3.5 text-[var(--text-secondary)]" />
                {formatDuration(booking.startDate, booking.endDate)}
              </span>
            </InfoBlock>
          </div>

          <CardDivider />

          {/* Tujuan */}
          <InfoBlock label="Tujuan Peminjaman">
            <CardSection>
              <p className="text-sm leading-relaxed text-[var(--text-primary)]">
                {booking.purpose}
              </p>
            </CardSection>
          </InfoBlock>
        </Card>

        {/* d: Driver (jika vehicle + assignedDriver) */}
        {isVehicle && booking.assignedDriver && (
          <Card>
            <CardHeader title="Driver Ditugaskan" />
            <div className="flex items-center gap-3">
              <UserAvatar name={booking.assignedDriver.name} size="lg" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                  {booking.assignedDriver.name}
                </p>
                <p className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                  <Phone className="h-3 w-3" />
                  {booking.assignedDriver.phoneNumber}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* e: Kalender (view only) */}
        <Card>
          <AvailabilityCalendar
            resourceId={booking.resource.id}
            resourceType={booking.resource.type}
            mode="view"
          />
        </Card>

        {/* f: Riwayat approval */}
        {approvalLog && approvalLog.length > 0 && (
          <Card>
            <CardHeader title="Riwayat Persetujuan" />
            <ol className="relative space-y-5">
              {approvalLog?.map((log) => {
                const isApprove = log.action === APPROVAL_ACTION.APPROVED;
                return (
                  <li key={log.id} className="flex gap-3">
                    <span
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: isApprove ? "#DCFCE7" : "#FEE2E2",
                        color: isApprove ? "#166534" : "#991B1B",
                      }}
                    >
                      {isApprove ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : (
                        <X className="h-3.5 w-3.5" />
                      )}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-[var(--text-primary)]">
                        {isApprove ? "Disetujui" : "Ditolak"} oleh{" "}
                        {log.actionBy?.name}
                      </p>
                      <p className="text-xs text-[var(--text-secondary)]">
                        {formatDateTime(log.actionAt)}
                      </p>
                      {log.note && (
                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                          {log.note}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </Card>
        )}
      </div>

      {/* ══ KOLOM KANAN ══ */}
      <div className="flex flex-col gap-5">
        {/* a: Tindakan (admin only) */}
        <AdminOnly>
          <ActionPanel booking={booking} />
        </AdminOnly>

        {/* b: Lampiran */}
        <Card>
          <CardHeader title="Lampiran" />

          {attachments && attachments.length > 0 ? (
            <ul className="mb-4 divide-y divide-[var(--border-divider)]">
              {attachments.map((att) => (
                <li
                  key={att.id}
                  className="flex items-center gap-3 py-2.5 first:pt-0"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
                    <Paperclip className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-[var(--text-primary)]">
                      {att.fileName}
                    </p>
                    {att.fileSize != null && (
                      <p className="text-xs text-[var(--text-secondary)]">
                        {formatFileSize(att.fileSize)}
                      </p>
                    )}
                  </div>
                  <a
                    href={resolveFileUrl(att.filePath) ?? "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
                    aria-label={`Unduh ${att.fileName}`}
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mb-4 text-sm text-[var(--text-secondary)]">
              Belum ada lampiran
            </p>
          )}

          <AttachmentUpload bookingId={bookingId} />
        </Card>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────
// ACTION PANEL (admin)
// ─────────────────────────────────────────

const ActionPanel = ({
  booking,
}: {
  booking: NonNullable<ReturnType<typeof useBooking>["data"]>;
}) => {
  const [note, setNote] = useState("");
  const [driverId, setDriverId] = useState("");
  const [vehicleId, setVehicleId] = useState("");

  const approve = useApproveBooking();
  const reject = useRejectBooking();
  const assign = useAssignVehicle();
  const start = useStartBooking();
  const complete = useCompleteBooking();

  const { data: drivers } = useDrivers({ limit: 100 });
  const { data: vehicles } = useVehicles({ limit: 100 });

  const isVehicle = booking.resource.type === RESOURCE_TYPE.VEHICLE;
  const needsAssign =
    booking.status === BOOKING_STATUS.APPROVED &&
    isVehicle &&
    !booking.assignedDriver;

  const driverOptions: SelectOption[] = (drivers ?? []).map((d) => ({
    value: d.id,
    label: d.name,
  }));
  const vehicleOptions: SelectOption[] = (vehicles ?? []).map((v) => ({
    value: v.id,
    label: `${v.name} (${v.plateNumber})`,
  }));

  const error =
    approve.error ||
    reject.error ||
    assign.error ||
    start.error ||
    complete.error;
  const isBusy =
    approve.isPending ||
    reject.isPending ||
    assign.isPending ||
    start.isPending ||
    complete.isPending;

  // Tidak ada aksi untuk status final
  const hasActions =
    booking.status === BOOKING_STATUS.PENDING ||
    booking.status === BOOKING_STATUS.APPROVED ||
    booking.status === BOOKING_STATUS.ONGOING;

  if (!hasActions) return null;

  return (
    <Card>
      <CardHeader title="Tindakan" />

      {error && (
        <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{getErrorMessage(error)}</span>
        </div>
      )}

      {/* PENDING → approve / reject */}
      {booking.status === BOOKING_STATUS.PENDING && (
        <div className="space-y-3">
          <InputTextArea
            label="Catatan"
            rows={3}
            placeholder="Catatan (wajib untuk penolakan)…"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex gap-3">
            <AppButton
              variant="primary"
              fullWidth
              loading={approve.isPending}
              disabled={isBusy}
              leftIcon={<Check className="h-4 w-4" />}
              className="bg-[var(--success)] hover:bg-green-700"
              onClick={() =>
                approve.mutate({
                  id: booking.id,
                  payload: note ? { note } : undefined,
                })
              }
            >
              Setujui
            </AppButton>
            <AppButton
              variant="danger"
              fullWidth
              loading={reject.isPending}
              disabled={isBusy || !note.trim()}
              leftIcon={<X className="h-4 w-4" />}
              onClick={() =>
                reject.mutate({ id: booking.id, payload: { note } })
              }
            >
              Tolak
            </AppButton>
          </div>
        </div>
      )}

      {/* APPROVED + vehicle tanpa driver → assign */}
      {needsAssign && (
        <div className="space-y-3">
          <InputSelect
            label="Driver"
            required
            placeholder="Pilih driver"
            options={driverOptions}
            value={driverId}
            onChange={(e) => setDriverId(e.target.value)}
          />
          <InputSelect
            label="Kendaraan"
            required
            placeholder="Pilih kendaraan"
            options={vehicleOptions}
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
          />
          <AppButton
            variant="primary"
            fullWidth
            loading={assign.isPending}
            disabled={isBusy || !driverId || !vehicleId}
            onClick={() =>
              assign.mutate({
                id: booking.id,
                payload: {
                  driverId: Number(driverId),
                  vehicleId: Number(vehicleId),
                },
              })
            }
          >
            Tugaskan & Konfirmasi
          </AppButton>
        </div>
      )}

      {/* APPROVED siap jalan (room, atau vehicle sudah ada driver) → start */}
      {booking.status === BOOKING_STATUS.APPROVED && !needsAssign && (
        <AppButton
          variant="primary"
          fullWidth
          loading={start.isPending}
          disabled={isBusy}
          leftIcon={<Play className="h-4 w-4" />}
          onClick={() => start.mutate(booking.id)}
        >
          Mulai
        </AppButton>
      )}

      {/* ONGOING → complete */}
      {booking.status === BOOKING_STATUS.ONGOING && (
        <AppButton
          variant="primary"
          fullWidth
          loading={complete.isPending}
          disabled={isBusy}
          leftIcon={<Check className="h-4 w-4" />}
          onClick={() => complete.mutate(booking.id)}
        >
          Selesaikan
        </AppButton>
      )}
    </Card>
  );
};

// ─────────────────────────────────────────
// ATTACHMENT UPLOAD
// ─────────────────────────────────────────

const AttachmentUpload = ({ bookingId }: { bookingId: number }) => {
  const upload = useUploadBookingAttachment(bookingId);

  return (
    <div>
      <InputFile
        accept="image/*,application/pdf"
        onChange={(files) => {
          if (files[0]) upload.mutate({ file: files[0] });
        }}
      />
      {upload.isError && (
        <p className="mt-2 flex items-center gap-1 text-xs text-[var(--danger)]">
          <AlertCircle className="h-3 w-3" /> {getErrorMessage(upload.error)}
        </p>
      )}
    </div>
  );
};

// ─────────────────────────────────────────
// Helper
// ─────────────────────────────────────────

const InfoBlock = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div>
    <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.07em] text-[var(--text-secondary)]">
      {label}
    </p>
    {children}
  </div>
);
