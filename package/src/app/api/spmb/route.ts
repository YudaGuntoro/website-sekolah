import { schoolApiHeaders } from '../../school-api-headers'
const headers = { 'Cache-Control': 'no-store' }
const maxBytes = 2200000
async function forward(request?: Request) {
  const api = process.env.SCHOOL_API_URL
  if (!api) return Response.json({ success: false, message: 'Layanan SPMB belum tersedia.' }, { status: 503, headers })
  try {
    let body: Uint8Array | undefined
    let contentType = 'application/json'
    if (request) {
      contentType = request.headers.get('content-type') || ''
      if (!contentType.startsWith('multipart/form-data;')) return Response.json({ success: false, message: 'Format formulir tidak valid.' }, { status: 400, headers })
      if (Number(request.headers.get('content-length')) > maxBytes) return Response.json({ success: false, message: 'Berkas terlalu besar. Maksimal bukti transfer 1 MB.' }, { status: 413, headers })
      const reader = request.body?.getReader()
      if (!reader) throw new Error('Empty body')
      const chunks: Uint8Array[] = []; let length = 0
      while (true) { const { done, value } = await reader.read(); if (done) break; length += value.length; if (length > maxBytes) { await reader.cancel(); return Response.json({ success: false, message: 'Berkas terlalu besar. Maksimal bukti transfer 1 MB.' }, { status: 413, headers }) } chunks.push(value) }
      body = new Uint8Array(length); let offset = 0; for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.length }
    }
    const response = await fetch(`${api.replace(/\/$/, '')}/api/spmb/${request ? 'applications' : 'schedule'}`, { method: request ? 'POST' : 'GET', body: body as BodyInit | undefined, headers: { ...schoolApiHeaders(request), 'Content-Type': contentType }, cache: 'no-store', signal: AbortSignal.timeout(20000) })
    if (response.status >= 500) throw new Error('Unavailable')
    const payload = await response.json()
    return Response.json(payload, { status: response.status, headers: { ...headers, ...(response.headers.get('retry-after') ? { 'Retry-After': response.headers.get('retry-after')! } : {}) } })
  } catch { return Response.json({ success: false, message: 'Layanan SPMB belum dapat dihubungi. Coba kembali dari formulir ini.' }, { status: 503, headers }) }
}
export async function GET() { return forward() }
export async function POST(request: Request) { return forward(request) }
