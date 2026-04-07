// Admin state management with Clerk
// This file provides helper functions for admin mode detection
// Admin mode is determined by Clerk authentication AND admin email check

// The admin email - only this email gets admin access
const ADMIN_EMAIL = 'corp.weexalate@gmail.com';

// Get list of admin emails from environment variable or use default
export const getAdminEmails = () => {
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS || ADMIN_EMAIL;
  return adminEmails
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(email => email.length > 0);
};

// Check if a specific email has admin access
// Only corp.weexalate@gmail.com (or emails in NEXT_PUBLIC_ADMIN_EMAILS) gets admin access
export const isAdminEmail = (email) => {
  if (!email) return false;
  const adminEmails = getAdminEmails();
  // Only allow specific admin emails - no backward compatibility for security
  return adminEmails.includes(email.toLowerCase());
};

// Check if user is in admin mode (client-side)
export const isAdminMode = () => {
  if (typeof window !== 'undefined') {
    // Check if admin mode is enabled in localStorage
    // This is set by enableAdminMode() when a user with admin email signs in
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