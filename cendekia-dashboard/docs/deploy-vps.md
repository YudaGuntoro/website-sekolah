# Deployment production Cendekia

Sumber yang digunakan adalah repository `si-educational-nextjs`. Website: `package`; dashboard: `cendekia-dashboard/Frontend`; API: `cendekia-dashboard/Backend`. Database hanya `cendekia_cms`.

## Prasyarat dan konfigurasi wajib

Gunakan MySQL 8, reverse proxy HTTPS, runtime .NET 8 yang sudah mendapat patch keamanan, dan Node 22 untuk image frontend. Jangan mempublikasikan port MySQL/API/Next secara langsung; bind port host ke loopback dan gunakan firewall. Jalankan aplikasi dengan user non-root. Dockerfile tersedia pada setiap aplikasi dan tidak menyertakan `.env` atau appsettings lokal. Build image dengan `--pull` agar patch base image diperbarui.

Simpan environment API di file server berizin 600, di luar repository:

```dotenv
ASPNETCORE_ENVIRONMENT=Production
AllowedHosts=admin.sekolah.example;sekolah.example;api;localhost;127.0.0.1
Jwt__Issuer=Cendekia
Jwt__Audience=Cendekia.Frontend
Jwt__SigningKey=<random-private-key>
Jwt__ExpiresHours=1
ConnectionStrings__DefaultConnection=<dedicated-account-connection-to-cendekia_cms>
Security__DataProtectionKeyPath=/var/lib/cendekia/keys
ReverseProxy__KnownProxies__0=<exact-dashboard-container-IP>
ReverseProxy__KnownProxies__1=<exact-public-website-container-IP>
RateLimits__LoginPerMinute=10
RateLimits__RegistrationsPerMinute=10
```

Ganti semua placeholder. Buat signing key acak minimal 32 byte, misalnya `openssl rand -base64 48`, langsung ke secret manager/file privat. Jangan salin output ke Git/log/chat. Akun database runtime memerlukan SELECT/INSERT/UPDATE/DELETE, bukan root atau hak DDL. Akun migrasi terpisah membutuhkan hak membuat tabel/FK/trigger/routine. Gunakan TLS database jika koneksi melewati host/jaringan yang tidak dipercaya.

`AllowedHosts` harus memuat hostname yang benar-benar diterima backend setelah forwarding. `KnownProxies` hanya berisi alamat hop langsung yang dikontrol, bukan jaringan umum. Default tetap loopback, ForwardLimit=1. Jangan memakai `ASPNETCORE_FORWARDEDHEADERS_ENABLED=true` atau middleware tambahan yang mempercayai semua proxy. CORS kosong menolak akses lintas origin; alur dashboard tetap same-origin `/api`. Jika benar-benar memerlukan CORS, set `Cors__AllowedOrigins__0=https://origin-yang-disetujui` secara eksplisit tanpa wildcard.

Direktori Data Protection harus persisten dan hanya bisa dibaca user aplikasi. Pada Linux lindungi volume dengan permission dan enkripsi disk; key tersebut menjaga CSRF lintas restart. Cookie session adalah HttpOnly, Secure, SameSite=Strict, host-only dan Path=/api. Cookie CSRF juga HttpOnly; request token diperoleh lewat `/api/auth/csrf` dan dikirim sebagai `X-CSRF-TOKEN`. Endpoint login browser adalah `/api/auth/session`, tidak mengembalikan bearer token. `/api/auth/login` tetap untuk integrasi non-browser yang dipercaya, dibatasi rate limit yang sama. Logout mencabut sesi server; perubahan username/status/role mencabut semua sesi pengguna.

## Urutan upgrade

1. Backup database; hentikan API lama.
2. Dari dashboard jalankan `scripts/init-local-db.ps1 -NormalizeOnly` di Windows, atau jalankan SQL berurutan dengan akun migrasi di Linux: `20261106_school_normalization.sql`, `20261106_registration_relations.sql`, lalu `database/auth_sessions.sql`. Jangan jalankan seed/reset konten pada database berisi data.
3. Ganti password demo sebelum menjalankan Production. Utility `node scripts/set-admin-password.mjs` memerlukan `ConnectionStrings__DefaultConnection`, `CMS_ADMIN_USERNAME` (default admin), dan `CMS_NEW_ADMIN_PASSWORD` dari secret manager/environment proses sementara. Password wajib 12-128 karakter, tidak dicetak utility. Hapus environment password setelah selesai. Utility mencabut sesi lama.
4. Build ketiga image sebelum mengganti container aktif. Build API dari context `cendekia-dashboard/Backend`, dashboard dari `cendekia-dashboard/Frontend`, website dari `package`. Dashboard memerlukan build argument `API_PROXY_TARGET=http://api:8080`; rewrite Next disimpan saat build, sehingga mengubah environment runtime saja tidak mengganti upstream.
5. Jalankan API dengan environment privat, volume key persisten, network privat, restart policy, serta batas memory/CPU/log rotation. Website menggunakan runtime `SCHOOL_API_URL=http://api:8080`. Dashboard/website harus berada pada alamat privat tetap yang masuk KnownProxies. Host port: 127.0.0.1:5243->8080, 127.0.0.1:3002->3002, 127.0.0.1:3000->3000. Gunakan nama container/alias API `api` sesuai build argument.
6. Pasang konfigurasi edge pada `deployment/nginx.conf.example`, sesuaikan domain dan sertifikat, jalankan `nginx -t`, lalu reload. Untuk website public, `TRUST_PROXY_HEADERS=true` hanya boleh diaktifkan bila edge menimpa X-Real-IP dan port Next tidak dapat diakses langsung. Jika tidak diaktifkan, limiter backend menghitung traffic website sebagai satu IP proxy; sesuaikan batas dan gunakan limiter edge per pengguna.
7. Periksa readiness, login, edit konten, pendaftaran, PDF staf, logout, serta akses tanpa otorisasi. Semua sesi/token lama dari sebelum tabel auth_sessions harus login ulang.

