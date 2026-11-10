"use client";
import { FormSkeleton } from "@/components/common/LoadingSkeleton";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { apiGet, apiPut, apiRequest } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { useToast } from "@/context/ToastContext";
import { websiteUrl } from "./collections";

type Slot = "hero" | "direction" | "program";
type UrlKey = "heroUrl" | "directionUrl" | "programUrl";
type PhotoInfo = { slot: Slot; originalBytes: number; storedBytes: number };
type Images = { heroUrl: string; directionUrl: string; programUrl: string; version: number; photos: PhotoInfo[] };
const maxBytes = 1024 * 1024;
const slots: { slot: Slot; key: UrlKey; title: string; description: string; dimensions: string; fallback: string }[] = [
  { slot: "hero", key: "heroUrl", title: "Banner Utama", description: "Gambar di bagian paling atas beranda.", dimensions: "1536 x 1024", fallback: "/images/school/siswa-ceria.png" },
  { slot: "direction", key: "directionUrl", title: "Arah Pendidikan", description: "Gambar di samping visi, misi, dan motto.", dimensions: "1122 x 1402", fallback: "/images/school/arah-pendidikan.png" },
  { slot: "program", key: "programUrl", title: "Program Unggulan", description: "Gambar di samping daftar program unggulan.", dimensions: "1312 x 1199", fallback: "/images/school/bimbingan-karier.png" },
];
function previewSource(value: string, fallback: string) {
  const url = value.trim();
  if (/^\/api\/school\/homepage-images\/(hero|direction|program)\?v=\d+$/.test(url)) return url;
  if (url.startsWith("/images/")) return `${websiteUrl}${url}`;
  return url.startsWith("https://") ? url : `${websiteUrl}${fallback}`;
}
const kb = (bytes: number) => new Intl.NumberFormat("id-ID", { maximumFractionDigits: 1 }).format(bytes / 1024) + " KB";

