import type { Metadata } from 'next'
import Link from 'next/link'
import { getSchoolContent, getCmsCollection } from '../cms-content'

export const metadata: Metadata = {
  title: 'Kegiatan Rutin',
  description: 'Kegiatan rutin murid SMPIT Cendekia Purwakarta, dari 7 Poe Atikan hingga Kultum.',
}

const routineDetails: Record<string, { text: string; icon: string }> = {
  '7 Poe Atikan': {
    text: 'Menumbuhkan karakter dan nilai positif dalam keseharian murid.',
    icon: 'M12 3 3 8l9 5 9-5-9-5ZM6 10v7c4 3 8 3 12 0v-7M21 8v8',
  },
  'Morning Briefing': {
    text: 'Mengawali hari dengan arahan dan persiapan untuk belajar bersama.',
    icon: 'M4 5h16v11H9l-5 4V5ZM8 9h8M8 12h5',
  },
  'Sholat Dhuha': {
    text: 'Membiasakan ibadah di pagi hari dan menumbuhkan rasa syukur.',
    icon: 'M12 3v2M4 6l2 2M20 6l-2 2M2 13h3M19 13h3M7 13a5 5 0 0 1 10 0M3 17h18M6 21h12',
  },
  Pembelajaran: {
    text: 'Membangun pengetahuan melalui proses belajar, diskusi, dan latihan.',
    icon: 'M3 4c4-1 6 0 9 2v15c-3-2-5-3-9-2V4ZM21 4c-4-1-6 0-9 2v15c3-2 5-3 9-2V4Z',
  },
  'Sholat Dzuhur Berjamaah': {
    text: 'Melatih kedisiplinan beribadah dan kebersamaan melalui sholat berjamaah.',
    icon: 'M4 21V10h16v11M8 10V7l4-4 4 4v3M10 21v-6h4v6M2 21h20',
  },
  "Tahsin/Tahfidz Al-Qur'an": {
    text: "Melatih bacaan dan hafalan Al-Qur'an dengan tekun dan bertahap.",
    icon: 'M4 4h13a3 3 0 0 1 3 3v14H7a3 3 0 0 1-3-3V4ZM4 17h16M9 4v8l3-2 3 2V4',
  },
  Kultum: {
    text: 'Berbagi nasihat kebaikan sekaligus melatih keberanian berbicara.',
    icon: 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3ZM5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8',
  },
}

const iconColors = ['bg-sky-100 text-sky-700', 'bg-blue-100 text-blue-700', 'bg-indigo-100 text-indigo-700', 'bg-cyan-100 text-cyan-800']

export default async function KegiatanRutinPage() {
  const { schoolRoutines } = await getSchoolContent()
  const cmsRoutines = await getCmsCollection('kegiatan')
  const details = { ...routineDetails }
  cmsRoutines?.forEach(e => { details[e.title] = { text: e.body || e.summary || routineDetails[e.title]?.text || '', icon: routineDetails[e.title]?.icon || routineDetails.Pembelajaran.icon } })
  return (
    <main className='min-h-[70vh] bg-[#f3f8fd]'>
      <section className='relative isolate overflow-hidden border-b border-sky-100 bg-[#f7f9fc]'>
        <div aria-hidden='true' className='pointer-events-none absolute inset-0 -z-10 opacity-70' style={{ backgroundImage: 'linear-gradient(rgba(30,101,168,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(30,101,168,.045) 1px, transparent 1px), radial-gradient(ellipse at 90% 10%, rgba(125,211,252,.2), transparent 42%)', backgroundSize: '38px 38px, 38px 38px, auto' }} />
        <div className='mx-auto max-w-7xl px-5 pb-12 pt-12 sm:px-8 sm:pb-16 sm:pt-16 lg:px-10'>
          <div className='grid items-end gap-7 lg:grid-cols-[1.1fr_.9fr] lg:gap-12'>
            <div>
              <p className='text-xs font-extrabold uppercase tracking-[.18em] text-school-blue'>Kegiatan rutin sekolah</p>
              <h1 className='mt-4 max-w-2xl text-4xl font-black leading-[1.06] tracking-tight text-school-navy sm:text-5xl lg:text-6xl'>Kebiasaan baik, <span className='text-school-blue'>karakter bertumbuh.</span></h1>
            </div>
            <p className='max-w-xl border-l-2 border-sky-300 py-1 pl-5 text-base leading-7 text-slate-600'>Kegiatan rutin menjadi bagian dari keseharian murid SMPIT Cendekia untuk belajar, membangun kedisiplinan, dan membiasakan nilai-nilai kebaikan.</p>
          </div>
          <div className='mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
            {schoolRoutines.map((routine, index) => (
              <article key={routine} className='group rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_32px_-26px_rgba(16,45,78,.3)] transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_20px_40px_-25px_rgba(30,101,168,.22)]'>
                <div className='flex items-center justify-between'>
                  <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${iconColors[index % iconColors.length]}`}>
                    <svg viewBox='0 0 24 24' className='h-8 w-8 fill-none stroke-current' strokeWidth='1.6' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'><path d={details[routine].icon} /></svg>
                  </span>
                  <span className='text-sm font-black tracking-widest text-slate-300'>{String(index + 1).padStart(2, '0')}</span>
                </div>
                <h2 className='mt-6 text-lg font-bold text-school-navy'>{routine}</h2>
                <p className='mt-2 text-sm leading-6 text-slate-600'>{details[routine].text}</p>
                <div className='mt-5 h-px bg-slate-100 transition group-hover:bg-sky-200' />
                <p className='mt-4 text-xs font-semibold text-school-blue'>Belajar dan membiasakan kebaikan</p>
              </article>
            ))}
          </div>
          <div className='mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-sky-100 bg-white/80 p-5 sm:flex-row sm:items-center sm:px-6'>
            <p className='max-w-2xl text-sm leading-6 text-slate-600'>Kenali lebih dekat keseharian dan kegiatan belajar murid di SMPIT Cendekia.</p>
            <Link href='/#kontak' className='inline-flex shrink-0 items-center gap-2 rounded-full bg-school-blue px-5 py-3 text-sm font-bold text-white transition hover:bg-school-navy'>Tanya sekolah <span aria-hidden='true'>→</span></Link>
          </div>
        </div>
      </section>
    </main>
  )
}
