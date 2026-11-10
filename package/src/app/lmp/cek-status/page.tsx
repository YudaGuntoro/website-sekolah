import type { Metadata } from 'next'
import Link from 'next/link'
import LmpStatusLookup from '../../components/LmpStatusLookup'

export const metadata: Metadata = { title: 'Cek Status Pendaftaran LMP', robots: { index: false, follow: false } }

export default function LmpStatusPage() {
  return <main className='min-h-[70vh] bg-[#f3f8fd] px-5 py-10 sm:px-8 sm:py-14'>
    <div className='mx-auto max-w-3xl'>
      <Link href='/lmp' className='text-sm font-semibold text-school-blue hover:underline'>← Informasi LMP</Link>
      <h1 className='mt-6 text-3xl font-bold tracking-tight text-school-navy sm:text-4xl'>Cek Status <span className='text-school-blue'>Pendaftaran LMP</span></h1>
      <p className='mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base'>Periksa data peserta, lihat status pendaftaran dan pembayaran, serta cetak kembali bukti pendaftaran LMP.</p>
      <LmpStatusLookup />
    </div>
  </main>
}
