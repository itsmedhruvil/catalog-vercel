"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  BarChart3,
  Bell,
  Package,
  Plus,
  ShoppingCart,
  Truck,
  Users,
} from "lucide-react";
import useAdminAuth from "@/hooks/useAdminAuth";
import { fetchCustomers, fetchOrders, fetchProducts } from "@/lib/api";

const managementLinks = [
  {
    title: "Add Item",
    description: "Create a new product with photos, price, stock, and delivery info.",
    href: "/catalog?action=add-product",
    icon: Plus,
    tone: "bg-blue-600 text-white hover:bg-blue-700",
  },
  {
    title: "Products",
    description: "Edit catalog items, inventory, categories, and shareable product links.",
    href: "/catalog",
    icon: Package,
    tone: "bg-white text-gray-900 hover:bg-gray-50",
  },
  {
    title: "Orders",
    description: "Track every order, create manual orders, and update order status.",
    href: "/orders",
    icon: ShoppingCart,
    tone: "bg-white text-gray-900 hover:bg-gray-50",
  },
  {
    title: "Alerts",
    description: "Confirm incoming orders and watch low inventory from one queue.",
    href: "/alerts",
    icon: Bell,
    tone: "bg-white text-gray-900 hover:bg-gray-50",
  },
  {
    title: "Clients",
    description: "Manage customer records and start orders from saved client details.",
    href: "/clients",
    icon: Users,
    tone: "bg-white text-gray-900 hover:bg-gray-50",
  },
  {
    title: "Delivery",
    description: "Review delivery workload, timelines, and fulfillment status.",
    href: "/delivery",
    icon: Truck,
    tone: "bg-white text-gray-900 hover:bg-gray-50",
  },
  {
    title: "Analytics",
    description: "Check sales, inventory movement, and product performance.",
    href: "/analytics",
    icon: BarChart3,
    tone: "bg-white text-gray-900 hover:bg-gray-50",
  },
];

export default function AdminPage() {
  const router = useRouter();
  const { isAdmin, isLoaded, isSignedIn, user } = useAdminAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    if (!isAdmin) {
      router.push("/catalog");
      return;
    }

    async function loadAdminData() {
      try {
        const [productsData, ordersData, customersData] = await Promise.all([
          fetchProducts(),
          fetchOrders(),
          fetchCustomers(),
        ]);
        setProducts(productsData);
        setOrders(ordersData);
        setCustomers(customersData);
      } catch (error) {
        console.error("Failed to load admin dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadAdminData();
  }, [isLoaded, isSignedIn, isAdmin, router]);

  const stats = useMemo(() => {
    const pendingOrders = orders.filter((order) => {
      const status = order.orderStatus || order.status || "pending";
      return status === "pending";
    });

    const lowStock = products.filter((product) => {
      const stock = Number(product.totalQuantity || product.calculatedAvailable || 0);
      return stock <= 5;
    });

    const revenue = orders.reduce(
      (sum, order) => sum + Number(order.totalAmount || 0),
      0,
    );

    return [
      { label: "Products", value: products.length.toLocaleString(), icon: Package },
      { label: "Orders", value: orders.length.toLocaleString(), icon: ShoppingCart },
      { label: "Pending", value: pendingOrders.length.toLocaleString(), icon: Bell },
      { label: "Low Stock", value: lowStock.length.toLocaleString(), icon: AlertCircle },
      { label: "Clients", value: customers.length.toLocaleString(), icon: Users },
      {
        label: "Revenue",
        value: `₹${Math.round(revenue).toLocaleString("en-IN")}`,
        icon: BarChart3,
      },
    ];
  }, [products, orders, customers]);

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Admin Control Center</p>
              <h1 className="text-3xl font-bold text-gray-900">
                Manage the whole business
              </h1>
              <p className="mt-1 text-gray-600">
                Products, orders, clients, delivery, alerts, and reporting are all here.
              </p>
            </div>
            <button
              onClick={() => router.push("/catalog?action=add-product")}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              <Plus size={18} />
              Add Item
            </button>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Signed in as {user?.primaryEmailAddress?.emailAddress || "admin"}.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        <section className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between gap-3">
                <stat.icon size={20} className="text-blue-600" />
                <span className="text-xs font-medium text-gray-500">{stat.label}</span>
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          ))}
        </section>

        <section>
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Management</h2>
            <p className="text-sm text-gray-500">Choose what you want to run.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {managementLinks.map((item) => (
              <button
                key={item.href + item.title}
                onClick={() => router.push(item.href)}
                className={`text-left border border-gray-200 rounded-lg p-5 shadow-sm transition-colors ${item.tone}`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-gray-100 text-blue-600">
                    <item.icon size={22} />
                  </div>
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className={`mt-1 text-sm ${item.title === "Add Item" ? "text-blue-50" : "text-gray-500"}`}>
                      {item.description}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
