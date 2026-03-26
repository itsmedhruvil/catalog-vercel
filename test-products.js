// Simple test script to check database connection and products
import mongoose from 'mongoose'

// Connect to database
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/catalog'

async function testConnection() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Database connected successfully')
    
    // Check if Product model exists
    const Product = mongoose.models.Product || mongoose.model('Product', new mongoose.Schema({
      name: { type: String, required: true, trim: true },
      price: { type: String, default: '' },
      category: { type: String, enum: ['branded', 'unbranded'], default: 'unbranded' },
      description: { type: String, default: '' },
      images: { type: [String], default: [] },
      availableQuantity: { type: String, default: '' },
      size: { type: String, default: '' },
      pcsPerCarton: { type: String, default: '' },
    }))
    
    // Count products
    const count = await Product.countDocuments()
    console.log(`📊 Found ${count} products in database`)
    
    // Get first few products
    const products = await Product.find().limit(5)
    console.log('📋 Sample products:', products.map(p => ({ id: p._id, name: p.name, category: p.category })))
    
    await mongoose.disconnect()
    console.log('✅ Database disconnected')
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
  }
}

testConnection()