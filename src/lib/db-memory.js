// In-memory database for development/testing when MongoDB is not accessible
// This is a temporary solution until MongoDB IP whitelist is configured

let products = [
  {
    id: '1',
    name: 'Sample Product 1',
    price: '$29.99',
    category: 'branded',
    description: 'A sample branded product',
    images: ['https://images.unsplash.com/photo-1523275335682-92da4c34ce4c?w=400'],
    quantity: 10,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2', 
    name: 'Sample Product 2',
    price: '$19.99',
    category: 'unbranded',
    description: 'A sample unbranded product',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'],
    quantity: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

let nextId = 3

export async function readProducts() {
  return products
}

export async function getProductById(id) {
  return products.find(p => p.id === id) || null
}

export async function addProduct(data) {
  const product = {
    id: String(nextId++),
    ...data,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
  products.push(product)
  return product
}

export async function updateProductById(id, updates) {
  const index = products.findIndex(p => p.id === id)
  if (index === -1) return null
  
  products[index] = {
    ...products[index],
    ...updates,
    updatedAt: new Date().toISOString()
  }
  return products[index]
}

export async function deleteProductById(id) {
  const index = products.findIndex(p => p.id === id)
  if (index === -1) return false
  
  products.splice(index, 1)
  return true
}