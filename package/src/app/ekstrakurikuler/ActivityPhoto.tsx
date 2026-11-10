'use client'

import { useState } from 'react'

export default function ActivityPhoto({ src, title, detail = false }: { src: string; title: string; detail?: boolean }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  return <div className={`relative overflow-hidden bg-sky-50 ${detail ? 'aspect-[4/3] rounded-2xl' : 'aspect-[4/3]'}`}>
    {src && src !== failedSrc ? <img src={src} alt={`Kegiatan ${title}`} loading={detail ? 'eager' : 'lazy'} className={`h-full w-full ${detail ? 'object-contain' : 'object-cover transition duration-500 group-hover:scale-[1.03]'}`} onError={() => setFailedSrc(src)} /> :
      <div className='flex h-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-sky-50 to-blue-100 px-6 text-center'>
        <span className='text-xs font-bold uppercase tracking-[.16em] text-school-blue'>Ekstrakurikuler</span>
        <span className='text-xl font-bold text-school-navy'>{title}</span>
        <span className='mt-1 text-xs text-slate-500'>Foto kegiatan segera hadir</span>
      </div>}
  </div>
}
