import { schoolApiHeaders } from '../../../../school-api-headers'

export async function GET(_request: Request, { params }: { params: Promise<{ slot: string }> }) {
  const { slot } = await params
  const api = process.env.SCHOOL_API_URL
  const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }
  if (!api || !['hero', 'direction', 'program'].includes(slot)) return new Response(null, { status: 404, headers })
  try {
    const response = await fetch(`${api.replace(/\/$/, '')}/api/school/homepage-images/${slot}`, { headers: schoolApiHeaders(), cache: 'no-store', signal: AbortSignal.timeout(10000) })
    const type = response.headers.get('content-type') || ''
    if (!response.ok || !['image/jpeg', 'image/png', 'image/webp'].includes(type)) return new Response(null, { status: response.status === 404 ? 404 : 502, headers })
    return new Response(response.body, { headers: { ...headers, 'Content-Type': type } })
  } catch { return new Response(null, { status: 502, headers }) }
}