Startup Production menolak secret kosong/bawaan/lemah, AllowedHosts wildcard, CORS wildcard/HTTP, akun database root/password kosong, key directory yang belum dikonfigurasi, tabel sesi yang belum tersedia, dan akun aktif dengan password demo `admin123`. Startup gagal berarti deployment harus diperbaiki sebelum traffic dialihkan.

## Backup otomatis dan restore

`scripts/backup-production.sh` menggunakan `MYSQL_DEFAULTS_FILE` (file MySQL client private berizin 600) dan `BACKUP_DIRECTORY` di luar repository. Jalankan dengan akun backup yang sesuai; dump mencakup routine dan trigger. Script memakai single transaction, gzip verification, permission privat dan SHA-256. Backup harus disalin terenkripsi ke lokasi terpisah dari VPS, disertai kebijakan retensi; jangan simpan satu-satunya backup pada disk aplikasi.

Contoh jadwal `/etc/cron.d/cendekia` setelah mengisi path server yang benar:

```cron
15 2 * * * backup-user MYSQL_DEFAULTS_FILE=/etc/cendekia/mysql-backup.cnf BACKUP_DIRECTORY=/var/backups/cendekia /usr/bin/bash /opt/cendekia/cendekia-dashboard/scripts/backup-production.sh >> /var/log/cendekia-backup.log 2>&1
* * * * * app-user HEALTH_URL=http://127.0.0.1:5243/health/ready ALERT_COMMAND=/usr/local/bin/notify-operations /usr/bin/bash /opt/cendekia/cendekia-dashboard/scripts/monitor-production.sh
```

User/path/notification command adalah contoh dan harus dipasang pada server. Chat ini tidak memasang cron atau mengirim notifikasi. Monitor keluar nonzero dan menulis syslog saat readiness gagal. Hubungkan juga metrik disk, memory, CPU, restart container, HTTP 5xx/429, umur backup dan sertifikat ke sistem monitoring yang tersedia. Konfigurasikan journald/Docker log rotation; log tidak merekam body formulir, password atau token.

Uji restore secara berkala pada instance MySQL TERPISAH dengan database bernama `cendekia_cms`. Verifikasi SHA-256 dan gzip, restore dump ke instance kosong, periksa schema_migrations, jumlah baris, FK, trigger, hash dokumen, dan smoke test aplikasi. Jangan menguji restore pada database aktif. Setelah pemulihan bencana, rotasi JWT key agar sesi dari backup lama tidak hidup kembali. Catat waktu backup/restore, hasil pemeriksaan, RPO dan RTO yang disepakati.

## Health, pengujian dan rollback

`GET /health/live` memeriksa proses; `GET /health/ready` memeriksa konektivitas dan tabel sesi, memberikan 200/503 tanpa detail privat. Batasi endpoint ini pada edge ke monitoring internal. Rate limit aplikasi bersifat per-instance/in-memory; untuk banyak replica gunakan limiter terpusat pada edge/WAF. Batas request backend adalah 2.2 MB; endpoint SPMB 32 KB dan login 4 KB. Proxy SPMB membatasi ukuran ketika membaca stream, bukan setelah seluruh body dimuat.

```powershell
dotnet build Backend/Cendekia.sln
node scripts/check-architecture.mjs
node scripts/check-normalization.mjs
node scripts/check-registration-relations.mjs
node scripts/check-security.mjs
node scripts/check-production-startup.mjs
node scripts/check-cms.mjs
node scripts/check-lmp.mjs
$env:SPMB_ALLOW_TEST_SETUP='1'
node scripts/check-spmb.mjs
$env:ALLOW_LOAD_CHECK='1'
node scripts/check-load.mjs
```

