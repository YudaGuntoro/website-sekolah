"use client";
import { useState } from "react";
import { useToast } from "@/context/ToastContext";

type Props = { module: "spmb" | "lmp"; filters: Record<string, string> };
export default function ExportApplicantsButton({ module, filters }: Props) {
  const [exporting, setExporting] = useState(false);
  const toast = useToast();
  async function download() {
    if (exporting) return;
    setExporting(true);
    try {
      const query = new URLSearchParams(filters);
      const response = await fetch(`/api/${module}/applications/export?${query}`, { credentials: "same-origin", cache: "no-store" });
      if (!response.ok) throw new Error(response.status === 401 ? "Sesi login berakhir. Silakan masuk kembali." : "Laporan gagal diunduh. Silakan coba kembali.");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = /filename\*?=(?:UTF-8''|")?([^";]+)/i.exec(response.headers.get("content-disposition") || "")?.[1] || `pendaftar-${module}.xlsx`;
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      toast.success({ message: "Laporan pendaftar berhasil diunduh sesuai filter." });
    } catch (error) { toast.error({ message: error instanceof Error ? error.message : "Laporan gagal diunduh." }); }
    finally { setExporting(false); }
  }
  return <button type="button" className="cms-button-secondary cms-export-applicants" disabled={exporting} onClick={() => void download()} aria-busy={exporting} title="Unduh seluruh pendaftar sesuai filter dan pencarian">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 3v12m-4-4 4 4 4-4M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4" /></svg>
    {exporting ? "Mengunduh..." : "Export XLSX"}
  </button>;
}
