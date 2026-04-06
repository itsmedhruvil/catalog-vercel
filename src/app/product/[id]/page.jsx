import { notFound } from 'next/navigation'
import Link from 'next/link'
import ProductImageGallery from '@/components/ProductImageGallery'
import ProductDetails from '@/components/ProductDetails'
import AddToCartButton from '@/components/AddToCartButton'
import ProductPageActions from '@/components/ProductPageActions'
import { getProductById } from '@/lib/db'
import { isAdminMode } from '@/lib/admin'
import { Edit2 } from 'lucide-react'

export default async function ProductPage({ params }) {
  const { id } = await params
  
  try {
    // Fetch the specific product directly from the database
    const product = await getProductById(id)
    
    if (!product) {
      notFound()
    }

    return (
      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center space-x-2 text-sm text-gray-500">
              <Link href="/catalog" className="hover:text-gray-700">Catalog</Link>
              <span>›</span>
              <span className="text-gray-900 font-medium">{product.name}</span>
            </nav>
          </div>
        </div>

        {/* Product Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 2-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column: Image Gallery */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <ProductImageGallery 
                images={product.images || []}
                productName={product.name}
                imageFit="contain"
              />
            </div>

            {/* Right Column: Product Details + Add to Cart */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <ProductDetails product={product} />
                {isAdminMode() && (
                  <button
                    onClick={() => {
                      // Navigate back to catalog with edit modal open
                      window.location.href = `/catalog?edit=${product.id}`
                    }}
                    className="ml-4 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shrink-0"
                    title="Edit Product"
                  >
                    <Edit2 size={20} />
                  </button>
                )}
              </div>
              
              {/* Add to Cart Section - Only visible for non-admin users */}
              {!isAdminMode() && <AddToCartButton product={product} variant="default" />}
            </div>
          </div>

          {/* Action Buttons Section - Full Width */}
          <ProductPageActions 
            productName={product.name}
            productId={product.id}
          />
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading product:', error)
    notFound()
  }
}
