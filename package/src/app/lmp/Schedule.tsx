import type { ReactNode } from 'react'
import { formatDate, type LmpInformation } from './types'

function Icon({ children, className = 'h-5 w-5' }: { children: ReactNode; className?: string }) {
  return <svg viewBox='0 0 24 24' className={className} fill='none' stroke='currentColor' strokeWidth='1.65' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>{children}</svg>
}

export default function LmpSchedule({ config: c, isOpen, today }: Pick<LmpInformation, 'config' | 'isOpen' | 'today'>) {
  const status = isOpen ? 'Pendaftaran dibuka' : !c.registrationStart || today < c.registrationStart ? 'Pendaftaran belum dibuka' : 'Pendaftaran ditutup'
  return <section aria-labelledby='lmp-schedule-heading' className='overflow-hidden rounded-xl border border-[#dbe6f1] bg-white p-0 shadow-[0_2px_6px_rgba(16,45,78,.025)]'>
    <div className='flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 px-6 py-4 sm:px-7'>
      <h2 id='lmp-schedule-heading' className='text-lg font-bold tracking-tight text-school-navy'>Jadwal LMP</h2>
      <span role='status' className={`inline-flex items-center gap-2 text-base font-semibold ${isOpen ? 'text-emerald-700' : 'text-red-600'}`}><span aria-hidden='true' className='h-1.5 w-1.5 shrink-0 rounded-full bg-current' />{status}</span>
    </div>
    <dl className='grid divide-y divide-[#e3ebf4] md:grid-cols-3 md:divide-x md:divide-y-0'>
      <div className='px-6 py-6 sm:px-7'>
        <dt className='flex items-center gap-2.5 text-[13px] font-semibold text-school-blue'><Icon><rect x='5' y='4' width='14' height='17' rx='2' /><path d='M9 4V2h6v2M9 10h6M9 14h4' /></Icon>Pendaftaran</dt>
        <dd className='mt-4'>
          {c.registrationStart ? <><p className='text-xl font-semibold tracking-tight text-school-navy'>{formatDate(c.registrationStart)}</p><p className='mt-1 text-sm text-slate-600'>s.d. {formatDate(c.registrationEnd)}</p></> : <p className='text-lg font-semibold tracking-tight text-school-navy'>Jadwal menyusul</p>}
          <p className='mt-3 text-[13px] leading-6 text-slate-500'>{c.registrationStart ? 'Ditutup pukul 23.59 WIB pada tanggal akhir.' : 'Tanggal buka dan tutup akan diumumkan.'}</p>
        </dd>
      </div>
      <div className='bg-[#f5f9fe] px-6 py-6 sm:px-7'>
        <dt className='flex items-center gap-2.5 text-[13px] font-semibold text-school-blue'><Icon><rect x='3' y='5' width='18' height='16' rx='2' /><path d='M8 3v4M16 3v4M3 11h18M8 15h2M14 15h2' /></Icon>Pelaksanaan lomba</dt>
        <dd className='mt-4'><p className='text-xl font-semibold tracking-tight text-school-navy'>{formatDate(c.competitionDate)}</p>
          {c.competitionTime && <p className='mt-2 flex items-start gap-2 text-[13px] leading-6 text-slate-600'><Icon className='mt-1 h-4 w-4 shrink-0 text-slate-400'><circle cx='12' cy='12' r='9' /><path d='M12 7v5l3 2' /></Icon>{c.competitionTime}</p>}
          {c.venue && <p className='mt-1 flex items-start gap-2 text-[13px] leading-6 text-slate-600'><Icon className='mt-1 h-4 w-4 shrink-0 text-slate-400'><path d='M20 10c0 6-8 11-8 11S4 16 4 10a8 8 0 1 1 16 0Z' /><circle cx='12' cy='10' r='2.5' /></Icon>{c.venue}</p>}
        </dd>
      </div>
      <div className='px-6 py-6 sm:px-7'>
        <dt className='flex items-center gap-2.5 text-[13px] font-semibold text-school-blue'><Icon><path d='M7 3h10v6a5 5 0 0 1-10 0V3ZM7 5H3v2a4 4 0 0 0 4 4M17 5h4v2a4 4 0 0 1-4 4M12 14v5M8 21v-2h8v2M6 21h12' /></Icon>Pengumuman & gebyar</dt>
        <dd className='mt-4'><p className='text-xl font-semibold tracking-tight text-school-navy'>{formatDate(c.announcementDate)}</p><p className='mt-2 whitespace-pre-line text-[13px] leading-6 text-slate-500'>{c.announcementDetails}</p></dd>
      </div>
    </dl>
  </section>
}
