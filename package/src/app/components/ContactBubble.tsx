
import Image from 'next/image'

export default function ContactBubble() {
  return (
    <a href='https://wa.me/6287896397106' aria-label='Butuh informasi? Hubungi SMPIT Cendekia melalui WhatsApp' className='group fixed bottom-4 right-4 z-40 flex items-center rounded-full border border-slate-200 bg-white p-1 shadow-[0_10px_32px_-12px_rgba(16,45,78,.38)] transition hover:-translate-y-1 hover:shadow-[0_14px_36px_-12px_rgba(16,45,78,.45)] sm:bottom-5 sm:right-5 sm:gap-3 sm:pl-[4.8rem] sm:pr-2'>
      <Image src='/images/school/siswa-ppdb-formulir.png' alt='' width={90} height={120} className='absolute -bottom-1 left-1 hidden h-[88px] w-[66px] object-cover object-[28%_12%] drop-shadow-md sm:block' />
      <span className='hidden whitespace-nowrap pr-1 text-sm font-bold text-school-navy sm:inline'>Butuh Informasi ?</span>
      <span className='contact-whatsapp-pulse relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#18c96e] text-white shadow-[0_4px_12px_rgba(24,201,110,.35)] transition group-hover:bg-[#11b85f] group-hover:[animation-play-state:paused]'>
        <svg viewBox='0 0 32 32' className='h-6 w-6 fill-current' aria-hidden='true'><path d='M16.02 3.2A12.7 12.7 0 0 0 5.1 22.4L3.4 28.6l6.35-1.67A12.8 12.8 0 1 0 16.02 3.2Zm0 23.3a10.5 10.5 0 0 1-5.35-1.47l-.38-.23-3.77.99 1.01-3.67-.25-.4a10.48 10.48 0 1 1 8.74 4.78Zm5.75-7.85c-.31-.15-1.83-.9-2.12-1s-.5-.15-.71.16c-.2.3-.81 1-1 1.2-.18.2-.36.23-.67.08-.31-.15-1.3-.48-2.48-1.53a9.3 9.3 0 0 1-1.72-2.14c-.18-.31-.02-.48.14-.63.14-.13.31-.36.46-.54.16-.18.2-.3.31-.51.1-.2.05-.38-.03-.53-.08-.15-.71-1.71-.97-2.34-.26-.62-.52-.53-.71-.54h-.6c-.2 0-.53.08-.81.38-.28.3-1.06 1.04-1.06 2.55s1.09 2.96 1.24 3.16c.16.2 2.14 3.27 5.18 4.58.72.31 1.28.5 1.72.64.72.23 1.37.2 1.88.12.58-.09 1.83-.75 2.09-1.48.26-.74.26-1.37.18-1.5-.08-.13-.28-.2-.59-.36Z'/></svg>
      </span>
    </a>
  )
}
