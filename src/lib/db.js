import mongoose from 'mongoose'

// ─── Connection (cached across hot-reloads in dev) ────────────────────────────
let cached = global._mongoose || { conn: null, promise: null }
global._mongoose = cached

async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI
  
  if (!MONGODB_URI) {
    throw new Error('Missing MONGODB_URI environment variable')
  }

  if (cached.conn) return cached.conn
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).catch(err => {
      console.error('MongoDB connection error:', err.message)
      cached.promise = null
      throw err
    })
  }
  try {
    cached.conn = await cached.promise
    return cached.conn
  } catch (err) {
    cached.promise = null
    throw err
  }
}

// ─── Schema ───────────────────────────────────────────────────────────────────
const productSchema = new mongoose.Schema(
  {
    name:            { type: String, required: true, trim: true },
    price:           { type: String, default: '' },
    category:        { type: String, enum: ['branded', 'unbranded'], default: 'unbranded' },
    description:     { type: String, default: '' },
    images:          { type: [String], default: [] },
    availableQuantity: { type: String, default: '' },
    totalQuantity: { type: Number, default: 0 },
    size:            { type: String, default: '' },
    pcsPerCarton:    { type: String, default: '' },
    
    // Delivery Management Fields
    deliveryTime:    { type: String, default: '' },
    deliveryStatus:  { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
    deliveryTracking: { type: String, default: '' },
    deliveryNotes:   { type: String, default: '' },
    estimatedDelivery: { type: Date },
    
    // Analytics Fields
    salesLast30Days: { type: Number, default: 0 },
    salesPrevious30Days: { type: Number, default: 0 },
    totalSales:      { type: Number, default: 0 },
    views:           { type: Number, default: 0 },
    lastSoldAt:      { type: Date },
    createdAt:       { type: Date, default: Date.now },
    
    // Inventory Analytics
    holds:           { type: [{ id: String, customer: String, quantity: String }], default: [] },
    reorderLevel:    { type: Number, default: 0 },
    reorderQuantity: { type: Number, default: 0 },
    
    // Performance Metrics
    conversionRate:  { type: Number, default: 0 },
    returnRate:      { type: Number, default: 0 },
    avgDeliveryTime: { type: Number, default: 0 }, // in days
    
    // Customer Analytics
    customerReviews: { type: [{ rating: Number, comment: String, date: Date, customerName: String }], default: [] },
    avgRating:       { type: Number, default: 0 },
    
    // Supplier Information
    supplier:        { type: String, default: '' },
    supplierContact: { type: String, default: '' },
    supplierLeadTime: { type: Number, default: 0 }, // in days
    
    // Warehouse Management
    warehouseLocation: { type: String, default: '' },
    binLocation:       { type: String, default: '' },
    batchNumber:       { type: String, default: '' },
    expiryDate:        { type: Date },
    
    // Tags and Classification
    tags:              { type: [String], default: [] },
    priority:          { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    isFeatured:        { type: Boolean, default: false },
    
    // Activity Log for tracking stock changes and other events
    activityLog: [{
      type: { type: String, enum: ['stock_reduction', 'stock_increase', 'order_confirmed', 'order_cancelled', 'manual_adjustment'], default: 'manual_adjustment' },
      quantity: { type: Number, default: 0 },
      reason: { type: String, default: '' },
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
      orderNumber: { type: String },
      timestamp: { type: Date, default: Date.now },
      updatedBy: { type: String, default: 'system' }
    }],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_, ret) {
        ret.id = ret._id.toString()
        delete ret._id
        delete ret.__v
        // Convert nested ObjectId values to strings (e.g., in activityLog)
        if (ret.activityLog && Array.isArray(ret.activityLog)) {
          ret.activityLog = ret.activityLog.map(entry => {
            const cleanEntry = {}
            // Copy all fields, converting ObjectId and Date to strings where needed
            for (const key in entry) {
              if (key === '_id') continue // Skip _id
              if (key === 'orderId' && entry[key]) {
                cleanEntry[key] = entry[key].toString()
              } else if (key === 'timestamp' && entry[key]) {
                cleanEntry[key] = entry[key].toISOString()
              } else {
                cleanEntry[key] = entry[key]
              }
            }
            return cleanEntry
          })
        }
        return ret
      },
    },
  }
)

const Product = mongoose.models.Product || mongoose.model('Product', productSchema)

// Export Product for use in other modules (like orderSchema.js)
export { Product }

// ─── DB helpers ───────────────────────────────────────────────────────────────

export async function readProducts() {
  await connectDB()
  const products = await Product.find().sort({ createdAt: -1 })
  return products.map(p => p.toJSON())
}

export async function getProductById(id) {
  await connectDB()
  try {
    const product = await Product.findById(id)
    return product ? product.toJSON() : null
  } catch {
    return null
  }
}

export async function addProduct(data) {
  await connectDB()
  const product = await Product.create(data)
  return product.toJSON()
}

export async function updateProductById(id, updates) {
  await connectDB()
  try {
    const product = await Product.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    )
    return product ? product.toJSON() : null
  } catch {
    return null
  }
}

export async function deleteProductById(id) {
  await connectDB()
  try {
    const result = await Product.findByIdAndDelete(id)
    return !!result
  } catch {
    return false
  }
}
