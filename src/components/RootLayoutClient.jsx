'use client'

import { ClerkProvider } from '@clerk/nextjs'
import { CartProvider } from '@/context/CartContext'
import CartSidebar from '@/components/CartSidebar'
import FloatingCartButton from '@/components/FloatingCartButton'
import GlobalHeader from '@/components/GlobalHeader'

export default function RootLayoutClient({ children }) {
  return (
    <ClerkProvider>
      <CartProvider>
        <GlobalHeader />
        <main>
          {children}
        </main>
        <CartSidebar />
        <FloatingCartButton />
      </CartProvider>
    </ClerkProvider>
  )
}
