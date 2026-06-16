import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '@/components/providers/AuthProvider'

export const metadata: Metadata = {
  title: 'BudgetAI — Smart Finance',
  description: 'Premium personal finance and budget tracking app',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full" style={{ colorScheme: 'light', backgroundColor: '#F5F0E8' }}>
      <body className="h-full" style={{ backgroundColor: '#F5F0E8' }}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
