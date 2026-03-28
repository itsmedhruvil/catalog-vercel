// Admin state management
export const ADMIN_KEY = 'admin_mode_enabled';

export const isAdminMode = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(ADMIN_KEY) === 'true';
  }
  return false;
};

export const enableAdminMode = () => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(ADMIN_KEY, 'true');
  }
};

export const disableAdminMode = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(ADMIN_KEY);
  }
};

export const toggleAdminMode = () => {
  if (isAdminMode()) {
    disableAdminMode();
    return false;
  } else {
    enableAdminMode();
    return true;
  }
};