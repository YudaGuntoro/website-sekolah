import { schoolApiHeaders } from '../../../school-api-headers'

export async function GET() {
  const api = process.env.SCHOOL_API_URL
  const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' }
  if (!api) return new Response(null, { status: 404, headers })
  try {
    const response = await fetch(`${api.replace(/\/$/, '')}/api/school/spmb-brochure`, { headers: schoolApiHeaders(), cache: 'no-store', signal: AbortSignal.timeout(10000) })
    if (!response.ok || !response.headers.get('content-type')?.toLowerCase().startsWith('application/pdf')) return new Response(null, { status: response.status === 404 ? 404 : 502, headers })
    return new Response(response.body, { headers: { ...headers, 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="brosur-spmb.pdf"' } })
  } catch { return new Response(null, { status: 502, headers }) }
}
