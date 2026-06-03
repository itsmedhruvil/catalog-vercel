'use client';

import { useEffect } from 'react';

export default function PWARegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // First, unregister any existing service workers to clear out old buggy ones
      navigator.serviceWorker.getRegistrations().then(registrations => {
        for (const registration of registrations) {
          registration.unregister();
        }
      }).then(() => {
        // Register the clean service worker
        return navigator.serviceWorker.register('/sw.js')
      }).then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
          
          // Auto-update when a new SW is found
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New version available - reload to activate
                  window.location.reload();
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });

      // Handle service worker updates - only reload once
      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }
  }, []);

  return null;
}