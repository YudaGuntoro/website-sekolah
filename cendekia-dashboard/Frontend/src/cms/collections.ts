export const collections = [
  { key: "instagram", name: "Feed Instagram", description: "Kelola pilihan postingan pada halaman Instagram website. Beranda menampilkan embed profil @smpitcendekia langsung dari Instagram.", category: "Kategori", title: "Judul postingan", body: "Keterangan", path: "/instagram" },
  { key: "tiktok", name: "Feed TikTok", description: "Kelola postingan TikTok yang tampil di beranda sekolah.", category: "Kategori", title: "Judul postingan", body: "Keterangan", path: "/#tiktok" },
  { key: "berita", name: "Berita", description: "Cerita, kabar, dan artikel terbaru dari sekolah.", category: "Kategori berita", title: "Judul berita", body: "Isi berita", path: "/berita" },
  { key: "pengumuman", name: "Pengumuman", description: "Informasi penting untuk siswa dan orang tua.", category: "Kategori", title: "Judul pengumuman", body: "Isi pengumuman", path: "/pengumuman" },
  { key: "profil", name: "Profil Sekolah", description: "Profil, sejarah, visi, misi, dan struktur sekolah.", category: "Bagian profil", title: "Judul bagian", body: "Isi profil", path: "/sejarah" },
  { key: "sambutan", name: "Sambutan Kepala Sekolah", description: "Edit nama, jabatan, foto, dan isi sambutan di beranda. Sambutan terbit terbaru yang ditampilkan.", category: "Jabatan", title: "Nama kepala sekolah", body: "Isi sambutan lengkap", path: "/#sambutan" },
  { key: "guru", name: "Guru & Staf", description: "Pimpinan, tenaga pendidik, dan staf Cendekia.", category: "Jabatan (awali Guru untuk tenaga pendidik)", title: "Nama lengkap", body: "Biografi", path: "/guru" },
  { key: "prestasi", name: "Prestasi", description: "Pencapaian dan karya siswa yang membanggakan.", category: "Ajang / tingkat lomba", title: "Nama prestasi", body: "Cerita prestasi", path: "/prestasi" },
  { key: "fasilitas", name: "Fasilitas", description: "Sarana pendukung pembelajaran.", category: "Kategori fasilitas", title: "Nama fasilitas", body: "Deskripsi lengkap", path: "/fasilitas" },
  { key: "program", name: "Program Belajar", description: "Program unggulan untuk pengembangan siswa.", category: "Kategori program", title: "Nama program", body: "Deskripsi program", path: "/#program" },
  { key: "kegiatan", name: "Kegiatan Rutin", description: "Keseharian dan pembiasaan baik di sekolah.", category: "Kategori kegiatan", title: "Nama kegiatan", body: "Deskripsi kegiatan", path: "/kegiatan-rutin" },
  { key: "ekstrakurikuler", name: "Ekstrakurikuler", description: "Ruang siswa mengeksplorasi minat dan bakat.", category: "Kategori kegiatan", title: "Nama ekstrakurikuler", body: "Jadwal dan informasi", path: "/ekstrakurikuler" },
  { key: "osis", name: "OSIS", description: "Kepengurusan dan informasi organisasi siswa.", category: "Jabatan / bagian", title: "Nama atau judul", body: "Keterangan", path: "/osis" },
  { key: "spmb", name: "Informasi SPMB", description: "Informasi penerimaan murid baru dan pendaftaran.", category: "Bagian informasi", title: "Judul informasi", body: "Informasi lengkap", path: "/spmb" },
] as const;
export type CollectionKey = (typeof collections)[number]["key"];
export type ContentEntry = { id: number; collection: CollectionKey; title: string; slug: string; category: string; summary: string; body: string; imageUrl: string; postUrl: string; status: "Draft" | "Published"; publishedAt: string | null; sortOrder: number; version: number; createdAt: string; updatedAt: string };
export const websiteUrl = process.env.NEXT_PUBLIC_SCHOOL_URL || "http://localhost:3000";
export const formatDate = (value: string) => new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeZone: "Asia/Jakarta" }).format(new Date(value.endsWith("Z") ? value : `${value}Z`));
export const slugify = (value: string) => value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
