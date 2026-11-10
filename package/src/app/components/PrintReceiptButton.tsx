'use client'

export default function PrintReceiptButton() {
  return <button type='button' onClick={() => window.print()} className='inline-flex items-center justify-center gap-2 rounded-md bg-school-blue px-5 py-3 text-sm font-semibold text-white hover:bg-school-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-school-blue'>
    <svg viewBox='0 0 24 24' className='h-5 w-5' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'><path d='M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2' /><path d='M6 14h12v7H6zM18 12h.01' /></svg>
    Cetak / Simpan PDF
  </button>
}
