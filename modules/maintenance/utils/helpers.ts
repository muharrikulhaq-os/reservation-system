import { wibHM, wibToISO, wibYMD } from '@/lib'
import type { MaintenancePdfKind } from '@/types'
import { maintenanceApi } from '../api/maintenance.api'

/** ISO → nilai `<input type="datetime-local">` dalam jam dinding WIB. */
export const toWibInput = (iso?: string | null | Date) =>
  iso ? `${wibYMD(iso)}T${wibHM(iso)}` : ''

/** Nilai datetime-local (WIB) → ISO; kosong → undefined. */
export const fromWibInput = (v?: string) => {
  if (!v) return undefined
  const [ymd, hm] = v.split('T')
  return wibToISO(ymd, hm || '00:00')
}

/** Sekarang dalam format datetime-local WIB. */
export const nowWibInput = () => toWibInput(new Date())

/**
 * Buka PDF buatan backend di tab baru (unduh bila `download`). Tab dibuka
 * lebih dulu - sebelum request - supaya tidak diblokir popup blocker.
 */
export const openMaintenancePdf = async (id: number, kind: MaintenancePdfKind, download = false) => {
  const tab = download ? null : window.open('', '_blank')
  try {
    const { blob, name } = await maintenanceApi.pdf(id, kind)
    const url = URL.createObjectURL(blob)
    if (tab) {
      tab.location.href = url
    } else {
      const a = document.createElement('a')
      a.href = url
      a.download = name
      document.body.appendChild(a)
      a.click()
      a.remove()
    }
    setTimeout(() => URL.revokeObjectURL(url), 60_000)
  } catch (e) {
    tab?.close()
    throw e
  }
}
