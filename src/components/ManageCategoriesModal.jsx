import { useState } from 'react'
import { Trash2, Edit2, Save, X } from 'lucide-react'

export default function ManageCategoriesModal({ categories, setCategories, onClose }) {
  const [newCat, setNewCat] = useState('')
  const [editingCategory, setEditingCategory] = useState(null)
  const [editValue, setEditValue] = useState('')

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

  const handleEdit = (category) => {
    setEditingCategory(category)
    setEditValue(category)
  }

  const handleSaveEdit = () => {
    if (!editValue.trim()) return
    
    const formatted = editValue.trim().toLowerCase()
    if (formatted !== editingCategory && categories.includes(formatted)) {
      alert('A category with this name already exists.')
      return
    }

    setCategories(categories.map(cat => cat === editingCategory ? formatted : cat))
    setEditingCategory(null)
    setEditValue('')
  }

  const handleCancelEdit = () => {
    setEditingCategory(null)
    setEditValue('')
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSaveEdit()
    } else if (e.key === 'Escape') {
      handleCancelEdit()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl animate-zoom-in">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Manage Categories</h3>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full">
            <Trash2 size={20} />
          </button>
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
              {editingCategory === cat ? (
                <div className="flex items-center gap-2 flex-1">
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-1 outline-none focus:border-blue-500 focus:ring-1"
                    autoFocus
                  />
                  <button 
                    onClick={handleSaveEdit}
                    className="p-1 text-green-600 hover:bg-green-50 rounded"
                    title="Save"
                  >
                    <Save size={18} />
                  </button>
                  <button 
                    onClick={handleCancelEdit}
                    className="p-1 text-gray-500 hover:bg-gray-200 rounded"
                    title="Cancel"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <>
                  <span className="capitalize font-medium text-gray-800 flex-1">{cat}</span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleEdit(cat)} 
                      className="text-blue-500 p-1 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => handleRemove(cat)} 
                      className="text-red-500 p-1 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove Category"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
