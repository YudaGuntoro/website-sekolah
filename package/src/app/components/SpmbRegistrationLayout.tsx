'use client'
import SpmbRegistrationReceipt from './SpmbRegistrationReceipt'
import type { FormEvent } from 'react'
import type { Schedule, Receipt } from './SpmbRegistrationForm'
import { registrationControlClass, RegistrationDatePicker, RegistrationSelect } from './RegistrationControls'

type Props = {
  schedule: Schedule | null; scheduleError: string; error: string; submitting: boolean;
  receipt: Receipt | null; grade: string; onGradeChange: (grade: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void; onReload: () => void; onReset: () => void;
}
const input = `${registrationControlClass} text-gray-800`
const label = 'block text-sm font-semibold text-school-navy'
function SectionHeading({ number, title }: { number: string; title: string }) {
  return <div className='mb-6 flex items-baseline gap-3 border-b border-slate-200 pb-3'><span className='text-base font-semibold text-school-blue'>{number}.</span><h2 className='text-lg font-semibold text-school-navy'>{title}</h2></div>
}
const date = (value: string) => new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(new Date(value + 'T00:00:00+07:00'))

export default function SpmbRegistrationLayout({ schedule, scheduleError, error, submitting, receipt, grade, onGradeChange, onSubmit, onReload, onReset }: Props) {
  const open = !!schedule?.enabled && !!schedule.activeWave
  if (receipt) return <SpmbRegistrationReceipt receipt={receipt} onReset={onReset} />
  return <div className='space-y-7 sm:space-y-9'>
    <section aria-label='Jadwal gelombang pendaftaran' className='overflow-hidden rounded-lg border border-slate-200 bg-white p-0 shadow-[0_1px_3px_rgba(16,45,78,.04)]'>
      <div className='flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-[#fbfcfe] px-5 py-5 sm:px-8'>
        <div><p className='text-[13px] font-medium text-school-blue'>Jadwal pendaftaran</p><h2 className='mt-1.5 text-[22px] font-semibold tracking-tight text-school-navy'>{schedule ? `Tahun ajaran ${schedule.academicYear}` : 'SPMB Cendekia'}</h2></div>
        <span role='status' className={`text-[13px] font-medium ${open ? 'text-emerald-700' : scheduleError ? 'text-rose-700' : 'text-amber-800'}`}>{open ? `Gelombang ${schedule!.activeWave} dibuka` : scheduleError ? 'Jadwal belum tersedia' : schedule ? 'Pendaftaran ditutup' : 'Memuat jadwal...'}</span>
      </div>
      <div className='p-5 sm:p-8'>
        {scheduleError && <div role='alert' className='rounded-xl bg-rose-50 p-4 text-sm leading-6 text-rose-700'>{scheduleError} <button type='button' className='font-semibold underline' onClick={onReload}>Coba lagi</button></div>}
        {schedule && <><div className='grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4'>{schedule.waves.map(wave => {
          const active = open && wave.isOpen
          const state = active ? 'Sedang dibuka' : !wave.startDate || !wave.endDate ? 'Belum dijadwalkan' : schedule.today > wave.endDate ? 'Selesai' : !schedule.enabled ? 'Belum dibuka' : schedule.today < wave.startDate ? 'Akan dibuka' : 'Ditutup'
          return <div key={wave.number} className={`border-l-2 px-4 py-1.5 ${active ? 'border-school-blue bg-sky-50/60' : 'border-slate-200'}`}><h3 className='text-[15px] font-semibold text-school-navy'>Gelombang {wave.number}</h3><p className='mt-2 min-h-10 text-[13px] leading-6 text-slate-500'>{wave.startDate ? date(wave.startDate) : 'Tanggal belum ditentukan'}{wave.endDate && <><br />s.d. {date(wave.endDate)}</>}</p><p className={`mt-2 text-xs ${active ? 'font-semibold text-school-blue' : 'text-slate-500'}`}>{state}</p></div>
        })}</div><p className='mt-6 border-t border-slate-100 pt-4 text-xs leading-6 text-slate-500'><span>Jadwal menggunakan WIB, hingga pukul 23.59 pada tanggal selesai. Gelombang pendaftaran mengikuti jadwal yang sedang dibuka.</span></p></>}
        {schedule && !open && <div className='mt-4 rounded-r-md border-l-2 border-amber-300 bg-[#fffcf3] px-4 py-3 text-[13px] leading-6 text-amber-900'><p>Pendaftaran belum dibuka atau berada di luar jadwal aktif. Anda tetap dapat melihat formulir dan menyiapkan data terlebih dahulu.</p></div>}
      </div>
    </section>
    <div>

      <form onSubmit={onSubmit} className='min-w-0 overflow-hidden rounded-md border border-slate-200 border-t-[3px] border-t-school-blue bg-white'>
        <div className='flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-8'><div><h2 className='text-xl font-semibold text-school-navy'>Data pendaftaran</h2><p className='mt-1 text-sm text-slate-500'>Kolom bertanda <span className='text-red-600'>*</span> wajib diisi.</p></div><span className={`text-sm ${open ? 'text-emerald-700' : 'text-slate-500'}`}>{open ? `Gelombang ${schedule!.activeWave}` : 'Formulir belum dibuka'}</span></div>
        <fieldset disabled={!open || submitting} className='min-w-0'>
          <section id='data-siswa' className='scroll-mt-24 p-5 sm:p-8'><SectionHeading number='A' title='Identitas calon siswa' /><div className='grid gap-5 sm:grid-cols-2'>
            <label className={`${label} sm:col-span-2`}>Nama lengkap calon siswa *<input className={input} name='studentName' maxLength={150} autoComplete='name' required placeholder='Nama lengkap sesuai dokumen' /></label>
            <label className={label}>Tempat lahir *<input className={input} name='birthPlace' maxLength={100} required placeholder='Kota / kabupaten kelahiran' /></label>
            <label className={label}>Tanggal lahir *<RegistrationDatePicker maxDate={schedule?.today} disabled={!open || submitting} /></label>
            <label className={label}>Jenis kelamin *<RegistrationSelect name='gender' required defaultValue=''><option value='' disabled>Pilih jenis kelamin</option><option>Laki-laki</option><option>Perempuan</option></RegistrationSelect></label>
            <label className={label}>NISN {grade && grade !== 'VII' ? '*' : ''}<input className={input} name='nisn' required={!!grade && grade !== 'VII'} inputMode='numeric' pattern='[0-9]{10}' maxLength={10} placeholder='10 digit NISN' title='NISN harus terdiri dari 10 digit angka' /><span className='mt-2 block text-xs font-normal leading-5 text-slate-500'>{grade && grade !== 'VII' ? 'Wajib diisi untuk murid pindahan.' : 'Opsional untuk calon siswa baru kelas VII.'}</span></label>
          </div></section>
          <section id='data-sekolah' className='scroll-mt-24 border-t border-slate-100 p-5 sm:p-8'><SectionHeading number='B' title='Data sekolah' /><div className='grid gap-5 sm:grid-cols-2'>
            <label className={label}>Asal sekolah *<input className={input} name='previousSchool' maxLength={150} required placeholder='Nama sekolah sebelumnya' /></label>
            <label className={label}>Kelas yang dituju *<RegistrationSelect name='targetGrade' required value={grade} onChange={e => onGradeChange(e.target.value)}><option value='' disabled>Pilih kelas</option><option value='VII'>Kelas VII (siswa baru)</option><option value='VIII'>Kelas VIII (pindahan)</option><option value='IX'>Kelas IX (pindahan)</option></RegistrationSelect></label>
          </div></section>
          <section id='data-wali' className='scroll-mt-24 border-t border-slate-100 p-5 sm:p-8'><SectionHeading number='C' title='Data orang tua / wali' /><div className='grid gap-5 sm:grid-cols-2'>
            <label className={`${label} sm:col-span-2`}>Nama orang tua / wali *<input className={input} name='guardianName' maxLength={150} required placeholder='Nama lengkap orang tua atau wali' /></label>
            <label className={label}>WhatsApp orang tua / wali *<input className={input} name='guardianPhone' type='tel' autoComplete='tel' required pattern='[+]?[0-9]{8,15}' maxLength={16} title='Gunakan 8 sampai 15 digit angka, tanpa spasi. Awalan + diperbolehkan.' placeholder='08xxxxxxxxxx' /></label>
            <label className={label}>Email orang tua / wali<input className={input} name='guardianEmail' type='email' maxLength={254} autoComplete='email' placeholder='nama@email.com (opsional)' /></label>
            <label className={`${label} sm:col-span-2`}>Alamat lengkap *<textarea className={`${input} min-h-28 resize-y`} name='address' maxLength={1000} required placeholder='Alamat domisili calon siswa' /></label>
          </div></section>
          <div className='border-t border-slate-200 p-5 sm:p-8'><label className='flex items-start gap-3 text-sm leading-7 text-slate-600'><input type='checkbox' name='consent' required className='mt-1.5 h-4 w-4 shrink-0 accent-blue-700' /><span>Saya memastikan data yang diisi benar dan bersedia dihubungi sekolah untuk proses pendaftaran.</span></label><div className='mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'><p className='text-xs leading-6 text-slate-500'>Periksa kembali data<br className='hidden sm:block' /> sebelum mengirim pendaftaran.</p><button disabled={submitting || !open} type='submit' className='inline-flex min-h-11 items-center justify-center rounded-md bg-school-blue px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-school-navy disabled:cursor-not-allowed disabled:opacity-50'>{submitting ? 'Mengirim…' : 'Kirim pendaftaran'}</button></div></div>
        </fieldset>
        {error && <p role='alert' className='m-5 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-800 sm:m-7'>{error}</p>}
        <div className='border-t border-slate-100 px-5 py-4 sm:px-7'><a href='/spmb' className='inline-flex text-xs font-semibold text-school-blue hover:underline'>← Kembali ke informasi SPMB</a></div>
      </form>
    </div>
  </div>
}
