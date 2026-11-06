import type { Metadata } from 'next'
import SpmbRegistrationForm from '@/app/components/SpmbRegistrationForm'

export const metadata: Metadata = { title: 'Formulir Pendaftaran SPMB', description: 'Pendaftaran calon siswa SMPIT Cendekia Purwakarta.' }

export default function SpmbRegistrationPage() {
  return <main className='bg-[#f5f7fa] pb-14 sm:pb-20'>
    <section className='relative isolate overflow-hidden border-b border-sky-100 bg-[#f7f9fc] p-0'>
      <div aria-hidden='true' className='pointer-events-none absolute inset-0 -z-10 opacity-70' style={{ backgroundImage: 'linear-gradient(rgba(30,101,168,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(30,101,168,.045) 1px, transparent 1px), radial-gradient(ellipse at 90% 10%, rgba(125,211,252,.2), transparent 42%)', backgroundSize: '38px 38px, 38px 38px, auto' }} />
      <div className='mx-auto max-w-7xl px-5 pb-12 pt-12 sm:px-8 sm:pb-16 sm:pt-16 lg:px-10'>
        <div className='grid items-end gap-7 lg:grid-cols-[1.1fr_.9fr] lg:gap-12'>
          <div>
            <p className='text-xs font-extrabold uppercase tracking-[.18em] text-school-blue'>SPMB · SMPIT Cendekia Purwakarta</p>
            <h1 className='mt-4 max-w-2xl text-4xl font-black leading-[1.06] tracking-tight text-school-navy sm:text-5xl lg:text-6xl'>Formulir <span className='text-school-blue'>pendaftaran.</span></h1>
          </div>
          <p className='max-w-xl border-l-2 border-sky-300 py-1 pl-5 text-base leading-7 text-slate-600'>Lengkapi data calon siswa dan orang tua / wali sesuai dokumen. Pendaftaran dapat dikirim pada jadwal gelombang yang sedang dibuka.</p>
        </div>
      </div>
    </section>
    <div className='mx-auto mt-6 max-w-5xl px-5 sm:mt-8 sm:px-8'><SpmbRegistrationForm /></div>
  </main>
}
