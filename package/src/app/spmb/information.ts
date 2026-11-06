import 'server-only'
import { cache } from 'react'
import defaults from './default-information.json'

export type SpmbInformation = typeof defaults
async function read<T>(path: string): Promise<T> {
  const response = await fetch(`${process.env.SCHOOL_API_URL!.replace(/\/$/, '')}${path}`, { cache: 'no-store', signal: AbortSignal.timeout(5000) })
  if (!response.ok) throw new Error('Informasi SPMB belum dapat dimuat.')
  const payload = await response.json()
  if (!payload.success || !payload.data) throw new Error('Informasi SPMB tidak valid.')
  return payload.data as T
}
export const getSpmbAcademicYear = cache(async () => {
  if (!process.env.SCHOOL_API_URL) return '2027/2028'
  return (await read<{ academicYear: string }>('/api/spmb/schedule')).academicYear
})
export const getSpmbInformation = cache(async () => {
  const [config, academicYear] = await Promise.all([
    process.env.SCHOOL_API_URL ? read<SpmbInformation>('/api/school/spmb-information') : Promise.resolve(defaults),
    getSpmbAcademicYear(),
  ])
  return { config, academicYear }
})
