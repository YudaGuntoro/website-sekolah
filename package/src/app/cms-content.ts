import { schoolApiHeaders } from './school-api-headers'
import 'server-only'
import { cache } from 'react'
import * as defaults from './school-content'

export type CmsEntry = { collection: string; title: string; slug: string; category: string; summary: string; body: string; imageUrl: string; postUrl: string; publishedAt: string; sortOrder: number }

// Without a configured CMS, the original template remains available for standalone previews.
// When configured, an empty collection is authoritative: unpublished/deleted items never return.
export const getCmsContent = cache(async (): Promise<CmsEntry[] | null> => {
  const api = process.env.SCHOOL_API_URL
  if (!api) return null
  const response = await fetch(`${api.replace(/\/$/, '')}/api/school/content`, { headers: schoolApiHeaders(), cache: 'no-store', signal: AbortSignal.timeout(5000) })
  if (!response.ok) throw new Error('Konten sekolah belum dapat dimuat. Coba lagi beberapa saat.')
  const payload = await response.json() as { success: boolean; data: CmsEntry[] }
  if (!payload.success || !Array.isArray(payload.data)) throw new Error('Respons konten sekolah tidak valid.')
  return payload.data
})
export async function getCmsCollection(collection: string) {
  const entries = await getCmsContent()
  return entries === null ? null : entries.filter(entry => entry.collection === collection)
}
const date = (value: string) => new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(new Date(value.endsWith('Z') ? value : value + 'Z'))
const byName = (a: { name: string }, b: { name: string }) => a.name.trim().localeCompare(b.name.trim(), 'id', { sensitivity: 'base' })
export async function getSchoolContent() {
  const entries = await getCmsContent()
  if (entries === null) return { ...defaults, schoolNews: defaults.schoolNews.map(n => ({ ...n, image: '' })), staff: defaults.staff.map(n => ({ ...n, bio: '' })).sort(byName), achievements: defaults.achievements.map(n => ({ ...n, body: '', image: '' })) }
  const group = (key: string) => entries.filter(e => e.collection === key)
  return {
    schoolNews: group('berita').map(e => ({ slug: e.slug, title: e.title, category: e.category, text: e.summary, body: e.body.split(/\n\s*\n/).filter(Boolean), image: e.imageUrl, date: date(e.publishedAt), publishedAt: e.publishedAt.slice(0, 10), visual: 'literasi' })),
    announcements: group('pengumuman').map(e => ({ title: e.title, date: date(e.publishedAt), text: e.body || e.summary })),
    achievements: group('prestasi').map(e => ({ title: e.title, level: e.category, body: [e.summary, e.body !== e.summary ? e.body : ''].filter(Boolean).join('\n\n'), image: e.imageUrl })),
    staff: group('guru').map(e => ({ name: e.title, role: e.category, image: e.imageUrl || '/images/mentor/girl1.svg', bio: [e.summary, e.body !== e.summary ? e.body : ''].filter(Boolean).join('\n\n') })).sort(byName),
    schoolRoutines: group('kegiatan').map(e => e.title),
  }
}
