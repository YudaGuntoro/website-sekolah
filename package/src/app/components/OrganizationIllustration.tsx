export default function OrganizationIllustration() {
  return (
    <svg viewBox='0 0 960 390' className='h-auto w-full max-w-[900px]' fill='none' aria-hidden='true'>
      <path d='M480 95v42M150 137h660M150 137v30m220-30v30m220-30v30m220-30v30' stroke='#83c9ee' strokeWidth='3' strokeLinecap='round' />
      <rect x='360' y='28' width='240' height='68' rx='18' fill='#123253' />
      <circle cx='394' cy='62' r='18' fill='#dff3ff' />
      <path d='M394 53a6 6 0 1 0 0 12 6 6 0 0 0 0-12Zm-11 22c0-5.2 4.8-9 11-9s11 3.8 11 9v2h-22v-2Z' fill='#47b5e7' />
      <rect x='426' y='52' width='138' height='9' rx='4.5' fill='#fff' fillOpacity='.92' />
      <rect x='426' y='68' width='96' height='7' rx='3.5' fill='#a9dafa' />
      {[150, 370, 590, 810].map((x) => (
        <g key={x}>
          <rect x={x - 98} y='174' width='196' height='158' rx='18' fill='#fff' stroke='#d9e6f1' strokeWidth='2' />
          <circle cx={x} cy='223' r='26' fill='#e5f5ff' />
          <path d={`M${x} 210a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm-15 31c0-7.2 6.5-12 15-12s15 4.8 15 12v3h-30v-3Z`} fill='#47b5e7' />
          <rect x={x - 59} y='272' width='118' height='8' rx='4' fill='#b6d8eb' />
          <rect x={x - 42} y='289' width='84' height='7' rx='3.5' fill='#e0eaf1' />
        </g>
      ))}
    </svg>
  )
}

