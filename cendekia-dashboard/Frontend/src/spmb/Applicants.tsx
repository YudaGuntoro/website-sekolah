"use client";
import PaymentProofDetails from "@/cms/PaymentProofDetails";
import { TableSkeleton } from "@/components/common/LoadingSkeleton";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiGet, apiPut, apiRequest } from "@/lib/api";
import ContactApplicantButton from "@/components/common/ContactApplicantButton";
import ExportApplicantsButton from "@/components/common/ExportApplicantsButton";
import ApplicantDetailButton from "@/components/common/ApplicantDetailButton";
import { CloseIcon } from "@/icons";
import { useToast } from "@/context/ToastContext";
import { Applicant, ApplicantDetail, Settings, dateTime, dateOnly, statuses } from "./types";

type Result = { items: Applicant[]; total: number; years: string[] };
export default function Applicants() {
  const [data, setData] = useState<Result>({ items: [], total: 0, years: [] });
  const [year, setYear] = useState(""); const [wave, setWave] = useState(""); const [status, setStatus] = useState("");
  const [search, setSearch] = useState(""); const [keyword, setKeyword] = useState("");
  const [page, setPage] = useState(1); const [limit, setLimit] = useState(10);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true); const [error, setError] = useState("");
  const [detail, setDetail] = useState<ApplicantDetail | null>(null); const [newStatus, setNewStatus] = useState("");
  const [detailError, setDetailError] = useState(""); const [saving, setSaving] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null); const toast = useToast();
  useEffect(() => { const timer = setTimeout(() => { setKeyword(search); setPage(1); }, 250); return () => clearTimeout(timer); }, [search]);
  const load = useCallback(async (signal?: AbortSignal) => { setLoading(true); setError(""); try {
    const query = new URLSearchParams({ year, wave, status, search: keyword, page: String(page), limit: String(limit) });
    const result = await apiRequest<Result>(`/api/spmb/applications?${query}`, { signal });
    if (!signal?.aborted) setData(result);
  } catch (e) { if (!signal?.aborted) setError(e instanceof Error ? e.message : "Gagal memuat pendaftar."); } finally { if (!signal?.aborted) setLoading(false); } }, [year, wave, status, keyword, page, limit]);
  useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort(); }, [load]);
  useEffect(() => { apiGet<Settings>("/api/spmb/settings").then(setSettings).catch(() => {}); }, []);
  async function open(id: number) {
    try { const value = await apiGet<ApplicantDetail>(`/api/spmb/applications/${id}`); setDetail(value); setNewStatus(value.status); setDetailError(""); dialog.current?.showModal(); }
    catch (e) { toast.error({ message: e instanceof Error ? e.message : "Gagal memuat detail." }); }
  }
  async function saveStatus() {
    if (!detail) return; setSaving(true); setDetailError("");
    try { const value = await apiPut<{ status: string; version: number }>(`/api/spmb/applications/${detail.id}/status`, { status: newStatus, version: detail.version }); setDetail({ ...detail, ...value }); toast.success({ message: "Status pendaftar disimpan." }); await load(); }
    catch (e) { setDetailError(e instanceof Error ? e.message : "Gagal menyimpan status."); }
    finally { setSaving(false); }
  }
  const years = [...new Set([settings?.academicYear, ...data.years].filter(Boolean))] as string[];
  const pages = Math.max(1, Math.ceil(data.total / limit));
  return <div className="cms-page"><div className="cms-page-heading"><div><p className="cms-eyebrow">PENERIMAAN MURID BARU</p><h1>Pendaftar SPMB</h1><p>Data dari formulir website, otomatis dikelompokkan berdasarkan tanggal submit dalam WIB.</p></div><div className="cms-applicant-actions"><a className="cms-button-secondary" href="/spmb/gelombang">Pengaturan gelombang</a><ExportApplicantsButton module="spmb" filters={{ year, wave, status, search: keyword }} /></div></div><div className="cms-stat-strip"><span><strong>{data.total}</strong> Pendaftar sesuai filter</span>{settings?.activeWave && <span><i className="cms-dot" /> Gelombang {settings.activeWave} terbuka</span>}</div>
    <section className="cms-panel"><div className="cms-toolbar spmb-applicant-toolbar"><label className="cms-page-size">Tampilkan <select aria-label="Jumlah baris" value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}><option>10</option><option>25</option><option>50</option></select> baris</label><div className="cms-toolbar-end"><select aria-label="Filter tahun ajaran" value={year} onChange={e => { setYear(e.target.value); setPage(1); }}><option value="">Semua tahun</option>{years.map(y => <option key={y}>{y}</option>)}</select><select aria-label="Filter gelombang" value={wave} onChange={e => { setWave(e.target.value); setPage(1); }}><option value="">Semua gelombang</option>{[1,2,3,4].map(n => <option key={n} value={n}>Gelombang {n}</option>)}</select><select aria-label="Filter status pendaftaran" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}><option value="">Semua status</option>{statuses.map(s => <option key={s}>{s}</option>)}</select><label className="cms-search">Cari<input aria-label="Cari pendaftar" value={search} onChange={e => setSearch(e.target.value)} placeholder="Nama, NISN, atau nomor daftar" /></label></div></div>
    {loading ? <TableSkeleton headers={["Nomor pendaftaran", "Calon siswa", "Gelombang", "Kelas", "Waktu submit (WIB)", "Status", "Detail"]} label="Memuat pendaftar" className="spmb-applicants-table" /> : error ? <div className="cms-empty" role="alert">{error}<br /><button className="cms-button-secondary" onClick={() => void load()}>Coba lagi</button></div> : !data.items.length ? <div className="cms-empty"><h2>Belum ada pendaftar</h2><p>Data akan tampil setelah formulir website berhasil disubmit pada jadwal yang aktif.</p></div> : <div className="cms-table-wrap"><table className="cms-table spmb-applicants-table"><thead><tr><th>Nomor pendaftaran</th><th>Calon siswa</th><th>Gelombang</th><th>Kelas</th><th>Waktu submit (WIB)</th><th>Status</th><th>Detail</th></tr></thead><tbody>{data.items.map(entry => <tr key={entry.id}><td>{entry.registrationNumber}<small className="spmb-row-subtitle">{entry.academicYear}</small></td><td><button className="cms-title-link" onClick={() => void open(entry.id)}>{entry.studentName}</button><small className="spmb-row-subtitle">{entry.previousSchool}</small></td><td>Gelombang {entry.waveNumber}</td><td>{entry.targetGrade}</td><td>{dateTime(entry.submittedAt)}</td><td><span className={`cms-badge ${entry.status === "Diterima" ? "published" : "navy"}`}>{entry.status}</span></td><td><ApplicantDetailButton studentName={entry.studentName} onClick={() => void open(entry.id)} /></td></tr>)}</tbody></table></div>}
    <div className="cms-table-footer"><span>Menampilkan {data.total ? (page - 1) * limit + 1 : 0} - {Math.min(page * limit, data.total)} dari {data.total} pendaftar</span><nav className="cms-pagination" aria-label="Navigasi pendaftar"><button aria-label="Halaman sebelumnya" disabled={page <= 1} onClick={() => setPage(page - 1)}>Sebelumnya</button><span>{page} / {pages}</span><button aria-label="Halaman berikutnya" disabled={page >= pages} onClick={() => setPage(page + 1)}>Berikutnya</button></nav></div></section>
    <dialog ref={dialog} className="cms-dialog" onCancel={e => { if (saving) e.preventDefault(); }}><header><div><p className="cms-eyebrow">PENDAFTAR SPMB</p><h2>Detail pendaftaran</h2></div><button className="cms-close" aria-label="Tutup detail" disabled={saving} onClick={() => dialog.current?.close()}><CloseIcon aria-hidden="true" /></button></header>{detail && <div className="cms-form-body"><div className="spmb-detail-banner"><strong>{detail.registrationNumber}</strong><p>{detail.academicYear} · Gelombang {detail.waveNumber}</p><small>{dateOnly(detail.waveStartDate)} — {dateOnly(detail.waveEndDate)}</small></div><dl className="spmb-detail-grid">{[["Nama calon siswa", detail.studentName], ["NISN", detail.nisn || "Tidak diisi"], ["Tempat, tanggal lahir", `${detail.birthPlace}, ${dateOnly(detail.birthDate)}`], ["Jenis kelamin", detail.gender], ["Asal sekolah", detail.previousSchool], ["Kelas tujuan", detail.targetGrade], ["Orang tua / wali", detail.guardianName], ["WhatsApp", detail.guardianPhone], ["Email", detail.guardianEmail || "Tidak diisi"], ["Waktu submit (WIB)", dateTime(detail.submittedAt)], ["Alamat", detail.address]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl><PaymentProofDetails key={detail.id} endpoint={`/api/spmb/applications/${detail.id}/payment-proof`} registrationNumber={detail.registrationNumber} accountHolderName={detail.transferAccountName} hasPaymentProof={detail.hasPaymentProof} />{detailError && <p className="cms-error" role="alert">{detailError}</p>}<label>Status pendaftaran<select aria-label="Status pendaftaran" value={newStatus} onChange={e => setNewStatus(e.target.value)}>{statuses.map(s => <option key={s}>{s}</option>)}</select></label></div>}<footer>{detail && <ContactApplicantButton phone={detail.guardianPhone} />}<button className="cms-button-secondary" disabled={saving} onClick={() => dialog.current?.close()}>Tutup</button><button className="cms-button" disabled={saving || newStatus === detail?.status} onClick={() => void saveStatus()}>{saving ? "Menyimpan…" : "Simpan status"}</button></footer></dialog>
  </div>;
}
