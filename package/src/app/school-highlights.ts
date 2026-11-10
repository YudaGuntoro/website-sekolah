import 'server-only'
import { cache } from 'react'
import { schoolApiHeaders } from './school-api-headers'

export type HighlightCard = { title: string; category: string; text: string; value: string; icon: string }
export type SchoolHighlights = { heading: string; accent: string; description: string; enabled: boolean; cards: HighlightCard[] }

const cards = [
  { value: '18+', title: 'Ruang Kelas', category: 'Fasilitas belajar', text: 'Ruang belajar nyaman yang mendukung diskusi dan kolaborasi.', icon: 'classroom' },
  { value: '30+', title: 'Tenaga Pendidik', category: 'Komunitas akademik', text: 'Guru dan staf yang mendampingi proses belajar murid.', icon: 'educators' },
  { value: '12+', title: 'Ekstrakurikuler', category: 'Eksplorasi minat', text: 'Pilihan kegiatan untuk mengeksplorasi minat dan bakat.', icon: 'activities' },
  { value: '3', title: 'Laboratorium', category: 'Praktik & riset', text: 'Ruang praktik untuk belajar sains, komputer, dan keterampilan.', icon: 'laboratory' },
  { value: '1', title: 'Perpustakaan', category: 'Literasi', text: 'Koleksi bacaan dan ruang tenang untuk mencari inspirasi.', icon: 'library' },
  { value: '4', title: 'Fokus Pengembangan', category: 'Pembelajaran holistik', text: 'Akademik, karakter, kreativitas, dan kebugaran.', icon: 'growth' },
]
// Defaults only support standalone previews without a configured school API.
const defaults: SchoolHighlights = {
  heading: 'Ruang untuk', accent: 'tumbuh lebih jauh.',
  description: 'Dukungan akademik, fasilitas, dan aktivitas yang membuka lebih banyak cara untuk belajar dan berkembang.',
  enabled: true, cards,
}
export const getSchoolHighlights = cache(async (): Promise<SchoolHighlights> => {
  const api = process.env.SCHOOL_API_URL
  if (!api) return defaults
  const response = await fetch(api.replace(/\/$/, '') + '/api/school/highlights', { headers: schoolApiHeaders(), cache: 'no-store', signal: AbortSignal.timeout(5000) })
  if (!response.ok) throw new Error('Statistik sekolah belum dapat dimuat.')
  const payload = await response.json()
  if (!payload.success || !payload.data || !Array.isArray(payload.data.cards)) throw new Error('Data statistik sekolah tidak valid.')
  return payload.data as SchoolHighlights
})
