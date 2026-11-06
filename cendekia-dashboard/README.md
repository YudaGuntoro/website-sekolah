# Cendekia Dashboard

CMS website SMPIT Cendekia Purwakarta, dikembangkan dari template dashboard lokal. Frontend Next.js 16 dengan tema navy, backend ASP.NET Core 8, database MySQL 8 bernama **cendekia_cms**.

## Arsitektur dan database

Backend kini memakai lapisan Application service ? repository ? EF Core/DbContext. Konfigurasi terstruktur menggunakan tabel relasional, foreign key, dan constraint; arsip JSON migrasi tidak dipakai aplikasi. Panduan lengkap, diagram relasi, migrasi aman, dan pengujian: [docs/architecture-and-database.md](docs/architecture-and-database.md). Setelah clone gunakan setup di bawah; database lama dapat diperbarui dengan `scripts/init-local-db.ps1 -NormalizeOnly` setelah API lama dihentikan.

## Konten

Berita, pengumuman, profil/sejarah, guru dan staf, prestasi, fasilitas, program belajar, kegiatan rutin, ekstrakurikuler, OSIS, dan informasi SPMB. Semua koleksi mendukung tambah, edit, hapus, pencarian, pagination, serta status draf/terbit. Isi ditulis sebagai teks dengan paragraf; gambar menggunakan URL HTTPS atau path gambar website.

Website publik di `../package` membaca konten yang sudah terbit melalui API. Website, dashboard, dan backend disimpan bersama dalam repo `YudaGuntoro/website-sekolah`; folder ini bukan submodule. Draf dan jadwal publikasi mendatang tidak dikirim ke publik. Respons kosong tetap kosong agar konten yang dihapus tidak muncul kembali dari data template.

## Setup lokal (PowerShell)

1. Pastikan MySQL 8 dan .NET SDK 8 tersedia. Sesuaikan koneksi lokal melalui environment ConnectionStrings__DefaultConnection jika diperlukan; database harus cendekia_cms.
2. Jalankan dari folder ini:

    powershell -NoProfile -File scripts/init-local-db.ps1

   Script membuat database dan mengimpor 61 konten awal; aman dijalankan kembali tanpa menimpa penyuntingan. Alternatif: jalankan database/cendekia_cms.sql lalu database/seed_cendekia_content.sql melalui klien MySQL.
3. Jalankan API:

    dotnet run --project Backend/Cendekia.WebAPI/Cendekia.WebAPI.csproj --launch-profile http

4. Di terminal lain, jalankan dashboard:

    cd Frontend
    npm ci
    npm run dev

5. Dashboard: http://localhost:3002. API: http://localhost:5243. Akun demo lokal: **admin / admin123**. Ganti sandi/akun demo sebelum penggunaan di luar lingkungan lokal.
6. Di website publik, salin package/.env.example ke package/.env.local atau tambahkan SCHOOL_API_URL=http://127.0.0.1:5243. Jalankan npm run dev dari package; website tersedia di http://localhost:3000. Restart server Next.js setelah perubahan environment.

