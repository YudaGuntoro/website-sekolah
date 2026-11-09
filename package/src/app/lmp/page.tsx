import type { Metadata } from 'next'
import Link from 'next/link'
import { getLmpInformation } from './information'
import { formatDate, rupiah, subjects } from './types'
import { getContactSettings, whatsappUrl } from '../contact-settings'
import { stepIcons } from '../spmb/step-icons'
import LmpSchedule from './Schedule'

export const metadata: Metadata = { title: 'LMP · Lomba Mata Pelajaran', description: 'Informasi Lomba Mata Pelajaran untuk murid kelas 5 dan 6 SD di SMPIT Cendekia Purwakarta.' }
export default async function LmpPage() {
  const [{ config: c, isOpen, today }, contact] = await Promise.all([getLmpInformation(), getContactSettings()])
  const whatsapp = whatsappUrl(contact.whatsappNumber)
  const steps = c.steps
  return <main className='bg-[#f3f8fd] pb-16'>
    <section className='border-b border-sky-100 bg-[#f7f9fc] px-5 py-12 sm:px-8 sm:py-14'><div className='mx-auto grid max-w-7xl items-end gap-7 lg:grid-cols-[1.1fr_.9fr] lg:gap-12'><div><p className='mb-3 text-xs font-extrabold uppercase tracking-[.18em] text-school-blue'>SMPIT Cendekia Purwakarta · Kelas 5–6 SD</p><h1 className='text-4xl font-black leading-[1.08] tracking-tight text-school-navy sm:text-5xl lg:text-6xl'>{c.title}<span className='text-school-blue'>.</span></h1></div><p className='border-l-2 border-sky-300 pl-5 text-base leading-7 text-slate-600'>{c.introduction}</p></div></section>
    <div className='mx-auto max-w-6xl space-y-5 px-5 pt-8 sm:px-8'>
      <LmpSchedule config={c} isOpen={isOpen} today={today} />
      <div className='grid gap-5 lg:grid-cols-2'><section className='rounded-xl border border-sky-100 bg-white p-6 sm:p-7'><h2 className='text-xl font-bold text-school-navy'>Alur pendaftaran</h2><ol className='mt-6'>{steps.map((s, i) => { const icon = stepIcons[s.icon] || stepIcons.register; return <li key={i} className='relative flex gap-4 pb-6 last:pb-0'>{i < steps.length - 1 && <span aria-hidden className='absolute bottom-0 left-5 top-11 w-px bg-sky-100' />}<span className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${icon.color}`}><svg viewBox='0 0 24 24' className='h-5 w-5' fill='none' stroke='currentColor' strokeWidth='1.7' strokeLinecap='round' strokeLinejoin='round' aria-hidden><path d={icon.icon} /></svg></span><div><p className='text-[10px] font-semibold uppercase tracking-widest text-school-blue'>Tahap {String(i + 1).padStart(2, '0')}</p><h3 className='mt-1 text-base font-bold text-school-navy'>{s.title}</h3>{s.showPayment && <p className='mt-2 text-xl font-bold text-school-navy'>{rupiah(c.feeAmount)}</p>}<p className='mt-1 whitespace-pre-line text-sm leading-6 text-slate-600'>{s.description}</p></div></li>})}</ol></section>
      <section className='rounded-xl border border-sky-100 bg-white p-6 sm:p-7'><h2 className='text-xl font-bold text-school-navy'>Informasi lomba</h2><div className='mt-5 space-y-6 divide-y divide-slate-100'><div><h3 className='font-bold text-school-navy'>Mata pelajaran</h3><ul className='mt-3 space-y-2 text-sm text-slate-600'>{subjects.map(s => <li key={s}>{s}</li>)}</ul><p className='mt-3 text-sm text-school-blue'>Setiap peserta memilih satu mata pelajaran.</p></div><div className='pt-5'><h3 className='font-bold text-school-navy'>Pelaksanaan tes</h3><p className='mt-2 whitespace-pre-line text-sm leading-7 text-slate-600'>{c.testDetails}</p></div><div className='pt-5'><h3 className='font-bold text-school-navy'>Benefit peserta & penghargaan</h3><p className='mt-2 whitespace-pre-line text-sm leading-7 text-slate-600'>{c.benefits}</p></div><div className='pt-5'><h3 className='font-bold text-school-navy'>Setelah mendaftar</h3><p className='mt-2 whitespace-pre-line text-sm leading-7 text-slate-600'>{c.afterSubmit}</p></div></div></section></div>
      <section className='flex flex-wrap items-center justify-between gap-5 rounded-xl border border-sky-100 bg-white p-6'><div><h2 className='text-lg font-bold text-school-navy'>Pendaftaran dan informasi</h2><p className='mt-1 text-sm text-slate-600'>Siapkan data peserta dan kontak guru pendamping.</p></div><div className='flex flex-wrap gap-3'>{whatsapp && <a href={whatsapp} target='_blank' rel='noreferrer' className='rounded-lg border border-slate-200 px-5 py-3 text-sm font-semibold text-school-navy'>Hubungi panitia</a>}<Link href='/lmp/daftar' className='rounded-lg bg-school-blue px-5 py-3 text-sm font-semibold text-white hover:bg-school-navy'>Isi formulir LMP →</Link></div></section>
    </div>
  </main>
}
