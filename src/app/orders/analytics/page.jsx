"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BarChart3, TrendingUp, TrendingDown, Users, CreditCard, Truck, Calendar, DollarSign, Package, Filter, Download, RefreshCw } from "lucide-react";
import useAdminAuth from "@/hooks/useAdminAuth";
import { fetchOrderAnalytics, fetchOrdersByStatus, fetchOrdersByDateRange } from "@/lib/api";

export default function OrdersAnalyticsPage() {
  const router = useRouter();
  const { isAdmin, isLoaded } = useAdminAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    // Wait for auth to load before checking admin status
    if (isLoaded) {
      if (!isAdmin) {
        // Redirect to main catalog if not in admin mode
        router.push('/catalog');
        return;
      }
      
      // Fetch analytics data
      const loadAnalytics = async () => {
        try {
          const analyticsData = await fetchOrderAnalytics();
          setAnalytics(analyticsData);
        } catch (error) {
          console.error('Error fetching analytics:', error);
        } finally {
          setLoading(false);
        }
      };

      loadAnalytics();
    }
  }, [isAdmin, isLoaded, router]);

  // Show loading state while checking auth
  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null; // Will redirect automatically in useEffect
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusPercentage = (status) => {
    if (!analytics || analytics.totalOrders === 0) return 0;
    const statusCount = analytics.statusCounts.find(s => s._id === status)?.count || 0;
    return ((statusCount / analytics.totalOrders) * 100).toFixed(1);
  };

  const getRevenueGrowth = () => {
    if (!analytics || !analytics.monthlyRevenue || analytics.monthlyRevenue.length < 2) return 0;
    
    const currentMonth = analytics.monthlyRevenue[analytics.monthlyRevenue.length - 1]?.total || 0;
    const previousMonth = analytics.monthlyRevenue[analytics.monthlyRevenue.length - 2]?.total || 0;
    
    if (previousMonth === 0) return currentMonth > 0 ? 100 : 0;
    
    const growth = ((currentMonth - previousMonth) / previousMonth) * 100;
    return growth.toFixed(1);
  };

  const getOrderGrowth = () => {
    if (!analytics || !analytics.monthlyRevenue || analytics.monthlyRevenue.length < 2) return 0;
    
    const currentMonth = analytics.monthlyRevenue[analytics.monthlyRevenue.length - 1]?.count || 0;
    const previousMonth = analytics.monthlyRevenue[analytics.monthlyRevenue.length - 2]?.count || 0;
    
    if (previousMonth === 0) return currentMonth > 0 ? 100 : 0;
    
    const growth = ((currentMonth - previousMonth) / previousMonth) * 100;
    return growth.toFixed(1);
  };

  const averageOrderValue = analytics && analytics.totalOrders > 0 
    ? analytics.totalRevenue / analytics.totalOrders 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/orders')}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Order Analytics</h1>
                <p className="text-sm text-gray-500">Sales performance and order insights</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <RefreshCw size={18} />
                Refresh
              </button>
              <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Download size={18} />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">{analytics?.totalOrders || 0}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Package size={32} className="text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-gray-600">This month:</span>
              <span className="font-semibold text-blue-600">
                {analytics?.monthlyRevenue?.length > 0 ? analytics.monthlyRevenue[analytics.monthlyRevenue.length - 1].count : 0}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(analytics?.totalRevenue || 0)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign size={32} className="text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-gray-600">Growth:</span>
              <span className={`font-semibold ${parseFloat(getRevenueGrowth()) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {parseFloat(getRevenueGrowth()) >= 0 ? '+' : ''}{getRevenueGrowth()}%
              </span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Order Value</p>
                <p className="text-3xl font-bold text-purple-600">{formatCurrency(averageOrderValue)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp size={32} className="text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-gray-600">Per order</span>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Delivered Orders</p>
                <p className="text-3xl font-bold text-orange-600">
                  {analytics?.statusCounts?.find(s => s._id === 'delivered')?.count || 0}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Truck size={32} className="text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm">
              <span className="text-gray-600">Success rate:</span>
              <span className="font-semibold text-orange-600">
                {getStatusPercentage('delivered')}%
              </span>
            </div>
          </div>
        </div>

        {/* Charts and Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Status Distribution */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 size={20} />
              Order Status Distribution
            </h3>
            
            <div className="space-y-4">
              {[
                { status: 'pending', label: 'Pending', color: 'bg-yellow-500' },
                { status: 'confirmed', label: 'Confirmed', color: 'bg-blue-500' },
                { status: 'processing', label: 'Processing', color: 'bg-purple-500' },
                { status: 'shipped', label: 'Shipped', color: 'bg-orange-500' },
                { status: 'delivered', label: 'Delivered', color: 'bg-green-500' },
                { status: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
                { status: 'refunded', label: 'Refunded', color: 'bg-gray-500' }
              ].map(({ status, label, color }) => {
                const count = analytics?.statusCounts?.find(s => s._id === status)?.count || 0;
                const percentage = getStatusPercentage(status);
                
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${color}`}></div>
                      <span className="font-medium text-gray-900">{label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${color}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700">{count} ({percentage}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly Performance */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar size={20} />
              Monthly Performance
            </h3>
            
            <div className="space-y-4">
              {analytics?.monthlyRevenue?.length > 0 ? (
                analytics.monthlyRevenue.map((month, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">
                        {new Date(month._id.year, month._id.month - 1).toLocaleDateString('en-IN', { year: 'numeric', month: 'long' })}
                      </p>
                      <p className="text-sm text-gray-600">{month.count} orders</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{formatCurrency(month.total)}</p>
                      <p className="text-sm text-gray-600">Revenue</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No monthly data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Growth */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Growth</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">This Month</span>
                <span className="font-bold text-gray-900">
                  {analytics?.monthlyRevenue?.length > 0 ? formatCurrency(analytics.monthlyRevenue[analytics.monthlyRevenue.length - 1].total) : '₹0'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Last Month</span>
                <span className="font-bold text-gray-900">
                  {analytics?.monthlyRevenue?.length > 1 ? formatCurrency(analytics.monthlyRevenue[analytics.monthlyRevenue.length - 2].total) : '₹0'}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-gray-600">Growth Rate</span>
                <span className={`font-bold ${parseFloat(getRevenueGrowth()) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {parseFloat(getRevenueGrowth()) >= 0 ? '+' : ''}{getRevenueGrowth()}%
                  {parseFloat(getRevenueGrowth()) >= 0 ? (
                    <TrendingUp size={16} className="inline ml-1" />
                  ) : (
                    <TrendingDown size={16} className="inline ml-1" />
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Order Growth */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Growth</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">This Month</span>
                <span className="font-bold text-gray-900">
                  {analytics?.monthlyRevenue?.length > 0 ? analytics.monthlyRevenue[analytics.monthlyRevenue.length - 1].count : 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Last Month</span>
                <span className="font-bold text-gray-900">
                  {analytics?.monthlyRevenue?.length > 1 ? analytics.monthlyRevenue[analytics.monthlyRevenue.length - 2].count : 0}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                <span className="text-gray-600">Growth Rate</span>
                <span className={`font-bold ${parseFloat(getOrderGrowth()) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {parseFloat(getOrderGrowth()) >= 0 ? '+' : ''}{getOrderGrowth()}%
                  {parseFloat(getOrderGrowth()) >= 0 ? (
                    <TrendingUp size={16} className="inline ml-1" />
                  ) : (
                    <TrendingDown size={16} className="inline ml-1" />
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Key Metrics Summary */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-blue-900">Conversion Rate</p>
                  <p className="text-sm text-blue-600">Orders per visitor</p>
                </div>
                <span className="text-2xl font-bold text-blue-900">N/A</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <div>
                  <p className="font-medium text-green-900">Repeat Customers</p>
                  <p className="text-sm text-green-600">Loyal customer rate</p>
                </div>
                <span className="text-2xl font-bold text-green-900">N/A</span>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <div>
                  <p className="font-medium text-purple-900">Avg Processing Time</p>
                  <p className="text-sm text-purple-600">From order to delivery</p>
                </div>
                <span className="text-2xl font-bold text-purple-900">N/A</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">View Pending Orders</span>
                <Package size={20} className="text-yellow-600" />
              </div>
              <p className="text-sm text-gray-600">Manage orders that need attention</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">Export Sales Report</span>
                <Download size={20} className="text-blue-600" />
              </div>
              <p className="text-sm text-gray-600">Download detailed sales analytics</p>
            </button>
            
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">Customer Insights</span>
                <Users size={20} className="text-green-600" />
              </div>
              <p className="text-sm text-gray-600">Analyze customer behavior patterns</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}