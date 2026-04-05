import mongoose from 'mongoose'
import { Product, updateProductById } from './db.js'

// Import Customer model (defined in customerSchema.js)
const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  alternatePhone: { type: String, trim: true },
  addresses: [{
    label: { type: String, default: 'Home' },
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'India' },
    isDefault: { type: Boolean, default: false }
  }],
  customerType: {
    type: String,
    enum: ['retail', 'wholesale', 'vip', 'corporate'],
    default: 'retail'
  },
  companyName: { type: String, trim: true },
  gstNumber: { type: String, trim: true, uppercase: true },
  panNumber: { type: String, trim: true, uppercase: true },
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
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  avgOrderValue: { type: Number, default: 0 },
  lastOrderDate: { type: Date },
  isActive: { type: Boolean, default: true },
  isBlacklisted: { type: Boolean, default: false },
  blacklistReason: { type: String },
  tags: [String],
  source: {
    type: String,
    enum: ['website', 'admin', 'import', 'api'],
    default: 'website'
  },
  whatsappOptIn: { type: Boolean, default: true },
  emailOptIn: { type: Boolean, default: true }
}, {
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
})

// Indexes for performance
customerSchema.index({ email: 1 }, { unique: true })
customerSchema.index({ phone: 1 })
customerSchema.index({ name: 'text' })
customerSchema.index({ isActive: 1 })
customerSchema.index({ customerType: 1 })

const Customer = mongoose.models.Customer || mongoose.model('Customer', customerSchema)

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

// Helper function to update product stock and analytics
async function updateProductStock(productId, quantityChange, reason, orderId, orderNumber, adjustSales = false) {
  try {
    const product = await Product.findById(productId);
    if (!product) return null;

    const newQuantity = Math.max(0, (parseInt(product.totalQuantity) || 0) + quantityChange);
    
    // Determine if this is a sale (stock reduction) or restoration (stock increase)
    const isSale = quantityChange < 0;
    const quantitySold = isSale ? Math.abs(quantityChange) : 0;
    const quantityRestored = !isSale ? quantityChange : 0;
    
    const updateData = {
      totalQuantity: newQuantity,
      $push: {
        activityLog: {
          type: quantityChange < 0 ? 'stock_reduction' : 'stock_increase',
          quantity: quantityChange,
          reason: reason,
          orderId: orderId,
          orderNumber: orderNumber,
          timestamp: new Date(),
          updatedBy: 'system'
        }
      }
    };
    
    // Update sales analytics for sales
    if (isSale) {
      updateData.$set = {
        lastSoldAt: new Date(),
        salesLast30Days: Math.max(0, (product.salesLast30Days || 0) + quantitySold),
        totalSales: (product.totalSales || 0) + quantitySold,
      };
    }
    
    // Adjust sales analytics when stock is restored (cancelled/refunded orders)
    if (adjustSales && !isSale && quantityRestored > 0) {
      updateData.$set = {
        salesLast30Days: Math.max(0, (product.salesLast30Days || 0) - quantityRestored),
        totalSales: Math.max(0, (product.totalSales || 0) - quantityRestored),
      };
    }
    
    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      updateData,
      { new: true }
    );
    
    return updatedProduct;
  } catch (error) {
    console.error('Error updating product stock:', error);
    return null;
  }
}

// Helper function to reduce product stock (exported for use in orders API)
export async function reduceProductStock(productId, quantity, reason, orderId, orderNumber) {
  return updateProductStock(productId, -quantity, reason, orderId, orderNumber);
}

// Helper function to check product availability
export async function checkProductAvailability(items) {
  const availabilityIssues = [];
  
  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product) {
      availabilityIssues.push({
        productId: item.productId,
        productName: item.productName,
        issue: 'Product not found'
      });
      continue;
    }
    
    const availableQty = (parseInt(product.totalQuantity) || 0);
    if (availableQty < item.quantity) {
      availabilityIssues.push({
        productId: item.productId,
        productName: item.productName,
        requested: item.quantity,
        available: availableQty,
        issue: 'Insufficient stock'
      });
    }
  }
  
  return availabilityIssues;
}

