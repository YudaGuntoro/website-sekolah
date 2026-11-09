"use client";
import { ArrowUpIcon, ArrowDownIcon, TrashBinIcon } from "@/icons";
export type RegistrationStep = { title: string; description: string; icon: string; showPayment: boolean };
const icons = [
  { key: "register", name: "Daftar", path: "M8 3H4v18h16V3h-4M9 2h6v4H9zM8 11h8M8 15h5" },
  { key: "folder", name: "Berkas", path: "M3 7V4h6l2 3h10v13H3V7ZM3 10h18" },
  { key: "payment", name: "Biaya", path: "M3 5h18v14H3zM3 9h18M7 15h3m5 0h2" },
  { key: "test", name: "Tes", path: "M8 3H4v18h16V3h-4M9 2h6v4H9zM8 13l3 3 5-6" },
  { key: "check", name: "Selesai", path: "M21 11v1a9 9 0 1 1-5.3-8.2M9 11l3 3L22 4" },
  { key: "book", name: "Buku", path: "M12 6C9 4 5 4 2 5v14c3-1 7-1 10 1 3-2 7-2 10-1V5c-3-1-7-1-10 1Zm0 0v14" },
] as const;

export default function RegistrationStepsEditor({ steps, onChange }: { steps: RegistrationStep[]; onChange: (steps: RegistrationStep[]) => void }) {
  function editStep(index: number, fields: Partial<RegistrationStep>) {
    onChange(steps.map((step, i) => i === index ? { ...step, ...fields } : fields.showPayment ? { ...step, showPayment: false } : step));
  }
  function move(index: number, direction: number) {
    const next = [...steps];
    if (index + direction < 0 || index + direction >= next.length) return;
    [next[index], next[index + direction]] = [next[index + direction], next[index]];
    onChange(next);
  }
  return (
        <section className="cms-panel overflow-hidden"><div className="cms-section-heading"><div><h2>Alur Pendaftaran</h2><p>Atur judul, penjelasan, ikon, dan urutan tahap.</p></div><span>{steps.length} tahap</span></div>
          <div className="grid min-w-0 gap-5 p-4 sm:p-6">{steps.map((step, index) => <div key={index} className="min-w-0 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between gap-3 rounded-t-xl bg-slate-50 px-4 py-3 dark:bg-slate-800"><h3 className="font-semibold">Tahap {index + 1}</h3><div className="flex gap-1">
              <button type="button" aria-label={`Naikkan tahap ${index + 1}`} disabled={index === 0} className="spmb-editor-icon-button" onClick={() => move(index, -1)}><ArrowUpIcon className="h-5 w-5" /></button>
              <button type="button" aria-label={`Turunkan tahap ${index + 1}`} disabled={index === steps.length - 1} className="spmb-editor-icon-button" onClick={() => move(index, 1)}><ArrowDownIcon className="h-5 w-5" /></button>
              <button type="button" aria-label={`Hapus tahap ${index + 1}`} disabled={steps.length === 1} className="spmb-editor-icon-button text-rose-500" onClick={() => onChange(steps.filter((_, i) => i !== index))}><TrashBinIcon className="h-5 w-5" /></button>
            </div></div>
            <div className="cms-form-body"><label>Judul tahap {index + 1}<input required maxLength={150} value={step.title} onChange={e => editStep(index, { title: e.target.value })} /></label><label>Penjelasan tahap {index + 1}<textarea rows={3} maxLength={3000} value={step.description} onChange={e => editStep(index, { description: e.target.value })} /></label>
              <div><p className="mb-3 text-sm font-semibold">Pilih ikon tahap {index + 1}</p><div className="grid grid-cols-3 gap-2 sm:grid-cols-6">{icons.map(icon => <button type="button" key={icon.key} aria-label={`Ikon ${icon.name} tahap ${index + 1}`} aria-pressed={step.icon === icon.key} onClick={() => editStep(index, { icon: icon.key })} className={`flex min-w-0 flex-col items-center gap-2 rounded-lg border px-2 py-3 text-xs ${step.icon === icon.key ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-200" : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"}`}><svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={icon.path} /></svg>{icon.name}</button>)}</div></div>
            </div><div className="px-6 pb-5"><label className="flex items-start gap-3 text-sm"><input type="checkbox" className="mt-1 h-4 w-4" checked={step.showPayment} onChange={e => editStep(index, { showPayment: e.target.checked })} /><span>Tampilkan rincian biaya pada tahap ini.</span></label></div>
          </div>)}<button type="button" disabled={steps.length >= 20} className="cms-button-secondary justify-self-start" onClick={() => onChange([...steps, { title: "", description: "", icon: "register", showPayment: false }])}>+ Tambah tahap</button></div>
        </section>
  );
}
