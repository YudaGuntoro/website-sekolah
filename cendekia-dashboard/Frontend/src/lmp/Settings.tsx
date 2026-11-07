"use client";
import { FormSkeleton } from "@/components/common/LoadingSkeleton";
import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from "react";
import { apiGet, apiPut } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { websiteUrl } from "@/cms/collections";
import type { Config, Information } from "./types";

function Panel({ title, children }: { title: string; children: ReactNode }) { return <section className="cms-panel overflow-hidden"><div className="cms-section-heading bg-[#1b5394] text-white"><h2>{title}</h2></div><div className="cms-form-body">{children}</div></section>; }
export default function Settings() {
  const [data, setData] = useState<Information | null>(null); const [error, setError] = useState(""); const [saving, setSaving] = useState(false); const [loading, setLoading] = useState(true);
  const toast = useToast();
  const load = useCallback(async () => { setLoading(true); setError(""); try { setData(await apiGet<Information>("/api/lmp/settings")); } catch (e) { setError(e instanceof Error ? e.message : "Gagal memuat LMP."); } finally { setLoading(false); } }, []);
  useEffect(() => { void load(); }, [load]);
  function change<K extends keyof Config>(key: K, value: Config[K]) { setData(prev => prev ? { ...prev, config: { ...prev.config, [key]: value } } : prev); }
  async function save(e: FormEvent) { e.preventDefault(); if (!data || saving) return; setSaving(true); setError(""); try { setData(await apiPut<Information>("/api/lmp/settings", { config: data.config, version: data.version })); toast.success({ message: "Informasi LMP berhasil diperbarui di website." }); } catch (e) { setError(e instanceof Error ? e.message : "Gagal menyimpan."); } finally { setSaving(false); } }
  const c = data?.config;
  const text = (key: keyof Config, name: string, max = 1000, rows = 3) => <label>{name}<textarea aria-label={name} rows={rows} maxLength={max} required={["introduction", "testDetails", "afterSubmit"].includes(key)} value={String(c?.[key] ?? "")} onChange={e => change(key, e.target.value)} /></label>;
  const date = (key: "registrationStart" | "registrationEnd" | "competitionDate" | "announcementDate", name: string) => <label>{name}<input type="date" value={c?.[key] || ""} required={c?.enabled && (key === "registrationStart" || key === "registrationEnd")} onChange={e => change(key, e.target.value || null)} /></label>;
  return <div className="cms-page spmb-information-editor"><div className="cms-page-heading"><div><p className="cms-eyebrow">LOMBA MATA PELAJARAN</p><h1>Informasi & Pengaturan LMP</h1><p>Atur jadwal, persyaratan berkas, biaya, dan informasi lomba kelas 5–6 SD.</p></div><a className="cms-button-secondary" href={`${websiteUrl}/lmp`} target="_blank" rel="noopener noreferrer">Lihat website ↗</a></div>
    {error && <div role="alert" className="cms-error">{error} <button type="button" disabled={saving} onClick={() => void load()}>Muat ulang</button></div>}
    {loading ? <FormSkeleton label="Memuat pengaturan LMP" /> : c && <form onSubmit={save}><fieldset disabled={saving} className="min-w-0 space-y-6">
      <Panel title="Informasi Lomba"><label>Judul lomba<input value={c.title} maxLength={150} required onChange={e => change("title", e.target.value)} /></label>{text("introduction", "Deskripsi pembuka")}
        <p className="text-sm text-slate-500">Peserta kelas 5 atau 6 SD. Setiap peserta memilih satu mata pelajaran: Matematika, Bahasa Indonesia, atau Bahasa Inggris.</p></Panel>
      <Panel title="Jadwal Pendaftaran"><label className="!flex !items-center !gap-3"><input type="checkbox" className="!h-4 !w-4" checked={c.enabled} onChange={e => change("enabled", e.target.checked)} />Aktifkan pendaftaran LMP</label><div className="grid gap-5 sm:grid-cols-2">{date("registrationStart", "Tanggal mulai pendaftaran")}{date("registrationEnd", "Tanggal selesai pendaftaran")}</div><p className="text-sm text-slate-500">Menggunakan WIB. Pendaftaran otomatis ditutup di luar rentang tanggal, hingga pukul 23.59 pada tanggal selesai. Jadwal ini terpisah dari gelombang SPMB.</p></Panel>
      <Panel title="Pelaksanaan & Pengumuman"><div className="grid gap-5 sm:grid-cols-2">{date("competitionDate", "Tanggal lomba")}<label>Jam lomba<input value={c.competitionTime} maxLength={100} placeholder="07.30–16.00 WIB" onChange={e => change("competitionTime", e.target.value)} /></label></div><label>Tempat lomba<input value={c.venue} maxLength={300} onChange={e => change("venue", e.target.value)} /></label>{date("announcementDate", "Tanggal pengumuman juara & gebyar")}{text("announcementDetails", "Jam / tempat gebyar (isi menyusul bila belum pasti)", 300, 2)}{text("testDetails", "Mekanisme tes", 1500)}{text("benefits", "Benefit peserta & penghargaan")}</Panel>
      <Panel title="Berkas & Pembayaran">{text("documentInstructions", "Persyaratan berkas PDF")}<label className="!flex !items-center !gap-3"><input type="checkbox" className="!h-4 !w-4" checked={c.documentRequired} onChange={e => change("documentRequired", e.target.checked)} />Wajibkan unggah PDF saat mendaftar</label><p className="text-sm text-slate-500">Satu PDF maksimal 2 MB. Selama persyaratan belum ditetapkan, unggah berkas dapat dibuat opsional.</p><label>Biaya pendaftaran (Rp)<input type="number" min={0} max={100000000} required value={c.feeAmount} onChange={e => change("feeAmount", Number(e.target.value))} /></label>{text("paymentDetails", "Petunjuk pembayaran / nomor rekening")}</Panel>
      <Panel title="Petunjuk Setelah Submit">{text("afterSubmit", "Pesan setelah pendaftaran diterima", 1500)}<label>URL grup WhatsApp (opsional)<input type="url" maxLength={300} placeholder="https://chat.whatsapp.com/..." value={c.whatsappGroupUrl} onChange={e => change("whatsappGroupUrl", e.target.value)} /></label><p className="text-sm text-slate-500">Tombol gabung grup hanya tampil pada bukti pendaftaran jika URL sudah diisi.</p></Panel>
      <div className="flex justify-end"><button type="submit" className="cms-button" disabled={saving}>{saving ? "Menyimpan…" : "Simpan pengaturan LMP"}</button></div>
    </fieldset></form>}
  </div>;
}
