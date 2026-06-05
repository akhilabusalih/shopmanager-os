import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  Users,
  Package,
  Receipt,
  History,
  Settings,
  BarChart3,
  FileText,
  ShoppingCart,
  LayoutDashboard,
  ArrowRight,
} from "lucide-react";

type SearchResult = {
  id: string;
  type: "customer" | "product" | "invoice" | "page" | "action";
  title: string;
  subtitle?: string;
  icon: any;
  action: () => void;
};

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const pages: SearchResult[] = [
    {
      id: "dashboard",
      type: "page",
      title: "Dashboard",
      subtitle: "Go to dashboard",
      icon: LayoutDashboard,
      action: () => { navigate("/"); onClose(); },
    },
    {
      id: "billing",
      type: "page",
      title: "Billing",
      subtitle: "Create new invoice",
      icon: Receipt,
      action: () => { navigate("/billing"); onClose(); },
    },
    {
      id: "pos",
      type: "page",
      title: "POS Billing",
      subtitle: "Quick retail checkout",
      icon: ShoppingCart,
      action: () => { navigate("/pos"); onClose(); },
    },
    {
      id: "customers",
      type: "page",
      title: "Customers",
      subtitle: "Manage customers",
      icon: Users,
      action: () => { navigate("/customers"); onClose(); },
    },
    {
      id: "inventory",
      type: "page",
      title: "Inventory",
      subtitle: "Manage products",
      icon: Package,
      action: () => { navigate("/products"); onClose(); },
    },
    {
      id: "history",
      type: "page",
      title: "Invoice History",
      subtitle: "View past invoices",
      icon: History,
      action: () => { navigate("/history"); onClose(); },
    },
    {
      id: "analytics",
      type: "page",
      title: "Analytics",
      subtitle: "View analytics",
      icon: BarChart3,
      action: () => { navigate("/analytics"); onClose(); },
    },
    {
      id: "reports",
      type: "page",
      title: "Reports",
      subtitle: "Generate reports",
      icon: FileText,
      action: () => { navigate("/reports"); onClose(); },
    },
    {
      id: "settings",
      type: "page",
      title: "Settings",
      subtitle: "Configure system",
      icon: Settings,
      action: () => { navigate("/settings"); onClose(); },
    },
  ];

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setSelectedIndex(0);
      return;
    }

    if (!query.trim()) {
      setResults(pages);
      return;
    }

    // Search through pages
    const pageResults = pages.filter(
      (page) =>
        page.title.toLowerCase().includes(query.toLowerCase()) ||
        page.subtitle?.toLowerCase().includes(query.toLowerCase())
    );

    // Search through customers
    const customers = JSON.parse(localStorage.getItem("customers") || "[]");
    const customerResults: SearchResult[] = customers
      .filter((c: any) =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.phone.includes(query) ||
        c.gstin?.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 5)
      .map((c: any) => ({
        id: c.id,
        type: "customer" as const,
        title: c.name,
        subtitle: c.phone,
        icon: Users,
        action: () => { navigate("/customers"); onClose(); },
      }));

    // Search through products
    const products = JSON.parse(localStorage.getItem("products") || "[]");
    const productResults: SearchResult[] = products
      .filter((p: any) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.hsn.includes(query) ||
        p.category?.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 5)
      .map((p: any) => ({
        id: p.id,
        type: "product" as const,
        title: p.name,
        subtitle: `₹${p.price} • Stock: ${p.stock}`,
        icon: Package,
        action: () => { navigate("/products"); onClose(); },
      }));

    // Search through invoices
    const invoices = JSON.parse(localStorage.getItem("invoices") || "[]");
    const invoiceResults: SearchResult[] = invoices
      .filter((i: any) =>
        i.id.toLowerCase().includes(query.toLowerCase()) ||
        i.customer?.name?.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 5)
      .map((i: any) => ({
        id: i.id,
        type: "invoice" as const,
        title: i.id,
        subtitle: `${i.customer?.name} • ₹${i.total?.toFixed(2)}`,
        icon: Receipt,
        action: () => { navigate("/history"); onClose(); },
      }));

    setResults([...pageResults, ...customerResults, ...productResults, ...invoiceResults]);
    setSelectedIndex(0);
  }, [query, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % results.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (results[selectedIndex]) {
          results[selectedIndex].action();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "customer":
        return "text-emerald-600 bg-emerald-50";
      case "product":
        return "text-amber-600 bg-amber-50";
      case "invoice":
        return "text-blue-600 bg-blue-50";
      case "page":
        return "text-slate-600 bg-slate-50";
      default:
        return "text-slate-600 bg-slate-50";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Command Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-200">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search customers, products, invoices, or navigate..."
                  className="flex-1 text-base outline-none placeholder:text-slate-400"
                  autoFocus
                />
                <kbd className="px-2 py-1 text-xs font-medium text-slate-400 bg-slate-100 border border-slate-200 rounded">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-96 overflow-y-auto">
                {results.length > 0 ? (
                  <div className="py-2">
                    {results.map((result, index) => (
                      <motion.button
                        key={result.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.02 }}
                        onClick={result.action}
                        className={`w-full flex items-center gap-3 px-4 py-3 transition-colors ${
                          index === selectedIndex
                            ? "bg-blue-50 border-l-2 border-blue-600"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(
                            result.type
                          )}`}
                        >
                          <result.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="font-medium text-slate-900 truncate">
                            {result.title}
                          </p>
                          {result.subtitle && (
                            <p className="text-sm text-slate-500 truncate">
                              {result.subtitle}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-400 capitalize px-2 py-1 bg-slate-100 rounded">
                            {result.type}
                          </span>
                          <ArrowRight className="w-4 h-4 text-slate-400" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">No results found</p>
                    <p className="text-sm text-slate-400 mt-1">
                      Try searching for customers, products, or invoices
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">↑</kbd>
                    <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">↓</kbd>
                    <span>Navigate</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white border border-slate-200 rounded">↵</kbd>
                    <span>Select</span>
                  </div>
                </div>
                <span>{results.length} results</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
