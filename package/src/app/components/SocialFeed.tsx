import type { CmsEntry } from '../cms-content'

type Platform = 'instagram' | 'tiktok'

// Validate links again at the rendering boundary, including any imported records.
function validPostUrl(value: string, platform: Platform) {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return false
    if (platform === 'instagram') return ['instagram.com', 'www.instagram.com', 'm.instagram.com'].includes(url.hostname)
      && /^\/(p|reel|reels|tv)\/[A-Za-z0-9_-]+\/?$/.test(url.pathname)
    return (['tiktok.com', 'www.tiktok.com', 'm.tiktok.com'].includes(url.hostname) && /^\/@[^/]+\/(video|photo)\/[0-9]+\/?$/.test(url.pathname))
      || (['vm.tiktok.com', 'vt.tiktok.com'].includes(url.hostname) && /^\/[A-Za-z0-9]+\/?$/.test(url.pathname))
  } catch { return false }
}

function PlatformIcon({ platform }: { platform: Platform }) {
  return <svg viewBox='0 0 24 24' className='h-7 w-7 fill-none stroke-current' strokeWidth='1.7' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
    {platform === 'instagram' ? <><rect x='3' y='3' width='18' height='18' rx='5' /><circle cx='12' cy='12' r='4' /><circle cx='17.5' cy='6.5' r='.8' fill='currentColor' stroke='none' /></>
      : <path d='M14 3v12.5a4.5 4.5 0 1 1-4-4.47V15a1.5 1.5 0 1 0 1 1.4V3h3c.4 3 2.4 4.7 5 5v3c-2-.1-3.6-.7-5-1.8' />}
  </svg>
}

export default function SocialFeed({ platform, entries }: { platform: Platform; entries: CmsEntry[] }) {
  const name = platform === 'instagram' ? 'Instagram' : 'TikTok'
  const posts = entries.filter(entry => validPostUrl(entry.postUrl, platform))
  return <section id={platform} aria-labelledby={`${platform}-heading`} className={`${platform === 'instagram' ? 'bg-[#f7f9fc]' : 'bg-white'} py-8 sm:py-16`}>
    <div className='mx-auto max-w-7xl px-5 sm:px-8 lg:px-10'>
      <div className='mx-auto max-w-2xl text-center'>
        <h2 id={`${platform}-heading`} className='text-2xl font-black tracking-tight text-school-navy sm:text-4xl'>Feed <span className='text-sky-600'>{name}</span></h2>
        <p className='mt-3 text-sm leading-6 text-slate-600 sm:mt-4 sm:text-base sm:leading-7'>Cerita, kegiatan, dan momen seru keluarga Cendekia di {name}.</p>
      </div>
      {posts.length ? <div className='mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4'>
        {posts.map(post => <a key={post.slug} href={post.postUrl} target='_blank' rel='noopener noreferrer' aria-label={`${post.title} — buka di ${name} (tab baru)`} className='group flex flex-col overflow-hidden rounded-xl border border-slate-100 bg-white p-4 shadow-[0_8px_24px_-18px_rgba(15,23,42,.25)] transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-school-blue sm:p-5'>
          {post.imageUrl ? <div className='aspect-video overflow-hidden rounded-lg bg-sky-50'><img src={post.imageUrl} alt='' loading='lazy' className='h-full w-full object-cover transition duration-300 group-hover:scale-105' /></div>
            : <div className='flex aspect-video items-center justify-center rounded-lg bg-sky-50 text-school-blue'><PlatformIcon platform={platform} /></div>}
          <p className='mt-5 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-school-blue'>{name}{post.category && <span className='truncate text-slate-500'>/ {post.category}</span>}</p>
          <h3 className='mt-3 text-[15px] font-bold leading-snug text-slate-900 sm:text-base'>{post.title}</h3>
          <time dateTime={post.publishedAt} className='mt-2 text-xs text-slate-500'>{new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(new Date(post.publishedAt.endsWith('Z') ? post.publishedAt : `${post.publishedAt}Z`))}</time>
          {post.summary && <p className='mt-3 line-clamp-3 text-sm leading-6 text-slate-600'>{post.summary}</p>}
          <span className='mt-auto flex items-center justify-between gap-3 pt-5 text-sm font-bold text-school-blue'>Lihat di {name}<span aria-hidden='true'>&#8599;</span></span>
        </a>)}
      </div> : <div className='mt-6 rounded-xl border border-dashed border-sky-200 bg-white px-5 py-10 text-center sm:mt-8'>
        <span className='mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-school-blue'><PlatformIcon platform={platform} /></span>
        <p className='mt-4 text-sm text-slate-500'>Postingan {name} sekolah akan tampil di sini.</p>
      </div>}
    </div>
  </section>
}
