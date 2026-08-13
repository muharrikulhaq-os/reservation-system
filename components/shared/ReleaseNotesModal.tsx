"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ReleaseNote, getReleaseNotes } from "@/app/actions/changelog";

export function ReleaseNotesModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [notes, setNotes] = useState<ReleaseNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open && notes.length === 0) {
      setLoading(true);
      getReleaseNotes()
        .then(setNotes)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [open, notes.length]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col p-0">
        <div className="px-5 py-3 shrink-0 border-b">
          <DialogHeader className="gap-0">
            <DialogTitle>Release Notes</DialogTitle>
            <DialogDescription className="mt-0">
              Pembaruan terbaru pada sistem kami.
            </DialogDescription>
          </DialogHeader>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {loading ? (
            <div className="text-center text-sm text-[var(--text-secondary)]">Memuat release notes...</div>
          ) : notes.length > 0 ? (
            notes.map((note) => (
              <div key={note.version} className="space-y-2 border-b last:border-0 pb-6 last:pb-0">
                <div className="text-[var(--text-secondary)] [&>h1]:text-2xl [&>h1]:font-bold [&>h1]:mb-4 [&>h1]:text-[var(--text-primary)] [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mt-6 [&>h2]:mb-3 [&>h2]:text-[var(--text-primary)] [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:space-y-1 [&>p]:mb-3">
                  <ReactMarkdown>{note.content}</ReactMarkdown>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-sm text-[var(--text-secondary)]">Belum ada release note.</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function useReleaseNotes() {
  const [showModal, setShowModal] = useState(false);
  
  useEffect(() => {
    // Cek apakah ada release note baru (versi yang belum dibaca)
    getReleaseNotes().then((notes) => {
      if (notes.length > 0) {
        const latestVersion = notes[0].version;
        const seenVersion = localStorage.getItem("seen_release_note");
        if (seenVersion !== latestVersion) {
          setShowModal(true);
          localStorage.setItem("seen_release_note", latestVersion);
        }
      }
    });
  }, []);

  return {
    showModal,
    setShowModal,
  };
}
