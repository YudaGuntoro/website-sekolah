import type { Metadata } from 'next'
import Link from 'next/link'
import StaffGrid from './StaffGrid'
import { staff } from '../school-content'

export const metadata: Metadata = {
  title: 'Pimpinan Sekolah, Yayasan, dan Tenaga Pendidik',
  description: 'Kenali pimpinan sekolah, Yayasan YASRI Purwakarta, dan tenaga pendidik SMPIT Cendekia.',
}

const educators = staff.filter((person) => person.role.startsWith('Guru '))
const leadership = staff.filter((person) => !person.role.startsWith('Guru '))

export default function GuruPage() {
  return (
    <main className='min-h-[70vh] bg-[#f6f9fc]'>
      <section className='relative isolate overflow-hidden border-b border-slate-200/70 bg-[#f7faff]'>
        <div aria-hidden='true' className='pointer-events-none absolute inset-0 -z-10 opacity-70' style={{ backgroundImage: 'linear-gradient(rgba(17,57,96,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(17,57,96,.045) 1px, transparent 1px), radial-gradient(ellipse at 88% 28%, rgba(56,189,248,.18), transparent 34%), radial-gradient(ellipse at 5% 90%, rgba(59,130,246,.08), transparent 36%)', backgroundSize: '52px 52px, 52px 52px, auto, auto' }} />
        <div className='mx-auto max-w-7xl px-5 pb-10 pt-12 sm:px-8 sm:pb-12 sm:pt-16 lg:px-10 lg:pt-20'>
          <div className='grid items-center gap-8 lg:grid-cols-[1.15fr_.85fr] lg:gap-16'>
            <div>
              <p className='text-xs font-extrabold uppercase tracking-[.18em] text-school-blue'>Sekolah Cendekia · Purwakarta</p>
              <h1 className='mt-5 max-w-2xl text-4xl font-black leading-[1.08] tracking-tight text-school-navy sm:text-5xl lg:text-[3.5rem]'>Pimpinan sekolah,<br /><span className='text-school-blue'>yayasan, dan tenaga pendidik.</span></h1>
            </div>
            <div className='border-l-2 border-sky-300 py-1 pl-5 sm:pl-6'>
              <p className='font-bold leading-6 text-school-navy'>SMPIT Cendekia berada di bawah naungan Yayasan YASRI Purwakarta.</p>
              <p className='mt-3 text-sm leading-7 text-slate-600 sm:text-base'>Kenali pimpinan dan para guru yang mendampingi proses belajar serta pengembangan karakter siswa.</p>
              <Link href='/#guru' className='mt-4 inline-flex items-center gap-2 text-sm font-bold text-school-blue transition hover:text-school-navy'>Kembali ke beranda <span aria-hidden='true'>↗</span></Link>
            </div>
          </div>
          <div className='mt-10 sm:mt-12' aria-labelledby='pimpinan-heading'>
            <h2 id='pimpinan-heading' className='mb-5 text-2xl font-black text-school-navy'>Pimpinan sekolah dan yayasan</h2>
            <StaffGrid staff={leadership} category='Pimpinan' countLabel='pimpinan sekolah' />
          </div>
          <div className='mt-12 border-t border-sky-100 pt-10 sm:mt-16 sm:pt-12' aria-labelledby='pendidik-heading'>
            <h2 id='pendidik-heading' className='mb-5 text-2xl font-black text-school-navy'>Tenaga <span className='text-school-blue'>pendidik</span></h2>
            <StaffGrid staff={educators} category='Tenaga pendidik' countLabel='tenaga pendidik' />
          </div>
        </div>
      </section>
    </main>
  )
}
