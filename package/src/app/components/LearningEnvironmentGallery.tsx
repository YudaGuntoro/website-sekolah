'use client'

import Image from 'next/image'
import { useState } from 'react'

const learningItems = [
  {
    title: 'Fasilitas dan kegiatan belajar',
    description: 'Fasilitas meliputi ruang kelas AC, laboratorium komputer, perpustakaan, gedung aula, lapangan basket, dan masjid.',
    image: '/images/school/kolase-pendidikan.png',
    alt: 'Ilustrasi fasilitas belajar, perpustakaan, laboratorium, dan kegiatan siswa Cendekia',
  },
  {
    title: 'Pendampingan tenaga pendidik',
    description: 'Guru mendampingi siswa untuk bertanya, mencoba, dan mengembangkan pemahaman dengan percaya diri.',
    image: '/images/school/pendampingan-mentor.png',
    alt: 'Guru mendampingi siswa mengenali minat, bakat, dan merencanakan karier',
  },
  {
    title: 'Ruang tumbuh dan berkreasi',
    description: 'Kegiatan akademik dan nonakademik memberi ruang bagi siswa untuk menemukan minat dan potensinya.',
    image: '/images/school/pelajar-kreatif.png',
    alt: 'Pelajar mengembangkan minat dalam seni, musik, olahraga, dan literasi',
  },
]

export default function LearningEnvironmentGallery() {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeItem = learningItems[activeIndex]

  return (
    <div className='grid items-stretch gap-3 sm:gap-4 lg:grid-cols-[2fr_.95fr]'>
      <figure className='relative min-w-0 overflow-hidden rounded-2xl bg-[#e0f2fe]'>
        <div className='relative aspect-video w-full lg:h-full lg:min-h-[420px]'>
          <Image
            key={activeItem.image}
            src={activeItem.image}
            alt={activeItem.alt}
            fill
            sizes='(min-width: 1280px) 800px, (min-width: 1024px) 66vw, 100vw'
            className={`${activeIndex > 0 ? 'object-contain p-2 sm:px-3 sm:pt-3 sm:pb-16' : 'object-contain'} transition duration-300`}
          />
        </div>
        <figcaption className='bg-school-navy px-4 py-3 sm:absolute sm:inset-x-0 sm:bottom-0 sm:bg-transparent sm:bg-gradient-to-t sm:from-school-navy/95 sm:via-school-navy/70 sm:to-transparent sm:px-7 sm:pb-6 sm:pt-14'>
          <h3 className='text-[15px] font-bold text-white sm:text-xl'>{activeItem.title}</h3>
          <p className='mt-1 max-w-2xl text-xs leading-5 text-blue-50 sm:mt-2 sm:text-sm sm:leading-6'>{activeItem.description}</p>
        </figcaption>
      </figure>

      <div className='flex flex-col gap-2 sm:gap-3'>
        {learningItems.map((item, index) => (
          <button
            key={item.title}
            type='button'
            aria-pressed={activeIndex === index}
            onClick={() => setActiveIndex(index)}
            className={`flex flex-1 items-center gap-4 rounded-xl border bg-white p-3 text-left transition-colors hover:border-sky-300 sm:rounded-2xl sm:p-4 ${activeIndex === index ? 'border-sky-300 ring-2 ring-sky-100' : 'border-slate-100'}`}
          >
            <span className='relative hidden h-[72px] w-[72px] shrink-0 overflow-hidden rounded-xl bg-sky-50 sm:block'>
              <Image src={item.image} alt='' fill sizes='72px' className='object-contain' />
            </span>
            <span className='min-w-0'>
              <span className='block text-sm font-bold text-school-navy sm:text-base'>{item.title}</span>
              <span className='mt-1 hidden text-sm leading-5 text-slate-600 sm:block'>{item.description}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
