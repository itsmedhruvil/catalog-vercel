'use client';

import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check if iOS
    const isSafari = /Safari/.test(navigator.userAgent) && /iPhone|iPad/.test(navigator.userAgent);
    setIsIOS(isSafari);

    // Listen for beforeinstallprompt (Chrome/Edge/Android)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    // Show iOS instructions after a delay if on iOS
    if (isSafari && !isInstalled) {
      const timer = setTimeout(() => setShowIOSInstructions(true), 3000);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      };
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isInstalled]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === 'accepted') {
      setShowPrompt(false);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled) return null;

  // iOS Install instructions banner
  if (showIOSInstructions) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 animate-slide-up">
        <button
          onClick={() => setShowIOSInstructions(false)}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={18} className="text-gray-500" />
        </button>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-100 rounded-xl shrink-0">
            <Download size={24} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1">Install App</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Tap the Share button <span className="inline-block px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">⎙</span> in Safari, then scroll down and tap <strong>&ldquo;Add to Home Screen&rdquo;</strong>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Chrome/Edge install banner
  if (showPrompt && deferredPrompt) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 p-5 animate-slide-up max-w-md mx-auto">
        <button
          onClick={() => setShowPrompt(false)}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X size={18} className="text-gray-500" />
        </button>
        <div className="flex items-start gap-4">
          <div className="p-3 bg-indigo-100 rounded-xl shrink-0">
            <Download size={24} className="text-indigo-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-sm mb-1">Install Product Catalog</h3>
            <p className="text-xs text-gray-600 mb-4">
              Install this app on your device for a better experience with offline access.
            </p>
            <button
              onClick={handleInstall}
              className="w-full bg-indigo-600 text-white py-2.5 px-4 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors active:scale-[0.98]"
            >
              Install Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}