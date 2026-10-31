import Logo from '../Header/Logo'

const Footer = () => (
  <footer className='bg-school-navy text-white'>
    <div className='mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:gap-10 sm:px-8 sm:py-14 md:grid-cols-[1.4fr_1fr_1fr] lg:px-10'>
      <div>
        <Logo />
        <p className='mt-5 hidden max-w-sm text-sm leading-7 text-blue-100/75 sm:block'>
          Ruang belajar yang mendukung setiap anak untuk mengenali potensinya, membangun karakter, dan berani berkarya.
        </p>
      </div>

      <div>
        <h2 className='text-sm font-bold uppercase tracking-[0.16em] text-school-gold'>Jelajahi</h2>
        <ul className='mt-3 grid grid-cols-2 gap-2 text-sm text-blue-100/75 sm:mt-5 sm:block sm:space-y-3'>
          <li><a className='transition hover:text-white' href='#tentang'>Tentang sekolah</a></li>
          <li><a className='transition hover:text-white' href='#program'>Program belajar</a></li>
          <li><a className='transition hover:text-white' href='/fasilitas'>Fasilitas</a></li>
          <li><a className='transition hover:text-white' href='#ppdb'>Penerimaan siswa</a></li>
        </ul>
      </div>

      <div>
        <h2 className='text-sm font-bold uppercase tracking-[0.16em] text-school-gold'>Informasi</h2>
        <div className='mt-5 flex items-center gap-2.5'>
          <a href='https://wa.me/6287896397106' aria-label='WhatsApp SMPIT Cendekia: +62 878-9639-7106' title='WhatsApp' className='flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/20'><svg viewBox='0 0 32 32' className='h-5 w-5 fill-current' aria-hidden='true'><path d='M16.02 3.2A12.7 12.7 0 0 0 5.1 22.4L3.4 28.6l6.35-1.67A12.8 12.8 0 1 0 16.02 3.2Zm0 23.3a10.5 10.5 0 0 1-5.35-1.47l-.38-.23-3.77.99 1.01-3.67-.25-.4a10.48 10.48 0 1 1 8.74 4.78Zm5.75-7.85c-.31-.15-1.83-.9-2.12-1s-.5-.15-.71.16c-.2.3-.81 1-1 1.2-.18.2-.36.23-.67.08-.31-.15-1.3-.48-2.48-1.53a9.3 9.3 0 0 1-1.72-2.14c-.18-.31-.02-.48.14-.63.14-.13.31-.36.46-.54.16-.18.2-.3.31-.51.1-.2.05-.38-.03-.53-.08-.15-.71-1.71-.97-2.34-.26-.62-.52-.53-.71-.54h-.6c-.2 0-.53.08-.81.38-.28.3-1.06 1.04-1.06 2.55s1.09 2.96 1.24 3.16c.16.2 2.14 3.27 5.18 4.58.72.31 1.28.5 1.72.64.72.23 1.37.2 1.88.12.58-.09 1.83-.75 2.09-1.48.26-.74.26-1.37.18-1.5-.08-.13-.28-.2-.59-.36Z'/></svg></a>
          <a href='mailto:smpitcendekiapwk@gmail.com' aria-label='Email SMPIT Cendekia: smpitcendekiapwk@gmail.com' title='Email' className='flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/20'><svg viewBox='0 0 24 24' className='h-5 w-5 fill-none stroke-current' strokeWidth='1.7' aria-hidden='true'><rect x='3' y='5' width='18' height='14' rx='2'/><path d='m4 7 8 6 8-6' strokeLinecap='round' strokeLinejoin='round'/></svg></a>
          <a href='https://www.tiktok.com/@smpitcendekiapwk' target='_blank' rel='noreferrer' aria-label='TikTok SMPIT Cendekia: @smpitcendekiapwk' title='TikTok' className='flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/20'><svg viewBox='0 0 24 24' className='h-5 w-5 fill-current' aria-hidden='true'><path d='M19.6 7.1a5.8 5.8 0 0 1-3.7-1.3v8.1a5.7 5.7 0 1 1-5-5.7v3a2.8 2.8 0 1 0 2 2.7V2.8h3a5.8 5.8 0 0 0 3.7 3.7v.6Z'/></svg></a>
          <a href='https://www.instagram.com/smpitcendekia/' target='_blank' rel='noreferrer' aria-label='Instagram SMPIT Cendekia: @smpitcendekia' title='Instagram' className='flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/20'><svg viewBox='0 0 24 24' className='h-5 w-5 fill-none stroke-current' strokeWidth='1.7' aria-hidden='true'><rect x='3' y='3' width='18' height='18' rx='5'/><circle cx='12' cy='12' r='4'/><circle cx='17.5' cy='6.7' r='.8' fill='currentColor' stroke='none'/></svg></a>
          <a href='https://www.facebook.com/smpitcendekia' target='_blank' rel='noreferrer' aria-label='Facebook SMPIT Cendekia: @smpitcendekia' title='Facebook' className='flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-white transition hover:bg-white/20'><svg viewBox='0 0 24 24' className='h-5 w-5 fill-current' aria-hidden='true'><path d='M13.4 21v-8h2.7l.4-3.1h-3.1v-2c0-.9.3-1.5 1.6-1.5h1.7V3.6c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.1H7.2V13H10v8h3.4Z'/></svg></a>
        </div>
        <ul className='mt-4 max-w-sm space-y-2.5 text-sm leading-6 text-blue-100/75'>
          <li className='flex items-start gap-2.5'><svg viewBox='0 0 24 24' className='mt-1 h-4 w-4 shrink-0 fill-none' stroke='#25D366' strokeWidth='1.9' aria-hidden='true'><path d='M5 3h4l2 5-3 2a15 15 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2Z' strokeLinejoin='round'/></svg><span>+62 878-9639-7106</span></li>
          <li className='flex items-start gap-2.5'><svg viewBox='0 0 24 24' className='mt-1 h-4 w-4 shrink-0 fill-none' strokeWidth='1.7' aria-hidden='true'><path d='M3 7v11' stroke='#4285F4' strokeWidth='2.4' strokeLinecap='round'/><path d='m3 7 9 7 9-7' stroke='#EA4335' strokeWidth='2.4' strokeLinecap='round' strokeLinejoin='round'/><path d='M21 7v11' stroke='#34A853' strokeWidth='2.4' strokeLinecap='round'/><path d='m3 7 3 2' stroke='#FBBC04' strokeWidth='2.4' strokeLinecap='round'/></svg><span className='break-all'>smpitcendekiapwk@gmail.com</span></li>
          <li className='flex items-start gap-2.5'><svg viewBox='0 0 24 24' className='mt-1 h-4 w-4 shrink-0 fill-none' stroke='#EA4335' strokeWidth='1.9' aria-hidden='true'><path d='M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z'/><circle cx='12' cy='10' r='2.5' fill='#FBBC04'/></svg><span>Jl. Veteran No. 100 B, Nagri Kaler, Purwakarta (Belakang Poll Damri)</span></li>
        </ul>
      </div>
    </div>

    <div className='border-t border-white/10'>
      <p className='mx-auto max-w-7xl px-5 py-5 text-xs text-blue-100/55 sm:px-8 lg:px-10'>© {new Date().getFullYear()} Sekolah Cendekia. Semua hak dilindungi.</p>
    </div>
  </footer>
)

export default Footer
