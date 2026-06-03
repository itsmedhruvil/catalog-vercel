import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { checkIsAdmin, getAdminIdentityFromClaims } from '@/lib/admin'

export default async function Home() {
  const { userId, sessionClaims } = await auth()
  
  // If user is signed in, check if they're an admin
  if (userId) {
    const { role: userRole, email: userEmail } = getAdminIdentityFromClaims(sessionClaims);
    
    const isAdmin = checkIsAdmin({ role: userRole, email: userEmail });
    
    // Redirect admin users to the management dashboard instead of the public catalog
    if (isAdmin) {
      redirect('/admin')
    }
  }
  
  redirect('/catalog')
}
