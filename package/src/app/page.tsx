import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import AnnouncementDialog from './components/AnnouncementDialog'
import SocialFeed from './components/SocialFeed'
import PrincipalGreeting from './components/PrincipalGreeting'
import ProgramIcon from './components/ProgramIcon'
import HomepageImage from './components/HomepageImage'
import { getHomepageImages } from './homepage-images'
import { getSpmbAcademicYear } from './spmb/information'
import { getSchoolIdentity } from './school-identity'
import { getContactSettings, whatsappUrl } from './contact-settings'
import LearningEnvironmentGallery from './components/LearningEnvironmentGallery'
import SchoolHighlightsCounter from './components/SchoolHighlightsCounter'
import { getSchoolContent, getCmsCollection } from './cms-content'

// Keep this section available while it is hidden from the homepage.
const showLearningEnvironment = false

export const metadata: Metadata = {
  title: 'SMPIT Cendekia Purwakarta | Tumbuh, Belajar, Berkarya',
  description:
    'Sekolah Cendekia adalah ruang belajar untuk bertumbuh, membangun karakter, dan mengembangkan potensi setiap anak.',
}

const missionVisuals = [
  { title: 'Iman & akhlak', tone: 'bg-sky-100 text-sky-700', path: 'M3 21h18M5 21V10H2l2-4 2 4H5m14 11V10h3l-2-4-2 4h1M8 21v-8h8v8M8 13V9c0-2 4-3 4-5 0 2 4 3 4 5v4M12 4V2m-2 19v-4a2 2 0 0 1 4 0v4' },
  { title: 'Ilmu & literasi', tone: 'bg-indigo-100 text-indigo-700', path: 'M12 5v16M3 4c4-1 7 0 9 2 2-2 5-3 9-2v15c-4-1-7 0-9 2-2-2-5-3-9-2V4Z' },
  { title: 'Jiwa pemimpin', tone: 'bg-amber-100 text-amber-700', path: 'M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM6 21v-3a6 6 0 0 1 12 0v3M3 7h2m14 0h2M5 2l1.5 1.5M19 2l-1.5 1.5M12 14l-2 3 2 3 2-3-2-3' },
  { title: 'Budaya positif', tone: 'bg-cyan-100 text-cyan-700', path: 'M21 11a9 9 0 0 1-9 9 10 10 0 0 1-4-.9L3 21l1.9-5A9 9 0 1 1 21 11ZM8 9h.01M16 9h.01M8 13a4.5 4.5 0 0 0 8 0' },
  { title: 'Peduli lingkungan', tone: 'bg-emerald-100 text-emerald-700', path: 'M20 3C8 3 3 8 5 15s15 7 15-12ZM4 21 15 10' },
  { title: 'Bakat & minat', tone: 'bg-violet-100 text-violet-700', path: 'M7 3h10v5c0 5-2 7-5 7s-5-2-5-7V3ZM7 5H3v3a4 4 0 0 0 5 4M17 5h4v3a4 4 0 0 1-5 4M12 15v4M8 21h8M10 19h4' },
]

const programs = [
  { title: 'Qiyamul Lail Virtual', text: 'Program unggulan SMPIT Cendekia.', image: 'qiyamul-lail', alt: 'Ilustrasi sajadah dan laptop dengan suasana malam' },
  { title: 'Tahfidz Al-Quran', text: 'Program unggulan SMPIT Cendekia.', image: 'tahfidz', alt: 'Ilustrasi Al-Quran terbuka di atas rehal' },
  { title: 'Bilingual Program', text: 'Bahasa Inggris dan Bahasa Arab.', image: 'bilingual', alt: 'Ilustrasi buku catatan dan headphone untuk belajar bahasa' },
  { title: 'Belajar Intensif Bahasa Inggris', text: 'Ke Kampung Inggris Pare, Kediri.', image: 'kampung-inggris', alt: 'Ilustrasi tas, buku catatan, dan peta untuk perjalanan belajar' },
]

const facilities = [
  { icon: '▤', title: 'Ruang belajar nyaman', tone: 'bg-sky-100 text-sky-800', detail: 'Ruang yang mendukung fokus, diskusi, dan kolaborasi.' },
  { icon: '⌕', title: 'Perpustakaan', tone: 'bg-blue-100 text-blue-800', detail: 'Ruang untuk membaca, mencari tahu, dan menjelajah ide.' },
  { icon: '✳', title: 'Ruang kreasi', tone: 'bg-indigo-100 text-indigo-800', detail: 'Tempat murid bereksperimen dan membuat karya.' },
  { icon: '↗', title: 'Area aktivitas', tone: 'bg-cyan-100 text-cyan-800', detail: 'Ruang untuk bergerak, bermain, dan belajar bersama.' },
]


const interests = [
  { title: 'Sains & Teknologi', text: 'Eksperimen, pemrograman, dan pemecahan masalah.' },
  { title: 'Bahasa & Literasi', text: 'Membaca kritis, menulis, dan berkomunikasi.' },
  { title: 'Seni & Kreativitas', text: 'Seni rupa, musik, dan karya kreatif.' },
  { title: 'Olahraga & Kesehatan', text: 'Gerak aktif, kebugaran, dan kerja sama tim.' },
]

const schoolHighlights = [
  { value: '18+', title: 'Ruang Kelas', category: 'Fasilitas belajar', text: 'Ruang belajar nyaman yang mendukung diskusi dan kolaborasi.', icon: 'classroom' },
  { value: '30+', title: 'Tenaga Pendidik', category: 'Komunitas akademik', text: 'Guru dan staf yang mendampingi proses belajar murid.', icon: 'educators' },
  { value: '12+', title: 'Ekstrakurikuler', category: 'Eksplorasi minat', text: 'Pilihan kegiatan untuk mengeksplorasi minat dan bakat.', icon: 'activities' },
  { value: '3', title: 'Laboratorium', category: 'Praktik & riset', text: 'Ruang praktik untuk belajar sains, komputer, dan keterampilan.', icon: 'laboratory' },
  { value: '1', title: 'Perpustakaan', category: 'Literasi', text: 'Koleksi bacaan dan ruang tenang untuk mencari inspirasi.', icon: 'library' },
  { value: '4', title: 'Fokus Pengembangan', category: 'Pembelajaran holistik', text: 'Akademik, karakter, kreativitas, dan kebugaran.', icon: 'growth' },
]