API_PROXY_TARGET di Frontend/.env.local mengatur proxy API (default http://127.0.0.1:5243). NEXT_PUBLIC_SCHOOL_URL mengatur tautan ke website publik (default http://localhost:3000). Jangan masukkan kredensial database ke environment browser.

## Hak akses

- ADMIN: konten dan akun pengguna.
- SUPERVISOR (Editor Utama), OPERATOR (Editor): tambah, edit, terbitkan, dan hapus konten.
- VIEWER: baca konten dashboard saja.

## Validasi

    dotnet build Backend/Cendekia.sln
    cd Frontend
    npm run build

Dengan API aktif, jalankan node scripts/check-cms.mjs dari root dashboard untuk memeriksa login, pembatasan akses, draf/terbit, penghapusan, slug duplikat, konflik edit, dan jadwal publikasi. Data pengujian dibersihkan otomatis. CMS_ADMIN_PASSWORD dapat mengganti sandi demo untuk pengujian.

## Catatan

Formulir pendaftaran siswa kini menyimpan data ke database dan memilih gelombang otomatis. Atur tanggal di menu SPMB > Pengaturan Gelombang sebelum membuka formulir. Penataan visual dan ilustrasi beranda tetap bagian template website. Backend menggunakan assembly dan namespace Cendekia dengan modul CMS, autentikasi/pengguna, SPMB, dan LMP. API memakai database cendekia_cms.

Semua daftar admin menampilkan konten baru di baris pertama. Semua koleksi website menampilkan tanggal terbit terbaru lebih dahulu (kiri atas pada susunan kartu). Urutan manual tidak digunakan.

## Pendaftaran SPMB

Menu SPMB mencakup Informasi SPMB, Pendaftar SPMB, dan Pengaturan Gelombang. Buka http://localhost:3002/spmb/gelombang untuk mengatur tahun ajaran dan empat rentang tanggal. Aktifkan gelombang yang sudah memiliki tanggal lengkap, aktifkan pendaftaran, lalu simpan. Jadwal awal sengaja kosong dan pendaftaran tertutup sampai tanggal resmi diisi.

Tanggal memakai WIB (Asia/Jakarta), inklusif dari pukul 00.00 tanggal mulai sampai akhir hari tanggal selesai. Rentang tidak boleh bertumpuk atau terbalik. Di luar jadwal dan ketika dinonaktifkan, backend menolak submit meskipun formulir dibypass. Pergantian hari diperiksa oleh server. Gelombang, tahun ajaran, dan rentang tanggal disalin ke setiap pendaftaran, sehingga perubahan setup tidak memindahkan pendaftar lama.

Formulir publik: http://localhost:3000/spmb/daftar. Nomor pendaftaran ditampilkan setelah data tersimpan. Pengiriman ulang dengan identitas submit yang sama tidak menggandakan data. NISN wajib untuk murid pindahan dan unik per tahun ajaran jika diisi.

Daftar pendaftar: http://localhost:3002/spmb/pendaftar. Tersedia filter tahun ajaran, gelombang, status, pencarian, pagination, dan popup detail. Status dapat diubah menjadi Baru, Diproses, Diterima, atau Ditolak. Tidak ada email/WhatsApp otomatis; komunikasi lanjutan dilakukan pihak sekolah.

ADMIN dan SUPERVISOR dapat mengubah jadwal; ADMIN/SUPERVISOR/OPERATOR dapat membaca dan memproses pendaftar. VIEWER dan pengunjung publik tidak dapat mengakses data pendaftar. Endpoint publik hanya jadwal dan submit, tanpa daftar/detail data pribadi.

Untuk database yang sudah ada: powershell -NoProfile -File scripts/init-local-db.ps1 -SpmbOnly. Skrip menambahkan tiga tabel SPMB tanpa mengubah konten website. Instalasi baru otomatis menyertakan skema SPMB melalui bootstrap biasa.

Pengujian lokal tersedia pada scripts/check-spmb.mjs, dengan SPMB_ALLOW_TEST_SETUP=1 dan opsional SPMB_BROWSER_CHECK=1. Hanya jalankan di checkout lokal pengujian: tes mengubah jadwal sementara dan memulihkannya di finally. Jalankan SQL pembersihan .verify-cms/spmb-test-cleanup.sql setelah tes untuk menghapus hanya pendaftar sintetis dengan kunci pengiriman yang dicatat.

## Feed media sosial

Di menu Media Sosial, pilih Feed Instagram atau Feed TikTok. Isi judul, URL postingan sesuai platform, ringkasan, dan gambar sampul opsional; pilih Terbit untuk menampilkan kartu di beranda. Kartu membuka postingan asli di tab baru. Feed ditampilkan setelah Pengumuman dalam urutan Instagram lalu TikTok, dengan postingan terbaru di kiri atas. Gambar sampul dimasukkan manual, bukan diambil otomatis dari platform. Draf dan jadwal terbit di masa depan tidak tampil ke publik.

Database lama: jalankan powershell -NoProfile -File scripts/init-local-db.ps1 -SocialOnly. Bootstrap baru menyertakan kolom PostUrl secara otomatis. Pengujian lokal: node scripts/check-social-feeds.mjs, dengan SOCIAL_BROWSER_CHECK=1 untuk pemeriksaan browser jika Playwright lokal tersedia. Data tes dibersihkan otomatis.

## Kontak dan media sosial website

Menu Pengaturan Website > Kontak & Media Sosial ada di /settings/contact. ADMIN dan SUPERVISOR dapat mengubah nomor WhatsApp, email, alamat, dan URL profil Instagram/TikTok/Facebook. Role lain hanya dapat melihat. Field kosong menyembunyikan kontak atau ikon terkait pada footer. Nomor lokal 08 otomatis menjadi 62 pada tautan WhatsApp. Footer, bagian kontak beranda, halaman kontak, dan tombol WhatsApp memakai data yang sama. Postingan feed tetap dikelola terpisah melalui Media Sosial.

Upgrade database lama tanpa reseeding: powershell -NoProfile -File scripts/init-local-db.ps1 -WebsiteSettingsOnly. Nilai awal mengikuti informasi website sebelumnya; setup ulang tidak menimpa pengaturan yang sudah disimpan. Bootstrap baru otomatis menyertakan tabel ini. Endpoint publik GET /api/school/contact hanya mengembalikan kontak publik; endpoint pengelolaan /api/cms/website-settings dilindungi autentikasi, hak akses, dan versi penyimpanan.

Tes lokal: node scripts/check-contact-settings.mjs (CONTACT_BROWSER_CHECK=1 untuk browser). Tes mengubah kontak sementara dan memulihkan nilai asli di finally.

## Sambutan kepala sekolah

Menu Profil Sekolah > Sambutan Kepala Sekolah (/content/sambutan) mengelola nama, jabatan, URL foto, dan isi sambutan beranda. Edit data awal lalu Simpan & terbitkan. Pisahkan paragraf dengan baris kosong; dua paragraf pertama tampil sebagai pembuka, sisanya melalui Baca sambutan lengkap. Foto bisa dikosongkan. Hanya sambutan terbit terbaru yang tampil; draf atau tanggal terbit masa depan tidak tampil. Jika tidak ada sambutan terbit, bagiannya disembunyikan. Hak edit mengikuti CMS (ADMIN/SUPERVISOR/OPERATOR).

Inisialisasi database lama: powershell -NoProfile -File scripts/init-local-db.ps1 -PrincipalOnly. Isi awal mengikuti sambutan website sebelumnya dan nama/foto masih placeholder, untuk diganti admin dengan data resmi. Setup ulang tidak menimpa sambutan yang sudah ada. Bootstrap baru menyertakan data awal otomatis.

## Visi, misi, dan motto

Menu Profil Sekolah > Visi, Misi & Motto (/settings/identity) mengatur bagian Arah Pendidikan Cendekia di beranda. Admin bisa mengedit visi dan motto, serta menambah, menghapus, dan mengurutkan maksimal 20 poin misi. Setiap misi memiliki judul ringkas untuk tampilan mobile dan isi untuk tampilan desktop maupun mobile. Simpan perubahan untuk memperbarui website. Field visi/motto yang dikosongkan atau daftar misi kosong tidak menampilkan konten lama kembali. Hak edit mengikuti CMS: ADMIN/SUPERVISOR/OPERATOR; VIEWER hanya melihat.

Upgrade database lama: powershell -NoProfile -File scripts/init-local-db.ps1 -IdentityOnly. Bootstrap baru otomatis membuat school_identity dan mengisi teks yang sebelumnya tampil di website. Setup ulang tidak menimpa perubahan admin. Endpoint admin /api/cms/school-identity; endpoint publik /api/school/identity. Pengujian lokal: node scripts/check-school-identity.mjs, opsional IDENTITY_BROWSER_CHECK=1. Tes memulihkan nilai awal setelah pemeriksaan.

## Gambar beranda

Pengaturan Website > Gambar Beranda (/settings/images) mengatur URL gambar Banner Utama, Arah Pendidikan, dan Program Belajar. Gunakan URL HTTPS atau path /images/ pada website sekolah. Tersedia pratinjau dan tombol Gunakan gambar bawaan untuk mengosongkan override. Simpan gambar untuk memperbarui website. Jika URL kosong atau gambar gagal dimuat, website tetap menampilkan ilustrasi bawaan masing-masing bagian. PNG transparan disarankan agar menyatu dengan latar. Hak edit mengikuti CMS (ADMIN/SUPERVISOR/OPERATOR). Gambar kartu program tetap dikelola melalui Program Belajar.

Database lama: powershell -NoProfile -File scripts/init-local-db.ps1 -ImagesOnly. Bootstrap baru otomatis membuat homepage_images. Setup ulang tidak menimpa URL admin. Tes lokal: node scripts/check-homepage-images.mjs (IMAGES_BROWSER_CHECK=1 untuk browser). Data asli dipulihkan setelah tes.

## Tampilan informasi SPMB

Menu SPMB > Informasi SPMB kini membuka /spmb/informasi, editor khusus untuk desain halaman /spmb. Admin mengelola deskripsi pembuka, 1-20 tahap berurutan, ikon dari enam pilihan bawaan, rincian biaya/rekening, berkas siswa baru/pindahan (satu per baris), dan URL brosur. Biaya bisa ditampilkan pada satu tahap pilihan. Tautan formulir selalu menuju /spmb/daftar; brosur kosong menyembunyikan tombolnya. Tahun ajaran otomatis mengikuti Pengaturan Gelombang, termasuk label SPMB di beranda. WhatsApp/email memakai pengaturan kontak website. LMP memiliki halaman dan pengaturan tersendiri untuk Lomba Mata Pelajaran.

Layout publik tetap berupa timeline alur, panel persyaratan, dan panel kontak. Data tidak lagi dirender sebagai kartu CMS umum. /content/spmb dialihkan ke editor baru; empat entri CMS lama dipertahankan sebagai arsip, tanpa mengubah jadwal atau data pendaftar. Hak edit ADMIN/SUPERVISOR/OPERATOR, VIEWER hanya membaca informasi. Penyimpanan memakai versi untuk mencegah penimpaan edit bersamaan.

Database lama: powershell -NoProfile -File scripts/init-local-db.ps1 -SpmbInformationOnly. Skema spmb_information mengisi data awal sesuai desain sebelumnya dan tidak menimpa edit saat setup diulang. Bootstrap baru menyertakannya otomatis. Endpoint admin /api/cms/spmb-information, endpoint publik /api/school/spmb-information. Tes lokal: node scripts/check-spmb-information.mjs, opsional SPMB_INFO_BROWSER_CHECK=1. Nilai asli dipulihkan setelah tes.

## LMP — Lomba Mata Pelajaran

Website `/lmp` berisi alur pendaftaran, jadwal lomba/gebyar, biaya, berkas, mekanisme tes, dan penghargaan. Formulir `/lmp/daftar` menerima nama, asal sekolah, kelas 5 atau 6 SD, satu mata pelajaran (Matematika/Bahasa Indonesia/Bahasa Inggris), kontak pendamping, dan satu PDF maksimal 2 MB. Nomor pendaftaran dan petunjuk lanjutan muncul setelah submit; tombol grup WhatsApp hanya muncul jika tautan undangan diisi admin.

Portal Administrator > LMP > Informasi & Pengaturan (`/lmp/informasi`) mengatur konten dan tanggal buka/tutup pendaftaran dalam WIB. Awalnya pendaftaran ditutup dan unggah berkas opsional karena persyaratan belum pasti. Jadwal lomba awal 21 Januari 2027 pukul 07.30–16.00 WIB, pengumuman/gebyar 28 Januari 2027. Rekening, berkas wajib, serta jam/tempat gebyar menunggu konfirmasi. Kontak panitia menggunakan pengaturan kontak sekolah.

Menu Pendaftar LMP (`/lmp/pendaftar`) menampilkan peserta terbaru paling atas, filter kelas/mapel/status/pembayaran, detail kontak, unduh PDF privat, dan konfirmasi pembayaran manual. ADMIN/SUPERVISOR/OPERATOR dapat mengelola; VIEWER tidak dapat mengakses data peserta LMP. LMP terpisah dari gelombang dan tahun ajaran SPMB. Data peserta berelasi ke versi acara historis untuk judul, tanggal, dan biaya saat mendaftar.

Upgrade: `powershell -NoProfile -File scripts/init-local-db.ps1 -LmpOnly`. Bootstrap tidak menimpa pengaturan atau peserta yang sudah ada. API publik hanya GET `/api/lmp/information` dan POST `/api/lmp/applications`; daftar/detail/status/unduh PDF memerlukan login staf. PDF disimpan sebagai MEDIUMBLOB pada database, sehingga ikut backup database. Tes lokal: `node scripts/check-lmp.mjs`; tambahkan `LMP_BROWSER_CHECK=1` untuk alur website–admin. Tes memulihkan pengaturan dan menghapus hanya peserta sintetis miliknya.

## Pengaturan lokal dan production

Backend menggunakan `Backend/Cendekia.sln` dan `Backend/Cendekia.WebAPI`. Salin `appsettings.Development.example.json` ke `appsettings.Development.json` pada project WebAPI, lalu isi kredensial database lokal; file lokal diabaikan Git. Konfigurasi production wajib berasal dari environment server, bukan file development. Lihat [panduan deployment](docs/deploy-vps.md) untuk HTTPS, sesi aman, backup dan monitoring.
