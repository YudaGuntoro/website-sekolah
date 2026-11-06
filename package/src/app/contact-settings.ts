import 'server-only'
import { cache } from 'react'

export type ContactSettings = { whatsappNumber: string; email: string; address: string; instagramUrl: string; tiktokUrl: string; facebookUrl: string }
const defaults: ContactSettings = {
  whatsappNumber: '+62 878-9639-7106', email: 'smpitcendekiapwk@gmail.com',
  address: 'Jl. Veteran No. 100 B, Nagri Kaler, Purwakarta (Belakang Poll Damri)',
  instagramUrl: 'https://www.instagram.com/smpitcendekia/',
  tiktokUrl: 'https://www.tiktok.com/@smpitcendekiapwk', facebookUrl: 'https://www.facebook.com/smpitcendekia',
}
export const getContactSettings = cache(async (): Promise<ContactSettings> => {
  const api = process.env.SCHOOL_API_URL
  if (!api) return defaults
  const response = await fetch(`${api.replace(/\/$/, '')}/api/school/contact`, { cache: 'no-store', signal: AbortSignal.timeout(5000) })
  if (!response.ok) throw new Error('Informasi kontak sekolah belum dapat dimuat.')
  const payload = await response.json()
  if (!payload.success || !payload.data) throw new Error('Informasi kontak tidak valid.')
  return payload.data as ContactSettings
})
export function whatsappUrl(number: string) {
  const digits = number.replace(/\D/g, '')
  return digits ? `https://wa.me/${digits.startsWith('0') ? `62${digits.slice(1)}` : digits}` : ''
}
