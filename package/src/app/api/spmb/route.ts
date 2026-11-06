// Public proxy: never forwards dashboard credentials or exposes applicant records.
const headers = { 'Cache-Control': 'no-store' }
async function forward(request?: Request) {
  const api = process.env.SCHOOL_API_URL
  if (!api) return Response.json({ success: false, message: 'Pendaftaran belum tersedia. Silakan hubungi sekolah.' }, { status: 503, headers })
  try {
    let body: string | undefined
    if (request) {
      body = await request.text()
      if (new TextEncoder().encode(body).length > 32768) return Response.json({ success: false, message: 'Data formulir terlalu besar.' }, { status: 413, headers })
      try { JSON.parse(body) } catch { return Response.json({ success: false, message: 'Data formulir tidak valid.' }, { status: 400, headers }) }
    }
    const response = await fetch(`${api.replace(/\/$/, '')}/api/spmb/${request ? 'applications' : 'schedule'}`, {
      method: request ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json' }, body,
      cache: 'no-store', signal: AbortSignal.timeout(request ? 15000 : 5000),
    })
    if (response.status >= 500) throw new Error('SPMB service unavailable')
    const payload = await response.json()
    return Response.json(payload, { status: response.status, headers })
  } catch {
    return Response.json({ success: false, message: 'Layanan pendaftaran belum dapat dihubungi. Silakan coba kembali; hindari mengirim ulang dari halaman lain.' }, { status: 503, headers })
  }
}
export async function GET() { return forward() }
export async function POST(request: Request) { return forward(request) }
