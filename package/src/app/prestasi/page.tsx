import type { Metadata } from 'next'
import Link from 'next/link'
import AchievementGrid from './AchievementGrid'
import { achievements } from '../school-content'

export const metadata: Metadata = {
  title: 'Prestasi Siswa',
  description: 'Pencapaian dan prestasi siswa SMPIT Cendekia.',
}


export default function PrestasiPage() {
  return (
    <main className='min-h-[70vh] bg-[#f6f9fc]'>
      <section className='relative isolate overflow-hidden border-b border-slate-200/70 bg-[#f7faff]'>
        <div aria-hidden='true' className='pointer-events-none absolute inset-0 -z-10 opacity-70' style={{ backgroundImage: 'linear-gradient(rgba(17,57,96,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(17,57,96,.045) 1px, transparent 1px), radial-gradient(ellipse at 88% 28%, rgba(56,189,248,.18), transparent 34%), radial-gradient(ellipse at 5% 90%, rgba(59,130,246,.08), transparent 36%)', backgroundSize: '52px 52px, 52px 52px, auto, auto' }} />
        <div className='mx-auto max-w-7xl px-5 pb-10 pt-12 sm:px-8 sm:pb-12 sm:pt-16 lg:px-10 lg:pt-20'>
          <div className='grid items-center gap-8 lg:grid-cols-[1.15fr_.85fr] lg:gap-16'>
            <div>
              <p className='text-xs font-extrabold uppercase tracking-[.18em] text-school-blue'>Sekolah Cendekia · Purwakarta</p>
              <h1 className='mt-5 max-w-2xl text-4xl font-black leading-[1.08] tracking-tight text-school-navy sm:text-5xl lg:text-[3.5rem]'>Prestasi <span className='text-school-blue'>SMPIT Cendekia Purwakarta.</span></h1>
            </div>
            <div className='border-l-2 border-sky-300 py-1 pl-5 sm:pl-6'>
              <p className='font-bold leading-6 text-school-navy'>Daftar prestasi SMPIT Cendekia Purwakarta tahun 2025 dan 2026.</p>
              <p className='mt-3 text-sm leading-7 text-slate-600 sm:text-base'>Daftar prestasi siswa tahun 2025 dan 2026.</p>
              <Link href='/#prestasi' className='mt-4 inline-flex items-center gap-2 text-sm font-bold text-school-blue transition hover:text-school-navy'>Kembali ke beranda <span aria-hidden='true'>↗</span></Link>
            </div>
          </div>
          <div className='mt-10 sm:mt-12'>
            <AchievementGrid achievements={achievements} />
          </div>
        </div>
      </section>
    </main>
  )
}
