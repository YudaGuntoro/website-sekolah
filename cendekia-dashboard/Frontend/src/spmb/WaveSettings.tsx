"use client";
import { FormSkeleton } from "@/components/common/LoadingSkeleton";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { apiGet, apiPut } from "@/lib/api";
import { getStoredUser } from "@/lib/auth";
import { useToast } from "@/context/ToastContext";
import DatePicker from "@/components/form/date-picker";
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
  const changeWave = (number: number, key: "startDate" | "endDate" | "whatsappGroupUrl", value: string | null) => setSettings(prev => prev ? { ...prev, waves: prev.waves.map(w => w.number === number ? { ...w, [key]: value } : w) } : prev);
  return <div className="cms-page"><div className="cms-page-heading"><div><p className="cms-eyebrow">PENERIMAAN MURID BARU</p><h1>Pengaturan Gelombang</h1><p>Atur jadwal empat gelombang dan buka pendaftaran sesuai waktu sekolah.</p></div></div>
    {error && <div role="alert" className="cms-error">{error} <button type="button" onClick={() => void load()}>Muat ulang</button></div>}
    {!settings ? (error ? <p className="cms-empty">Pengaturan belum tersedia.</p> : <FormSkeleton panels={1} fields={4} />) : <form onSubmit={save} className="cms-panel spmb-settings">
      <div className="spmb-settings-intro"><div><h2>Jadwal pendaftaran</h2><p>Gelombang otomatis mengikuti tanggal dalam WIB, mulai 00.00 hingga 23.59 pada tanggal terakhir. Kosongkan kedua tanggal jika belum dijadwalkan. Jadwal tidak boleh bertumpuk.</p></div><span className={`cms-badge ${settings.activeWave ? "published" : "draft"}`}>{settings.activeWave ? `Gelombang ${settings.activeWave} terbuka` : "Pendaftaran ditutup"}</span></div>
      <fieldset disabled={!canEdit || saving}><div className="spmb-settings-controls"><label>Tahun ajaran<input aria-label="Tahun ajaran" required pattern="20[0-9]{2}/20[0-9]{2}" maxLength={9} placeholder="2027/2028" value={settings.academicYear} onChange={e => setSettings({ ...settings, academicYear: e.target.value, waves: settings.waves.map(w => ({ ...w, whatsappGroupUrl: "" })) })} /></label><label className="spmb-checkbox"><input type="checkbox" checked={settings.enabled} onChange={e => setSettings({ ...settings, enabled: e.target.checked })} /><span><strong>Aktifkan pendaftaran SPMB</strong><small>Saat diaktifkan, gelombang otomatis dibuka sesuai tanggalnya. Matikan untuk menutup seluruh pendaftaran.</small></span></label></div>
      <div className="spmb-waves">{settings.waves.map(w => <section key={w.number} className="spmb-wave-card"><header><div><span>0{w.number}</span><h3>Gelombang {w.number}</h3></div></header><div className="cms-form-grid"><DatePicker id={`wave-${w.number}-start`} label="Tanggal mulai" ariaLabel={`Tanggal mulai Gelombang ${w.number}`} placeholder="dd/mm/yyyy" altInput altFormat="d/m/Y" required={!!w.endDate} disabled={!canEdit || saving} value={w.startDate || ""} onValueChange={value => changeWave(w.number, "startDate", value || null)} /><DatePicker id={`wave-${w.number}-end`} label="Tanggal selesai" ariaLabel={`Tanggal selesai Gelombang ${w.number}`} placeholder="dd/mm/yyyy" altInput altFormat="d/m/Y" required={!!w.startDate} disabled={!canEdit || saving} minDate={w.startDate || undefined} value={w.endDate || ""} onValueChange={value => changeWave(w.number, "endDate", value || null)} /><label className="spmb-wave-group">Tautan grup WhatsApp<input type="url" maxLength={300} aria-label={`Tautan grup WhatsApp Gelombang ${w.number}`} placeholder="https://chat.whatsapp.com/..." value={w.whatsappGroupUrl || ""} onChange={e => changeWave(w.number, "whatsappGroupUrl", e.target.value)} /><small>Opsional. Satu grup per gelombang. Tombol dan tautan gabung tampil di web utama setelah pendaftaran berhasil.</small></label></div><p>{dateOnly(w.startDate)} — {dateOnly(w.endDate)}</p></section>)}</div></fieldset>
      <div className="spmb-settings-footer"><p>{canEdit ? "Gelombang pendaftar tersimpan saat submit dan tidak berubah saat jadwal diedit." : "Pengaturan hanya dapat diubah oleh administrator atau editor utama."}</p>{canEdit && <button className="cms-button" disabled={saving}>{saving ? "Menyimpan…" : "Simpan pengaturan"}</button>}</div>
    </form>}
  </div>;
}
