import type { MouseEvent as ReactMouseEvent } from 'react'

// ─────────────────────────────────────────
// KLIK BARIS / KARTU = BUKA DETAIL
// Tombol "lihat detail" (ikon mata, "Detail") ditandai atribut
// `data-row-open`. Klik di bagian KOSONG baris/kartu meneruskan klik ke
// elemen itu - jadi cara membukanya tetap milik elemen tsb (Link ke
// halaman detail, atau setOpen modal) tanpa diangkat ke tabel.
//
// Elemen interaktif lain di dalam baris (tombol Batal/Edit, nama pemohon,
// checkbox, toggle, …) tetap menjalankan aksinya sendiri dan TIDAK membuka
// detail. Klik dari dalam modal/popup (portal React ikut menggelembung ke
// baris walau DOM-nya di luar) juga diabaikan.
//
// Pemakaian:
//   <tr onClick={openRowDetail}> … <Link data-row-open href=…/> … </tr>
//   <div onClick={openRowDetail} className={ROW_OPEN_CLASS}> … </div>
// ─────────────────────────────────────────

const INTERACTIVE =
  'a,button,input,select,textarea,label,summary,[role="button"],[role="checkbox"],' +
  '[role="switch"],[role="combobox"],[role="menuitem"],[role="option"],[role="tab"],' +
  '[contenteditable="true"],[data-no-row-open]'

/** Kursor tangan hanya bila wadah memang punya tombol detail. */
export const ROW_OPEN_CLASS = 'has-[[data-row-open]]:cursor-pointer'

export const openRowDetail = (e: ReactMouseEvent<HTMLElement>) => {
  if (e.defaultPrevented || e.button !== 0) return
  const root = e.currentTarget
  const target = e.target
  // Portal (modal/dropdown) - DOM-nya bukan anak wadah ini.
  if (!(target instanceof Element) || !root.contains(target)) return
  const hit = target.closest(INTERACTIVE)
  if (hit && hit !== root && root.contains(hit)) return
  // Sedang memblok teks untuk disalin - jangan pindah halaman.
  if (window.getSelection()?.toString()) return

  const opener = root.querySelector<HTMLElement>('[data-row-open]')
  if (!opener) return
  // Teruskan Ctrl/⌘/Shift supaya Ctrl+klik tetap membuka tab baru.
  opener.dispatchEvent(
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
      ctrlKey: e.ctrlKey,
      metaKey: e.metaKey,
      shiftKey: e.shiftKey,
      altKey: e.altKey,
    }),
  )
}
