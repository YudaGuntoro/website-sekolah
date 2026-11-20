import type { Metadata } from 'next'
import Link from 'next/link'
import { getSchoolContent } from '../cms-content'
import { pageMetadata } from '../seo'

export const metadata: Metadata = pageMetadata('/pengumuman', 'Pengumuman Terbaru', 'Informasi kegiatan dan pengumuman Sekolah Cendekia.')

export default async function PengumumanPage() {
  const { announcements } = await getSchoolContent()
  return (
    <main className='min-h-[70vh] bg-[#f7faff]'>
      <div className='mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10'>
        <div className='max-w-2xl'>
          <p className='text-xs font-extrabold uppercase tracking-[.18em] text-school-blue'>Info sekolah</p>
          <h1 className='mt-4 text-4xl font-black tracking-tight text-school-navy sm:text-5xl'>Pengumuman <span className='text-school-blue'>terbaru.</span></h1>
          <p className='mt-5 text-base leading-7 text-slate-600'>Informasi kegiatan, jadwal, dan kabar penting untuk keluarga besar Sekolah Cendekia.</p>
        </div>
        {announcements.length ? (
          <div className='mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {announcements.map((item) => (
              <article key={item.slug} className='group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-lg'>
                <Link href={`/pengumuman/${encodeURIComponent(item.slug)}`} className='flex h-full flex-col focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-school-blue'>
                  {item.image ? <img src={item.image} alt='' className='aspect-[16/9] w-full object-cover' loading='lazy' /> : <div aria-hidden='true' className='flex aspect-[16/9] items-center justify-center bg-sky-50 text-sky-300'><svg viewBox='0 0 24 24' className='h-14 w-14 fill-none stroke-current' strokeWidth='1.4' strokeLinecap='round' strokeLinejoin='round'><path d='M4 9h5l11-5v16L9 15H4V9ZM9 9v6M6 15l1 6h4l-2-6M1 10v4' /></svg></div>}
                  <div className='flex flex-1 flex-col p-6'>
                    <p className='text-xs font-semibold text-school-blue'>{item.date}</p>
                    <h2 className='mt-3 text-xl font-bold leading-snug text-school-navy group-hover:text-school-blue'>{item.title}</h2>
                    <p className='mt-3 line-clamp-3 text-sm leading-6 text-slate-600'>{item.summary}</p>
                    <span className='mt-auto pt-6 text-sm font-bold text-school-blue'>Baca selengkapnya <span aria-hidden='true'>?</span></span>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        ) : <p className='mt-10 rounded-2xl border border-sky-100 bg-white p-8 text-slate-600'>Belum ada pengumuman saat ini.</p>}
        <Link href='/#pengumuman' className='mt-10 inline-flex items-center gap-2 text-sm font-bold text-school-blue hover:underline'><span aria-hidden='true'>?</span> Kembali ke beranda</Link>
      </div>
    </main>
  )
}
