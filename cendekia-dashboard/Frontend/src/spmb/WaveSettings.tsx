"use client";
import { FormSkeleton } from "@/components/common/LoadingSkeleton";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { apiGet, apiPut } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { useToast } from "@/context/ToastContext";
import { Settings, dateOnly } from "./types";

export default function WaveSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const toast = useToast();
  const load = useCallback(async () => { setError(""); try { setSettings(await apiGet<Settings>("/api/spmb/settings")); } catch (e) { setError(e instanceof Error ? e.message : "Gagal memuat pengaturan."); } }, []);
  useEffect(() => { void load(); setCanEdit(["ADMIN", "SUPERVISOR"].includes(getStoredUser()?.role || "")); }, [load]);
  async function save(event: FormEvent) {
    event.preventDefault(); if (!settings) return;
    setSaving(true); setError("");
    try { setSettings(await apiPut<Settings>("/api/spmb/settings", settings)); toast.success({ message: "Pengaturan gelombang berhasil disimpan." }); }
    catch (e) { setError(e instanceof Error ? e.message : "Gagal menyimpan pengaturan."); }
    finally { setSaving(false); }
  }
  const changeWave = (number: number, key: "startDate" | "endDate" | "enabled", value: string | boolean | null) => setSettings(prev => prev ? { ...prev, waves: prev.waves.map(w => w.number === number ? { ...w, [key]: value } : w) } : prev);
  return <div className="cms-page"><div className="cms-page-heading"><div><p className="cms-eyebrow">PENERIMAAN MURID BARU</p><h1>Pengaturan Gelombang</h1><p>Atur jadwal empat gelombang dan buka pendaftaran sesuai waktu sekolah.</p></div></div>
    {error && <div role="alert" className="cms-error">{error} <button type="button" onClick={() => void load()}>Muat ulang</button></div>}
    {!settings ? (error ? <p className="cms-empty">Pengaturan belum tersedia.</p> : <FormSkeleton panels={1} fields={4} />) : <form onSubmit={save} className="cms-panel spmb-settings">
      <div className="spmb-settings-intro"><div><h2>Jadwal pendaftaran</h2><p>Tanggal berlaku dalam WIB, mulai 00.00 hingga 23.59 pada tanggal terakhir. Jadwal tidak boleh bertumpuk.</p></div><span className={`cms-badge ${settings.activeWave ? "published" : "draft"}`}>{settings.activeWave ? `Gelombang ${settings.activeWave} terbuka` : "Pendaftaran ditutup"}</span></div>
      <fieldset disabled={!canEdit || saving}><div className="spmb-settings-controls"><label>Tahun ajaran<input aria-label="Tahun ajaran" required pattern="20[0-9]{2}/20[0-9]{2}" maxLength={9} placeholder="2027/2028" value={settings.academicYear} onChange={e => setSettings({ ...settings, academicYear: e.target.value })} /></label><label className="spmb-checkbox"><input type="checkbox" checked={settings.enabled} onChange={e => setSettings({ ...settings, enabled: e.target.checked })} /><span><strong>Aktifkan pendaftaran SPMB</strong><small>Formulir tetap tertutup jika hari ini berada di luar seluruh jadwal.</small></span></label></div>
      <div className="spmb-waves">{settings.waves.map(w => <section key={w.number} className="spmb-wave-card"><header><div><span>0{w.number}</span><h3>Gelombang {w.number}</h3></div><label className="spmb-checkbox"><input type="checkbox" aria-label={`Aktifkan Gelombang ${w.number}`} checked={w.enabled} onChange={e => changeWave(w.number, "enabled", e.target.checked)} /> Aktif</label></header><div className="cms-form-grid"><label>Tanggal mulai<input type="date" required={w.enabled} aria-label={`Tanggal mulai Gelombang ${w.number}`} value={w.startDate || ""} onChange={e => changeWave(w.number, "startDate", e.target.value || null)} /></label><label>Tanggal selesai<input type="date" required={w.enabled} min={w.startDate || undefined} aria-label={`Tanggal selesai Gelombang ${w.number}`} value={w.endDate || ""} onChange={e => changeWave(w.number, "endDate", e.target.value || null)} /></label></div><p>{dateOnly(w.startDate)} — {dateOnly(w.endDate)}</p></section>)}</div></fieldset>
      <div className="spmb-settings-footer"><p>{canEdit ? "Gelombang pendaftar tersimpan saat submit dan tidak berubah saat jadwal diedit." : "Pengaturan hanya dapat diubah oleh administrator atau editor utama."}</p>{canEdit && <button className="cms-button" disabled={saving}>{saving ? "Menyimpan…" : "Simpan pengaturan"}</button>}</div>
    </form>}
  </div>;
}
