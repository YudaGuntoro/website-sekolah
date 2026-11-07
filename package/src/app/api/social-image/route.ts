import { getCmsCollection } from '../../cms-content'
import { allowedImageUrl, findThumbnail, readLimited } from '../../social-thumbnail'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams
  const platform = query.get('platform')
  const slug = query.get('slug')
  if ((platform !== 'instagram' && platform !== 'tiktok') || !slug || slug.length > 220) return new Response(null, { status: 400 })
  try {
    // Only published CMS posts can be fetched, never an arbitrary visitor-supplied URL.
    const posts = await getCmsCollection(platform)
    const post = posts?.find(entry => entry.slug === slug)
    if (!post) return new Response(null, { status: 404, headers: { 'Cache-Control': 'no-store' } })
    const signal = AbortSignal.timeout(12000)
    const thumbnail = await findThumbnail(post.postUrl, platform, signal)
    if (!allowedImageUrl(thumbnail, platform)) throw new Error('No public thumbnail')
    const response = await fetch(thumbnail, { redirect: 'error', signal, cache: 'no-store' })
    const contentType = response.headers.get('content-type')?.split(';')[0].trim() || ''
    if (!response.ok || !['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'].includes(contentType)) { await response.body?.cancel(); throw new Error('Invalid image') }
    const image = await readLimited(response, 5_000_000)
    return new Response(image as BodyInit, { headers: {
      'Content-Type': contentType, 'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    } })
  } catch {
    return new Response(null, { status: 404, headers: { 'Cache-Control': 'no-store' } })
  }
}
