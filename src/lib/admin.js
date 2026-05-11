// Admin state management with Clerk
// Admin mode is determined by Clerk authentication AND admin role metadata (or fallback email check)
//
// To grant admin access:
//   1. Go to https://dashboard.clerk.com → Users → Select a user
//   2. Under "Public metadata", add: {"role": "admin"}
//   3. Save — changes take effect immediately on next request

// The admin email fallback — only this email gets admin access if no role metadata is set
const ADMIN_EMAIL = 'corp.weexalate@gmail.com';

// Get list of admin emails from environment variable or use default
export const getAdminEmails = () => {
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS || ADMIN_EMAIL;
  return adminEmails
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(email => email.length > 0);
};

// Check if a specific email has admin access (fallback method)
export const isAdminEmail = (email) => {
  if (!email) return false;
  const adminEmails = getAdminEmails();
  return adminEmails.includes(email.toLowerCase()) || process.env.NODE_ENV === 'development';
};

// Check if the given role metadata indicates admin access (primary method)
export const isAdminRole = (role) => {
  return role === 'admin';
};

// Combined admin check: primary is role metadata, fallback is email
// This can be used on the server (middleware) with sessionClaims metadata
export const checkIsAdmin = ({ role, email } = {}) => {
  // Primary: check role metadata from Clerk
  if (role && role === 'admin') return true;

  // Fallback: check email (backwards compatibility)
  if (email && isAdminEmail(email)) return true;

  // Always allow in development
  if (process.env.NODE_ENV === 'development') return true;

  return false;
};

// Check if user is in admin mode (client-side)
export const isAdminMode = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('admin_mode_enabled') === 'true';
  }
  return false;
};

// Admin mode change event for reactive updates
export const ADMIN_EVENT = 'adminModeChanged';

// Dispatch admin mode change event
export const dispatchAdminChange = (isAdmin) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(ADMIN_EVENT, { detail: { isAdmin } }));
  }
};

// Enable admin mode (called when user signs in)
export const enableAdminMode = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('admin_mode_enabled', 'true');
    dispatchAdminChange(true);
  }
};

// Disable admin mode (called when user signs out)
export const disableAdminMode = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin_mode_enabled');
    dispatchAdminChange(false);
  }
};

// Toggle admin mode
export const toggleAdminMode = () => {
  if (isAdminMode()) {
    disableAdminMode();
    return false;
  } else {
    enableAdminMode();
    return true;
  }
};