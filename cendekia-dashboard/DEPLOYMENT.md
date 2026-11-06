# Deployment Cendekia CMS

Aplikasi ini belum dipublikasikan. Gunakan README.md untuk setup lokal.

Untuk hosting, jalankan website publik (port 3000), dashboard (port 3002), dan API (port 5243) sebagai layanan terpisah. Set SCHOOL_API_URL di server website; API_PROXY_TARGET dan NEXT_PUBLIC_SCHOOL_URL di dashboard; ConnectionStrings__DefaultConnection dan Jwt__SigningKey di server API. Database yang digunakan adalah cendekia_cms. Gunakan identitas JWT Cendekia/Cendekia.Frontend dan rahasia penandatanganan tersendiri.

Impor hanya database/cendekia_cms.sql dan database/seed_cendekia_content.sql. Jangan menjalankan SQL klinik lama atau memakai docs/deploy-vps.md sebagai instruksi deployment sekolah.
