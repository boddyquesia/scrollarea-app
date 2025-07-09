import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

// Actualizar la metadata para producción
export const metadata: Metadata = {
  title: "VeciNet - Tu red de vecinos",
  description: "Conecta con tu comunidad local. Pide, ofrece, intercambia y vende en tu barrio.",
  keywords: "comunidad, vecinos, intercambio, local, Madrid",
  authors: [{ name: "VeciNet Team" }],
  openGraph: {
    title: "VeciNet - Tu red de vecinos",
    description: "Conecta con tu comunidad local",
    type: "website",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
