'use client'

import { useId, useState } from 'react'

export default function GreetingMore({ paragraphs }: { paragraphs: string[] }) {
  const [expanded, setExpanded] = useState(false)
  const contentId = useId()

  return <div className='mt-4'>
    <div id={contentId} hidden={!expanded} className='space-y-4 text-sm leading-7 text-slate-600 sm:text-base'>
      {paragraphs.map((paragraph, index) => <p key={index} className='whitespace-pre-line'>{paragraph}</p>)}
    </div>
    <button type='button' aria-expanded={expanded} aria-controls={contentId} onClick={() => setExpanded(value => !value)} className={`${expanded ? 'mt-4 ' : ''}cursor-pointer text-sm font-semibold text-school-blue underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-school-blue sm:text-base`}>
      {expanded ? 'Lihat lebih sedikit' : 'Lihat selengkapnya'}
    </button>
  </div>
}
