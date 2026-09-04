'use client'

import { Toaster as Sonner, type ToasterProps } from 'sonner'

// Proyek ini belum pakai next-themes secara aktif (tidak ada ThemeProvider
// terpasang, design system saat ini cuma light) - jadi theme dikunci "light"
// langsung, tidak bergantung ke useTheme().
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      style={
        {
          '--normal-bg': 'var(--bg-card)',
          '--normal-text': 'var(--text-primary)',
          '--normal-border': 'var(--border-card)',
          '--success-bg': '#DCFCE7',
          '--success-text': '#166534',
          '--success-border': '#BBF7D0',
          '--error-bg': '#FEE2E2',
          '--error-text': '#991B1B',
          '--error-border': '#FECACA',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
