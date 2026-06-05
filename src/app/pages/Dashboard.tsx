import { useNavigate } from "react-router";
import {
  Users,
  Receipt,
  Package,
  History,
  Settings,
  Store,
  Bell,
  Search,
  ChevronRight,
  Clock,
  TrendingUp,
  FileText,
  BarChart3,
  AlertTriangle,
  Plus,
  Zap,
  PowerOff,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { PowerDialog } from "../components/PowerDialog";

type RecentInvoice = {
  id: string;
  invoiceNo: string;
  customer: string;
  date: string;
  amount: number;
  status: string;
};

type QuickStat = {
  label: string;
  value: string;
  sub: string;
  icon: any;
  color: string;
};

const MODULES = [
  {
    id: "customers",
    label: "Customers",
    description: "Manage customer records and contacts",
    icon: Users,
    path: "/customers",
    color: "bg-blue-50 text-blue-600 border-blue-100",
    iconBg: "bg-blue-100",
  },
  {
    id: "billing",
    label: "Billing",
    description: "Create invoices, receipts and manage billing",
    icon: Receipt,
    path: "/billing",
    color: "bg-indigo-50 text-indigo-600 border-indigo-100",
    iconBg: "bg-indigo-100",
    primary: true,
  },
  {
    id: "products",
    label: "Products",
    description: "Manage inventory, stock and pricing",
    icon: Package,
    path: "/products",
    color: "bg-amber-50 text-amber-600 border-amber-100",
    iconBg: "bg-amber-100",
  },
  {
    id: "history",
    label: "Invoice History",
    description: "View, reprint and download past invoices",
    icon: History,
    path: "/history",
    color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    iconBg: "bg-emerald-100",
  },
  {
    id: "analytics",
    label: "Reports",
    description: "Sales analysis, GST reports and exports",
    icon: BarChart3,
    path: "/reports",
    color: "bg-purple-50 text-purple-600 border-purple-100",
    iconBg: "bg-purple-100",
  },
  {
    id: "settings",
    label: "Settings",
    description: "Configure shop preferences and system",
    icon: Settings,
    path: "/settings",
    color: "bg-slate-50 text-slate-600 border-slate-200",
    iconBg: "bg-slate-100",
  },
];

function getHour() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function Dashboard() {
  const navigate = useNavigate();
  const [now, setNow] = useState(new Date());
  const [recentInvoices, setRecentInvoices] = useState<RecentInvoice[]>([]);
  const [stats, setStats] = useState<QuickStat[]>([]);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [showPower, setShowPower] = useState(false);

  const shopData = (() => {
    try {
      const raw = localStorage.getItem("shopmanager_shop_data") || localStorage.getItem("shopmanager_settings");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  })();
  const shopName = shopData.shopName || "ShopManager OS";
  const ownerName = shopData.ownerName || "Administrator";

  // Tick clock every minute
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const invoices: any[] = JSON.parse(localStorage.getItem("invoices") || "[]");
    const products: any[] = JSON.parse(localStorage.getItem("products") || "[]");
    const customers: any[] = JSON.parse(localStorage.getItem("customers") || "[]");

    // Recent invoices — last 8, newest first
    const recent = invoices
      .slice()
      .reverse()
      .slice(0, 8)
      .map((inv) => ({
        id: inv.id,
        invoiceNo: inv.invoiceNo || inv.id,
        customer: inv.customer?.name || inv.customerName || "Walk-In",
        date: inv.date || inv.createdAt || "",
        amount: inv.grandTotal || inv.total || 0,
        status: inv.status || "Paid",
      }));
    setRecentInvoices(recent);

    // Quick stats
    const today = new Date().toDateString();
    const todayInvoices = invoices.filter((i) => new Date(i.date || i.createdAt || "").toDateString() === today);
    const todaySales = todayInvoices.reduce((s, i) => s + (i.grandTotal || i.total || 0), 0);
    const totalSales = invoices.reduce((s, i) => s + (i.grandTotal || i.total || 0), 0);
    const low = products.filter((p) => (p.stock ?? 0) < 20).length;
    setLowStockCount(low);

    setStats([
      {
        label: "Today's Sales",
        value: `₹${todaySales.toLocaleString("en-IN")}`,
        sub: `${todayInvoices.length} invoice${todayInvoices.length !== 1 ? "s" : ""}`,
        icon: TrendingUp,
        color: "text-emerald-600",
      },
      {
        label: "Total Revenue",
        value: `₹${totalSales.toLocaleString("en-IN")}`,
        sub: `${invoices.length} invoices total`,
        icon: Receipt,
        color: "text-blue-600",
      },
      {
        label: "Customers",
        value: customers.length.toString(),
        sub: "in database",
        icon: Users,
        color: "text-indigo-600",
      },
      {
        label: "Low Stock",
        value: low.toString(),
        sub: low > 0 ? "items need attention" : "All stocked up",
        icon: AlertTriangle,
        color: low > 0 ? "text-amber-600" : "text-slate-400",
      },
    ]);
  }, []);

  const dateStr = now.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div
      className="h-full flex flex-col bg-slate-100 overflow-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
    >
      {/* ── Top Header Bar ─────────────────────────────────── */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
        {/* Logo + Shop Name */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
            <Store className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-slate-900 text-sm" style={{ fontWeight: 700 }}>
              {shopName}
            </span>
          </div>
        </div>

        {/* Date & Time */}
        <div className="flex items-center gap-1.5 text-slate-500 text-sm">
          <Clock className="w-4 h-4" />
          <span>{dateStr}</span>
          <span className="mx-1 text-slate-300">·</span>
          <span className="text-slate-700" style={{ fontWeight: 600 }}>{timeStr}</span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/billing")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Invoice
          </button>

          <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
            <span className="text-slate-600 text-xs font-bold">
              {ownerName.charAt(0).toUpperCase()}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setShowPower(true)}
            title="Power"
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors group"
          >
            <PowerOff className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors" />
          </motion.button>
        </div>
      </header>

      {showPower && <PowerDialog onClose={() => setShowPower(false)} />}

      {/* ── Main Content ────────────────────────────────────── */}
      <div className="flex-1 flex min-h-0 gap-0">

        {/* Left — Module Tiles + Stats */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Greeting */}
          <div className="mb-6">
            <h1 className="text-slate-900 mb-0.5" style={{ fontSize: "20px", fontWeight: 700 }}>
              {getHour()}, {ownerName.split(" ")[0]}
            </h1>
            <p className="text-slate-500 text-sm">Here's an overview of your business today.</p>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-xl border border-slate-200 px-4 py-3"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-500 text-xs">{stat.label}</span>
                  <stat.icon className={`w-4 h-4 ${stat.color}`} />
                </div>
                <p className="text-slate-900 mb-0.5" style={{ fontSize: "18px", fontWeight: 700 }}>
                  {stat.value}
                </p>
                <p className="text-slate-400 text-xs">{stat.sub}</p>
              </motion.div>
            ))}
          </div>

          {/* Module Grid */}
          <div className="mb-4">
            <h2 className="text-slate-700 text-xs font-semibold uppercase tracking-widest mb-3">
              Modules
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {MODULES.map((mod, i) => (
                <motion.button
                  key={mod.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + i * 0.07 }}
                  whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.10)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(mod.path)}
                  className={`relative text-left bg-white border rounded-xl p-5 cursor-pointer transition-all group ${
                    mod.primary
                      ? "border-blue-200 ring-1 ring-blue-100"
                      : "border-slate-200"
                  }`}
                >
                  {mod.primary && (
                    <div className="absolute top-3 right-3">
                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-600 text-[10px] font-semibold rounded uppercase tracking-wide">
                        Primary
                      </span>
                    </div>
                  )}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${mod.iconBg}`}>
                    <mod.icon className={`w-5 h-5 ${mod.color.split(" ")[1]}`} />
                  </div>
                  <p className="text-slate-900 mb-1" style={{ fontWeight: 600, fontSize: "14px" }}>
                    {mod.label}
                  </p>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    {mod.description}
                  </p>
                  <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Quick Actions row */}
          <div>
            <h2 className="text-slate-700 text-xs font-semibold uppercase tracking-widest mb-3">
              Quick Actions
            </h2>
            <div className="flex gap-2">
              {[
                { label: "New Invoice", icon: Receipt, path: "/billing", color: "bg-blue-600 text-white" },
                { label: "Add Customer", icon: Users, path: "/customers", color: "bg-white text-slate-700 border border-slate-200" },
                { label: "Add Product", icon: Package, path: "/products", color: "bg-white text-slate-700 border border-slate-200" },
              ].map((action) => (
                <motion.button
                  key={action.label}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(action.path)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${action.color}`}
                >
                  <action.icon className="w-4 h-4" />
                  {action.label}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Recent Invoices Panel */}
        <div className="w-80 shrink-0 bg-white border-l border-slate-200 flex flex-col overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-slate-900 text-sm" style={{ fontWeight: 700 }}>Recent Invoices</h2>
              <p className="text-slate-400 text-xs mt-0.5">Latest billing activity</p>
            </div>
            <button
              onClick={() => navigate("/history")}
              className="text-blue-600 text-xs font-semibold hover:text-blue-700 transition-colors"
            >
              View All
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {recentInvoices.length > 0 ? (
              <div>
                {/* Table header */}
                <div className="grid grid-cols-[1fr_auto] gap-3 px-5 py-2.5 bg-slate-50 border-b border-slate-100">
                  <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wide">
                    Invoice / Customer
                  </span>
                  <span className="text-slate-400 text-[10px] font-semibold uppercase tracking-wide text-right">
                    Amount
                  </span>
                </div>
                {recentInvoices.map((inv, i) => (
                  <motion.div
                    key={inv.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.05 }}
                    className="grid grid-cols-[1fr_auto] gap-3 items-start px-5 py-3.5 border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors group"
                    onClick={() => navigate("/history")}
                  >
                    <div>
                      <p className="text-slate-800 text-xs" style={{ fontWeight: 600 }}>
                        {inv.invoiceNo}
                      </p>
                      <p className="text-slate-500 text-xs mt-0.5 truncate">{inv.customer}</p>
                      {inv.date && (
                        <p className="text-slate-400 text-[10px] mt-0.5">
                          {new Date(inv.date).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-slate-900 text-xs" style={{ fontWeight: 600 }}>
                        ₹{inv.amount.toLocaleString("en-IN")}
                      </p>
                      <span
                        className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                          inv.status === "Paid"
                            ? "bg-emerald-50 text-emerald-600"
                            : inv.status === "Draft"
                            ? "bg-slate-100 text-slate-500"
                            : "bg-amber-50 text-amber-600"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
                <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                  <FileText className="w-7 h-7 text-slate-400" />
                </div>
                <p className="text-slate-600 text-sm font-medium mb-1">No invoices yet</p>
                <p className="text-slate-400 text-xs mb-4">Start billing to see recent invoices here</p>
                <button
                  onClick={() => navigate("/billing")}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Create First Invoice
                </button>
              </div>
            )}
          </div>

          {/* Low stock warning if any */}
          {lowStockCount > 0 && (
            <div
              className="px-5 py-3.5 border-t border-amber-100 bg-amber-50 flex items-center gap-3 cursor-pointer hover:bg-amber-100 transition-colors"
              onClick={() => navigate("/products")}
            >
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-amber-800 text-xs font-semibold">Low Stock Alert</p>
                <p className="text-amber-600 text-xs">{lowStockCount} product{lowStockCount !== 1 ? "s" : ""} need restocking</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
