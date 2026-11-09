'use client'
import PaymentProofFields from './PaymentProofFields'
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
    <section aria-label='Jadwal gelombang pendaftaran' className='overflow-hidden rounded-md border border-slate-200 border-t-[3px] border-t-school-blue bg-white p-0'>
      <div className='flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-slate-200 px-5 py-4 sm:px-6'>
        <div><p className='text-xs text-slate-500'>Jadwal pendaftaran</p><h2 className='mt-1 text-lg font-semibold text-school-navy'>{schedule ? `Tahun ajaran ${schedule.academicYear}` : 'SPMB Cendekia'}</h2></div>
        <span role='status' className={`text-xs font-medium ${open ? 'text-school-blue' : scheduleError ? 'text-rose-700' : 'text-slate-500'}`}>{open ? `Gelombang ${schedule!.activeWave} dibuka` : scheduleError ? 'Jadwal belum tersedia' : schedule ? 'Pendaftaran ditutup' : 'Memuat jadwal...'}</span>
      </div>
      <div className='p-4 sm:p-6'>
        {scheduleError && <p role='alert' className='text-sm leading-6 text-rose-700'>{scheduleError} <button type='button' className='font-medium underline' onClick={onReload}>Coba lagi</button></p>}
        {schedule && <>
          <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>{schedule.waves.map(wave => {
            const active = open && wave.isOpen
            const configured = !!wave.startDate && !!wave.endDate
            const state = active ? 'Sedang dibuka' : !configured ? 'Belum dijadwalkan' : schedule.today > wave.endDate! ? 'Selesai' : !schedule.enabled ? 'Belum dibuka' : schedule.today < wave.startDate! ? 'Akan dibuka' : 'Ditutup'
            return <article key={wave.number} aria-current={active ? 'step' : undefined} className={`flex min-w-0 flex-col rounded-md border p-4 ${active ? 'border-school-blue bg-[#f7faff]' : 'border-slate-200 bg-white'}`}>
              <h3 className='text-sm font-semibold text-school-navy'>Gelombang {wave.number}</h3>
              {configured ? <dl className='mb-4 mt-4 space-y-2 text-[13px]'>
                <div className='flex flex-wrap justify-between gap-x-2 gap-y-1'><dt className='text-slate-500'>Mulai</dt><dd className='text-school-navy'><time dateTime={wave.startDate!}>{date(wave.startDate!)}</time></dd></div>
                <div className='flex flex-wrap justify-between gap-x-2 gap-y-1'><dt className='text-slate-500'>Selesai</dt><dd className='text-school-navy'><time dateTime={wave.endDate!}>{date(wave.endDate!)}</time></dd></div>
              </dl> : <p className='mb-4 mt-4 text-[13px] leading-6 text-slate-500'>Tanggal akan diumumkan.</p>}
              <p className={`mt-auto text-xs ${active ? 'font-semibold text-school-blue' : 'text-slate-500'}`}>{state}</p>
            </article>
          })}</div>
          <p className='mt-4 flex items-start gap-2.5 rounded-r-md border-l-2 border-amber-300 bg-[#fffcf3] px-4 py-3 text-xs leading-5 text-amber-900'><svg viewBox='0 0 20 20' className='mt-0.5 h-4 w-4 shrink-0' fill='none' stroke='currentColor' strokeWidth='1.5' aria-hidden='true'><circle cx='10' cy='10' r='7.5' /><path d='M10 5.5V10l3 2' strokeLinecap='round' strokeLinejoin='round' /></svg><span>Tanggal mengikuti WIB. Pendaftaran berakhir pukul 23.59 pada tanggal selesai.</span></p>
        </>}
        {schedule && !open && <p className='mt-3 flex items-start gap-2.5 rounded-r-md border-l-2 border-red-300 bg-[#fff7f7] px-4 py-3 text-[13px] leading-6 text-red-800'><svg viewBox='0 0 20 20' className='mt-1 h-4 w-4 shrink-0' fill='none' stroke='currentColor' strokeWidth='1.5' aria-hidden='true'><circle cx='10' cy='10' r='7.5' /><path d='M10 9v5' strokeLinecap='round' /><circle cx='10' cy='6.5' r='.8' fill='currentColor' stroke='none' /></svg><span>Pendaftaran sedang ditutup. Anda tetap dapat melihat formulir dan menyiapkan data terlebih dahulu.</span></p>}
      </div>
    </section>
    <div>

      <form onSubmit={onSubmit} className='min-w-0 overflow-hidden rounded-md border border-slate-200 border-t-[3px] border-t-school-blue bg-white'>
        <div className='flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-5 sm:px-8'><div><h2 className='text-xl font-semibold text-school-navy'>Data pendaftaran</h2><p className='mt-1 text-sm text-slate-500'>Kolom bertanda <span className='text-red-600'>*</span> wajib diisi.</p></div><span className={`text-sm ${open ? 'text-emerald-700' : 'text-slate-500'}`}>{open ? `Gelombang ${schedule!.activeWave}` : 'Formulir belum dibuka'}</span></div>
        <fieldset disabled={!open || submitting} className='min-w-0'>
          <section id='data-siswa' className='scroll-mt-24 p-5 sm:p-8'><SectionHeading number='A' title='Identitas calon murid' /><div className='grid gap-5 sm:grid-cols-2'>
            <label className={`${label} sm:col-span-2`}>Email *<input className={input} name='guardianEmail' type='email' maxLength={254} autoComplete='email' required placeholder='Email aktif untuk pendaftaran' /></label>
            <label className={label}>Nama lengkap *<input className={input} name='studentName' maxLength={150} autoComplete='name' required placeholder='Nama lengkap sesuai dokumen' /></label>
            <label className={label}>Nama panggilan *<input className={input} name='nickname' maxLength={100} required /></label>
            <label className={label}>Tempat lahir *<input className={input} name='birthPlace' maxLength={100} required placeholder='Kota / kabupaten kelahiran' /></label>
            <label className={label}>Tanggal lahir *<RegistrationDatePicker maxDate={schedule?.today} disabled={!open || submitting} /></label>
            <label className={label}>Jenis kelamin *<RegistrationSelect name='gender' required defaultValue=''><option value='' disabled>Pilih jenis kelamin</option><option>Laki-laki</option><option>Perempuan</option></RegistrationSelect></label>
            <label className={label}>Agama *<RegistrationSelect name='religion' required defaultValue=''><option value='' disabled>Pilih agama</option><option>Islam</option></RegistrationSelect></label>
            <label className={label}>NISN *<input className={input} name='nisn' required inputMode='numeric' pattern='[0-9]{10}' maxLength={10} placeholder='10 digit NISN' title='NISN harus terdiri dari 10 digit angka' /></label>
          </div></section>
          <section id='data-sekolah' className='scroll-mt-24 border-t border-slate-100 p-5 sm:p-8'><SectionHeading number='B' title='Sekolah dan alamat murid' /><div className='grid gap-5 sm:grid-cols-2'>
            <label className={`${label} sm:col-span-2`}>Asal sekolah *<input className={input} name='previousSchool' maxLength={150} required placeholder='Nama sekolah sebelumnya' /></label>
            <fieldset className='min-w-0 sm:col-span-2'><legend className={label}>Masuk sekolah sebagai *</legend><div className='mt-3 flex flex-wrap gap-x-8 gap-y-3 text-sm text-school-navy'><label className='flex items-center gap-2'><input type='radio' name='entryType' value='Baru' required checked={grade === 'VII'} onChange={() => onGradeChange('VII')} className='accent-blue-700' />Murid baru kelas VII</label><label className='flex items-center gap-2'><input type='radio' name='entryType' value='Pindahan' required checked={grade === 'VIII' || grade === 'IX'} onChange={() => onGradeChange('VIII')} className='accent-blue-700' />Pindahan</label></div></fieldset>
            <label className={label}>Kelas yang dituju *<RegistrationSelect name='targetGrade' required value={grade} onChange={e => onGradeChange(e.target.value)}><option value='' disabled>Pilih kelas</option><option value='VII'>Kelas VII (murid baru)</option><option value='VIII'>Kelas VIII (pindahan)</option><option value='IX'>Kelas IX (pindahan)</option></RegistrationSelect></label>
            <label className={`${label} sm:col-span-2`}>Alamat murid *<textarea className={`${input} min-h-28 resize-y`} name='address' maxLength={1000} required placeholder='Alamat domisili calon murid' /></label>
          </div></section>
          <section className='border-t border-slate-100 p-5 sm:p-8'><SectionHeading number='C' title='Data kesehatan' /><div className='grid gap-5 sm:grid-cols-2'>
            <label className={`${label} sm:col-span-2`}>Riwayat penyakit<textarea className={input} name='medicalHistory' maxLength={1000} rows={3} placeholder='Opsional. Isi jika ada riwayat penyakit yang perlu diketahui sekolah.' /></label>
            <label className={label}>Tinggi badan (cm) *<input className={input} name='heightCm' type='number' min={20} max={300} step='0.1' required placeholder='Contoh: 145' /></label>
            <label className={label}>Berat badan (kg) *<input className={input} name='weightKg' type='number' min={1} max={500} step='0.1' required placeholder='Contoh: 38.5' /></label>
            <label className={label}>Golongan darah *<RegistrationSelect name='bloodGroup' required defaultValue=''><option value='' disabled>Pilih golongan darah</option>{['A', 'B', 'AB', 'O'].map(value => <option key={value}>{value}</option>)}</RegistrationSelect></label>
          </div></section>
          <section id='data-wali' className='scroll-mt-24 border-t border-slate-100 p-5 sm:p-8'><SectionHeading number='D' title='Data ayah, ibu, dan wali' /><div className='grid gap-5 sm:grid-cols-2'>
            <label className={label}>No. HP ayah/ibu *<input className={input} name='parentPhone' type='tel' required pattern='[+]?[0-9]{8,15}' maxLength={16} placeholder='08xxxxxxxxxx' /></label>
            <label className={label}>No. telepon / HP (WhatsApp) *<input className={input} name='guardianPhone' type='tel' required pattern='[+]?[0-9]{8,15}' maxLength={16} placeholder='Nomor aktif yang dapat dihubungi' /></label>
            <label className={label}>Nama ayah *<input className={input} name='fatherName' maxLength={150} required /></label>
            <label className={label}>Pekerjaan ayah *<input className={input} name='fatherOccupation' maxLength={150} required /></label>
            <label className={label}>Nama ibu *<input className={input} name='motherName' maxLength={150} required /></label>
            <label className={label}>Pekerjaan ibu *<input className={input} name='motherOccupation' maxLength={150} required /></label>
            <label className={label}>Nama wali<input className={input} name='guardianName' maxLength={150} placeholder='Kosongkan jika tidak ada wali' /></label>
            <label className={label}>Pekerjaan wali<input className={input} name='guardianOccupation' maxLength={150} placeholder='Kosongkan jika tidak ada wali' /></label>
            <label className={`${label} sm:col-span-2`}>Alamat orang tua/wali *<textarea className={`${input} min-h-28 resize-y`} name='parentAddress' maxLength={1000} required /></label>
            <label className={label}>Keadaan ekonomi *<RegistrationSelect name='economicCondition' required defaultValue=''><option value='' disabled>Pilih keadaan ekonomi</option>{['Baik', 'Kurang Baik', 'Sangat Baik', 'Tidak Stabil'].map(value => <option key={value}>{value}</option>)}</RegistrationSelect></label>
            <label className={label}>Bahasa sehari-hari<input className={input} name='dailyLanguage' maxLength={100} placeholder='Opsional' /></label>
          </div></section>
          <section className='border-t border-slate-100 p-5 sm:p-8'><SectionHeading number='E' title='Berkas persyaratan' />
            <p className='mb-5 text-sm leading-6 text-slate-600'>Gabungkan dokumen persyaratan pendaftaran dalam satu PDF. <a href='/spmb' target='_blank' rel='noopener noreferrer' className='font-medium text-school-blue underline underline-offset-4'>Lihat daftar persyaratan</a>.</p>
            <label className={label}>Upload PDF persyaratan *<input name='document' type='file' required accept='.pdf,application/pdf' className='mt-2 block w-full rounded-md border border-slate-300 text-sm font-normal text-slate-600 file:mr-3 file:border-0 file:border-r file:border-slate-300 file:bg-slate-50 file:px-4 file:py-3 file:text-sm file:font-medium file:text-school-navy' /><span className='mt-2 block text-xs font-normal leading-5 text-slate-500'>Satu PDF maksimal 1 MB. Pastikan seluruh halaman lengkap dan terbaca. Berkas dikompres otomatis untuk penyimpanan tanpa menurunkan kualitas dokumen.</span></label>
          </section>
          <section className='border-t border-slate-100 p-5 sm:p-8'><SectionHeading number='F' title='Konfirmasi pembayaran' /><PaymentProofFields /><a href='/spmb' target='_blank' rel='noopener noreferrer' className='mt-4 inline-block text-sm font-medium text-school-blue underline underline-offset-4'>Lihat informasi biaya dan rekening sekolah</a></section>
          <div className='border-t border-slate-200 p-5 sm:p-8'><label className='flex items-start gap-3 text-sm leading-7 text-slate-600'><input type='checkbox' name='consent' required className='mt-1.5 h-4 w-4 shrink-0 accent-blue-700' /><span>Saya memastikan data yang diisi benar dan bersedia dihubungi sekolah untuk proses pendaftaran.</span></label><div className='mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'><p className='text-xs leading-6 text-slate-500'>Periksa kembali data<br className='hidden sm:block' /> sebelum mengirim pendaftaran.</p><button disabled={submitting || !open} type='submit' className='inline-flex min-h-11 items-center justify-center rounded-md bg-school-blue px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-school-navy disabled:cursor-not-allowed disabled:opacity-50'>{submitting ? 'Mengirim…' : 'Kirim pendaftaran'}</button></div></div>
        </fieldset>
        {error && <p role='alert' className='m-5 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-800 sm:m-7'>{error}</p>}
        <div className='border-t border-slate-100 px-5 py-4 sm:px-7'><a href='/spmb' className='inline-flex text-xs font-semibold text-school-blue hover:underline'>← Kembali ke informasi SPMB</a></div>
      </form>
    </div>
  </div>
}
