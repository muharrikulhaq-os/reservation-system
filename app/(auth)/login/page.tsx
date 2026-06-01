import type { Metadata } from "next";
import { LoginForm } from "@/components/features/auth/LoginForm";

export const metadata: Metadata = {
  title: "Masuk — Reservation System",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center p-4">
      {/* Decorative background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[var(--primary-light)] opacity-40 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[var(--primary-light)] opacity-30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo / Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--primary)]">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="3"
                y="4"
                width="18"
                height="16"
                rx="2"
                stroke="white"
                strokeWidth="1.8"
              />
              <path
                d="M8 2v4M16 2v4M3 10h18"
                stroke="white"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <path
                d="M8 14h2M11 14h5M8 17h3"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold text-[var(--text-primary)]">
            Reservation System
          </h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Masuk untuk melanjutkan
          </p>
        </div>

        {/* Card */}
        <div className="card-base p-6">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-xs text-[var(--text-disabled)]">
          © {new Date().getFullYear()} Reservation System
        </p>
      </div>
    </main>
  );
}
