import 'server-only'
import { getCmsCollection } from '../cms-content'

export async function getActivities() {
  const entries = await getCmsCollection('ekstrakurikuler')
  if (entries !== null) return [...entries].sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title, 'id'))
  return ['Panahan', 'Basket', 'Futsal', 'Badminton', 'Digital', 'Bahasa Inggris', 'Bahasa Jepang', 'Pramuka', 'Tari', 'Pencak Silat'].map(title => ({
    title, slug: title.toLowerCase().replaceAll(' ', '-'), category: '', coachName: null, summary: 'Ruang untuk mengembangkan minat dan keterampilan bersama teman-teman.', body: '', imageUrl: '', sortOrder: 0,
  }))
}
