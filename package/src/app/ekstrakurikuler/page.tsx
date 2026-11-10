import { getActivities } from './activities'
import ActivityPhoto from './ActivityPhoto'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Ekstrakurikuler',
  description: 'Jelajahi ruang minat, kreativitas, dan kebugaran murid SMPIT Cendekia.',
}

export default async function EkstrakurikulerPage() {
  const visible = await getActivities()
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
              <Link key={activity.slug} href={`/ekstrakurikuler/${activity.slug}`} className='group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_12px_32px_-26px_rgba(16,45,78,.3)] transition hover:-translate-y-1 hover:border-sky-300 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-school-blue'>
                <ActivityPhoto src={activity.imageUrl} title={activity.title} />
                <div className='flex flex-1 flex-col p-5'>
                  <h2 className='text-lg font-bold text-school-navy group-hover:text-school-blue'>{activity.title}</h2>
                  {activity.summary && <p className='mt-2 line-clamp-2 text-sm leading-6 text-slate-600'>{activity.summary}</p>}
                  <span className='mt-auto pt-5 text-sm font-semibold text-school-blue'>Lihat kegiatan <span aria-hidden='true'>→</span></span>
                </div>
              </Link>
            ))}
          </div>
          {visible.length === 0 && <p className='mt-8 rounded-2xl border border-sky-100 bg-white p-6 text-sm leading-7 text-slate-600'>Informasi ekstrakurikuler sedang disiapkan. Silakan hubungi sekolah untuk informasi kegiatan.</p>}
          <div className='mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-sky-100 bg-white/80 p-5 sm:flex-row sm:items-center sm:px-6'>
            <p className='max-w-2xl text-sm leading-6 text-slate-600'>Pilihan kegiatan dan jadwal dapat berubah mengikuti program sekolah. Hubungi sekretariat untuk informasi kegiatan yang tersedia saat ini.</p>
            <Link href='/#hubungi-kami' className='inline-flex shrink-0 items-center gap-2 rounded-full bg-school-blue px-5 py-3 text-sm font-bold text-white transition hover:bg-school-navy'>Tanya sekolah <span aria-hidden='true'>→</span></Link>
          </div>
        </div>
      </section>
    </main>
  )
}
