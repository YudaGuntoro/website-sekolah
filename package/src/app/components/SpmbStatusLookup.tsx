'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import PrintReceiptButton from './PrintReceiptButton'
import { registrationControlClass } from './RegistrationControls'

type Registration = {
  registrationNumber: string; studentName: string; nisn: string; academicYear: string; waveNumber: number;
  submittedAt: string; previousSchool: string; targetGrade: string; status: string; paymentStatus: string; whatsappGroupUrl: string;
}
type LookupResult = { found: false } | { found: true; registration: Registration }
const statusText: Record<string, string> = {
  Baru: 'Pendaftaran sudah diterima dan menunggu pemeriksaan staf sekolah.',
  Diproses: 'Pendaftaran sedang diperiksa oleh staf sekolah.',
  Diterima: 'Calon murid dinyatakan diterima. Hubungi panitia untuk tahapan berikutnya.',
  Ditolak: 'Pendaftaran belum dapat diterima. Hubungi panitia untuk informasi lebih lanjut.',
}
const statusStyle: Record<string, string> = { Baru: 'bg-sky-50 text-school-blue', Diproses: 'bg-amber-50 text-amber-800', Diterima: 'bg-emerald-50 text-emerald-800', Ditolak: 'bg-rose-50 text-rose-800' }

