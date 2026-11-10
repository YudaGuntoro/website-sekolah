'use client'

import Image from 'next/image'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import { useMemo, useState } from 'react'

type StaffMember = {
  name: string
  role: string
  bio?: string
  image: string
}

export default function StaffGrid({ staff, category, countLabel }: { staff: StaffMember[]; category: string; countLabel: string }) {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<StaffMember | null>(null)
  const filteredStaff = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('id')
    if (!normalizedQuery) return staff
    return staff.filter((person) => `${person.name} ${person.role}`.toLocaleLowerCase('id').includes(normalizedQuery))
  }, [query, staff])

  return (
    <>
      <div className='mb-10 flex flex-col gap-4 rounded-xl border border-white/80 bg-white/90 p-4 shadow-[0_16px_40px_-30px_rgba(16,45,78,.35)] backdrop-blur sm:mb-12 sm:flex-row sm:items-center sm:justify-between sm:px-5'>
        <div className='flex items-center gap-3'>
          <span className='rounded-full border border-sky-200 bg-sky-50 px-3 py-2 text-[10px] font-extrabold uppercase tracking-[.14em] text-school-blue'>{category}</span>
          <p aria-live='polite' className='text-sm font-bold text-school-navy'>{filteredStaff.length} {countLabel}</p>
        </div>
        <label className='flex w-full items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 text-school-blue transition focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100 sm:max-w-xs'>
          <svg viewBox='0 0 24 24' aria-hidden='true' className='h-5 w-5 shrink-0 fill-none stroke-current' strokeWidth='1.8'><circle cx='10.8' cy='10.8' r='6.8' /><path d='m16 16 5 5' strokeLinecap='round' /></svg>
          <input aria-label={`Cari ${category.toLocaleLowerCase('id')}`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder='Cari nama atau peran...' className='w-full bg-transparent text-sm text-school-navy outline-none placeholder:text-slate-400' />
        </label>
      </div>

      {filteredStaff.length ? (
        <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {filteredStaff.map((person) => (
            <article key={person.name} className='group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_32px_-22px_rgba(15,45,78,.2)] transition-colors hover:border-sky-300'>
              <div className='relative h-60 overflow-hidden border-b border-slate-100 bg-white sm:h-64'>
                <Image unoptimized src={person.image} alt={`Foto ${person.name}`} fill sizes='(min-width: 1280px) 285px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw' className='object-cover object-top' />
              </div>
              <div className='p-5'>
                <h3 className='min-h-[3.1rem] text-lg font-bold leading-snug text-school-navy'>{person.name}</h3>
                <p className='mt-2 min-h-10 text-sm font-semibold leading-5 text-school-blue'>{person.role}</p>
                {person.bio && <p className='mt-3 whitespace-pre-line text-sm leading-6 text-slate-600'>{person.bio}</p>}
                <p className='mt-4 text-sm font-semibold text-school-blue group-hover:underline'>Lihat profil <span aria-hidden='true'>↗</span></p>
              </div>
              <button type='button' onClick={() => setSelected(person)} aria-haspopup='dialog' aria-label={`Lihat profil ${person.name}`} className='absolute inset-0 cursor-pointer rounded-2xl focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-school-blue' />
            </article>
          ))}
        </div>
      ) : (
        <p className='rounded-xl border border-slate-200 bg-white px-5 py-10 text-center text-sm text-slate-500'>Nama atau peran yang dicari belum ditemukan.</p>
      )}
      <Dialog open={selected !== null} onClose={() => setSelected(null)} className='fixed inset-0 z-[80]'>
        <DialogBackdrop className='fixed inset-0 bg-slate-950/60 backdrop-blur-md' />
        <div className='fixed inset-0 flex items-center justify-center p-4 sm:p-6'>
          <DialogPanel className='max-h-[88dvh] w-full max-w-md overflow-y-auto rounded-[28px] bg-white shadow-[0_32px_100px_-24px_rgba(0,0,0,.5)]'>
            {selected && <>
              <div className='relative isolate h-36 overflow-hidden bg-gradient-to-br from-[#102d4e] via-[#194f7e] to-[#297f9d] px-6 pt-5 sm:h-40'>
                <div aria-hidden='true' className='pointer-events-none absolute -right-10 -top-24 -z-10 h-64 w-64 rounded-full border-[36px] border-white/[.06]' />
                <p className='pr-12 text-[10px] font-semibold uppercase tracking-[.2em] text-sky-100/90'>SMPIT Cendekia <span className='mt-1 block text-[9px] font-medium tracking-[.25em] text-sky-200/70'>Purwakarta</span></p>
                <button type='button' onClick={() => setSelected(null)} aria-label='Tutup profil' className='absolute right-4 top-4 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'>
                  <svg viewBox='0 0 24 24' className='h-5 w-5' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' aria-hidden='true'><path d='m6 6 12 12M18 6 6 18' /></svg>
                </button>
              </div>
              <div className='relative px-6 pb-7 sm:px-8 sm:pb-8'>
                <div className='relative mx-auto -mt-16 h-48 w-40 overflow-hidden rounded-[20px] border-[5px] border-white bg-[#f6f8fb] shadow-[0_12px_30px_-16px_rgba(16,45,78,.4)]'>
                  <Image unoptimized src={selected.image} alt={`Foto ${selected.name}`} fill sizes='160px' className='object-cover object-top' />
                </div>
                <div className='mt-6 text-center'>
                  <p className='text-[10px] font-bold uppercase tracking-[.16em] text-school-blue'>{category}</p>
                  <DialogTitle className='mt-2 text-2xl font-bold leading-tight tracking-tight text-school-navy sm:text-[28px]'>{selected.name}</DialogTitle>
                  <p className='mt-3 text-sm font-medium leading-6 text-slate-500'>{selected.role}</p>
                </div>
                {selected.bio && <div className='mt-6 border-t border-slate-100 pt-5'><p className='whitespace-pre-line text-sm leading-7 text-slate-600'>{selected.bio}</p></div>}
              </div>
            </>}
          </DialogPanel>
        </div>
      </Dialog>
    </>
  )
}
