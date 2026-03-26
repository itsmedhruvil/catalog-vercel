import { useState } from 'react'
import { X, Trash2 } from 'lucide-react'

export default function ManageCategoriesModal({ categories, setCategories, onClose }) {
  const [newCat, setNewCat] = useState('')

  const handleAdd = (e) => {
    e.preventDefault()
    const formatted = newCat.trim().toLowerCase()
    if (formatted && !categories.includes(formatted)) {
      setCategories([...categories, formatted])
      setNewCat('')
    }
  }

  const handleRemove = (catToRemove) => {
    setCategories(categories.filter(c => c !== catToRemove))
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-xl animate-zoom-in">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Manage Categories</h3>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full"><X size={20}/></button>
        </div>
        
        <form onSubmit={handleAdd} className="flex gap-2 mb-4">
          <input 
            type="text" 
            value={newCat}
            onChange={e => setNewCat(e.target.value)}
            placeholder="New category..." 
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2 outline-none focus:border-blue-500 focus:ring-1"
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium">Add</button>
        </form>

        <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
          {categories.length === 0 && <p className="text-gray-500 text-sm italic">No categories left.</p>}
          {categories.map(cat => (
            <div key={cat} className="flex items-center justify-between p-3 bg-gray-50 border rounded-xl">
              <span className="capitalize font-medium text-gray-800">{cat}</span>
              <button 
                onClick={() => handleRemove(cat)} 
                className="text-red-500 p-1 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove Category"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}