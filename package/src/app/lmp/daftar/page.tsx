import type { Metadata } from 'next'
import LmpRegistrationForm from '../../components/LmpRegistrationForm'
export const metadata: Metadata = { title: 'Formulir Pendaftaran LMP' }
export default function Page() {
  return <main className='bg-[#f3f8fd] pb-16'><section className='border-b border-sky-100 bg-[#f7f9fc] px-5 py-12 sm:px-8 sm:py-14'><div className='mx-auto grid max-w-7xl items-end gap-7 lg:grid-cols-[1.1fr_.9fr] lg:gap-12'><div><p className='mb-3 text-xs font-extrabold uppercase tracking-[.18em] text-school-blue'>LMP · SMPIT Cendekia Purwakarta</p><h1 className='text-4xl font-black leading-[1.08] tracking-tight text-school-navy sm:text-5xl'>Formulir <span className='text-school-blue'>pendaftaran.</span></h1></div><p className='border-l-2 border-sky-300 pl-5 text-base leading-7 text-slate-600'>Lomba Mata Pelajaran untuk murid kelas 5 dan 6 SD. Lengkapi data peserta dan pilih satu mata pelajaran.</p></div></section><div className='mx-auto max-w-5xl px-5 pt-8 sm:px-8'><LmpRegistrationForm /></div></main>
}
