import { getSpmbInformation } from './information'
import { stepIcons } from './step-icons'
import { getContactSettings, whatsappUrl } from '../contact-settings'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Informasi SPMB',
  description: 'Informasi penerimaan murid baru SMPIT Cendekia Purwakarta.',
}

export default async function SpmbInformationPage() {
  const [{ config, academicYear }, contact] = await Promise.all([getSpmbInformation(), getContactSettings()])
  const steps = config.steps
  const documents = config.newStudentDocuments
  const transferDocuments = config.transferDocuments
  const whatsapp = whatsappUrl(contact.whatsappNumber)
  return (
    <main className='bg-[#f3f8fd] px-5 pb-14 sm:px-8 sm:pb-16'>
      <section className='relative -mx-5 overflow-hidden border-b border-sky-100 bg-[#f7f9fc] px-5 pb-10 pt-12 sm:-mx-8 sm:px-8 sm:pb-12 sm:pt-14'>
        <div className='mx-auto grid max-w-7xl items-end gap-7 lg:grid-cols-[1.1fr_.9fr] lg:gap-12'>
          <div>
            <p className='mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-school-blue'>SMPIT Cendekia Purwakarta - Tahun Ajaran {academicYear}</p>
            <h1 className='max-w-2xl text-4xl font-black leading-[1.05] tracking-tight text-school-navy sm:text-5xl lg:text-6xl'>SPMB <span className='text-school-blue'>{academicYear}.</span></h1>
          </div>
          <p className='max-w-xl border-l-2 border-sky-300 pl-5 text-base leading-7 text-slate-600 lg:mb-1'>{config.introduction}</p>
        </div>
      </section>
      <div className='mx-auto mt-8 grid max-w-6xl gap-5 lg:grid-cols-2'>
        <section className='rounded-2xl border border-sky-100 bg-white p-5 sm:p-7'>
          <div className='flex items-center justify-between gap-3'>
            <h2 className='text-xl font-black text-school-navy'>Alur Pendaftaran</h2>
            <span className='shrink-0 rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-bold text-school-blue sm:text-xs'>{steps.length} tahap</span>
          </div>
          <ol className='mt-6 sm:mt-7'>
            {steps.map((step, index) => (
              <li key={index} className='relative flex gap-3 pb-6 last:pb-0 sm:gap-4 sm:pb-7'>
                {index < steps.length - 1 && <span aria-hidden='true' className='absolute bottom-0 left-5 top-11 w-px bg-sky-100 sm:left-6 sm:top-[52px]' />}
                <span className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12 sm:rounded-2xl ${(stepIcons[step.icon] || stepIcons.register).color}`}>
                  <svg viewBox='0 0 24 24' className='h-5 w-5 sm:h-6 sm:w-6' fill='none' stroke='currentColor' strokeWidth='1.7' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'><path d={(stepIcons[step.icon] || stepIcons.register).icon} /></svg>
                </span>
                <div className='min-w-0 flex-1'>
                  <p className='text-[9px] font-bold uppercase tracking-[.15em] text-school-blue/70 sm:text-[10px]'>Tahap {String(index + 1).padStart(2, '0')}</p>
                  <h3 className='mt-1 text-sm font-bold leading-5 text-school-navy sm:text-base sm:leading-6'>{step.title}</h3>
                  {step.showPayment ? <>
                    {step.description && <p className="mt-1.5 whitespace-pre-line text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6">{step.description}</p>}
                    <div className='mt-2 max-w-sm rounded-xl border border-amber-100 bg-amber-50/60 p-3 sm:p-4'>
                      <p className='text-lg font-extrabold tracking-tight text-school-navy sm:text-xl'>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(config.feeAmount)}</p>
                      <p className='mt-1 text-xs leading-5 text-slate-600 sm:text-sm'>{config.paymentDescription}</p>
                      <p className='mt-1 text-xs font-bold leading-5 text-school-navy sm:text-sm'>{config.bankName} <span className='whitespace-nowrap tabular-nums'>{config.accountNumber}</span></p>
                      <p className='mt-1 text-[11px] leading-5 text-slate-500 sm:text-xs'>{config.accountHolder ? `a.n. ${config.accountHolder}` : null}</p>
                    </div>
                  </> : <p className='mt-1.5 text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6'>{step.description}</p>}
                </div>
              </li>
            ))}
          </ol>
        </section>
        <section className='rounded-2xl border border-sky-100 bg-white p-6 sm:p-7'>
          <h2 className='text-xl font-black text-school-navy'>Persyaratan Berkas</h2>
          <h3 className='mt-5 text-sm font-bold text-school-blue'>Calon siswa baru</h3>
          <ul className='mt-2 list-inside list-disc space-y-2 text-sm leading-6 text-slate-600'>{documents.map((item) => <li key={item}>{item}</li>)}</ul>
          <h3 className='mt-5 text-sm font-bold text-school-blue'>Murid pindahan</h3>
          <ul className='mt-2 list-inside list-disc space-y-2 text-sm leading-6 text-slate-600'>{transferDocuments.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
      </div>
      <section className='mx-auto mt-8 max-w-6xl rounded-2xl border border-sky-100 bg-white p-6 sm:p-7'>
        <h2 className='text-xl font-black text-school-navy'>Pendaftaran dan informasi</h2>
        <div className='mt-5 flex flex-col gap-6 border-t border-slate-100 pt-5 xl:flex-row xl:items-center xl:justify-between'>
        <div className='grid min-w-0 gap-4 sm:flex sm:flex-wrap sm:gap-x-8'>
          {whatsapp && <a href={whatsapp} target='_blank' rel='noreferrer' className='group flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600'>
            <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[#16a34a] transition group-hover:bg-emerald-100'>
              <svg viewBox='0 0 24 24' className='h-5 w-5 fill-none stroke-current' strokeWidth='1.7' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'><path d='M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.4-4.8a8.5 8.5 0 1 1 16.1-4.1Z' /><path d='m8 7 2 3-1.3 1.3a10 10 0 0 0 4 4L14 14l3 2c-.5 1.5-1.5 2-3 1.5C10 16.3 7.7 14 6.5 10 6 8.5 6.5 7.5 8 7Z' /></svg>
            </span>
            <span className='min-w-0 flex-1'>
              <span className='block text-xs text-slate-500'>WhatsApp / CP</span>
              <span className='mt-0.5 block text-sm font-semibold text-school-navy transition group-hover:text-emerald-700'>{contact.whatsappNumber}</span>

            </span>
          </a>}
          {contact.email && <a href={`mailto:${contact.email}`} className='group flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-school-blue'>
            <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50 transition group-hover:bg-sky-100'>
              <svg viewBox='0 0 24 24' className='h-5 w-5 fill-none' strokeWidth='2.4' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'><path d='M3 7v11' stroke='#4285F4' /><path d='m3 7 9 7 9-7' stroke='#EA4335' /><path d='M21 7v11' stroke='#34A853' /><path d='m3 7 3 2' stroke='#FBBC04' /></svg>
            </span>
            <span className='min-w-0 flex-1'>
              <span className='block text-xs text-slate-500'>Email sekretariat</span>
              <span className='mt-0.5 block break-all text-sm font-semibold text-school-navy transition group-hover:text-school-blue'>{contact.email}</span>

            </span>
          </a>}
        </div>
        <div className='flex shrink-0 flex-wrap items-center gap-2'>
          <Link href='/spmb/daftar' className='inline-flex items-center justify-center gap-2 rounded-xl bg-school-blue px-4 py-2.5 text-sm font-bold text-white transition hover:bg-school-navy'>Isi formulir <span aria-hidden='true'>&#8594;</span></Link>
          {config.brochureUrl && <a href={config.brochureUrl} target='_blank' rel='noreferrer' className='inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-school-navy transition hover:border-sky-300 hover:bg-sky-50'><svg viewBox='0 0 24 24' className='h-4 w-4 fill-none stroke-school-blue' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'><path d='M14 2H6v20h12V6l-4-4ZM14 2v5h5M9 12h6M9 16h6' /></svg>Brosur SPMB</a>}
        </div>
        </div>
      </section>
    </main>
  )
}
