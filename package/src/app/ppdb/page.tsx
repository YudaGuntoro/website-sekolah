import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'SPMB 2027/2028',
  description: 'Informasi SPMB SMPIT Cendekia Purwakarta tahun ajaran 2027/2028 sesuai brosur sekolah.',
}

const steps = [
  'Melakukan pendaftaran online melalui tautan pada kode QR di brosur.',
  'Menyerahkan berkas persyaratan ke sekolah.',
  'Membayar biaya pendaftaran Rp350.000 secara tunai atau transfer ke BRI 0075 0100 2017 563 a.n. SMPIT Cendekia Purwakarta.',
  'Mengikuti tes observasi: psikotes, BTQ, dan wawancara.',
  'Pengumuman hasil tes; calon siswa yang diterima membayar biaya masuk/registrasi.',
]

const stepVisuals = [
  { title: 'Daftar online', color: 'bg-sky-100 text-sky-700', icon: 'M8 3H4v18h16V3h-4M9 2h6v4H9zM8 11h8M8 15h5' },
  { title: 'Serahkan berkas', color: 'bg-indigo-100 text-indigo-700', icon: 'M3 7V4h6l2 3h10v13H3V7ZM3 10h18' },
  { title: 'Bayar pendaftaran', color: 'bg-amber-100 text-amber-700', icon: 'M3 5h18v14H3zM3 9h18M7 15h3m5 0h2' },
  { title: 'Ikuti tes observasi', color: 'bg-cyan-100 text-cyan-700', icon: 'M8 3H4v18h16V3h-4M9 2h6v4H9zM8 13l3 3 5-6' },
  { title: 'Pengumuman & registrasi', color: 'bg-emerald-100 text-emerald-700', icon: 'M21 11v1a9 9 0 1 1-5.3-8.2M9 11l3 3L22 4' },
]

const documents = [
  'Fotokopi akta kelahiran',
  'Fotokopi Kartu Keluarga',
  'Fotokopi KTP orang tua',
  'Fotokopi KIA (jika ada)',
]

const transferDocuments = [
  'Surat keterangan dari sekolah asal',
  'Surat keterangan mutasi Dapodik dari operator sekolah',
  'Rapor asli dari sekolah asal',
  'Surat kelakuan baik dari sekolah',
  'Kartu NISN',
]

