import './globals.css'
import { LenisProvider } from '@/components/LenisProvider'

export const metadata = {
  title: 'Product Catalog',
  description: 'Manage and share your product catalog',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 font-sans antialiased">
        <LenisProvider>
          {children}
        </LenisProvider>
      </body>
    </html>
  )
}
