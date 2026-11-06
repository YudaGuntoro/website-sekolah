"use client";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { apiGet, apiPut } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { useToast } from "@/context/ToastContext";
import { websiteUrl } from "./collections";

type Settings = { whatsappNumber: string; email: string; address: string; instagramUrl: string; tiktokUrl: string; facebookUrl: string; version: number };
export default function ContactSettings() {
  const [form, setForm] = useState<Settings | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const toast = useToast();
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setForm(await apiGet<Settings>("/api/cms/website-settings")); }
    catch (e) { setError(e instanceof Error ? e.message : "Gagal memuat pengaturan."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); setCanEdit(["ADMIN", "SUPERVISOR"].includes(getStoredUser()?.role || "")); }, [load]);
  function change(key: keyof Settings, value: string) { setForm(prev => prev ? { ...prev, [key]: value } : prev); }
  async function save(e: FormEvent) {
    e.preventDefault(); if (!form || !canEdit || saving) return;
    setSaving(true); setError("");
    try {
      setForm(await apiPut<Settings>("/api/cms/website-settings", form));
      toast.success({ message: "Kontak dan media sosial berhasil diperbarui di website." });
    } catch (e) { setError(e instanceof Error ? e.message : "Gagal menyimpan pengaturan."); }
    finally { setSaving(false); }
  }
  return <div className="cms-page">
    <div className="cms-page-heading"><div><p className="cms-eyebrow">PENGATURAN WEBSITE</p><h1>Kontak & Media Sosial</h1><p>Atur informasi kontak dan tautan akun resmi sekolah.</p></div><a className="cms-button-secondary" href={websiteUrl} target="_blank" rel="noopener noreferrer">Lihat website &#8599;</a></div>
    {error && <div role="alert" className="cms-error"><p>{error}</p><button type="button" onClick={() => void load()} disabled={saving}>Muat ulang pengaturan</button></div>}
    {loading ? <p className="cms-empty" role="status">Memuat pengaturan...</p> : form && <form onSubmit={save}>
      {!canEdit && <p className="mb-5 text-sm text-slate-500">Pengaturan hanya dapat diubah oleh Administrator atau Supervisor.</p>}
      <fieldset disabled={saving || !canEdit} className="grid min-w-0 gap-6 lg:grid-cols-2 disabled:opacity-80">
        <section className="cms-panel overflow-hidden"><div className="cms-section-heading bg-[#1b5394] text-white"><div><h2>Informasi Kontak</h2><p className="!text-blue-100">Nomor WhatsApp, email, dan alamat sekolah.</p></div></div>
          <div className="cms-form-body">
            <label>Nomor WhatsApp<input type="tel" maxLength={25} value={form.whatsappNumber} onChange={e => change("whatsappNumber", e.target.value)} placeholder="+62 812-3456-7890" /><small>Gunakan nomor Indonesia dengan awalan 08 atau +62.</small></label>
            <label>Email sekolah<input type="email" maxLength={254} value={form.email} onChange={e => change("email", e.target.value)} placeholder="sekolah@example.com" /></label>
            <label>Alamat sekolah<textarea rows={4} maxLength={1000} value={form.address} onChange={e => change("address", e.target.value)} placeholder="Alamat lengkap sekolah" /></label>
          </div>
        </section>
        <section className="cms-panel overflow-hidden"><div className="cms-section-heading bg-[#1b5394] text-white"><div><h2>Media Sosial</h2><p className="!text-blue-100">Tautan profil akun resmi untuk ikon di footer.</p></div></div>
          <div className="cms-form-body">
            <label>URL Instagram<input type="url" maxLength={500} value={form.instagramUrl} onChange={e => change("instagramUrl", e.target.value)} placeholder="https://www.instagram.com/akunsekolah/" /></label>
            <label>URL TikTok<input type="url" maxLength={500} value={form.tiktokUrl} onChange={e => change("tiktokUrl", e.target.value)} placeholder="https://www.tiktok.com/@akunsekolah" /></label>
            <label>URL Facebook<input type="url" maxLength={500} value={form.facebookUrl} onChange={e => change("facebookUrl", e.target.value)} placeholder="https://www.facebook.com/akunsekolah" /></label>
            <small className="leading-5">Gunakan tautan profil akun. Postingan feed dikelola melalui menu Media Sosial.</small>
          </div>
        </section>
      </fieldset>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4"><p className="text-xs text-slate-500">Kosongkan nilai untuk menyembunyikannya dari website.</p>{canEdit && <button className="cms-button" disabled={saving}>{saving ? "Menyimpan..." : "Simpan pengaturan"}</button>}</div>
    </form>}
  </div>;
}
