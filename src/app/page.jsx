import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { checkIsAdmin } from '@/lib/admin'

export default async function Home() {
  const { userId, sessionClaims } = await auth()
  
  // If user is signed in, check if they're an admin
  if (userId) {
    // Extract role from session claims - NO Clerk API call needed
    // sessionClaims contains JWT claims which may include metadata
    const claims = sessionClaims || {};
    const metadata = claims.metadata || {};
    const userRole = metadata.role;
    // Clerk typically includes the email in the JWT as 'email' claim
    const userEmail = claims.email;
    
    const isAdmin = checkIsAdmin({ role: userRole, email: userEmail });
    
    // Redirect admin users to the management dashboard instead of the public catalog
    if (isAdmin) {
      redirect('/admin')
    }
  }
  
  redirect('/catalog')
}
