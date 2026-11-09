import { schoolApiHeaders } from './school-api-headers'
import 'server-only'
import { cache } from 'react'
export type SchoolIdentity = { vision: string; motto: string; missions: { title: string; text: string }[] }
const defaults: SchoolIdentity = {
  "vision": "Mewujudkan sekolah yang unggul dalam iman, ilmu, dan amal melalui kepemimpinan yang inklusif, berintegritas, dan berorientasi pada pembinaan karakter, prestasi, serta kepedulian lingkungan.",
  "motto": "Berkarakter, berprestasi, menginspirasi.",
  "missions": [
    {
      "title": "Iman & akhlak",
      "text": "Membina keimanan dan akhlak mulia melalui kegiatan keagamaan untuk membentuk murid yang religius dan berakhlak."
    },
    {
      "title": "Ilmu & literasi",
      "text": "Meningkatkan kualitas pembelajaran dan budaya literasi untuk membentuk generasi cerdas dan berwawasan."
    },
    {
      "title": "Jiwa pemimpin",
      "text": "Menumbuhkan jiwa kepemimpinan murid."
    },
    {
      "title": "Budaya positif",
      "text": "Membangun budaya sekolah positif melalui komunikasi terbuka, kolaborasi harmonis, serta lingkungan belajar yang menyenangkan dan aman."
    },
    {
      "title": "Peduli lingkungan",
      "text": "Menanamkan kepedulian terhadap lingkungan."
    },
    {
      "title": "Bakat & minat",
      "text": "Mendukung bakat dan minat melalui kegiatan ekstrakurikuler yang membangun fisik sehat, jiwa sportif, dan kerja sama tim."
    }
  ]
}
export const getSchoolIdentity = cache(async (): Promise<SchoolIdentity> => {
  const api = process.env.SCHOOL_API_URL
  if (!api) return defaults
  const response = await fetch(api.replace(/\/$/, '') + '/api/school/identity', { headers: schoolApiHeaders(), cache: 'no-store', signal: AbortSignal.timeout(5000) })
  if (!response.ok) throw new Error('Profil sekolah belum dapat dimuat.')
  const payload = await response.json()
  if (!payload.success || !payload.data || !Array.isArray(payload.data.missions)) throw new Error('Profil sekolah tidak valid.')
  return payload.data as SchoolIdentity
})
