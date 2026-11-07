import { validPostUrl, type SocialPlatform } from './social-post-url'

function decodeAttribute(value: string) {
  return value.replace(/&(?:amp|quot|apos|lt|gt|#\d+|#x[\da-f]+);/gi, entity => {
    const named: Record<string, string> = { '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>' }
    if (named[entity.toLowerCase()]) return named[entity.toLowerCase()]
    const code = entity.toLowerCase().startsWith('&#x') ? parseInt(entity.slice(3, -1), 16) : parseInt(entity.slice(2, -1), 10)
    return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : ''
  })
}

function attribute(tag: string, name: string) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`, 'i'))
  return match ? decodeAttribute(match[2]) : ''
}

export function thumbnailFromHtml(html: string, platform: SocialPlatform) {
  // Read image URLs only; never execute or inject platform HTML into our pages.
  if (platform === 'instagram') {
    for (const tag of html.match(/<img\b[^>]*>/gi) ?? []) {
      if (attribute(tag, 'class').split(/\s+/).includes('EmbeddedMediaImage')) return attribute(tag, 'src')
    }
  }
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    if (['og:image', 'twitter:image'].includes(attribute(tag, 'property') || attribute(tag, 'name'))) return attribute(tag, 'content')
  }
  return ''
}

export function allowedImageUrl(value: string, platform: SocialPlatform) {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:' || url.username || url.password || url.port) return false
    const domains = platform === 'instagram' ? ['cdninstagram.com', 'fbcdn.net'] : ['tiktokcdn.com', 'tiktokcdn-us.com', 'tiktokcdn-eu.com', 'byteoversea.com', 'ibytedtos.com', 'byteimg.com', 'muscdn.com']
    return domains.some(domain => url.hostname === domain || url.hostname.endsWith(`.${domain}`))
  } catch { return false }
}

export async function readLimited(response: Response, maxBytes: number) {
  if (Number(response.headers.get('content-length')) > maxBytes) { await response.body?.cancel(); throw new Error('Response too large') }
  const reader = response.body?.getReader()
  if (!reader) throw new Error('Empty response')
  const chunks: Uint8Array[] = []
  let size = 0
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    size += value.length
    if (size > maxBytes) { await reader.cancel(); throw new Error('Response too large') }
    chunks.push(value)
  }
  const data = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) { data.set(chunk, offset); offset += chunk.length }
  return data
}

export async function findThumbnail(postUrl: string, platform: SocialPlatform, signal: AbortSignal) {
  if (!validPostUrl(postUrl, platform)) return ''
  const post = new URL(postUrl)
  if (platform === 'instagram') {
    const response = await fetch(`https://www.instagram.com${post.pathname.replace(/\/$/, '')}/embed/`, {
      redirect: 'error', signal, headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'text/html' }, next: { revalidate: 3600 },
    })
    if (!response.ok) return ''
    return thumbnailFromHtml(new TextDecoder().decode(await readLimited(response, 2_000_000)), platform)
  }
  // TikTok may supply a thumbnail through oEmbed; some posts omit it.
  const oembed = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(postUrl)}`, { redirect: 'error', signal, next: { revalidate: 3600 } })
  if (oembed.ok) {
    const metadata = JSON.parse(new TextDecoder().decode(await readLimited(oembed, 200_000))) as { thumbnail_url?: string }
    if (typeof metadata.thumbnail_url === 'string' && allowedImageUrl(metadata.thumbnail_url, platform)) return metadata.thumbnail_url
  }
  // Resolve TikTok share links only to another validated TikTok post URL.
  let current = postUrl
  for (let hop = 0; hop < 4; hop++) {
    const response = await fetch(current, { redirect: 'manual', signal, headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'text/html' }, next: { revalidate: 3600 } })
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location')
      await response.body?.cancel()
      if (!location) return ''
      current = new URL(location, current).href
      if (!validPostUrl(current, platform)) return ''
      continue
    }
    if (!response.ok) return ''
    return thumbnailFromHtml(new TextDecoder().decode(await readLimited(response, 2_000_000)), platform)
  }
  return ''
}
