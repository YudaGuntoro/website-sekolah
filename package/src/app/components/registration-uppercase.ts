import type { SyntheticEvent } from 'react'

const uppercaseFields = new Set([
  'studentName', 'nickname', 'birthPlace', 'previousSchool', 'guardianName', 'contactName',
  'fatherName', 'motherName', 'fatherOccupation', 'motherOccupation', 'guardianOccupation',
  'address', 'parentAddress', 'medicalHistory', 'dailyLanguage', 'transferAccountName',
])

export function uppercaseRegistrationInput(event: SyntheticEvent<HTMLFormElement>) {
  const input = event.target
  if (!(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) || !uppercaseFields.has(input.name)) return
  if ((event.nativeEvent as InputEvent).isComposing) return
  const original = input.value
  const uppercase = original.toLocaleUpperCase('id-ID')
  if (original === uppercase) return
  const start = input.selectionStart, end = input.selectionEnd, direction = input.selectionDirection
  input.value = uppercase
  if (start !== null && end !== null) input.setSelectionRange(original.slice(0, start).toLocaleUpperCase('id-ID').length, original.slice(0, end).toLocaleUpperCase('id-ID').length, direction || 'none')
}
