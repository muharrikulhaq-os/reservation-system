import { MessageCircle, Phone } from 'lucide-react'
import { cn } from '@/lib'

// ─────────────────────────────────────────
// PHONE CONTACT
// Nomor telepon yang bisa langsung dihubungi: klik nomor → telepon (tel:),
// tombol kecil → chat WhatsApp. Dipakai di detail booking (nomor pemohon /
// supir) supaya supir/admin bisa menghubungi bila tidak bertemu di titik
// jemput. Nomor kosong → tidak merender apa pun (atau `fallback`).
// ─────────────────────────────────────────

/** "0812-3456 7890" / "+62 812..." → "6281234567890" (format wa.me). */
export const toWhatsAppNumber = (phone: string): string => {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0')) return '62' + digits.slice(1)
  if (digits.startsWith('8')) return '62' + digits
  return digits
}

interface PhoneContactProps {
  phone?: string | null
  className?: string
  /** Tampilkan tombol WhatsApp di samping nomor (default: ya). */
  whatsapp?: boolean
  fallback?: React.ReactNode
}

export const PhoneContact = ({ phone, className, whatsapp = true, fallback = null }: PhoneContactProps) => {
  const value = phone?.trim()
  if (!value) return <>{fallback}</>
  const tel = value.replace(/[^\d+]/g, '')

  return (
    <span className={cn('inline-flex flex-wrap items-center gap-x-3 gap-y-1 text-xs', className)}>
      <a
        href={`tel:${tel}`}
        title="Telepon"
        className="inline-flex items-center gap-1 font-medium text-[var(--primary)] hover:underline"
      >
        <Phone className="h-3 w-3" />
        {value}
      </a>
      {whatsapp && (
        <a
          href={`https://wa.me/${toWhatsAppNumber(value)}`}
          target="_blank"
          rel="noopener noreferrer"
          title="Chat WhatsApp"
          className="inline-flex items-center gap-1 text-[var(--success)] hover:underline"
        >
          <MessageCircle className="h-3 w-3" />
          WhatsApp
        </a>
      )}
    </span>
  )
}
