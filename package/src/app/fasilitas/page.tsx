import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Fasilitas',
  description: 'Fasilitas SMPIT Cendekia: ruang kelas AC, laboratorium komputer, perpustakaan, gedung aula, lapangan basket, dan masjid.',
}

const facilities = [
  { title: 'Ruang Kelas AC', text: 'Ruang kelas berpendingin udara untuk mendukung kenyamanan saat belajar.', icon: 'M3 21h18M5 21V5h14v16M9 9h2M14 9h1M9 13h2M14 13h1M10 21v-4h4v4', color: 'bg-sky-100 text-sky-700' },
  { title: 'Laboratorium Komputer', text: 'Ruang untuk belajar komputer dan mengembangkan keterampilan digital.', icon: 'M3 4h18v13H3V4ZM12 17v4M8 21h8M7 8l-2 2 2 2M17 8l2 2-2 2', color: 'bg-blue-100 text-blue-700' },
  { title: 'Perpustakaan', text: 'Ruang membaca dan mencari referensi untuk memperluas pengetahuan.', icon: 'M3 4c4-1 6 0 9 2v15c-3-2-5-3-9-2V4ZM21 4c-4-1-6 0-9 2v15c3-2 5-3 9-2V4Z', color: 'bg-indigo-100 text-indigo-700' },
  { title: 'Gedung Aula', text: 'Ruang bersama untuk pertemuan dan berbagai kegiatan sekolah.', icon: 'M3 21h18M4 21V9h16v12M3 9l9-6 9 6M8 12v5M12 12v5M16 12v5', color: 'bg-cyan-100 text-cyan-800' },
  { title: 'Lapangan Basket', text: 'Area berolahraga untuk melatih keterampilan, sportivitas, dan kerja sama.', icon: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18ZM3 12h18M12 3v18M5.6 5.6c7 2 7 10.8 0 12.8M18.4 5.6c-7 2-7 10.8 0 12.8', color: 'bg-sky-100 text-sky-700' },
  { title: 'Masjid', text: 'Tempat beribadah dan membangun kebiasaan baik melalui kegiatan keagamaan.', icon: 'M4 21V10h16v11M8 10V7l4-4 4 4v3M10 21v-6h4v6M2 21h20', color: 'bg-blue-100 text-blue-700' },
]

export default function FasilitasPage() {
  return (
    <main className='min-h-[70vh] bg-[#f3f8fd]'>
      <section className='relative isolate overflow-hidden border-b border-sky-100 bg-[#f7f9fc]'>
        <div aria-hidden='true' className='pointer-events-none absolute inset-0 -z-10 opacity-70' style={{ backgroundImage: 'linear-gradient(rgba(30,101,168,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(30,101,168,.045) 1px, transparent 1px), radial-gradient(ellipse at 90% 10%, rgba(125,211,252,.2), transparent 42%)', backgroundSize: '38px 38px, 38px 38px, auto' }} />
        <div className='mx-auto max-w-7xl px-5 pb-12 pt-12 sm:px-8 sm:pb-16 sm:pt-16 lg:px-10'>
          <div className='grid items-end gap-7 lg:grid-cols-[1.1fr_.9fr] lg:gap-12'>
            <div>
              <p className='text-xs font-extrabold uppercase tracking-[.18em] text-school-blue'>Fasilitas sekolah</p>
              <h1 className='mt-4 max-w-2xl text-4xl font-black leading-[1.06] tracking-tight text-school-navy sm:text-5xl lg:text-6xl'>Ruang belajar, <span className='text-school-blue'>ruang bertumbuh.</span></h1>
            </div>
            <p className='max-w-xl border-l-2 border-sky-300 py-1 pl-5 text-base leading-7 text-slate-600'>Fasilitas SMPIT Cendekia mendukung keseharian siswa dalam belajar, mengeksplorasi minat, berolahraga, dan beribadah.</p>
          </div>
          <div className='mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
            {facilities.map((facility, index) => (
              <article key={facility.title} className='group rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_12px_32px_-26px_rgba(16,45,78,.3)] transition hover:-translate-y-1 hover:border-sky-200 hover:shadow-[0_20px_40px_-25px_rgba(30,101,168,.22)]'>
                <div className='flex items-center justify-between'>
                  <span className={`flex h-14 w-14 items-center justify-center rounded-2xl ${facility.color}`}>
                    <svg viewBox='0 0 24 24' className='h-8 w-8 fill-none stroke-current' strokeWidth='1.6' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'><path d={facility.icon} /></svg>
                  </span>
                  <span className='text-sm font-black tracking-widest text-slate-300'>{String(index + 1).padStart(2, '0')}</span>
                </div>
                <h2 className='mt-6 text-lg font-bold text-school-navy'>{facility.title}</h2>
                <p className='mt-2 text-sm leading-6 text-slate-600'>{facility.text}</p>
                <div className='mt-5 h-px bg-slate-100 transition group-hover:bg-sky-200' />
                <p className='mt-4 text-xs font-semibold text-school-blue'>Mendukung keseharian siswa</p>
              </article>
            ))}
          </div>
          <div className='mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-sky-100 bg-white/80 p-5 sm:flex-row sm:items-center sm:px-6'>
            <p className='max-w-2xl text-sm leading-6 text-slate-600'>Ingin mengenal lingkungan sekolah lebih dekat? Hubungi kami untuk informasi kunjungan ke SMPIT Cendekia.</p>
            <Link href='/#kontak' className='inline-flex shrink-0 items-center gap-2 rounded-full bg-school-blue px-5 py-3 text-sm font-bold text-white transition hover:bg-school-navy'>Hubungi sekolah <span aria-hidden='true'>→</span></Link>
          </div>
        </div>
      </section>
    </main>
  )
}
