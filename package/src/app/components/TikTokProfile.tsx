'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Script from 'next/script'

const username = 'smpitcendekiapurwakarta'
const profileUrl = `https://www.tiktok.com/@${username}`
type TikTokWindow = Window & { tiktokEmbed?: { lib?: { render: (nodes: HTMLElement[]) => Promise<unknown> | void } } }

function TikTokIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return <svg viewBox='0 0 24 24' className={className} fill='currentColor' aria-hidden='true'><path d='M19.6 7.1a5.8 5.8 0 0 1-3.7-1.3v8.1a5.7 5.7 0 1 1-5-5.7v3a2.8 2.8 0 1 0 2 2.7V2.8h3a5.8 5.8 0 0 0 3.7 3.7v.6Z' /></svg>
}

export default function TikTokProfile() {
  const container = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(false)
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading')
  const processProfile = useCallback(() => {
    const nodes = Array.from(container.current?.querySelectorAll<HTMLElement>('blockquote.tiktok-embed:not([id])') || [])
    const library = (window as TikTokWindow).tiktokEmbed?.lib
    if (library && nodes.length) Promise.resolve(library.render(nodes)).catch(() => setStatus('unavailable'))
  }, [])

  useEffect(() => {
    const element = container.current
    if (!element) return
    if (!('IntersectionObserver' in window)) { setActive(true); return }
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { setActive(true); observer.disconnect() }
    }, { rootMargin: '1000px' })
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const element = container.current
    if (!element || !active) return
    let frame: HTMLIFrameElement | null = null
    const timeout = window.setTimeout(() => setStatus(current => current === 'ready' ? current : 'unavailable'), 20000)
    const loaded = () => { window.clearTimeout(timeout); setStatus('ready') }
    const observeFrame = () => {
      const next = element.querySelector('iframe')
      if (next && next !== frame) {
        frame?.removeEventListener('load', loaded)
        frame = next
        frame.title = 'Profil TikTok SMPIT Cendekia Purwakarta'
        frame.addEventListener('load', loaded)
      }
    }
    const observer = new MutationObserver(observeFrame)
    observer.observe(element, { childList: true, subtree: true })
    observeFrame()
    processProfile()
    return () => { observer.disconnect(); frame?.removeEventListener('load', loaded); window.clearTimeout(timeout) }
  }, [active, processProfile])

  return <section id='tiktok' aria-labelledby='tiktok-heading' className='bg-white py-10 sm:py-16'>
    <div className='mx-auto max-w-7xl px-3 sm:px-8 lg:px-10'>
      <div className='relative isolate grid items-center gap-7 overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-white via-[#f4f8fa] to-[#fdf3f6] p-0 shadow-[0_20px_65px_-45px_rgba(16,45,78,.3)] sm:gap-10 sm:rounded-[36px] sm:p-8 lg:grid-cols-[1.15fr_.85fr] lg:gap-12 lg:p-10'>
        <div aria-hidden='true' className='pointer-events-none absolute -bottom-24 -left-24 -z-10 h-80 w-80 rounded-full bg-cyan-100/40 blur-3xl' />
        <div aria-hidden='true' className='pointer-events-none absolute -right-20 -top-24 -z-10 h-72 w-72 rounded-full bg-rose-100/50 blur-3xl' />
        <div className='order-2 mx-auto w-full min-w-0 max-w-[540px] px-5 pb-6 pt-2 text-center sm:px-0 sm:py-3 lg:mx-0 lg:max-w-sm lg:justify-self-end lg:py-10 lg:text-left'>
          <h2 id='tiktok-heading' className='text-3xl font-black leading-[1.05] tracking-tight text-school-navy sm:text-5xl lg:text-6xl'>Feed <span className='text-slate-900 lg:block'>TikTok</span></h2>
          <div aria-hidden='true' className='mt-5 flex justify-center gap-1 lg:justify-start'><span className='h-1 w-10 rounded-full bg-cyan-400' /><span className='h-1 w-5 rounded-full bg-rose-400' /></div>
          <a href={profileUrl} target='_blank' rel='noopener noreferrer' className='mt-6 inline-flex max-w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-xs font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-school-blue motion-reduce:transform-none sm:px-5 sm:text-sm'>
            <TikTokIcon className='h-[18px] w-[18px] shrink-0' /><span>Ikuti di TikTok</span><span aria-hidden='true'>↗</span>
          </a>
          <p className='mt-6 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8'>Cerita kegiatan, kreativitas, dan momen seru keluarga Cendekia. Lihat keseharian sekolah melalui video TikTok kami.</p>
        </div>
        <div className='relative order-1 mx-auto w-full min-w-0 max-w-[540px] lg:justify-self-start'>
          <div aria-hidden='true' className='pointer-events-none absolute -inset-6 -z-10 rounded-[48px] bg-cyan-100/40 blur-2xl' />
          <div className='rounded-[24px] bg-gradient-to-br from-cyan-300/70 via-slate-200 to-rose-300/70 p-px shadow-[0_18px_45px_-22px_rgba(15,23,42,.3)] sm:rounded-[28px]'>
          <div className='overflow-hidden rounded-[23px] bg-white p-0.5 sm:rounded-[27px] sm:p-2.5'>
          <div className={`relative overflow-hidden rounded-[18px] bg-white ${status === 'loading' ? 'min-h-[420px]' : ''}`} aria-busy={status === 'loading'}>
            <div ref={container} className='[&_iframe]:!m-0 [&_iframe]:!w-full [&_iframe]:!min-w-0 [&_iframe]:!max-w-full [&_iframe]:!border-0 [&_iframe]:!shadow-none'>
              <blockquote className='tiktok-embed' cite={profileUrl} data-unique-id={username} data-embed-type='creator' data-embed-from='oembed' style={{ margin: 0, width: '100%', minWidth: 0, maxWidth: 720 }}>
                <section><a href={profileUrl} target='_blank' rel='noopener noreferrer' className='block px-5 py-12 text-center text-sm font-semibold text-school-blue'>Lihat profil @{username} di TikTok</a></section>
              </blockquote>
            </div>
            {status === 'loading' && <div role='status' aria-label='Memuat profil TikTok' className='pointer-events-none absolute inset-0 bg-white p-5'>
              <div aria-hidden='true' className='animate-pulse motion-reduce:animate-none'><div className='mb-6 flex gap-4'><div className='h-16 w-16 rounded-full bg-slate-100' /><div className='flex-1 space-y-3 pt-2'><div className='h-4 w-3/4 rounded bg-slate-100' /><div className='h-3 w-1/2 rounded bg-slate-100' /></div></div><div className='grid grid-cols-3 gap-2'>{[1,2,3].map(item => <div key={item} className='aspect-[3/4] rounded-lg bg-slate-100' />)}</div></div>
              <span className='sr-only'>Memuat profil TikTok</span>
            </div>}
            {status === 'unavailable' && <p role='status' className='px-5 pb-5 text-center text-sm leading-6 text-slate-500'>Profil TikTok belum dapat dimuat. Buka akun sekolah melalui tombol di bawah.</p>}
          </div>
          <div className='px-2 pb-2 pt-3 sm:px-2.5 sm:pb-2.5'>
            <a href={profileUrl} target='_blank' rel='noopener noreferrer' className='group flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-slate-900 bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-slate-700 hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-school-blue'>
              <span className='flex items-center gap-2.5'><TikTokIcon className='h-5 w-5 shrink-0' />Lihat semua video</span>
              <span className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-cyan-200 ring-1 ring-white/15 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none'><svg viewBox='0 0 20 20' className='h-4 w-4' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'><path d='M5 15 15 5M5 5h10v10' /></svg></span>
            </a>
          </div>
          </div>
          </div>
        </div>
      </div>
    </div>
    {active && <Script id='tiktok-profile-embed' src='https://www.tiktok.com/embed.js' strategy='afterInteractive' onReady={processProfile} onError={() => setStatus('unavailable')} />}
  </section>
}
