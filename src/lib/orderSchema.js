import mongoose from 'mongoose'
import { Product } from './db.js'

// ─── Order Schema ─────────────────────────────────────────────────────────────
const orderSchema = new mongoose.Schema(
  {
    // Order Information
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      default: () => `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`
    },
    orderDate: {
      type: Date,
      default: Date.now
    },
    orderStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending'
    },
    orderType: {
      type: String,
      enum: ['online', 'phone', 'in-store', 'wholesale'],
      default: 'online'
    },
    
    // Customer Information
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
      }
    },
    
    // Product Items
    items: [{
      productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      productName: String,
      productImage: String,
      quantity: { type: Number, required: true, min: 1 },
      unitPrice: { type: Number, required: true },
      totalPrice: { type: Number, required: true },
      size: String,
      notes: String
    }],
    
    // Financial Information
    subtotal: { type: Number, required: true, default: 0 },
    tax: { type: Number, default: 0 },
    shipping: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true, default: 0 },
    currency: { type: String, default: 'INR' },
    
    // Payment Information
    payment: {
      method: { type: String, enum: ['cash', 'card', 'online', 'upi', 'cod'], default: 'cod' },
      status: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
      transactionId: String,
      paymentDate: Date,
      paymentReference: String
    },
    
    // Delivery Information
    delivery: {
      method: { type: String, enum: ['standard', 'express', 'pickup'], default: 'standard' },
      estimatedDate: Date,
      actualDate: Date,
      trackingNumber: String,
      trackingUrl: String,
      notes: String,
      deliveryInstructions: String
    },
    
    // Order Notes and History
    notes: { type: String, default: '' },
    internalNotes: { type: String, default: '' },
    
    // Status History for audit trail
    statusHistory: [{
      status: String,
      date: { type: Date, default: Date.now },
      notes: String,
      updatedBy: String
    }],
    
    // Metadata
    source: { type: String, default: 'admin' }, // admin, api, website
    tags: [String],
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    
    // Refund Information
    refund: {
      isRefunded: { type: Boolean, default: false },
      refundAmount: { type: Number, default: 0 },
      refundReason: String,
      refundDate: Date,
      refundNotes: String
    }
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
orderSchema.index({ orderDate: -1 })
orderSchema.index({ orderStatus: 1 })
orderSchema.index({ 'customer.email': 1 })
orderSchema.index({ 'customer.phone': 1 })
orderSchema.index({ 'payment.status': 1 })

// Virtual for order age
orderSchema.virtual('age').get(function() {
  const now = new Date()
  const orderDate = new Date(this.orderDate)
  const diffMs = now - orderDate
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  return diffDays
})

// Virtual for order summary
orderSchema.virtual('summary').get(function() {
  return {
    itemCount: this.items.length,
    totalItems: this.items.reduce((sum, item) => sum + item.quantity, 0),
    hasRefund: this.refund.isRefunded,
    isPaid: this.payment.status === 'paid',
    isDelivered: this.orderStatus === 'delivered'
  }
})

const Order = mongoose.models.Order || mongoose.model('Order', orderSchema)

// ─── Order DB helpers ─────────────────────────────────────────────────────────

export async function readOrders() {
  await connectDB()
  const orders = await Order.find()
    .populate('items.productId', 'name images')
    .sort({ orderDate: -1 })
  return orders.map(o => o.toJSON())
}

export async function getOrderById(id) {
  await connectDB()
  try {
    const order = await Order.findById(id)
      .populate('items.productId', 'name images')
    return order ? order.toJSON() : null
  } catch {
    return null
  }
}

export async function createOrder(data) {
  await connectDB()
  
  // Generate order number if not provided
  if (!data.orderNumber) {
    const timestamp = Date.now()
    const random = Math.floor(Math.random() * 10000)
    data.orderNumber = `ORD-${timestamp}-${random}`
  }
  
  // Calculate totals
  const subtotal = data.items.reduce((sum, item) => sum + item.totalPrice, 0)
  const totalAmount = subtotal + data.tax + data.shipping - data.discount
  
  const orderData = {
    ...data,
    subtotal,
    totalAmount
  }
  
  const order = await Order.create(orderData)
  
  // Add initial status history
  await Order.findByIdAndUpdate(order._id, {
    $push: {
      statusHistory: {
        status: order.orderStatus,
        notes: 'Order created',
        updatedBy: 'system'
      }
    }
  })
  
  return order.toJSON()
}

