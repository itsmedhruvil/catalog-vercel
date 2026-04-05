import mongoose from 'mongoose'

// ─── Customer Schema ─────────────────────────────────────────────────────────────
const customerSchema = new mongoose.Schema(
  {
    // Basic Information
    name: { type: String, required: true, trim: true },
    email: { 
      type: String, 
      required: true, 
      lowercase: true, 
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
    },
    phone: { 
      type: String, 
      required: true, 
      trim: true 
    },
    alternatePhone: { type: String, trim: true },
    
    // Address Information
    addresses: [{
      label: { type: String, default: 'Home' }, // Home, Office, etc.
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'India' },
      isDefault: { type: Boolean, default: false }
    }],
    
    // Customer Type
    customerType: {
      type: String,
      enum: ['retail', 'wholesale', 'vip', 'corporate'],
      default: 'retail'
    },
    
    // Company Information (for corporate/wholesale)
    companyName: { type: String, trim: true },
    gstNumber: { type: String, trim: true, uppercase: true },
    panNumber: { type: String, trim: true, uppercase: true },
    
    // Preferences
    preferredPaymentMethod: {
      type: String,
      enum: ['cash', 'card', 'online', 'upi', 'cod'],
      default: 'cod'
    },
    preferredDeliveryMethod: {
      type: String,
      enum: ['standard', 'express', 'pickup'],
      default: 'standard'
    },
    notes: { type: String, default: '' },
    
    // Statistics
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    avgOrderValue: { type: Number, default: 0 },
    lastOrderDate: { type: Date },
    
    // Status
    isActive: { type: Boolean, default: true },
    isBlacklisted: { type: Boolean, default: false },
    blacklistReason: { type: String },
    
    // Tags for segmentation
    tags: [String],
    
    // Source
    source: {
      type: String,
      enum: ['website', 'admin', 'import', 'api'],
      default: 'admin'
    },
    
    // WhatsApp opt-in
    whatsappOptIn: { type: Boolean, default: true },
    emailOptIn: { type: Boolean, default: true }
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

// Indexes for performance
customerSchema.index({ email: 1 }, { unique: true })
customerSchema.index({ phone: 1 })
customerSchema.index({ name: 'text' })
customerSchema.index({ isActive: 1 })
customerSchema.index({ customerType: 1 })

// Virtual for full address
customerSchema.virtual('primaryAddress').get(function() {
  return this.addresses?.find(addr => addr.isDefault) || this.addresses?.[0]
})

// Pre-save middleware to update statistics
customerSchema.pre('save', function(next) {
  if (this.totalOrders > 0) {
    this.avgOrderValue = this.totalSpent / this.totalOrders
  }
  next()
})

const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema)

// ─── Customer DB helpers ─────────────────────────────────────────────────────────

async function connectDB() {
  const MONGODB_URI = process.env.MONGODB_URI
  
  if (!MONGODB_URI) {
    throw new Error('Missing MONGODB_URI environment variable')
  }

  const mongoose = require('mongoose')
  let cached = global._mongoose || { conn: null, promise: null }
  global._mongoose = cached

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

export async function readCustomers() {
  await connectDB()
  return (await Customer.find().sort({ createdAt: -1 })).map(c => c.toJSON())
}

export async function getCustomerById(id) {
  await connectDB()
  try {
    const customer = await Customer.findById(id)
    return customer ? customer.toJSON() : null
  } catch {
    return null
  }
}

export async function getCustomerByEmail(email) {
  await connectDB()
  try {
    const customer = await Customer.findOne({ email: email.toLowerCase() })
    return customer ? customer.toJSON() : null
  } catch {
    return null
  }
}

export async function getCustomerByPhone(phone) {
  await connectDB()
  try {
    const customer = await Customer.findOne({ phone })
    return customer ? customer.toJSON() : null
  } catch {
    return null
  }
}

export async function searchCustomers(query) {
  await connectDB()
  try {
    const customers = await Customer.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 })
    return customers.map(c => c.toJSON())
  } catch {
    return []
  }
}

export async function createCustomer(data) {
  await connectDB()
  const customer = await Customer.create(data)
  return customer.toJSON()
}

export async function updateCustomerById(id, updates) {
  await connectDB()
  try {
    const customer = await Customer.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    )
    return customer ? customer.toJSON() : null
  } catch {
    return null
  }
}

export async function deleteCustomerById(id) {
  await connectDB()
  try {
    const result = await Customer.findByIdAndDelete(id)
    return !!result
  } catch {
    return false
  }
}

export async function getCustomerStats() {
  await connectDB()
  
  const totalCustomers = await Customer.countDocuments()
  const activeCustomers = await Customer.countDocuments({ isActive: true })
  const customerTypes = await Customer.aggregate([
    { $group: { _id: '$customerType', count: { $sum: 1 } } }
  ])
  const topCustomers = await Customer.find()
    .sort({ totalSpent: -1 })
    .limit(10)
    .select('name email totalSpent totalOrders')
  
  return {
    totalCustomers,
    activeCustomers,
    customerTypes,
    topCustomers
  }
}

export default Customer