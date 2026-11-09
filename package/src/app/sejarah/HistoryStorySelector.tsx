'use client'

import Image from 'next/image'
import { useState } from 'react'

const stories = [
  {
    title: 'Tahun Pendirian',
    eyebrow: 'Awal perjalanan',
    text: 'Tahun pendirian resmi SMPIT Cendekia akan dicantumkan di sini setelah datanya tersedia.',
    image: '/images/school/kolase-pendidikan.png',
    alt: 'Kegiatan pendidikan di SMPIT Cendekia',
  },
  {
    title: 'Awal Mula',
    eyebrow: 'Mengapa Cendekia hadir',
    text: 'Cendekia hadir dengan semangat memberi ruang bagi anak untuk belajar, mengenali potensinya, membangun karakter, dan berani berkarya.',
    image: '/images/school/pelajar-ceria.png',
    alt: 'Murid SMPIT Cendekia',
  },
  {
    title: 'Visi ke Depan',
    eyebrow: 'Arah pendidikan',
    text: 'Mewujudkan sekolah yang unggul dalam iman, ilmu, dan amal melalui kepemimpinan yang inklusif, berintegritas, dan berorientasi pada pembinaan karakter, prestasi, serta kepedulian lingkungan. Visi ini menjadi arah bagi seluruh warga sekolah dalam merancang pembelajaran dan kegiatan yang mendukung tujuan tersebut.',
    image: '/images/school/siswa-ceria.png',
    alt: 'Ilustrasi murid belajar bersama',
  },
]

export default function HistoryStorySelector() {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeStory = stories[activeIndex]

  return (
    <div className='grid gap-6 lg:grid-cols-[1.08fr_.92fr] lg:gap-8'>
      <div>
        <div className='relative aspect-[1.55] min-h-[260px] overflow-hidden rounded-2xl bg-sky-100 shadow-[0_18px_48px_-30px_rgba(16,45,78,.4)]'>
          <Image key={activeStory.image} src={activeStory.image} alt={activeStory.alt} fill priority className='object-cover transition duration-500' sizes='(max-width: 1024px) 100vw, 55vw' />
          <div className='absolute inset-0 bg-gradient-to-t from-school-navy/75 via-school-navy/5 to-transparent' />
          <span className='absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[.14em] text-school-blue backdrop-blur'>{activeStory.eyebrow}</span>
          <h2 className='absolute bottom-5 left-5 right-5 text-2xl font-black text-white sm:text-3xl'>{activeStory.title}</h2>
        </div>
        <p className='mt-4 text-sm leading-7 text-slate-600'>{activeStory.text}</p>
      </div>

      <div className='flex flex-col gap-3' aria-label='Pilih bagian sejarah sekolah'>
        {stories.map((story, index) => {
          const selected = index === activeIndex
          return (
            <button key={story.title} type='button' onClick={() => setActiveIndex(index)} aria-pressed={selected} className={`flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition sm:p-5 ${selected ? 'border-sky-300 bg-white shadow-[0_12px_32px_-25px_rgba(30,101,168,.4)]' : 'border-slate-200 bg-white/70 hover:border-sky-200 hover:bg-white'}`}>
              <span className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-black ${selected ? 'bg-school-blue text-white' : 'bg-sky-100 text-school-blue'}`}>{String(index + 1).padStart(2, '0')}</span>
              <span className='min-w-0 flex-1'>
                <span className='block font-bold text-school-navy'>{story.title}</span>
                <span className='mt-1 block text-sm leading-6 text-slate-600'>{story.text}</span>
              </span>
              <svg viewBox='0 0 20 20' className={`mt-1 h-4 w-4 shrink-0 fill-none stroke-current transition ${selected ? 'text-school-blue' : 'text-slate-400'}`} strokeWidth='1.8' aria-hidden='true'><path d='m7 4 6 6-6 6' strokeLinecap='round' strokeLinejoin='round' /></svg>
            </button>
          )
        })}
      </div>
    </div>
  )
}
