'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'

const inputClass = 'mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-school-navy outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100'

export default function PpdbRegistrationForm() {
  const [message, setMessage] = useState('')

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage('Pendaftaran berhasil disimulasikan. Data belum disimpan; formulir akan terhubung ke sistem sekolah setelah database siap.')
  }

  return (
    <form onSubmit={handleSubmit} className='rounded-3xl border border-sky-100 bg-white p-5 shadow-[0_18px_55px_-38px_rgba(16,45,78,.3)] sm:p-8'>
      <div className='grid gap-5 sm:grid-cols-2'>
        <label className='text-sm font-bold text-school-navy'>Nama lengkap calon siswa <span className='text-rose-500'>*</span><input className={inputClass} name='nama_siswa' autoComplete='name' required placeholder='Nama sesuai dokumen' /></label>
        <label className='text-sm font-bold text-school-navy'>NISN <span className='font-normal text-slate-400'>(wajib untuk murid pindahan)</span><input className={inputClass} name='nisn' inputMode='numeric' pattern='[0-9]{10}' maxLength={10} placeholder='Masukkan 10 digit NISN' title='NISN terdiri dari 10 digit angka' /></label>
        <label className='text-sm font-bold text-school-navy'>Tempat, tanggal lahir <span className='text-rose-500'>*</span><input className={inputClass} name='lahir' required placeholder='Contoh: Purwakarta, 10 Januari 2014' /></label>
        <label className='text-sm font-bold text-school-navy'>Jenis kelamin <span className='text-rose-500'>*</span><select className={inputClass} name='jenis_kelamin' required defaultValue=''><option value='' disabled>Pilih jenis kelamin</option><option>Laki-laki</option><option>Perempuan</option></select></label>
        <label className='text-sm font-bold text-school-navy'>Asal sekolah <span className='text-rose-500'>*</span><input className={inputClass} name='asal_sekolah' required placeholder='Nama sekolah sebelumnya' /></label>
        <label className='text-sm font-bold text-school-navy'>Kelas yang dituju <span className='text-rose-500'>*</span><select className={inputClass} name='kelas_tujuan' required defaultValue=''><option value='' disabled>Pilih kelas</option><option>Kelas VII (siswa baru)</option><option>Kelas VIII (pindahan)</option><option>Kelas IX (pindahan)</option></select></label>
        <label className='text-sm font-bold text-school-navy'>Nama orang tua atau wali <span className='text-rose-500'>*</span><input className={inputClass} name='nama_wali' required placeholder='Nama orang tua/wali' /></label>
        <label className='text-sm font-bold text-school-navy'>Nomor WhatsApp orang tua/wali <span className='text-rose-500'>*</span><input className={inputClass} name='telepon_wali' type='tel' autoComplete='tel' required placeholder='08xxxxxxxxxx' /></label>
        <label className='text-sm font-bold text-school-navy'>Email orang tua/wali<input className={inputClass} name='email_wali' type='email' autoComplete='email' placeholder='nama@email.com' /></label>
        <label className='text-sm font-bold text-school-navy sm:col-span-2'>Alamat lengkap <span className='text-rose-500'>*</span><textarea className={`${inputClass} min-h-28 resize-y`} name='alamat' required placeholder='Alamat domisili calon siswa' /></label>
      </div>
      <p className='mt-5 text-xs leading-5 text-slate-500'>Formulir ini masih berupa mockup. Data belum dikirim atau disimpan. Jadwal dan persyaratan lanjutan akan dikonfirmasi oleh pihak sekolah.</p>
      <div className='mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center'>
        <button type='submit' className='inline-flex items-center justify-center gap-2 rounded-full bg-school-blue px-6 py-3.5 font-bold text-white shadow-lg shadow-blue-900/15 transition hover:-translate-y-0.5 hover:bg-school-navy'>Submit Data <span aria-hidden='true'>&#8594;</span></button>
        <a href='/ppdb' className='rounded-full px-5 py-3 text-sm font-bold text-school-blue transition hover:bg-sky-50'>Kembali ke informasi SPMB</a>
      </div>
      {message && <p role='status' className='mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800'>{message}</p>}
    </form>
  )
}
