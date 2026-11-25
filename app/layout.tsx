import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from 'sonner';
import { Navbar } from '@/components/navbar'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: '习惯打卡',
  description: '保持好习惯，赚取积分',
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-full flex flex-col">
      <Navbar /> 
      <main className="min-h-screen pb-20 md:pb-0">
          {children}
      </main>
        {/* position 可以选 top-center, bottom-right 等 */}
        <Toaster position="top-center" richColors />
      </body> 
    </html>
  );
}
