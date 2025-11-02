"use client"

import Link from "next/link"

export function Header() {
  return (
    <header className="fixed top-0 w-full z-50 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="text-2xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent"
        >
          Clutch Calc
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/" className="text-sm font-medium hover:text-primary transition">
            Home
          </Link>
          <Link href="/analysis" className="text-sm font-medium hover:text-primary transition">
            Analysis
          </Link>
        </nav>
      </div>
    </header>
  )
}
