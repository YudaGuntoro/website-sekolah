import Link from 'next/link'

function MissingPageIllustration() {
  return (
    <svg viewBox='0 0 480 380' className='mx-auto h-auto w-full max-w-[480px]' fill='none' aria-hidden='true'>
      <circle cx='240' cy='190' r='157' fill='#edf6ff' />
      <circle cx='240' cy='190' r='127' stroke='#cde7fa' strokeDasharray='5 9' />
      <text x='240' y='167' textAnchor='middle' fill='#1e65a8' fontSize='112' fontWeight='900' fontFamily='Arial, sans-serif' letterSpacing='5'>404</text>
      <ellipse cx='240' cy='322' rx='135' ry='13' fill='#dcecf8' />
      <path d='m97 222 139-20 146 20-11 83-135 15-128-16-11-82Z' fill='#1e65a8' />
      <path d='M113 211c43-13 82-10 123 7v90c-41-17-80-20-123-7v-90Z' fill='white' stroke='#92bfdf' strokeWidth='2' />
      <path d='M359 211c-43-13-82-10-123 7v90c41-17 80-20 123-7v-90Z' fill='#f9fcff' stroke='#92bfdf' strokeWidth='2' />
      <path d='M236 218v90' stroke='#1e65a8' strokeWidth='3' />
      <path d='M133 234c26-6 51-4 76 4M133 251c26-6 51-4 76 4M133 268c26-6 51-4 60 0M262 238c25-8 50-10 76-4M262 255c25-8 50-10 76-4M262 272c25-8 44-9 60-6' stroke='#c4ddec' strokeWidth='4' strokeLinecap='round' />
      <path d='m286 210 17-4v48l-9-6-8 9v-47Z' fill='#ffd43b' />
      <path d='m349 193 36 37' stroke='#123253' strokeWidth='16' strokeLinecap='round' />
      <circle cx='324' cy='165' r='42' fill='white' fillOpacity='.85' stroke='#123253' strokeWidth='9' />
      <path d='M302 152a27 27 0 0 1 23-14' stroke='#80cef1' strokeWidth='5' strokeLinecap='round' />
      <path d='M91 123v18M82 132h18M389 98v14M382 105h14' stroke='#edbd27' strokeWidth='4' strokeLinecap='round' />
      <circle cx='126' cy='78' r='6' fill='#8ccfea' />
      <circle cx='402' cy='273' r='5' fill='#ffd43b' />
      <path d='m63 254 28-8-8 26-6-13-14-5Z' fill='#78c6ed' />
    </svg>
  )
}

export default function NotFound() {
  return (
    <section className='relative overflow-hidden bg-gradient-to-b from-white to-[#f7fbff] px-5 py-12 sm:px-8 sm:py-16 lg:py-20'>
      <div className='mx-auto grid min-h-[440px] max-w-6xl items-center gap-6 md:grid-cols-2 md:gap-12 lg:gap-20'>
        <div className='mx-auto w-full max-w-[340px] md:max-w-[480px]'>
          <MissingPageIllustration />
        </div>
        <div className='pb-4 text-center md:py-8 md:text-left'>
          <span className='inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[.12em] text-school-blue'>
            <span className='h-1.5 w-1.5 rounded-full bg-sky-400' />Error 404
          </span>
          <h1 className='mt-5 text-3xl font-black leading-[1.12] tracking-tight text-school-navy sm:text-4xl lg:text-5xl'>Oops!<br /><span className='text-school-blue'>Halaman tidak ditemukan.</span></h1>
          <p className='mx-auto mt-5 max-w-sm text-sm leading-7 text-slate-600 md:mx-0 sm:text-base'>Halaman yang kamu cari tidak ditemukan. Yuk, kembali ke beranda dan lanjutkan menjelajahi Cendekia.</p>
          <div className='mt-7 flex flex-wrap items-center justify-center gap-3 md:justify-start'>
            <Link href='/' className='inline-flex items-center gap-2 rounded-full bg-school-blue px-5 py-3 text-sm font-bold text-white shadow-[0_8px_20px_-12px_rgba(30,101,168,.5)] transition hover:-translate-y-0.5 hover:bg-school-navy'>
              <svg viewBox='0 0 24 24' className='h-4 w-4 fill-none stroke-current' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'><path d='m3 10 9-7 9 7M5 9v12h14V9M9 21v-7h6v7' /></svg>
              Kembali ke beranda
            </Link>
            <Link href='/#kontak' className='rounded-full px-4 py-3 text-sm font-semibold text-school-blue transition hover:bg-sky-50'>Hubungi sekolah <span aria-hidden='true'>&#8599;</span></Link>
          </div>
        </div>
      </div>
    </section>
  )
}
