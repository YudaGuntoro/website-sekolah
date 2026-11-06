'use client'
import { useEffect, useRef, useState, type ChangeEvent, type ReactNode } from 'react'
import flatpickr from 'flatpickr'
import { Indonesian } from 'flatpickr/dist/l10n/id.js'
import type { Instance } from 'flatpickr/dist/types/instance'
import 'flatpickr/dist/flatpickr.css'
import './registration-controls.css'

// Same height, radius, border, shadow and focus treatment as the TailAdmin controls.
export const registrationControlClass = 'mt-2 block h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-base font-normal shadow-[0_1px_2px_0_rgba(16,24,40,.05)] outline-none transition-colors placeholder:text-gray-400 focus:border-blue-300 focus:ring-[3px] focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500 sm:text-sm'

type SelectProps = { name: string; children: ReactNode; required?: boolean; value?: string; defaultValue?: string; onChange?: (event: ChangeEvent<HTMLSelectElement>) => void }
export function RegistrationSelect({ name, children, required, value, defaultValue = '', onChange }: SelectProps) {
  const [local, setLocal] = useState(defaultValue)
  const selected = value ?? local
  return <span className='relative mt-2 block'>
    <select name={name} required={required} value={selected} onChange={event => { setLocal(event.target.value); onChange?.(event) }} className={`${registrationControlClass} !mt-0 pr-11 ${selected ? 'text-gray-800' : 'text-gray-400'}`}>{children}</select>
    <svg viewBox='0 0 20 20' className='pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'><path d='m5 7.5 5 5 5-5' /></svg>
  </span>
}

function strictDate(value: string, format: string) {
  const match = format === 'Y-m-d' ? /^(\d{4})-(\d{2})-(\d{2})$/.exec(value) : /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value)
  if (!match) return undefined
  const [year, month, day] = format === 'Y-m-d' ? [+match[1], +match[2], +match[3]] : [+match[3], +match[2], +match[1]]
  const date = new Date(year, month - 1, day)
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day ? date : undefined
}

export function RegistrationDatePicker({ maxDate, disabled }: { maxDate?: string; disabled: boolean }) {
  const element = useRef<HTMLInputElement>(null)
  const picker = useRef<Instance | null>(null)
  useEffect(() => {
    if (!element.current) return
    const instance = flatpickr(element.current, {
      locale: Indonesian, dateFormat: 'Y-m-d', altInput: true, altFormat: 'd/m/Y',
      altInputClass: `${registrationControlClass} !mt-0 pr-11 text-gray-800`,
      allowInput: true, disableMobile: true, monthSelectorType: 'static', maxDate: 'today',
      parseDate: (value, format) => strictDate(value, format) ?? new Date(NaN),
      onReady: (_dates, _value, control) => {
        control.calendarContainer.classList.add('spmb-date-calendar')
        control.calendarContainer.setAttribute('aria-label', 'Kalender tanggal lahir')
        if (control.altInput) {
          control.altInput.id = 'spmb-birth-date-display'
          control.altInput.setAttribute('aria-label', 'Tanggal lahir')
          control.altInput.placeholder = 'dd/mm/yyyy'
          control.altInput.required = true
          control.altInput.setAttribute('autocomplete', 'bday')
        }
      },
      onOpen: (_dates, _value, control) => { if (control.input.matches(':disabled')) control.close() },
      onChange: (_dates, _value, control) => control.altInput?.setCustomValidity(''),
    })
    picker.current = instance
    const validate = () => {
      const visible = instance.altInput
      if (!visible) return
      const raw = visible.value.trim()
      const parsed = raw ? strictDate(raw, 'd/m/Y') : undefined
      const valid = !raw || !!parsed && instance.isEnabled(parsed)
      visible.setCustomValidity(valid ? '' : 'Masukkan tanggal lahir yang valid dengan format dd/mm/yyyy.')
    }
    const clearError = () => instance.altInput?.setCustomValidity('')
    const closeOnResize = () => instance.close()
    instance.altInput?.addEventListener('blur', validate)
    instance.altInput?.addEventListener('input', clearError)
    window.addEventListener('resize', closeOnResize)
    return () => {
      instance.altInput?.removeEventListener('blur', validate)
      instance.altInput?.removeEventListener('input', clearError)
      window.removeEventListener('resize', closeOnResize)
      instance.destroy(); picker.current = null
    }
  }, [])
  useEffect(() => { picker.current?.set('maxDate', maxDate || 'today') }, [maxDate])
  useEffect(() => {
    const instance = picker.current
    if (instance?.altInput) instance.altInput.disabled = disabled
    if (disabled) instance?.close()
  }, [disabled])
  return <span className='relative mt-2 block'>
    <input ref={element} name='birthDate' id='spmb-birth-date' type='text' required disabled={disabled} placeholder='dd/mm/yyyy' className='hidden' />
    <svg viewBox='0 0 24 24' className='pointer-events-none absolute right-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500' fill='none' stroke='currentColor' strokeWidth='1.6' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'><rect x='3' y='5' width='18' height='16' rx='2' /><path d='M8 3v4M16 3v4M3 11h18' /></svg>
  </span>
}
