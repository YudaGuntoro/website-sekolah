"use client";
import { FormSkeleton } from "@/components/common/LoadingSkeleton";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { apiGet, apiPut } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { useToast } from "@/context/ToastContext";
import { ArrowUpIcon, ArrowDownIcon, TrashBinIcon } from "@/icons";
import { websiteUrl } from "./collections";

type Mission = { title: string; text: string };
type Identity = { vision: string; motto: string; missions: Mission[]; version: number };
export default function SchoolIdentitySettings() {
  const [form, setForm] = useState<Identity | null>(null);
  const [error, setError] = useState(""); const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false); const [canEdit, setCanEdit] = useState(false);
  const toast = useToast();
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setForm(await apiGet<Identity>("/api/cms/school-identity")); }
    catch (e) { setError(e instanceof Error ? e.message : "Gagal memuat profil sekolah."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); setCanEdit(["ADMIN", "SUPERVISOR", "OPERATOR"].includes(getStoredUser()?.role || "")); }, [load]);
  function changeMission(index: number, key: keyof Mission, value: string) {
    setForm(prev => prev ? { ...prev, missions: prev.missions.map((m, i) => i === index ? { ...m, [key]: value } : m) } : prev);
  }
  function move(index: number, direction: number) {
    setForm(prev => {
      if (!prev || index + direction < 0 || index + direction >= prev.missions.length) return prev;
      const missions = [...prev.missions]; [missions[index], missions[index + direction]] = [missions[index + direction], missions[index]];
      return { ...prev, missions };
    });
  }
  async function save(e: FormEvent) {
    e.preventDefault(); if (!form || !canEdit || saving) return;
    setSaving(true); setError("");
    try { setForm(await apiPut<Identity>("/api/cms/school-identity", form)); toast.success({ message: "Visi, misi, dan motto berhasil diperbarui di website." }); }
    catch (e) { setError(e instanceof Error ? e.message : "Gagal menyimpan profil sekolah."); }
    finally { setSaving(false); }
  }
  return <div className="cms-page cms-identity-settings">
    <div className="cms-page-heading"><div><p className="cms-eyebrow">PROFIL SEKOLAH</p><h1>Visi, Misi & Motto</h1><p>Kelola arah, tujuan, dan motto sekolah yang tampil di website utama.</p></div><a className="cms-button-secondary" href={`${websiteUrl}/#tentang`} target="_blank" rel="noopener noreferrer">Lihat website &#8599;</a></div>
    {error && <div role="alert" className="cms-error"><p>{error}</p><button type="button" disabled={saving} onClick={() => void load()}>Muat ulang pengaturan</button></div>}
    {loading ? <FormSkeleton label="Memuat visi, misi, dan motto" /> : form && <form onSubmit={save}>
      {!canEdit && <p className="mb-5 text-sm text-slate-500">Akun ini hanya dapat melihat profil sekolah.</p>}
      <fieldset disabled={saving || !canEdit} className="min-w-0 space-y-6 disabled:opacity-80">
        <div className="grid min-w-0 gap-6 lg:grid-cols-2">
          <section className="cms-panel overflow-hidden"><div className="cms-section-heading"><h2>Visi Sekolah</h2></div><div className="cms-form-body"><label>Isi visi<textarea rows={5} maxLength={4000} value={form.vision} onChange={e => setForm({ ...form, vision: e.target.value })} /><small>Tampil pada bagian Visi di beranda.</small></label></div></section>
          <section className="cms-panel overflow-hidden"><div className="cms-section-heading"><h2>Motto Sekolah</h2></div><div className="cms-form-body"><label>Isi motto<textarea rows={5} maxLength={500} value={form.motto} onChange={e => setForm({ ...form, motto: e.target.value })} /><small>Tampil pada bagian Motto di beranda.</small></label></div></section>
        </div>
        <section className="cms-panel overflow-hidden"><div className="cms-section-heading"><div><h2>Misi Sekolah</h2><p>Tambah, edit, dan atur urutan poin misi sekolah.</p></div><span className="text-sm">{form.missions.length} poin</span></div>
          <div className="grid min-w-0 gap-5 p-4 sm:p-6">
            {form.missions.map((mission, index) => <div key={index} className="min-w-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between gap-3 bg-slate-50 px-4 py-3 dark:bg-slate-800"><h3 className="font-semibold">Misi {index + 1}</h3>{canEdit && <div className="flex gap-1">
                <button type="button" className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-blue-100 disabled:opacity-30 dark:hover:bg-slate-700" disabled={index === 0} onClick={() => move(index, -1)} aria-label={`Naikkan misi ${index + 1}`}><ArrowUpIcon className="h-5 w-5" /></button>
                <button type="button" className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-blue-100 disabled:opacity-30 dark:hover:bg-slate-700" disabled={index === form.missions.length - 1} onClick={() => move(index, 1)} aria-label={`Turunkan misi ${index + 1}`}><ArrowDownIcon className="h-5 w-5" /></button>
                <button type="button" className="flex h-9 w-9 items-center justify-center rounded-md text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-700" onClick={() => setForm({ ...form, missions: form.missions.filter((_, i) => i !== index) })} aria-label={`Hapus misi ${index + 1}`}><TrashBinIcon className="h-5 w-5" /></button>
              </div>}</div>
              <div className="cms-form-body"><label>Judul misi {index + 1}<input required maxLength={150} value={mission.title} onChange={e => changeMission(index, "title", e.target.value)} /><small>Judul ringkas untuk kartu misi pada tampilan mobile.</small></label><label>Isi misi {index + 1}<textarea required rows={3} maxLength={2000} value={mission.text} onChange={e => changeMission(index, "text", e.target.value)} /></label></div>
            </div>)}
            {!form.missions.length && <p className="py-4 text-sm text-slate-500">Belum ada poin misi. Tambahkan poin untuk ditampilkan di website.</p>}
            {canEdit && <button type="button" className="cms-button-secondary justify-self-start" disabled={form.missions.length >= 20} onClick={() => setForm({ ...form, missions: [...form.missions, { title: "", text: "" }] })}>+ Tambah poin misi</button>}
          </div>
        </section>
      </fieldset>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4"><p className="text-sm text-slate-500">Perubahan tampil di website setelah disimpan.</p>{canEdit && <button className="cms-button" disabled={saving}>{saving ? "Menyimpan..." : "Simpan perubahan"}</button>}</div>
    </form>}
  </div>;
}
