'use client'

import { useEffect, useState } from 'react'

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => setIsVisible(window.scrollY > 300)
    window.addEventListener('scroll', toggleVisibility, { passive: true })
    toggleVisibility()
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  if (!isVisible) return null

  return (
    <button
      type='button'
      aria-label='Kembali ke atas'
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className='fixed bottom-20 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-school-blue text-white shadow-lg shadow-blue-950/20 transition hover:-translate-y-1 hover:bg-school-navy sm:bottom-[84px] sm:right-7'>
      <svg viewBox='0 0 24 24' aria-hidden='true' className='h-5 w-5 fill-none stroke-current'>
        <path d='m6 14 6-6 6 6M12 8v11' strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' />
      </svg>
    </button>
  )
}
