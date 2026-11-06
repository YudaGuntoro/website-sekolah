# Cendekia Backend

API ASP.NET Core 8 untuk CMS SMPIT Cendekia Purwakarta, SPMB, LMP, autentikasi dan pengguna. Database: MySQL 8 `cendekia_cms`.

- `Cendekia.Domain`: entitas sekolah, autentikasi, dan model request/response.
- `Cendekia.Application`: layanan aplikasi dan kontrak repository/unit of work.
- `Cendekia.Persistence`: EF Core, pemetaan relasi, repository dan penyedia autentikasi.
- `Cendekia.WebAPI`: HTTP, otorisasi, CSRF, rate limiting dan konfigurasi layanan.

## Menjalankan lokal

Salin `Cendekia.WebAPI/appsettings.Development.example.json` menjadi `appsettings.Development.json` dan isi koneksi database lokal. Jalankan setup database dari direktori dashboard sesuai [panduan arsitektur](../docs/architecture-and-database.md).

```powershell
dotnet build Cendekia.sln
$env:ASPNETCORE_ENVIRONMENT='Development'
dotnet run --project Cendekia.WebAPI --urls http://localhost:5243
```

Endpoint publik berada di `/api/school`, `/api/spmb` dan `/api/lmp`. Pengelolaan konten `/api/cms`, pengguna `/api/users`, serta data pendaftar memerlukan otorisasi. Dashboard menggunakan sesi HttpOnly melalui `/api/auth/session` dan header CSRF. Health probes: `/health/live`, `/health/ready`.

Lihat [deployment production](../docs/deploy-vps.md) untuk secret environment, HTTPS/proxy, backup dan monitoring. Jangan memakai kredensial development pada server production.
