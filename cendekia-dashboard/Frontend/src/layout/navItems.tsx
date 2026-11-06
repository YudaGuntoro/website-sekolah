import React from "react";
import { CalenderIcon, GridIcon, GroupIcon, MegaphoneIcon, SocialShareIcon, SchoolIcon, UserAddIcon, SettingsIcon, TrophyIcon } from "../icons/index";
import { collections } from "@/cms/collections";
export type NavSubItem = { name: string; path: string; pro?: boolean; new?: boolean };
export type NavItem = { name: string; icon: React.ReactNode; path?: string; subItems?: NavSubItem[] };
const group = (keys: string[]) => collections.filter(c => keys.includes(c.key)).map(c => ({ name: c.name, path: '/content/' + c.key }));
export const navItems: NavItem[] = [
  { icon: <GridIcon />, name: "Dashboard", path: "/" },
  { icon: <MegaphoneIcon />, name: "Publikasi", subItems: group(["berita", "pengumuman"]) },
  { icon: <SocialShareIcon />, name: "Media Sosial", subItems: group(["instagram", "tiktok"]) },
  { icon: <SchoolIcon />, name: "Profil Sekolah", subItems: [...group(["profil", "sambutan"]), { name: "Visi, Misi & Motto", path: "/settings/identity" }, ...group(["guru", "fasilitas"])] },
  { icon: <CalenderIcon />, name: "Kehidupan Sekolah", subItems: group(["program", "kegiatan", "ekstrakurikuler", "prestasi", "osis"]) },
  { icon: <UserAddIcon />, name: "SPMB", subItems: [
    { name: "Informasi SPMB", path: "/spmb/informasi" },
    { name: "Pendaftar SPMB", path: "/spmb/pendaftar" },
    { name: "Pengaturan Gelombang", path: "/spmb/gelombang" },
  ] },
  { icon: <TrophyIcon />, name: "LMP", subItems: [
    { name: "Informasi & Pengaturan", path: "/lmp/informasi" },
    { name: "Pendaftar LMP", path: "/lmp/pendaftar" },
  ] },
  { icon: <SettingsIcon />, name: "Pengaturan Website", subItems: [{ name: "Kontak & Media Sosial", path: "/settings/contact" }, { name: "Gambar Beranda", path: "/settings/images" }] },
  { icon: <GroupIcon />, name: "Pengguna", path: "/users" },
];
