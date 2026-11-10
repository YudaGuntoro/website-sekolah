"use client";

import { FormEvent, useCallback, useEffect, useState } from "react";
import { apiGet, apiPut } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { useToast } from "@/context/ToastContext";
import { FormSkeleton } from "@/components/common/LoadingSkeleton";
import { ArrowDownIcon, ArrowUpIcon, TrashBinIcon } from "@/icons";
import { websiteUrl } from "./collections";

const icons = [
  ["classroom", "Ruang kelas"], ["educators", "Guru dan staf"], ["activities", "Kegiatan"],
  ["laboratory", "Laboratorium"], ["library", "Perpustakaan"], ["growth", "Pengembangan"],
];
type Card = { title: string; category: string; text: string; value: string; icon: string };
type Highlights = { heading: string; accent: string; description: string; enabled: boolean; cards: Card[]; version: number };

export default function SchoolHighlightsSettings() {
  const [form, setForm] = useState<Highlights | null>(null);
  const [loading, setLoading] = useState(true), [saving, setSaving] = useState(false);
  const [canEdit, setCanEdit] = useState(false), [error, setError] = useState("");
  const toast = useToast();
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setForm(await apiGet<Highlights>("/api/cms/school-highlights")); }
    catch (e) { setError(e instanceof Error ? e.message : "Gagal memuat statistik beranda."); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void load(); setCanEdit(["ADMIN", "SUPERVISOR", "OPERATOR"].includes(getStoredUser()?.role || "")); }, [load]);
  function changeCard(index: number, key: keyof Card, value: string) {
    setForm(prev => prev ? { ...prev, cards: prev.cards.map((card, i) => i === index ? { ...card, [key]: value } : card) } : prev);
  }
  function move(index: number, offset: number) {
    setForm(prev => {
      if (!prev || index + offset < 0 || index + offset >= prev.cards.length) return prev;
      const cards = [...prev.cards]; [cards[index], cards[index + offset]] = [cards[index + offset], cards[index]];
      return { ...prev, cards };
    });
  }
  async function save(event: FormEvent) {
    event.preventDefault(); if (!form || saving || !canEdit) return;
    setSaving(true); setError("");
    try { setForm(await apiPut<Highlights>("/api/cms/school-highlights", form)); toast.success({ message: "Statistik beranda berhasil diperbarui di website." }); }
    catch (e) { setError(e instanceof Error ? e.message : "Gagal menyimpan statistik beranda."); }
    finally { setSaving(false); }
  }
  return <div className="cms-page">
    <div className="cms-page-heading"><div><p className="cms-eyebrow">PENGATURAN WEBSITE</p><h1>Statistik Beranda</h1><p>Kelola bagian “Ruang untuk tumbuh lebih jauh” dan kartu statistik sekolah.</p></div><a className="cms-button-secondary" href={`${websiteUrl}/#keunggulan`} target="_blank" rel="noopener noreferrer">Lihat website &#8599;</a></div>
    {error && <div role="alert" className="cms-error"><p>{error}</p><button type="button" disabled={saving} onClick={() => void load()}>Muat ulang pengaturan</button></div>}
    {loading ? <FormSkeleton label="Memuat statistik beranda" /> : form && <form onSubmit={save}>
      {!canEdit && <p className="mb-5 text-sm text-slate-500">Akun ini hanya dapat melihat pengaturan.</p>}
      <fieldset disabled={saving || !canEdit} className="min-w-0 space-y-6 disabled:opacity-80">
        <section className="cms-panel overflow-hidden"><div className="cms-section-heading"><h2>Judul bagian</h2></div><div className="cms-form-body">
          <label className="!flex items-center gap-3"><input className="!h-4 !w-4 shrink-0 !p-0 accent-brand-500" type="checkbox" checked={form.enabled} onChange={e => setForm({ ...form, enabled: e.target.checked })} />Tampilkan statistik di beranda</label>
          <div className="cms-form-grid"><label>Judul utama<input required maxLength={150} value={form.heading} onChange={e => setForm({ ...form, heading: e.target.value })} /></label><label>Judul berwarna biru<input maxLength={150} value={form.accent} onChange={e => setForm({ ...form, accent: e.target.value })} /></label></div>
          <label>Deskripsi bagian<textarea rows={3} maxLength={1000} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
        </div></section>
        <section className="cms-panel overflow-hidden"><div className="cms-section-heading"><div><h2>Kartu statistik</h2><p>Isi angka secara manual sesuai data resmi sekolah. Jumlah tidak dihitung otomatis dari daftar guru atau ekskul.</p></div><span className="shrink-0 text-sm">{form.cards.length} kartu</span></div>
          <div className="grid min-w-0 gap-5 p-4 sm:p-6">
            {form.cards.map((card, index) => <section key={index} className="min-w-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700" aria-label={`Kartu ${index + 1}`}>
              <div className="flex items-center justify-between gap-3 bg-slate-50 px-4 py-3 dark:bg-slate-800"><h3 className="font-semibold">Kartu {index + 1}</h3>{canEdit && <div className="flex gap-1">
                <button type="button" className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-blue-100 disabled:opacity-30 dark:hover:bg-slate-700" disabled={index === 0} onClick={() => move(index, -1)} aria-label={`Naikkan kartu ${index + 1}`}><ArrowUpIcon className="h-5 w-5" /></button>
                <button type="button" className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-blue-100 disabled:opacity-30 dark:hover:bg-slate-700" disabled={index === form.cards.length - 1} onClick={() => move(index, 1)} aria-label={`Turunkan kartu ${index + 1}`}><ArrowDownIcon className="h-5 w-5" /></button>
                <button type="button" className="flex h-9 w-9 items-center justify-center rounded-md text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-700" onClick={() => setForm({ ...form, cards: form.cards.filter((_, i) => i !== index) })} aria-label={`Hapus kartu ${index + 1}`}><TrashBinIcon className="h-5 w-5" /></button>
              </div>}</div>
              <div className="cms-form-body">
                <div className="cms-form-grid"><label>Judul kartu {index + 1}<input required maxLength={100} value={card.title} onChange={e => changeCard(index, "title", e.target.value)} /></label><label>Angka kartu {index + 1}<input required inputMode="text" maxLength={7} pattern="(0|[1-9][0-9]{0,5})\+?" title="Isi angka 0 sampai 999999, boleh diakhiri tanda +, misalnya 18+." value={card.value} onChange={e => changeCard(index, "value", e.target.value)} /><small>Contoh: 18, 30+, atau 0. Tanpa pemisah ribuan.</small></label></div>
                <div className="cms-form-grid"><label>Kategori kartu {index + 1}<input maxLength={100} value={card.category} onChange={e => changeCard(index, "category", e.target.value)} /></label><label>Ikon kartu {index + 1}<select value={card.icon} onChange={e => changeCard(index, "icon", e.target.value)}>{icons.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div>
                <label>Deskripsi kartu {index + 1}<textarea rows={2} maxLength={500} value={card.text} onChange={e => changeCard(index, "text", e.target.value)} /></label>
              </div>
            </section>)}
            {form.cards.length === 0 && <p className="py-4 text-sm text-slate-500">Belum ada kartu. Bagian ini tidak tampil di beranda sampai kartu ditambahkan.</p>}
            {canEdit && <button type="button" className="cms-button-secondary justify-self-start" disabled={form.cards.length >= 12} onClick={() => setForm({ ...form, cards: [...form.cards, { title: "", category: "", text: "", value: "0", icon: "growth" }] })}>+ Tambah kartu</button>}
          </div>
        </section>
      </fieldset>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-4"><p className="text-sm text-slate-500">Perubahan tampil di website setelah disimpan.</p>{canEdit && <button className="cms-button" disabled={saving}>{saving ? "Menyimpan..." : "Simpan statistik beranda"}</button>}</div>
    </form>}
  </div>;
}
