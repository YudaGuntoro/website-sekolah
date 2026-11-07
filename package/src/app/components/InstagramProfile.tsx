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

  return <section id='instagram' aria-labelledby='instagram-heading' className='bg-[#f7f9fc] py-10 sm:py-16'>
    <div className='mx-auto max-w-7xl px-3 sm:px-8 lg:px-10'>
      <div className='relative isolate grid items-center gap-7 overflow-hidden rounded-[28px] border border-[#dce8f4] bg-gradient-to-br from-white via-[#f0f7ff] to-[#e8f2fc] p-0 shadow-[0_20px_65px_-45px_rgba(16,45,78,.3)] sm:gap-10 sm:rounded-[36px] sm:p-8 lg:grid-cols-[.85fr_1.15fr] lg:gap-12 lg:p-10'>
      <div aria-hidden='true' className='pointer-events-none absolute -left-36 -top-44 -z-10 h-[30rem] w-[30rem] rounded-full border-[60px] border-sky-100/40' />
      <div className='mx-auto w-full max-w-[540px] px-5 pb-2 pt-6 text-center sm:px-0 sm:py-3 lg:mx-0 lg:max-w-sm lg:py-10 lg:text-left'>
        <h2 id='instagram-heading' className='text-3xl font-black leading-[1.05] tracking-tight text-school-navy sm:text-5xl lg:text-6xl'>Feed <span className='text-school-blue lg:block'>Instagram</span></h2>
        <a href={profileUrl} target='_blank' rel='noopener noreferrer' className='mt-6 inline-flex max-w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-school-blue px-4 py-3 text-xs font-bold text-white sm:px-5 sm:text-sm shadow-sm transition hover:-translate-y-0.5 hover:bg-school-navy focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-school-blue motion-reduce:transform-none'>
          <svg viewBox='0 0 24 24' className='h-[18px] w-[18px] shrink-0 fill-none stroke-current' strokeWidth='1.7' aria-hidden='true'><rect x='3' y='3' width='18' height='18' rx='5' /><circle cx='12' cy='12' r='4' /><circle cx='17.5' cy='6.5' r='.8' fill='currentColor' stroke='none' /></svg>
          Follow @smpitcendekia <span aria-hidden='true'>↗</span>
        </a>
        <p className='mt-6 text-sm leading-7 text-slate-600 sm:text-base sm:leading-8'>Prestasi yang membanggakan, keseruan di kelas, dan momen kecil yang berarti. Ikuti keseharian keluarga Cendekia lebih dekat.</p>
      </div>
      <div className='relative mx-auto w-full min-w-0 max-w-[540px] lg:justify-self-end'>
        <div aria-hidden='true' className='pointer-events-none absolute -inset-6 -z-10 rounded-[48px] bg-sky-200/35 blur-2xl' />
        <div className='rounded-[24px] bg-gradient-to-br from-sky-200 via-[#d8e6f4] to-amber-200/70 p-px shadow-[0_18px_45px_-22px_rgba(16,45,78,.25)] sm:rounded-[28px]'>
          <div className='overflow-hidden rounded-[23px] bg-white p-0.5 sm:rounded-[27px] sm:p-2.5'>
        <div className={`relative overflow-hidden rounded-[18px] bg-white ${status === 'loading' ? 'min-h-[420px]' : ''}`} aria-busy={status === 'loading'}>
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
        <div className='px-2 pb-2 pt-3 sm:px-2.5 sm:pb-2.5'>
          <a href={profileUrl} target='_blank' rel='noopener noreferrer' className='group flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-[#dce8f4] bg-[#f2f7fd] px-4 py-3 text-sm font-semibold text-school-blue transition-colors hover:border-school-blue hover:bg-school-blue hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-school-blue'>
            <span className='flex items-center gap-2.5'><svg viewBox='0 0 24 24' className='h-5 w-5 shrink-0' fill='none' stroke='currentColor' strokeWidth='1.7' aria-hidden='true'><rect x='3' y='3' width='18' height='18' rx='5' /><circle cx='12' cy='12' r='4' /><circle cx='17.5' cy='6.5' r='.8' fill='currentColor' stroke='none' /></svg>Lihat semua postingan</span>
            <span className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-school-blue ring-1 ring-sky-100 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none'><svg viewBox='0 0 20 20' className='h-4 w-4' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'><path d='M5 15 15 5M5 5h10v10' /></svg></span>
          </a>
        </div>
          </div>
        </div>
      </div>
      </div>
    </div>
    <Script id='instagram-profile-embed' src='https://www.instagram.com/embed.js' strategy='lazyOnload' onReady={processProfile} onError={() => setStatus('unavailable')} />
  </section>
}
