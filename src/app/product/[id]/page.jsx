import { notFound } from 'next/navigation'
import Link from 'next/link'
import ProductImageGallery from '@/components/ProductImageGallery'
import ProductDetails from '@/components/ProductDetails'
import AddToCartButton from '@/components/AddToCartButton'
import ProductPageActions from '@/components/ProductPageActions'
import { getProductById } from '@/lib/db'
import { Edit2 } from 'lucide-react'

export default async function ProductPage({ params }) {
  const { id } = await params
  
  try {
    // Fetch the specific product directly from the database
    let product = await getProductById(id)
    
    if (!product) {
      notFound()
    }

    // Clean product data for RSC serialization - remove fields with ObjectId
    // that can't be passed to client components
    const { activityLog, holds, ...cleanProduct } = product
    product = cleanProduct

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
              <ProductDetails product={product} />
              {/* Add to Cart Section */}
              <AddToCartButton product={product} variant="default" />
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
