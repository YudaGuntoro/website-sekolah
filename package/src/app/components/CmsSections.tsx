import { getCmsCollection, type CmsEntry } from '../cms-content'

export function ContentSections({ entries }: { entries: CmsEntry[] }) {
  return <div className='grid gap-5 md:grid-cols-2'>{entries.map(entry => <article key={entry.slug} className='overflow-hidden rounded-2xl border border-sky-100 bg-white p-6 sm:p-8'>
    {entry.imageUrl && <img src={entry.imageUrl} alt={entry.title} className='mb-6 max-h-72 w-full rounded-xl object-cover' loading='lazy' />}
    {entry.category && <p className='mb-3 text-xs font-bold uppercase tracking-wider text-school-blue'>{entry.category}</p>}
    <h2 className='text-xl font-bold text-school-navy'>{entry.title}</h2>
    {entry.summary && <p className='mt-4 text-sm leading-7 text-slate-600'>{entry.summary}</p>}
    {entry.body !== entry.summary && entry.body.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index} className='mt-4 whitespace-pre-line text-sm leading-7 text-slate-600'>{paragraph}</p>)}
  </article>)}</div>
}
export default async function CmsSections({ collection }: { collection: string }) {
  const entries = await getCmsCollection(collection)
  return entries?.length ? <ContentSections entries={entries} /> : null
}
