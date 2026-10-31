import type { Metadata } from 'next'
import Link from 'next/link'
import { schoolNews } from '../school-content'

export const metadata: Metadata = { title: 'Berita Terbaru', description: 'Berita dan cerita terbaru dari Sekolah Cendekia.' }

const visuals = [
  'bg-sky-100 text-sky-700',
  'bg-blue-100 text-blue-700',
  'bg-indigo-100 text-indigo-700',
  'bg-cyan-100 text-cyan-800',
]
const icons = [
  'M3 4c4-1 6 0 9 2v15c-3-2-5-3-9-2V4ZM21 4c-4-1-6 0-9 2v15c3-2 5-3 9-2V4Z',
  'M3 5h16v12H9l-6 4V5ZM7 9h8M7 13h5M19 8h3v13l-4-3',
  'M8 3v4M16 3v4M3 10h18M4 5h16v16H4V5ZM8 14h2M14 14h2M8 18h2',
  'M3 21h18M5 21V8l7-5 7 5v13M9 11h2M14 11h1M10 21v-5h4v5',
]

export default function BeritaPage() {
  return (
    <main className='min-h-[70vh] bg-[#f3f8fd]'>
      <section className='relative isolate overflow-hidden border-b border-sky-100 bg-[#f7f9fc]'>
        <div aria-hidden='true' className='pointer-events-none absolute inset-0 -z-10 opacity-70' style={{ backgroundImage: 'linear-gradient(rgba(30,101,168,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(30,101,168,.045) 1px, transparent 1px), radial-gradient(ellipse at 90% 10%, rgba(125,211,252,.2), transparent 42%)', backgroundSize: '38px 38px, 38px 38px, auto' }} />
      <div className='mx-auto max-w-7xl px-5 pb-12 pt-12 sm:px-8 sm:pb-16 sm:pt-16 lg:px-10'>
        <div className='grid items-end gap-7 lg:grid-cols-[1.1fr_.9fr] lg:gap-12'>
          <div>
            <p className='text-xs font-extrabold uppercase tracking-[.18em] text-school-blue'>Kabar dari sekolah</p>
            <h1 className='mt-4 max-w-2xl text-4xl font-black leading-[1.06] tracking-tight text-school-navy sm:text-5xl lg:text-6xl'>Berita <span className='text-school-blue'>terbaru.</span></h1>
          </div>
          <p className='max-w-xl border-l-2 border-sky-300 py-1 pl-5 text-base leading-7 text-slate-600'>Cerita tentang proses belajar, pencapaian, dan kebersamaan di Sekolah Cendekia.</p>
        </div>
        <div className='mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
          {schoolNews.map((news, index) => (
            <article key={news.title} className='group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_32px_-26px_rgba(16,45,78,.3)] transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_20px_40px_-25px_rgba(30,101,168,.22)]'>
              <div className='flex items-center justify-between'>
                <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${visuals[index % visuals.length]}`}>
                  <svg viewBox='0 0 24 24' className='h-8 w-8 fill-none stroke-current' strokeWidth='1.6' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'><path d={icons[index % icons.length]} /></svg>
                </span>
                <span className='text-sm font-black tracking-widest text-slate-300'>{String(index + 1).padStart(2, '0')}</span>
              </div>
              <div className='mb-5 mt-6'>
                <p className='text-[10px] font-extrabold uppercase tracking-[.13em] text-school-blue'>{news.category}</p>
                <h2 className='mt-2 text-lg font-bold text-school-navy'><Link href={`/berita/${news.slug}`}>{news.title}</Link></h2>
                <time dateTime={news.publishedAt} className='mt-3 block text-xs text-slate-500'>{news.date}</time>
                <p className='mt-2 text-sm leading-6 text-slate-600'>{news.text}</p>
              </div>
              <div className='mt-auto border-t border-slate-100 pt-4 transition group-hover:border-sky-200'>
                <Link href={`/berita/${news.slug}`} aria-label={`Baca ${news.title}`} className='inline-flex items-center gap-2 text-xs font-bold text-school-blue hover:text-school-navy'>Baca cerita <span aria-hidden='true'>→</span></Link>
              </div>
            </article>
          ))}
        </div>
        <div className='mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-sky-100 bg-white/80 p-5 sm:flex-row sm:items-center sm:px-6'>
          <p className='max-w-2xl text-sm leading-6 text-slate-600'>Kenali program dan keseharian siswa SMPIT Cendekia lebih dekat.</p>
          <Link href='/#berita' className='inline-flex shrink-0 items-center gap-2 rounded-full bg-school-blue px-5 py-3 text-sm font-bold text-white transition hover:bg-school-navy'>Kembali ke beranda <span aria-hidden='true'>→</span></Link>
        </div>
      </div>
      </section>
    </main>
  )
}
