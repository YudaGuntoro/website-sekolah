'use client'
export default function SchoolError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className='mx-auto max-w-3xl px-5 py-24 text-center'><h1 className='text-3xl font-bold text-school-navy'>Informasi belum dapat dimuat</h1><p className='mt-4 text-slate-600'>Silakan coba kembali beberapa saat lagi.</p><button onClick={reset} className='mt-8 rounded-full bg-school-blue px-6 py-3 font-bold text-white'>Coba lagi</button></main>
}
