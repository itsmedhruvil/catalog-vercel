"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit2,
  Share2,
  X,
  Check,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Link as LinkIcon,
  Loader2,
  Lock,
  Unlock,
  AlertCircle,
  Package,
  Box,
  Layers,
  Settings,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Trash2,
  Truck,
  Search,
  User,
  ShoppingCart,
  BarChart3,
  Bell,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/api";
import { isAdminMode, toggleAdminMode } from "@/lib/admin";
import ProductFormModal from "./ProductFormModal";
import ProductFormModalEnhanced from "./ProductFormModalEnhanced";
import ShareOptionsModal from "./ShareOptionsModal";
import ShareConfigModal from "./ShareConfigModal";
import AdminLoginModal from "./AdminLoginModal";
import ManageCategoriesModal from "./ManageCategoriesModal";
import LightboxModal from "./LightboxModal";
import AdvancedDashboard from "./AdvancedDashboard";
import InventoryAlerts from "./InventoryAlerts";
import DeliveryManagementModal from "./DeliveryManagementModal";
import OffCanvasMenu from "./OffCanvasMenu";

export default function CatalogClient({
  initialSharedIds = [],
  initialFilter = "all",
}) {
  const router = useRouter();

  // --- LOADERS (Database-only approach) ---
  const loadProducts = () => {
    // No local storage - all data comes from database
    return [];
  };

  const loadCategories = () => {
    // No local storage - categories come from database or default
    return ["branded", "unbranded"];
  };

  // --- STATE ---
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["branded", "unbranded"]);
  const [filter, setFilter] = useState(initialFilter);
  const [searchQuery, setSearchQuery] = useState("");
  const [sharedIds, setSharedIds] = useState(initialSharedIds);

  // URL configurations
  const [showTotal, setShowTotal] = useState(false);
  const [showStock, setShowStock] = useState(false);
  const [hidePrice, setHidePrice] = useState(false);

  // UI & Auth State
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState(new Set());

  // Off-canvas menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Modals
  const [activeModal, setActiveModal] = useState(null);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  // Admins always override the 'hide price' setting
  const effectiveHidePrice = hidePrice && !isAdmin;

  // --- LOAD PRODUCTS FROM DATABASE ---
  const loadProductsFromDB = useCallback(async () => {
    try {
      const data = await fetchProducts();
      // Normalize any old data to the new format
      // totalQuantity is now the single source of truth for stock
      const normalizedData = data.map((p) => {
        let migratedHolds = p.holds || [];
        if (!p.holds && p.stockOnHold && parseInt(p.stockOnHold) > 0) {
          migratedHolds = [
            {
              id: "legacy-hold",
              customer: "Legacy Hold",
              quantity: p.stockOnHold,
            },
          ];
        }
        
        // Migrate availableQuantity to totalQuantity if needed
        // totalQuantity is the single source of truth for stock tracking
        let totalQty = p.totalQuantity;
        // Check for undefined, null, or 0 (default) - if availableQuantity has a value, use it
        if (totalQty === undefined || totalQty === null || (totalQty === 0 && p.availableQuantity)) {
          // Try to use availableQuantity as fallback
          totalQty = p.availableQuantity !== undefined ? parseInt(p.availableQuantity) || 0 : 0;
        }
        
        return {
          ...p,
          totalQuantity: totalQty,
          holds: migratedHolds,
          stockOnHold: undefined,
          availableQuantity: undefined, // Remove old field
        };
      });
      setProducts(normalizedData);
    } catch (error) {
      console.error("Failed to load products from database", error);
      setProducts([]);
      // Use a simple alert instead of showToast to avoid circular dependency
      alert("Failed to load products. Please check your connection.");
    }
  }, []);

  // --- LOAD CATEGORIES FROM DATABASE ---
  const loadCategoriesFromDB = useCallback(async () => {
    try {
      // Categories are now hardcoded as database integration for categories
      // would require additional API endpoints
      setCategories(["branded", "unbranded"]);
    } catch (error) {
      console.error("Failed to load categories", error);
    }
  }, []);

  // --- PERSISTENCE ---
  // Removed localStorage persistence - all data now comes from database only

  // --- INITIALIZATION (URL PARSING) ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sharedParam = params.get("shared");
    const filterParam = params.get("filter");
    const totalParam = params.get("total");
    const stockParam = params.get("stock");
    const hidePriceParam = params.get("hidePrice");

    if (sharedParam) {
      setSharedIds(sharedParam.split(","));
    }
    if (filterParam && categories.includes(filterParam)) {
      setFilter(filterParam);
    }
    if (totalParam === "true") {
      setShowTotal(true);
    }
    if (stockParam === "true") {
      setShowStock(true);
    }
    if (hidePriceParam === "true") {
      setHidePrice(true);
    }
  }, [categories]);

  // --- ADMIN STATE INITIALIZATION ---
  useEffect(() => {
    // Check admin state synchronously to prevent flash of non-admin content
    const checkAdminState = () => {
      const adminEnabled = isAdminMode();
      setIsAdmin(adminEnabled);
    };
    
    // Check immediately on mount
    checkAdminState();
    
    // Also check on page visibility change (helps with browser back button)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkAdminState();
      }
    };
    
    // Also check on page focus (helps with browser back button)
    const handleFocus = () => {
      checkAdminState();
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // --- LOAD DATA ON MOUNT ---
  useEffect(() => {
    loadProductsFromDB();
    loadCategoriesFromDB();
  }, [loadProductsFromDB, loadCategoriesFromDB]);

  // --- DERIVED STATE ---
  const displayedProducts = useMemo(() => {
    let filtered = products;

    // 1. Filter by shared IDs or Category
    if (sharedIds.length > 0) {
      filtered = filtered.filter((p) => sharedIds.includes(p.id));
    } else if (filter !== "all") {
      filtered = filtered.filter((p) => p.category === filter);
    }

    // 2. Filter by Search Query
    if (searchQuery.trim() !== "") {
      const lowerQ = searchQuery.toLowerCase();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(lowerQ));
    }

    // 3. Inject calculated available stock (Total - Hold)
    return filtered.map((p) => {
      const t = parseInt(p.totalQuantity);
      const holdsArr = p.holds || [];
      const totalHold = holdsArr.reduce(
        (sum, h) => sum + (parseInt(h.quantity) || 0),
        0,
      );
      const calculatedAvailable = isNaN(t)
        ? ""
        : Math.max(0, t - totalHold).toString();

      return {
        ...p,
        calculatedAvailable,
        totalHold,
      };
    });
  }, [products, filter, sharedIds, searchQuery]);

  const calculatedTotal = useMemo(() => {
    if (!showTotal || effectiveHidePrice) return 0;
    return displayedProducts.reduce((sum, p) => {
      if (p.isSoldOut) return sum;
      const priceVal = parseFloat(String(p.price).replace(/[^0-9.-]+/g, ""));
      return sum + (isNaN(priceVal) ? 0 : priceVal);
    }, 0);
  }, [displayedProducts, showTotal, effectiveHidePrice]);

  const formattedTotal =
    new Intl.NumberFormat("en-IN", {
      maximumFractionDigits: 0,
    }).format(calculatedTotal) + " pts";

  // --- HELPERS ---
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3000);
  };

  const copyToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand("copy");
      showToast("Link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy", err);
    }
    document.body.removeChild(textArea);
  };

  // --- HANDLERS ---
  const handleSaveProduct = async (productData) => {
    try {
      if (activeModal === "add") {
        // Create new product in database
        const newProduct = await createProduct(productData);
        setProducts([newProduct, ...products]);
        showToast("Product added successfully");
      } else if (activeModal === "edit") {
        // Update existing product in database
        const updatedProduct = await updateProduct(productData.id, productData);
        setProducts(
          products.map((p) => (p.id === productData.id ? updatedProduct : p)),
        );
        showToast("Product updated successfully");
      }
      setActiveModal(null);
    } catch (error) {
      console.error("Failed to save product", error);
      showToast("Failed to save product. Please try again.");
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
      showToast("Product removed successfully");
      setActiveModal(null);
    } catch (error) {
      console.error("Failed to delete product", error);
      showToast("Failed to remove product. Please try again.");
    }
  };

  const toggleSelection = (id) => {
    const newSelection = new Set(selectedProductIds);
    if (newSelection.has(id)) newSelection.delete(id);
    else newSelection.add(id);
    setSelectedProductIds(newSelection);
  };

  const handleGenerateShareLink = ({
    includeTotal,
    includeStock,
    hidePriceConfig,
  }) => {
    const baseUrl = window.location.origin + window.location.pathname;
    const ids = Array.from(selectedProductIds).join(",");
    let shareUrl = `${baseUrl}?shared=${ids}`;

    if (includeTotal) shareUrl += "&total=true";
    if (includeStock) shareUrl += "&stock=true";
    if (hidePriceConfig) shareUrl += "&hidePrice=true";

    copyToClipboard(shareUrl);
    setIsSelectionMode(false);
    setSelectedProductIds(new Set());
    setActiveModal(null);
  };

  const copyCategoryLink = (cat) => {
    const baseUrl = window.location.origin + window.location.pathname;
    copyToClipboard(`${baseUrl}?filter=${cat}`);
  };

  const toggleAdmin = () => {
    if (isAdmin) {
      // Disable admin mode persistently
      toggleAdminMode();
      setIsAdmin(false);
      setIsSelectionMode(false);
      showToast("Logged out of Admin mode");
    } else {
      setActiveModal("adminLogin");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-inter text-gray-900 pb-20">
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      {/* HEADER */}
      <header className="sticky top-0 z-10 bg-white shadow-sm px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            {sharedIds.length > 0 ? "Curated Collection" : "Ready Stock"}
          </h1>
          {sharedIds.length === 0 && (
            <p className="text-xs text-gray-500">
              {isAdmin
                ? "Admin Mode (Editing Enabled)"
                : "Viewer Mode (Read-Only)"}
            </p>
          )}
        </div>

        {/* Menu Button */}
        <button
          onClick={() => setIsMenuOpen(true)}
          className="p-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors"
          title="Open Menu"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </header>

      {/* OFF-CANVAS MENU */}
      <OffCanvasMenu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        isAdmin={isAdmin}
        isSelectionMode={isSelectionMode}
        selectedCount={selectedProductIds.size}
        isAdminUnlocked={isAdmin}
        sharedIdsLength={sharedIds.length}
        onNavigate={(path) => router.push(path)}
        onToggleAdmin={toggleAdmin}
        onToggleSelectionMode={() => setIsSelectionMode(!isSelectionMode)}
        onOpenShareLinks={() => setActiveModal("shareOptions")}
        onOpenShareConfig={() => setActiveModal("shareConfig")}
      />

      {/* SEARCH BAR */}
      <div className="bg-white px-4 py-3 border-b border-gray-100">
        <div className="relative">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Search products by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 text-sm text-gray-900 rounded-xl pl-10 pr-10 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* FILTER TABS */}
      {sharedIds.length === 0 && (
        <div className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar items-center">
          {["all", ...categories].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                filter === f
                  ? "bg-gray-900 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {f}
            </button>
          ))}

          {isAdmin && (
            <button
              onClick={() => setActiveModal("categories")}
              className="px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap bg-blue-50 text-blue-600 flex items-center gap-1 ml-2"
            >
              <Settings size={14} /> Manage
            </button>
          )}
        </div>
      )}

      {/* PRODUCT GRID */}
      <main className="p-3">
        {displayedProducts.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            {searchQuery ? (
              <>
                <Search className="mx-auto mb-4 opacity-20" size={64} />
                <p>No products match "{searchQuery}"</p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-4 text-blue-600 font-medium"
                >
                  Clear Search
                </button>
              </>
            ) : (
              <>
                <ImageIcon className="mx-auto mb-4 opacity-20" size={64} />
                <p>No products found in this category.</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {displayedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                isSelectionMode={isSelectionMode}
                isSelected={selectedProductIds.has(product.id)}
                isAdmin={isAdmin}
                showStock={showStock}
                hidePrice={effectiveHidePrice}
                onSelect={() => toggleSelection(product.id)}
                onImageClick={() => {
                  if (isSelectionMode) {
                    toggleSelection(product.id);
                  } else {
                    // Navigate to product page using Next.js router for proper history
                    router.push(`/product/${product.id}`);
                  }
                }}
                onEdit={() => {
                  setCurrentProduct(product);
                  setActiveModal("edit");
                }}
              />
            ))}
          </div>
        )}
      </main>

      {/* FLOATING ACTION BUTTON */}
      {isAdmin && sharedIds.length === 0 && !isSelectionMode && (
        <button
          onClick={() => {
            setCurrentProduct(null);
            setActiveModal("add");
          }}
          className="fixed bottom-6 right-6 p-4 bg-blue-600 text-white rounded-full shadow-lg shadow-blue-200 hover:bg-blue-700 transition-transform active:scale-95 z-20"
        >
          <Plus size={28} />
        </button>
      )}

      {/* TOTAL VALUE BANNER (Viewer Mode) */}
      {showTotal && sharedIds.length > 0 && !effectiveHidePrice && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] z-20 flex justify-between items-center animate-slide-up">
          <div className="flex flex-col">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Estimated Total
            </span>
            <span className="text-sm text-gray-500 font-medium">
              {displayedProducts.length} items
            </span>
          </div>
          <span className="text-2xl font-bold text-blue-600">
            {formattedTotal}
          </span>
        </div>
      )}

      {/* MODALS */}
      {activeModal === "adminLogin" && (
        <AdminLoginModal
          onClose={() => setActiveModal(null)}
          onSuccess={() => {
            setIsAdmin(true);
            setActiveModal(null);
            showToast("Admin mode enabled");
          }}
        />
      )}

      {activeModal === "categories" && isAdmin && (
        <ManageCategoriesModal
          categories={categories}
          setCategories={setCategories}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === "shareOptions" && (
        <ShareOptionsModal
          categories={categories}
          onClose={() => setActiveModal(null)}
          onCopyCategory={copyCategoryLink}
          onCustomSelect={() => {
            setActiveModal(null);
            setIsSelectionMode(true);
          }}
        />
      )}

      {activeModal === "shareConfig" && (
        <ShareConfigModal
          selectedCount={selectedProductIds.size}
          onClose={() => setActiveModal(null)}
          onGenerate={handleGenerateShareLink}
        />
      )}

      {(activeModal === "add" || activeModal === "edit") && isAdmin && (
        <ProductFormModal
          product={currentProduct}
          categories={categories}
          onClose={() => setActiveModal(null)}
          onSave={handleSaveProduct}
          onDelete={() => handleDeleteProduct(currentProduct.id)}
        />
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-xl z-50 text-sm font-medium animate-fade-in-up whitespace-nowrap">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

// ─── PRODUCT CARD ─────────────────────────────────────────────────────────────

function ProductCard({
  product,
  isSelectionMode,
  isSelected,
  isAdmin,
  showStock,
  hidePrice,
  onSelect,
  onImageClick,
  onEdit,
}) {
  const displayName = product.name?.trim() || "Untitled Product";
  const displayPrice = product.price || "-";
  const isSoldOut =
    product.isSoldOut ||
    (product.calculatedAvailable !== "" &&
      parseInt(product.calculatedAvailable) <= 0);

  return (
    <div
      className={`relative bg-white rounded-2xl overflow-hidden shadow-sm border transition-all flex flex-col ${
        isSelected
          ? "ring-2 ring-blue-500 border-transparent"
          : "border-gray-100"
      }`}
    >
      {/* Image Container */}
      <div
        className="relative aspect-square bg-gray-100 cursor-pointer overflow-hidden group shrink-0"
        onClick={onImageClick}
      >
        {isSoldOut && (
          <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider z-10 shadow-sm backdrop-blur-sm">
            Sold Out
          </div>
        )}
        {product.images?.[0] ? (
            <img
              src={product.images[0]}
              alt={displayName}
              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-gray-300">
            <ImageIcon size={48} />
          </div>
        )}

        {/* Multiple Images Indicator */}
        {product.images?.length > 1 && (
          <div className="absolute top-2 right-2 bg-black/50 text-white text-[10px] font-bold px-2 py-1 rounded-full backdrop-blur-sm">
            1/{product.images.length}
          </div>
        )}

        {/* Selection Overlay */}
        {isSelectionMode && (
          <div className="absolute inset-0 bg-black/10 flex items-start justify-start p-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                isSelected
                  ? "bg-blue-500 border-blue-500 text-white"
                  : "bg-white border-gray-300 text-transparent"
              }`}
            >
              <Check size={14} strokeWidth={3} />
            </div>
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-4 flex flex-col flex-1 bg-white">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="text-[15px] font-semibold text-slate-900 leading-tight line-clamp-2 flex-1">
            {displayName}
          </h3>
          {isAdmin && !isSelectionMode && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg shrink-0 -mt-1 -mr-1 transition-colors"
            >
              <Edit2 size={16} />
            </button>
          )}
        </div>

        <div className="flex flex-col space-y-1 mt-auto antialiased">
          {product.size && (
            <p className="text-[13px] font-medium text-slate-500 truncate">
              Size: <span className="text-slate-700">{product.size}</span>
            </p>
          )}
          {product.pcsPerCarton && (
            <p className="text-[13px] font-medium text-slate-500 truncate">
              Packing:{" "}
              <span className="text-slate-700">{product.pcsPerCarton}</span>
            </p>
          )}
          {(showStock || isAdmin) && product.calculatedAvailable !== "" && (
            <p className="text-[13px] font-medium text-slate-500 truncate mt-1">
              Stock:{" "}
              <span className="text-slate-700">
                {product.calculatedAvailable}
              </span>
              {isAdmin && product.totalHold > 0 && (
                <span className="text-amber-600 ml-1 font-semibold text-[11px]">
                  (Hold: {product.totalHold})
                </span>
              )}
            </p>
          )}
          {isSoldOut ? (
            <p className="text-[13px] font-bold text-red-600 pt-1.5 truncate uppercase tracking-wider">
              Sold Out
            </p>
          ) : (
            !hidePrice && (
              <p className="text-[15px] font-semibold text-slate-900 pt-1.5 truncate">
                {displayPrice}{" "}
                <span className="text-xs font-normal text-slate-500">
                  pts
                </span>
              </p>
            )
          )}
          {product.deliveryTime && (
            <p className="text-[12px] font-medium text-amber-600 truncate mt-0.5">
              Delivery:{" "}
              <span className="text-amber-700">{product.deliveryTime}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
