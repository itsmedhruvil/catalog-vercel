import { useState, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Package,
  Truck,
  Clock,
  Star,
  Users,
  BarChart3,
  X,
  Eye,
  EyeOff,
  RefreshCw,
  Settings,
  Calendar,
  MapPin
} from 'lucide-react';

export default function InventoryAlerts({ products, onAlertClick }) {
  const [alerts, setAlerts] = useState([]);
  const [showAlerts, setShowAlerts] = useState(true);
  const [alertSettings, setAlertSettings] = useState({
    lowStockThreshold: 10,
    highStockThreshold: 100,
    salesDeclineThreshold: 30,
    deliveryDelayThreshold: 7,
    ratingThreshold: 3.5
  });

  // Generate alerts based on product data
  useEffect(() => {
    const generatedAlerts = [];

    products.forEach(product => {
      const stock = parseInt(product.availableQuantity) || 0;
      const reorderLevel = parseInt(product.reorderLevel) || 0;
      const salesLast30 = product.salesLast30Days || 0;
      const salesPrev30 = product.salesPrevious30Days || 0;
      const avgDeliveryTime = product.avgDeliveryTime || 0;
      const avgRating = product.avgRating || 0;

      // Low Stock Alert
      if (reorderLevel > 0 && stock <= reorderLevel) {
        generatedAlerts.push({
          id: `low-stock-${product.id}`,
          type: 'low-stock',
          severity: 'high',
          title: 'Low Stock Alert',
          message: `${product.name} has low stock (${stock} units)`,
          product: product.name,
          category: product.category,
          timestamp: new Date(),
          action: 'Reorder Now',
          icon: Package
        });
      }

      // High Stock Alert
      if (stock > alertSettings.highStockThreshold && salesLast30 < 10) {
        generatedAlerts.push({
          id: `high-stock-${product.id}`,
          type: 'high-stock',
          severity: 'medium',
          title: 'High Stock Alert',
          message: `${product.name} has high stock (${stock} units) with low sales`,
          product: product.name,
          category: product.category,
          timestamp: new Date(),
          action: 'Review Pricing',
          icon: Package
        });
      }

      // Sales Decline Alert
      if (salesPrev30 > 0) {
        const decline = ((salesPrev30 - salesLast30) / salesPrev30) * 100;
        if (decline > alertSettings.salesDeclineThreshold) {
          generatedAlerts.push({
            id: `sales-decline-${product.id}`,
            type: 'sales-decline',
            severity: 'medium',
            title: 'Sales Decline Alert',
            message: `${product.name} sales dropped by ${decline.toFixed(1)}%`,
            product: product.name,
            category: product.category,
            timestamp: new Date(),
            action: 'Review Strategy',
            icon: TrendingDown
          });
        }
      }

      // Delivery Delay Alert
      if (avgDeliveryTime > alertSettings.deliveryDelayThreshold) {
        generatedAlerts.push({
          id: `delivery-delay-${product.id}`,
          type: 'delivery-delay',
          severity: 'medium',
          title: 'Delivery Delay Alert',
          message: `${product.name} has slow delivery (${avgDeliveryTime} days avg)`,
          product: product.name,
          category: product.category,
          timestamp: new Date(),
          action: 'Contact Supplier',
          icon: Truck
        });
      }

      // Low Rating Alert
      if (avgRating < alertSettings.ratingThreshold && avgRating > 0) {
        generatedAlerts.push({
          id: `low-rating-${product.id}`,
          type: 'low-rating',
          severity: 'medium',
          title: 'Low Rating Alert',
          message: `${product.name} has low rating (${avgRating.toFixed(1)} ⭐)`,
          product: product.name,
          category: product.category,
          timestamp: new Date(),
          action: 'Review Quality',
          icon: Star
        });
      }

      // Expiry Date Alert
      if (product.expiryDate) {
        const expiryDate = new Date(product.expiryDate);
        const today = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry <= 30 && daysUntilExpiry > 0) {
          generatedAlerts.push({
            id: `expiry-${product.id}`,
            type: 'expiry',
            severity: 'high',
            title: 'Expiry Alert',
            message: `${product.name} expires in ${daysUntilExpiry} days`,
            product: product.name,
            category: product.category,
            timestamp: new Date(),
            action: 'Clearance Sale',
            icon: Calendar
          });
        } else if (daysUntilExpiry <= 0) {
          generatedAlerts.push({
            id: `expired-${product.id}`,
            type: 'expired',
            severity: 'critical',
            title: 'Expired Product Alert',
            message: `${product.name} has expired`,
            product: product.name,
            category: product.category,
            timestamp: new Date(),
            action: 'Remove from Stock',
            icon: AlertTriangle
          });
        }
      }
    });

    // Sort alerts by severity and timestamp
    const sortedAlerts = generatedAlerts.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    setAlerts(sortedAlerts);
  }, [products, alertSettings]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical': return AlertTriangle;
      case 'high': return AlertTriangle;
      case 'medium': return Clock;
      case 'low': return Eye;
      default: return Bell;
    }
  };

  const dismissAlert = (alertId) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const dismissAllAlerts = () => {
    setAlerts([]);
  };

  const markAsRead = (alertId) => {
    // In a real app, this would update a read status
    console.log(`Marked alert ${alertId} as read`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Inventory Alerts & Notifications</h2>
          <p className="text-gray-600 mt-1">Real-time monitoring and automated alerts</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={dismissAllAlerts}
            className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            Dismiss All
          </button>
          <button
            onClick={() => setShowAlerts(!showAlerts)}
            className="px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {showAlerts ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Alert Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4 border border-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Critical Alerts</p>
              <p className="text-2xl font-bold text-gray-900">
                {alerts.filter(a => a.severity === 'critical').length}
              </p>
            </div>
            <AlertTriangle size={32} className="text-red-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">High Priority</p>
              <p className="text-2xl font-bold text-gray-900">
                {alerts.filter(a => a.severity === 'high').length}
              </p>
            </div>
            <Package size={32} className="text-orange-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Medium Priority</p>
              <p className="text-2xl font-bold text-gray-900">
                {alerts.filter(a => a.severity === 'medium').length}
              </p>
            </div>
            <Clock size={32} className="text-yellow-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Low Priority</p>
              <p className="text-2xl font-bold text-gray-900">
                {alerts.filter(a => a.severity === 'low').length}
              </p>
            </div>
            <Eye size={32} className="text-blue-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Total Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
            </div>
            <Bell size={32} className="text-green-500" />
          </div>
        </div>
      </div>

      {/* Alert List */}
      {showAlerts && (
        <div className="space-y-4">
          {alerts.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp size={32} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">All Clear! 🎉</h3>
              <p className="text-gray-600">No inventory alerts at this time. Everything is running smoothly.</p>
            </div>
          ) : (
            alerts.map(alert => {
              const IconComponent = alert.icon;
              const SeverityIcon = getSeverityIcon(alert.severity);

              return (
                <div
                  key={alert.id}
                  className={`bg-white rounded-xl p-6 border-2 ${getSeverityColor(alert.severity)} shadow-sm hover:shadow-md transition-shadow cursor-pointer`}
                  onClick={() => onAlertClick && onAlertClick(alert)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${getSeverityColor(alert.severity)}`}>
                        <IconComponent size={24} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                            {alert.severity.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-500">{alert.category}</span>
                          <span className="text-sm text-gray-500">•</span>
                          <span className="text-sm text-gray-500">{new Date(alert.timestamp).toLocaleString()}</span>
                        </div>
                        
                        <h4 className="text-lg font-semibold text-gray-900 mb-1">{alert.title}</h4>
                        <p className="text-gray-700 mb-3">{alert.message}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Package size={16} />
                            {alert.product}
                          </span>
                          <span className="flex items-center gap-1">
                            <SeverityIcon size={16} />
                            {alert.action}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          dismissAlert(alert.id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Dismiss Alert"
                      >
                        <X size={20} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(alert.id);
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Mark as Read"
                      >
                        <Eye size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Alert Settings */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Settings size={20} />
            Alert Settings
          </h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Save Settings
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Low Stock Threshold</label>
            <input
              type="number"
              value={alertSettings.lowStockThreshold}
              onChange={(e) => setAlertSettings(prev => ({ ...prev, lowStockThreshold: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">High Stock Threshold</label>
            <input
              type="number"
              value={alertSettings.highStockThreshold}
              onChange={(e) => setAlertSettings(prev => ({ ...prev, highStockThreshold: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sales Decline %</label>
            <input
              type="number"
              value={alertSettings.salesDeclineThreshold}
              onChange={(e) => setAlertSettings(prev => ({ ...prev, salesDeclineThreshold: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Delay (Days)</label>
            <input
              type="number"
              value={alertSettings.deliveryDelayThreshold}
              onChange={(e) => setAlertSettings(prev => ({ ...prev, deliveryDelayThreshold: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating Threshold</label>
            <input
              type="number"
              step="0.1"
              value={alertSettings.ratingThreshold}
              onChange={(e) => setAlertSettings(prev => ({ ...prev, ratingThreshold: parseFloat(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 hover:bg-red-100 transition-colors">
          <div className="flex items-center gap-3">
            <AlertTriangle size={24} className="text-red-500" />
            <div className="text-left">
              <p className="font-semibold">Review Critical Alerts</p>
              <p className="text-sm text-red-600">{alerts.filter(a => a.severity === 'critical').length} items</p>
            </div>
          </div>
        </button>

        <button className="bg-orange-50 text-orange-700 p-4 rounded-xl border border-orange-200 hover:bg-orange-100 transition-colors">
          <div className="flex items-center gap-3">
            <Package size={24} className="text-orange-500" />
            <div className="text-left">
              <p className="font-semibold">Reorder Products</p>
              <p className="text-sm text-orange-600">{alerts.filter(a => a.type === 'low-stock').length} items</p>
            </div>
          </div>
        </button>

        <button className="bg-yellow-50 text-yellow-700 p-4 rounded-xl border border-yellow-200 hover:bg-yellow-100 transition-colors">
          <div className="flex items-center gap-3">
            <Truck size={24} className="text-yellow-500" />
            <div className="text-left">
              <p className="font-semibold">Check Deliveries</p>
              <p className="text-sm text-yellow-600">{alerts.filter(a => a.type === 'delivery-delay').length} delays</p>
            </div>
          </div>
        </button>

        <button className="bg-blue-50 text-blue-700 p-4 rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors">
          <div className="flex items-center gap-3">
            <BarChart3 size={24} className="text-blue-500" />
            <div className="text-left">
              <p className="font-semibold">Generate Report</p>
              <p className="text-sm text-blue-600">All alerts summary</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}