import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getAdminEmails } from '@/lib/admin'

export default async function Home() {
  const { userId, sessionClaims } = await auth()
  
  // If user is signed in, check if they're an admin
  if (userId) {
    const userEmail = sessionClaims?.email
    const adminEmails = getAdminEmails()
    const isAdmin = userEmail && adminEmails.includes(userEmail.toLowerCase())
    
    // Redirect admin users to alerts page instead of catalog
    if (isAdmin) {
      redirect('/alerts')
    }
  }
  
  redirect('/catalog')
}
