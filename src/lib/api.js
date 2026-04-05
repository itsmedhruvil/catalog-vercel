// ─── Products ─────────────────────────────────────────────────────────────────

export async function fetchProducts() {
  const res = await fetch('/api/products', { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to load products')
  return res.json()
}

export async function createProduct(data) {
  const res = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create product')
  return res.json()
}

export async function updateProduct(id, data) {
  const res = await fetch(`/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update product')
  return res.json()
}

export async function deleteProduct(id) {
  const res = await fetch(`/api/products/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete product')
}

// ─── Orders ───────────────────────────────────────────────────────────────────

export async function fetchOrders() {
  const res = await fetch('/api/orders', { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to load orders')
  return res.json()
}

export async function fetchOrderById(id) {
  const res = await fetch(`/api/orders/${id}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to load order')
  return res.json()
}

export async function createOrder(data) {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create order')
  return res.json()
}

export async function updateOrder(id, data) {
  const res = await fetch(`/api/orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update order')
  return res.json()
}

export async function deleteOrder(id) {
  const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete order')
}

export async function fetchOrdersByStatus(status) {
  const res = await fetch(`/api/orders?status=${status}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to load orders')
  return res.json()
}

export async function fetchOrdersByCustomer(customerEmail) {
  const res = await fetch(`/api/orders?customer=${encodeURIComponent(customerEmail)}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to load orders')
  return res.json()
}

export async function fetchOrdersByDateRange(startDate, endDate) {
  const res = await fetch(`/api/orders?startDate=${startDate}&endDate=${endDate}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to load orders')
  return res.json()
}

export async function fetchOrderAnalytics() {
  const res = await fetch('/api/orders?analytics=true', { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to load analytics')
  return res.json()
}

// ─── Customers ────────────────────────────────────────────────────────────────

export async function fetchCustomers(query) {
  const url = query 
    ? `/api/customers?q=${encodeURIComponent(query)}`
    : '/api/customers'
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to load customers')
  return res.json()
}

export async function fetchCustomerById(id) {
  const res = await fetch(`/api/customers/${id}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to load customer')
  return res.json()
}

export async function createCustomer(data) {
  const res = await fetch('/api/customers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create customer')
  return res.json()
}

export async function updateCustomer(id, data) {
  const res = await fetch(`/api/customers/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update customer')
  return res.json()
}

export async function deleteCustomer(id) {
  const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete customer')
}

export async function searchCustomers(query) {
  const res = await fetch(`/api/customers?q=${encodeURIComponent(query)}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to search customers')
  return res.json()
}

// ─── Image upload ─────────────────────────────────────────────────────────────

export async function uploadImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch('/api/upload', { method: 'POST', body: formData })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Upload failed')
  }
  const { url } = await res.json()
  return url
}
