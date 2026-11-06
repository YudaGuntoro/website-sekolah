import { schoolApiHeaders } from '../../school-api-headers'
// Public proxy: never forwards dashboard credentials or exposes applicant records.
const headers = { 'Cache-Control': 'no-store' }
async function forward(request?: Request) {
  const api = process.env.SCHOOL_API_URL
  if (!api) return Response.json({ success: false, message: 'Pendaftaran belum tersedia. Silakan hubungi sekolah.' }, { status: 503, headers })
  try {
    let body: string | undefined
    if (request) {
      const tooLarge = () => Response.json({ success: false, message: 'Data formulir terlalu besar.' }, { status: 413, headers })
      if (Number(request.headers.get('content-length')) > 32768) return tooLarge()
      const reader = request.body?.getReader()
      if (!reader) return Response.json({ success: false, message: 'Data formulir tidak valid.' }, { status: 400, headers })
      const chunks: Uint8Array[] = []; let length = 0
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        length += value.length
        if (length > 32768) { await reader.cancel(); return tooLarge() }
        chunks.push(value)
      }
      const bytes = new Uint8Array(length); let offset = 0
      for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length }
      body = new TextDecoder().decode(bytes)
      if (length > 32768) return Response.json({ success: false, message: 'Data formulir terlalu besar.' }, { status: 413, headers })
      try { JSON.parse(body) } catch { return Response.json({ success: false, message: 'Data formulir tidak valid.' }, { status: 400, headers }) }
    }
    const response = await fetch(`${api.replace(/\/$/, '')}/api/spmb/${request ? 'applications' : 'schedule'}`, {
      method: request ? 'POST' : 'GET', headers: { ...schoolApiHeaders(request), 'Content-Type': 'application/json' }, body,
      cache: 'no-store', signal: AbortSignal.timeout(request ? 15000 : 5000),
    })
    if (response.status >= 500) throw new Error('SPMB service unavailable')
    const payload = await response.json()
    return Response.json(payload, { status: response.status, headers: { ...headers, ...(response.headers.get('retry-after') ? { 'Retry-After': response.headers.get('retry-after')! } : {}) } })
  } catch {
    return Response.json({ success: false, message: 'Layanan pendaftaran belum dapat dihubungi. Silakan coba kembali; hindari mengirim ulang dari halaman lain.' }, { status: 503, headers })
  }
}
export async function GET() { return forward() }
export async function POST(request: Request) { return forward(request) }
