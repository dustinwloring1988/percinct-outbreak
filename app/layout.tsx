import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

// <CHANGE> Updated metadata for the zombie game
export const metadata: Metadata = {
  title: "Precinct Outbreak - Zombie Survival",
  description:
    "A 2D top-down zombie shooter inspired by Black Ops Zombies. Survive the night in a police station overrun by the undead.",
  generator: "v0.app",
}

export const viewport: Viewport = {
  themeColor: "#1a1a22",
  width: "device-width",
  initialScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
