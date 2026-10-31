import type { Metadata } from 'next'
import Link from 'next/link'
import HistoryStorySelector from './HistoryStorySelector'

export const metadata: Metadata = {
  title: 'Sejarah Sekolah',
  description: 'Sejarah dan perjalanan SMPIT Cendekia Purwakarta.',
}

export default function SejarahPage() {
  return (
    <main className='min-h-[70vh] bg-[#f3f8fd]'>
      <section className='relative isolate overflow-hidden border-b border-sky-100 bg-[#f7f9fc]'>
        <div aria-hidden='true' className='pointer-events-none absolute inset-0 -z-10 opacity-70' style={{ backgroundImage: 'linear-gradient(rgba(30,101,168,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(30,101,168,.045) 1px, transparent 1px), radial-gradient(ellipse at 90% 10%, rgba(125,211,252,.2), transparent 42%)', backgroundSize: '38px 38px, 38px 38px, auto' }} />
        <div className='mx-auto max-w-7xl px-5 pb-12 pt-12 sm:px-8 sm:pb-16 sm:pt-16 lg:px-10'>
          <div className='grid items-end gap-7 lg:grid-cols-[1.1fr_.9fr] lg:gap-12'>
            <div>
              <p className='text-xs font-extrabold uppercase tracking-[.18em] text-school-blue'>SMPIT Cendekia · Purwakarta</p>
              <h1 className='mt-4 max-w-2xl text-4xl font-black leading-[1.06] tracking-tight text-school-navy sm:text-5xl lg:text-6xl'>Sejarah <span className='text-school-blue'>Sekolah.</span></h1>
            </div>
            <p className='max-w-xl border-l-2 border-sky-300 py-1 pl-5 text-base leading-7 text-slate-600'>Perjalanan, awal mula, dan arah pendidikan SMPIT Cendekia Purwakarta.</p>
          </div>

          <div className='mt-12'><HistoryStorySelector /></div>

          <div className='mt-8 flex flex-wrap gap-3'>
            <Link href='/#tentang' className='inline-flex items-center gap-2 rounded-full bg-school-blue px-5 py-3 text-sm font-bold text-white transition hover:bg-school-navy'>Tentang sekolah <span aria-hidden='true'>→</span></Link>
            <Link href='/guru' className='inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-5 py-3 text-sm font-bold text-school-blue transition hover:border-school-blue hover:bg-sky-50'>Lihat pimpinan sekolah</Link>
          </div>
        </div>
      </section>
    </main>
  )
}
