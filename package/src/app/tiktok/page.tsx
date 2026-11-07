import type { Metadata } from 'next'
import SocialPostsPage from '../components/SocialPostsPage'

export const metadata: Metadata = {
  title: 'TikTok Sekolah',
  description: 'Cerita, kegiatan, dan momen terbaru SMPIT Cendekia di TikTok.',
}

export default function TikTokPage() {
  return <SocialPostsPage platform='tiktok' />
}
