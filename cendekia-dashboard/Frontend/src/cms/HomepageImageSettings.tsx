"use client";
import { FormSkeleton } from "@/components/common/LoadingSkeleton";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { apiGet, apiPut } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { useToast } from "@/context/ToastContext";
import { websiteUrl } from "./collections";
import ImageCompressionNotice from "@/components/common/ImageCompressionNotice";

type Images = { heroUrl: string; directionUrl: string; programUrl: string; version: number };
const slots = [
  { key: "heroUrl", title: "Banner Utama", description: "Gambar di bagian paling atas beranda.", dimensions: "1536 × 1024", fallback: "/images/school/siswa-ceria.png" },
  { key: "directionUrl", title: "Arah Pendidikan", description: "Gambar di samping visi, misi, dan motto.", dimensions: "1122 × 1402", fallback: "/images/school/arah-pendidikan.png" },
  { key: "programUrl", title: "Program Belajar", description: "Gambar di samping daftar program belajar.", dimensions: "1312 × 1199", fallback: "/images/school/bimbingan-karier.png" },
] as const;
function previewSource(value: string, fallback: string) {
  const url = value.trim();
  if (url.startsWith("/images/")) return `${websiteUrl}${url}`;
  return url.startsWith("https://") ? url : `${websiteUrl}${fallback}`;
}
export default function HomepageImageSettings() {
  const [form, setForm] = useState<Images | null>(null);
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);
  const [error, setError] = useState(""); const [canEdit, setCanEdit] = useState(false);
  const toast = useToast();
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setForm(await apiGet<Images>("/api/cms/homepage-images")); }
    catch (e) { setError(e instanceof Error ? e.message : "Gagal memuat gambar beranda."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); setCanEdit(["ADMIN", "SUPERVISOR", "OPERATOR"].includes(getStoredUser()?.role || "")); }, [load]);
  async function save(e: FormEvent) {
    e.preventDefault(); if (!form || saving || !canEdit) return;
    setSaving(true); setError("");
    try { setForm(await apiPut<Images>("/api/cms/homepage-images", form)); toast.success({ message: "Gambar beranda berhasil diperbarui di website." }); }
    catch (e) { setError(e instanceof Error ? e.message : "Gagal menyimpan gambar."); }
    finally { setSaving(false); }
  }
  return <div className="cms-page cms-homepage-images">
    <div className="cms-page-heading"><div><p className="cms-eyebrow">PENGATURAN WEBSITE</p><h1>Gambar Beranda</h1><p>Ganti ilustrasi beranda melalui URL gambar. Kosongkan untuk memakai gambar bawaan.</p></div><a className="cms-button-secondary" href={websiteUrl} target="_blank" rel="noopener noreferrer">Lihat website &#8599;</a></div>
    {error && <div role="alert" className="cms-error"><p>{error}</p><button type="button" disabled={saving} onClick={() => void load()}>Muat ulang pengaturan</button></div>}
    {loading ? <FormSkeleton panels={3} fields={1} preview label="Memuat gambar beranda" /> : form && <form onSubmit={save}>
      {!canEdit && <p className="mb-5 text-sm text-slate-500">Akun ini hanya dapat melihat pengaturan gambar.</p>}
      <fieldset disabled={saving || !canEdit} className="grid min-w-0 gap-5 disabled:opacity-80 xl:grid-cols-3">
        {slots.map(slot => <section key={slot.key} className="cms-panel min-w-0 overflow-hidden">
          <div className="cms-section-heading"><h2>{slot.title}</h2></div>
          <div className="cms-form-body">
            <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
              <img key={form[slot.key]} src={previewSource(form[slot.key], slot.fallback)} alt={`Pratinjau ${slot.title}`} className="h-full w-full object-contain" onError={e => { const fallback = `${websiteUrl}${slot.fallback}`; if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback; }} />
            </div>
            <label>URL gambar {slot.title}<input maxLength={1000} value={form[slot.key]} onChange={e => setForm({ ...form, [slot.key]: e.target.value })} placeholder="https://... atau /images/..." /><small>{slot.description} Disarankan PNG transparan agar menyatu dengan latar.</small></label>
            <p className="text-sm text-slate-600 dark:text-slate-300"><span className="font-semibold">Ukuran disarankan:</span> {slot.dimensions} piksel. Gunakan proporsi yang sama agar gambar tidak tampak gepeng.</p>
            <ImageCompressionNotice />
            <p className="text-xs text-slate-500">{form[slot.key].trim() ? "Menggunakan gambar khusus. Jika gagal dimuat, gambar bawaan ditampilkan." : "Menggunakan gambar bawaan."}</p>
            {canEdit && <button type="button" disabled={!form[slot.key]} className="cms-button-secondary" onClick={() => setForm({ ...form, [slot.key]: "" })}>Gunakan gambar bawaan</button>}
          </div>
        </section>)}
      </fieldset>
      <div className="mt-5 flex justify-end">{canEdit && <button className="cms-button" disabled={saving}>{saving ? "Menyimpan..." : "Simpan gambar"}</button>}</div>
    </form>}
  </div>;
}
