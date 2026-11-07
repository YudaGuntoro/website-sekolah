# Cendekia — Website dan Portal Administrator

Website profil sekolah untuk menampilkan program belajar, fasilitas, kegiatan siswa, berita, pengumuman, dan informasi Sistem Penerimaan Murid Baru (SPMB).

Satu repository berisi website publik, dashboard admin, dan backend CMS. Halaman LMP (Lomba Mata Pelajaran) dan formulir pendaftarannya juga terhubung ke backend yang sama.

```text
package/                     Website utama Next.js (port 3000)
cendekia-dashboard/
  Frontend/                  Portal Administrator Next.js (port 3002)
  Backend/                   ASP.NET Core API (port 5243)
  database/                  Skema dan data awal MySQL cendekia_cms
  scripts/                   Setup database dan pengujian integrasi
```

Panduan API, database, dan dashboard tersedia di [cendekia-dashboard/README.md](cendekia-dashboard/README.md). Setiap aplikasi memasang dependensinya sendiri. Untuk hosting, root aplikasi tetap `package` untuk website dan `cendekia-dashboard/Frontend` untuk dashboard; backend dijalankan terpisah. File `.env` lokal, data database yang sedang digunakan, cache, dan hasil build tidak disimpan di Git.

## Fitur

- Beranda responsif untuk desktop dan HP.
- Profil sekolah, sejarah, struktur organisasi, pimpinan, dan tenaga pendidik.
- Program belajar, ekstrakurikuler, OSIS, fasilitas, dan prestasi siswa.
- Daftar berita dengan halaman detail untuk setiap artikel.
- Pengumuman dengan popup detail.
- Informasi SPMB, persyaratan, alur pendaftaran, dan formulir calon siswa.
- Kontak sekolah dan akses WhatsApp.

## Menjalankan proyek

Gunakan Node.js 20 atau lebih baru. Aplikasi berada di direktori `package`.

```bash
git clone https://github.com/YudaGuntoro/website-sekolah.git
cd website-sekolah/package
npm ci
npm run dev
```

Buka http://localhost:3000.

## Build produksi

Jalankan dari direktori `package`:

```bash
npm run build
npm start
```

Untuk hosting, gunakan `package` sebagai root directory aplikasi.

## Struktur proyek

```text
package/
  public/                 Gambar dan brosur sekolah
  src/app/                Halaman dan routing aplikasi
  src/app/components/     Komponen antarmuka
  src/app/school-content.ts  Data berita, pengumuman, dan profil
```

## Catatan pengembangan

Konten website dikelola melalui folder `cendekia-dashboard` dalam repository ini. Salin package/.env.example ke package/.env.local dan jalankan API CMS di port 5243; SCHOOL_API_URL mengatur alamat backend. Dengan konfigurasi ini, berita, pengumuman, guru, prestasi, profil/sejarah, kegiatan, fasilitas, ekstrakurikuler, program, OSIS, dan informasi SPMB dibaca dari database cendekia_cms. Hanya konten berstatus terbit yang ditampilkan. Tanpa SCHOOL_API_URL, website tetap menggunakan data template untuk preview mandiri.

Formulir pendaftaran SPMB kini menyimpan data melalui API sekolah. Menu SPMB > Pengaturan Gelombang pada dashboard mengatur tahun ajaran dan empat jadwal gelombang. Pendaftaran tertutup di luar rentang aktif (WIB). Gelombang ditentukan server saat submit; nomor pendaftaran ditampilkan setelah berhasil. Data dapat diperiksa pada SPMB > Pendaftar SPMB. Sebelum dipakai, isi tanggal resmi dan aktifkan pendaftaran di dashboard.

Feed Instagram/TikTok memakai kartu custom dengan maksimal empat postingan terbaru di beranda dan halaman daftar `/instagram` serta `/tiktok`. Admin cukup mengisi URL postingan; judul dan ringkasan opsional. Foto diambil server website melalui `/api/social-image` dari postingan publik yang sudah terbit di CMS, tanpa kolom URL foto manual. Website memerlukan akses HTTPS keluar ke platform dan CDN gambarnya. Pengambilan otomatis mengikuti ketersediaan halaman publik; postingan privat, dihapus, atau dibatasi platform memakai ilustrasi pengganti dan tetap menyediakan tautan ke postingan. Tidak menggunakan akun/cookie Instagram pribadi atau layanan proxy pihak ketiga. Verifikasi resolver: `cd package && node scripts/check-social-thumbnails.mjs`.

## Teknologi

Next.js, React, TypeScript, dan Tailwind CSS.

## Lisensi

Ketentuan lisensi dan pemberitahuan hak cipta tersedia di [LICENSE.txt](LICENSE.txt).
