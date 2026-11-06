import Image from "next/image";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import YkkBrand from "@/components/brand/YkkBrand";
import Link from "next/link";
import React from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <div className="relative z-1 min-h-screen bg-gray-50 dark:bg-gray-950">
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[linear-gradient(135deg,#ffffff_0%,#f5fcff_45%,#eefaff_100%)] dark:bg-[linear-gradient(135deg,#071a30_0%,#102d4e_55%,#163d68_100%)] lg:flex-row">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(41,111,180,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(41,111,180,0.06)_1px,transparent_1px)] bg-[size:56px_56px] dark:opacity-30" />
      {children}
      <aside className="school-auth-story" aria-label="Tentang portal sekolah">
        <div className="school-auth-grid" aria-hidden="true" />
        <Image src="/cendekia-logo-hd.png" alt="" width={560} height={560} unoptimized className="school-auth-watermark" aria-hidden="true" />
        <div className="school-auth-content">
          <div className="school-auth-identity"><Link href="/signin"><YkkBrand inverted /></Link><span>PURWAKARTA</span></div>
          <div className="school-auth-message">
            <p className="school-auth-eyebrow"><span /> PORTAL ADMINISTRATOR</p>
            <h2>Setiap cerita,<br />menginspirasi<span>.</span></h2>
            <p className="school-auth-description">Dari ruang kelas hingga prestasi siswa.<br />Bagikan kabar baik dan tumbuhkan kedekatan<br className="school-auth-wide-break" /> dengan keluarga besar Cendekia.</p>
            <div className="school-auth-topics" aria-label="Informasi sekolah yang dikelola">
              <div><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h14v16H5zM8 8h8M8 12h8M8 16h4" /></svg><span>Informasi<br /><strong>terkini</strong></span></div>
              <div><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3h8v5a4 4 0 0 1-8 0V3ZM8 5H4v2a4 4 0 0 0 4 4M16 5h4v2a4 4 0 0 1-4 4M12 12v6M8 21h8M10 18h4" /></svg><span>Prestasi<br /><strong>membanggakan</strong></span></div>
              <div><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 5c3-1 6 0 9 2 3-2 6-3 9-2v14c-3-1-6 0-9 2-3-2-6-3-9-2V5ZM12 7v14" /></svg><span>Cerita<br /><strong>bermakna</strong></span></div>
            </div>
          </div>
          <div className="school-auth-motto"><span aria-hidden="true" /><p>Unggul dalam Bina<br /><strong>Iman, Ilmu dan Amal.</strong></p><span className="school-auth-motto-mark" aria-hidden="true">&#10022;</span></div>
        </div>
      </aside>
      <div className="fixed bottom-6 right-6 z-50 hidden sm:block"><ThemeTogglerTwo /></div>
    </div>
  </div>;
}
