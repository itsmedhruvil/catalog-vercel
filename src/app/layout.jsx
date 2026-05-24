import './globals.css'
import RootLayoutClient from '@/components/RootLayoutClient'
import PWAInstallPrompt from '@/components/PWAInstallPrompt'
import PWARegistration from '@/components/PWARegistration'

export const metadata = {
  title: 'Product Catalog',
  description: 'Manage and share your product catalog',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'Product Catalog',
    'msapplication-TileColor': '#4F46E5',
    'msapplication-TileImage': '/icons/icon-192.png',
    'msapplication-config': 'none',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#4F46E5" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Product Catalog" />
        <meta name="msapplication-TileColor" content="#4F46E5" />
        <meta name="msapplication-TileImage" content="/icons/icon-192.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icons/icon-512.png" />
      </head>
      <body className="bg-gray-50 text-gray-900 font-inter antialiased">
        <RootLayoutClient>
          {children}
        </RootLayoutClient>
        <PWAInstallPrompt />
        <PWARegistration />
      </body>
    </html>
  )
}
