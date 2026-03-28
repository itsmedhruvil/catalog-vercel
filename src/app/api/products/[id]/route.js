import { NextResponse } from 'next/server'
import { getProductById, updateProductById, deleteProductById } from '@/lib/db'

// GET /api/products/:id
export async function GET(request, { params }) {
  try {
    const { id } = await params
    const product = await getProductById(id)
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(product)
  } catch (err) {
    console.error('Failed to fetch product:', err.message)
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 })
  }
}

// PUT /api/products/:id
export async function PUT(request, { params }) {
  try {
    const body = await request.json()
    const { id } = await params
    
    // Validate required fields
    const { name, description, price, category, images } = body
    
    if (!name || !description || !price || !category) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Prepare update data with all possible fields
    const updateData = {
      name,
      description,
      price,
      category,
      images,
      // Delivery Management Fields
      deliveryTime: body.deliveryTime,
      deliveryStatus: body.deliveryStatus,
      deliveryTracking: body.deliveryTracking,
      deliveryNotes: body.deliveryNotes,
      estimatedDelivery: body.estimatedDelivery,
      
      // Analytics Fields
      salesLast30Days: body.salesLast30Days,
      salesPrevious30Days: body.salesPrevious30Days,
      totalSales: body.totalSales,
      views: body.views,
      lastSoldAt: body.lastSoldAt,
      
      // Inventory Analytics
      holds: body.holds,
      reorderLevel: body.reorderLevel,
      reorderQuantity: body.reorderQuantity,
      
      // Performance Metrics
      conversionRate: body.conversionRate,
      returnRate: body.returnRate,
      avgDeliveryTime: body.avgDeliveryTime,
      
      // Customer Analytics
      customerReviews: body.customerReviews,
      avgRating: body.avgRating,
      
      // Supplier Information
      supplier: body.supplier,
      supplierContact: body.supplierContact,
      supplierLeadTime: body.supplierLeadTime,
      
      // Warehouse Management
      warehouseLocation: body.warehouseLocation,
      binLocation: body.binLocation,
      batchNumber: body.batchNumber,
      expiryDate: body.expiryDate,
      
      // Tags and Classification
      tags: body.tags,
      priority: body.priority,
      isFeatured: body.isFeatured,
    }
    
    // Update the product
    const updatedProduct = await updateProductById(id, updateData)
    
    if (!updatedProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }
    
    return NextResponse.json(updatedProduct)
  } catch (err) {
    console.error('Failed to update product:', err.message)
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 })
  }
}

// DELETE /api/products/:id
export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    const deleted = await deleteProductById(id)
    if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Failed to delete product:', err.message)
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 })
  }
}
