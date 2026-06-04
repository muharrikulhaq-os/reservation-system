'use client'

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { IconButton } from "@/components/ui-custom/Appbutton";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────
// PAGE HEADER
// Judul halaman + deskripsi opsional + tombol
// back opsional + slot aksi di kanan.
// ─────────────────────────────────────────

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Tampilkan tombol kembali sebagai Link */
  backHref?: string;
  /** Tampilkan tombol kembali sebagai handler */
  onBack?: () => void;
  /** Slot aksi di kanan (mis. tombol primary) */
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader = ({
  title,
  description,
  backHref,
  onBack,
  actions,
  className,
}: PageHeaderProps) => {
  const showBack = !!backHref || !!onBack;

  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        {showBack &&
          (backHref ? (
            <Link href={backHref} className="mt-0.5" aria-label="Kembali">
              <IconButton
                variant="ghost"
                size="icon-sm"
                aria-label="Kembali"
                icon={<ArrowLeft className="h-4 w-4" />}
              />
            </Link>
          ) : (
            <IconButton
              variant="ghost"
              size="icon-sm"
              aria-label="Kembali"
              className="mt-0.5"
              onClick={onBack}
              icon={<ArrowLeft className="h-4 w-4" />}
            />
          ))}

        <div className="min-w-0">
          <h1
            className="text-xl font-bold text-[var(--text-primary)]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              {description}
            </p>
          )}
        </div>
      </div>

      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
};
