'use client'

import { useEffect, useRef } from 'react'
import { formatDate } from '../lmp/types'
import PrintReceiptButton from './PrintReceiptButton'

export type LmpRegistrationStatus = {
  nisn: string | null; registrationNumber: string; studentName: string; previousSchool: string; grade: number; subjects: string;
  eventTitle: string; competitionDate: string | null; submittedAt: string; status: string; paymentStatus: string; whatsappGroupUrl: string;
}

const statusText: Record<string, string> = {
  Baru: 'Pendaftaran peserta sudah diterima dan menunggu pemeriksaan panitia.',
  Diproses: 'Data pendaftaran sedang diperiksa oleh panitia LMP.',
  Terverifikasi: 'Data pendaftaran peserta telah diverifikasi oleh panitia. Ikuti informasi persiapan lomba melalui grup WhatsApp LMP.',
  Dibatalkan: 'Pendaftaran peserta dibatalkan. Silakan hubungi panitia untuk informasi lebih lanjut.',
}

export default function LmpStatusResult({ registration }: { registration: LmpRegistrationStatus }) {
  const heading = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    heading.current?.focus({ preventScroll: true })
    heading.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [registration])
  const date = new Date(/(?:Z|[+-]\d{2}:\d{2})$/.test(registration.submittedAt) ? registration.submittedAt : registration.submittedAt + 'Z')
  const details = [
    ['NISN', registration.nisn || 'Belum dilengkapi'], ['Nama lengkap peserta', registration.studentName], ['Asal sekolah', registration.previousSchool],
    ['Kelas', `Kelas ${registration.grade} SD / MI`], ['Mata pelajaran', registration.subjects],
    ['Lomba', registration.eventTitle], ['Tanggal pelaksanaan', formatDate(registration.competitionDate)],
    ['Status pembayaran', registration.paymentStatus],
    ['Waktu pendaftaran', new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Asia/Jakarta' }).format(date) + ' WIB'],
  ]
  return <section className='registration-receipt mt-6 rounded-xl border border-slate-200 border-t-[3px] border-t-emerald-600 bg-white p-5 sm:p-7' aria-labelledby='lmp-lookup-result-heading'>
    <p className='receipt-print-heading hidden'>SMPIT Cendekia Purwakarta — Bukti Pendaftaran LMP</p>
    <div className='flex flex-wrap items-start justify-between gap-3'>
      <div><h2 ref={heading} id='lmp-lookup-result-heading' tabIndex={-1} className='text-xl font-bold text-school-navy outline-none'>Peserta sudah terdaftar</h2><p className='mt-2 text-sm leading-6 text-slate-500'>Data pendaftaran LMP ditemukan dalam sistem sekolah.</p></div>
      <span className={`rounded-full px-3 py-1.5 text-xs font-semibold ${registration.status === 'Terverifikasi' ? 'bg-emerald-50 text-emerald-800' : registration.status === 'Dibatalkan' ? 'bg-rose-50 text-rose-800' : 'bg-sky-50 text-school-blue'}`}>{registration.status}</span>
    </div>
    <div className='my-5 rounded-lg border border-slate-200 bg-slate-50 p-4'><p className='text-xs text-slate-500'>Nomor pendaftaran</p><p className='mt-2 break-all font-mono text-xl font-bold text-school-navy'>{registration.registrationNumber}</p></div>
    <dl className='grid gap-x-6 sm:grid-cols-2'>{details.map(([label, value]) => <div key={label} className='min-w-0 border-b border-slate-100 py-3'><dt className='text-xs text-slate-500'>{label}</dt><dd className='mt-1 break-words text-sm font-medium leading-6 text-school-navy'>{value}</dd></div>)}</dl>
    <p className='mt-5 rounded-lg border border-sky-100 bg-sky-50 p-4 text-sm leading-7 text-school-navy'>{statusText[registration.status] || 'Hubungi panitia untuk informasi status pendaftaran.'}</p>
    <aside aria-label='Informasi grup WhatsApp LMP' className='mt-5 rounded-lg border border-emerald-200 bg-emerald-50 p-4 sm:p-5'>
      <h3 className='font-semibold text-school-navy'>Grup WhatsApp Pendaftaran LMP</h3>
      {registration.whatsappGroupUrl ? <>
        <p className='mt-2 text-sm leading-7 text-slate-600'>Untuk informasi lebih lanjut mengenai berkas, pembayaran, dan pelaksanaan lomba, silakan bergabung dengan grup WhatsApp pendaftaran LMP.</p>
        <a href={registration.whatsappGroupUrl} target='_blank' rel='noopener noreferrer' className='receipt-no-print mt-4 inline-flex min-h-11 items-center justify-center rounded-md bg-emerald-700 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-800'>Gabung grup WhatsApp LMP</a>
        <p className='mt-3 text-xs leading-6 text-slate-500'>Tautan grup WhatsApp:</p><a href={registration.whatsappGroupUrl} target='_blank' rel='noopener noreferrer' className='block break-all text-sm font-medium leading-6 text-emerald-800 underline underline-offset-4'>{registration.whatsappGroupUrl}</a>
      </> : <><p className='mt-2 text-sm leading-7 text-slate-600'>Tautan grup WhatsApp LMP belum tersedia. Silakan hubungi panitia untuk mendapatkan tautan grup dan informasi pelaksanaan lomba.</p><a href='/lmp#kontak-lmp' className='receipt-no-print mt-3 inline-block text-sm font-semibold text-school-blue underline underline-offset-4'>Hubungi panitia LMP</a></>}
    </aside>
    <p className='mt-5 text-xs leading-6 text-slate-500'>Bukti ini menunjukkan data pendaftaran sudah tercatat. Status pembayaran mengikuti hasil pemeriksaan panitia, bukan sekadar unggahan bukti transfer.</p>
    <div className='receipt-no-print mt-5 flex flex-wrap items-center gap-4'><PrintReceiptButton /><a href='/lmp' className='text-sm font-semibold text-school-blue hover:underline'>Informasi LMP</a></div>
  </section>
}
