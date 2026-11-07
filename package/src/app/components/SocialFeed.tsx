import type { CmsEntry } from '../cms-content'
import SocialCard from './SocialCard'
import Link from 'next/link'
import { validPostUrl, type SocialPlatform as Platform } from '../social-post-url'

function PlatformIcon({ platform }: { platform: Platform }) {
  return <svg viewBox='0 0 24 24' className='h-7 w-7 fill-none stroke-current' strokeWidth='1.7' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
    {platform === 'instagram' ? <><rect x='3' y='3' width='18' height='18' rx='5' /><circle cx='12' cy='12' r='4' /><circle cx='17.5' cy='6.5' r='.8' fill='currentColor' stroke='none' /></>
      : <path d='M14 3v12.5a4.5 4.5 0 1 1-4-4.47V15a1.5 1.5 0 1 0 1 1.4V3h3c.4 3 2.4 4.7 5 5v3c-2-.1-3.6-.7-5-1.8' />}
  </svg>
}

export function getSocialPosts(entries: CmsEntry[], platform: Platform) {
  const posts = entries.filter(entry => validPostUrl(entry.postUrl, platform))
  // Preserve the API's order for equal dates (newest Id first).
  return posts.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
}

export default function SocialFeed({ platform, entries }: { platform: Platform; entries: CmsEntry[] }) {
  const name = platform === 'instagram' ? 'Instagram' : 'TikTok'
  const allPosts = getSocialPosts(entries, platform)
  const posts = allPosts.slice(0, 4)
  return <section id={platform} aria-labelledby={`${platform}-heading`} className={`${platform === 'instagram' ? 'bg-[#f7f9fc]' : 'bg-white'} py-8 sm:py-16`}>
    <div className='mx-auto max-w-7xl px-5 sm:px-8 lg:px-10'>
      <div className='mx-auto max-w-2xl text-center'>
        <h2 id={`${platform}-heading`} className='text-2xl font-black tracking-tight text-school-navy sm:text-4xl'>Feed <span className='text-sky-600'>{name}</span></h2>
        {platform === 'instagram' && <a href='https://www.instagram.com/smpitcendekia/' target='_blank' rel='noopener noreferrer' className='mt-4 inline-flex max-w-full items-center justify-center gap-2 rounded-full bg-school-gold px-5 py-3 text-sm font-bold text-school-navy shadow-sm transition hover:-translate-y-0.5 hover:bg-school-butter focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-school-blue motion-reduce:transform-none'>
          <svg viewBox='0 0 24 24' className='h-[18px] w-[18px] shrink-0 fill-none stroke-current' strokeWidth='1.7' aria-hidden='true'><rect x='3' y='3' width='18' height='18' rx='5' /><circle cx='12' cy='12' r='4' /><circle cx='17.5' cy='6.5' r='.8' fill='currentColor' stroke='none' /></svg>
          Follow @smpitcendekia <span aria-hidden='true'>↗</span>
        </a>}
        <p className='mt-3 text-sm leading-6 text-slate-600 sm:mt-4 sm:text-base sm:leading-7'>Cerita, kegiatan, dan momen seru keluarga Cendekia di {name}.</p>
      </div>
      {posts.length ? <div className={`mx-auto mt-8 grid auto-rows-fr items-stretch gap-5 sm:mt-10 ${posts.length === 1 ? 'max-w-[320px]' : posts.length === 2 ? 'max-w-[660px] sm:grid-cols-2' : posts.length === 3 ? 'max-w-[1000px] sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2 xl:grid-cols-4'}`}>
        {posts.map(post => <SocialCard key={post.slug} post={post} platform={platform} />)}
      </div> : <div className='mt-6 rounded-xl border border-dashed border-sky-200 bg-white px-5 py-10 text-center sm:mt-8'>
        <span className='mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-school-blue'><PlatformIcon platform={platform} /></span>
        <p className='mt-4 text-sm text-slate-500'>Postingan {name} sekolah akan tampil di sini.</p>
      </div>}
      {posts.length > 0 && <div className='mt-7 text-center'>
        <Link href={`/${platform}`} className='inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-5 py-3 text-sm font-bold text-school-blue transition hover:border-school-blue hover:bg-sky-50'>Lihat lebih banyak <span aria-hidden='true'>→</span></Link>
      </div>}
    </div>
  </section>
}