export default function SpmbInformationPage() {
  return (
    <main className='bg-[#f3f8fd] px-5 pb-14 sm:px-8 sm:pb-16'>
      <section className='relative -mx-5 overflow-hidden border-b border-sky-100 bg-[#f7f9fc] px-5 pb-10 pt-12 sm:-mx-8 sm:px-8 sm:pb-12 sm:pt-14'>
        <div className='mx-auto grid max-w-7xl items-end gap-7 lg:grid-cols-[1.1fr_.9fr] lg:gap-12'>
          <div>
            <p className='mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-school-blue'>SMPIT Cendekia Purwakarta - Tahun Ajaran 2027/2028</p>
            <h1 className='max-w-2xl text-4xl font-black leading-[1.05] tracking-tight text-school-navy sm:text-5xl lg:text-6xl'>SPMB <span className='text-school-blue'>2027/2028.</span></h1>
          </div>
          <p className='max-w-xl border-l-2 border-sky-300 pl-5 text-base leading-7 text-slate-600 lg:mb-1'>Syarat dan alur pendaftaran siswa baru serta murid pindahan.</p>
        </div>
      </section>
      <div className='mx-auto mt-8 grid max-w-6xl gap-5 lg:grid-cols-2'>
        <section className='rounded-2xl border border-sky-100 bg-white p-5 sm:p-7'>
          <div className='flex items-center justify-between gap-3'>
            <h2 className='text-xl font-black text-school-navy'>Alur Pendaftaran</h2>
            <span className='shrink-0 rounded-full bg-sky-50 px-2.5 py-1 text-[10px] font-bold text-school-blue sm:text-xs'>5 tahap</span>
          </div>
          <ol className='mt-6 sm:mt-7'>
            {steps.map((step, index) => (
              <li key={step} className='relative flex gap-3 pb-6 last:pb-0 sm:gap-4 sm:pb-7'>
                {index < steps.length - 1 && <span aria-hidden='true' className='absolute bottom-0 left-5 top-11 w-px bg-sky-100 sm:left-6 sm:top-[52px]' />}
                <span className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-12 sm:w-12 sm:rounded-2xl ${stepVisuals[index].color}`}>
                  <svg viewBox='0 0 24 24' className='h-5 w-5 sm:h-6 sm:w-6' fill='none' stroke='currentColor' strokeWidth='1.7' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'><path d={stepVisuals[index].icon} /></svg>
                </span>
                <div className='min-w-0 flex-1'>
                  <p className='text-[9px] font-bold uppercase tracking-[.15em] text-school-blue/70 sm:text-[10px]'>Tahap {String(index + 1).padStart(2, '0')}</p>
                  <h3 className='mt-1 text-sm font-bold leading-5 text-school-navy sm:text-base sm:leading-6'>{stepVisuals[index].title}</h3>
                  {index === 2 ? <>
                    <div className='mt-2 max-w-sm rounded-xl border border-amber-100 bg-amber-50/60 p-3 sm:p-4'>
                      <p className='text-lg font-extrabold tracking-tight text-school-navy sm:text-xl'>Rp350.000</p>
                      <p className='mt-1 text-xs leading-5 text-slate-600 sm:text-sm'>Tunai atau transfer ke</p>
                      <p className='mt-1 text-xs font-bold leading-5 text-school-navy sm:text-sm'>BRI <span className='whitespace-nowrap tabular-nums'>0075 0100 2017 563</span></p>
                      <p className='mt-1 text-[11px] leading-5 text-slate-500 sm:text-xs'>a.n. SMPIT Cendekia Purwakarta</p>
                    </div>
                  </> : <p className='mt-1.5 text-xs leading-5 text-slate-600 sm:text-sm sm:leading-6'>{step}</p>}
                </div>
              </li>
            ))}
          </ol>
        </section>
        <section className='rounded-2xl border border-sky-100 bg-white p-6 sm:p-7'>
          <h2 className='text-xl font-black text-school-navy'>Persyaratan Berkas</h2>
          <h3 className='mt-5 text-sm font-bold text-school-blue'>Calon siswa baru</h3>
          <ul className='mt-2 list-inside list-disc space-y-2 text-sm leading-6 text-slate-600'>{documents.map((item) => <li key={item}>{item}</li>)}</ul>
          <h3 className='mt-5 text-sm font-bold text-school-blue'>Murid pindahan</h3>
          <ul className='mt-2 list-inside list-disc space-y-2 text-sm leading-6 text-slate-600'>{transferDocuments.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>
      </div>
      <section className='mx-auto mt-8 max-w-6xl rounded-2xl border border-sky-100 bg-white p-6 sm:p-7'>
        <h2 className='text-xl font-black text-school-navy'>Pendaftaran dan informasi</h2>
        <div className='mt-5 flex flex-col gap-6 border-t border-slate-100 pt-5 xl:flex-row xl:items-center xl:justify-between'>
        <div className='grid min-w-0 gap-4 sm:flex sm:flex-wrap sm:gap-x-8'>
          <a href='https://wa.me/6287896397106' target='_blank' rel='noreferrer' className='group flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600'>
            <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[#16a34a] transition group-hover:bg-emerald-100'>
              <svg viewBox='0 0 24 24' className='h-5 w-5 fill-none stroke-current' strokeWidth='1.7' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'><path d='M20.5 11.6a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.4-4.8a8.5 8.5 0 1 1 16.1-4.1Z' /><path d='m8 7 2 3-1.3 1.3a10 10 0 0 0 4 4L14 14l3 2c-.5 1.5-1.5 2-3 1.5C10 16.3 7.7 14 6.5 10 6 8.5 6.5 7.5 8 7Z' /></svg>
            </span>
            <span className='min-w-0 flex-1'>
              <span className='block text-xs text-slate-500'>WhatsApp / CP</span>
              <span className='mt-0.5 block text-sm font-semibold text-school-navy transition group-hover:text-emerald-700'>+62 878-9639-7106</span>

            </span>
          </a>
          <a href='mailto:smpitcendekiapwk@gmail.com' className='group flex min-w-0 items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-school-blue'>
            <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-50 transition group-hover:bg-sky-100'>
              <svg viewBox='0 0 24 24' className='h-5 w-5 fill-none' strokeWidth='2.4' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'><path d='M3 7v11' stroke='#4285F4' /><path d='m3 7 9 7 9-7' stroke='#EA4335' /><path d='M21 7v11' stroke='#34A853' /><path d='m3 7 3 2' stroke='#FBBC04' /></svg>
            </span>
            <span className='min-w-0 flex-1'>
              <span className='block text-xs text-slate-500'>Email sekretariat</span>
              <span className='mt-0.5 block break-all text-sm font-semibold text-school-navy transition group-hover:text-school-blue'>smpitcendekiapwk@gmail.com</span>

            </span>
          </a>
        </div>
        <div className='flex shrink-0 flex-wrap items-center gap-2'>
          <Link href='/ppdb/daftar' className='inline-flex items-center justify-center gap-2 rounded-xl bg-school-blue px-4 py-2.5 text-sm font-bold text-white transition hover:bg-school-navy'>Isi formulir <span aria-hidden='true'>&#8594;</span></Link>
          <a href='/brosur-ppdb.pdf' target='_blank' rel='noreferrer' className='inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-school-navy transition hover:border-sky-300 hover:bg-sky-50'><svg viewBox='0 0 24 24' className='h-4 w-4 fill-none stroke-school-blue' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'><path d='M14 2H6v20h12V6l-4-4ZM14 2v5h5M9 12h6M9 16h6' /></svg>Brosur SPMB</a>
        </div>
        </div>
      </section>
    </main>
  )
}
