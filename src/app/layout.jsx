import './globals.css'
import { CartProvider } from '@/context/CartContext'
import CartSidebar from '@/components/CartSidebar'

export const metadata = {
  title: 'Product Catalog',
  description: 'Manage and share your product catalog',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 font-inter antialiased">
        <CartProvider>
          {children}
          <CartSidebar />
        </CartProvider>
      </body>
    </html>
  )
}
