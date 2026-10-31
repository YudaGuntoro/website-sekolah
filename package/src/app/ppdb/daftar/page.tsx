import PpdbRegistrationForm from '@/app/components/PpdbRegistrationForm'

export default function PpdbRegistrationPage() {
  return (
    <main className='bg-[#f3f8fd] px-5 pb-14 sm:px-8 sm:pb-16'>
      <section className='relative -mx-5 overflow-hidden border-b border-sky-100 bg-[#f7f9fc] px-5 pb-10 pt-12 sm:-mx-8 sm:px-8 sm:pb-12 sm:pt-14' style={{ backgroundImage: 'linear-gradient(rgba(30,101,168,.045) 1px, transparent 1px), linear-gradient(90deg, rgba(30,101,168,.045) 1px, transparent 1px), radial-gradient(ellipse at 90% 10%, rgba(125,211,252,.22), transparent 42%)', backgroundSize: '38px 38px, 38px 38px, auto' }}>
        <div className='mx-auto grid max-w-7xl items-end gap-7 lg:grid-cols-[1.1fr_.9fr] lg:gap-12'>
          <div>
            <p className='mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-school-blue'>Penerimaan peserta didik baru</p>
            <h1 className='max-w-2xl text-4xl font-black leading-[1.05] tracking-tight text-school-navy sm:text-5xl lg:text-6xl'>Formulir <span className='text-school-blue'>pendaftaran.</span></h1>
          </div>
          <p className='max-w-xl border-l-2 border-sky-300 pl-5 text-base leading-7 text-slate-600 lg:mb-1'>Isi data calon siswa dan orang tua atau wali untuk memulai proses pendaftaran. Setelah dikirim, aplikasi email akan terbuka untuk menghubungi sekretariat sekolah.</p>
        </div>
      </section>
      <div className='mx-auto mt-8 max-w-5xl'><PpdbRegistrationForm /></div>
    </main>
  )
}