export async function updateOrderById(id, updates) {
  await connectDB()
  
  try {
    // Create a copy of updates without special fields and without statusHistory
    // (statusHistory is managed automatically, not manually updated)
    const { statusNotes, updatedBy, statusHistory, ...fieldUpdates } = updates
    
    // Get the current order to check if status is changing
    const currentOrder = await Order.findById(id);
    
    // Build the update object with proper MongoDB operators
    const updateOps = {
      $set: { ...fieldUpdates }
    }
    
    // Track if we need to reduce stock (when status changes to 'confirmed')
    const isStatusChangingToConfirmed = updates.orderStatus === 'confirmed' && 
                                         currentOrder && 
                                         currentOrder.orderStatus !== 'confirmed';
    
    // Track activity for logging
    const activities = [];
    
    // If status is being updated, add to status history
    if (updates.orderStatus) {
      updateOps.$push = {
        statusHistory: {
          status: updates.orderStatus,
          notes: statusNotes || `Status updated to ${updates.orderStatus}`,
          updatedBy: updatedBy || 'admin',
          date: new Date()
        }
      }
      
      activities.push({
        type: 'status_change',
        from: currentOrder?.orderStatus,
        to: updates.orderStatus,
        notes: statusNotes || `Status updated to ${updates.orderStatus}`,
        updatedBy: updatedBy || 'admin',
        timestamp: new Date()
      });
    }
    
    // Execute the order update
    const order = await Order.findByIdAndUpdate(
      id,
      updateOps,
      { new: true, runValidators: true }
    ).populate('items.productId', 'name images');
    
    if (!order) return null;
    
    // If order was confirmed, reduce stock for each item
    if (isStatusChangingToConfirmed && order.items) {
      const bulkOps = order.items.map(item => ({
        updateOne: {
          filter: { _id: item.productId },
          $inc: { totalQuantity: -item.quantity },
          $push: {
            activityLog: {
              type: 'stock_reduction',
              quantity: -item.quantity,
              reason: `Order ${order.orderNumber} confirmed`,
              orderId: order._id,
              timestamp: new Date()
            }
          }
        }
      }));
      
      if (bulkOps.length > 0) {
        await Product.bulkWrite(bulkOps);
        
        activities.push({
          type: 'stock_updated',
          items: order.items.map(item => ({
            productId: item.productId,
            productName: item.productName,
            quantityReduced: item.quantity
          })),
          orderId: order._id,
          orderNumber: order.orderNumber,
          timestamp: new Date()
        });
      }
    }
    
    // Log activities to console (in production, this could go to a dedicated activity log collection)
    if (activities.length > 0) {
      console.log('Order Activity Log:', JSON.stringify(activities, null, 2));
    }
    
    return order ? order.toJSON() : null;
  } catch (error) {
    console.error('Error updating order:', error);
    return null;
  }
}

export async function deleteOrderById(id) {
  await connectDB()
  try {
    const result = await Order.findByIdAndDelete(id)
    return !!result
  } catch {
    return false
  }
}

export async function getOrdersByStatus(status) {
  await connectDB()
  const orders = await Order.find({ orderStatus: status })
    .populate('items.productId', 'name images')
    .sort({ orderDate: -1 })
  return orders.map(o => o.toJSON())
}

export async function getOrdersByCustomer(customerEmail) {
  await connectDB()
  const orders = await Order.find({ 'customer.email': customerEmail })
    .populate('items.productId', 'name images')
    .sort({ orderDate: -1 })
  return orders.map(o => o.toJSON())
}

export async function getOrdersByDateRange(startDate, endDate) {
  await connectDB()
  const orders = await Order.find({
    orderDate: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  })
    .populate('items.productId', 'name images')
    .sort({ orderDate: -1 })
  return orders.map(o => o.toJSON())
}

export async function getOrderAnalytics() {
  await connectDB()
  
  const totalOrders = await Order.countDocuments()
  const totalRevenue = await Order.aggregate([
    { $group: { _id: null, total: { $sum: '$totalAmount' } } }
  ])
  
  const statusCounts = await Order.aggregate([
    { $group: { _id: '$orderStatus', count: { $sum: 1 } } }
  ])
  
  const monthlyRevenue = await Order.aggregate([
    {
      $group: {
        _id: {
          year: { $year: '$orderDate' },
          month: { $month: '$orderDate' }
        },
        total: { $sum: '$totalAmount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ])
  
  return {
    totalOrders,
    totalRevenue: totalRevenue[0]?.total || 0,
    statusCounts,
    monthlyRevenue
  }
}

// Helper function to connect to database (reusing from db.js)
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

export default Order