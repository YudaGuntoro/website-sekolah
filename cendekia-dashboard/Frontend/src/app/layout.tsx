import type { Metadata } from 'next';
import './globals.css';
import './cms.css';
import './spmb.css';
import './auth-story.css';
import "flatpickr/dist/flatpickr.css";
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ToastProvider } from '@/context/ToastContext';

// All application pages render per request; static files keep their own cache policy.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: {
    default: "SMPIT Cendekia",
    template: "%s | SMPIT Cendekia",
  },
  description: "Dashboard pengelola konten SMPIT Cendekia Purwakarta.",
  icons: {
    apple: "/cendekia-logo-hd.png",
    icon: { url: "/icon.png?v=cendekia-2", type: "image/png", sizes: "256x256" },
    shortcut: "/favicon.ico?v=cendekia-2",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="font-outfit dark:bg-gray-900">
        <ThemeProvider>
          <ToastProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
