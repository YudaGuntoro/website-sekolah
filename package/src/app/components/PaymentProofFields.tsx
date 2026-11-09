import { registrationControlClass } from './RegistrationControls'

export function paymentProofError(form: FormData): string | null {
  if (!String(form.get('transferAccountName') || '').trim()) return 'Isi nama pemilik rekening pengirim.'
  const file = form.get('paymentProof')
  if (!(file instanceof File) || !file.size) return 'Unggah bukti transfer sebelum mengirim pendaftaran.'
  if (file.size > 1024 * 1024 || !/\.(jpe?g|png|pdf)$/i.test(file.name)) return 'Bukti transfer harus berupa JPG, PNG, atau PDF maksimal 1 MB.'
  return null
}

export default function PaymentProofFields({ contactRole = 'orang tua' }: { contactRole?: 'orang tua' | 'guru pendamping' }) {
  return <div className='space-y-5'>
    <p className='rounded-r-md border-l-2 border-amber-300 bg-[#fffcf3] px-4 py-3 text-sm leading-6 text-amber-900'>Isi nama pemilik rekening pengirim dan unggah bukti transfer untuk memudahkan staf kami mencocokkan serta memeriksa pembayaran Anda.</p>
    <label className='block text-sm font-semibold text-school-navy'>Nama pemilik rekening pengirim *<input name='transferAccountName' required maxLength={150} className={registrationControlClass} placeholder='Nama sesuai rekening yang digunakan untuk transfer' /><span className='mt-2 block text-xs font-normal leading-5 text-slate-500'>Nama ini dapat berbeda dari nama peserta atau {contactRole}. Isi sesuai nama yang tercantum pada bukti transfer.</span></label>
    <label className='block text-sm font-semibold text-school-navy'>Upload bukti transfer *<input name='paymentProof' type='file' required accept='.jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf' className='mt-2 block w-full rounded-md border border-slate-300 text-sm font-normal text-slate-600 file:mr-3 file:border-0 file:border-r file:border-slate-300 file:bg-slate-50 file:px-4 file:py-3 file:text-sm file:font-medium file:text-school-navy' /><span className='mt-2 block text-xs font-normal leading-5 text-slate-500'>JPG, PNG, atau PDF maksimal 1 MB. Pastikan nama pengirim, nominal, dan tanggal transfer terlihat jelas.</span></label>
    <p className='text-xs leading-6 text-slate-500'>Gambar akan dioptimalkan otomatis untuk menghemat penyimpanan. Pastikan tulisannya jelas. Bukti transfer tetap diperiksa oleh staf dan tidak langsung mengonfirmasi pembayaran.</p>
  </div>
}