function SchoolHighlightIcon({ name }: { name: string }) {
  const paths: Record<string, string> = {
    classroom: 'M3 21h18M5 21V8l7-5 7 5v13M9 11h2v2H9zM14 11h2v2h-2zM10 21v-5h4v5',
    educators: 'M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
    activities: 'M9 18V5l12-2v13M9 10l12-2M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm12-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
    laboratory: 'M9 3h6M10 3v7l-5.5 8.2A2.5 2.5 0 0 0 6.6 22h10.8a2.5 2.5 0 0 0 2.1-3.8L14 10V3M7.5 16h9',
    library: 'M3 5.5A2.5 2.5 0 0 1 5.5 3H12v17H5.5A2.5 2.5 0 0 0 3 22V5.5ZM21 5.5A2.5 2.5 0 0 0 18.5 3H12v17h6.5a2.5 2.5 0 0 1 2.5 2V5.5Z',
    growth: 'M9 18h6m-5 3h4m-2-18a7 7 0 0 0-4.2 12.6c.8.6 1.2 1.4 1.3 2.4h5.8c.1-1 .5-1.8 1.3-2.4A7 7 0 0 0 12 3Zm0-2v1m9 10h-1M4 12H3m15.36-6.36-.7.7M6.34 17.66l-.7.7M5.64 5.64l.7.7m12.02 12.02.7.7',
  }

  return <svg viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='1.7' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true' className='h-5 w-5'><path d={paths[name] ?? paths.growth} /></svg>
}

