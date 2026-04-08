import { NextResponse } from 'next/server'
import { readProducts, addProduct, updateProductById } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const products = await readProducts()
    console.log('API returning products:', products)
    console.log('API products count:', products.length)
    return Response.json(products)
  } catch (err) {
    console.error('API error:', err)
    return Response.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    
    // Ensure required fields and totalQuantity is properly set
    const productData = {
      name: data.name || 'Untitled Product',
      price: data.price || '',
      category: data.category || 'unbranded',
      description: data.description || '',
      images: data.images || [],
      totalQuantity: data.totalQuantity !== undefined ? parseInt(data.totalQuantity) || 0 : 0,
      size: data.size || '',
      pcsPerCarton: data.pcsPerCarton || '',
      deliveryTime: data.deliveryTime || '',
    }
    
    const product = await addProduct(productData)
    return Response.json(product, { status: 201 })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
