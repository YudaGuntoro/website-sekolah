'use client'
import { useEffect, useRef } from 'react'
import { formatDate, rupiah, type LmpReceipt } from '../lmp/types'

const submittedAt = (value: string) => new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Asia/Jakarta' }).format(new Date(/(?:Z|[+-]\d{2}:\d{2})$/.test(value) ? value : `${value}Z`))

export default function LmpRegistrationReceipt({ receipt, onReset }: { receipt: LmpReceipt; onReset: () => void }) {
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    heading.current?.focus({ preventScroll: true })
    heading.current?.parentElement?.scrollIntoView({ block: 'start', behavior: 'instant' })
  }, [])
  const details = [
    ['Nama lengkap peserta', receipt.studentName],
    ['Asal sekolah', receipt.previousSchool],
    ['Kelas', `Kelas ${receipt.grade} SD / MI`],
    ['Mata pelajaran', receipt.subjects],
    ['Nama orang tua / pendamping', receipt.contactName],
    ['WhatsApp orang tua / pendamping', receipt.contactPhone],
    ['Berkas pendaftaran', receipt.hasDocument ? 'PDF berhasil diunggah' : 'Tidak ada berkas yang diunggah'],
    ['Status pembayaran', receipt.paymentStatus],
    ['Nama pemilik rekening pengirim', receipt.transferAccountName || 'Belum tersedia'],
    ['Bukti transfer', receipt.hasPaymentProof ? 'Berhasil diunggah, menunggu pemeriksaan staf' : 'Belum tersedia'],
  ]
  return <section aria-labelledby='lmp-receipt-title' className='mx-auto max-w-3xl scroll-mt-28 rounded-lg border border-slate-200 border-t-4 border-t-emerald-600 bg-white p-5 sm:p-8'>
    <div role='status' className='flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4'>
      <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' aria-hidden='true' className='mt-0.5 h-6 w-6 shrink-0 text-emerald-700'><circle cx='12' cy='12' r='9' /><path d='m8 12 3 3 5-6' strokeLinecap='round' strokeLinejoin='round' /></svg>
      <div><p className='font-semibold text-emerald-800'>Pendaftaran LMP berhasil!</p><p className='mt-1 text-sm leading-6 text-emerald-900'><strong>{receipt.studentName}</strong> berhasil didaftarkan sebagai peserta {receipt.eventTitle}.</p></div>
    </div>
    <h2 ref={heading} id='lmp-receipt-title' tabIndex={-1} className='mt-6 scroll-mt-28 text-2xl font-semibold text-school-navy outline-none'>Data peserta telah diterima</h2>
    <p className='mt-2 text-sm leading-6 text-slate-600'>Berikut ringkasan data yang berhasil disimpan oleh sekolah.</p>
    <div className='my-6 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:p-5'>
      <p className='text-xs font-medium text-slate-500'>Nomor pendaftaran</p><p className='mt-2 break-all font-mono text-xl font-semibold text-school-navy sm:text-2xl'>{receipt.registrationNumber}</p>
      <dl className='mt-4 grid gap-4 border-t border-slate-200 pt-4 text-sm sm:grid-cols-2'>
        <div className='sm:col-span-2'><dt className='text-slate-500'>Lomba</dt><dd className='mt-1 font-semibold text-school-navy'>{receipt.eventTitle}</dd></div>
        <div><dt className='text-slate-500'>Tanggal pelaksanaan</dt><dd className='mt-1 text-school-navy'>{formatDate(receipt.competitionDate)}</dd></div>
        <div><dt className='text-slate-500'>Biaya pendaftaran</dt><dd className='mt-1 text-school-navy'>{rupiah(receipt.feeAmount)}</dd></div>
        <div className='sm:col-span-2'><dt className='text-slate-500'>Waktu pendaftaran</dt><dd className='mt-1 text-school-navy'>{submittedAt(receipt.submittedAt)} WIB</dd></div>
      </dl>
    </div>
    <h3 className='text-lg font-semibold text-school-navy'>Ringkasan data peserta</h3>
    <dl className='mt-2 grid gap-x-8 sm:grid-cols-2'>{details.map(([title, value]) => <div key={title} className='min-w-0 border-b border-slate-100 py-3'><dt className='text-xs leading-5 text-slate-500'>{title}</dt><dd className='mt-1 whitespace-pre-line break-words text-sm font-medium leading-6 text-school-navy'>{value}</dd></div>)}</dl>
    <aside aria-label='Simpan bukti pendaftaran' className='my-6 rounded-lg border border-amber-200 bg-amber-50 p-4'>
      <h3 className='font-semibold text-amber-950'>Jangan lupa screenshot halaman ini</h3><p className='mt-2 text-sm leading-6 text-amber-950'>Simpan tangkapan layar yang memuat nomor pendaftaran dan ringkasan data sebagai bukti bahwa Anda sudah mendaftar. Jika ada kendala, tunjukkan bukti ini kepada panitia agar pendaftaran Anda lebih mudah ditelusuri.</p><p className='mt-2 text-xs leading-6 text-amber-900'>Ambil screenshot sebelum menutup halaman atau mendaftarkan peserta lain.</p>
    </aside>
    {receipt.whatsappGroupUrl ? <aside aria-label='Langkah berikutnya' className='mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-5'>
      <h3 className='font-semibold text-school-navy'>Selanjutnya, gabung grup WhatsApp LMP</h3><p className='mt-2 text-sm leading-7 text-slate-600'>Silakan bergabung ke grup WhatsApp LMP untuk mendapatkan informasi berkas, pembayaran, dan petunjuk pelaksanaan lomba dari panitia.</p>
      <a href={receipt.whatsappGroupUrl} target='_blank' rel='noopener noreferrer' className='mt-4 inline-flex min-h-11 items-center justify-center rounded-md bg-emerald-700 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-emerald-800'>Gabung grup WhatsApp LMP</a>
      <p className='mt-4 text-xs leading-6 text-slate-600'>Tautan grup WhatsApp:<a href={receipt.whatsappGroupUrl} target='_blank' rel='noopener noreferrer' className='mt-1 block break-all text-sm font-medium text-emerald-800 underline underline-offset-4 hover:text-emerald-950'>{receipt.whatsappGroupUrl}</a></p>
    </aside> : <p className='mb-6 rounded-lg border border-sky-100 bg-sky-50 p-4 text-sm leading-6 text-school-navy'>Tautan grup WhatsApp LMP belum tersedia. Hubungi panitia melalui kontak sekolah untuk informasi grup dan tahapan berikutnya.</p>}
    <p className='whitespace-pre-line text-sm leading-7 text-slate-600'>{receipt.afterSubmit}</p>
    <p className='mt-3 text-sm leading-7 text-slate-600'>Pendaftaran ini belum merupakan konfirmasi pembayaran. Simpan nomor pendaftaran untuk konfirmasi dengan panitia.</p>
    <div className='mt-6 flex flex-wrap gap-3'><a href='/lmp' className='rounded-md bg-school-blue px-5 py-3 text-sm font-semibold text-white'>Informasi LMP</a><button type='button' className='rounded-md border border-slate-300 px-5 py-3 text-sm font-medium text-school-navy hover:bg-slate-50' onClick={onReset}>Daftarkan peserta lain</button></div>
  </section>
}
