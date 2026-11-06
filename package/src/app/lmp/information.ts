import { schoolApiHeaders } from '../school-api-headers'
import 'server-only'
import defaults from './default-information.json'
import type { LmpInformation } from './types'
export async function getLmpInformation(): Promise<LmpInformation> {
  if (!process.env.SCHOOL_API_URL) return { config: defaults, version: 0, isOpen: false, today: '' }
  const response = await fetch(`${process.env.SCHOOL_API_URL.replace(/\/$/, '')}/api/lmp/information`, { headers: schoolApiHeaders(), cache: 'no-store', signal: AbortSignal.timeout(5000) })
  if (!response.ok) throw new Error('Informasi LMP belum dapat dimuat.')
  const payload = await response.json()
  if (!payload.success || !payload.data) throw new Error('Informasi LMP belum tersedia.')
  return payload.data
}
