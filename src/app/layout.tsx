import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/providers/AuthProvider'

export const metadata: Metadata = {
  title: 'Budget Tracker — Smart Finance',
  description: 'Premium personal finance and budget tracking app',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" style={{ colorScheme: 'light', backgroundColor: '#f8fafc' }}>
      <body className="h-full bg-slate-50">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
