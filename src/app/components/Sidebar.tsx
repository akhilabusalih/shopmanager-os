import { useCallback, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import {
  LayoutDashboard,
  Receipt,
  Users,
  Package,
  History,
  BarChart3,
  FileText,
  Settings,
  Store,
} from "lucide-react";
import { motion } from "motion/react";

const navigationItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { id: "billing", label: "Billing", icon: Receipt, path: "/billing" },
  { id: "customers", label: "Customers", icon: Users, path: "/customers" },
  { id: "inventory", label: "Inventory", icon: Package, path: "/products" },
  { id: "history", label: "Invoice History", icon: History, path: "/history" },
  { id: "analytics", label: "Analytics", icon: BarChart3, path: "/analytics" },
  { id: "reports", label: "Reports", icon: FileText, path: "/reports" },
];

const MIN_WIDTH = 160;
const MAX_WIDTH = 360;
const DEFAULT_WIDTH = 220;

export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const dragging = useRef(false);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const startDrag = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const onMove = (mv: MouseEvent) => {
      if (!dragging.current) return;
      setWidth(Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, mv.clientX)));
    };
    const onUp = () => {
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, []);

  const showLabel = width >= 150;

  return (
    <aside
      className="h-screen bg-white border-r border-slate-200 flex flex-col shrink-0 relative"
      style={{ width }}
    >
      {/* Logo & Brand */}
      <div className="h-14 flex items-center gap-2.5 px-4 overflow-hidden">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/30">
          <Store className="w-4 h-4 text-white" />
        </div>
        {showLabel && (
          <div className="min-w-0">
            <h1 className="text-sm font-bold text-slate-900 truncate">ShopManager</h1>
            <p className="text-xs text-slate-500 truncate">OS</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        <div className="space-y-0.5">
          {navigationItems.map((item, index) => {
            const active = isActive(item.path);
            return (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
                onClick={() => navigate(item.path)}
                title={!showLabel ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg transition-all group relative overflow-hidden ${
                  active
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm shadow-blue-500/30"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <item.icon
                  className={`w-5 h-5 shrink-0 relative z-10 ${
                    active ? "text-white" : "text-slate-400 group-hover:text-slate-600"
                  }`}
                />
                {showLabel && (
                  <span className={`text-sm font-medium relative z-10 truncate ${active ? "text-white" : ""}`}>
                    {item.label}
                  </span>
                )}
                {!active && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* Settings */}
      <div className="p-2">
        <button
          onClick={() => navigate("/settings")}
          title={!showLabel ? "Settings" : undefined}
          className={`w-full flex items-center gap-3 px-2.5 py-2.5 rounded-lg transition-all ${
            location.pathname === "/settings"
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          <Settings
            className={`w-5 h-5 shrink-0 ${location.pathname === "/settings" ? "text-white" : "text-slate-400"}`}
          />
          {showLabel && <span className="text-sm font-medium">Settings</span>}
        </button>
      </div>

      {/* Resize handle — drag this edge to resize */}
      <div
        onMouseDown={startDrag}
        className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize group/handle flex items-center justify-center z-30"
      >
        <div className="w-0.5 h-full bg-transparent group-hover/handle:bg-blue-400 transition-colors duration-150" />
      </div>
    </aside>
  );
}
