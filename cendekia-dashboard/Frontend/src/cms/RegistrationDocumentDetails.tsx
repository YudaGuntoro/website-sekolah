"use client";
import { useState } from "react";
export default function RegistrationDocumentDetails({ endpoint, registrationNumber, hasDocument }: { endpoint: string; registrationNumber: string; hasDocument: boolean }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  async function download() {
    if (downloading) return;
    setDownloading(true); setError("");
    try {
      const response = await fetch(endpoint, { credentials: "same-origin", cache: "no-store" });
      if (!response.ok) throw new Error("PDF persyaratan tidak dapat diunduh. Periksa sesi login Anda.");
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement("a"); link.href = url; link.download = `${registrationNumber}-persyaratan.pdf`; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (e) { setError(e instanceof Error ? e.message : "Gagal mengunduh PDF persyaratan."); }
    finally { setDownloading(false); }
  }
  return <section className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800"><h3 className="font-semibold">Berkas persyaratan</h3>
    {hasDocument ? <button type="button" className="cms-button-secondary mt-3" disabled={downloading} onClick={() => void download()}>{downloading ? "Mengunduh..." : "Unduh PDF persyaratan"}</button> : <p className="mt-3 text-sm text-slate-500">PDF persyaratan belum tersedia untuk pendaftaran ini.</p>}
    {error && <p role="alert" className="cms-error mt-3">{error}</p>}
  </section>;
}
