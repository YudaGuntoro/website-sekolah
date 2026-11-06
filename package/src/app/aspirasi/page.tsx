import type { Metadata } from 'next'
import { getContactSettings, whatsappUrl } from '../contact-settings'

export const metadata: Metadata = {
  title: 'Kontak SMPIT Cendekia',
  description: 'Informasi kontak SMPIT Cendekia Purwakarta.',
}

export default async function ContactPage() {
  const contact = await getContactSettings()
  return (
    <main className='min-h-[70vh] bg-[#f3f8fd] px-5 py-16 sm:px-8'>
      <section className='mx-auto max-w-3xl rounded-2xl border border-sky-100 bg-white p-7 sm:p-10'>
        <p className='text-xs font-extrabold uppercase tracking-[.18em] text-school-blue'>SMPIT Cendekia Purwakarta</p>
        <h1 className='mt-4 text-3xl font-black text-school-navy'>Kontak</h1>
        <address className='mt-6 space-y-3 text-sm not-italic leading-6 text-slate-600'>
          {contact.address && <p>{contact.address}</p>}
          {contact.whatsappNumber && <p><a className='text-school-blue' href={whatsappUrl(contact.whatsappNumber)}>{contact.whatsappNumber}</a></p>}
          {contact.email && <p><a className='text-school-blue' href={`mailto:${contact.email}`}>{contact.email}</a></p>}
          {contact.instagramUrl && <p><a href={contact.instagramUrl} target='_blank' rel='noopener noreferrer'>Instagram sekolah</a></p>}
          <p>YouTube: smpitcendekiapwk</p>
        </address>
      </section>
    </main>
  )
}
