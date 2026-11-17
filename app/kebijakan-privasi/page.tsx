import type { Metadata } from 'next'

// ─────────────────────────────────────────
// KEBIJAKAN PRIVASI (publik, tanpa login)
// Dipakai sebagai URL kebijakan privasi di Google Play Console. Isinya harus
// mengikuti data yang benar-benar dipakai aplikasi (web & Android) - perbarui
// halaman ini setiap ada fitur baru yang mengumpulkan data lain.
// ─────────────────────────────────────────

export const metadata: Metadata = {
  title: 'Kebijakan Privasi - Reservasi KCE',
  description: 'Kebijakan privasi aplikasi Reservasi KCE (web & Android).',
}

const APP_NAME = 'Reservasi KCE'
const COMPANY = 'KCE'
const CONTACT_EMAIL = 'ISI_EMAIL_KONTAK@kce.co.id'
const EFFECTIVE_DATE = '17 November 2026'

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-3">
    <h2
      className="text-lg font-bold text-[var(--text-primary)]"
      style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      {title}
    </h2>
    <div className="space-y-3 text-sm leading-relaxed text-[var(--text-secondary)]">{children}</div>
  </section>
)

const List = ({ items }: { items: React.ReactNode[] }) => (
  <ul className="list-disc space-y-1.5 pl-5">
    {items.map((it, i) => (
      <li key={i}>{it}</li>
    ))}
  </ul>
)