function InterestIllustration({ index }: { index: number }) {
  const backgrounds = ['bg-sky-100', 'bg-blue-100', 'bg-indigo-100', 'bg-cyan-100']

  return (
    <div className={`relative flex h-32 items-center justify-center overflow-hidden ${backgrounds[index]}`}>
      <span aria-hidden='true' className='absolute -right-7 -top-12 h-36 w-36 rounded-full border-[18px] border-white/40' />
      <span className='absolute left-4 top-4 text-xs font-extrabold tracking-widest text-school-blue/70'>{String(index + 1).padStart(2, '0')}</span>
      <div className='interest-float relative text-school-blue'>
        {index === 0 && <svg viewBox='0 0 64 64' className='h-16 w-16' fill='none' stroke='currentColor' strokeWidth='3' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'><path d='M23 8h18M27 8v17L14 48a5 5 0 0 0 4 8h28a5 5 0 0 0 4-8L37 25V8M20 43h24'/><circle cx='28' cy='36' r='2' fill='currentColor' stroke='none'/><circle cx='38' cy='31' r='2.5' fill='currentColor' stroke='none'/><circle cx='34' cy='41' r='1.5' fill='currentColor' stroke='none'/></svg>}
        {index === 1 && <svg viewBox='0 0 64 64' className='h-16 w-16' fill='none' stroke='currentColor' strokeWidth='3' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'><path d='M8 15c10-4 18-2 24 4 6-6 14-8 24-4v34c-10-3-18-1-24 5-6-6-14-8-24-5V15Z'/><path d='M32 19v35M14 24c5-1 10 0 14 3M14 32c5-1 10 0 14 3M50 24c-5-1-10 0-14 3M50 32c-5-1-10 0-14 3'/></svg>}
        {index === 2 && <svg viewBox='0 0 64 64' className='h-16 w-16' fill='none' stroke='currentColor' strokeWidth='3' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'><path d='M31 9a23 23 0 1 0 0 46h4a6 6 0 0 0 4-10 4 4 0 0 1 3-7h5A10 10 0 0 0 57 28C54 17 43 9 31 9Z'/><circle cx='20' cy='27' r='2.5' fill='currentColor'/><circle cx='30' cy='19' r='2.5' fill='currentColor'/><circle cx='41' cy='22' r='2.5' fill='currentColor'/></svg>}
        {index === 3 && <svg viewBox='0 0 64 64' className='h-16 w-16' fill='none' stroke='currentColor' strokeWidth='3' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'><circle cx='32' cy='32' r='23'/><path d='m32 20 8 6-3 9h-10l-3-9 8-6ZM12 25l12 1m-4 25 7-16m18 16-8-16m15-10-12 1m-8-17v11'/></svg>}
      </div>
    </div>
  )
}

function AchievementPlaceholder({ index }: { index: number }) {
  const palettes = [
    'from-sky-100 via-blue-100 to-indigo-100 text-blue-700',
    'from-indigo-100 via-violet-100 to-sky-100 text-indigo-700',
    'from-cyan-100 via-sky-100 to-blue-100 text-cyan-800',
    'from-blue-100 via-indigo-100 to-purple-100 text-indigo-800',
  ]
  return (
    <div className={`relative flex aspect-[1.55] items-center justify-center overflow-hidden bg-gradient-to-br ${palettes[index % palettes.length]}`}>
      <div className='absolute -right-8 -top-12 h-40 w-40 rounded-full border-[22px] border-white/35' />
      <div className='absolute -bottom-20 -left-5 h-36 w-36 rounded-full bg-white/30 blur-sm' />
      <span className='absolute bottom-4 left-5 text-[10px] font-black uppercase tracking-[.24em] opacity-60'>Cendekia · Achievements</span>
      <svg viewBox='0 0 64 64' aria-hidden='true' className='relative h-16 w-16 drop-shadow-sm sm:h-[4.5rem] sm:w-[4.5rem]'>
        <path d='M21 10h22v8c0 13-4 19-11 22-7-3-11-9-11-22v-8Z' fill='currentColor' opacity='.88'/>
        <path d='M21 15h-9v5c0 8 5 13 13 14m18-19h9v5c0 8-5 13-13 14M32 40v9m-9 5h18M27 49h10' fill='none' stroke='currentColor' strokeLinecap='round' strokeLinejoin='round' strokeWidth='4'/>
        <path d='m32 17 1.7 3.5 3.8.6-2.8 2.7.7 3.8-3.4-1.8-3.4 1.8.7-3.8-2.8-2.7 3.8-.6L32 17Z' fill='white'/>
      </svg>
    </div>
  )
}

function PdfPlaceholder() {
  return (
    <div className='hidden aspect-[1.7] items-center justify-center rounded-lg bg-sky-50 sm:flex'>
      <svg viewBox='0 0 64 76' aria-hidden='true' className='h-16 w-14'>
        <path d='M12 2h27l19 19v49a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4Z' fill='#bfdbfe'/>
        <path d='M39 2v16a3 3 0 0 0 3 3h16' fill='#93c5fd'/>
        <rect x='5' y='19' width='33' height='17' rx='3' fill='#1e65a8'/>
        <text x='21.5' y='31.5' fill='white' fontSize='12' fontWeight='700' textAnchor='middle'>PDF</text>
        <path d='M20 46h29M20 55h29M20 64h20' stroke='white' strokeLinecap='round' strokeWidth='4'/>
      </svg>
    </div>
  )
}

function NewsVisual({ kind }: { kind: string }) {
  const styles: Record<string, { bg: string; accent: string; label: string; icon: string }> = {
    literasi: { bg: 'from-sky-100 via-blue-50 to-indigo-100', accent: 'text-blue-700', label: 'READ · THINK · CREATE', icon: '▤' },
    sains: { bg: 'from-cyan-100 via-sky-50 to-blue-100', accent: 'text-cyan-800', label: 'IDEAS IN ACTION', icon: '✳' },
    project: { bg: 'from-indigo-100 via-blue-50 to-sky-100', accent: 'text-indigo-700', label: 'PROJECT-BASED LEARNING', icon: '⌘' },
    community: { bg: 'from-blue-100 via-sky-50 to-cyan-100', accent: 'text-school-blue', label: 'GROWING TOGETHER', icon: '✦' },
  }
  const style = styles[kind]
  return (
    <div className={`relative flex min-h-48 items-center justify-center overflow-hidden bg-gradient-to-br ${style.bg}`}>
      <span aria-hidden='true' className='absolute -right-8 -top-16 h-48 w-48 rounded-full border-[28px] border-white/50' />
      <span aria-hidden='true' className='absolute -bottom-16 -left-8 h-40 w-40 rounded-full bg-white/50 blur-sm' />
      <span className={`relative flex h-24 w-24 items-center justify-center rounded-[1.75rem] border border-white/80 bg-white/75 text-5xl shadow-[0_18px_50px_-24px_rgba(16,45,78,.35)] backdrop-blur ${style.accent}`}>{style.icon}</span>
      <span className={`absolute bottom-4 left-5 text-[9px] font-black tracking-[.2em] ${style.accent}`}>{style.label}</span>
      <span className='absolute right-5 top-4 rounded-full bg-white/75 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-school-navy'>Cendekia Journal</span>
    </div>
  )
}

function SchoolIllustration() {
  return (
    <div className='relative z-10 mx-auto w-full max-w-[600px]'>
      <div className='absolute -left-4 top-10 h-24 w-24 rounded-full bg-sky-200/70 blur-2xl sm:-left-8' />
      <div className='absolute -right-3 bottom-12 h-32 w-32 rounded-full bg-blue-200/80 blur-2xl sm:-right-8' />
      <div className='relative overflow-hidden rounded-[2rem] border border-white/80 bg-white shadow-[0_30px_80px_-35px_rgba(17,65,112,0.4)] sm:rounded-[2.5rem]'>
        <Image unoptimized src='/images/school/siswa-ceria.png' alt='Murid SMPIT Cendekia ceria dan siap menjadi unggulan' width={1536} height={1024} priority className='aspect-[3/2] h-full w-full object-cover' />
        <div className='absolute bottom-5 left-5 rounded-2xl border border-white/70 bg-white/90 px-4 py-3 shadow-lg backdrop-blur sm:bottom-8 sm:left-8 sm:px-5'>
          <p className='text-[10px] font-bold uppercase tracking-[0.17em] text-school-blue'>Sekolah Cendekia</p>
          <p className='mt-1 text-sm font-bold text-school-navy sm:text-base'>Ruang tumbuh setiap anak</p>
        </div>
      </div>
    </div>
  )
}

function MissionList({ missions }: { missions: string[] }) {
  return (
    <ul className='mt-3 space-y-2 sm:mt-4 sm:space-y-3'>
      {missions.map((mission, index) => (
        <li key={index} className='flex items-start gap-2 sm:gap-3'>
          <span className='flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#edf5ff] text-sm font-bold text-[#4384f5] sm:h-9 sm:w-9 sm:text-base' aria-hidden='true'>{index + 1}</span>
          <p className='pt-0.5 text-left text-sm leading-6 text-slate-600 sm:pt-1 sm:text-base sm:leading-7'>{mission}</p>
        </li>
      ))}
    </ul>
  )
}

export default async function Home() {
  const spmbAcademicYear = await getSpmbAcademicYear()
  const homepageImages = await getHomepageImages()
  const identity = await getSchoolIdentity()
  const missionCards = identity.missions.map((mission, index) => ({ ...missionVisuals[index % missionVisuals.length], ...mission }))
  const contact = await getContactSettings()
  const whatsapp = whatsappUrl(contact.whatsappNumber)
  const { announcements, achievements, schoolNews, staff } = await getSchoolContent()
  const cmsPrograms = await getCmsCollection('program')
  const cmsFacilities = await getCmsCollection('fasilitas')
  const visiblePrograms = cmsPrograms === null ? programs.map(e => ({ ...e, imageUrl: '' })) : cmsPrograms.map((e, index) => ({ title: e.title, text: [e.summary, e.body !== e.summary ? e.body : ''].filter(Boolean).join('\n\n'), imageUrl: e.imageUrl, image: programs[index % programs.length].image, alt: e.title }))
  const visibleFacilities = cmsFacilities === null ? facilities : cmsFacilities.map((e, index) => ({ title: e.title, detail: [e.summary, e.body !== e.summary ? e.body : ''].filter(Boolean).join('\n\n'), icon: facilities[index % facilities.length].icon, tone: facilities[index % facilities.length].tone }))
  return (
    <main>
      <section id='beranda' className='relative isolate overflow-hidden bg-gradient-to-br from-[#edf6ff] via-white to-[#f0f7ff] py-0 sm:py-14'>
        <div aria-hidden='true' className='pointer-events-none absolute -right-48 -top-52 -z-10 h-[34rem] w-[34rem] rounded-full bg-sky-200/40 blur-3xl' />
        <div className='mx-auto grid max-w-7xl items-center gap-8 px-5 pb-8 pt-8 sm:gap-12 sm:px-8 sm:pb-20 sm:pt-20 lg:grid-cols-[1fr_1.04fr] lg:gap-8 lg:px-10 lg:pb-24 lg:pt-16'>
          <div className='relative z-10'>
            <h1 className='mt-4 max-w-2xl text-[32px] font-black leading-[1.12] tracking-tight text-school-navy sm:text-5xl lg:text-[3.65rem]'>Unggul dalam <span className='text-school-blue'>Bina Iman, Ilmu</span> dan Amal.</h1>
            <p className='mt-4 max-w-xl text-sm leading-6 text-slate-600 sm:mt-6 sm:text-lg sm:leading-8'>SMPIT Cendekia Purwakarta membina iman, ilmu, dan amal melalui pembelajaran, kegiatan keagamaan, program bilingual, serta pengembangan bakat murid.</p>
            <div className='mt-5 grid grid-cols-2 gap-2 sm:mt-8 sm:flex sm:flex-row sm:flex-wrap lg:flex-nowrap'>
              <a href='/spmb' className='col-span-2 inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-school-gold px-5 py-3 text-sm font-bold text-school-navy shadow-lg shadow-amber-900/10 transition hover:-translate-y-0.5 hover:bg-[#ffca35]'>Informasi SPMB <span aria-hidden='true'>?</span></a>
              <a href='#tentang' className='inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-xl border border-sky-200 bg-white px-2 py-2.5 text-xs sm:px-5 sm:py-3 sm:text-sm font-bold text-school-navy transition hover:border-sky-400 hover:bg-sky-50'>Kenali sekolah kami</a>
              <a href='/brosur-ppdb.pdf' download className='inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-sky-200 bg-white px-2 py-2.5 text-xs sm:px-4 sm:py-3 sm:text-sm font-bold text-school-blue transition hover:border-sky-400 hover:bg-sky-50'><svg viewBox='0 0 24 24' className='h-4 w-4 fill-none stroke-current' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'><path d='M12 3v12m0 0 4-4m-4 4-4-4M5 17v3h14v-3'/></svg>Unduh brosur</a>
            </div>
          </div>
          <div className='relative z-10 mx-auto w-full max-w-[220px] sm:max-w-[600px]'><HomepageImage imageUrl={homepageImages.heroUrl} defaultSrc='/images/school/siswa-ceria.png' alt='Murid SMPIT Cendekia ceria dan siap menjadi unggulan' width={1536} height={1024} priority className='h-auto w-full object-contain drop-shadow-[0_18px_24px_rgba(16,45,78,.12)]' /></div>
        </div>
      </section>

      <section id='tentang' className='border-y border-sky-100 bg-[#f7faff] py-8 sm:py-20'>
        <div className='mx-auto grid max-w-7xl items-start gap-5 px-5 sm:gap-10 sm:px-8 lg:grid-cols-[.82fr_1.18fr] lg:gap-12 lg:px-10'>
          <div className='flex min-w-0 flex-col lg:pr-3'>
            <h2 className='mt-4 whitespace-nowrap text-[clamp(1rem,5vw,1.25rem)] font-black leading-[1.12] tracking-tight text-school-navy sm:whitespace-normal sm:text-4xl xl:text-5xl'>Arah Pendidikan <span className='text-sky-600 sm:block'>Cendekia</span></h2>
            <p className='mt-3 hidden max-w-md text-sm leading-6 sm:mt-5 sm:block sm:leading-7 text-slate-600 sm:text-base'>Motto, visi, dan misi menjadi arah bagi seluruh warga sekolah dalam mendampingi proses belajar dan pertumbuhan murid.</p>
            <HomepageImage imageUrl={homepageImages.directionUrl} defaultSrc='/images/school/arah-pendidikan.png' alt='Tiga pelajar SMP bersemangat meraih prestasi dan masa depan cemerlang' width={1122} height={1402} sizes='(min-width: 640px) 336px, 90vw' className='mx-auto mt-8 hidden h-auto max-h-[420px] w-auto max-w-full object-contain sm:block lg:mt-10' />
          </div>
          <div className='space-y-4 sm:space-y-6'>
            {identity.motto && <article className='border-b border-sky-100 pb-3 sm:pb-5'><h3 className='text-xl font-extrabold text-school-navy sm:text-2xl'>Motto</h3><p className='mt-2 font-serif text-lg italic leading-6 sm:leading-7 text-school-blue sm:text-2xl'>{identity.motto}</p></article>}
            {identity.vision && <article className='border-b border-sky-100 pb-3 sm:pb-5'><h3 className='text-xl font-extrabold text-school-navy sm:text-2xl'>Visi</h3><p className='mt-2 text-left font-serif text-base italic leading-6 sm:text-justify sm:leading-7 text-school-blue sm:text-xl'>{identity.vision}</p></article>}
            {identity.missions.length > 0 && <article>
              <h3 className='text-xl font-extrabold text-school-navy sm:text-2xl'>Misi</h3>
              <div className='mt-3 space-y-2 sm:hidden'>
                {missionCards.map((card, index) => (
                  <details key={index} name='school-missions' className='group overflow-hidden rounded-2xl border border-sky-100 bg-white transition-colors open:border-sky-300 open:bg-sky-50/60'>
                    <summary className='flex min-h-16 cursor-pointer list-none items-center gap-3 p-3 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-school-blue [&::-webkit-details-marker]:hidden'>
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${card.tone}`}>
                        <svg viewBox='0 0 24 24' className='h-5 w-5' fill='none' stroke='currentColor' strokeWidth='1.7' strokeLinecap='round' strokeLinejoin='round' aria-hidden='true'><path d={card.path} /></svg>
                      </span>
                      <span className='min-w-0 flex-1 text-sm font-bold text-school-navy'>{card.title}</span>
                      <span className='text-[10px] font-bold tabular-nums text-slate-400' aria-hidden='true'>{String(index + 1).padStart(2, '0')}</span>
                      <svg viewBox='0 0 20 20' className='h-4 w-4 shrink-0 text-school-blue transition-transform group-open:rotate-180 motion-reduce:transition-none' fill='none' stroke='currentColor' strokeWidth='1.8' aria-hidden='true'><path d='m5 7.5 5 5 5-5' /></svg>
                    </summary>
                    <p className='mx-4 border-t border-sky-100 py-3 text-sm leading-6 text-slate-600'>{card.text}</p>
                  </details>
                ))}
              </div>
              <div className='hidden sm:block'><MissionList missions={identity.missions.map(mission => mission.text)} /></div>
            </article>}
          </div>
        </div>
      </section>

      <PrincipalGreeting />

      <section id='keunggulan' className='bg-[#f6f9fc] py-8 sm:py-20'>
        <div className='mx-auto max-w-7xl px-5 sm:px-8 lg:px-10'>
          <div className='mx-auto max-w-2xl text-center'><h2 className='text-2xl font-extrabold tracking-tight text-school-navy sm:text-4xl'>Ruang untuk <span className='text-sky-500'>tumbuh lebih jauh.</span></h2><p className='mt-4 leading-7 text-slate-600'>Dukungan akademik, fasilitas, dan aktivitas yang membuka lebih banyak cara untuk belajar dan berkembang.</p></div>
          <div className='mt-6 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-4 lg:grid-cols-3'>
            {schoolHighlights.map((item) => <article key={item.title} className='relative min-h-[120px] overflow-hidden rounded-xl border border-slate-200/80 bg-white p-4 sm:min-h-[206px] sm:rounded-2xl sm:p-7 shadow-[0_10px_30px_-24px_rgba(16,45,78,.28)] transition hover:-translate-y-1 hover:shadow-[0_18px_36px_-24px_rgba(16,45,78,.3)]'><span aria-hidden='true' className='absolute -right-8 -top-10 h-24 w-24 rounded-full bg-sky-50' /><div className='relative flex items-start justify-between gap-2 sm:gap-4'><div><p className='hidden text-[10px] font-extrabold uppercase sm:block tracking-[.17em] text-school-blue'>{item.category}</p><h3 className='text-sm font-bold leading-snug text-school-navy sm:mt-2 sm:text-base'>{item.title}</h3></div><span className='flex h-7 w-7 shrink-0 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-sky-100 bg-sky-50/70 text-school-blue'><SchoolHighlightIcon name={item.icon} /></span></div><div className='relative mt-3 flex items-end justify-between gap-3 sm:mt-7 sm:min-h-[62px]'><p className='hidden max-w-[68%] text-sm leading-6 text-slate-500 sm:block'>{item.text}</p><p className='shrink-0 text-2xl font-black leading-none tracking-tight text-school-navy sm:text-[2.75rem]'><SchoolHighlightsCounter value={item.value} /></p></div><div className='relative mt-3 h-px bg-slate-100 sm:mt-6'><span className={`block h-px bg-sky-500 ${schoolHighlights.indexOf(item) % 2 === 0 ? 'w-1/3' : 'w-1/2'}`} /></div></article>)}
          </div>
        </div>
      </section>

      <section id='program' className='border-y border-sky-100/70 bg-[#f7faff] py-8 sm:py-20'>
        <div className='mx-auto grid max-w-7xl gap-5 px-5 sm:gap-8 sm:px-8 lg:grid-cols-[.75fr_1.65fr] lg:items-center lg:gap-12 lg:px-10'>
          <div className='max-w-lg'>
            <h2 className='mt-4 whitespace-nowrap text-[clamp(1.5rem,7vw,2.25rem)] font-black leading-[1.1] tracking-tight text-school-navy lg:text-[clamp(1.5rem,2.6vw,2.25rem)]'>Program <span className='text-sky-600'>Unggulan</span></h2>
            <div aria-hidden='true' className='mt-5 h-1 w-12 rounded-full bg-school-gold' />
            <p className='mt-5 text-sm leading-7 text-slate-600 sm:text-base'>Belajar banyak hal dengan cara bermakna untuk menumbuhkan pemahaman, kebiasaan baik, dan keterampilan hidup.</p>
            <div className='mt-6 hidden max-w-sm sm:block'>
              <HomepageImage imageUrl={homepageImages.programUrl} defaultSrc='/images/school/bimbingan-karier.png' alt='Guru mendampingi dua murid merancang masa depan melalui bimbingan karier' width={1312} height={1199} sizes='(min-width: 1024px) 340px, (min-width: 640px) 384px, 90vw' className='h-auto w-full object-contain' />
            </div>
          </div>
          <div className='grid gap-3 sm:gap-5'>
            {visiblePrograms.map((program, index) => (
              <article key={program.title} className='group flex items-center gap-3 rounded-2xl sm:rounded-[1.25rem] border border-[#dbe6f4] bg-white px-4 py-4 text-left shadow-[0_4px_0_0_#e4edfa] transition-[border-color,box-shadow] duration-200 hover:border-blue-300 hover:shadow-[0_4px_0_0_#bfdbfe] sm:gap-6 sm:px-7 sm:py-7'>
                <div className={`flex h-10 w-10 shrink-0 -rotate-3 items-center justify-center rounded-[.9rem] transition-transform duration-200 group-hover:rotate-0 motion-reduce:transition-none sm:h-14 sm:w-14 ${['bg-[#2563eb] text-white', 'bg-school-navy text-white', 'bg-school-sky text-school-blue', 'bg-school-gold text-school-navy'][index % 4]}`}>
                  <ProgramIcon title={program.title} />
                </div>
                <div className='min-w-0'>
                  {program.imageUrl && <img src={program.imageUrl} alt={program.title} className='mb-3 max-h-44 w-full rounded-lg object-cover' loading='lazy' />}<h3 className='text-lg font-bold leading-[1.15] tracking-[-.035em] text-[#122b49] sm:text-[28px]'>{program.title}</h3>
                  <p className='mt-1 text-xs leading-5 text-slate-500 sm:mt-2 sm:text-[15px] sm:leading-6'>{program.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id='prestasi' className='bg-[#f3f8ff] py-8 sm:py-20'>
        <div className='mx-auto max-w-7xl px-5 sm:px-8 lg:px-10'>
          <div className='mx-auto mb-6 max-w-2xl text-center sm:mb-12'>
            <h2 className='text-2xl font-black tracking-tight text-school-navy sm:text-4xl'>Prestasi <span className='text-sky-600'>Murid</span></h2>
            <p className='mt-3 text-sm leading-6 text-slate-600 sm:mt-4 sm:leading-7 sm:text-base'>Prestasi murid SMPIT Cendekia yang tercantum dalam brosur sekolah.</p>
          </div>
          <div className='grid gap-3 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4'>
            {achievements.slice(0, 4).map((achievement, index) => (
              <article key={`${achievement.title}-${index}`} className='group overflow-hidden rounded-2xl border border-white bg-white shadow-[0_12px_32px_-22px_rgba(15,45,78,.3)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_-24px_rgba(30,101,168,.32)]'>
                <div className='relative hidden overflow-hidden sm:block'>
                  <AchievementPlaceholder index={index} />
                  <span className='absolute left-4 top-4 rounded-full border border-school-gold/50 bg-school-butter px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-school-navy shadow-sm backdrop-blur'>🏆 Juara</span>
                </div>
                <div className='flex flex-col p-4 sm:min-h-[203px] sm:p-5'>
                  <p className='flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-sky-700'><span className='flex h-5 w-5 items-center justify-center rounded-full bg-sky-50 text-xs'>✦</span>{achievement.level}</p>
                  <h3 className='mt-2 text-[15px] font-bold leading-snug sm:mt-3 sm:min-h-[2.75rem] sm:text-base text-slate-900'>{achievement.title}</h3>
                  <a href='#prestasi' className='mt-3 flex items-center gap-2 border-t border-slate-100 pt-3 sm:mt-auto sm:pt-4 text-[10px] font-extrabold uppercase tracking-[0.12em] text-school-blue hover:text-indigo-700'>Detail prestasi <span aria-hidden='true'>↗</span></a>
                </div>
              </article>
            ))}
          </div>
          <div className='mt-6 text-center sm:mt-9'>
            <Link href='/prestasi' className='inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-5 py-3 text-sm font-bold text-school-blue shadow-sm transition hover:border-school-blue hover:bg-sky-50'>
              Lihat Lebih Banyak <span aria-hidden='true'>→</span>
            </Link>
          </div>
        </div>
      </section>

      <section id='berita' className='bg-[#f7f9fc] py-8 sm:py-16'>
        <div className='mx-auto max-w-6xl px-5 sm:px-8 lg:px-10'>
          <div className='mx-auto max-w-2xl text-center'>
            <h2 className='text-2xl font-black tracking-tight text-school-navy sm:text-4xl'>Berita <span className='text-sky-600'>Terbaru</span></h2>
            <p className='mt-3 text-sm leading-6 text-slate-600 sm:mt-4 sm:leading-7 sm:text-base'>Cerita kegiatan, karya, dan keseharian murid SMPIT Cendekia Purwakarta.</p>
          </div>
          <div className='mt-5 grid gap-3 sm:mt-8 sm:gap-5 md:grid-cols-12'>
            {schoolNews.slice(0, 4).map((news, index) => (
              <article key={news.title} className={`group ${index > 1 ? 'hidden sm:flex' : 'flex'} flex-col rounded-2xl bg-white p-4 shadow-[0_12px_32px_-24px_rgba(15,45,78,.22)] transition-shadow hover:shadow-[0_18px_42px_-24px_rgba(30,101,168,.22)] sm:p-6 ${index % 4 === 0 || index % 4 === 3 ? 'md:col-span-5' : 'md:col-span-7'}`}>
                <h3 className='text-base font-bold leading-snug tracking-tight text-school-navy transition group-hover:text-school-blue sm:text-xl'><Link href={`/berita/${news.slug}`}>{news.title}</Link></h3>
                <p className='mt-2 line-clamp-2 text-[13px] leading-5 text-slate-600 sm:line-clamp-none sm:text-sm sm:leading-6'>{news.text}</p>
                <div className='mt-3 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[.12em] text-school-blue'><span>{news.category}</span><span aria-hidden='true'>/</span><time dateTime={news.publishedAt} className='font-medium text-slate-500'>{news.date}</time></div>
                <Link href={`/berita/${news.slug}`} aria-label={`Baca ${news.title}`} className='mt-5 hidden overflow-hidden rounded-xl sm:block'>{news.image ? <img src={news.image} alt={news.title} className='aspect-[2/1] w-full object-cover' loading='lazy' /> : <NewsVisual kind={news.visual} />}</Link>
                <Link href={`/berita/${news.slug}`} className='mt-3 inline-flex sm:mt-4 items-center gap-2 text-xs font-extrabold uppercase tracking-[.12em] text-school-blue transition group-hover:gap-3'>Baca cerita <span aria-hidden='true'>↗</span></Link>
              </article>
            ))}
          </div>
          <div className='mt-4 text-center sm:mt-6'>
            <Link href='/berita' className='inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-5 py-3 text-sm font-bold text-school-blue transition hover:border-school-blue hover:bg-sky-50'>Lihat lebih banyak <span aria-hidden='true'>→</span></Link>
          </div>
        </div>
      </section>

      <section id='pengumuman' className='bg-white py-8 sm:py-16'>
        <div className='mx-auto max-w-7xl px-5 sm:px-8 lg:px-10'>
          <div className='mx-auto max-w-2xl text-center'>
            <h2 className='text-2xl font-black tracking-tight text-school-navy sm:text-4xl'>Pengumuman <span className='text-sky-600'>Terbaru</span></h2>
            <p className='mt-3 text-sm leading-6 text-slate-600 sm:mt-4 sm:leading-7 sm:text-base'>Informasi kegiatan, jadwal, dan kabar penting untuk keluarga besar Sekolah Cendekia.</p>
          </div>
          <div className='mt-6 grid gap-3 sm:mt-8 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4'>
            {announcements.map((announcement) => (
              <article key={announcement.title} className='flex flex-col rounded-xl border border-slate-100 bg-white p-4 shadow-[0_8px_24px_-18px_rgba(15,23,42,.25)] sm:p-5'>
                <PdfPlaceholder />
                <p className='mt-5 hidden items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.12em] text-school-blue sm:flex'><span className='flex h-5 w-5 items-center justify-center rounded-full bg-sky-50 text-xs'>ⓘ</span>Detail Pengumuman</p>
                <h3 className='text-[15px] font-bold leading-snug text-slate-900 sm:mt-3 sm:min-h-[3.25rem] sm:text-base'>{announcement.title}</h3>
                <div className='mt-3 flex items-center justify-between gap-3 sm:mt-2 sm:flex-1 sm:flex-col sm:items-stretch'>
                  <p className='flex items-center gap-1.5 text-[11px] text-slate-500 sm:text-[10px]'>
                    <svg viewBox='0 0 24 24' className='h-3.5 w-3.5 shrink-0 fill-none stroke-current' strokeWidth='1.7' strokeLinecap='round' aria-hidden='true'><rect x='3' y='5' width='18' height='16' rx='2' /><path d='M8 3v4M16 3v4M3 11h18' /></svg>
                    {announcement.date}
                  </p>
                  <div className='shrink-0 sm:mt-auto sm:pt-2'>
                    <AnnouncementDialog announcement={announcement} />
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className='mt-4 text-center sm:mt-6'>
            <Link href='/pengumuman' className='inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-5 py-3 text-sm font-bold text-school-blue transition hover:border-school-blue hover:bg-sky-50'>Lihat lebih banyak <span aria-hidden='true'>→</span></Link>
          </div>
        </div>
      </section>

      <SocialFeed platform='instagram' />
      <SocialFeed platform='tiktok' />

      <section id='guru' className='bg-[#f7f9fc] pb-6 pt-8 sm:pb-8 sm:pt-16'>
        <div className='mx-auto max-w-6xl px-5 sm:px-8 lg:px-10'>
          <div className='mx-auto mb-5 max-w-2xl sm:mb-8 text-center'>
            <h2 className='text-2xl font-black tracking-tight text-school-navy sm:text-4xl'>Guru dan Tenaga <span className='text-sky-600'>Kependidikan</span></h2>
            <p className='mt-3 text-sm leading-6 text-slate-600 sm:mt-4 sm:leading-7 sm:text-base'>Guru dan tenaga kependidikan yang mendampingi proses belajar murid.</p>
          </div>
          <div className='grid grid-cols-2 gap-3 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'>
            {staff.slice(0, 10).map((person, index) => (
              <article key={person.name} className={`${index < 4 ? '' : index < 6 ? 'hidden lg:block ' : 'hidden xl:block '}rounded-2xl border border-sky-100 bg-white p-3 sm:p-4 shadow-[0_8px_24px_-18px_rgba(15,23,42,.25)] transition hover:-translate-y-1 hover:shadow-lg`}>
                <Image unoptimized src={person.image} alt={`Foto ${person.name}`} width={415} height={393} className='hidden aspect-square w-full rounded-xl object-cover object-top sm:block' />
                <h3 className='text-sm font-bold leading-snug sm:truncate sm:text-base text-school-navy sm:mt-4' title={person.name}>{person.name}</h3>
                <p className='mt-1 text-xs font-semibold sm:min-h-5 sm:truncate sm:text-sm text-school-blue' title={person.role}>{person.role}</p>
              </article>
            ))}
          </div>
          <div className='mt-4 text-center sm:mt-6'>
            <Link href='/guru' className='inline-flex items-center gap-2 rounded-full border border-sky-200 bg-white px-5 py-3 text-sm font-bold text-school-blue transition hover:border-school-blue hover:bg-sky-50'>Lihat lebih banyak <span aria-hidden='true'>→</span></Link>
          </div>
        </div>
      </section>

      <section id='peminatan' className='bg-[#f7f9fc] pb-10 pt-6 sm:pb-24 sm:pt-8'>
        <div className='mx-auto max-w-6xl px-5 sm:px-8 lg:px-10'>
          <div className='mx-auto mb-6 max-w-2xl text-center sm:mb-12'>
            <h2 className='text-2xl font-black tracking-tight text-school-navy sm:text-4xl'>Kegiatan <span className='text-sky-600'>Pembiasaan</span></h2>
            <p className='mt-3 text-sm leading-6 text-slate-600 sm:mt-4 sm:leading-7 sm:text-base'>Ruang untuk mendalami minat, mengasah keterampilan, dan mencoba hal baru.</p>
          </div>
          <div className='grid gap-2.5 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4'>
            {interests.map((interest, index) => (
              <article key={interest.title} className='overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[0_8px_24px_-18px_rgba(15,23,42,.25)]'>
                <div className='hidden sm:block'><InterestIllustration index={index} /></div>
                <div className='p-3.5 sm:p-5'><h3 className='text-[15px] font-bold leading-snug text-school-navy sm:text-base'>{interest.title}</h3><p className='mt-1 text-[13px] leading-5 text-slate-500 sm:mt-2 sm:text-sm sm:leading-6'>{interest.text}</p></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {showLearningEnvironment && <section id='fasilitas' className='bg-white py-8 sm:py-24'>
        <div className='mx-auto max-w-7xl px-5 sm:px-8 lg:px-10'>
          <div className='flex flex-col gap-3 sm:gap-5 md:flex-row md:items-end md:justify-between'>
            <div className='max-w-2xl'>
              <h2 className='mt-3 text-2xl font-black leading-tight sm:mt-4 tracking-tight text-school-navy sm:text-4xl'>Ruang untuk belajar, berkolaborasi, dan berkembang.</h2>
            </div>
            <p className='max-w-md text-sm leading-6 text-slate-600 sm:text-base sm:leading-7'>Setiap sudut sekolah dapat menjadi bagian dari pengalaman belajar yang menyenangkan dan aman.</p>
          </div>
          <div className='mt-5 sm:mt-10'>
            <LearningEnvironmentGallery />
          </div>
          <Link href='/fasilitas' className='mt-4 inline-flex sm:mt-6 items-center gap-2 text-sm font-bold text-school-blue hover:text-school-navy'>Lihat fasilitas sekolah <span aria-hidden='true'>→</span></Link>
        </div>
      </section>}

      <section id='ppdb' className='bg-gradient-to-br from-white via-[#f8fbff] to-[#edf6ff] px-5 py-8 sm:px-8 sm:py-20 lg:px-10'>
        <div className='relative mx-auto grid max-w-7xl items-center overflow-hidden rounded-[1.5rem] border border-slate-100 bg-white px-4 py-5 shadow-[0_18px_55px_-35px_rgba(16,45,78,.28)] sm:px-12 sm:py-14 lg:grid-cols-[1fr_.82fr] lg:px-16'>
          <div aria-hidden='true' className='pointer-events-none absolute -left-36 bottom-[-14rem] h-80 w-80 rounded-full bg-sky-100/70 blur-3xl' />
          <div className='relative z-10 max-w-2xl'>
            <p className='text-xs font-extrabold uppercase tracking-[0.2em] text-school-blue'>SPMB Tahun Ajaran {spmbAcademicYear}</p>
            <h2 className='mt-4 text-2xl font-black leading-tight text-school-navy sm:text-4xl'>Mulai perjalanan belajar anak bersama SMPIT Cendekia.</h2>
            <p className='mt-3 max-w-xl text-sm leading-6 sm:mt-4 sm:text-base sm:leading-7 text-slate-600'>Hubungi sekolah untuk memperoleh informasi mengenai proses pendaftaran, jadwal, dan persyaratan yang berlaku.</p>
            <div className='mt-4 flex flex-wrap gap-2 sm:mt-7 sm:gap-3'>
              <Link href='/spmb' className='inline-flex items-center justify-center gap-2 rounded-xl bg-school-blue px-3 py-2.5 text-xs font-bold sm:px-5 sm:py-3 sm:text-base text-white shadow-[0_12px_24px_-12px_rgba(30,101,168,.55)] transition hover:-translate-y-0.5 hover:bg-school-navy'>Informasi SPMB <span aria-hidden='true'>→</span></Link>
              <a href='#kontak' className='inline-flex items-center justify-center rounded-xl border border-sky-200 bg-white px-3 py-2.5 text-xs font-bold sm:px-5 sm:py-3 sm:text-base text-school-navy transition hover:border-sky-400 hover:bg-sky-50'>Hubungi sekolah</a>
            </div>
          </div>
          <div className='relative mx-auto mt-8 hidden w-full max-w-[420px] items-center justify-center sm:flex lg:mt-0'>
            <Image src='/images/school/siswa-ppdb-formulir.png' alt={`Dua murid membawa formulir SPMB SMPIT Cendekia ${spmbAcademicYear}`} width={1024} height={1536} className='h-[360px] w-auto max-w-full rounded-xl object-contain drop-shadow-[0_18px_28px_rgba(16,45,78,.16)] sm:h-[420px]' />
          </div>
        </div>
      </section>

      <section id='kontak' className='bg-[#f3f9ff] py-8 sm:py-20'>
        <div className='mx-auto grid max-w-7xl gap-3 px-5 sm:gap-5 sm:px-8 lg:grid-cols-[.82fr_1.18fr] lg:gap-6 lg:px-10'>
          <article className='rounded-2xl border border-sky-100 bg-white p-4 text-school-navy shadow-[0_18px_48px_-34px_rgba(16,45,78,.3)] sm:p-9'>
            <p className='text-[10px] font-extrabold uppercase tracking-[0.2em] text-school-blue'>Lokasi sekolah</p>
            <h2 className='mt-4 text-2xl font-black leading-tight text-school-navy sm:text-3xl'>Lokasi SMPIT Cendekia</h2>
            <p className='mt-3 hidden text-sm leading-6 text-slate-600 sm:block'>Kami menyambut keluarga yang ingin mengenal lingkungan belajar Cendekia lebih dekat.</p>
            <div className='my-3 border-t border-sky-100 sm:my-5' />
            <div className='flex gap-3'>
              <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-100 bg-sky-50 text-school-blue'><svg viewBox='0 0 24 24' className='h-5 w-5 fill-none stroke-current' aria-hidden='true'><path d='M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z' strokeWidth='1.8'/><circle cx='12' cy='10' r='2.5' strokeWidth='1.8'/></svg></span>
              <div><h3 className='text-sm font-bold'>Alamat</h3><p className='mt-1 text-sm leading-6 text-slate-600'>{contact.address}</p></div>
            </div>
            <div className='mt-5 hidden overflow-hidden rounded-lg border border-sky-100 sm:block'>
              <iframe title='Peta lokasi SMPIT Cendekia Purwakarta' src='https://www.google.com/maps?q=-6.5323,107.4465&z=16&output=embed' className='h-40 w-full border-0 sm:h-44' loading='lazy' referrerPolicy='no-referrer-when-downgrade' allowFullScreen />
            </div>
            <a href='https://www.google.com/maps/search/?api=1&query=-6.5323%2C107.4465' target='_blank' rel='noreferrer' className='mt-3 inline-flex items-center gap-2 text-sm font-bold text-school-blue transition hover:text-school-navy'>Buka di Google Maps <span aria-hidden='true'>↗</span></a>
          </article>
          <article id='hubungi-kami' className='scroll-mt-24 rounded-2xl border border-sky-100 bg-white p-4 shadow-[0_18px_48px_-34px_rgba(16,45,78,.3)] sm:p-9'>
            <p className='text-[10px] font-extrabold uppercase tracking-[0.2em] text-school-blue'>Hubungi kami</p>
            <h2 className='mt-3 text-2xl font-black tracking-tight text-school-navy sm:text-3xl'>Mari berbincang tentang pendidikan anak.</h2>
            <p className='mt-3 hidden max-w-xl text-sm leading-6 text-slate-600 sm:block sm:text-base'>Tim sekolah siap membantu menjawab pertanyaan seputar program belajar dan penerimaan murid baru.</p>
            {contact.email && <div className='mt-3 border-t border-sky-100 pt-3 sm:mt-6 sm:pt-5'>
              <div className='flex flex-col gap-2 rounded-xl border border-sky-100 bg-[#f7fbff] p-3 sm:flex-row sm:items-center sm:justify-between sm:p-5'>
                <div className='flex gap-3'>
                  <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100'><svg viewBox='0 0 24 24' className='h-6 w-6 fill-none' aria-hidden='true'><path d='M3.5 7v11' stroke='#4285F4' strokeWidth='2.5' strokeLinecap='round'/><path d='m3.5 7 8.5 6.5L20.5 7' stroke='#EA4335' strokeWidth='2.5' strokeLinecap='round' strokeLinejoin='round'/><path d='M20.5 7v11' stroke='#34A853' strokeWidth='2.5' strokeLinecap='round'/><path d='M3.5 7 6 9' stroke='#FBBC04' strokeWidth='2.5' strokeLinecap='round'/></svg></span>
                  <div className='min-w-0'><h3 className='text-sm font-bold text-school-navy'>Email sekretariat</h3><a href={contact.email ? `mailto:${contact.email}` : undefined} className='mt-1 inline-block break-all text-sm text-school-blue hover:underline'>{contact.email}</a></div>
                </div>
                <a href={contact.email ? `mailto:${contact.email}` : undefined} className='hidden shrink-0 items-center justify-center gap-2 rounded-lg bg-school-blue sm:inline-flex px-4 py-3 text-sm font-bold text-white transition hover:bg-school-navy'>Kirim email <span aria-hidden='true'>→</span></a>
              </div>
            </div>}
            {contact.whatsappNumber && <div className='mt-3 flex flex-col gap-2 rounded-xl border border-sky-100 bg-[#f7fbff] p-3 sm:flex-row sm:items-center sm:justify-between sm:p-5'>
              <div className='flex gap-3'>
                <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100'><svg viewBox='0 0 24 24' className='h-6 w-6 fill-none' aria-hidden='true'><path d='M5 3h4l2 5-3 2a15 15 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2Z' stroke='#1769C2' strokeWidth='1.9' strokeLinejoin='round'/><path d='M15.8 4.2a6 6 0 0 1 4 4' stroke='#19A7E0' strokeWidth='1.7' strokeLinecap='round'/></svg></span>
                <div className='min-w-0'><h3 className='text-sm font-bold text-school-navy'>Telepon / WhatsApp</h3><a href={whatsapp} target='_blank' rel='noopener noreferrer' className='mt-1 inline-block text-sm text-school-blue hover:underline'>{contact.whatsappNumber}</a></div>
              </div>
              <a href={whatsapp} target='_blank' rel='noopener noreferrer' className='hidden shrink-0 items-center justify-center gap-2 rounded-lg bg-school-blue px-4 py-3 text-sm font-bold text-white transition hover:bg-school-navy sm:inline-flex'>Hubungi WhatsApp <span aria-hidden='true'>&#8594;</span></a>
            </div>}
          </article>
        </div>
      </section>
    </main>
  )
}
