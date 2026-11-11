import { schoolApiHeaders } from './school-api-headers'
import 'server-only'
import { cache } from 'react'
export type HomepageImages = { heroUrl: string; directionUrl: string; programUrl: string; spmbUrl: string }
export const getHomepageImages = cache(async (): Promise<HomepageImages> => {
  const api = process.env.SCHOOL_API_URL
  if (!api) return { heroUrl: '', directionUrl: '', programUrl: '', spmbUrl: '' }
  const response = await fetch(`${api.replace(/\/$/, '')}/api/school/homepage-images`, { headers: schoolApiHeaders(), cache: 'no-store', signal: AbortSignal.timeout(5000) })
  if (!response.ok) throw new Error('Gambar beranda belum dapat dimuat.')
  const payload = await response.json()
  if (!payload.success || !payload.data) throw new Error('Pengaturan gambar tidak valid.')
  return payload.data as HomepageImages
})
