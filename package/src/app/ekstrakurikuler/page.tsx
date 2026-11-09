import { getCmsCollection } from '../cms-content'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Ekstrakurikuler',
  description: 'Jelajahi ruang minat, kreativitas, dan kebugaran murid SMPIT Cendekia.',
}

const activities = [
  { number: '01', title: 'Panahan', text: 'Kegiatan ekstrakurikuler SMPIT Cendekia.', detail: 'Tanyakan jadwal dan informasi kegiatan ini kepada pihak sekolah.', color: 'bg-sky-100 text-sky-700', icon: 'sport' },
  { number: '02', title: 'Basket', text: 'Kegiatan ekstrakurikuler SMPIT Cendekia.', detail: 'Tanyakan jadwal dan informasi kegiatan ini kepada pihak sekolah.', color: 'bg-blue-100 text-blue-700', icon: 'sport' },
  { number: '03', title: 'Futsal', text: 'Kegiatan ekstrakurikuler SMPIT Cendekia.', detail: 'Tanyakan jadwal dan informasi kegiatan ini kepada pihak sekolah.', color: 'bg-indigo-100 text-indigo-700', icon: 'sport' },
  { number: '04', title: 'Badminton', text: 'Kegiatan ekstrakurikuler SMPIT Cendekia.', detail: 'Tanyakan jadwal dan informasi kegiatan ini kepada pihak sekolah.', color: 'bg-cyan-100 text-cyan-800', icon: 'sport' },
  { number: '05', title: 'Digital', text: 'Kegiatan ekstrakurikuler SMPIT Cendekia.', detail: 'Tanyakan jadwal dan informasi kegiatan ini kepada pihak sekolah.', color: 'bg-sky-100 text-sky-700', icon: 'science' },
  { number: '06', title: 'Bahasa Inggris', text: 'Kegiatan ekstrakurikuler SMPIT Cendekia.', detail: 'Tanyakan jadwal dan informasi kegiatan ini kepada pihak sekolah.', color: 'bg-blue-100 text-blue-700', icon: 'book' },
  { number: '07', title: 'Bahasa Jepang', text: 'Kegiatan ekstrakurikuler SMPIT Cendekia.', detail: 'Tanyakan jadwal dan informasi kegiatan ini kepada pihak sekolah.', color: 'bg-indigo-100 text-indigo-700', icon: 'book' },
  { number: '08', title: 'Pramuka', text: 'Kegiatan ekstrakurikuler SMPIT Cendekia.', detail: 'Tanyakan jadwal dan informasi kegiatan ini kepada pihak sekolah.', color: 'bg-cyan-100 text-cyan-800', icon: 'sport' },
  { number: '09', title: 'Tari', text: 'Kegiatan ekstrakurikuler SMPIT Cendekia.', detail: 'Tanyakan jadwal dan informasi kegiatan ini kepada pihak sekolah.', color: 'bg-sky-100 text-sky-700', icon: 'art' },
  { number: '10', title: 'Pencak Silat', text: 'Kegiatan ekstrakurikuler SMPIT Cendekia.', detail: 'Tanyakan jadwal dan informasi kegiatan ini kepada pihak sekolah.', color: 'bg-blue-100 text-blue-700', icon: 'sport' },
]

function ActivityIcon({ type }: { type: string }) {
  const common = { className: 'h-8 w-8 fill-none stroke-current', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true as const }
  if (type === 'science') return <svg viewBox='0 0 32 32' {...common}><path d='M11 4h10M13 4v9L6 25a2 2 0 0 0 2 3h16a2 2 0 0 0 2-3l-7-12V4M9 22h14' /></svg>
  if (type === 'book') return <svg viewBox='0 0 32 32' {...common}><path d='M4 7c5-2 9-1 12 2v19c-3-3-7-4-12-2V7Zm24 0c-5-2-9-1-12 2v19c3-3 7-4 12-2V7Z' /></svg>
  if (type === 'art') return <svg viewBox='0 0 32 32' {...common}><path d='M16 3a13 13 0 1 0 0 26h2a3.5 3.5 0 0 0 2-6 2.5 2.5 0 0 1 2-4h2a5 5 0 0 0 5-6C27 7 22 3 16 3Z' /><circle cx='10' cy='13' r='1' fill='currentColor' /><circle cx='16' cy='9' r='1' fill='currentColor' /><circle cx='22' cy='12' r='1' fill='currentColor' /></svg>
  return <svg viewBox='0 0 32 32' {...common}><circle cx='16' cy='16' r='12' /><path d='M4 16h24M16 4a19 19 0 0 1 0 24M16 4a19 19 0 0 0 0 24M7 9h18M7 23h18' /></svg>
}

