"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRightLeft,
  Ban,
  Car,
  Check,
  CheckCircle,
  Clock,
  DoorOpen,
  Download,
  FileCheck,
  Fuel,
  GitMerge,
  Merge,
  Paperclip,
  Phone,
  Play,
  Plus,
  Star,
  UserCheck,
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
  BookingTypeBadge,
  Badge,
  UserAvatar,
  StarRating,
  SafeImage,
  UserProfileButton,
} from "@/components/shared";
import { AppButton, InputFile } from "@/components/ui-custom";
import {
  formatDateTime,
  formatDuration,
  getErrorMessage,
  resolveFileUrl,
  formatFileSize,
} from "@/lib";
import { BOOKING_STATUS, RESOURCE_TYPE, ACTIVITY_ACTION_CONFIG } from "@/constants";
import type { BookingActivityAction } from "@/types";
import { useAuthStore } from "@/store/auth.store";
import {
  useBooking,
  useBookingActivity,
  useBookingMergeInfo,
  useBookingAttachments,
  useBookingDriverRating,
  useCancelBooking,
  useReturnReport,
  useStartBooking,
  useCompleteBooking,
  useUploadBookingAttachment,
} from "../hooks/useBookings";
import { BookingApprovalPanel } from "./BookingApprovalPanel";
import { BookingAssignPanel } from "./BookingAssignPanel";
import { BookingMergePanel } from "./BookingMergePanel";
import { ReturnReportModal } from "./ReturnReportModal";
import { StartBookingModal } from "./StartBookingModal";
import { RateDriverModal } from "./RateDriverModal";
import { TripRecordTabs } from "./TripRecordTabs";
import { FuelInputModal } from "@/modules/fuel";
import { DriverProfileButton } from "@/modules/drivers";

// ─────────────────────────────────────────
// BOOKING DETAIL
// ─────────────────────────────────────────

interface BookingDetailProps {
  bookingId: number;
}

// Icon timeline per aksi (decouple dari string di ACTIVITY_ACTION_CONFIG)
const ACTIVITY_ICON: Record<BookingActivityAction, React.ComponentType<{ className?: string }>> = {
  CREATE: Plus,
  APPROVE: Check,
  REJECT: X,
  CANCEL: Ban,
  ASSIGN: UserCheck,
  START: Play,
  COMPLETE: CheckCircle,
  RATE_DRIVER: Star,
  SUBSTITUTE_RESOURCE: ArrowRightLeft,
  MERGE: Merge,
  SUBMIT_RETURN_REPORT: FileCheck,
  OVERDUE: AlertTriangle,
};

