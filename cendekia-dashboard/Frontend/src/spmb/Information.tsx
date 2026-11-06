"use client";
import { FormEvent, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { apiGet, apiPut } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { useToast } from "@/context/ToastContext";
import { ArrowUpIcon, ArrowDownIcon, TrashBinIcon } from "@/icons";
import { websiteUrl } from "@/cms/collections";

type Step = { title: string; description: string; icon: string; showPayment: boolean };
type Config = { introduction: string; steps: Step[]; feeAmount: number; paymentDescription: string; bankName: string; accountNumber: string; accountHolder: string; newStudentDocuments: string[]; transferDocuments: string[]; brochureUrl: string };
type Data = { config: Config; version: number };
const icons = [
  { key: "register", name: "Daftar", path: "M8 3H4v18h16V3h-4M9 2h6v4H9zM8 11h8M8 15h5" },
  { key: "folder", name: "Berkas", path: "M3 7V4h6l2 3h10v13H3V7ZM3 10h18" },
  { key: "payment", name: "Biaya", path: "M3 5h18v14H3zM3 9h18M7 15h3m5 0h2" },
  { key: "test", name: "Tes", path: "M8 3H4v18h16V3h-4M9 2h6v4H9zM8 13l3 3 5-6" },
  { key: "check", name: "Selesai", path: "M21 11v1a9 9 0 1 1-5.3-8.2M9 11l3 3L22 4" },
  { key: "book", name: "Buku", path: "M12 6C9 4 5 4 2 5v14c3-1 7-1 10 1 3-2 7-2 10-1V5c-3-1-7-1-10 1Zm0 0v14" },
] as const;
export default function SpmbInformationEditor() {
  const [data, setData] = useState<Data | null>(null); const [year, setYear] = useState("");
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false);
  const [error, setError] = useState(""); const [canEdit, setCanEdit] = useState(false);
  const toast = useToast();
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const [value, schedule] = await Promise.all([apiGet<Data>("/api/cms/spmb-information"), apiGet<{ academicYear: string }>("/api/spmb/schedule")]); setData(value); setYear(schedule.academicYear); }
    catch (e) { setError(e instanceof Error ? e.message : "Gagal memuat informasi SPMB."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); setCanEdit(["ADMIN", "SUPERVISOR", "OPERATOR"].includes(getStoredUser()?.role || "")); }, [load]);
  function change<K extends keyof Config>(key: K, value: Config[K]) { setData(prev => prev ? { ...prev, config: { ...prev.config, [key]: value } } : prev); }
  function editStep(index: number, fields: Partial<Step>) {
    if (!data) return;
    change("steps", data.config.steps.map((step, i) => i === index ? { ...step, ...fields } : fields.showPayment ? { ...step, showPayment: false } : step));
  }
  function move(index: number, direction: number) {
    if (!data) return; const steps = [...data.config.steps];
    if (index + direction < 0 || index + direction >= steps.length) return;
    [steps[index], steps[index + direction]] = [steps[index + direction], steps[index]]; change("steps", steps);
  }
  async function save(e: FormEvent) {
    e.preventDefault(); if (!data || !canEdit || saving) return;
    setSaving(true); setError("");
    const clean = (items: string[]) => items.map(item => item.trim()).filter(Boolean);
    try { setData(await apiPut<Data>("/api/cms/spmb-information", { ...data, config: { ...data.config, newStudentDocuments: clean(data.config.newStudentDocuments), transferDocuments: clean(data.config.transferDocuments) } })); toast.success({ message: "Informasi SPMB berhasil diperbarui di website." }); }
    catch (e) { setError(e instanceof Error ? e.message : "Gagal menyimpan informasi SPMB."); }
    finally { setSaving(false); }
  }
  const config = data?.config;
  return <div className="cms-page spmb-information-editor">
    <div className="cms-page-heading"><div><p className="cms-eyebrow">PENERIMAAN MURID BARU</p><h1>Informasi SPMB</h1><p>Edit isi halaman SPMB dengan tampilan alur dan persyaratan yang tetap konsisten.</p></div><a className="cms-button-secondary" href={`${websiteUrl}/spmb`} target="_blank" rel="noopener noreferrer">Lihat website &#8599;</a></div>
    {error && <div role="alert" className="cms-error"><p>{error}</p><button type="button" disabled={saving} onClick={() => void load()}>Muat ulang informasi</button></div>}
    {loading ? <p className="cms-empty" role="status">Memuat informasi SPMB...</p> : config && data && <form onSubmit={save}>
      {!canEdit && <p className="mb-5 text-sm text-slate-500">Akun ini hanya dapat melihat informasi SPMB.</p>}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-[#1b5394] dark:border-slate-700 dark:bg-slate-800 dark:text-blue-100"><p>Tahun ajaran <strong>{year}</strong> otomatis mengikuti Pengaturan Gelombang.</p><Link href="/spmb/gelombang" className="font-semibold underline">Pengaturan gelombang</Link></div>
      <fieldset disabled={saving || !canEdit} className="min-w-0 space-y-6 disabled:opacity-80">
        <section className="cms-panel overflow-hidden"><div className="cms-section-heading bg-[#1b5394] text-white"><h2>Pembuka Halaman</h2></div><div className="cms-form-body"><label>Deskripsi pembuka<textarea rows={2} maxLength={1000} value={config.introduction} onChange={e => change("introduction", e.target.value)} /></label></div></section>
        <section className="cms-panel overflow-hidden"><div className="cms-section-heading bg-[#1b5394] text-white"><div><h2>Alur Pendaftaran</h2><p className="!text-blue-100">Atur judul, penjelasan, ikon, dan urutan tahap.</p></div><span>{config.steps.length} tahap</span></div>
          <div className="grid min-w-0 gap-5 p-4 sm:p-6">{config.steps.map((step, index) => <div key={index} className="min-w-0 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between gap-3 rounded-t-xl bg-slate-50 px-4 py-3 dark:bg-slate-800"><h3 className="font-semibold">Tahap {index + 1}</h3>{canEdit && <div className="flex gap-1">
              <button type="button" aria-label={`Naikkan tahap ${index + 1}`} disabled={index === 0} className="spmb-editor-icon-button" onClick={() => move(index, -1)}><ArrowUpIcon className="h-5 w-5" /></button>
              <button type="button" aria-label={`Turunkan tahap ${index + 1}`} disabled={index === config.steps.length - 1} className="spmb-editor-icon-button" onClick={() => move(index, 1)}><ArrowDownIcon className="h-5 w-5" /></button>
              <button type="button" aria-label={`Hapus tahap ${index + 1}`} disabled={config.steps.length === 1} className="spmb-editor-icon-button text-rose-500" onClick={() => change("steps", config.steps.filter((_, i) => i !== index))}><TrashBinIcon className="h-5 w-5" /></button>
            </div>}</div>
            <div className="cms-form-body"><label>Judul tahap {index + 1}<input required maxLength={150} value={step.title} onChange={e => editStep(index, { title: e.target.value })} /></label><label>Penjelasan tahap {index + 1}<textarea rows={3} maxLength={3000} value={step.description} onChange={e => editStep(index, { description: e.target.value })} /></label>
              <div><p className="mb-3 text-sm font-semibold">Pilih ikon tahap {index + 1}</p><div className="grid grid-cols-3 gap-2 sm:grid-cols-6">{icons.map(icon => <button type="button" key={icon.key} aria-label={`Ikon ${icon.name} tahap ${index + 1}`} aria-pressed={step.icon === icon.key} onClick={() => editStep(index, { icon: icon.key })} className={`flex min-w-0 flex-col items-center gap-2 rounded-lg border px-2 py-3 text-xs ${step.icon === icon.key ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200" : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"}`}><svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={icon.path} /></svg>{icon.name}</button>)}</div></div>
            </div><div className="px-6 pb-5"><label className="flex items-start gap-3 text-sm"><input type="checkbox" className="mt-1 h-4 w-4" checked={step.showPayment} onChange={e => editStep(index, { showPayment: e.target.checked })} /><span>Tampilkan rincian biaya pada tahap ini.</span></label></div>
          </div>)}{canEdit && <button type="button" disabled={config.steps.length >= 20} className="cms-button-secondary justify-self-start" onClick={() => change("steps", [...config.steps, { title: "", description: "", icon: "register", showPayment: false }])}>+ Tambah tahap</button>}</div>
        </section>
        <section className="cms-panel overflow-hidden"><div className="cms-section-heading bg-[#1b5394] text-white"><h2>Biaya Pendaftaran</h2></div><div className="cms-form-body"><div className="cms-form-grid"><label>Nominal biaya (Rp)<input type="number" min={0} max={1000000000} step={1} required value={config.feeAmount} onChange={e => change("feeAmount", Number(e.target.value))} /></label><label>Metode pembayaran<input maxLength={300} value={config.paymentDescription} onChange={e => change("paymentDescription", e.target.value)} /></label></div><div className="cms-form-grid"><label>Nama bank<input maxLength={150} value={config.bankName} onChange={e => change("bankName", e.target.value)} /></label><label>Nomor rekening<input maxLength={100} value={config.accountNumber} onChange={e => change("accountNumber", e.target.value)} /></label></div><label>Atas nama rekening<input maxLength={150} value={config.accountHolder} onChange={e => change("accountHolder", e.target.value)} /></label></div></section>
        <section className="cms-panel overflow-hidden"><div className="cms-section-heading bg-[#1b5394] text-white"><h2>Persyaratan Berkas</h2></div><div className="cms-form-body cms-form-grid"><label>Berkas calon siswa baru<textarea rows={7} maxLength={20000} value={config.newStudentDocuments.join("\n")} onChange={e => change("newStudentDocuments", e.target.value.split(/\r?\n/))} /><small>Satu berkas per baris, maksimal 40 berkas.</small></label><label>Berkas murid pindahan<textarea rows={7} maxLength={20000} value={config.transferDocuments.join("\n")} onChange={e => change("transferDocuments", e.target.value.split(/\r?\n/))} /><small>Satu berkas per baris, maksimal 40 berkas.</small></label></div></section>
        <section className="cms-panel overflow-hidden"><div className="cms-section-heading bg-[#1b5394] text-white"><h2>Brosur & Kontak</h2></div><div className="cms-form-body"><label>URL brosur<input maxLength={1000} placeholder="https://... atau /brosur-ppdb.pdf" value={config.brochureUrl} onChange={e => change("brochureUrl", e.target.value)} /><small>Kosongkan untuk menyembunyikan tombol brosur. Tombol formulir tetap menuju pendaftaran SPMB.</small></label><p className="text-sm text-slate-500">WhatsApp dan email otomatis mengikuti <Link className="text-blue-600 underline" href="/settings/contact">Kontak & Media Sosial</Link>.</p></div></section>
      </fieldset>
      <div className="mt-5 flex justify-end">{canEdit && <button className="cms-button" disabled={saving}>{saving ? "Menyimpan..." : "Simpan informasi SPMB"}</button>}</div>
    </form>}
  </div>;
}
