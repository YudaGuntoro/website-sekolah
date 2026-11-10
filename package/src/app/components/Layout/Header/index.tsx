'use client'

import { useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import Link from 'next/link'
import Logo from './Logo'

const profileNavigation = [
  { label: 'Ekstrakurikuler', href: '/ekstrakurikuler' },
  { label: 'Fasilitas', href: '/fasilitas' },
  { label: 'Pimpinan dan Tenaga Pendidik', href: '/guru' },
  { label: 'Prestasi murid', href: '/prestasi' },
  { label: 'Sejarah sekolah', href: '/sejarah' },
  { label: 'Struktur organisasi', href: '/struktur-organisasi' },
  { label: 'Visi dan misi', href: '/#tentang' },
]

const informationNavigation = [
  { label: 'Berita', href: '/berita' },
  { label: 'Kegiatan rutin', href: '/kegiatan-rutin' },
  { label: 'OSIS (Organisasi Siswa Intra Sekolah)', href: '/osis' },
  { label: 'Pengumuman', href: '/pengumuman' },
  { label: 'Program unggulan', href: '/#program' },
  { label: 'SPMB (Sistem Penerimaan Murid Baru)', href: '/spmb' },
]

const mobileNavigation = [
  { label: 'Beranda', href: '/' },
  { label: 'LMP', href: '/lmp' },
  { label: 'SPMB', href: '/spmb' },
]

const mobileDropdowns = [
  { label: 'Profil', items: profileNavigation },
  { label: 'Informasi', items: informationNavigation },
]

function Chevron() {
  return <svg viewBox='0 0 16 16' className='h-3.5 w-3.5 fill-none stroke-current transition-transform group-open:rotate-180' strokeWidth='1.8' aria-hidden='true'><path d='m4 6 4 4 4-4' strokeLinecap='round' strokeLinejoin='round' /></svg>
}

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const headerRef = useRef<HTMLElement>(null)

  function closeMenus() {
    headerRef.current?.querySelectorAll('details[open]').forEach((dropdown) => dropdown.removeAttribute('open'))
    setMenuOpen(false)
  }

  useEffect(() => {
    function closeOnOutsideClick(event: PointerEvent) {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) {
        closeMenus()
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') closeMenus()
    }

    document.addEventListener('pointerdown', closeOnOutsideClick)
    document.addEventListener('keydown', closeOnEscape)
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick)
      document.removeEventListener('keydown', closeOnEscape)
    }
  }, [])

  function closeOtherDropdowns(event: MouseEvent<HTMLElement>) {
    const currentDropdown = event.currentTarget.closest('details')
    currentDropdown?.parentElement?.querySelectorAll('details[open]').forEach((dropdown) => {
      if (dropdown !== currentDropdown) dropdown.removeAttribute('open')
    })
  }

  return (
    <header ref={headerRef} onClick={(event) => {
      if ((event.target as HTMLElement).closest('a')) closeMenus()
    }} className='sticky top-0 z-50 border-b border-blue-800 bg-school-blue shadow-[0_4px_16px_-12px_rgba(4,23,44,.45)]'>
      <div className='mx-auto flex min-h-[56px] max-w-7xl items-center justify-between gap-5 px-5 sm:px-8 lg:px-10'>
        <Logo />

        <nav aria-label='Navigasi utama' className='hidden items-center gap-7 xl:flex'>
          <Link href='/' className='whitespace-nowrap text-sm font-semibold text-white transition hover:text-sky-300'>Beranda</Link>
          <Link href='/lmp' className='whitespace-nowrap text-sm font-semibold text-white transition hover:text-sky-300'>LMP</Link>
          <Link href='/spmb' className='whitespace-nowrap text-sm font-semibold text-white transition hover:text-sky-300'>SPMB</Link>
          <details className='group relative'>
          <summary onClick={closeOtherDropdowns} className='flex cursor-pointer list-none items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 group-open:bg-white/15 [&::-webkit-details-marker]:hidden'>Profil <Chevron /></summary>
            <div className='absolute left-0 top-full z-50 mt-3 w-64 rounded-2xl border border-white/10 bg-school-blue p-2 shadow-xl shadow-blue-950/25'>
              {profileNavigation.map((item) => <Link key={item.href} href={item.href} className='block rounded-xl px-3 py-2.5 text-sm font-semibold text-white/95 transition hover:bg-white/10 hover:text-white'>{item.label}</Link>)}
            </div>
          </details>
          <details className='group relative'>
          <summary onClick={closeOtherDropdowns} className='flex cursor-pointer list-none items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10 group-open:bg-white/15 [&::-webkit-details-marker]:hidden'>Informasi <Chevron /></summary>
            <div className='absolute left-0 top-full z-50 mt-3 w-60 rounded-2xl border border-white/10 bg-school-blue p-2 shadow-xl shadow-blue-950/25'>
              {informationNavigation.map((item) => <Link key={item.href} href={item.href} className='block rounded-xl px-3 py-2.5 text-sm font-semibold text-white/95 transition hover:bg-white/10 hover:text-white'>{item.label}</Link>)}
            </div>
          </details>
          <Link href='/fasilitas' className='whitespace-nowrap text-sm font-semibold text-white transition hover:text-sky-300'>Fasilitas</Link>
        </nav>

        <Link href='/#hubungi-kami' className='hidden shrink-0 whitespace-nowrap rounded-full bg-school-gold px-5 py-3 text-sm font-bold text-school-navy shadow-lg shadow-black/15 transition hover:-translate-y-0.5 hover:bg-school-butter xl:inline-flex'>Hubungi Sekolah</Link>

        <button
          type='button'
          className='inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/25 text-white transition hover:border-sky-300 hover:text-sky-200 xl:hidden'
          aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={menuOpen}
          aria-controls='mobile-navigation'
          onClick={() => setMenuOpen((open) => !open)}>
          <span className='sr-only'>{menuOpen ? 'Tutup menu' : 'Buka menu'}</span>
          <span className='flex flex-col gap-1.5'>
            <span className='h-0.5 w-5 rounded bg-current' />
            <span className='h-0.5 w-5 rounded bg-current' />
            <span className='h-0.5 w-5 rounded bg-current' />
          </span>
        </button>
      </div>

      {menuOpen && (
        <nav id='mobile-navigation' aria-label='Navigasi seluler' className='max-h-[calc(100dvh-56px)] overflow-y-auto border-t border-white/15 bg-school-blue px-5 py-4 shadow-lg xl:hidden'>
          <div className='mx-auto flex max-w-7xl flex-col gap-1'>
            {mobileNavigation.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className='rounded-lg px-4 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10 hover:text-sky-200'>
                {item.label}
              </Link>
            ))}
            {mobileDropdowns.map((dropdown) => (
              <details key={dropdown.label} className='group rounded-xl open:bg-white/5'>
                <summary onClick={closeOtherDropdowns} className='flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10 group-open:text-sky-200 [&::-webkit-details-marker]:hidden'>
                  {dropdown.label} <Chevron />
                </summary>
                <div className='mx-4 mb-2 flex flex-col border-l border-white/20 pl-3'>
                  {dropdown.items.map((item) => (
                    <Link key={item.href} href={item.href} className='rounded-lg px-3 py-2.5 text-sm leading-5 text-white/85 transition hover:bg-white/10 hover:text-sky-200'>
                      {item.label}
                    </Link>
                  ))}
                </div>
              </details>
            ))}
            <Link href='/fasilitas' className='rounded-lg px-4 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10 hover:text-sky-200'>Fasilitas</Link>
            <Link href='/#kontak' className='rounded-lg px-4 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10 hover:text-sky-200'>Kontak</Link>
            <Link href='/#hubungi-kami' className='mt-2 rounded-full bg-school-gold px-5 py-3 text-center text-sm font-bold text-school-navy transition hover:bg-school-butter'>Hubungi Sekolah</Link>
          </div>
        </nav>
      )}
    </header>
  )
}

export default Header