Suite security/CMS/LMP/SPMB melakukan perubahan fixture lokal/staging dan membersihkannya; jalankan cleanup SQL yang dihasilkan SPMB. `check-load` hanya membaca 100 request dengan concurrency 10; ini smoke test, bukan jaminan kapasitas. Ukur beban realistis sesuai jumlah pendaftar di staging. Uji limiter menggunakan API kedua dengan LoginPerMinute=2 dan RegistrationsPerMinute=2 di port 5245, kemudian `node scripts/check-security-limits.mjs`. Jalankan audit npm pada kedua frontend dan `dotnet list Backend/Cendekia.sln package --vulnerable --include-transitive` pada setiap rilis.

Simpan image rilis sebelumnya untuk rollback aplikasi hanya bila kompatibel dengan skema saat ini. API sebelum migrasi relasi pendaftaran tidak kompatibel; jangan menghidupkannya kembali tanpa prosedur pemulihan database yang sudah diuji. DDL MySQL bukan satu transaksi penuh.

Bukti transfer SPMB/LMP: sebelum backend terbaru dijalankan, backup lalu terapkan `database/migrations/20261108_registration_payment_proofs.sql`. Pastikan reverse proxy menerima request LMP dua berkas dengan `client_max_body_size 4400k`; batas setiap berkas tetap 2 MB. Deploy ulang website dan API bersama karena submit SPMB kini multipart/form-data.

Optimasi bukti transfer JPG/PNG menggunakan SkiaSharp dan native assets Linux yang ikut dipublish backend. Build ulang image API untuk menyertakan dependensi ini; jangan hanya menyalin DLL aplikasi lama. Tidak perlu SQL tambahan untuk kompresi. PDF dan berkas lama tidak diubah.

Tahapan LMP: backup database lalu jalankan `database/migrations/20261109_lmp_information_steps.sql` sebelum memakai backend baru. Migrasi menambahkan tabel tahapan relasional dan mengisi alur sebelumnya sekali. Deploy frontend admin/publik yang sesuai agar tahapan dapat diedit dan langsung ditampilkan di `/lmp`.

PDF persyaratan SPMB: backup dan jalankan `database/migrations/20261109_spmb_application_documents.sql` sebelum deploy backend/website/admin baru. PDF wajib maksimal 1 MB disimpan terpisah dengan kompresi Brotli lossless; unduhan staf harus melewati endpoint API untuk mengembalikan PDF asli. Kompresi memakai .NET bawaan tanpa dependency server tambahan.

Catatan persyaratan SPMB: backup lalu terapkan `database/migrations/20261109_spmb_document_notes.sql` sebelum deploy backend/admin/publik terbaru. Kolom catatan terpisah dari item berkas; migrasi memindahkan poin `Catatan:` lama dan mempertahankan edit pada pengulangan.

Formulir SPMB lengkap: backup, jalankan `database/migrations/20261109_spmb_applicant_profiles.sql`, lalu deploy backend/admin/website bersama. Pendaftaran baru mewajibkan email, NISN dan data profil sesuai formulir sekolah; pendaftaran lama tetap terbaca tanpa profil. Tinggi/berat memakai DECIMAL(5,1) dan parsing HTML invariant.


NISN LMP: backup dan hentikan API sebelum menjalankan `database/migrations/20261110_lmp_nisn.sql`, lalu deploy backend, portal, dan web utama bersama. Pendaftaran baru dan cek status wajib NISN 10 digit + nama lengkap. Nilai pendaftaran lama tetap NULL; staf dapat melengkapi NISN melalui detail portal. Jangan mengisi nomor fiktif atau mengubah data lama secara massal.

Detail ekstrakurikuler: jalankan `database/migrations/20261110_extracurricular_coach.sql` sebelum backend baru. Editor portal menyediakan pelatih/pembina dan isi kegiatan/latihan; kartu publik memakai foto dan menautkan halaman detail. Foto tetap memakai migrasi/storage BLOB yang sudah ada. Kedua migrasi di atas idempotent dan disertakan runner NormalizeOnly lokal; penerapan lokal tidak berarti migrasi server sudah dijalankan.


Statistik beranda: backup lalu jalankan `database/migrations/20261110_school_highlights.sql` sebelum backend terbaru. Deploy ulang portal dan web utama bersama; pengaturan berada di Pengaturan Website > Statistik Beranda. Enam nilai sebelumnya menjadi data awal dan harus diperiksa sekolah. Migrasi idempotent mempertahankan edit, urutan dan penghapusan; tidak menyimpan konfigurasi JSON.


Upload gambar beranda: backup dan terapkan `database/migrations/20261110_homepage_image_files.sql`, lalu `database/migrations/20261111_homepage_spmb_image.sql` sebelum backend baru; deploy portal dan web utama bersama. Slot keempat `spmb` mengatur foto ajakan pendaftaran di bagian bawah beranda melalui portal Gambar Beranda. Batas 1 MiB per foto, hingga empat foto sekaligus (request 4.4 MB); konfigurasi Nginx 4400k yang sudah digunakan mencukupi. Kompresi memakai optimizer/SkiaSharp yang sudah ada, PNG transparan mempertahankan alpha. URL lama tetap didukung. Reset/ganti foto membersihkan BLOB slot lama, tanpa mengubah gambar konten CMS lainnya.
