import { schoolApiHeaders } from '../../../school-api-headers'

const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' }
const invalid = () => Response.json({ success: false, message: 'Masukkan nama lengkap peserta sesuai data pendaftaran.' }, { status: 400, headers })

export async function POST(request: Request) {
  if (!request.headers.get('content-type')?.startsWith('application/json')) return invalid()
  const reader = request.body?.getReader()
  if (!reader) return invalid()
  let input: { studentName?: unknown }
  try {
    const chunks: Uint8Array[] = []; let size = 0
    while (true) {
      const { done, value } = await reader.read(); if (done) break
      size += value.length
      if (size > 2048) { await reader.cancel(); return invalid() }
      chunks.push(value)
    }
    const body = new Uint8Array(size); let offset = 0
    for (const chunk of chunks) { body.set(chunk, offset); offset += chunk.length }
    input = JSON.parse(new TextDecoder().decode(body))
    if (!input || typeof input.studentName !== 'string') return invalid()
    if (input.studentName.trim().length < 2 || input.studentName.trim().length > 150) return invalid()
  } catch { return invalid() }
  const api = process.env.SCHOOL_API_URL
  if (!api) return Response.json({ success: false, message: 'Layanan pengecekan belum tersedia.' }, { status: 503, headers })
  try {
    const response = await fetch(`${api.replace(/\/$/, '')}/api/lmp/check-status`, {
      method: 'POST', headers: { ...schoolApiHeaders(request), 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentName: (input.studentName as string).trim() }),
      cache: 'no-store', signal: AbortSignal.timeout(10000),
    })
    if (response.status >= 500) throw new Error('Unavailable')
    return Response.json(await response.json(), { status: response.status, headers: { ...headers, ...(response.headers.get('retry-after') ? { 'Retry-After': response.headers.get('retry-after')! } : {}) } })
  } catch { return Response.json({ success: false, message: 'Status belum dapat diperiksa. Silakan coba beberapa saat lagi.' }, { status: 503, headers }) }
}
