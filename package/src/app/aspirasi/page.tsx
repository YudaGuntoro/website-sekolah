import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Kontak SMPIT Cendekia',
  description: 'Informasi kontak SMPIT Cendekia Purwakarta.',
}

export default function ContactPage() {
  return (
    <main className='min-h-[70vh] bg-[#f3f8fd] px-5 py-16 sm:px-8'>
      <section className='mx-auto max-w-3xl rounded-2xl border border-sky-100 bg-white p-7 sm:p-10'>
        <p className='text-xs font-extrabold uppercase tracking-[.18em] text-school-blue'>SMPIT Cendekia Purwakarta</p>
        <h1 className='mt-4 text-3xl font-black text-school-navy'>Kontak</h1>
        <address className='mt-6 space-y-3 text-sm not-italic leading-6 text-slate-600'>
          <p>Jl. Veteran No. 100 B, Nagri Kaler (Belakang Poll Damri), Purwakarta.</p>
          <p><a className='text-school-blue' href='tel:+6287896397106'>+62 878-9639-7106</a></p>
          <p><a className='text-school-blue' href='mailto:smpitcendekiapwk@gmail.com'>smpitcendekiapwk@gmail.com</a></p>
          <p>Instagram: @smpitcendekia</p>
          <p>YouTube: smpitcendekiapwk</p>
        </address>
      </section>
    </main>
  )
}
