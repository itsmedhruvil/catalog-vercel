"use client";

import { useState, useEffect, useMemo } from 'react';
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingDown,
  Star,
  Calendar,
  Eye,
  EyeOff,
  Filter,
  Download,
  Plus,
  X
} from 'lucide-react';

export default function SimpleInventoryAlerts({ products = [], setProducts, showToast }) {
  const [showFilters, setShowFilters] = useState(false);
  const [alertType, setAlertType] = useState('all');
  const [severity, setSeverity] = useState('all');

  // Simple alert detection based on existing data
  const alerts = useMemo(() => {
    const detectedAlerts = [];
    
    products.forEach(product => {
      const stock = parseInt(product.totalQuantity) || 0;
      const holds = product.holds || [];
      const totalHold = holds.reduce((sum, h) => sum + (parseInt(h.quantity) || 0), 0);
      const availableStock = Math.max(0, stock - totalHold);

      // Low Stock Alert
      if (availableStock <= 5 && availableStock > 0) {
        detectedAlerts.push({
          id: `${product.id}-low-stock`,
          type: 'low-stock',
          severity: 'warning',
          title: 'Low Stock Alert',
          message: `${product.name} has only ${availableStock} units available`,
          product: product.name,
          category: product.category,
          timestamp: new Date().toISOString()
        });
      } else if (availableStock === 0) {
        detectedAlerts.push({
          id: `${product.id}-out-of-stock`,
          type: 'out-of-stock',
          severity: 'critical',
          title: 'Out of Stock Alert',
          message: `${product.name} is completely out of stock`,
          product: product.name,
          category: product.category,
          timestamp: new Date().toISOString()
        });
      }

      // No Delivery Time Alert
      if (!product.deliveryTime) {
        detectedAlerts.push({
          id: `${product.id}-no-delivery`,
          type: 'no-delivery',
          severity: 'info',
          title: 'Missing Delivery Information',
          message: `${product.name} doesn't have delivery time specified`,
          product: product.name,
          category: product.category,
          timestamp: new Date().toISOString()
        });
      }

      // No Images Alert
      if (!product.images || product.images.length === 0) {
        detectedAlerts.push({
          id: `${product.id}-no-images`,
          type: 'no-images',
          severity: 'info',
          title: 'Missing Product Images',
          message: `${product.name} doesn't have any images`,
          product: product.name,
          category: product.category,
          timestamp: new Date().toISOString()
        });
      }
    });

    return detectedAlerts;
  }, [products]);

  // Filtered alerts
  const filteredAlerts = useMemo(() => {
    let filtered = alerts;

    if (alertType !== 'all') {
      filtered = filtered.filter(alert => alert.type === alertType);
    }

    if (severity !== 'all') {
      filtered = filtered.filter(alert => alert.severity === severity);
    }

    // Sort by severity and timestamp
    filtered.sort((a, b) => {
      const severityOrder = { critical: 3, warning: 2, info: 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return new Date(b.timestamp) - new Date(a.timestamp);
    });

    return filtered;
  }, [alerts, alertType, severity]);

  const dismissAlert = (alertId) => {
    // For now, we'll just show a toast since we don't have persistent alert storage
    const alert = alerts.find(a => a.id === alertId);
    showToast(`Alert dismissed: ${alert?.title}`);
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'addProduct':
        showToast('Redirecting to add new product...');
        // In a real app, this would navigate to product creation
        break;
      case 'updateInventory':
        showToast('Redirecting to inventory management...');
        // In a real app, this would navigate to inventory management
        break;
      case 'reviewOrders':
        showToast('Redirecting to order review...');
        // In a real app, this would navigate to order management
        break;
      default:
        showToast('Action in development');
    }
  };

  const exportAlerts = () => {
    const csvContent = [
      ['Alert Type', 'Severity', 'Product', 'Message', 'Category', 'Timestamp'],
      ...filteredAlerts.map(alert => [
        alert.type,
        alert.severity,
        alert.product,
        alert.message,
        alert.category,
        new Date(alert.timestamp).toLocaleString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alerts-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Alerts report exported successfully');
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'warning': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'info': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAlertIcon = (type) => {
    switch (type) {
      case 'low-stock': return <AlertTriangle size={16} />;
      case 'out-of-stock': return <AlertTriangle size={16} />;
      case 'no-delivery': return <Clock size={16} />;
      case 'no-images': return <EyeOff size={16} />;
      default: return <Bell size={16} />;
    }
  };

  const alertStats = useMemo(() => {
    const stats = {
      total: alerts.length,
      critical: alerts.filter(a => a.severity === 'critical').length,
      warning: alerts.filter(a => a.severity === 'warning').length,
      info: alerts.filter(a => a.severity === 'info').length,
      lowStock: alerts.filter(a => a.type === 'low-stock').length,
      outOfStock: alerts.filter(a => a.type === 'out-of-stock').length,
      noDelivery: alerts.filter(a => a.type === 'no-delivery').length,
      noImages: alerts.filter(a => a.type === 'no-images').length
    };
    return stats;
  }, [alerts]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Alerts</h1>
          <p className="text-gray-600 mt-1">Monitor inventory levels and product information</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportAlerts}
            className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Download size={18} />
            Export Alerts
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter size={18} />
            Filters
          </button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alert Type</label>
              <select
                value={alertType}
                onChange={(e) => setAlertType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
                <option value="no-delivery">No Delivery Time</option>
                <option value="no-images">No Images</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setAlertType('all');
                  setSeverity('all');
                }}
                className="w-full px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-6 border border-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Critical Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{alertStats.critical}</p>
            </div>
            <AlertTriangle size={32} className="text-red-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Warning Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{alertStats.warning}</p>
            </div>
            <Clock size={32} className="text-yellow-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Info Alerts</p>
              <p className="text-2xl font-bold text-gray-900">{alertStats.info}</p>
            </div>
            <EyeOff size={32} className="text-blue-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Stock Items</p>
              <p className="text-2xl font-bold text-gray-900">{alertStats.lowStock}</p>
            </div>
            <TrendingDown size={32} className="text-purple-500" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Out of Stock Items</p>
              <p className="text-2xl font-bold text-gray-900">{alertStats.outOfStock}</p>
            </div>
            <AlertTriangle size={32} className="text-green-500" />
          </div>
        </div>
      </div>

      {/* Alert List */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Active Alerts</h3>
          <span className="text-sm text-gray-500">{filteredAlerts.length} alerts</span>
        </div>
        
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Alerts</h3>
            <p className="text-gray-500">Your inventory is in good condition!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map(alert => (
              <div key={alert.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${getSeverityColor(alert.severity)}`}>
                      {getAlertIcon(alert.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{alert.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                          {alert.severity}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{alert.message}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="capitalize">• {alert.category}</span>
                        <span>• {new Date(alert.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Plus size={20} />
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button 
              onClick={() => handleQuickAction('addProduct')}
              className="w-full p-3 bg-blue-50 text-blue-700 rounded-lg font-medium hover:bg-blue-100 transition-colors text-left cursor-pointer"
            >
              <div className="font-semibold">Add New Product</div>
              <div className="text-xs text-gray-600">Add products to prevent stockouts</div>
            </button>
            <button 
              onClick={() => handleQuickAction('updateInventory')}
              className="w-full p-3 bg-green-50 text-green-700 rounded-lg font-medium hover:bg-green-100 transition-colors text-left cursor-pointer"
            >
              <div className="font-semibold">Update Inventory</div>
              <div className="text-xs text-gray-600">Update stock levels and delivery times</div>
            </button>
            <button 
              onClick={() => handleQuickAction('reviewOrders')}
              className="w-full p-3 bg-purple-50 text-purple-700 rounded-lg font-medium hover:bg-purple-100 transition-colors text-left cursor-pointer"
            >
              <div className="font-semibold">Review Orders</div>
              <div className="text-xs text-gray-600">Check pending orders and deliveries</div>
            </button>
          </div>
        </div>

        {/* Alert Summary */}
        <div className="md:col-span-2 bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Alert Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{alertStats.outOfStock}</div>
              <div className="text-sm text-red-700 font-medium">Out of Stock</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{alertStats.lowStock}</div>
              <div className="text-sm text-yellow-700 font-medium">Low Stock</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{alertStats.noDelivery}</div>
              <div className="text-sm text-blue-700 font-medium">No Delivery Time</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">{alertStats.noImages}</div>
              <div className="text-sm text-gray-700 font-medium">No Images</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}