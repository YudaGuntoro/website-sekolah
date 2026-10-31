import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/app/components/Layout/Header'
import Footer from '@/app/components/Layout/Footer'
import ScrollToTop from '@/app/components/ScrollToTop'
import ContactBubble from '@/app/components/ContactBubble'

const font = Inter({ subsets: ['latin'] })

export const metadata = {
  title: {
    default: 'SMPIT Cendekia Purwakarta',
    template: '%s | SMPIT Cendekia Purwakarta',
  },
  description: 'SMPIT Cendekia Purwakarta - Unggul dalam Bina Iman, Ilmu dan Amal.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='id' data-scroll-behavior='smooth'>
      <body className={font.className}>
        <Header />
        {children}
        <Footer />
        <ContactBubble />
        <ScrollToTop />
      </body>
    </html>
  )
}
