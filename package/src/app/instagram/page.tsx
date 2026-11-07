import type { Metadata } from 'next'
import SocialPostsPage from '../components/SocialPostsPage'

export const metadata: Metadata = {
  title: 'Instagram Sekolah',
  description: 'Cerita, kegiatan, dan momen terbaru SMPIT Cendekia di Instagram.',
}

export default function InstagramPage() {
  return <SocialPostsPage platform='instagram' />
}
