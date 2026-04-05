import { NextResponse } from 'next/server'
import { 
  readCustomers, 
  createCustomer, 
  searchCustomers,
  getCustomerStats 
} from '@/lib/customerSchema'

// GET /api/customers - Fetch all customers or search
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const stats = searchParams.get('stats')
    
    if (stats === 'true') {
      const customerStats = await getCustomerStats()
      return NextResponse.json(customerStats)
    }
    
    let customers
    if (query && query.trim()) {
      customers = await searchCustomers(query.trim())
    } else {
      customers = await readCustomers()
    }
    
    return NextResponse.json(customers)
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}

// POST /api/customers - Create a new customer
export async function POST(request) {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.email || !body.phone) {
      return NextResponse.json(
        { error: 'Name, email, and phone are required' },
        { status: 400 }
      )
    }
    
    const customer = await createCustomer(body)
    return NextResponse.json(customer, { status: 201 })
  } catch (error) {
    console.error('Error creating customer:', error)
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'A customer with this email already exists' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    )
  }
}