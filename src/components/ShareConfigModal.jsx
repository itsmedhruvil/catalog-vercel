"use client";

import { useState } from "react";
import { X, Share2, CheckCircle2, Link as LinkIcon, Truck, Search, User, ShoppingCart } from "lucide-react";

export default function ShareConfigModal({ selectedCount, onClose, onGenerate }) {
  const [includeTotal, setIncludeTotal] = useState(false);
  const [includeStock, setIncludeStock] = useState(false);
  const [hidePriceConfig, setHidePriceConfig] = useState(false);

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white w-[calc(100%-2rem)] max-w-sm rounded-2xl p-6 shadow-xl animate-zoom-in mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Share Options</h3>
          <button onClick={onClose} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors shrink-0">
            <X size={20} />
          </button>
        </div>
        
        <div className="mb-6 space-y-4">
          <p className="text-sm text-gray-600">You have selected <span className="font-bold text-gray-900">{selectedCount} products</span> to share.</p>
          
          <label className={`flex items-center gap-3 p-4 border rounded-xl transition-colors cursor-pointer ${hidePriceConfig ? 'border-gray-100 bg-gray-50/50 opacity-60' : 'border-gray-200 bg-gray-50 hover:bg-gray-100'}`}>
            <input
              type="checkbox"
              disabled={hidePriceConfig}
              checked={includeTotal}
              onChange={(e) => setIncludeTotal(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50 shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-gray-900 truncate">Show Total Price</span>
              <span className="text-xs text-gray-500">
                {hidePriceConfig ? 'Disabled when price are hidden' : 'Display the total price to the viewer'}
              </span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={includeStock}
              onChange={(e) => setIncludeStock(e.target.checked)}
              className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-gray-900 truncate">Show Available Quantity</span>
              <span className="text-xs text-gray-500">Display current stock levels to the viewer</span>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors">
            <input
              type="checkbox"
              checked={hidePriceConfig}
              onChange={(e) => {
                setHidePriceConfig(e.target.checked);
                if (e.target.checked) setIncludeTotal(false); // Can't show total if prices are hidden
              }}
              className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 shrink-0"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-gray-900 truncate">Hide Product Price</span>
              <span className="text-xs text-gray-500">Remove price information from the generated link</span>
            </div>
          </label>
        </div>

        <button 
          onClick={() => onGenerate({ includeTotal, includeStock, hidePriceConfig })}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 transition-colors text-white rounded-xl font-medium flex items-center justify-center gap-2"
        >
          <LinkIcon size={18} /> Copy Share Link
        </button>
      </div>
    </div>
  );
}