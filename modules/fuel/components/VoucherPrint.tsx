'use client'

import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Printer } from 'lucide-react'
import { formatDateTime, formatNumber, getErrorMessage } from '@/lib'
import { useFuelVoucher } from '../hooks/useFuelVoucher'
import { VOUCHER_STATUS_CONFIG, formatQty, formatRupiahExact } from '../utils/format'

// ─────────────────────────────────────────
// CETAK VOUCHER - PRINTER THERMAL
// Lebar kertas 80 mm (default) atau 58 mm. Hitam-putih, monospace, QR berisi
// kode voucher. Dibuka di tab baru (tanpa sidebar) lalu window.print().
// ─────────────────────────────────────────

export const voucherPrintPath = (id: number) => `/fuel-voucher/${id}`

export const openVoucherPrint = (id: number) => {
  if (typeof window !== 'undefined') window.open(voucherPrintPath(id), '_blank', 'noopener')
}

type Paper = '80' | '58'
const PAPER_KEY = 'kce.voucherPaper'

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="vp-row">
    <span>{label}</span>
    <span className="vp-val">{value}</span>
  </div>
)

export const VoucherPrint = ({ id }: { id: number }) => {
  const { data: v, isLoading, error } = useFuelVoucher(id)
  const [paper, setPaper] = useState<Paper>('80')

  useEffect(() => {
    try {
      const saved = localStorage.getItem(PAPER_KEY)
      if (saved === '58' || saved === '80') setPaper(saved)
    } catch {
      // abaikan - default 80 mm
    }
  }, [])

  const choosePaper = (p: Paper) => {
    setPaper(p)
    try {
      localStorage.setItem(PAPER_KEY, p)
    } catch {
      // abaikan
    }
  }

  const widthMm = paper === '58' ? 58 : 80
  const qrSize = paper === '58' ? 120 : 150

  return (
    <div className="vp-root">
      <style>{`
        @page { size: ${widthMm}mm auto; margin: 0; }
        .vp-root { background: #e5e7eb; min-height: 100vh; padding: 16px 0; font-family: ui-monospace, 'Courier New', monospace; color: #000; }
        .vp-toolbar { display: flex; gap: 8px; justify-content: center; align-items: center; margin-bottom: 12px; font-family: Inter, sans-serif; font-size: 13px; }
        .vp-toolbar button { height: 34px; padding: 0 12px; border-radius: 8px; border: 1px solid #d1d5db; background: #fff; cursor: pointer; }
        .vp-toolbar button.vp-on { border-color: #2D2CE8; color: #2D2CE8; font-weight: 600; }
        .vp-toolbar .vp-print { background: #2D2CE8; color: #fff; border-color: #2D2CE8; display: inline-flex; gap: 6px; align-items: center; }
        .vp-paper { width: ${widthMm}mm; margin: 0 auto; background: #fff; padding: 4mm ${paper === '58' ? 2 : 4}mm 8mm; font-size: ${paper === '58' ? 10 : 11.5}px; line-height: 1.35; }
        .vp-center { text-align: center; }
        .vp-title { font-size: 1.35em; font-weight: 700; letter-spacing: 0.04em; }
        .vp-sep { border-top: 1px dashed #000; margin: 6px 0; }
        .vp-row { display: flex; justify-content: space-between; gap: 8px; }
        .vp-val { text-align: right; font-weight: 600; word-break: break-word; }
        .vp-big { font-size: 1.6em; font-weight: 800; text-align: center; margin: 2px 0; }
        .vp-code { font-size: 1.25em; font-weight: 800; letter-spacing: 0.08em; text-align: center; }
        .vp-small { font-size: 0.85em; }
        .vp-stamp { border: 2px solid #000; text-align: center; font-weight: 800; padding: 2px; margin: 4px 0; }
        .vp-sign { display: flex; justify-content: space-between; margin-top: 18px; gap: 8px; }
        .vp-sign div { flex: 1; text-align: center; border-top: 1px solid #000; padding-top: 2px; }
        @media print {
          .vp-root { background: #fff; padding: 0; }
          .vp-toolbar { display: none; }
          .vp-paper { margin: 0; }
        }
      `}</style>

      <div className="vp-toolbar">
        <span>Kertas:</span>
        <button type="button" className={paper === '80' ? 'vp-on' : ''} onClick={() => choosePaper('80')}>
          80 mm
        </button>
        <button type="button" className={paper === '58' ? 'vp-on' : ''} onClick={() => choosePaper('58')}>
          58 mm
        </button>
        <button type="button" className="vp-print" disabled={!v} onClick={() => window.print()}>
          <Printer size={14} /> Cetak
        </button>
      </div>

      <div className="vp-paper">
        {isLoading ? (
          <p className="vp-center">Memuat…</p>
        ) : error || !v ? (
          <p className="vp-center">{error ? getErrorMessage(error) : 'Voucher tidak ditemukan'}</p>
        ) : (
          <>
            <div className="vp-center">
              <div className="vp-title">VOUCHER BBM</div>
              <div className="vp-small">KCE · Sistem Reservasi</div>
            </div>
            <div className="vp-sep" />
            <div className="vp-center">
              <div className="vp-small">SPBU MITRA</div>
              <div style={{ fontWeight: 700 }}>{v.stationName}</div>
              {v.stationAddress && <div className="vp-small">{v.stationAddress}</div>}
            </div>
            <div className="vp-sep" />
            <div className="vp-big">{formatQty(v.liter)} LITER</div>
            <div className="vp-center" style={{ fontWeight: 700 }}>
              {v.fuelTypeName}
            </div>
            <div className="vp-big" style={{ fontSize: '1.35em' }}>
              {formatRupiahExact(v.amount)}
            </div>
            <div className="vp-center vp-small">@ {formatRupiahExact(v.pricePerLiter)} / liter</div>
            {v.status !== 'ISSUED' && (
              <div className="vp-stamp">{VOUCHER_STATUS_CONFIG[v.status].label.toUpperCase()}</div>
            )}
            <div className="vp-sep" />
            <Row label="Kendaraan" value={v.plateNumber} />
            <Row label="" value={v.vehicleName} />
            <Row label="Driver" value={v.driverName ?? '-'} />
            <Row label="Odometer" value={`${formatNumber(v.odometer)} km`} />
            <Row label="Terbit" value={formatDateTime(v.createdAt)} />
            <Row label="Berlaku s.d." value={`${formatDateTime(v.validUntil)} WIB`} />
            <Row label="Oleh" value={v.issuedByName} />
            <div className="vp-sep" />
            <div className="vp-center" style={{ margin: '6px 0' }}>
              <QRCodeSVG value={v.code} size={qrSize} level="M" marginSize={0} />
            </div>
            <div className="vp-code">{v.code}</div>
            <div className="vp-sep" />
            <div className="vp-small">
              Isi sesuai nominal di atas. Voucher berlaku satu kali, hanya untuk kendaraan tertera, dan
              ditagihkan ke KCE. Driver wajib mengonfirmasi pengisian + foto struk di aplikasi.
            </div>
            {v.note && <div className="vp-small" style={{ marginTop: 4 }}>Catatan: {v.note}</div>}
            <div className="vp-sign">
              <div>Petugas SPBU</div>
              <div>Driver</div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
