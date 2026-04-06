// Admin state management with Clerk
// This file provides helper functions for admin mode detection
// Admin mode is determined by Clerk authentication AND admin email check

// Get list of admin emails from environment variable
export const getAdminEmails = () => {
  const adminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS || '';
  return adminEmails
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(email => email.length > 0);
};

// Check if a specific email has admin access
export const isAdminEmail = (email) => {
  if (!email) return false;
  const adminEmails = getAdminEmails();
  // If no admin emails are configured, allow all signed-in users (backward compatibility)
  if (adminEmails.length === 0) return true;
  return adminEmails.includes(email.toLowerCase());
};

// Check if user is signed in with Clerk (client-side)
export const isAdminMode = () => {
  if (typeof window !== 'undefined') {
    // Check if user has an active Clerk session
    // This will be overridden by actual Clerk auth check in components
    const clerkSession = localStorage.getItem('clerk-session');
    return !!clerkSession;
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