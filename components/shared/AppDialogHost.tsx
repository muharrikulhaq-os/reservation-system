'use client'

import { useEffect, useState, useSyncExternalStore } from 'react'
import { AlertTriangle, CheckCircle2, Info, Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AppButton, InputText, InputTextArea } from '@/components/ui-custom'
import { dialogStore, type DialogRequest, type DialogTone } from '@/lib/dialog'
import { cn } from '@/lib/utils'

// ─────────────────────────────────────────
// APP DIALOG HOST - menggambar appAlert / appConfirm / appPrompt
// (lib/dialog.ts). Dipasang sekali di app/layout.tsx.
// ─────────────────────────────────────────

const TONE: Record<DialogTone, { icon: React.ReactNode; wrap: string }> = {
  primary: {
    icon: <Info className="h-6 w-6 text-[var(--primary)]" />,
    wrap: 'bg-[var(--primary-light)] ring-[var(--primary-light)]/60',
  },
  danger: {
    icon: <Trash2 className="h-6 w-6 text-[var(--danger)]" />,
    wrap: 'bg-red-50 ring-red-50/60 dark:bg-red-950/40',
  },
  warning: {
    icon: <AlertTriangle className="h-6 w-6 text-[var(--warning)]" />,
    wrap: 'bg-amber-50 ring-amber-50/60 dark:bg-amber-950/40',
  },
  success: {
    icon: <CheckCircle2 className="h-6 w-6 text-[var(--success)]" />,
    wrap: 'bg-green-50 ring-green-50/60 dark:bg-green-950/40',
  },
}

export const AppDialogHost = () => {
  const req = useSyncExternalStore(dialogStore.subscribe, dialogStore.current, () => null)
  return req ? <DialogView key={req.id} req={req} /> : null
}

const DialogView = ({ req }: { req: DialogRequest }) => {
  const { options } = req
  const isPrompt = req.kind === 'prompt'
  const prompt = isPrompt ? req.options : null
  const tone = options.tone ?? (req.kind === 'alert' ? 'primary' : 'warning')
  const [open, setOpen] = useState(true)
  const [text, setText] = useState(prompt?.defaultValue ?? '')
  const trimmed = text.trim()
  const canSubmit = !isPrompt || !(prompt?.required ?? true) || trimmed !== ''

  // Tutup dengan animasi, baru keluarkan dari antrean.
  const finish = (result: 'ok' | 'cancel') => {
    if (req.kind === 'alert') req.resolve()
    else if (req.kind === 'confirm') req.resolve(result === 'ok')
    else req.resolve(result === 'ok' ? trimmed : null)
    setOpen(false)
  }

  useEffect(() => {
    if (open) return
    const t = setTimeout(() => dialogStore.close(req.id), 150)
    return () => clearTimeout(t)
  }, [open, req.id])

  const submit = () => {
    if (canSubmit) finish('ok')
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o && open) finish('cancel')
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="overflow-hidden rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-6 shadow-[var(--shadow-modal)] sm:max-w-[420px]"
      >
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
          className="flex flex-col items-center text-center sm:items-start sm:text-left"
        >
          <div
            className={cn(
              'mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ring-4',
              TONE[tone].wrap,
            )}
          >
            {options.icon ?? TONE[tone].icon}
          </div>

          <DialogHeader className="w-full p-0 text-center sm:text-left">
            <DialogTitle
              className="text-lg font-bold text-[var(--text-primary)]"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              {options.title}
            </DialogTitle>
            {options.description ? (
              <DialogDescription asChild>
                <div className="mt-1 whitespace-pre-line text-sm leading-relaxed text-[var(--text-secondary)]">
                  {options.description}
                </div>
              </DialogDescription>
            ) : (
              <DialogDescription className="sr-only">{options.title}</DialogDescription>
            )}
          </DialogHeader>

          {prompt && (
            <div className="mt-4 w-full text-left">
              {prompt.multiline ? (
                <InputTextArea
                  label={prompt.label}
                  required={prompt.required ?? true}
                  placeholder={prompt.placeholder}
                  rows={3}
                  autoFocus
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submit()
                  }}
                />
              ) : (
                <InputText
                  label={prompt.label}
                  required={prompt.required ?? true}
                  placeholder={prompt.placeholder}
                  autoFocus
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              )}
            </div>
          )}

          <div className="mt-6 flex w-full flex-col-reverse gap-2.5 sm:flex-row sm:justify-end">
            {req.kind !== 'alert' && (
              <AppButton
                type="button"
                variant="secondary"
                onClick={() => finish('cancel')}
                className="w-full min-w-[90px] sm:w-auto"
              >
                {req.options.cancelText ?? 'Batal'}
              </AppButton>
            )}
            <AppButton
              type="submit"
              variant={tone === 'danger' ? 'danger' : 'primary'}
              disabled={!canSubmit}
              autoFocus={!isPrompt}
              className="w-full min-w-[100px] sm:w-auto"
            >
              {options.confirmText ?? (req.kind === 'alert' ? 'Oke' : 'Ya, Lanjutkan')}
            </AppButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
