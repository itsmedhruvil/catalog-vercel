import { useState } from 'react'
import { Lock, Unlock } from 'lucide-react'
import { enableAdminMode } from '@/lib/admin'

export default function AdminLoginModal({ onClose, onSuccess }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = (e) => {
    e.preventDefault()
    if (password === 'TAGOFFICE@2026') {
      // Enable admin mode persistently
      enableAdminMode();
      onSuccess()
    } else {
      setError('Incorrect password')
      setPassword('')
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl animate-zoom-in">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full mb-4 mx-auto">
          <Lock size={24} />
        </div>
        <h3 className="text-xl font-bold text-center mb-1">Admin Access</h3>
        <p className="text-sm text-gray-500 text-center mb-6">Enter password to manage catalog</p>
        
        <form onSubmit={handleLogin}>
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            className={`w-full border rounded-xl px-4 py-3 outline-none transition-all mb-2 ${
              error ? 'border-red-500 focus:ring-1 focus:ring-red-500' : 'border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
            }`}
          />
          {error && <p className="text-red-500 text-xs mb-4 pl-1">{error}</p>}
          
          <div className="flex gap-3 mt-6">
            <button 
              type="button" 
              onClick={onClose}
              className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit"
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium"
            >
              Unlock
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}