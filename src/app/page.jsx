import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { checkIsAdmin, getAdminIdentityFromClaims, getAdminIdentityFromUser } from '@/lib/admin'

export default async function Home() {
  const { userId, sessionClaims } = await auth()
  
  // If user is signed in, check if they're an admin
  if (userId) {
    const { role: userRole, email: userEmail } = getAdminIdentityFromClaims(sessionClaims);
    
    let isAdmin = checkIsAdmin({ role: userRole, email: userEmail });

    if (!isAdmin) {
      const user = await currentUser();
      const { role, email } = getAdminIdentityFromUser(user || {});
      isAdmin = checkIsAdmin({ role, email });
    }
    
    // Redirect admin users to the management dashboard instead of the public catalog
    if (isAdmin) {
      redirect('/admin')
    }
  }
  
  redirect('/catalog')
}
