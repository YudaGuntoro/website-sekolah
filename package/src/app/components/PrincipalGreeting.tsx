import Image from 'next/image'
import { getCmsCollection } from '../cms-content'

// Standalone preview only; a configured CMS is authoritative, including empty/draft content.
const preview = {
  title: 'Nama Kepala Sekolah', category: 'Kepala Sekolah SMPIT Cendekia', imageUrl: '/images/mentor/girl1.svg',
  body: 'Assalamu’alaikum warahmatullahi wabarakatuh.\n\nSelamat datang di website resmi SMPIT Cendekia Purwakarta. Semoga website ini menjadi jendela informasi dan komunikasi bagi siswa, orang tua, alumni, serta seluruh masyarakat.\n\nKami berkomitmen mendampingi setiap anak agar tumbuh dalam ilmu, akhlak, dan kepedulian. Mari berkolaborasi menciptakan pengalaman belajar yang bermakna dan mempersiapkan generasi yang bermanfaat.\n\nKami mengajak seluruh keluarga besar SMPIT Cendekia untuk terus menjaga semangat belajar, menghargai perbedaan, dan mendukung potensi setiap peserta didik. Terima kasih telah menjadi bagian dari perjalanan pendidikan ini.',
}

export default async function PrincipalGreeting() {
  const entries = await getCmsCollection('sambutan')
  const greeting = entries === null ? preview : entries[0]
  if (!greeting) return null
  const paragraphs = greeting.body.split(/\n\s*\n/).map(p => p.trim()).filter(Boolean)
  const opening = paragraphs.slice(0, 2)
  const remaining = paragraphs.slice(2)
  return <section id='sambutan' className='border-y border-slate-100 bg-white py-10 sm:py-20'>
    <div className={`mx-auto grid max-w-7xl items-center gap-9 px-5 sm:px-8 lg:gap-16 lg:px-10 ${greeting.imageUrl ? 'lg:grid-cols-[.35fr_.65fr]' : ''}`}>
      {greeting.imageUrl && <div className='mx-auto hidden w-full max-w-[300px] overflow-hidden rounded-2xl border border-sky-100 bg-sky-50 shadow-[0_16px_40px_-28px_rgba(16,45,78,.35)] sm:block'>
        <Image unoptimized src={greeting.imageUrl} alt={`Potret ${greeting.title}`} width={415} height={393} className='h-[300px] w-full object-cover object-top' />
      </div>}
      <div>
        <h2 className='text-[22px] font-black leading-tight tracking-tight text-school-navy sm:text-4xl'>Sambutan Kepala <span className='text-sky-600'>Sekolah</span></h2>
        <span aria-hidden='true' className='mt-4 block h-1 w-12 rounded-full bg-school-blue' />
        {greeting.imageUrl && <div className='mx-auto mt-6 w-40 overflow-hidden rounded-2xl border border-sky-100 bg-sky-50 shadow-sm sm:hidden'>
          <Image unoptimized src={greeting.imageUrl} alt={`Potret ${greeting.title}`} width={415} height={393} sizes='160px' className='h-44 w-full object-cover object-top' />
        </div>}
        <div className='mt-5 space-y-4 text-sm leading-7 text-slate-600 sm:mt-6 sm:text-base'>
          {opening.map((paragraph, index) => <p key={index} className={`whitespace-pre-line ${index === 0 ? 'border-l-2 border-sky-200 pl-3 font-medium text-school-navy' : ''}`}>{paragraph}</p>)}
        </div>
        {remaining.length > 0 && <details className='group mt-5'>
          <summary className='inline-flex min-h-12 w-full cursor-pointer list-none items-center justify-center gap-3 rounded-xl border border-school-blue bg-school-blue px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:border-school-navy hover:bg-school-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-school-blue sm:w-auto [&::-webkit-details-marker]:hidden'>
            <span className='group-open:hidden'>Baca sambutan lengkap</span><span className='hidden group-open:inline'>Tutup sambutan</span>
            <svg viewBox='0 0 20 20' className='h-4 w-4 transition-transform group-open:rotate-180 motion-reduce:transition-none' fill='none' stroke='currentColor' strokeWidth='1.8' aria-hidden='true'><path d='m5 7.5 5 5 5-5' /></svg>
          </summary>
          <div className='mt-4 space-y-4 text-sm leading-7 text-slate-600 sm:text-base'>{remaining.map((paragraph, index) => <p key={index} className='whitespace-pre-line'>{paragraph}</p>)}</div>
        </details>}
        <div className='mt-6 flex items-center gap-3 border-t border-slate-100 pt-5'>
          <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sky-50 text-school-blue' aria-hidden='true'><svg viewBox='0 0 24 24' className='h-6 w-6' fill='none' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round' strokeLinejoin='round'><path d='M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM5 21v-2a7 7 0 0 1 14 0v2' /></svg></span>
          <div><p className='text-sm font-bold text-school-navy sm:text-base'>{greeting.title}</p><p className='mt-1 text-xs leading-5 text-slate-500 sm:text-sm'>{greeting.category}</p></div>
        </div>
      </div>
    </div>
  </section>
}
