'use client'

import { useEffect, useRef, useState } from 'react'
import type { CmsEntry } from '../cms-content'

function SocialIcon({ platform, className = 'h-4 w-4' }: { platform: 'instagram' | 'tiktok'; className?: string }) {
  return <svg viewBox='0 0 24 24' className={`${className} fill-none stroke-current`} strokeWidth='1.7' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
    {platform === 'instagram' ? <><rect x='3' y='3' width='18' height='18' rx='5' /><circle cx='12' cy='12' r='4' /><circle cx='17.5' cy='6.5' r='.8' fill='currentColor' stroke='none' /></> : <path d='M14 3v12.5a4.5 4.5 0 1 1-4-4.47V15a1.5 1.5 0 1 0 1 1.4V3h3c.4 3 2.4 4.7 5 5v3c-2-.1-3.6-.7-5-1.8' />}
  </svg>
}

export default function SocialCard({ post, platform }: { post: CmsEntry; platform: 'instagram' | 'tiktok' }) {
  const name = platform === 'instagram' ? 'Instagram' : 'TikTok'
  const [failedSource, setFailedSource] = useState('')
  const image = useRef<HTMLImageElement>(null)
  const source = `/api/social-image?${new URLSearchParams({ platform, slug: post.slug, post: post.postUrl })}`
  const hasPhoto = source && failedSource !== source
  useEffect(() => {
    // A cached failure can occur before React attaches the error handler.
    if (source && image.current?.complete && image.current.naturalWidth === 0) setFailedSource(source)
  }, [source])
  const title = post.title.startsWith(`Postingan ${name} `) ? 'Cerita dari Cendekia' : post.title
  const date = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(new Date(post.publishedAt.endsWith('Z') ? post.publishedAt : `${post.publishedAt}Z`))

  return <article className='group min-w-0'>
    <a href={post.postUrl} target='_blank' rel='noopener noreferrer' aria-label={`${title} — buka di ${name} (tab baru)`} className='block overflow-hidden rounded-[24px] border border-slate-200/80 bg-white p-2 shadow-[0_8px_30px_-22px_rgba(15,42,76,.4)] transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_18px_40px_-22px_rgba(15,42,76,.35)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-school-blue motion-reduce:transform-none'>
      <div className='relative aspect-[4/5] overflow-hidden rounded-[18px] bg-[#eaf3fc]'>
        {hasPhoto ? <img ref={image} src={source} alt={title} loading='lazy' onError={() => setFailedSource(source)} className='h-full w-full object-cover transition duration-500 group-hover:scale-[1.04] motion-reduce:transform-none' /> : <div className='absolute inset-0 flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-sky-100 via-blue-50 to-amber-50 px-6 text-center'>
          <span aria-hidden='true' className='absolute -right-8 -top-10 h-44 w-44 rounded-full border-[24px] border-white/60' />
          <span aria-hidden='true' className='absolute -bottom-12 -left-10 h-44 w-44 rounded-full bg-sky-200/40' />
          <SocialIcon platform={platform} className='relative h-12 w-12 text-school-blue' />
          <span className='relative mt-5 text-[10px] font-extrabold uppercase tracking-[.2em] text-school-blue'>Cerita Cendekia</span>
          <span className='relative mt-3 text-xl font-black leading-tight tracking-tight text-school-navy'>{title}</span>
        </div>}
        <span className='absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-white/60 bg-white/95 px-2.5 py-1.5 text-[10px] font-extrabold tracking-wide text-school-navy shadow-sm'><SocialIcon platform={platform} />{name}</span>
        <span aria-hidden='true' className='absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg text-school-navy shadow-sm transition group-hover:bg-school-blue group-hover:text-white'>↗</span>
      </div>
      <div className='px-2 pb-2 pt-4'>
        <div className='flex items-center justify-between gap-2 text-[10px] font-semibold'>
          <span className='truncate uppercase tracking-[.12em] text-school-blue'>{post.category || 'Momen sekolah'}</span>
          <time dateTime={post.publishedAt} className='shrink-0 text-slate-400'>{date}</time>
        </div>
        <h3 className='mt-2 line-clamp-2 text-base font-extrabold leading-snug tracking-tight text-school-navy'>{title}</h3>
        {post.summary && <p className='mt-2 line-clamp-2 text-xs leading-5 text-slate-500'>{post.summary}</p>}
        <div className='mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold text-school-blue'>Buka {name} <span aria-hidden='true'>↗</span></div>
      </div>
    </a>
  </article>
}
