"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const labels: Record<string, string> = {
  lmp: "LMP",
  informasi: "Informasi SPMB", images: "Gambar Beranda", identity: "Visi, Misi & Motto", sambutan: "Sambutan Kepala Sekolah", settings: "Pengaturan Website", contact: "Kontak & Media Sosial", instagram: "Feed Instagram", tiktok: "Feed TikTok", content: "Konten", berita: "Berita", pengumuman: "Pengumuman", profil: "Profil Sekolah", guru: "Guru & Staf", prestasi: "Prestasi", fasilitas: "Fasilitas", program: "Program Belajar", kegiatan: "Kegiatan Rutin", ekstrakurikuler: "Ekstrakurikuler", osis: "OSIS", pendaftar: "Pendaftar", gelombang: "Pengaturan Gelombang", spmb: "SPMB", dashboard: "Dashboard", users: "Pengguna",
};

export default function AdminBreadcrumb() {
  const pathname = usePathname();
  const isIdentity = pathname === "/settings/identity";
  const parts = pathname.split("/").filter(Boolean);
  const isLmp = parts[0] === "lmp";
  if (parts.length === 0) return null;
  const crumbs = parts.filter((part) => !/^\d+$/.test(part)).map((part, index, visibleParts) => ({ label: isLmp && part === "informasi" ? "Informasi & Pengaturan" : part === "settings" && isIdentity ? "Profil Sekolah" : labels[part] || part, href: `/${visibleParts.slice(0, index + 1).join("/")}` }));
  return <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-2 px-1 text-sm font-medium text-slate-500 dark:text-slate-400"><Link href="/" className="hover:text-blue-700">Dashboard</Link>{crumbs.map((crumb, index) => <span key={crumb.href} className="flex items-center gap-2"><span aria-hidden="true">/</span>{index === crumbs.length - 1 ? <span className="text-slate-800 dark:text-slate-200">{crumb.label}</span> : <Link href={crumb.href === "/settings" ? (isIdentity ? "/content/profil" : "/settings/contact") : crumb.href === "/content" ? "/" : crumb.href === "/spmb" ? "/spmb/pendaftar" : crumb.href === "/lmp" ? "/lmp/pendaftar" : crumb.href} className="hover:text-blue-700">{crumb.label}</Link>}</span>)}</nav>;
}
