"use client";
import { useState } from "react";

export default function PaymentProofDetails({ endpoint, registrationNumber, accountHolderName, hasPaymentProof }: { endpoint: string; registrationNumber: string; accountHolderName: string | null; hasPaymentProof: boolean }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState("");
  async function download() {
    if (downloading) return;
    setDownloading(true); setError("");
    try {
      const response = await fetch(endpoint, { credentials: "same-origin", cache: "no-store" });
      if (!response.ok) throw new Error("Bukti transfer tidak dapat diunduh. Periksa sesi login Anda.");
      const blob = await response.blob();
      const extension = blob.type === "image/png" ? "png" : blob.type === "image/jpeg" ? "jpg" : "pdf";
      const url = URL.createObjectURL(blob); const link = document.createElement("a");
      link.href = url; link.download = `${registrationNumber}-bukti-transfer.${extension}`; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    } catch (e) { setError(e instanceof Error ? e.message : "Gagal mengunduh bukti transfer."); }
    finally { setDownloading(false); }
  }
  return <section className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800">
    <h3 className="font-semibold">Konfirmasi pembayaran</h3>
    <dl className="mt-3"><dt className="text-xs text-slate-500 dark:text-slate-400">Nama pemilik rekening pengirim</dt><dd className="mt-1 break-words text-sm font-medium">{accountHolderName || "Belum tersedia (pendaftaran lama)"}</dd></dl>
    {hasPaymentProof ? <button type="button" className="cms-button-secondary mt-4" disabled={downloading} onClick={() => void download()}>{downloading ? "Mengunduh?" : "Unduh bukti transfer"}</button> : <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Bukti transfer belum tersedia untuk pendaftaran ini.</p>}
    <p className="mt-3 text-xs leading-6 text-slate-500 dark:text-slate-400">Cocokkan nama rekening pengirim, nominal, dan tanggal transfer dengan mutasi rekening sekolah. Bukti unggahan belum merupakan verifikasi pembayaran.</p>
    {error && <p role="alert" className="cms-error mt-3">{error}</p>}
  </section>;
}
