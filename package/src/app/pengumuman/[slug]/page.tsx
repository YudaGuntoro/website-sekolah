import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSchoolContent } from '../../cms-content'
import { pageMetadata } from '../../seo'

type PageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const { announcements } = await getSchoolContent()
  const item = announcements.find((announcement) => announcement.slug === slug)
  if (!item) notFound()
  return pageMetadata(`/pengumuman/${encodeURIComponent(slug)}`, item.title, item.summary, { image: item.image, publishedTime: item.publishedAt || undefined })
}

export default async function AnnouncementDetailPage({ params }: PageProps) {
  const { slug } = await params
  const { announcements } = await getSchoolContent()
  const item = announcements.find((announcement) => announcement.slug === slug)
  if (!item) notFound()

  return (
    <main className='min-h-[70vh] bg-[#f7faff] px-5 py-12 sm:px-8 sm:py-16'>
      <div className='mx-auto max-w-4xl'>
        <nav aria-label='Breadcrumb' className='flex flex-wrap items-center gap-2 text-sm text-slate-500'>
          <Link href='/' className='text-school-blue hover:underline'>Beranda</Link><span aria-hidden='true'>/</span>
          <Link href='/pengumuman' className='text-school-blue hover:underline'>Pengumuman</Link><span aria-hidden='true'>/</span>
          <span aria-current='page'>{item.title}</span>
        </nav>
        <article className='mt-8 overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-sm'>
          <header className='border-b border-sky-100 bg-sky-50/60 p-6 sm:p-10'>
            <p className='text-xs font-bold uppercase tracking-[.15em] text-school-blue'>Pengumuman sekolah</p>
            <h1 className='mt-4 text-3xl font-black leading-tight tracking-tight text-school-navy sm:text-5xl'>{item.title}</h1>
            <p className='mt-4 text-sm text-slate-500'>{item.date}</p>
          </header>
          <div className='p-6 sm:p-10'>
            {item.image && <img src={item.image} alt={item.title} className='mb-8 max-h-[32rem] w-full rounded-xl object-contain' />}
            <div className='whitespace-pre-line text-base leading-8 text-slate-700'>{item.text}</div>
            <Link href='/pengumuman' className='mt-10 inline-flex items-center gap-2 rounded-full bg-school-blue px-5 py-3 text-sm font-bold text-white transition hover:bg-school-navy'><span aria-hidden='true'>?</span> Semua pengumuman</Link>
          </div>
        </article>
      </div>
    </main>
  )
}