export const BookingDetail = ({ bookingId }: BookingDetailProps) => {
  const { data: booking, isLoading, refetch } = useBooking(bookingId);
  const { data: activity } = useBookingActivity(bookingId);
  const { data: mergeInfo } = useBookingMergeInfo(bookingId);
  const { data: attachments } = useBookingAttachments(bookingId);
  const { data: returnReport } = useReturnReport(bookingId);

  const isAdmin = useAuthStore((s) => s.isAdmin());
  const isDriver = useAuthStore((s) => s.isDriver());
  const isRoomKeeper = useAuthStore((s) => s.isRoomKeeper());
  const isEmployee = useAuthStore((s) => s.isEmployee());
  const currentUserId = useAuthStore((s) => s.user?.id);
  const { mutate: cancelBooking, isPending: isCancelling } = useCancelBooking();

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
  // OVERDUE = booking yang sama seperti ONGOING (belum diselesaikan), cuma
  // sudah lewat endDate — driver & admin tetap punya akses ke aksi yang sama
  // (laporan pengembalian, BBM, selesaikan), status "Terlambat" cukup lewat badge.
  const isOngoingOrOverdue =
    booking.status === BOOKING_STATUS.ONGOING ||
    booking.status === BOOKING_STATUS.OVERDUE;
  // Karyawan pemilik booking ruangan bisa mulai/selesaikan sendiri (tidak
  // butuh admin/room keeper di lokasi) - dibatasi backend ke ruangan + pemilik.
  const canSelfServeRoom =
    isEmployee && !isVehicle && currentUserId === booking.user.id;
  // Kalau booking ini adalah sisi "digabung" (bukan primary) dari sebuah
  // merge, ini ID booking utamanya - dipakai untuk mengunci form rating.
  const mergedIntoPrimaryId = (mergeInfo ?? []).find((m) => !m.isPrimary)
    ?.linkedBooking.bookingId;

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[3fr_2fr]">
      {/* ══ KOLOM KIRI ══ */}
      <div className="flex flex-col gap-5">
        {/* Banner pengalihan - hanya untuk employee pemilik booking */}
        {!isAdmin &&
          booking.isReassigned &&
          booking.originalResource &&
          booking.status === BOOKING_STATUS.PENDING && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-amber-800">
                  Resource Anda Dialihkan
                </p>
                <p className="mt-0.5 text-xs text-amber-700">
                  Resource awal{" "}
                  <span className="font-medium">
                    {booking.originalResource.name}
                  </span>{" "}
                  telah diganti ke{" "}
                  <span className="font-medium">{booking.resource.name}</span>{" "}
                  oleh admin.
                </p>
                <p className="mt-1 text-xs text-amber-600">
                  Jika Anda tidak setuju, Anda dapat membatalkan booking ini.
                </p>
                <div className="mt-3">
                  <AppButton
                    variant="danger"
                    size="sm"
                    loading={isCancelling}
                    onClick={() =>
                      cancelBooking(booking.id, { onSuccess: () => refetch() })
                    }
                  >
                    Batalkan Booking
                  </AppButton>
                </div>
              </div>
            </div>
          )}

        {/* Info utama */}
        <Card>
          <div className="mb-5 flex items-center gap-2">
            <BookingStatusBadge
              status={booking.status}
              className="px-3 py-1 text-sm"
            />
            {isVehicle && (
              <BookingTypeBadge bookingType={booking.bookingType} status={booking.status} />
            )}
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <InfoBlock label="Peminjam">
              <UserProfileButton userId={booking.user.id} className="flex items-center gap-2.5">
                <UserAvatar name={booking.user.name} size="md" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[var(--text-primary)] hover:underline">
                    {booking.user.name}
                  </p>
                  <p className="truncate text-xs text-[var(--text-secondary)]">
                    {booking.user.department}
                  </p>
                </div>
              </UserProfileButton>
            </InfoBlock>

            <InfoBlock label="Resource">
              <div className="flex items-center gap-2.5">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
                  <SafeImage
                    src={resolveFileUrl(booking.resource.photoUrl)}
                    alt={booking.resource.name}
                    className="h-full w-full object-cover"
                    fallback={<ResourceIcon className="h-6 w-6" />}
                  />
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

          <InfoBlock label="Tujuan Peminjaman">
            <CardSection>
              <p className="text-sm leading-relaxed text-[var(--text-primary)]">
                {booking.purpose}
              </p>
            </CardSection>
          </InfoBlock>
        </Card>

        {/* A. Info Pengalihan */}
        {booking.isReassigned && (
          <Card className="border-l-[3px] border-l-[#7C3AED]">
            <div className="mb-4 flex items-center gap-2">
              <ArrowRightLeft className="h-4 w-4 text-[#7C3AED]" />
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Resource Dialihkan
              </h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <InfoBlock label="Awalnya">
                <p className="truncate text-sm font-medium text-[var(--text-secondary)] line-through opacity-60">
                  {booking.originalResource?.name ?? "-"}
                </p>
              </InfoBlock>
              <InfoBlock label="Diganti Ke">
                <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                  {booking.resource.name}
                </p>
              </InfoBlock>
            </div>
          </Card>
        )}

        {/* B. Info Merge */}
        {mergeInfo && mergeInfo.length > 0 && (
          <Card className="border-l-[3px] border-l-[#0284C7]">
            <div className="mb-4 flex items-center gap-2">
              <GitMerge className="h-4 w-4 text-[#0284C7]" />
              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                Booking Digabungkan
              </h3>
            </div>
            <ul className="space-y-3">
              {mergeInfo.map((m) => (
                <li
                  key={m.mergeId}
                  className="flex items-start justify-between gap-3 rounded-xl bg-[var(--bg-subtle)] p-3"
                >
                  <div className="flex items-center gap-2.5">
                    <UserProfileButton userId={m.linkedBooking.userId}>
                      <UserAvatar name={m.linkedBooking.userName} size="md" />
                    </UserProfileButton>
                    <div className="min-w-0">
                      <UserProfileButton userId={m.linkedBooking.userId}>
                        <p className="truncate text-sm font-semibold text-[var(--text-primary)] hover:underline">
                          {m.linkedBooking.userName}
                        </p>
                      </UserProfileButton>
                      <p className="truncate text-xs text-[var(--text-secondary)]">
                        {m.linkedBooking.department} · {m.linkedBooking.employeeId}
                      </p>
                      <p className="mt-1 truncate text-xs text-[var(--text-secondary)]">
                        {m.linkedBooking.purpose}
                      </p>
                      <p className="mt-1.5 text-[11px] text-[var(--text-disabled)]">
                        Digabungkan oleh {m.mergedBy} · {formatDateTime(m.createdAt)}
                      </p>
                    </div>
                  </div>
                  <Badge variant={m.isPrimary ? "info" : "muted"}>
                    {m.isPrimary ? "Utama" : "Digabung"}
                  </Badge>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Merge panel - admin pilih booking APPROVED lain untuk digabung.
            Hanya saat booking ini PENDING + VEHICLE (hilang setelah merged → APPROVED). */}
        <AdminOnly>
          {isVehicle && booking.status === BOOKING_STATUS.PENDING && (
            <BookingMergePanel booking={booking} onMergeComplete={refetch} />
          )}
        </AdminOnly>

        {/* Driver ditugaskan */}
        {isVehicle && booking.assignedDriver && (
          <Card>
            <CardHeader title="Driver Ditugaskan" />
            <DriverProfileButton driverId={booking.assignedDriver.id} className="flex items-center gap-3">
              <UserAvatar name={booking.assignedDriver.name} size="lg" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--text-primary)] hover:underline">
                  {booking.assignedDriver.name}
                </p>
                <p className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                  <Phone className="h-3 w-3" />
                  {booking.assignedDriver.phoneNumber}
                </p>
              </div>
            </DriverProfileButton>
          </Card>
        )}

        {/* Catatan perjalanan (tab): odometer keberangkatan, BBM, laporan
            pengembalian - VEHICLE saja, tampil saat ONGOING/OVERDUE/COMPLETED */}
        {isVehicle && (isOngoingOrOverdue || booking.status === BOOKING_STATUS.COMPLETED) && (
          <TripRecordTabs
            booking={booking}
            linkedBookingIds={(mergeInfo ?? []).map((m) => m.linkedBooking.bookingId)}
          />
        )}

        {/* Kalender (view only) */}
        <Card>
          <AvailabilityCalendar
            resourceId={booking.resource.id}
            resourceType={booking.resource.type}
            mode="view"
          />
        </Card>
      </div>

      {/* ══ KOLOM KANAN ══ */}
      <div className="flex flex-col gap-5">
        <AdminOnly>
          {booking.status === BOOKING_STATUS.PENDING && (
            <BookingApprovalPanel booking={booking} onActionComplete={refetch} />
          )}

          {booking.status === BOOKING_STATUS.APPROVED &&
            booking.resource.type === RESOURCE_TYPE.VEHICLE &&
            !booking.assignedDriver && (
              <BookingAssignPanel booking={booking} onActionComplete={refetch} />
            )}
        </AdminOnly>

        {/* StartPanel: Admin, Room Keeper (ruangan), atau karyawan pemilik booking ruangan */}
        {(isAdmin || (isRoomKeeper && !isVehicle) || canSelfServeRoom) &&
          booking.status === BOOKING_STATUS.APPROVED &&
          !(
            booking.resource.type === RESOURCE_TYPE.VEHICLE &&
            !booking.assignedDriver
          ) && <StartPanel bookingId={booking.id} onActionComplete={refetch} />}

        {/* CompletePanel: Admin, Room Keeper (ruangan), atau karyawan pemilik booking ruangan.
            Tetap tampil saat OVERDUE - booking yang terlambat tetap harus bisa diselesaikan. */}
        {(isAdmin || (isRoomKeeper && !isVehicle) || canSelfServeRoom) &&
          isOngoingOrOverdue && (
            <CompletePanel
              bookingId={booking.id}
              hasReturnReport={!!returnReport}
              isVehicle={isVehicle}
              onActionComplete={refetch}
            />
          )}

        {/* Driver: mulai perjalanan (odometer + foto) */}
        {isDriver &&
          booking.status === BOOKING_STATUS.APPROVED &&
          booking.resource.type === RESOURCE_TYPE.VEHICLE &&
          !!booking.assignedDriver && (
            <Card>
              <CardHeader title="Mulai Perjalanan" />
              <StartBookingModal bookingId={booking.id} onSuccess={refetch} />
            </Card>
          )}

        {/* Driver: catat pengisian BBM */}
        {isDriver &&
          isOngoingOrOverdue &&
          booking.resource.type === RESOURCE_TYPE.VEHICLE && (
            <DriverFuelCard
              vehicleId={booking.assignedVehicle?.id}
              bookingId={booking.id}
              onSuccess={refetch}
            />
          )}

        {/* Pemilik booking: beri rating driver setelah selesai.
            Booking hasil merge (bukan primary) tidak punya form sendiri -
            satu trip cukup satu rating, diisi dari booking utama. */}
        {currentUserId === booking.user.id &&
          booking.status === BOOKING_STATUS.COMPLETED &&
          booking.resource.type === RESOURCE_TYPE.VEHICLE &&
          !!booking.assignedDriver &&
          (mergedIntoPrimaryId ? (
            <Card>
              <CardHeader title="Rating Driver" />
              <p className="text-sm text-[var(--text-secondary)]">
                Booking ini digabung (merge) dengan{" "}
                <Link
                  href={`/booking/${mergedIntoPrimaryId}`}
                  className="font-medium text-[var(--primary)] hover:underline"
                >
                  booking utama #{mergedIntoPrimaryId}
                </Link>
                . Rating driver diisi dari sana.
              </p>
            </Card>
          ) : (
            <RatingCard
              bookingId={booking.id}
              driverName={booking.assignedDriver.name}
              onSuccess={refetch}
            />
          ))}

        {/* Driver: kirim laporan pengembalian - tetap tersedia saat OVERDUE */}
        {isDriver &&
          isOngoingOrOverdue &&
          booking.resource.type === RESOURCE_TYPE.VEHICLE && (
            <Card>
              <CardHeader title="Laporan Pengembalian" />
              <ReturnReportModal bookingId={booking.id} onSuccess={refetch} />
            </Card>
          )}

        {/* Activity Timeline (dipindah dari kolom kiri) */}
        {activity && activity.length > 0 && (
          <Card>
            <CardHeader title="Riwayat Aktivitas" />
            <ol className="relative ml-3 space-y-5 border-l border-[var(--border-divider)] pl-6">
              {activity.map((item) => {
                const cfg = ACTIVITY_ACTION_CONFIG[item.action];
                const Icon = ACTIVITY_ICON[item.action];
                return (
                  <li key={item.id} className="relative">
                    <span
                      className="absolute -left-[2.1rem] flex h-6 w-6 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${cfg.color}26` }}
                    >
                      <Icon className="h-3 w-3" />
                    </span>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                      {cfg.label}
                    </p>
                    {item.description && (
                      <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                        {item.description}
                      </p>
                    )}
                    <p className="mt-0.5 text-xs text-[var(--text-disabled)]">
                      {item.actor ? `${item.actor} · ` : ""}
                      {formatDateTime(item.createdAt)}
                    </p>
                  </li>
                );
              })}
            </ol>
          </Card>
        )}

        {/* Lampiran */}
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
// DRIVER FUEL CARD (ONGOING + VEHICLE)
// ─────────────────────────────────────────

const DriverFuelCard = ({
  vehicleId,
  bookingId,
  onSuccess,
}: {
  vehicleId?: number;
  bookingId: number;
  onSuccess?: () => void;
}) => {
  return (
    <Card>
      <CardHeader title="Pengisian BBM" />
      <FuelInputModal
        presetVehicleId={vehicleId}
        presetBookingId={bookingId}
        onSuccess={onSuccess}
        trigger={
          <AppButton
            fullWidth
            variant="secondary"
            leftIcon={<Fuel className="h-4 w-4" />}
          >
            Catat Pengisian BBM
          </AppButton>
        }
      />
    </Card>
  );
};

// ─────────────────────────────────────────
// RATING CARD (COMPLETED - pemilik booking)
// - Jika sudah dinilai → tampilkan rating (read-only).
// - Jika belum → tombol "Beri Rating"; modal auto-open SEKALI saja
//   (pertama kali pemilik membuka detail booking selesai).
// ─────────────────────────────────────────

const RatingCard = ({
  bookingId,
  driverName,
  onSuccess,
}: {
  bookingId: number;
  driverName?: string;
  onSuccess?: () => void;
}) => {
  const { data: rating, isLoading, isError } = useBookingDriverRating(bookingId);
  const alreadyRated = !!rating; // 404 → isError, rating undefined
  const [open, setOpen] = useState(false);

  // Auto-open sekali: hanya jika belum dinilai & belum pernah di-prompt.
  useEffect(() => {
    if (isLoading || alreadyRated) return;
    const key = `booking-rating-prompted-${bookingId}`;
    if (typeof window === "undefined") return;
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, "1");
    setOpen(true);
    // isError memastikan query 404 sudah selesai sebelum auto-open
  }, [isLoading, alreadyRated, isError, bookingId]);

  if (isLoading) return null;

  // Sudah dinilai → kartu read-only
  if (alreadyRated && rating) {
    return (
      <Card>
        <CardHeader title="Rating Driver" />
        <div className="flex items-center gap-3">
          <StarRating value={rating.rating} size="h-5 w-5" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">
            {rating.rating}/5
          </span>
        </div>
        {rating.review && (
          <p className="mt-3 rounded-lg bg-[var(--bg-subtle)] px-3 py-2 text-sm text-[var(--text-secondary)]">
            “{rating.review}”
          </p>
        )}
        <p className="mt-2 text-xs text-[var(--text-disabled)]">
          Dinilai {formatDateTime(rating.createdAt)}
        </p>
      </Card>
    );
  }

  // Belum dinilai → prompt
  return (
    <Card>
      <CardHeader title="Rating Driver" />
      <p className="mb-3 text-sm text-[var(--text-secondary)]">
        Booking selesai. Beri penilaian untuk driver Anda.
      </p>
      <AppButton
        fullWidth
        leftIcon={<Star className="h-4 w-4" />}
        onClick={() => setOpen(true)}
      >
        Beri Rating
      </AppButton>
      <RateDriverModal
        bookingId={bookingId}
        driverName={driverName}
        open={open}
        onOpenChange={setOpen}
        onSuccess={onSuccess}
      />
    </Card>
  );
};

// ─────────────────────────────────────────
// START PANEL (APPROVED siap jalan → ONGOING)
// ─────────────────────────────────────────

const StartPanel = ({
  bookingId,
  onActionComplete,
}: {
  bookingId: number;
  onActionComplete?: () => void;
}) => {
  const start = useStartBooking();
  return (
    <Card>
      <CardHeader title="Mulai" />
      {start.error && <PanelError error={start.error} />}
      <AppButton
        fullWidth
        loading={start.isPending}
        leftIcon={<Play className="h-4 w-4" />}
        onClick={() =>
          start.mutate({ id: bookingId }, { onSuccess: () => onActionComplete?.() })
        }
      >
        Mulai Booking
      </AppButton>
    </Card>
  );
};

// ─────────────────────────────────────────
// COMPLETE PANEL (ONGOING → COMPLETED)
// ─────────────────────────────────────────

const CompletePanel = ({
  bookingId,
  hasReturnReport,
  isVehicle = true,
  onActionComplete,
}: {
  bookingId: number;
  hasReturnReport?: boolean;
  isVehicle?: boolean;
  onActionComplete?: () => void;
}) => {
  const complete = useCompleteBooking();
  return (
    <Card>
      <CardHeader title="Selesaikan" />
      {complete.error && <PanelError error={complete.error} />}

      {isVehicle && (
        hasReturnReport ? (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
            <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
            <span className="text-xs text-green-700">
              Laporan pengembalian sudah diterima
            </span>
          </div>
        ) : (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
            <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" />
            <span className="text-xs text-amber-700">
              Driver belum mengirim laporan pengembalian
            </span>
          </div>
        )
      )}

      <AppButton
        fullWidth
        loading={complete.isPending}
        leftIcon={<Check className="h-4 w-4" />}
        onClick={() =>
          complete.mutate(bookingId, { onSuccess: () => onActionComplete?.() })
        }
      >
        {isVehicle 
          ? (hasReturnReport ? "Selesaikan Booking" : "Selesaikan Tanpa Laporan")
          : "Selesaikan Booking"}
      </AppButton>
    </Card>
  );
};

const PanelError = ({ error }: { error: unknown }) => (
  <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
    <span>{getErrorMessage(error)}</span>
  </div>
);

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
