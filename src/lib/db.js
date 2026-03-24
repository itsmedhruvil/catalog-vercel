import mongoose from 'mongoose'

// ─── Connection (cached across hot-reloads in dev) ────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('Missing MONGODB_URI environment variable')
}

let cached = global._mongoose || { conn: null, promise: null }
global._mongoose = cached

async function connectDB() {
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
    name:        { type: String, required: true, trim: true },
    price:       { type: String, default: '' },
    category:    { type: String, enum: ['branded', 'unbranded'], default: 'unbranded' },
    description: { type: String, default: '' },
    images:      { type: [String], default: [] },
    quantity:    { type: Number, default: 0, min: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_, ret) {
        ret.id = ret._id.toString()
        delete ret._id
        delete ret.__v
        return ret
      },
    },
  }
)

const Product = mongoose.models.Product || mongoose.model('Product', productSchema)

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
