import { isIP } from 'node:net'

export function schoolApiHeaders(request?: Request): Record<string, string> {
  const headers: Record<string, string> = {}
  if (process.env.NODE_ENV === 'production') headers['X-Forwarded-Proto'] = 'https'
  // Enable only behind an edge proxy that overwrites X-Real-IP and blocks direct access.
  const address = request?.headers.get('x-real-ip') || ''
  if (process.env.TRUST_PROXY_HEADERS === 'true' && isIP(address)) headers['X-Forwarded-For'] = address
  return headers
}
