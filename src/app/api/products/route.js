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
    
    // Ensure totalQuantity is properly set (default to 0 if not provided)
    // This is the single source of truth for stock tracking
    const productData = {
      ...data,
      totalQuantity: data.totalQuantity !== undefined ? parseInt(data.totalQuantity) || 0 : 0,
      salesLast30Days: data.salesLast30Days || 0,
      salesPrevious30Days: data.salesPrevious30Days || 0,
      totalSales: data.totalSales || 0,
      views: data.views || 0,
      lastSoldAt: data.lastSoldAt || null,
      holds: data.holds || [],
      reorderLevel: data.reorderLevel || 0,
      reorderQuantity: data.reorderQuantity || 0,
      conversionRate: data.conversionRate || 0,
      returnRate: data.returnRate || 0,
      avgDeliveryTime: data.avgDeliveryTime || 0,
      customerReviews: data.customerReviews || [],
      avgRating: data.avgRating || 0,
      supplier: data.supplier || '',
      supplierContact: data.supplierContact || '',
      supplierLeadTime: data.supplierLeadTime || 0,
      warehouseLocation: data.warehouseLocation || '',
      binLocation: data.binLocation || '',
      batchNumber: data.batchNumber || '',
      expiryDate: data.expiryDate || null,
      tags: data.tags || [],
      priority: data.priority || 'medium',
      isFeatured: data.isFeatured || false,
      deliveryStatus: data.deliveryStatus || 'pending',
      deliveryTracking: data.deliveryTracking || '',
      deliveryNotes: data.deliveryNotes || '',
      estimatedDelivery: data.estimatedDelivery || null,
    }
    
    const product = await addProduct(productData)
    return Response.json(product, { status: 201 })
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 })
  }
}
