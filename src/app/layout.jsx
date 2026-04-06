import './globals.css'
import { ClerkProvider } from '@clerk/nextjs'
import { CartProvider } from '@/context/CartContext'
import CartSidebar from '@/components/CartSidebar'
import FloatingCartButton from '@/components/FloatingCartButton'
import AdminHeader from '@/components/AdminHeader'

export const metadata = {
  title: 'Product Catalog',
  description: 'Manage and share your product catalog',
}

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-gray-50 text-gray-900 font-inter antialiased">
          <CartProvider>
            <AdminHeader />
            {children}
            <CartSidebar />
            <FloatingCartButton />
          </CartProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
