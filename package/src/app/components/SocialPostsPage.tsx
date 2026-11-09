import Link from 'next/link'
import { getCmsCollection } from '../cms-content'
import { getSocialPosts } from './SocialFeed'
import SocialCard from './SocialCard'

export default async function SocialPostsPage({ platform }: { platform: 'instagram' | 'tiktok' }) {
  const name = platform === 'instagram' ? 'Instagram' : 'TikTok'
  const posts = getSocialPosts(await getCmsCollection(platform) ?? [], platform)
  return <main className='min-h-[70vh] bg-[#f3f8fd]'>
    <section className='relative isolate overflow-hidden border-b border-sky-100 bg-[#f7f9fc]'>
      <div aria-hidden='true' className='pointer-events-none absolute inset-0 -z-10 opacity-70' style={{ backgroundImage: 'linear-gradient(rgba(30,101,168,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(30,101,168,.045) 1px, transparent 1px), radial-gradient(ellipse at 90% 10%, rgba(125,211,252,.2), transparent 42%)', backgroundSize: '38px 38px, 38px 38px, auto' }} />
      <div className='mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16 lg:px-10'>
        <div className='grid items-end gap-7 lg:grid-cols-[1.1fr_.9fr] lg:gap-12'>
          <div>
            <p className='text-xs font-extrabold uppercase tracking-[.18em] text-school-blue'>Cerita Cendekia</p>
            <h1 className='mt-4 text-4xl font-black leading-[1.06] tracking-tight text-school-navy sm:text-5xl lg:text-6xl'>Momen di <span className='text-school-blue'>{name}.</span></h1>
          </div>
          <p className='max-w-xl border-l-2 border-sky-300 py-1 pl-5 text-base leading-7 text-slate-600'>Kegiatan, prestasi, dan kebersamaan keluarga Cendekia. Temukan semua postingan sekolah, mulai dari yang terbaru.</p>
        </div>
        {posts.length ? <div className='mt-10 grid auto-rows-fr items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-4'>
          {posts.map(post => <SocialCard key={post.slug} post={post} platform={platform} />)}
        </div> : <p className='mt-10 rounded-2xl border border-dashed border-sky-200 bg-white px-5 py-12 text-center text-sm text-slate-500'>Postingan {name} sekolah akan tampil di sini.</p>}
        <div className='mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-sky-100 bg-white/80 p-5 sm:flex-row sm:items-center sm:px-6'>
          <p className='max-w-2xl text-sm leading-6 text-slate-600'>Ikuti cerita keseharian dan pencapaian murid SMPIT Cendekia.</p>
          <Link href={`/#${platform}`} className='inline-flex shrink-0 items-center gap-2 rounded-full bg-school-blue px-5 py-3 text-sm font-bold text-white transition hover:bg-school-navy'>Kembali ke beranda <span aria-hidden='true'>→</span></Link>
        </div>
      </div>
    </section>
  </main>
}
