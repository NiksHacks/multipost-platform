import './globals.css'
import { Inter } from 'next/font/google'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Stratego Multi Post - Piattaforma Professionale Social Media',
  description: 'La piattaforma professionale per gestire e pubblicare contenuti su tutti i tuoi social media con JavaScript dinamico e CSS3 avanzato',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="it">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}