# Stock Management System Guide

## Overview

This catalog application now has a unified stock management system that automatically tracks inventory and updates it when orders are confirmed or cancelled.

## Key Concepts

### Single Source of Truth: `totalQuantity`

The **`totalQuantity`** field in the Product schema is the single source of truth for stock tracking. All stock operations revolve around this field.

- **Location**: `src/lib/db.js` - Product Schema
- **Type**: Number (integer)
- **Default**: 0
- **Purpose**: Represents the total available stock for a product

### Available Stock Calculation

The displayed "available stock" is calculated as:
```
calculatedAvailable = totalQuantity - totalHolds
```

Where `totalHolds` is the sum of all quantities in the `holds` array (items reserved for customers).

## How Stock Management Works

### 1. Creating Products

When creating a new product, you **must** set the `totalQuantity` field to the initial stock level.

**Important**: If `totalQuantity` is not set or is 0, the product will show as "Sold Out".

```javascript
// Example product creation
{
  name: "Leather Bag",
  price: "500",
  totalQuantity: 100,  // Initial stock
  category: "branded",
  // ... other fields
}
```

### 2. Order Creation and Stock Impact

#### Order Status Flow
```
pending → confirmed → processing → shipped → delivered
   ↓
cancelled (at any point)
```

#### Stock Behavior by Status

| Order Status | Stock Action |
|-------------|--------------|
| `pending` | No stock change |
| `confirmed` | **Stock REDUCED** by order quantity |
| `processing` | No additional change |
| `shipped` | No additional change |
| `delivered` | No additional change |
| `cancelled` | **Stock RESTORED** (if previously confirmed) |

### 3. Stock Reduction (When Order is Confirmed)

When an order status changes **TO** `confirmed`:

1. For each item in the order:
   - `totalQuantity` is reduced by `item.quantity`
   - Sales analytics are updated:
     - `salesLast30Days` increases
     - `totalSales` increases
     - `lastSoldAt` is set to current date
   - An activity log entry is created

**Code Location**: `src/lib/orderSchema.js` - `updateOrderById()` function

```javascript
// When status changes to 'confirmed'
await updateProductStock(
  item.productId,
  -item.quantity,  // Negative = reduce stock
  `Order ${order.orderNumber} confirmed`,
  order._id,
  order.orderNumber
);
```

### 4. Stock Restoration (When Order is Cancelled)

When an order status changes **FROM** `confirmed` to any other status (including `cancelled`):

1. For each item in the order:
   - `totalQuantity` is increased by `item.quantity`
   - An activity log entry is created

This ensures that if an order is cancelled after being confirmed, the stock is returned to inventory.

## File Structure

### Backend Files

| File | Purpose |
|------|---------|
| `src/lib/db.js` | Product schema with `totalQuantity` field |
| `src/lib/orderSchema.js` | Order schema + stock management logic |
| `src/app/api/products/route.js` | Product API (ensures `totalQuantity` is set) |
| `src/app/api/orders/route.js` | Order API with stock availability checking |

### Frontend Files

| File | Purpose |
|------|---------|
| `src/components/ProductFormModal.jsx` | Product form with `totalQuantity` input |
| `src/components/CatalogClient.jsx` | Displays products with stock status |
| `src/app/orders/[id]/page.jsx` | Order management with status changes |

## Stock Status Display

### "Sold Out" Condition

A product shows as "Sold Out" when:

```javascript
const isSoldOut = 
  product.isSoldOut || 
  (product.calculatedAvailable !== "" && 
   parseInt(product.calculatedAvailable) <= 0);
```

This means:
1. If `isSoldOut` is explicitly set to `true`, OR
2. If `calculatedAvailable` (totalQuantity - holds) is 0 or negative

### Stock Display in Catalog

When viewing the catalog:
- **Admins** always see stock levels
- **Viewers** see stock only if `showStock` URL parameter is `true`
- Stock is shown as: `Stock: X (Hold: Y)` for admins

## Activity Logging

Every stock change creates an entry in the product's `activityLog` array:

```javascript
{
  type: 'stock_reduction' | 'stock_increase',
  quantity: -5,  // Negative for reduction, positive for increase
  reason: 'Order ORD-123 confirmed',
  orderId: '...',
  orderNumber: 'ORD-123',
  timestamp: Date,
  updatedBy: 'system' | 'admin'
}
```

## Analytics Tracking

When stock is reduced (sale), the following analytics are updated:

| Field | Update |
|-------|--------|
| `salesLast30Days` | Increased by quantity sold |
| `totalSales` | Increased by quantity sold |
| `lastSoldAt` | Set to current timestamp |

## Common Issues and Solutions

### Issue: All Products Show as "Sold Out"

**Cause**: Products have `totalQuantity` = 0 or undefined.

**Solution**:
1. Go to the catalog in Admin mode
2. Edit each product
3. Set the "Total Stock Quantity" to the actual available stock
4. Save the product

### Issue: Stock Not Reducing When Order is Placed

**Cause**: Orders are created with `pending` status by default. Stock is only reduced when status changes to `confirmed`.

**Solution**:
1. Go to the order details page
2. Change the order status to "Confirmed"
3. Stock will be automatically reduced

### Issue: Stock Not Restoring When Order is Cancelled

**Cause**: The order was never confirmed (still `pending`), so no stock was reduced.

**Solution**: This is expected behavior. Only confirmed orders have stock reduced, so only confirmed orders restore stock when cancelled.

## Best Practices

1. **Always set initial stock** when creating products
2. **Confirm orders promptly** to ensure accurate stock levels
3. **Monitor the activity log** for stock changes
4. **Use the analytics dashboard** to track sales trends
5. **Set reorder levels** to get low stock alerts

## API Endpoints

### Check Stock Availability

When creating an order, the API checks stock availability and returns warnings:

```javascript
POST /api/orders
{
  // order data...
}

Response:
{
  // order data...
  _availabilityWarnings: [
    {
      productId: "...",
      productName: "Product Name",
      requested: 5,
      available: 3,
      issue: "Insufficient stock"
    }
  ]
}
```

## Migration from Old System

If you have existing products with `availableQuantity` field:

1. The system automatically migrates `availableQuantity` to `totalQuantity`
2. Old `stockOnHold` values are migrated to the `holds` array
3. This migration happens when products are loaded in the catalog

## Future Enhancements

Potential improvements to the stock management system:

1. **Bulk stock updates** - Import/export stock levels via CSV
2. **Stock reservations** - Hold items when added to cart
3. **Low stock alerts** - Email notifications when stock is low
4. **Purchase orders** - Track incoming inventory
5. **Multi-warehouse support** - Track stock across locations