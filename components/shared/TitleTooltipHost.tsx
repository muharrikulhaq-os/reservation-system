'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'

// ─────────────────────────────────────────
// TITLE TOOLTIP HOST - tooltip bertema untuk semua atribut `title`.
// Tooltip bawaan browser (kotak kuning/abu, muncul lambat) tidak bisa
// diberi tema. Saat kursor masuk ke elemen ber-`title`, atributnya
// dipindah sementara ke data-app-title (agar tooltip bawaan tidak ikut
// muncul) lalu dikembalikan saat kursor keluar. Dipasang sekali di
// app/layout.tsx; komponen cukup tetap memakai `title="…"`.
// ─────────────────────────────────────────

const DELAY_MS = 350
const GAP = 8
const EDGE = 8

interface Tip {
  text: string
  rect: DOMRect
}

export const TitleTooltipHost = () => {
  const [tip, setTip] = useState<Tip | null>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null)

  useEffect(() => {
    let active: HTMLElement | null = null
    let timer: ReturnType<typeof setTimeout> | undefined

    const restore = () => {
      clearTimeout(timer)
      if (active) {
        const text = active.getAttribute('data-app-title')
        // React bisa saja sudah memasang ulang title saat render ulang.
        if (text != null && !active.hasAttribute('title')) active.setAttribute('title', text)
        active.removeAttribute('data-app-title')
      }
      active = null
      setTip(null)
    }

    const onOver = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      const target = (e.target as Element | null)?.closest?.('[title]') as HTMLElement | null
      if (!target || target === active) return
      const text = target.getAttribute('title')?.trim()
      restore()
      if (!text) return
      active = target
      target.setAttribute('data-app-title', text)
      target.removeAttribute('title')
      // Nama aksesibel tombol ikon tetap ada selama title dipindah.
      if (!target.hasAttribute('aria-label') && !target.textContent?.trim()) {
        target.setAttribute('aria-label', text)
      }
      timer = setTimeout(() => {
        if (active === target && target.isConnected) {
          setTip({ text, rect: target.getBoundingClientRect() })
        }
      }, DELAY_MS)
    }

    const onOut = (e: PointerEvent) => {
      if (!active) return
      const to = e.relatedTarget as Node | null
      if (to && active.contains(to)) return
      restore()
    }

    document.addEventListener('pointerover', onOver)
    document.addEventListener('pointerout', onOut)
    document.addEventListener('pointerdown', restore, true)
    document.addEventListener('keydown', restore, true)
    window.addEventListener('scroll', restore, true)
    window.addEventListener('blur', restore)
    return () => {
      restore()
      document.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerout', onOut)
      document.removeEventListener('pointerdown', restore, true)
      document.removeEventListener('keydown', restore, true)
      window.removeEventListener('scroll', restore, true)
      window.removeEventListener('blur', restore)
    }
  }, [])

  // Di atas elemen; pindah ke bawah bila mepet atas. Dijepit ke viewport.
  useLayoutEffect(() => {
    const box = boxRef.current
    if (!tip || !box) {
      setPos(null)
      return
    }
    const { width, height } = box.getBoundingClientRect()
    const center = tip.rect.left + tip.rect.width / 2
    const left = Math.min(Math.max(center - width / 2, EDGE), window.innerWidth - width - EDGE)
    const above = tip.rect.top - GAP - height
    const top = above >= EDGE ? above : tip.rect.bottom + GAP
    setPos({ left, top })
  }, [tip])

  if (!tip) return null
  return (
    <div
      ref={boxRef}
      role="tooltip"
      style={{ left: pos?.left ?? -9999, top: pos?.top ?? -9999 }}
      className="pointer-events-none fixed z-[100] max-w-xs whitespace-pre-line rounded-lg bg-[var(--text-primary)] px-2.5 py-1.5 text-xs font-medium leading-snug text-[var(--bg-card)] shadow-[0_4px_16px_rgba(0,0,0,0.18)] animate-in fade-in-0 zoom-in-95 duration-100"
    >
      {tip.text}
    </div>
  )
}
