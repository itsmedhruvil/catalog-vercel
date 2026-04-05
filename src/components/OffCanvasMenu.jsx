"use client";

import {
  X,
  ShoppingCart,
  BarChart3,
  Bell,
  Truck,
  Link as LinkIcon,
  CheckCircle2,
  Lock,
  Unlock,
  ChevronRight,
  Users,
} from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function OffCanvasMenu({
  isOpen,
  onClose,
  isAdmin,
  isSelectionMode,
  selectedCount,
  isAdminUnlocked,
  sharedIdsLength,
  onNavigate,
  onToggleAdmin,
  onToggleSelectionMode,
  onOpenShareLinks,
  onOpenShareConfig,
}) {
  const { cartTotals, openCart } = useCart();
  const { itemCount } = cartTotals();
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Off Canvas Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu Items */}
        <div className="p-4 space-y-2">
          {/* Cart Button - Always Visible */}
          <div className="mb-4">
            <MenuButton
              icon={<ShoppingCart size={20} />}
              label="Shopping Cart"
              onClick={() => {
                openCart();
                onClose();
              }}
            >
              {itemCount > 0 && (
                <span className="ml-auto bg-green-600 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-semibold">
                  {itemCount}
                </span>
              )}
            </MenuButton>
          </div>

          {/* Admin Tools Section */}
          {isAdmin && sharedIdsLength === 0 && (
            <>
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
                  Admin Tools
                </p>
                <div className="space-y-1">
                  <MenuButton
                    icon={<ShoppingCart size={20} />}
                    label="Orders Management"
                    onClick={() => {
                      onNavigate("/orders");
                      onClose();
                    }}
                  />
                  <MenuButton
                    icon={<Users size={20} />}
                    label="Client Database"
                    onClick={() => {
                      onNavigate("/clients");
                      onClose();
                    }}
                  />
                  <MenuButton
                    icon={<BarChart3 size={20} />}
                    label="Analytics Dashboard"
                    onClick={() => {
                      onNavigate("/analytics");
                      onClose();
                    }}
                  />
                  <MenuButton
                    icon={<Bell size={20} />}
                    label="Inventory Alerts"
                    onClick={() => {
                      onNavigate("/alerts");
                      onClose();
                    }}
                  />
                  <MenuButton
                    icon={<Truck size={20} />}
                    label="Delivery Management"
                    onClick={() => {
                      onNavigate("/delivery");
                      onClose();
                    }}
                  />
                </div>
              </div>
            </>
          )}

          {/* Sharing Section */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
              Sharing
            </p>
            <div className="space-y-1">
              {isSelectionMode ? (
                <>
                  <MenuButton
                    icon={<CheckCircle2 size={20} />}
                    label="Exit Selection Mode"
                    onClick={() => {
                      onToggleSelectionMode();
                      onClose();
                    }}
                    isActive={isSelectionMode}
                  />
                  {selectedCount > 0 && (
                    <MenuButton
                      icon={<LinkIcon size={20} />}
                      label={`Share (${selectedCount} items)`}
                      onClick={() => {
                        onOpenShareConfig();
                        onClose();
                      }}
                      highlight
                    />
                  )}
                </>
              ) : (
                <>
                  {isAdmin && sharedIdsLength === 0 && (
                    <MenuButton
                      icon={<LinkIcon size={20} />}
                      label="Share Links"
                      onClick={() => {
                        onOpenShareLinks();
                        onClose();
                      }}
                    />
                  )}
                  <MenuButton
                    icon={<CheckCircle2 size={20} />}
                    label="Select Products to Share"
                    onClick={() => {
                      onToggleSelectionMode();
                      onClose();
                    }}
                  />
                </>
              )}
            </div>
          </div>

          {/* Account Section */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
              Account
            </p>
            <div className="space-y-1">
              <button
                onClick={() => {
                  onToggleAdmin();
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
                  isAdminUnlocked
                    ? "bg-green-50 text-green-700 hover:bg-green-100"
                    : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  {isAdminUnlocked ? (
                    <Unlock size={20} />
                  ) : (
                    <Lock size={20} />
                  )}
                  <span className="font-medium">
                    {isAdminUnlocked ? "Lock Admin" : "Unlock Admin"}
                  </span>
                </div>
                <ChevronRight size={18} className="text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            {isAdminUnlocked ? "Admin Mode Active" : "Viewer Mode"}
          </p>
        </div>
      </div>
    </>
  );
}

// Helper component for menu buttons
function MenuButton({ icon, label, onClick, isActive, highlight, children }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${
        isActive
          ? "bg-blue-50 text-blue-700"
          : highlight
          ? "bg-blue-600 text-white hover:bg-blue-700"
          : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      <span className={highlight ? "text-white" : "text-gray-500"}>
        {icon}
      </span>
      <span className="font-medium flex-1 text-left">{label}</span>
      {children}
    </button>
  );
}

