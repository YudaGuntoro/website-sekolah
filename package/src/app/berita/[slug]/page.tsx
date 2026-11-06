import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getSchoolContent } from '../../cms-content'

type PageProps = { params: Promise<{ slug: string }> }


export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const { schoolNews } = await getSchoolContent()
  const news = schoolNews.find((item) => item.slug === slug)
  if (!news) notFound()
  return { title: news.title, description: news.text }
}

export default async function NewsDetailPage({ params }: PageProps) {
  const { slug } = await params
  const { schoolNews } = await getSchoolContent()
  const news = schoolNews.find((item) => item.slug === slug)
  if (!news) notFound()

  const relatedNews = schoolNews.filter((item) => item.slug !== slug)

  return (
    <main className='min-h-[70vh] bg-[#f7faff] px-5 py-12 sm:px-8 sm:py-16'>
      <div className='mx-auto max-w-4xl'>
        <nav aria-label='Breadcrumb' className='flex flex-wrap items-center gap-2 text-sm text-slate-500'>
          <Link href='/' className='text-school-blue hover:underline'>Beranda</Link>
          <span aria-hidden='true'>/</span>
          <Link href='/berita' className='text-school-blue hover:underline'>Berita</Link>
          <span aria-hidden='true'>/</span>
          <span aria-current='page'>{news.title}</span>
        </nav>
        <article className='mt-8 overflow-hidden rounded-3xl border border-sky-100 bg-white'>
          <header className='border-b border-sky-100 bg-sky-50/60 p-6 sm:p-10'>
            <p className='text-xs font-bold uppercase tracking-[.15em] text-school-blue'>{news.category}</p>
            <h1 className='mt-4 text-3xl font-black leading-tight tracking-tight text-school-navy sm:text-5xl'>{news.title}</h1>
            <time dateTime={news.publishedAt} className='mt-4 block text-sm text-slate-500'>{news.date}</time>
          </header>
          <div className='p-6 sm:p-10'>
            {news.image && <img src={news.image} alt={news.title} className='mb-6 max-h-96 w-full rounded-xl object-cover' />}
            <p className='text-base leading-8 text-slate-600 sm:text-lg'>{news.text}</p>
            <div className='mt-6 space-y-5 border-t border-sky-100 pt-6 text-base leading-8 text-slate-600'>
              {news.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
            <Link href='/berita' className='mt-8 inline-flex items-center gap-2 rounded-full bg-school-blue px-5 py-3 text-sm font-bold text-white transition hover:bg-school-navy'><span aria-hidden='true'>&#8592;</span> Semua berita</Link>
          </div>
        </article>
        <aside className='mt-10' aria-labelledby='related-news-heading'>
          <h2 id='related-news-heading' className='text-xl font-bold text-school-navy'>Berita lainnya</h2>
          <div className='mt-4 grid gap-4 sm:grid-cols-3'>
            {relatedNews.map((item) => (
              <Link key={item.slug} href={`/berita/${item.slug}`} className='rounded-2xl border border-sky-100 bg-white p-5 transition hover:border-sky-300 hover:bg-sky-50'>
                <p className='text-xs text-school-blue'>{item.category}</p>
                <h3 className='mt-2 font-bold leading-snug text-school-navy'>{item.title}</h3>
              </Link>
            ))}
          </div>
        </aside>
      </div>
    </main>
  )
}
