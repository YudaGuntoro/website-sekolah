'use client'
import { paymentProofError } from './PaymentProofFields'
import SpmbRegistrationLayout from './SpmbRegistrationLayout'
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'

export type Wave = { number: number; startDate: string | null; endDate: string | null; isOpen: boolean }
export type Schedule = { academicYear: string; today: string; version: number; enabled: boolean; activeWave: number | null; waves: Wave[] }
export type ApplicantProfile = {
  nickname: string; religion: string; medicalHistory: string; heightCm: number; weightKg: number; bloodGroup: string;
  parentPhone: string; fatherName: string; motherName: string; fatherOccupation: string; motherOccupation: string; guardianOccupation: string; parentAddress: string; economicCondition: string; dailyLanguage: string;
}
export type Receipt = {
  profile: ApplicantProfile | null;
  registrationNumber: string; academicYear: string; waveNumber: number; submittedAt: string; whatsappGroupUrl: string;
  transferAccountName: string | null; hasPaymentProof: boolean; hasDocument: boolean;
  studentName: string; nisn: string | null; birthPlace: string; birthDate: string; gender: string;
  previousSchool: string; targetGrade: string; guardianName: string; guardianPhone: string;
  guardianEmail: string | null; address: string;
}
function errorMessage(payload: { message?: string; errors?: Record<string, string[]> }) {
  return payload.message || Object.values(payload.errors || {}).flat()[0] || 'Data belum dapat disimpan. Periksa kembali formulir.'
}

export default function SpmbRegistrationForm() {
  const [schedule, setSchedule] = useState<Schedule | null>(null)
  const [scheduleError, setScheduleError] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [grade, setGrade] = useState('')
  const submissionKey = useRef('')
  const loadSchedule = useCallback(async () => {
    try {
      const response = await fetch('/api/spmb', { cache: 'no-store' })
      const payload = await response.json()
      if (!response.ok || !payload.success) throw new Error(errorMessage(payload))
      setSchedule(payload.data); setScheduleError('')
    } catch (e) { setSchedule(null); setScheduleError(e instanceof Error ? e.message : 'Jadwal belum dapat dimuat.') }
  }, [])
  useEffect(() => { void loadSchedule(); const timer = setInterval(() => void loadSchedule(), 60000); return () => clearInterval(timer); }, [loadSchedule])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (submitting || !schedule?.activeWave) return
    const form = new FormData(event.currentTarget)
    const document = form.get('document')
    if (!(document instanceof File) || !document.size) { setError('Unggah PDF persyaratan sebelum mengirim pendaftaran.'); return }
    if (document.size > 1024 * 1024 || !/\.pdf$/i.test(document.name)) { setError('Berkas persyaratan harus berupa PDF maksimal 1 MB.'); return }
    const proofError = paymentProofError(form)
    if (proofError) { setError(proofError); return }
    const value = (key: string) => String(form.get(key) || '').trim()
    submissionKey.current ||= crypto.randomUUID()
    const payload = {
      nickname: value('nickname'), religion: value('religion'), medicalHistory: value('medicalHistory'), heightCm: Number(value('heightCm')), weightKg: Number(value('weightKg')), bloodGroup: value('bloodGroup'),
      parentPhone: value('parentPhone'), fatherName: value('fatherName'), motherName: value('motherName'), fatherOccupation: value('fatherOccupation'), motherOccupation: value('motherOccupation'), guardianOccupation: value('guardianOccupation'), parentAddress: value('parentAddress'), economicCondition: value('economicCondition'), dailyLanguage: value('dailyLanguage'), entryType: value('entryType'),
      submissionKey: submissionKey.current, scheduleVersion: schedule.version,
      studentName: value('studentName'), nisn: value('nisn') || null,
      birthPlace: value('birthPlace'), birthDate: value('birthDate'), gender: value('gender'),
      previousSchool: value('previousSchool'), targetGrade: grade, guardianName: value('guardianName'),
      guardianPhone: value('guardianPhone'), guardianEmail: value('guardianEmail') || null,
      address: value('address'), transferAccountName: value('transferAccountName'), consent: form.get('consent') === 'on',
    }
    setSubmitting(true); setError('')
    try {
      for (const [field, value] of Object.entries(payload)) { if (value === null) form.delete(field); else form.set(field, String(value)) }
      const response = await fetch('/api/spmb', { method: 'POST', body: form })
      const result = await response.json()
      if (!response.ok || !result.success) throw new Error(errorMessage(result))
      setReceipt(result.data)
    } catch (e) { setError(e instanceof Error ? e.message : 'Pengiriman gagal. Coba kembali dari formulir ini.'); await loadSchedule() }
    finally { setSubmitting(false) }
  }

  return <SpmbRegistrationLayout schedule={schedule} scheduleError={scheduleError} error={error} submitting={submitting} receipt={receipt} grade={grade} onGradeChange={setGrade} onSubmit={submit} onReload={() => void loadSchedule()} onReset={() => { setReceipt(null); submissionKey.current = ''; setGrade(''); void loadSchedule() }} />
}
