import { Share2, Link as LinkIcon, CheckCircle2 } from 'lucide-react'

export default function ShareOptionsModal({ categories, onClose, onCopyCategory, onCustomSelect }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center md:items-center">
      <div className="bg-white w-full md:w-[28rem] rounded-t-2xl md:rounded-2xl p-4 animate-slide-up md:animate-zoom-in max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Share Catalog Options</h3>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full"><LinkIcon size={20}/></button>
        </div>
        
        <div className="space-y-3">
          
          {categories.map(cat => (
            <button 
              key={cat}
              onClick={() => { onCopyCategory(cat); onClose(); }}
              className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left"
            >
              <div>
                <p className="font-semibold text-gray-900 capitalize">Share "{cat}"</p>
                <p className="text-xs text-gray-500">Creates a link showing only {cat} items</p>
              </div>
              <LinkIcon size={18} className="text-blue-500" />
            </button>
          ))}

          <button 
            onClick={onCustomSelect}
            className="w-full flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 border border-blue-100 rounded-xl transition-colors text-left mt-2"
          >
            <div>
              <p className="font-semibold text-blue-900">Select Specific Products</p>
              <p className="text-xs text-blue-700">Choose exact items to create a custom link</p>
            </div>
            <CheckCircle2 size={18} className="text-blue-600" />
          </button>
        </div>
      </div>
    </div>
  )
}