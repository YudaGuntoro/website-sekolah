'use client'
import PaymentProofFields, { paymentProofError } from './PaymentProofFields'
import { uppercaseRegistrationInput } from './registration-uppercase'
import LmpRegistrationReceipt from './LmpRegistrationReceipt'
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import { registrationControlClass as input, RegistrationSelect } from './RegistrationControls'
import { formatDate, rupiah, subjects, type LmpInformation, type LmpReceipt } from '../lmp/types'

const label = 'block text-sm font-semibold text-school-navy'
export default function LmpRegistrationForm() {
  const [info, setInfo] = useState<LmpInformation | null>(null)
  const [error, setError] = useState(''); const [loadError, setLoadError] = useState('')
  const [submitting, setSubmitting] = useState(false); const [receipt, setReceipt] = useState<LmpReceipt | null>(null)
  const key = useRef('')
  const load = useCallback(async (signal?: AbortSignal) => {
    try { const response = await fetch('/api/lmp', { cache: 'no-store', signal }); const payload = await response.json(); if (!response.ok || !payload.success) throw new Error(payload.message || 'Informasi belum tersedia.'); setInfo(payload.data); setLoadError('') }
    catch (e) { if (!signal?.aborted) { setInfo(null); setLoadError(e instanceof Error ? e.message : 'Informasi belum dapat dimuat.') } }
  }, [])
  useEffect(() => { const controller = new AbortController(); void load(controller.signal); const timer = setInterval(() => void load(controller.signal), 60000); return () => { controller.abort(); clearInterval(timer) } }, [load])
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!info?.isOpen || submitting) return
    const form = new FormData(event.currentTarget)
    const proofError = paymentProofError(form)
    if (proofError) { setError(proofError); return }
    form.set('transferAccountName', String(form.get('transferAccountName')).trim())
    const file = form.get('document') as File | null
    if (file?.size && (file.size > 2 * 1024 * 1024 || !file.name.toLowerCase().endsWith('.pdf'))) { setError('Unggah berkas PDF maksimal 2 MB.'); return }
    if (file && file.size === 0) form.delete('document')
    if (!key.current) key.current = crypto.randomUUID()
    form.set('submissionKey', key.current); form.set('settingsVersion', String(info.version)); form.set('consent', 'true')
    setSubmitting(true); setError('')
    try {
      const response = await fetch('/api/lmp', { method: 'POST', body: form, signal: AbortSignal.timeout(25000) }); const payload = await response.json()
      if (!response.ok || !payload.success) { if (response.status === 409) await load(); throw new Error(payload.message || 'Pendaftaran belum berhasil.') }
      setReceipt(payload.data)
    } catch (e) { setError(e instanceof Error ? e.message : 'Pengiriman gagal. Coba kembali dari formulir ini.') } finally { setSubmitting(false) }
  }
  if (receipt) return <LmpRegistrationReceipt receipt={receipt} onReset={() => { key.current = ''; setReceipt(null); void load() }} />
  const c = info?.config
  return <div className='space-y-7'>
    <section className='rounded-lg border border-slate-200 bg-white p-6 sm:p-8'><div className='flex flex-wrap justify-between gap-4'><div><p className='text-sm text-school-blue'>Jadwal pendaftaran LMP</p><h2 className='mt-2 text-xl font-semibold text-school-navy'>{c?.registrationStart ? `${formatDate(c.registrationStart)} – ${formatDate(c.registrationEnd)}` : 'Jadwal pendaftaran menyusul'}</h2></div><span className={`text-sm ${info?.isOpen ? 'text-emerald-700' : 'text-amber-800'}`}>{info?.isOpen ? 'Pendaftaran dibuka' : info ? 'Pendaftaran ditutup' : 'Memuat informasi…'}</span></div>{c && <p className='mt-4 text-sm leading-7 text-slate-600'>Pelaksanaan lomba: {formatDate(c.competitionDate)}, {c.competitionTime}. {c.venue}.</p>}{loadError && <p role='alert' className='mt-4 text-sm text-red-700'>{loadError} <button type='button' className='underline' onClick={() => void load()}>Coba lagi</button></p>}{info && !info.isOpen && <p className='mt-5 border-l-2 border-amber-300 bg-amber-50/50 px-4 py-3 text-sm leading-6 text-amber-900'>Pendaftaran belum dibuka atau sudah ditutup. Anda dapat melihat formulir dan menyiapkan data terlebih dahulu.</p>}</section>
    <form onSubmit={submit} onInputCapture={uppercaseRegistrationInput} onCompositionEndCapture={uppercaseRegistrationInput} className='overflow-hidden rounded-md border border-slate-200 border-t-[3px] border-t-school-blue bg-white'><div className='border-b border-slate-200 p-6 sm:px-8'><h2 className='text-xl font-semibold text-school-navy'>Data peserta LMP</h2><p className='mt-1 text-sm text-slate-500'>Kolom bertanda <span className='text-red-600'>*</span> wajib diisi.</p></div><fieldset disabled={!info?.isOpen || submitting} className='min-w-0'>
      <section className='p-6 sm:p-8'><h3 className='mb-6 border-b border-slate-200 pb-3 text-lg font-semibold text-school-navy'><span className='mr-3 text-school-blue'>A.</span>Identitas peserta</h3><div className='grid gap-5 sm:grid-cols-2'><label className={`${label} sm:col-span-2`}>Nama lengkap peserta *<input name='studentName' required maxLength={150} className={input} placeholder='Nama lengkap sesuai dokumen' /></label><label className={label}>Asal sekolah *<input name='previousSchool' required maxLength={150} className={input} placeholder='Nama SD / MI asal' /></label><label className={label}>Kelas *<RegistrationSelect name='grade' required><option value='' disabled>Pilih kelas</option><option value='5'>Kelas 5</option><option value='6'>Kelas 6</option></RegistrationSelect></label><label className={`${label} sm:col-span-2`}>Mata pelajaran *<RegistrationSelect name='subjects' required><option value='' disabled>Pilih satu mata pelajaran</option>{subjects.map(s => <option key={s}>{s}</option>)}</RegistrationSelect></label></div></section>
      <section className='border-t border-slate-100 p-6 sm:p-8'><h3 className='mb-6 border-b border-slate-200 pb-3 text-lg font-semibold text-school-navy'><span className='mr-3 text-school-blue'>B.</span>Kontak Guru Pendamping</h3><div className='grid gap-5 sm:grid-cols-2'><label className={label}>Nama Guru Pendamping *<input name='contactName' required maxLength={150} className={input} placeholder='Nama guru pendamping yang dapat dihubungi' /></label><label className={label}>Nomor WhatsApp *<input name='contactPhone' required type='tel' pattern='[+]?[0-9]{8,15}' maxLength={16} className={input} placeholder='08xxxxxxxxxx' title='Nomor WhatsApp 8–15 digit, tanpa spasi.' /></label></div></section>
      <section className='border-t border-slate-100 p-6 sm:p-8'><h3 className='mb-5 border-b border-slate-200 pb-3 text-lg font-semibold text-school-navy'><span className='mr-3 text-school-blue'>C.</span>Berkas & biaya pendaftaran</h3><p className='mb-4 whitespace-pre-line text-sm leading-7 text-slate-600'>{c?.documentInstructions || 'Persyaratan berkas menyusul.'}</p><label className={label}>Berkas pendaftaran PDF {c?.documentRequired ? '*' : '(opsional)'}<input name='document' type='file' accept='.pdf,application/pdf' required={c?.documentRequired} className='mt-2 block w-full rounded-lg border border-gray-300 text-sm font-normal text-slate-600 file:mr-4 file:border-0 file:border-r file:border-gray-300 file:bg-slate-50 file:px-4 file:py-3 file:text-sm file:font-medium file:text-school-navy' /></label><p className='mt-2 text-xs text-slate-500'>Satu berkas PDF, maksimal 2 MB.</p><div className='mt-6 border-t border-slate-100 pt-5'><h4 className='text-base font-semibold text-school-navy'>Biaya pendaftaran {c ? rupiah(c.feeAmount) : '—'}</h4><p className='mt-2 whitespace-pre-line text-sm leading-7 text-slate-600'>{c?.paymentDetails}</p></div></section>
      <section className='border-t border-slate-100 p-6 sm:p-8'><h3 className='mb-6 border-b border-slate-200 pb-3 text-lg font-semibold text-school-navy'><span className='mr-3 text-school-blue'>D.</span>Konfirmasi pembayaran</h3><PaymentProofFields contactRole='guru pendamping' /></section>
      <div className='border-t border-slate-200 p-6 sm:p-8'><label className='flex items-start gap-3 text-sm leading-7 text-slate-600'><input type='checkbox' name='consent' required className='mt-1.5 h-4 w-4 shrink-0 accent-blue-700' /><span>Data yang saya isi benar dan saya bersedia dihubungi panitia melalui WhatsApp untuk keperluan LMP.</span></label><div className='mt-6 flex flex-wrap items-center justify-between gap-4'><a href='/lmp' className='text-sm font-medium text-school-blue'>← Informasi LMP</a><button disabled={submitting || !info?.isOpen} type='submit' className='min-h-11 rounded-lg bg-school-blue px-6 py-3 text-sm font-semibold text-white hover:bg-school-navy disabled:cursor-not-allowed disabled:opacity-50'>{submitting ? 'Mengirim…' : 'Kirim pendaftaran LMP'}</button></div></div>
    </fieldset>{error && <p role='alert' className='m-6 rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700'>{error}</p>}</form>
  </div>
}