export async function createOrder(data) {
  await connectDB();
  
  // Generate order number if not provided
  if (!data.orderNumber) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000);
    data.orderNumber = `ORD-${timestamp}-${random}`;
  }
  
  // Calculate totals
  const subtotal = data.items.reduce((sum, item) => sum + item.totalPrice, 0);
  const totalAmount = subtotal + data.tax + data.shipping - data.discount;
  
  const orderData = {
    ...data,
    subtotal,
    totalAmount
  };
  
  const order = await Order.create(orderData);
  
  // Add initial status history
  await Order.findByIdAndUpdate(order._id, {
    $push: {
      statusHistory: {
        status: order.orderStatus,
        notes: 'Order created',
        updatedBy: 'system',
        date: new Date()
      }
    }
  });
  
  // If order is created with 'confirmed' status, reduce stock immediately
  if (order.orderStatus === 'confirmed' && order.items) {
    for (const item of order.items) {
      await updateProductStock(
        item.productId,
        -item.quantity,
        `Order ${order.orderNumber} confirmed`,
        order._id,
        order.orderNumber
      );
    }
  }
  
  // Create or update customer record from order data
  if (data.customer && data.customer.email) {
    try {
      // Check if customer already exists by email
      let customer = await Customer.findOne({ email: data.customer.email.toLowerCase() });
      
      if (customer) {
        // Update existing customer
        const updateData = {
          name: data.customer.name,
          phone: data.customer.phone,
          totalOrders: (customer.totalOrders || 0) + 1,
          totalSpent: (customer.totalSpent || 0) + totalAmount,
          lastOrderDate: new Date()
        };
        
        // Calculate average order value
        if (updateData.totalOrders > 0) {
          updateData.avgOrderValue = updateData.totalSpent / updateData.totalOrders;
        }
        
        customer = await Customer.findByIdAndUpdate(
          customer._id,
          { $set: updateData },
          { new: true }
        );
        
        // Add address if provided
        if (data.customer.address && data.customer.address.street) {
          const addressExists = await Customer.findOne({ 
            _id: customer._id, 
            'addresses.street': data.customer.address.street 
          });
          
          if (!addressExists) {
            await Customer.findByIdAndUpdate(customer._id, {
              $push: {
                addresses: {
                  label: 'Order Address',
                  street: data.customer.address.street,
                  city: data.customer.address.city,
                  state: data.customer.address.state,
                  zipCode: data.customer.address.zipCode,
                  country: data.customer.address.country || 'India',
                  isDefault: false
                }
              }
            });
          }
        }
      } else {
        // Create new customer
        const customerData = {
          name: data.customer.name,
          email: data.customer.email.toLowerCase(),
          phone: data.customer.phone,
          customerType: 'retail',
          source: 'website',
          totalOrders: 1,
          totalSpent: totalAmount,
          avgOrderValue: totalAmount,
          lastOrderDate: new Date(),
          isActive: true,
          addresses: []
        };
        
        // Add address if provided
        if (data.customer.address && data.customer.address.street) {
          customerData.addresses = [{
            label: 'Home',
            street: data.customer.address.street,
            city: data.customer.address.city,
            state: data.customer.address.state,
            zipCode: data.customer.address.zipCode,
            country: data.customer.address.country || 'India',
            isDefault: true
          }];
        }
        
        customer = await Customer.create(customerData);
      }
      
      console.log(`Customer record ${customer ? 'updated' : 'created'}:`, customer?.email);
    } catch (customerError) {
      // Log error but don't fail the order creation
      console.error('Error creating/updating customer from order:', customerError);
    }
  }
  
  return order.toJSON();
}

