export type SocialPlatform = 'instagram' | 'tiktok'

export function validPostUrl(value: string, platform: SocialPlatform) {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return false
    if (platform === 'instagram') return ['instagram.com', 'www.instagram.com', 'm.instagram.com'].includes(url.hostname)
      && /^\/(p|reel|reels|tv)\/[A-Za-z0-9_-]+\/?$/.test(url.pathname)
    return (['tiktok.com', 'www.tiktok.com', 'm.tiktok.com'].includes(url.hostname) && /^\/@[^/]+\/(video|photo)\/[0-9]+\/?$/.test(url.pathname))
      || (['vm.tiktok.com', 'vt.tiktok.com'].includes(url.hostname) && /^\/[A-Za-z0-9]+\/?$/.test(url.pathname))
  } catch { return false }
}
