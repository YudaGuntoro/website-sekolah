import type { Metadata } from 'next'
import Link from 'next/link'
import { announcements } from '../school-content'

export const metadata: Metadata = {
  title: 'Pengumuman Terbaru',
  description: 'Informasi kegiatan dan pengumuman Sekolah Cendekia.',
}

const iconColors = ['bg-sky-100 text-sky-700', 'bg-blue-100 text-blue-700', 'bg-cyan-100 text-cyan-800', 'bg-sky-100 text-school-blue']

export default function PengumumanPage() {
  return (
    <main className='min-h-[70vh] bg-[#f3f8fd]'>
      <section className='relative isolate overflow-hidden border-b border-sky-100 bg-[#f7f9fc]'>
        <div aria-hidden='true' className='pointer-events-none absolute inset-0 -z-10 opacity-70' style={{ backgroundImage: 'linear-gradient(rgba(30,101,168,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(30,101,168,.045) 1px, transparent 1px), radial-gradient(ellipse at 90% 10%, rgba(125,211,252,.2), transparent 42%)', backgroundSize: '38px 38px, 38px 38px, auto' }} />
        <div className='mx-auto max-w-7xl px-5 pb-12 pt-12 sm:px-8 sm:pb-16 sm:pt-16 lg:px-10'>
          <div className='grid items-end gap-7 lg:grid-cols-[1.1fr_.9fr] lg:gap-12'>
            <div>
              <p className='text-xs font-extrabold uppercase tracking-[.18em] text-school-blue'>Info sekolah</p>
              <h1 className='mt-4 max-w-2xl text-4xl font-black leading-[1.06] tracking-tight text-school-navy sm:text-5xl lg:text-6xl'>Pengumuman <span className='text-school-blue'>terbaru.</span></h1>
            </div>
            <p className='max-w-xl border-l-2 border-sky-300 py-1 pl-5 text-base leading-7 text-slate-600'>Informasi kegiatan, jadwal, dan kabar penting untuk keluarga besar Sekolah Cendekia.</p>
          </div>
          <div className='mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
            {announcements.map((announcement, index) => (
              <article key={announcement.title} className='group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_32px_-26px_rgba(16,45,78,.3)] transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_20px_40px_-25px_rgba(30,101,168,.22)]'>
                <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${iconColors[index % iconColors.length]}`}>
                  <svg viewBox='0 0 24 24' className='h-8 w-8 fill-none stroke-current' strokeWidth='1.6' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'><path d='M4 9h5l11-5v16L9 15H4V9ZM9 9v6M6 15l1 6h4l-2-6M1 10v4' /></svg>
                </span>
                <h2 className='mt-6 text-lg font-bold leading-snug text-school-navy'>{announcement.title}</h2>
                <p className='mt-3 flex items-center gap-2 text-xs font-medium text-school-blue'>
                  <svg viewBox='0 0 24 24' className='h-4 w-4 shrink-0 fill-none stroke-current' strokeWidth='1.7' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'><rect x='3' y='5' width='18' height='16' rx='2' /><path d='M16 3v4M8 3v4M3 11h18' /></svg>
                  {announcement.date}
                </p>
                <p className='mt-5 border-t border-slate-100 pt-4 text-sm leading-6 text-slate-600 transition group-hover:border-sky-200'>{announcement.text}</p>
              </article>
            ))}
          </div>
          <div className='mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-sky-100 bg-white/80 p-5 sm:flex-row sm:items-center sm:px-6'>
            <p className='max-w-2xl text-sm leading-6 text-slate-600'>Hubungi sekolah untuk informasi lebih lanjut mengenai kegiatan dan jadwal yang diumumkan.</p>
            <Link href='/#pengumuman' className='inline-flex shrink-0 items-center gap-2 rounded-full bg-school-blue px-5 py-3 text-sm font-bold text-white transition hover:bg-school-navy'>Kembali ke beranda <span aria-hidden='true'>&#8594;</span></Link>
          </div>
        </div>
      </section>
    </main>
  )
}