export default async function EkstrakurikulerPage() {
  const cmsEntries = await getCmsCollection('ekstrakurikuler')
  const visible = cmsEntries === null ? activities.map(e => ({ ...e, imageUrl: '' })) : cmsEntries.map((e, index) => ({ ...activities[index % activities.length], imageUrl: e.imageUrl, title: e.title, text: e.summary, detail: e.body !== e.summary ? e.body : '', number: String(index + 1).padStart(2, '0') }))
  return (
    <main className='min-h-[70vh] bg-[#f3f8fd]'>
      <section className='relative isolate overflow-hidden border-b border-sky-100 bg-[#f7f9fc]'>
        <div aria-hidden='true' className='pointer-events-none absolute inset-0 -z-10 opacity-70' style={{ backgroundImage: 'linear-gradient(rgba(30,101,168,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(30,101,168,.045) 1px, transparent 1px), radial-gradient(ellipse at 90% 10%, rgba(125,211,252,.2), transparent 42%)', backgroundSize: '38px 38px, 38px 38px, auto' }} />
        <div className='mx-auto max-w-7xl px-5 pb-12 pt-12 sm:px-8 sm:pb-16 sm:pt-16 lg:px-10'>
          <div className='grid items-end gap-7 lg:grid-cols-[1.1fr_.9fr] lg:gap-12'>
            <div>
              <p className='text-xs font-extrabold uppercase tracking-[.18em] text-school-blue'>Ruang eksplorasi murid</p>
              <h1 className='mt-4 max-w-2xl text-4xl font-black leading-[1.06] tracking-tight text-school-navy sm:text-5xl lg:text-6xl'>Minat tumbuh, <span className='text-school-blue'>potensi berkembang.</span></h1>
            </div>
            <p className='max-w-xl border-l-2 border-sky-300 py-1 pl-5 text-base leading-7 text-slate-600'>Kegiatan di luar kelas memberi ruang bagi murid untuk mencoba hal baru, mengasah keterampilan, dan belajar bekerja sama.</p>
          </div>
          <div className='mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
            {visible.map((activity) => (
              <article key={activity.number} className='group rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_32px_-26px_rgba(16,45,78,.3)] transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_20px_40px_-25px_rgba(30,101,168,.22)]'>
                <div className='flex items-center justify-between'><span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${activity.color}`}><ActivityIcon type={activity.icon} /></span><span className='text-sm font-black tracking-widest text-slate-300'>{activity.number}</span></div>
                {activity.imageUrl && <img src={activity.imageUrl} alt={activity.title} className='col-span-full mb-4 mt-4 max-h-56 w-full rounded-xl object-cover' loading='lazy' />}
                <h2 className='mt-6 text-lg font-bold text-school-navy'>{activity.title}</h2>
                <p className='mt-2 min-h-12 text-sm leading-6 text-slate-600'>{activity.text}</p>
                <details className='mt-5 border-t border-slate-100 pt-4'>
                  <summary className='cursor-pointer list-none text-xs font-bold text-school-blue [&::-webkit-details-marker]:hidden'>Lihat kegiatan <span aria-hidden='true'>→</span></summary>
                  <p className='mt-3 text-sm leading-6 text-slate-600'>{activity.detail}</p>
                  <Link href='/#kontak' className='mt-4 inline-flex items-center gap-2 text-xs font-bold text-school-blue hover:text-school-navy'>Tanya kegiatan ini <span aria-hidden='true'>→</span></Link>
                </details>
                <div className='mt-4 h-px bg-slate-100 transition group-hover:bg-sky-200' />
                <p className='mt-4 text-xs font-semibold text-school-blue'>Belajar, berlatih, dan berkarya</p>
              </article>
            ))}
          </div>
          <div className='mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-sky-100 bg-white/80 p-5 sm:flex-row sm:items-center sm:px-6'>
            <p className='max-w-2xl text-sm leading-6 text-slate-600'>Pilihan kegiatan dan jadwal dapat berubah mengikuti program sekolah. Hubungi sekretariat untuk informasi kegiatan yang tersedia saat ini.</p>
            <Link href='/#kontak' className='inline-flex shrink-0 items-center gap-2 rounded-full bg-school-blue px-5 py-3 text-sm font-bold text-white transition hover:bg-school-navy'>Tanya sekolah <span aria-hidden='true'>→</span></Link>
          </div>
        </div>
      </section>
    </main>
  )
}