export default function SpmbStatusLookup() {
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<LookupResult | null>(null)
  const [error, setError] = useState('')
  const resultHeading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    if (!result) return
    resultHeading.current?.focus({ preventScroll: true })
    resultHeading.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [result])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    const fields = new FormData(event.currentTarget)
    setBusy(true); setError(''); setResult(null)
    try {
      const response = await fetch('/api/spmb/check-status', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store',
        body: JSON.stringify({ studentName: String(fields.get('studentName') || '').trim(), nisn: String(fields.get('nisn') || '').trim() }),
        signal: AbortSignal.timeout(15000),
      })
      const payload = await response.json()
      if (!response.ok || !payload.success) throw new Error(payload.message || 'Status belum dapat diperiksa. Coba kembali.')
      setResult(payload.data as LookupResult)
    } catch (e) { setError(e instanceof Error && e.name !== 'TimeoutError' ? e.message : 'Pengecekan terlalu lama. Silakan coba kembali.') }
    finally { setBusy(false) }
  }

  const registration = result?.found ? result.registration : null
  const details = registration ? [
    ['Nama lengkap calon murid', registration.studentName], ['NISN', registration.nisn],
    ['Asal sekolah', registration.previousSchool], ['Kelas yang dituju', `Kelas ${registration.targetGrade}`],
    ['Status pembayaran', registration.paymentStatus], ['Tahun ajaran', registration.academicYear], ['Gelombang', String(registration.waveNumber)],
    ['Waktu pendaftaran', new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Asia/Jakarta' }).format(new Date(/(?:Z|[+-]\d{2}:\d{2})$/.test(registration.submittedAt) ? registration.submittedAt : registration.submittedAt + 'Z')) + ' WIB'],
  ] : []

  return <>
    <form onSubmit={submit} className='mt-7 rounded-xl border border-slate-200 border-t-[3px] border-t-school-blue bg-white p-5 sm:p-7'>
      <div className='grid gap-5 sm:grid-cols-[1.4fr_1fr]'>
        <label className='block text-sm font-semibold text-school-navy'>Nama lengkap calon murid yang didaftarkan <span className='text-rose-600'>*</span>
          <input name='studentName' required minLength={2} maxLength={150} autoComplete='off' placeholder='Nama lengkap saat mendaftar' className={registrationControlClass + ' mt-2'} />
        </label>
        <label className='block text-sm font-semibold text-school-navy'>NISN <span className='text-rose-600'>*</span>
          <input name='nisn' required pattern='[0-9]{10}' maxLength={10} inputMode='numeric' autoComplete='off' placeholder='10 digit NISN' title='NISN harus berisi 10 angka.' className={registrationControlClass + ' mt-2'} />
        </label>
      </div>
      <p className='mt-4 text-xs leading-6 text-slate-500'>Gunakan nama lengkap dan NISN yang sama dengan formulir pendaftaran. Hasil menampilkan pendaftaran terbaru yang cocok.</p>
      <button disabled={busy} type='submit' className='mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-school-blue px-5 py-3 text-sm font-semibold text-white hover:bg-school-navy disabled:cursor-wait disabled:opacity-60'>
        <svg viewBox='0 0 24 24' className='h-5 w-5' fill='none' stroke='currentColor' strokeWidth='1.8' aria-hidden='true'><circle cx='10.5' cy='10.5' r='6.5' /><path d='m16 16 5 5' strokeLinecap='round' /></svg>
        {busy ? 'Memeriksa…' : 'Cek Status Pendaftaran'}
      </button>
      {error && <p role='alert' className='mt-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-800'>{error}</p>}
    </form>
    {result && !result.found && <section role='status' className='mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 sm:p-7'>
      <h2 ref={resultHeading} tabIndex={-1} className='font-semibold text-amber-950 outline-none'>Data pendaftaran belum ditemukan</h2>
      <p className='mt-2 text-sm leading-7 text-amber-900'>Periksa kembali penulisan nama lengkap dan NISN. Jika Anda sudah mendaftar tetapi data belum ditemukan, hubungi panitia SPMB dengan membawa bukti pendaftaran.</p>
      <a href='/spmb#kontak-spmb' className='mt-3 inline-block text-sm font-semibold text-school-blue underline underline-offset-4'>Hubungi panitia</a>
    </section>}
    {registration && <section className='registration-receipt mt-6 rounded-xl border border-slate-200 border-t-[3px] border-t-emerald-600 bg-white p-5 sm:p-7' aria-labelledby='lookup-result-heading'>
      <p className='receipt-print-heading hidden'>SMPIT Cendekia Purwakarta — Bukti Pendaftaran SPMB</p>
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div><h2 ref={resultHeading} id='lookup-result-heading' tabIndex={-1} className='text-xl font-bold text-school-navy outline-none'>Calon murid sudah terdaftar</h2><p className='mt-2 text-sm leading-6 text-slate-500'>Data pendaftaran ditemukan dalam sistem sekolah.</p></div>
        <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyle[registration.status] || 'bg-slate-100 text-slate-700'}`}>{registration.status}</span>
      </div>
      <div className='my-5 rounded-lg border border-slate-200 bg-slate-50 p-4'><p className='text-xs text-slate-500'>Nomor pendaftaran</p><p className='mt-2 break-all font-mono text-xl font-bold text-school-navy'>{registration.registrationNumber}</p></div>
      <dl className='grid gap-x-6 sm:grid-cols-2'>{details.map(([label, value]) => <div key={label} className='min-w-0 border-b border-slate-100 py-3'><dt className='text-xs text-slate-500'>{label}</dt><dd className='mt-1 break-words text-sm font-medium leading-6 text-school-navy'>{value}</dd></div>)}</dl>
      <p className='mt-5 rounded-lg border border-sky-100 bg-sky-50 p-4 text-sm leading-7 text-school-navy'>{statusText[registration.status] || 'Hubungi panitia untuk informasi status pendaftaran.'}</p>
      <aside aria-label='Informasi grup WhatsApp pendaftaran' className='mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 sm:p-5'>
        <h3 className='font-semibold text-school-navy'>Grup WhatsApp Pendaftaran Gelombang {registration.waveNumber}</h3>
        {registration.whatsappGroupUrl ? <>
          <p className='mt-2 text-sm leading-7 text-slate-600'>Untuk informasi lebih lanjut mengenai tahapan pendaftaran, silakan bergabung dengan grup WhatsApp pendaftaran Gelombang {registration.waveNumber} tahun ajaran {registration.academicYear}.</p>
          <a href={registration.whatsappGroupUrl} target='_blank' rel='noopener noreferrer' className='receipt-no-print mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800'>
            <svg viewBox='0 0 24 24' className='h-5 w-5 shrink-0' fill='none' stroke='currentColor' strokeWidth='1.7' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'><path d='M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.4-4.8a8.5 8.5 0 1 1 16.1-4.1Z' /><path d='m8 7 2 3-1.3 1.3a10 10 0 0 0 4 4L14 14l3 2c-.5 1.5-1.5 2-3 1.5C10 16.3 7.7 14 6.5 10 6 8.5 6.5 7.5 8 7Z' /></svg>
            Gabung grup WhatsApp Gelombang {registration.waveNumber}
          </a>
          <p className='mt-3 text-xs leading-6 text-slate-500'>Tautan grup WhatsApp:</p>
          <a href={registration.whatsappGroupUrl} target='_blank' rel='noopener noreferrer' className='block break-all text-sm font-medium leading-6 text-emerald-800 underline underline-offset-4'>{registration.whatsappGroupUrl}</a>
        </> : <>
          <p className='mt-2 text-sm leading-7 text-slate-600'>Tautan grup WhatsApp pendaftaran Gelombang {registration.waveNumber} tahun ajaran {registration.academicYear} belum tersedia. Silakan hubungi panitia untuk mendapatkan tautan grup dan informasi tahapan pendaftaran berikutnya.</p>
          <a href='/spmb#kontak-spmb' className='receipt-no-print mt-3 inline-block text-sm font-semibold text-school-blue underline underline-offset-4'>Hubungi panitia SPMB</a>
        </>}
      </aside>
      <p className='mt-5 text-xs leading-6 text-slate-500'>Bukti ini menunjukkan data pendaftaran sudah tercatat. Status penerimaan mengikuti keputusan sekolah, bukan konfirmasi pembayaran.</p>
      <div className='receipt-no-print mt-5 flex flex-wrap items-center gap-4'><PrintReceiptButton /><a href='/spmb' className='text-sm font-semibold text-school-blue hover:underline'>Informasi SPMB</a></div>
    </section>}
  </>
}
