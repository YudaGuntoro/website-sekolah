import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getActivities } from '../activities'
import ActivityPhoto from '../ActivityPhoto'

type PageProps = { params: Promise<{ slug: string }> }

async function activityFor(slug: string) {
  const activity = (await getActivities()).find(item => item.slug === slug)
  if (!activity) notFound()
  return activity
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const activity = await activityFor((await params).slug)
  return { title: `${activity.title} | Ekstrakurikuler`, description: activity.summary || `Kenali kegiatan ekstrakurikuler ${activity.title} di SMPIT Cendekia.` }
}

export default async function ActivityDetail({ params }: PageProps) {
  const activity = await activityFor((await params).slug)
  const paragraphs = activity.body.split(/\n\s*\n/).filter(paragraph => paragraph.trim())
  return <main className='min-h-[70vh] bg-[#f3f8fd] px-5 py-10 sm:px-8 sm:py-14'>
    <div className='mx-auto max-w-6xl'>
      <nav aria-label='Breadcrumb' className='flex flex-wrap gap-2 text-sm text-slate-500'>
        <Link href='/' className='text-school-blue hover:underline'>Beranda</Link><span aria-hidden='true'>/</span>
        <Link href='/ekstrakurikuler' className='text-school-blue hover:underline'>Ekstrakurikuler</Link><span aria-hidden='true'>/</span>
        <span aria-current='page'>{activity.title}</span>
      </nav>
      <article className='mt-7 overflow-hidden rounded-3xl border border-sky-100 bg-white shadow-[0_16px_60px_-40px_rgba(16,45,78,.25)]'>
        <header className='grid items-center gap-7 p-6 sm:p-9 lg:grid-cols-[1.1fr_1fr] lg:gap-10'>
          <ActivityPhoto src={activity.imageUrl} title={activity.title} detail />
          <div>
            <p className='text-xs font-bold uppercase tracking-[.16em] text-school-blue'>Ekstrakurikuler{activity.category ? ` · ${activity.category}` : ''}</p>
            <h1 className='mt-4 text-3xl font-black leading-tight tracking-tight text-school-navy sm:text-5xl'>{activity.title}</h1>
            {activity.summary && <p className='mt-5 text-base leading-8 text-slate-600'>{activity.summary}</p>}
            <dl className='mt-6 border-t border-sky-100 pt-5'><dt className='text-xs font-semibold uppercase tracking-wider text-slate-500'>Pelatih / pembina</dt><dd className='mt-2 text-lg font-bold text-school-navy'>{activity.coachName || 'Informasi pelatih menyusul'}</dd></dl>
          </div>
        </header>
        <section className='border-t border-sky-100 px-6 py-8 sm:px-9 sm:py-10' aria-labelledby='activity-training'>
          <h2 id='activity-training' className='text-2xl font-bold tracking-tight text-school-navy'>Kegiatan dan latihan</h2>
          <div className='mt-5 max-w-3xl space-y-5 text-base leading-8 text-slate-600'>
            {paragraphs.length ? paragraphs.map((paragraph, index) => <p key={index} className='whitespace-pre-line break-words'>{paragraph}</p>) : <p>Rincian kegiatan dan latihan akan diinformasikan oleh sekolah. Silakan hubungi sekolah untuk mengetahui kegiatan yang tersedia.</p>}
          </div>
        </section>
        <footer className='flex flex-wrap items-center justify-between gap-4 border-t border-sky-100 bg-sky-50/50 px-6 py-5 sm:px-9'>
          <Link href='/ekstrakurikuler' className='text-sm font-semibold text-school-blue hover:underline'>← Semua ekstrakurikuler</Link>
          <Link href='/#hubungi-kami' className='inline-flex min-h-11 items-center rounded-full bg-school-blue px-5 py-3 text-sm font-semibold text-white hover:bg-school-navy'>Tanya kegiatan ini ↗</Link>
        </footer>
      </article>
    </div>
  </main>
}
