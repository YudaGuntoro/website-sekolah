'use client'

import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { useState } from 'react'

type Announcement = { title: string; date: string; text: string }

export default function AnnouncementDialog({ announcement }: { announcement: Announcement }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type='button' onClick={() => setOpen(true)} aria-haspopup='dialog' aria-label={`Lihat ${announcement.title}`} className='flex items-center justify-center gap-2 rounded-lg border border-sky-400 px-3 py-2 text-xs font-bold text-school-blue transition hover:bg-sky-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-school-blue sm:w-full sm:rounded-xl sm:px-4 sm:py-2.5'>
        <svg viewBox='0 0 24 24' className='h-4 w-4 fill-none stroke-current' strokeWidth='1.8' aria-hidden='true'><path d='M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z' /><circle cx='12' cy='12' r='3' /></svg>
        Lihat
      </button>
      <Dialog open={open} onClose={setOpen} className='relative z-[80]'>
        <DialogBackdrop className='fixed inset-0 bg-school-navy/50 backdrop-blur-sm' />
        <div className='fixed inset-0 w-screen overflow-y-auto'>
          <div className='flex min-h-full items-center justify-center p-4 sm:p-6'>
            <DialogPanel className='relative w-full max-w-lg rounded-3xl border border-sky-100 bg-white p-6 shadow-2xl sm:p-8'>
              <div className='flex items-center justify-between gap-4'>
                <span className='rounded-full bg-sky-50 px-3 py-1.5 text-xs font-bold text-school-blue'>Pengumuman sekolah</span>
                <button type='button' onClick={() => setOpen(false)} aria-label='Tutup pengumuman' className='flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-sky-50 hover:text-school-blue focus-visible:outline-2 focus-visible:outline-school-blue'>
                  <svg viewBox='0 0 24 24' className='h-5 w-5 fill-none stroke-current' strokeWidth='1.8' strokeLinecap='round' aria-hidden='true'><path d='m6 6 12 12M18 6 6 18' /></svg>
                </button>
              </div>
              <DialogTitle className='mt-5 text-2xl font-bold leading-tight tracking-tight text-school-navy'>{announcement.title}</DialogTitle>
              <p className='mt-3 flex items-center gap-2 text-sm text-school-blue'>
                <svg viewBox='0 0 24 24' className='h-4 w-4 shrink-0 fill-none stroke-current' strokeWidth='1.7' strokeLinecap='round' aria-hidden='true'><rect x='3' y='5' width='18' height='16' rx='2' /><path d='M8 3v4M16 3v4M3 11h18' /></svg>
                {announcement.date}
              </p>
              <p className='mt-5 border-t border-sky-100 pt-5 text-sm leading-7 text-slate-600 sm:text-base'>{announcement.text}</p>
              <div className='mt-7 flex justify-end'>
                <button type='button' onClick={() => setOpen(false)} className='rounded-full bg-school-blue px-6 py-2.5 text-sm font-bold text-white transition hover:bg-school-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-school-blue'>Tutup</button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </>
  )
}
