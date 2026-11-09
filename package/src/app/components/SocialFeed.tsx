import type { CmsEntry } from '../cms-content'
import { validPostUrl, type SocialPlatform as Platform } from '../social-post-url'
import InstagramProfile from './InstagramProfile'
import TikTokProfile from './TikTokProfile'

export function getSocialPosts(entries: CmsEntry[], platform: Platform) {
  const posts = entries.filter(entry => validPostUrl(entry.postUrl, platform))
  // Preserve the API's order for equal dates (newest Id first).
  return posts.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
}

export default function SocialFeed({ platform }: { platform: Platform }) {
  return platform === 'instagram' ? <InstagramProfile /> : <TikTokProfile />
}
