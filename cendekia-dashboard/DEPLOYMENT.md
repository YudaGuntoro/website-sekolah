# Deployment Cendekia

Panduan production yang berlaku: [docs/deploy-vps.md](docs/deploy-vps.md).

Website publik berada di `../package` (3000), dashboard di `Frontend` (3002), dan API `Backend/Cendekia.WebAPI` (5243). Gunakan hanya database `cendekia_cms`.

Untuk instalasi baru jalankan `scripts/init-local-db.ps1`. Untuk database yang sudah berjalan hentikan API, buat backup, lalu jalankan `scripts/init-local-db.ps1 -NormalizeOnly`; jangan mengimpor ulang seed konten ke data aktif. Konfigurasi production memerlukan secret privat, akun database khusus, HTTPS, proxy tepercaya, dan volume key persisten sesuai panduan.
