import './globals.css'
import RootLayoutClient from '@/components/RootLayoutClient'

export const metadata = {
  title: 'Product Catalog',
  description: 'Manage and share your product catalog',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 font-inter antialiased">
        <RootLayoutClient>
          {children}
        </RootLayoutClient>
      </body>
    </html>
  )
}
