import { schoolApiHeaders } from '../../../../school-api-headers'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const api = process.env.SCHOOL_API_URL
  const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }
  if (!api || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) return new Response(null, { status: 404, headers })
  try {
    const response = await fetch(`${api.replace(/\/$/, '')}/api/school/images/${id}`, { headers: schoolApiHeaders(), cache: 'no-store', signal: AbortSignal.timeout(10000) })
    const type = response.headers.get('content-type') || ''
    if (!response.ok || !['image/jpeg', 'image/png', 'image/webp'].includes(type)) return new Response(null, { status: response.status === 404 ? 404 : 502, headers })
    return new Response(response.body, { headers: { ...headers, 'Content-Type': type } })
  } catch { return new Response(null, { status: 502, headers }) }
}
