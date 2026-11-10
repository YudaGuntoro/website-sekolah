import type { Metadata } from 'next'
import Link from 'next/link'
import SpmbStatusLookup from '../../components/SpmbStatusLookup'

export const metadata: Metadata = { title: 'Cek Status Pendaftaran SPMB', robots: { index: false, follow: false } }

export default function SpmbStatusPage() {
  return <main className='min-h-[70vh] bg-[#f3f8fd] px-5 py-10 sm:px-8 sm:py-14'>
    <div className='mx-auto max-w-3xl'>
      <Link href='/spmb' className='text-sm font-semibold text-school-blue hover:underline'>← Informasi SPMB</Link>
      <h1 className='mt-6 text-3xl font-bold tracking-tight text-school-navy sm:text-4xl'>Cek Status <span className='text-school-blue'>Pendaftaran</span></h1>
      <p className='mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base'>Sudah mengirim formulir SPMB? Periksa data pendaftaran calon murid dan cetak kembali bukti pendaftarannya di sini.</p>
      <SpmbStatusLookup />
    </div>
  </main>
}
