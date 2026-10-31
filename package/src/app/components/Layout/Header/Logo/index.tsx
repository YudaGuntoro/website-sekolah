import Link from 'next/link'

const Logo = () => (
  <Link href='/' aria-label='SMPIT Cendekia Purwakarta beranda' className='flex shrink-0 items-center gap-2.5'>
    <span className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-yellow-300 bg-sky-400 p-0.5 shadow-md shadow-black/10'>
      <svg viewBox='0 0 64 64' aria-hidden='true' className='h-full w-full'>
        <circle cx='32' cy='32' r='29' fill='#35c5ed' stroke='#102d4e' strokeWidth='2' />
        <path d='M14 39h8V17a5 5 0 1 0-10 0v2h3v20Z' fill='white' stroke='#102d4e' strokeWidth='1.8' />
        <path d='M12 17a5 5 0 1 1 10 0' fill='white' stroke='#102d4e' strokeWidth='1.8' />
        <path d='M25 39v-8a10 10 0 0 1 20 0v8' fill='white' stroke='#102d4e' strokeWidth='2' />
        <path d='M31 29c0-4 2-7 4-10 2 3 4 6 4 10' fill='white' stroke='#102d4e' strokeWidth='1.6' />
        <path d='M22 39h29l-4 9H25l-3-9Z' fill='#102d4e' stroke='#ffe12d' strokeWidth='2' />
        <path d='M25 51c4-3 7 3 11 0s7 3 11 0M27 56c4-3 7 3 11 0s7 3 10 0' fill='none' stroke='white' strokeLinecap='round' strokeWidth='2.2' />
        <path d='M8 31a24 24 0 0 0 5 14M56 31a24 24 0 0 1-5 14' fill='none' stroke='#ffe12d' strokeLinecap='round' strokeWidth='3' />
      </svg>
    </span>
    <span className='flex flex-col'>
      <span className='whitespace-nowrap text-sm font-bold leading-tight tracking-tight text-white sm:text-base'>SMPIT Cendekia</span>
      <span className='text-[8px] font-bold tracking-[0.16em] text-sky-200'>PURWAKARTA</span>
    </span>
  </Link>
)

export default Logo
