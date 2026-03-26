import { notFound } from 'next/navigation'
import ProductImageGallery from '@/components/ProductImageGallery'
import ProductDetails from '@/components/ProductDetails'
import InquiryButton from '@/components/InquiryButton'
import { getProductById } from '@/lib/db'

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
              <a href="/catalog" className="hover:text-gray-700">Catalog</a>
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

            {/* Right Column: Product Details */}
            <div className="space-y-6">
              <ProductDetails product={product} />
            </div>
          </div>

          {/* Inquiry Section - Full Width */}
          <div className="mt-8">
            <InquiryButton productName={product.name} />
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error('Error loading product:', error)
    notFound()
  }
}
