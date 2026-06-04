import { cn } from '@/lib/utils'
import { resolveFileUrl, getInitials } from '@/lib/utils'

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
}

export const UserAvatar = ({ name, photo, size = 'md', className }: UserAvatarProps) => {
  const photoUrl = resolveFileUrl(photo)
  const color    = AVATAR_COLORS[hashName(name)]
  const initials = getInitials(name)

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={cn('rounded-full object-cover', SIZE[size], className)}
      />
    )
  }

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-semibold',
        SIZE[size],
        className,
      )}
      style={{ backgroundColor: color.bg, color: color.text }}
      aria-label={name}
    >
      {initials}
    </span>
  )
}