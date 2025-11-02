import type React from "react"
import type { Metadata } from "next"
import { Inter, Roboto_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const robotoMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Clutch Calc - NBA Prop Analysis",
  description: "Analyze your player props with precision and style",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${robotoMono.variable} font-sans antialiased`}>
        {children}
        <Analytics />
        <footer className="py-4 text-center text-gray-500 text-sm">
          Created by Mahdi Alsalami
        </footer>
      </body>
    </html>
  )
}
