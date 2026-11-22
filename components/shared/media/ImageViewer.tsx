'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ImageOff,
  Maximize2,
  RotateCcw,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { SafeImage } from './SafeImage'

// ─────────────────────────────────────────
// IMAGE VIEWER
// Penampil foto LAYAR PENUH: foto tampil utuh (object-contain, tidak
// terpotong), zoom (tombol, scroll, klik dua kali, cubit di layar sentuh),
// geser foto saat diperbesar, pindah antar-foto (panah, tombol ←/→, swipe).
// Padanan `AppImageViewer` di mobile. Thumbnail cukup pakai <PreviewImage>.
// ─────────────────────────────────────────

export interface ViewerImage {
  src: string
  caption?: string
}

const MIN_SCALE = 1
const MAX_SCALE = 5
const DOUBLE_CLICK_SCALE = 2.5
const clampScale = (s: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s))

interface ImageViewerProps {
  images: ViewerImage[]
  /** Foto yang sedang dibuka; `null` = tertutup. */
  index: number | null
  onIndexChange: (index: number | null) => void
}

export const ImageViewer = ({ images, index, onIndexChange }: ImageViewerProps) => {
  const open = index !== null && images.length > 0
  const current = open ? Math.min(Math.max(index, 0), images.length - 1) : 0
  const image = images[current]
  const multi = images.length > 1

  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [failed, setFailed] = useState(false)
  const [dragging, setDragging] = useState(false)

  // Pointer aktif (mouse/jari) untuk geser & cubit.
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const justGestured = useRef(false)
  const gesture = useRef<{
    startX: number
    startY: number
    origin: { x: number; y: number }
    pinchDist?: number
    pinchScale?: number
    moved: boolean
  } | null>(null)

  const reset = useCallback(() => {
    setScale(1)
    setOffset({ x: 0, y: 0 })
  }, [])

  // Pindah foto / buka ulang → kembali ke tampilan utuh.
  useEffect(() => {
    reset()
    setFailed(false)
  }, [current, open, reset])

  const go = useCallback(
    (delta: number) => {
      if (!multi) return
      onIndexChange((current + delta + images.length) % images.length)
    },
    [current, images.length, multi, onIndexChange],
  )

  // Bentuk fungsi → klik/scroll beruntun dihitung dari nilai terbaru.
  const zoomTo = useCallback((next: number | ((s: number) => number)) => {
    setScale((prev) => clampScale(typeof next === 'function' ? next(prev) : next))
  }, [])

  // Kembali ke ukuran utuh → posisi geser ikut di-nol-kan.
  useEffect(() => {
    if (scale === 1) setOffset({ x: 0, y: 0 })
  }, [scale])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') go(1)
    else if (e.key === 'ArrowLeft') go(-1)
    else if (e.key === '+' || e.key === '=') zoomTo((s) => s + 0.5)
    else if (e.key === '-') zoomTo((s) => s - 0.5)
    else if (e.key === '0') reset()
    else return
    e.preventDefault()
  }

  const onWheel = (e: React.WheelEvent) => {
    const f = e.deltaY < 0 ? 1.15 : 1 / 1.15
    zoomTo((s) => s * f)
  }

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    // Tombol panah ada di dalam area foto - biarkan klik-nya normal.
    if ((e.target as HTMLElement).closest('button, a')) return
    justGestured.current = false
    try {
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    } catch {
      // Pointer sudah tidak aktif - gesture tetap jalan tanpa capture.
    }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const pts = [...pointers.current.values()]
    gesture.current = {
      startX: e.clientX,
      startY: e.clientY,
      origin: offset,
      moved: false,
      ...(pts.length === 2 && {
        pinchDist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y),
        pinchScale: scale,
      }),
    }
    setDragging(true)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const g = gesture.current
    if (!g || !pointers.current.has(e.pointerId)) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    const pts = [...pointers.current.values()]

    if (pts.length === 2 && g.pinchDist) {
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
      zoomTo((g.pinchScale ?? 1) * (dist / g.pinchDist))
      g.moved = true
      return
    }
    const dx = e.clientX - g.startX
    const dy = e.clientY - g.startY
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) g.moved = true
    if (scale > 1) setOffset({ x: g.origin.x + dx, y: g.origin.y + dy })
  }

  const onPointerUp = (e: React.PointerEvent) => {
    const g = gesture.current
    pointers.current.delete(e.pointerId)
    if (pointers.current.size > 0) return
    setDragging(false)
    gesture.current = null
    // Geser/cubit diakhiri event click → jangan dianggap "klik area kosong = tutup".
    justGestured.current = !!g?.moved
    // Swipe kiri/kanan (tanpa zoom) = pindah foto.
    if (g && scale === 1 && !g.pinchDist) {
      const dx = e.clientX - g.startX
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(e.clientY - g.startY)) go(dx < 0 ? 1 : -1)
    }
  }

  const onDoubleClick = () => (scale > 1 ? reset() : zoomTo(DOUBLE_CLICK_SCALE))

  const toolBtn =
    'flex h-9 w-9 items-center justify-center rounded-full text-white/90 transition-colors hover:bg-white/15 disabled:opacity-40 disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60'

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && onIndexChange(null)}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-black data-open:animate-in data-open:fade-in-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          onKeyDown={onKeyDown}
          className="fixed inset-0 z-[60] flex flex-col outline-none data-open:animate-in data-open:fade-in-0"
        >
          <DialogPrimitive.Title className="sr-only">
            {image?.caption || 'Pratinjau foto'}
          </DialogPrimitive.Title>

          {/* Bar atas */}
          <div className="relative z-10 flex items-center gap-1 bg-black/50 px-2 py-1.5 text-white">
            <span className="min-w-0 flex-1 truncate px-2 text-sm font-medium">
              {multi && `${current + 1} / ${images.length}`}
              {multi && image?.caption ? ' · ' : ''}
              {image?.caption}
            </span>
            <button type="button" className={toolBtn} onClick={() => zoomTo((s) => s - 0.5)} disabled={scale <= MIN_SCALE} aria-label="Perkecil" title="Perkecil (-)">
              <ZoomOut className="h-5 w-5" />
            </button>
            <span className="w-12 text-center text-xs tabular-nums text-white/80">{Math.round(scale * 100)}%</span>
            <button type="button" className={toolBtn} onClick={() => zoomTo((s) => s + 0.5)} disabled={scale >= MAX_SCALE} aria-label="Perbesar" title="Perbesar (+)">
              <ZoomIn className="h-5 w-5" />
            </button>
            <button type="button" className={toolBtn} onClick={reset} disabled={scale === 1} aria-label="Ukuran utuh" title="Ukuran utuh (0)">
              <RotateCcw className="h-4 w-4" />
            </button>
            {image && (
              <a href={image.src} target="_blank" rel="noopener noreferrer" className={toolBtn} aria-label="Buka foto asli di tab baru" title="Buka foto asli">
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
            <DialogPrimitive.Close className={toolBtn} aria-label="Tutup" title="Tutup (Esc)">
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </div>

          {/* Foto */}
          <div
            className={cn(
              'relative flex min-h-0 flex-1 touch-none select-none items-center justify-center overflow-hidden',
              scale > 1 ? (dragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in',
            )}
            onWheel={onWheel}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onDoubleClick={onDoubleClick}
            onClick={(e) => {
              // Klik area kosong (bukan foto) tanpa geser = tutup, seperti lightbox umumnya.
              if (justGestured.current) {
                justGestured.current = false
                return
              }
              if (e.target === e.currentTarget && scale === 1) onIndexChange(null)
            }}
          >
            {image && !failed ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={image.src}
                src={image.src}
                alt={image.caption || 'Foto'}
                draggable={false}
                onError={() => setFailed(true)}
                className="max-h-full max-w-full object-contain"
                style={{
                  transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                  transition: dragging ? 'none' : 'transform 150ms ease-out',
                }}
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-sm text-white/60">
                <ImageOff className="h-10 w-10" />
                Foto tidak dapat dimuat
              </div>
            )}

            {multi && (
              <>
                <button type="button" onClick={() => go(-1)} aria-label="Foto sebelumnya" className={cn(toolBtn, 'absolute left-3 top-1/2 h-11 w-11 -translate-y-1/2 bg-black/40')}>
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button type="button" onClick={() => go(1)} aria-label="Foto berikutnya" className={cn(toolBtn, 'absolute right-3 top-1/2 h-11 w-11 -translate-y-1/2 bg-black/40')}>
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          {/* Strip thumbnail */}
          {multi && (
            <div className="flex justify-center gap-2 overflow-x-auto bg-black/50 p-2">
              {images.map((img, i) => (
                <button
                  key={`${img.src}-${i}`}
                  type="button"
                  onClick={() => onIndexChange(i)}
                  aria-label={`Foto ${i + 1}`}
                  aria-current={i === current}
                  className={cn(
                    'h-12 w-12 shrink-0 overflow-hidden rounded-md border-2 transition-opacity',
                    i === current ? 'border-white' : 'border-transparent opacity-60 hover:opacity-100',
                  )}
                >
                  <SafeImage src={img.src} alt="" className="h-full w-full object-cover" fallbackClassName="bg-white/10 text-white/50" fallback={<ImageOff className="h-4 w-4" />} />
                </button>
              ))}
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

/** Pegangan state penampil: `open(i)` membuka foto ke-i, `props` → <ImageViewer>. */
export const useImageViewer = (images: ViewerImage[]) => {
  const [index, setIndex] = useState<number | null>(null)
  return {
    open: (i = 0) => setIndex(i),
    props: { images, index, onIndexChange: setIndex },
  }
}

// ─────────────────────────────────────────
// PREVIEW IMAGE
// Thumbnail yang bisa diklik → <ImageViewer> layar penuh. Thumbnail tetap
// `object-cover` (rapi); foto utuh tampil di penampil. `gallery` = semua foto
// sekelompok agar bisa digeser, `index` = posisi foto ini di dalamnya.
// JANGAN dipasang di dalam elemen yang sendirinya bisa diklik (kartu/baris
// daftar yang membuka detail) - <button> bersarang tidak valid.
// ─────────────────────────────────────────

interface PreviewImageProps {
  src?: string | null
  alt: string
  /** Kelas pembungkus (ukuran, radius, border). */
  className?: string
  /** Kelas <img>; default `h-full w-full object-cover`. */
  imgClassName?: string
  fallback: React.ReactNode
  fallbackClassName?: string
  gallery?: ViewerImage[]
  index?: number
  caption?: string
  /** Ikon "perbesar" saat hover (default tampil). */
  showHint?: boolean
}

export const PreviewImage = ({
  src,
  alt,
  className,
  imgClassName = 'h-full w-full object-cover',
  fallback,
  fallbackClassName,
  gallery,
  index = 0,
  caption,
  showHint = true,
}: PreviewImageProps) => {
  const images = gallery?.length ? gallery : src ? [{ src, caption: caption ?? alt }] : []
  const viewer = useImageViewer(images)

  if (!src) {
    return (
      <span className={cn('block overflow-hidden', className)}>
        <SafeImage src={null} alt={alt} className={imgClassName} fallbackClassName={fallbackClassName} fallback={fallback} />
      </span>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          viewer.open(gallery?.length ? index : 0)
        }}
        aria-label={`Lihat foto ${alt}`}
        title="Klik untuk memperbesar"
        className={cn('group relative block cursor-zoom-in overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]', className)}
      >
        <SafeImage src={src} alt={alt} className={imgClassName} fallbackClassName={fallbackClassName} fallback={fallback} />
        {showHint && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100 group-focus-visible:bg-black/30 group-focus-visible:opacity-100">
            <Maximize2 className="h-4 w-4 drop-shadow" />
          </span>
        )}
      </button>
      <ImageViewer {...viewer.props} />
    </>
  )
}

/** Lampiran/dokumen berupa gambar? (dari MIME atau ekstensi nama file) */
export const isImageFile = (nameOrType?: string | null) =>
  !!nameOrType && (/^image\//i.test(nameOrType) || /\.(jpe?g|png|gif|webp|bmp|heic)$/i.test(nameOrType))
