# Website Sekolah

Website profil sekolah untuk menampilkan program belajar, fasilitas, kegiatan siswa, berita, pengumuman, dan informasi Sistem Penerimaan Murid Baru (SPMB).

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

Konten website dapat dikelola melalui proyek saudara cendekia-dashboard. Salin package/.env.example ke package/.env.local dan jalankan API CMS di port 5243; SCHOOL_API_URL mengatur alamat backend. Dengan konfigurasi ini, berita, pengumuman, guru, prestasi, profil/sejarah, kegiatan, fasilitas, ekstrakurikuler, program, OSIS, dan informasi SPMB dibaca dari database cendekia_cms. Hanya konten berstatus terbit yang ditampilkan. Tanpa SCHOOL_API_URL, website tetap menggunakan data template untuk preview mandiri.

Formulir pendaftaran SPMB kini menyimpan data melalui API sekolah. Menu SPMB > Pengaturan Gelombang pada dashboard mengatur tahun ajaran dan empat jadwal gelombang. Pendaftaran tertutup di luar rentang aktif (WIB). Gelombang ditentukan server saat submit; nomor pendaftaran ditampilkan setelah berhasil. Data dapat diperiksa pada SPMB > Pendaftar SPMB. Sebelum dipakai, isi tanggal resmi dan aktifkan pendaftaran di dashboard.

## Teknologi

Next.js, React, TypeScript, dan Tailwind CSS.

## Lisensi

Ketentuan lisensi dan pemberitahuan hak cipta tersedia di [LICENSE.txt](LICENSE.txt).
