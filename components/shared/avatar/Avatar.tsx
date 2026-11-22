import { cn } from '@/lib/utils'
import { resolveFileUrl, getInitials } from '@/lib/utils'
import { SafeImage } from '@/components/shared/media/SafeImage'
import { PreviewImage } from '@/components/shared/media/ImageViewer'

// ─────────────────────────────────────────
// USER AVATAR
// Initials fallback, warna dari nama hash
// ─────────────────────────────────────────

const AVATAR_COLORS = [
  { bg: '#E8E8FC', text: '#2D2CE8' },
  { bg: '#DCFCE7', text: '#166534' },
  { bg: '#DBEAFE', text: '#1E40AF' },
  { bg: '#FEF9C3', text: '#854D0E' },
  { bg: '#FCE7F3', text: '#9D174D' },
  { bg: '#F3E8FF', text: '#6B21A8' },
  { bg: '#FFEDD5', text: '#9A3412' },
]

const hashName = (name: string) => {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return Math.abs(hash) % AVATAR_COLORS.length
}

const SIZE = {
  xs:  'h-6 w-6 text-[9px]',
  sm:  'h-8 w-8 text-[11px]',
  md:  'h-9 w-9 text-xs',
  lg:  'h-11 w-11 text-sm',
  xl:  'h-14 w-14 text-base',
} as const

interface UserAvatarProps {
  name:       string
  photo?:     string | null
  size?:      keyof typeof SIZE
  className?: string
  /** Klik foto → layar penuh (dipakai di halaman/modal detail, bukan daftar). */
  previewable?: boolean
}

export const UserAvatar = ({ name, photo, size = 'md', className, previewable = false }: UserAvatarProps) => {
  const photoUrl = resolveFileUrl(photo)
  const color    = AVATAR_COLORS[hashName(name)]
  const initials = getInitials(name)

  const initialsFallback = (
    <span
      className={cn(
        'inline-flex h-full w-full shrink-0 items-center justify-center rounded-full font-semibold',
        SIZE[size],
      )}
      style={{ backgroundColor: color.bg, color: color.text }}
      aria-label={name}
    >
      {initials}
    </span>
  )

  if (!photoUrl) return initialsFallback

  if (previewable) {
    return (
      <PreviewImage
        src={photoUrl}
        alt={name}
        caption={name}
        className={cn('shrink-0 rounded-full', SIZE[size])}
        imgClassName={cn('rounded-full object-cover', SIZE[size], className)}
        fallback={initialsFallback}
        showHint={false}
      />
    )
  }

  return (
    <SafeImage
      src={photoUrl}
      alt={name}
      className={cn('rounded-full object-cover', SIZE[size], className)}
      fallback={initialsFallback}
    />
  )
}