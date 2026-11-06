"use client";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import { useToast } from "@/context/ToastContext";
import { getStoredUser } from "@/lib/auth";
import { CloseIcon } from "@/icons";
import RowActions from "@/components/common/RowActions";
import ImageCompressionNotice from "@/components/common/ImageCompressionNotice";
import { collections, CollectionKey, ContentEntry, formatDate, slugify, websiteUrl } from "./collections";
type EditorForm = Pick<ContentEntry, "title" | "slug" | "category" | "summary" | "body" | "imageUrl" | "postUrl" | "status" | "sortOrder" | "version">;
const emptyForm = (): EditorForm => ({ title: "", slug: "", category: "", summary: "", body: "", imageUrl: "", postUrl: "", status: "Draft", sortOrder: 0, version: 0 });
export default function ContentManager({ collection }: { collection: CollectionKey }) {
  const config = collections.find(c => c.key === collection)!;
  const isGreeting = collection === "sambutan";
  const isSocial = collection === "instagram" || collection === "tiktok";
  const platform = collection === "instagram" ? "Instagram" : "TikTok";
  const toast = useToast();
  const [entries, setEntries] = useState<ContentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<ContentEntry | "new" | null>(null);
  const [form, setForm] = useState<EditorForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editorError, setEditorError] = useState("");
  const [canEdit, setCanEdit] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { setEntries(await apiGet<ContentEntry[]>(`/api/cms/content/${collection}`)); }
    catch (err) { setError(err instanceof Error ? err.message : "Gagal memuat konten."); }
    finally { setLoading(false); }
  }, [collection]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { setCanEdit(["ADMIN", "SUPERVISOR", "OPERATOR"].includes(getStoredUser()?.role || "")); }, []);
  const open = (entry?: ContentEntry) => { if (!canEdit) return; setEditorError(""); setEditing(entry || "new"); setForm(entry ? { ...entry } : emptyForm()); dialog.current?.showModal(); };
  const close = () => { if (!saving) { dialog.current?.close(); setEditing(null); } };
  const change = <K extends keyof EditorForm>(key: K, value: EditorForm[K]) => setForm(prev => ({ ...prev, [key]: value }));
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setEditorError(""); setSaving(true);
    const payload = { ...form, publishedAt: editing && editing !== "new" ? editing.publishedAt : null };
    try {
      if (editing && editing !== "new") await apiPut(`/api/cms/content/${collection}/${editing.id}`, payload);
      else await apiPost(`/api/cms/content/${collection}`, payload);
      if (editing === "new") { setPage(1); setSearch(""); setStatus("all"); }
      dialog.current?.close(); setEditing(null);
      toast.success({ message: form.status === "Published" ? "Konten diterbitkan ke website." : "Draf berhasil disimpan." }); await load();
    } catch (err) { setEditorError(err instanceof Error ? err.message : "Gagal menyimpan konten."); }
    finally { setSaving(false); }
  };
  const remove = async (entry: ContentEntry) => {
    if (!await toast.confirm({ destructive: true, title: "Hapus konten?", message: `“${entry.title}” akan dihapus dari dashboard dan website.`, confirmText: "Hapus", cancelText: "Batal" })) return;
    try { await apiDelete(`/api/cms/content/${collection}/${entry.id}`); toast.success({ message: "Konten dihapus." }); await load(); }
    catch (err) { toast.error({ message: err instanceof Error ? err.message : "Gagal menghapus konten." }); }
  };
  const filtered = entries.filter(e => (status === "all" || e.status === status) && `${e.title} ${e.category}`.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const firstIndex = (currentPage - 1) * pageSize;
  const visibleEntries = filtered.slice(firstIndex, firstIndex + pageSize);
  const published = entries.filter(e => e.status === "Published").length;
  return <div className="cms-page">
    <div className="cms-page-heading"><div><p className="cms-eyebrow">PENGELOLAAN KONTEN</p><h1>{config.name}</h1><p>{config.description}</p></div><div className="cms-actions"><a className="cms-button-secondary" href={`${websiteUrl}${config.path}`} target="_blank" rel="noreferrer">Lihat website ↗</a></div></div>
    <div className="cms-stat-strip"><span><strong>{entries.length}</strong> Total konten</span><span><i className="cms-dot" /><strong>{published}</strong> Terbit</span><span><i className="cms-dot draft" /><strong>{entries.length - published}</strong> Draf</span></div>
    <section className="cms-panel cms-data-panel"><div className="cms-toolbar"><div className="cms-toolbar-start"><label className="cms-page-size">Tampilkan <select aria-label="Jumlah baris" value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}><option value={10}>10</option><option value={25}>25</option><option value={50}>50</option></select> baris</label>{canEdit && <button className="cms-create-button" onClick={() => open()}><span aria-hidden="true">+</span> Tambah</button>}</div><div className="cms-toolbar-end"><select aria-label="Filter status" value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}><option value="all">Semua status</option><option value="Published">Terbit</option><option value="Draft">Draf</option></select><label className="cms-search">Cari <input aria-label="Cari konten" placeholder={`Cari ${config.name.toLowerCase()}...`} value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} /></label></div></div>
      {loading ? <p className="cms-empty" role="status">Memuat konten…</p> : error ? <div className="cms-empty" role="alert"><p>{error}</p><button onClick={() => void load()} className="cms-button-secondary">Coba lagi</button></div> : !filtered.length ? <div className="cms-empty"><span className="cms-empty-icon">▤</span><h2>{entries.length ? "Konten tidak ditemukan" : `Belum ada ${config.name.toLowerCase()}`}</h2><p>{entries.length ? "Coba kata pencarian atau status lain." : "Mulai tambahkan konten untuk website sekolah."}</p>{!entries.length && canEdit && <button className="cms-button" onClick={() => open()}>+ Tambah konten pertama</button>}</div> : <div className="cms-table-wrap"><table className="cms-table"><colgroup><col className="cms-col-title" /><col className="cms-col-category" /><col className="cms-col-status" /><col className="cms-col-date" /><col className="cms-col-actions" /></colgroup><thead><tr><th scope="col">{config.title}</th><th scope="col">{isSocial ? "URL postingan" : isGreeting ? "Jabatan" : "Kategori"}</th><th scope="col">Status</th><th scope="col">Diperbarui</th><th scope="col">Aksi</th></tr></thead><tbody>{visibleEntries.map(entry => <tr key={entry.id}><td><button className="cms-title-link" onClick={() => open(entry)} title={entry.title}>{entry.title}</button></td><td>{isSocial ? <a className="block max-w-64 truncate text-brand-500 hover:underline" href={entry.postUrl} target="_blank" rel="noopener noreferrer" title={entry.postUrl}>{entry.postUrl}</a> : entry.category || "Umum"}</td><td><span className={`cms-badge ${entry.status === "Published" ? "published" : "draft"}`}>{entry.status === "Published" ? "Terbit" : "Draf"}</span></td><td className="cms-nowrap">{formatDate(entry.updatedAt)}</td><td>{canEdit && <RowActions className="cms-table-actions" onEdit={() => open(entry)} onDelete={() => void remove(entry)} editLabel={`Update ${entry.title}`} deleteLabel={`Delete ${entry.title}`} />}</td></tr>)}</tbody></table></div>}
      <div className="cms-table-footer"><span>Menampilkan {filtered.length ? firstIndex + 1 : 0} - {Math.min(firstIndex + pageSize, filtered.length)} dari {filtered.length} konten</span><nav className="cms-pagination" aria-label="Navigasi halaman tabel"><button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)} aria-label="Halaman sebelumnya">Sebelumnya</button><span>{currentPage} / {totalPages}</span><button disabled={currentPage === totalPages} onClick={() => setPage(currentPage + 1)} aria-label="Halaman berikutnya">Berikutnya</button></nav></div></section>
    <dialog className="cms-dialog" ref={dialog} onCancel={e => { if (saving) e.preventDefault(); else setEditing(null); }}><form onSubmit={save}>
      <header><div><p className="cms-eyebrow">{config.name}</p><h2>{editing === "new" ? "Tambah konten" : "Edit konten"}</h2></div><button type="button" className="cms-close" onClick={close} disabled={saving} aria-label="Tutup formulir"><CloseIcon aria-hidden="true" /></button></header>
      <div className="cms-form-body">{editorError && <p role="alert" className="cms-error">{editorError}</p>}<label>{config.title} *<input autoFocus required maxLength={200} value={form.title} onChange={e => { const title = e.target.value; setForm(prev => ({ ...prev, title, slug: prev.slug === slugify(prev.title) ? slugify(title) : prev.slug })); }} /></label>
        <div className="cms-form-grid"><label>Slug URL *<input required maxLength={220} pattern="[a-z0-9]+(-[a-z0-9]+)*" value={form.slug} onChange={e => change("slug", e.target.value)} /><small>Huruf kecil, angka, dan tanda hubung.</small></label><label>{config.category}<input maxLength={200} value={form.category} onChange={e => change("category", e.target.value)} /></label></div>
        {isSocial && <label>URL postingan {platform} *<input type="url" required maxLength={1000} placeholder={collection === "instagram" ? "https://www.instagram.com/p/.../" : "https://www.tiktok.com/@akun/video/..."} value={form.postUrl} onChange={e => change("postUrl", e.target.value)} /><small>Tempel tautan postingan. Kartu website akan membuka tautan ini di tab baru.</small></label>}
        {!isGreeting && <label>Ringkasan<textarea rows={3} maxLength={1000} value={form.summary} onChange={e => change("summary", e.target.value)} /><small>Deskripsi singkat pada kartu website.</small></label>}
        {!isSocial && <label>{config.body}<textarea rows={9} maxLength={100000} value={form.body} onChange={e => change("body", e.target.value)} /><small>{isGreeting ? "Pisahkan paragraf dengan baris kosong. Dua paragraf pertama tampil sebagai pembuka, sisanya melalui tombol Baca sambutan lengkap." : "Pisahkan paragraf dengan baris kosong."}</small></label>}
        <label>{isGreeting ? "URL foto kepala sekolah" : "URL gambar / foto"}<input maxLength={500} placeholder="https://… atau /images/…" value={form.imageUrl} onChange={e => change("imageUrl", e.target.value)} /><small>Gunakan gambar yang sudah dihosting atau path gambar website sekolah.</small></label>
        <ImageCompressionNotice />
        <div className="cms-form-grid"><label>Status<select value={form.status} onChange={e => change("status", e.target.value as EditorForm["status"])}><option value="Draft">Draf</option><option value="Published">Terbit</option></select></label></div>
      </div><footer><button className="cms-button-secondary" type="button" onClick={close} disabled={saving}>Batal</button><button className="cms-button" disabled={saving}>{saving ? "Menyimpan…" : form.status === "Published" ? "Simpan & terbitkan" : "Simpan draf"}</button></footer>
    </form></dialog>
  </div>;
}
