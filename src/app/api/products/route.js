import { NextResponse } from 'next/server'
import { readProducts, addProduct } from '@/lib/db'

// GET /api/products
export async function GET() {
  try {
    const products = await readProducts()
    return NextResponse.json(products)
  } catch (err) {
    console.error('Failed to fetch products:', err.message)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
}

// POST /api/products
export async function POST(request) {
  try {
    const body = await request.json()
    const { name, price, category, description, images, availableQuantity, size, pcsPerCarton } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'name is required' }, { status: 400 })
    }

    const product = await addProduct({
      name: name.trim(),
      price: price?.trim() || '',
      category: category || 'unbranded',
      description: description?.trim() || '',
      images: Array.isArray(images) ? images : [],
      availableQuantity: availableQuantity || '',
      size: size || '',
      pcsPerCarton: pcsPerCarton || '',
    })

    return NextResponse.json(product, { status: 201 })
  } catch (err) {
    console.error('Failed to create product:', err.message)
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 })
  }
}
