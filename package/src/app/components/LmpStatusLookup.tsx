'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { registrationControlClass } from './RegistrationControls'
import LmpStatusResult, { type LmpRegistrationStatus } from './LmpStatusResult'
import { formatDate } from '../lmp/types'

export default function LmpStatusLookup() {
  const [busy, setBusy] = useState(false)
  const [results, setResults] = useState<LmpRegistrationStatus[] | null>(null)
  const [selected, setSelected] = useState<LmpRegistrationStatus | null>(null)
  const [error, setError] = useState('')
  const resultHeading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    if (!results || selected) return
    resultHeading.current?.focus({ preventScroll: true })
    resultHeading.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [results, selected])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (busy) return
    const form = new FormData(event.currentTarget)
    setBusy(true); setError(''); setResults(null); setSelected(null)
    try {
      const response = await fetch('/api/lmp/check-status', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, cache: 'no-store',
        body: JSON.stringify({ studentName: String(form.get('studentName') || '').trim(), nisn: String(form.get('nisn') || '').trim() }), signal: AbortSignal.timeout(15000),
      })
      const payload = await response.json()
      if (!response.ok || !payload.success) throw new Error(payload.message || 'Status belum dapat diperiksa. Coba kembali.')
      const items = payload.data.registrations as LmpRegistrationStatus[]
      setResults(items); if (items.length === 1) setSelected(items[0])
    } catch (e) { setError(e instanceof Error && e.name !== 'TimeoutError' ? e.message : 'Pengecekan terlalu lama. Silakan coba kembali.') }
    finally { setBusy(false) }
  }

  return <>
    <form onSubmit={submit} className='mt-7 rounded-xl border border-slate-200 border-t-[3px] border-t-school-blue bg-white p-5 sm:p-7'>
      <label className='block text-sm font-semibold text-school-navy'>Nama lengkap peserta yang didaftarkan <span className='text-rose-600'>*</span>
        <input name='studentName' required minLength={2} maxLength={150} autoComplete='off' placeholder='Nama lengkap saat mendaftar LMP' className={registrationControlClass + ' mt-2'} />
      </label>
      <label className='mt-5 block text-sm font-semibold text-school-navy'>NISN <span className='text-rose-600'>*</span><input name='nisn' required inputMode='numeric' pattern='[0-9]{10}' maxLength={10} autoComplete='off' placeholder='10 digit NISN' title='NISN harus berisi 10 angka.' className={registrationControlClass + ' mt-2'} /></label>
      <p className='mt-4 text-xs leading-6 text-slate-500'>Masukkan nama lengkap dan NISN sesuai formulir pendaftaran. Jika data lama belum memiliki NISN, hubungi panitia untuk melengkapinya.</p>
      <button disabled={busy} type='submit' className='mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-school-blue px-5 py-3 text-sm font-semibold text-white hover:bg-school-navy disabled:cursor-wait disabled:opacity-60'>
        <svg viewBox='0 0 24 24' className='h-5 w-5' fill='none' stroke='currentColor' strokeWidth='1.8' aria-hidden='true'><circle cx='10.5' cy='10.5' r='6.5' /><path d='m16 16 5 5' strokeLinecap='round' /></svg>
        {busy ? 'Memeriksa…' : 'Cek Status Pendaftaran'}
      </button>
      {error && <p role='alert' className='mt-4 rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-800'>{error}</p>}
    </form>
    {results?.length === 0 && <section role='status' className='mt-6 rounded-xl border border-amber-200 bg-amber-50 p-5 sm:p-7'>
      <h2 ref={resultHeading} tabIndex={-1} className='font-semibold text-amber-950 outline-none'>Data pendaftaran belum ditemukan</h2>
      <p className='mt-2 text-sm leading-7 text-amber-900'>Periksa kembali penulisan nama lengkap peserta dan NISN. Jika sudah mendaftar tetapi data belum ditemukan, hubungi panitia LMP dengan membawa bukti pendaftaran.</p>
      <a href='/lmp#kontak-lmp' className='mt-3 inline-block text-sm font-semibold text-school-blue underline underline-offset-4'>Hubungi panitia LMP</a>
    </section>}
    {results && results.length > 1 && <section className='mt-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-7' aria-labelledby='lmp-matches-heading'>
      <h2 ref={resultHeading} id='lmp-matches-heading' tabIndex={-1} className='text-lg font-bold text-school-navy outline-none'>Pilih data pendaftaran peserta</h2>
      <p className='mt-2 text-sm leading-7 text-slate-600'>Ada beberapa pendaftaran untuk peserta ini. Cocokkan asal sekolah, lomba, dan mata pelajaran sebelum membuka bukti.</p>
      <div className='mt-4 space-y-3'>{results.map(registration => <button key={registration.registrationNumber} type='button' onClick={() => setSelected(registration)} aria-pressed={selected?.registrationNumber === registration.registrationNumber} className={`block w-full rounded-lg border p-4 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-school-blue ${selected?.registrationNumber === registration.registrationNumber ? 'border-school-blue bg-sky-50' : 'border-slate-200 hover:border-school-blue hover:bg-sky-50'}`}>
        <span className='block break-all text-sm font-bold text-school-navy'>{registration.registrationNumber}</span>
        <span className='mt-1 block text-sm leading-6 text-slate-600'>{registration.previousSchool} · Kelas {registration.grade} · {registration.subjects}</span>
        <span className='mt-1 block text-xs leading-6 text-slate-500'>{registration.eventTitle} · {formatDate(registration.competitionDate)}</span>
        <span className='mt-2 block text-sm font-semibold text-school-blue'>Lihat detail pendaftaran →</span>
      </button>)}</div>
    </section>}
    {selected && <LmpStatusResult registration={selected} />}
  </>
}