export default function HomepageImageSettings() {
  const [form, setForm] = useState<Images | null>(null);
  const [loading, setLoading] = useState(true), [saving, setSaving] = useState(false);
  const [error, setError] = useState(""), [canEdit, setCanEdit] = useState(false);
  const [photos, setPhotos] = useState<Partial<Record<Slot, File>>>({});
  const [previews, setPreviews] = useState<Partial<Record<Slot, string>>>({});
  const inputs = useRef<Partial<Record<Slot, HTMLInputElement | null>>>({});
  const toast = useToast();
  useEffect(() => {
    const urls: Partial<Record<Slot, string>> = {};
    for (const slot of slots) if (photos[slot.slot]) urls[slot.slot] = URL.createObjectURL(photos[slot.slot]!);
    setPreviews(urls);
    return () => { for (const url of Object.values(urls)) URL.revokeObjectURL(url); };
  }, [photos]);
  function clearFiles() {
    setPhotos({}); for (const input of Object.values(inputs.current)) if (input) input.value = "";
  }
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setForm(await apiGet<Images>("/api/cms/homepage-images")); setPhotos({}); }
    catch (e) { setError(e instanceof Error ? e.message : "Gagal memuat gambar beranda."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); setCanEdit(["ADMIN", "SUPERVISOR", "OPERATOR"].includes(getStoredUser()?.role || "")); }, [load]);
  function selectPhoto(slot: Slot, key: UrlKey, input: HTMLInputElement) {
    const file = input.files?.[0];
    if (!file) return;
    if (file.size === 0 || file.size > maxBytes || !/\.(jpe?g|png)$/i.test(file.name)) {
      input.value = ""; setError("Foto harus JPG/PNG, maksimal 1 MB per foto."); return;
    }
    setError(""); setPhotos(prev => ({ ...prev, [slot]: file }));
    setForm(prev => prev ? { ...prev, [key]: "" } : prev);
  }
  function changeUrl(slot: Slot, key: UrlKey, value: string) {
    setPhotos(prev => { const next = { ...prev }; delete next[slot]; return next; });
    if (inputs.current[slot]) inputs.current[slot]!.value = "";
    setForm(prev => prev ? { ...prev, [key]: value } : prev);
  }
  async function save(event: FormEvent) {
    event.preventDefault(); if (!form || saving || !canEdit) return;
    setSaving(true); setError("");
    try {
      const payload = { heroUrl: form.heroUrl, directionUrl: form.directionUrl, programUrl: form.programUrl, version: form.version };
      let saved: Images;
      if (Object.keys(photos).length) {
        const body = new FormData();
        for (const [key, value] of Object.entries(payload)) body.set(key, String(value));
        for (const [slot, photo] of Object.entries(photos)) {
          if (photo.size > maxBytes) throw new Error("Foto maksimal 1 MB per foto.");
          body.set(slot + "Photo", photo);
        }
        saved = await apiRequest<Images>("/api/cms/homepage-images", { method: "PUT", body });
      } else saved = await apiPut<Images>("/api/cms/homepage-images", payload);
      setForm(saved); clearFiles(); toast.success({ message: "Gambar beranda berhasil diperbarui di website." });
    }
    catch (e) { setError(e instanceof Error ? e.message : "Gagal menyimpan gambar."); }
    finally { setSaving(false); }
  }
  return <div className="cms-page cms-homepage-images">
    <div className="cms-page-heading"><div><p className="cms-eyebrow">PENGATURAN WEBSITE</p><h1>Gambar Beranda</h1><p>Upload foto atau gunakan URL gambar. Foto dikompres otomatis sebelum disimpan.</p></div><a className="cms-button-secondary" href={websiteUrl} target="_blank" rel="noopener noreferrer">Lihat website &#8599;</a></div>
    {error && <div role="alert" className="cms-error"><p>{error}</p><button type="button" disabled={saving} onClick={() => void load()}>Muat ulang pengaturan</button></div>}
    {loading ? <FormSkeleton panels={3} fields={1} preview label="Memuat gambar beranda" /> : form && <form onSubmit={save}>
      {!canEdit && <p className="mb-5 text-sm text-slate-500">Akun ini hanya dapat melihat pengaturan gambar.</p>}
      <fieldset disabled={saving || !canEdit} className="grid min-w-0 gap-5 disabled:opacity-80 xl:grid-cols-3">
        {slots.map(slot => {
          const pending = photos[slot.slot], saved = form.photos?.find(photo => photo.slot === slot.slot);
          const preview = previews[slot.slot] || previewSource(form[slot.key], slot.fallback);
          return <section key={slot.key} className="cms-panel min-w-0 overflow-hidden" aria-label={slot.title}>
            <div className="cms-section-heading"><h2>{slot.title}</h2></div>
            <div className="cms-form-body">
              <div className="flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                <img key={preview} src={preview} alt={`Pratinjau ${slot.title}`} className="h-full w-full object-contain" onError={e => { const fallback = `${websiteUrl}${slot.fallback}`; if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback; }} />
              </div>
              <label>Upload foto {slot.title}<input ref={element => { inputs.current[slot.slot] = element; }} type="file" accept=".jpg,.jpeg,.png,image/jpeg,image/png" onChange={e => selectPhoto(slot.slot, slot.key, e.currentTarget)} /><small>JPG/PNG maksimal 1 MB per foto. Kompresi otomatis; transparansi PNG tetap dipertahankan.</small></label>
              {pending ? <p className="text-xs text-blue-600">Foto baru dipilih ({kb(pending.size)}). Klik Simpan gambar untuk mengunggah.</p> : saved && form[slot.key].startsWith("/api/school/homepage-images/") ? <p className="text-xs text-emerald-700 dark:text-emerald-400">Foto tersimpan: {kb(saved.storedBytes)} dari {kb(saved.originalBytes)}.</p> : null}
              <details><summary className="cursor-pointer text-sm font-semibold">Gunakan URL gambar</summary><label className="mt-3">URL gambar {slot.title}<input maxLength={1000} value={form[slot.key]} onChange={e => changeUrl(slot.slot, slot.key, e.target.value)} placeholder="https://... atau /images/..." /></label></details>
              <p className="text-xs leading-6 text-slate-500">{slot.description} Ukuran disarankan {slot.dimensions} piksel. Gunakan proporsi yang sama; PNG transparan cocok untuk ilustrasi.</p>
              {!pending && <p className="text-xs text-slate-500">{form[slot.key].trim() ? "Menggunakan gambar khusus. Jika gagal dimuat, gambar bawaan ditampilkan." : "Menggunakan gambar bawaan."}</p>}
              {canEdit && <button type="button" disabled={!form[slot.key] && !pending} className="cms-button-secondary" onClick={() => changeUrl(slot.slot, slot.key, "")}>Gunakan gambar bawaan</button>}
            </div>
          </section>;
        })}
      </fieldset>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4"><p className="text-sm text-slate-500">Perubahan tampil di website setelah disimpan.</p>{canEdit && <button className="cms-button" disabled={saving}>{saving ? "Menyimpan..." : "Simpan gambar"}</button>}</div>
    </form>}
  </div>;
}
