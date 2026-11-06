'use client'

import { useMemo, useState } from 'react'

type Achievement = {
  body?: string
  image?: string
  level: string
  title: string
}

const palettes = [
  'from-sky-100 via-blue-100 to-indigo-100 text-blue-700',
  'from-indigo-100 via-violet-100 to-sky-100 text-indigo-700',
  'from-cyan-100 via-sky-100 to-blue-100 text-cyan-800',
  'from-blue-100 via-indigo-100 to-purple-100 text-indigo-800',
]

function TrophyIcon() {
  return (
    <svg viewBox='0 0 64 64' aria-hidden='true' className='relative h-16 w-16 drop-shadow-sm sm:h-[4.5rem] sm:w-[4.5rem]'>
      <path d='M21 10h22v8c0 13-4 19-11 22-7-3-11-9-11-22v-8Z' fill='currentColor' opacity='.88' />
      <path d='M21 15h-9v5c0 8 5 13 13 14m18-19h9v5c0 8-5 13-13 14M32 40v9m-9 5h18M27 49h10' fill='none' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth='4' />
      <path d='m32 17 1.7 3.5 3.8.6-2.8 2.7.7 3.8-3.4-1.8-3.4 1.8.7-3.8-2.8-2.7 3.8-.6L32 17Z' fill='white' />
    </svg>
  )
}

export default function AchievementGrid({ achievements }: { achievements: Achievement[] }) {
  const [query, setQuery] = useState('')
  const filteredAchievements = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('id')
    if (!normalizedQuery) return achievements
    return achievements.filter((achievement) =>
      `${achievement.title} ${achievement.level}`.toLocaleLowerCase('id').includes(normalizedQuery),
    )
  }, [achievements, query])

  return (
    <>
      <div className='mb-10 flex flex-col gap-4 rounded-xl border border-white/80 bg-white/90 p-4 shadow-[0_16px_40px_-30px_rgba(16,45,78,.35)] backdrop-blur sm:mb-12 sm:flex-row sm:items-center sm:justify-between sm:px-5'>
        <div className='flex items-center gap-3'>
          <span className='rounded-full border border-sky-200 bg-sky-50 px-3 py-2 text-[10px] font-extrabold uppercase tracking-[.14em] text-school-blue'>Prestasi</span>
          <p aria-live='polite' className='text-sm font-bold text-school-navy'>{filteredAchievements.length} pencapaian</p>
        </div>
        <label className='flex w-full items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-3 text-school-blue transition focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100 sm:max-w-xs'>
          <svg viewBox='0 0 24 24' aria-hidden='true' className='h-5 w-5 shrink-0 fill-none stroke-current' strokeWidth='1.8'><circle cx='10.8' cy='10.8' r='6.8' /><path d='m16 16 5 5' strokeLinecap='round' /></svg>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder='Cari prestasi...' className='w-full bg-transparent text-sm text-school-navy outline-none placeholder:text-slate-400' />
        </label>
      </div>

      {filteredAchievements.length ? (
        <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-4'>
          {filteredAchievements.map((achievement, index) => (
            <article key={`${achievement.title}-${index}`} className='group overflow-hidden rounded-2xl border border-white bg-white shadow-[0_12px_32px_-22px_rgba(15,45,78,.3)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_-24px_rgba(30,101,168,.32)]'>
              <div className={`relative flex aspect-[1.55] items-center justify-center overflow-hidden bg-gradient-to-br ${palettes[index % palettes.length]}`}>
                <div aria-hidden='true' className='absolute -right-8 -top-12 h-40 w-40 rounded-full border-[22px] border-white/55' />
                <div aria-hidden='true' className='absolute -bottom-14 -left-4 h-32 w-32 rounded-full bg-white/50 blur-sm' />
                <span className='absolute left-4 top-4 rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-school-blue shadow-sm'><span aria-hidden='true'>&#127942;</span> Juara</span>
                {achievement.image ? <img src={achievement.image} alt={achievement.title} className='absolute inset-0 h-full w-full object-cover' loading='lazy' /> : <TrophyIcon />}
                <span className='absolute bottom-4 left-5 text-[9px] font-black uppercase tracking-[.2em] opacity-60'>Prestasi Siswa SMPIT Cendekia</span>
              </div>
              <div className='flex min-h-[203px] flex-col p-5'>
                <p className='flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[.12em] text-sky-700'><span className='flex h-5 w-5 items-center justify-center rounded-full bg-sky-50 text-xs' aria-hidden='true'>&#10022;</span>{achievement.level}</p>
                <h2 className='mt-3 min-h-[2.75rem] text-base font-bold leading-snug text-slate-900'>{achievement.title}</h2>
                {achievement.body && <details className='mt-4 border-t border-slate-100 pt-4 text-sm text-slate-600'><summary className='cursor-pointer font-bold text-school-blue'>Cerita prestasi</summary><p className='mt-3 whitespace-pre-line leading-7'>{achievement.body}</p></details>}
              </div>
            </article>
          ))}
        </div>
      ) : (
        <p className='rounded-xl border border-slate-200 bg-white px-5 py-10 text-center text-sm text-slate-500'>Prestasi yang dicari belum ditemukan.</p>
      )}
    </>
  )
}
