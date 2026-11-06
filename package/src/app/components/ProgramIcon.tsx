export function programIconKind(title: string) {
  const name = title.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]/g, '')
  if (/qiyam|tahajud|lail/.test(name)) return 'night-prayer'
  if (/tahfi[dz]|quran/.test(name)) return 'quran'
  if (/bilingual|dwibahasa|multilingual/.test(name)) return 'languages'
  if (/inggris|english|pare/.test(name)) return 'english'
  return 'learning'
}

export default function ProgramIcon({ title }: { title: string }) {
  const kind = programIconKind(title)
  return <svg data-program-icon={kind} viewBox='0 0 24 24' className='h-6 w-6 fill-none stroke-current sm:h-7 sm:w-7' strokeWidth='1.7' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'>
    {kind === 'night-prayer' && <><rect x='3' y='3' width='18' height='14' rx='2' /><path d='M9 21h6m-3-4v4M14.5 6a4 4 0 1 0 3.5 5.5A4 4 0 0 1 14.5 6Z' /></>}
    {kind === 'quran' && <path d='M12 7C9 4.5 5 4.5 2 6v12c3-1.5 7-1.5 10 1 3-2.5 7-2.5 10-1V6c-3-1.5-7-1.5-10 1Zm0 0v12M5 9l4 1M5 12l4 1m6-3 4-1m-4 4 4-1M8 22l4-3 4 3' />}
    {kind === 'languages' && <><path d='M12 12H6l-4 3V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v6M18 9h2a2 2 0 0 1 2 2v11l-4-3h-7a2 2 0 0 1-2-2v-2' /><path d='m6 9 2-5 2 5M6.8 7.5h2.4' /><text x='16' y='16' textAnchor='middle' fontSize='8' fontFamily='sans-serif' fill='currentColor' stroke='none'>ع</text></>}
    {kind === 'english' && <><path d='M11 5H4a2 2 0 0 0-2 2v13h7a3 3 0 0 1 3 2 3 3 0 0 1 3-2h7v-8M12 13v9M5 10h3m-3 4h3' /><path d='M16 2h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-3l-3 2V4a2 2 0 0 1 2-2Z' /><text x='18' y='7.5' textAnchor='middle' fontSize='5.5' fontWeight='700' fontFamily='sans-serif' fill='currentColor' stroke='none'>EN</text></>}
    {kind === 'learning' && <path d='M12 6C9 4 5 4 2 5v14c3-1 7-1 10 1 3-2 7-2 10-1V5c-3-1-7-1-10 1Zm0 0v14M5 9h3M5 13h3M16 9h3M16 13h3' />}
  </svg>
}