export async function updateOrderById(id, updates) {
  await connectDB();
  
  try {
    // Extract special fields that are not part of the order document
    const { statusNotes, updatedBy, statusHistory, ...fieldUpdates } = updates;
    
    // Get the current order to check if status is changing
    const currentOrder = await Order.findById(id).populate('items.productId', 'name images');
    
    if (!currentOrder) return null;
    
    // Clean up the updates to only include valid fields and avoid validation errors
    // Remove fields that shouldn't be directly updated or may cause validation issues
    const { 
      id: _id, // Remove the virtual id field
      _id: __id, // Remove _id if present
      __v, // Remove version key
      createdAt, // Don't allow updating timestamps
      updatedAt,
      // Extract nested objects to clean them
      customer,
      payment,
      delivery,
      items,
      refund,
      ...topLevelUpdates
    } = fieldUpdates;
    
    // Build the update object with proper MongoDB operators
    const updateOps = {
      $set: { ...topLevelUpdates }
    };
    
    // Clean and add nested objects if they exist
    if (customer) {
      const { id: cId, _id: c_id, ...cleanCustomer } = customer;
      updateOps.$set.customer = cleanCustomer;
    }
    
    if (payment) {
      const { id: pId, _id: p_id, ...cleanPayment } = payment;
      updateOps.$set.payment = cleanPayment;
    }
    
    if (delivery) {
      const { id: dId, _id: d_id, ...cleanDelivery } = delivery;
      updateOps.$set.delivery = cleanDelivery;
    }
    
    if (refund) {
      const { id: rId, _id: r_id, ...cleanRefund } = refund;
      updateOps.$set.refund = cleanRefund;
    }
    
    // Clean items array - ensure productId is always a string ObjectId
    if (items && Array.isArray(items)) {
      const cleanItems = items.map(item => {
        const { id: iId, _id: i_id, productId, ...cleanItem } = item;
        // Handle productId - could be a string, an object with _id, or an object with id
        let cleanProductId = productId;
        if (typeof productId === 'object' && productId !== null) {
          cleanProductId = productId._id || productId.id;
        }
        return { ...cleanItem, productId: cleanProductId };
      });
      updateOps.$set.items = cleanItems;
    }
    
    // Track status changes for stock management
    const oldStatus = currentOrder.orderStatus;
    const newStatus = updates.orderStatus || oldStatus;
    const isStatusChangingToConfirmed = newStatus === 'confirmed' && oldStatus !== 'confirmed';
    const isStatusChangingFromConfirmed = oldStatus === 'confirmed' && newStatus !== 'confirmed';
    const isStatusCancelling = newStatus === 'cancelled' && oldStatus !== 'cancelled';
    const isStatusRefunding = newStatus === 'refunded' && oldStatus !== 'refunded';
    // Check if order was previously cancelled/refunded and now being changed to something else
    const isStatusChangingFromCancelled = oldStatus === 'cancelled' && newStatus !== 'cancelled';
    const isStatusChangingFromRefunded = oldStatus === 'refunded' && newStatus !== 'refunded';
    
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
      };
      
      activities.push({
        type: 'status_change',
        from: oldStatus,
        to: updates.orderStatus,
        notes: statusNotes || `Status updated to ${updates.orderStatus}`,
        updatedBy: updatedBy || 'admin',
        timestamp: new Date()
      });
    }
    
    // Execute the order update - use runValidators: true but with cleaned data
    const order = await Order.findByIdAndUpdate(
      id,
      updateOps,
      { new: true, runValidators: true }
    ).populate('items.productId', 'name images');
    
    if (!order) return null;
    
    // Stock management based on status changes
    // Note: Stock is now reduced immediately when order is created (in orders API)
    // So we only need to restore stock when order is cancelled/refunded, not reduce it again on confirm
    if (order.items && order.items.length > 0) {
      // If order status changes to cancelled or refunded, restore stock and adjust sales
      if (isStatusCancelling || isStatusRefunding) {
        for (const item of order.items) {
          await updateProductStock(
            item.productId,
            item.quantity,
            `Order ${order.orderNumber} ${isStatusCancelling ? 'cancelled' : 'refunded'} - stock replenished`,
            order._id,
            order.orderNumber,
            true // adjustSales: true - decrement sales analytics
          );
        }
        
        activities.push({
          type: 'stock_restored',
          reason: isStatusCancelling ? 'cancelled' : 'refunded',
          items: order.items.map(item => ({
            productId: item.productId,
            productName: item.productName,
            quantityRestored: item.quantity
          })),
          orderId: order._id,
          orderNumber: order.orderNumber,
          timestamp: new Date()
        });
      }
      
      // If order was previously cancelled/refunded and is now being changed to an active status,
      // reduce stock again (but don't increment sales as they were already counted)
      if (isStatusChangingFromCancelled || isStatusChangingFromRefunded) {
        // Only reduce stock if the new status is an active status (not cancelled/refunded)
        if (newStatus !== 'cancelled' && newStatus !== 'refunded') {
          for (const item of order.items) {
            await updateProductStock(
              item.productId,
              -item.quantity,
              `Order ${order.orderNumber} status changed from ${oldStatus} to ${newStatus}`,
              order._id,
              order.orderNumber
            );
          }
          
          activities.push({
            type: 'stock_reduced',
            reason: `status changed from ${oldStatus} to ${newStatus}`,
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
    // Get the order first to check if it has items and to restore stock
    const order = await Order.findById(id).populate('items.productId', 'name');
    
    if (!order) return false;
    
    // Restore stock for all items if the order was confirmed (stock was reduced)
    // We only restore stock for confirmed orders since pending orders didn't reduce stock
    if (order.orderStatus === 'confirmed' && order.items && order.items.length > 0) {
      for (const item of order.items) {
        await updateProductStock(
          item.productId,
          item.quantity,
          `Order ${order.orderNumber} deleted - stock replenished`,
          order._id,
          order.orderNumber,
          true // adjustSales: true - decrement sales analytics since order is being removed
        );
      }
      console.log(`Stock restored for deleted order ${order.orderNumber}`);
    }
    
    const result = await Order.findByIdAndDelete(id)
    return !!result
  } catch (error) {
    console.error('Error deleting order:', error);
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