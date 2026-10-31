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

Berita dan beberapa data profil masih menggunakan contoh konten. Formulir pendaftaran saat ini berupa simulasi; data belum disimpan atau dikirim ke server. Sesuaikan konten dan integrasikan backend sebelum digunakan untuk pendaftaran resmi.

## Teknologi

Next.js, React, TypeScript, dan Tailwind CSS.

## Lisensi

Ketentuan lisensi dan pemberitahuan hak cipta tersedia di [LICENSE.txt](LICENSE.txt).
