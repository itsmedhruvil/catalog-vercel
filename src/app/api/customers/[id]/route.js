import { NextResponse } from 'next/server'
import { 
  getCustomerById, 
  updateCustomerById, 
  deleteCustomerById 
} from '@/lib/customerSchema'

// GET /api/customers/[id] - Fetch a single customer
export async function GET(request, { params }) {
  try {
    const { id } = await params
    const customer = await getCustomerById(id)
    
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(customer)
  } catch (error) {
    console.error('Error fetching customer:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customer' },
      { status: 500 }
    )
  }
}

// PUT /api/customers/[id] - Update a customer
export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const customer = await updateCustomerById(id, body)
    
    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(customer)
  } catch (error) {
    console.error('Error updating customer:', error)
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    )
  }
}

// DELETE /api/customers/[id] - Delete a customer
export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    const result = await deleteCustomerById(id)
    
    if (!result) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ message: 'Customer deleted successfully' })
  } catch (error) {
    console.error('Error deleting customer:', error)
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    )
  }
}