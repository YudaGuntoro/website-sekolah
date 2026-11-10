'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'

type StaffMember = {
  name: string
  role: string
  bio?: string
  image: string
}

export default function StaffGrid({ staff, category, countLabel }: { staff: StaffMember[]; category: string; countLabel: string }) {
  const [query, setQuery] = useState('')
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
        <div className='grid gap-5 sm:grid-cols-2 xl:grid-cols-3'>
          {filteredStaff.map((person) => (
            <article key={person.name} className='overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_12px_32px_-22px_rgba(15,45,78,.2)]'>
              <div className='relative aspect-[4/5] overflow-hidden border-b border-slate-100 bg-white'>
                <Image unoptimized src={person.image} alt={`Foto ${person.name}`} fill sizes='(min-width: 1280px) 380px, (min-width: 640px) 50vw, 100vw' className='object-cover object-[center_35%]' />
              </div>
              <div className='p-5 sm:p-6'>
                <h3 className='min-h-[3.1rem] text-lg font-bold leading-snug text-school-navy'>{person.name}</h3>
                <p className='mt-2 min-h-10 text-sm font-semibold leading-5 text-school-blue'>{person.role}</p>
                {person.bio && <p className='mt-3 whitespace-pre-line text-sm leading-6 text-slate-600'>{person.bio}</p>}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className='rounded-xl border border-slate-200 bg-white px-5 py-10 text-center text-sm text-slate-500'>Nama atau peran yang dicari belum ditemukan.</p>
      )}
    </>
  )
}
