'use client'

import { useEffect, useRef, useState } from 'react'
import Script from 'next/script'

const profileUrl = 'https://www.instagram.com/smpitcendekia/'

function processProfile() {
  const instagram = (window as Window & { instgrm?: { Embeds: { process: () => void } } }).instgrm
  instagram?.Embeds.process()
}

export default function InstagramProfile() {
  const container = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading')

  useEffect(() => {
    const element = container.current
    if (!element) return
    let frame: HTMLIFrameElement | null = null
    const timeout = window.setTimeout(() => setStatus(current => current === 'ready' ? current : 'unavailable'), 15000)
    const loaded = () => { window.clearTimeout(timeout); setStatus('ready') }
    const observeFrame = () => {
      const next = element.querySelector('iframe')
      if (next && next !== frame) {
        frame?.removeEventListener('load', loaded)
        frame = next
        frame.title = 'Profil Instagram SMPIT Cendekia'
        frame.addEventListener('load', loaded)
      }
    }
    const observer = new MutationObserver(observeFrame)
    observer.observe(element, { childList: true, subtree: true })
    observeFrame()
    processProfile()
    return () => { observer.disconnect(); frame?.removeEventListener('load', loaded); window.clearTimeout(timeout) }
  }, [])

  return <section id='instagram' aria-labelledby='instagram-heading' className='bg-[#f7f9fc] py-8 sm:py-16'>
    <div className='mx-auto max-w-7xl px-5 sm:px-8 lg:px-10'>
      <div className='mx-auto max-w-2xl text-center'>
        <h2 id='instagram-heading' className='text-2xl font-black tracking-tight text-school-navy sm:text-4xl'>Feed <span className='text-sky-600'>Instagram</span></h2>
        <a href={profileUrl} target='_blank' rel='noopener noreferrer' className='mt-4 inline-flex max-w-full items-center justify-center gap-2 rounded-full bg-school-blue px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-school-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-school-blue motion-reduce:transform-none'>
          <svg viewBox='0 0 24 24' className='h-[18px] w-[18px] shrink-0 fill-none stroke-current' strokeWidth='1.7' aria-hidden='true'><rect x='3' y='3' width='18' height='18' rx='5' /><circle cx='12' cy='12' r='4' /><circle cx='17.5' cy='6.5' r='.8' fill='currentColor' stroke='none' /></svg>
          Follow @smpitcendekia <span aria-hidden='true'>↗</span>
        </a>
        <p className='mt-3 text-sm leading-6 text-slate-600 sm:mt-4 sm:text-base sm:leading-7'>Cerita, kegiatan, dan momen seru keluarga Cendekia di Instagram.</p>
      </div>
      <div className='mx-auto mt-8 max-w-[540px] sm:mt-10'>
        <div className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm ${status === 'loading' ? 'min-h-[420px]' : ''}`} aria-busy={status === 'loading'}>
          <div ref={container} className='[&_iframe]:!m-0 [&_iframe]:!w-full [&_iframe]:!min-w-0 [&_iframe]:!max-w-full [&_iframe]:!border-0 [&_iframe]:!shadow-none'>
            <blockquote className='instagram-media' data-instgrm-permalink={profileUrl} data-instgrm-version='14' style={{ margin: 0, width: '100%', minWidth: 0 }}>
              <a href={profileUrl} target='_blank' rel='noopener noreferrer' className='block px-5 py-12 text-center text-sm font-semibold text-school-blue'>Lihat profil @smpitcendekia di Instagram</a>
            </blockquote>
          </div>
          {status === 'loading' && <div role='status' aria-label='Memuat profil Instagram' className='pointer-events-none absolute inset-0 bg-white p-5'>
            <div aria-hidden='true' className='animate-pulse motion-reduce:animate-none'>
              <div className='flex items-center gap-4 pb-5'><div className='h-16 w-16 rounded-full bg-slate-100' /><div className='flex-1 space-y-3'><div className='h-4 w-2/3 rounded bg-slate-100' /><div className='h-3 w-1/2 rounded bg-slate-100' /></div></div>
              <div className='grid grid-cols-3 gap-1'>{Array.from({ length: 6 }, (_, index) => <div key={index} className='aspect-square rounded bg-slate-100' />)}</div>
            </div>
            <span className='sr-only'>Memuat profil Instagram</span>
          </div>}
          {status === 'unavailable' && <p role='status' className='px-5 pb-5 text-center text-sm leading-6 text-slate-500'>Profil belum dapat dimuat. Buka Instagram melalui tombol di bawah.</p>}
        </div>
        <div className='mt-7 text-center'><a href={profileUrl} target='_blank' rel='noopener noreferrer' className='inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-5 py-3 text-sm font-bold text-school-blue transition hover:border-school-blue hover:bg-sky-50'>Lihat lebih banyak <span aria-hidden='true'>↗</span></a></div>
      </div>
    </div>
    <Script id='instagram-profile-embed' src='https://www.instagram.com/embed.js' strategy='lazyOnload' onReady={processProfile} onError={() => setStatus('unavailable')} />
  </section>
}
