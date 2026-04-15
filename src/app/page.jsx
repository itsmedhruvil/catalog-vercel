import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { getAdminEmails } from '@/lib/admin'

export default async function Home() {
  const { userId, sessionClaims } = await auth()
  
  // If user is signed in, check if they're an admin
  if (userId) {
    const userEmail =
      sessionClaims?.email ||
      sessionClaims?.email_address ||
      sessionClaims?.primary_email_address ||
      sessionClaims?.primaryEmailAddress
    const adminEmails = getAdminEmails()
    const isAdmin = userEmail && adminEmails.includes(String(userEmail).toLowerCase())
    
    // Redirect admin users to alerts page instead of catalog
    if (isAdmin) {
      redirect('/alerts')
    }
  }
  
  redirect('/catalog')
}
