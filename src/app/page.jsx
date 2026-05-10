import { auth, currentUser } from '@clerk/nextjs/server'
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
    const user = userEmail ? null : await currentUser()
    const resolvedEmail =
      userEmail ||
      user?.primaryEmailAddress?.emailAddress ||
      user?.emailAddresses?.[0]?.emailAddress
    const adminEmails = getAdminEmails()
    const isAdmin =
      resolvedEmail &&
      (adminEmails.includes(String(resolvedEmail).toLowerCase()) ||
        process.env.NODE_ENV === 'development')
    
    // Redirect admin users to the management dashboard instead of the public catalog
    if (isAdmin) {
      redirect('/admin')
    }
  }
  
  redirect('/catalog')
}