const B = ({ children }: { children: React.ReactNode }) => (
  <b className="font-semibold text-[var(--text-primary)]">{children}</b>
)

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen px-4 py-10" style={{ backgroundColor: 'var(--bg-page)' }}>
      <article className="mx-auto max-w-3xl space-y-8 rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-6 shadow-[0_1px_4px_rgba(0,0,0,0.06)] sm:p-10">
        <header className="space-y-2">
          <h1
            className="text-[28px] font-bold text-[var(--text-primary)]"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Kebijakan Privasi
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            {APP_NAME} · Berlaku sejak {EFFECTIVE_DATE}
          </p>
        </header>

        <Section title="1. Tentang aplikasi">
          <p>
            {APP_NAME} adalah aplikasi internal {COMPANY} untuk peminjaman kendaraan operasional dan ruang
            rapat, tersedia di web dan Android. Aplikasi hanya dapat dipakai oleh karyawan dan petugas yang
            akunnya dibuat oleh admin perusahaan. Kebijakan ini menjelaskan data apa yang kami kumpulkan,
            untuk apa, dan bagaimana data tersebut dilindungi.
          </p>
        </Section>

        <Section title="2. Data yang kami kumpulkan">
          <List
            items={[
              <>
                <B>Data akun:</B> nama, NIP/ID karyawan, email, departemen, peran, nomor telepon, dan foto
                profil (bila diunggah).
              </>,
              <>
                <B>Data booking:</B> jadwal, keperluan, lokasi penjemputan dan tujuan, kendaraan/ruangan,
                serta penumpang yang ikut - termasuk nama dan nomor telepon tamu yang dimasukkan pemesan.
              </>,
              <>
                <B>Lokasi presisi:</B> diambil <B>hanya saat Anda menekan tombol</B> memulai perjalanan,
                mengirim laporan pengembalian kendaraan, atau melaporkan kendala kendaraan. Aplikasi tidak
                melacak lokasi di latar belakang.
              </>,
              <>
                <B>Foto:</B> diambil dari kamera atau galeri saat Anda memilihnya, misalnya foto odometer,
                struk BBM/tol/parkir, laporan pengembalian, dokumen pemeliharaan, laporan kendala, lampiran
                booking, dan foto profil.
              </>,
              <>
                <B>Catatan operasional:</B> pengisian bahan bakar, biaya perjalanan, odometer, rating dan
                ulasan untuk supir/penjaga ruangan.
              </>,
              <>
                <B>Data perangkat:</B> token notifikasi push (Firebase Cloud Messaging) dan pengaturan
                notifikasi di perangkat.
              </>,
              <>
                <B>Log aktivitas:</B> aksi yang dilakukan di sistem beserta waktu, alamat IP, dan jenis
                browser/perangkat - untuk riwayat booking dan audit keamanan.
              </>,
            ]}
          />
        </Section>

        <Section title="3. Untuk apa data digunakan">
          <List
            items={[
              'Menjalankan proses booking: pengajuan, persetujuan, penugasan supir dan kendaraan, pemakaian ruangan, hingga pengembalian.',
              'Mencatat perjalanan dan biaya (odometer, bahan bakar, tol, parkir) beserta buktinya.',
              'Mengirim notifikasi terkait booking dan tugas Anda.',
              'Menghubungi pemesan, supir, penumpang, atau penjaga ruangan terkait sebuah booking.',
              'Laporan internal, audit, dan keamanan akun.',
            ]}
          />
          <p>Kami tidak memakai data Anda untuk iklan dan tidak menjualnya kepada siapa pun.</p>
        </Section>

        <Section title="4. Siapa yang dapat melihat data">
          <List
            items={[
              <>
                <B>Di dalam perusahaan:</B> data booking dapat dilihat oleh pihak yang berkepentingan -
                admin, supir atau penjaga ruangan yang ditugaskan, dan penumpang booking tersebut.
              </>,
              <>
                <B>Penyedia layanan:</B> Google Firebase Cloud Messaging menerima token perangkat dan isi
                notifikasi semata-mata untuk mengirimkan notifikasi ke perangkat Anda.
              </>,
              <>
                <B>Kewajiban hukum:</B> bila diwajibkan oleh peraturan perundang-undangan yang berlaku.
              </>,
            ]}
          />
        </Section>

        <Section title="5. Penyimpanan dan keamanan">
          <List
            items={[
              'Data disimpan di server yang dikelola perusahaan dan dikirim melalui koneksi terenkripsi (HTTPS).',
              'Password disimpan dalam bentuk hash, tidak dalam bentuk asli.',
              'Akses data dibatasi sesuai peran pengguna (admin, karyawan, supir, penjaga ruangan).',
            ]}
          />
        </Section>

        <Section title="6. Berapa lama data disimpan">
          <p>
            Data disimpan selama akun Anda aktif dan selama diperlukan untuk keperluan administrasi, laporan,
            dan audit perusahaan. Akun yang tidak lagi dipakai dinonaktifkan oleh admin; riwayat booking yang
            terkait tetap disimpan sebagai catatan operasional perusahaan.
          </p>
        </Section>

        <Section title="7. Pilihan dan hak Anda">
          <List
            items={[
              'Melihat dan memperbarui data profil Anda di menu Profil.',
              'Meminta koreksi, penonaktifan, atau penghapusan akun dan data pribadi melalui admin sistem atau kontak di bawah.',
              'Mencabut izin lokasi, kamera, atau notifikasi kapan saja melalui pengaturan perangkat. Fitur yang membutuhkan izin tersebut (mis. memulai perjalanan dengan lokasi) tidak dapat dipakai sampai izin diberikan kembali.',
              'Mematikan notifikasi push untuk perangkat ini di menu Pengaturan aplikasi.',
            ]}
          />
        </Section>

        <Section title="8. Anak-anak">
          <p>Aplikasi ini ditujukan untuk karyawan dan tidak ditujukan untuk anak di bawah 18 tahun.</p>
        </Section>

        <Section title="9. Perubahan kebijakan">
          <p>
            Kebijakan ini dapat diperbarui bila ada perubahan fitur atau peraturan. Versi terbaru selalu
            tersedia di halaman ini, dengan tanggal berlaku di bagian atas.
          </p>
        </Section>

        <Section title="10. Kontak">
          <p>
            Pertanyaan atau permintaan terkait data pribadi dapat dikirim ke{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-[var(--primary)] hover:underline">
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </Section>
      </article>
    </main>
  )
}
