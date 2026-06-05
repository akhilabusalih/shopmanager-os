import { useState, useEffect, useRef, useCallback } from "react";
import {
  Calculator, FileText, Printer, Save, X, Search, UserPlus,
  ChevronDown, ChevronUp, FileCheck, Download,
  User, Phone, MapPin, Hash, Building2, CreditCard,
  Banknote, Smartphone, Landmark, AlertCircle,
  ZoomIn, ZoomOut, Maximize2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import type {
  Customer, Product, InvoiceItem, InvoiceDetails,
  CustomerMode, OutputMode, PaymentMethod,
} from "../components/billing/billingTypes";
import { computeInvoiceTotals } from "../components/billing/billingTypes";
import { fmt, numberToWords, nextInvoiceNo, todayDate } from "../components/billing/billingUtils";
import { NewCustomerModal } from "../components/billing/NewCustomerModal";
import { ProductTable } from "../components/billing/ProductTable";
import { InvoicePreviewA4 } from "../components/billing/InvoicePreviewA4";
import { InvoicePreviewThermal } from "../components/billing/InvoicePreviewThermal";

function newItem(): InvoiceItem {
  return { id: crypto.randomUUID(), description: "", hsn: "", qty: 1, unit: "pcs", rate: 0, gstRate: 18 };
}

const PAYMENT_OPTIONS: { id: PaymentMethod; label: string; icon: any }[] = [
  { id: "cash", label: "Cash", icon: Banknote },
  { id: "upi", label: "UPI", icon: Smartphone },
  { id: "bank", label: "Bank Transfer", icon: Landmark },
  { id: "credit", label: "Credit", icon: CreditCard },
];

const ZOOM_PRESETS = [50, 75, 100, 125, 150, 200];

export function Billing() {
  // ── Data ──────────────────────────────────────────────────────────────
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  // ── Invoice state ──────────────────────────────────────────────────────
  const [outputMode, setOutputMode] = useState<OutputMode>("a4");
  const [customerMode, setCustomerMode] = useState<CustomerMode>("existing");
  const [details, setDetails] = useState<InvoiceDetails>({
    invoiceNo: "",
    invoiceDate: todayDate(),
    placeOfSupply: "",
    supplyDateTime: "",
    transportMode: "",
    vehicleNumber: "",
  });
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [walkinName, setWalkinName] = useState("");
  const [walkinPhone, setWalkinPhone] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([newItem()]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");

  // ── UI state ───────────────────────────────────────────────────────────
  const [showDetailsSection, setShowDetailsSection] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDrop, setShowCustomerDrop] = useState(false);
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const custSearchRef = useRef<HTMLDivElement>(null);

  // ── Panel resize ───────────────────────────────────────────────────────
  const splitContainerRef = useRef<HTMLDivElement>(null);
  const [leftPanelPx, setLeftPanelPx] = useState<number | null>(null);
  const panelDragging = useRef(false);

  // ── Preview zoom ───────────────────────────────────────────────────────
  const previewScrollRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(100);

  // ── Init ───────────────────────────────────────────────────────────────
  useEffect(() => {
    setDetails(d => ({ ...d, invoiceNo: nextInvoiceNo() }));
    const c: Customer[] = JSON.parse(localStorage.getItem("customers") || "[]");
    const p: Product[] = JSON.parse(localStorage.getItem("products") || "[]");
    setCustomers(c);
    setProducts(p);
  }, []);

  // Close customer dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (custSearchRef.current && !custSearchRef.current.contains(e.target as Node)) {
        setShowCustomerDrop(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Panel drag ─────────────────────────────────────────────────────────
  const startPanelDrag = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const container = splitContainerRef.current;
    if (!container) return;
    panelDragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    const onMove = (mv: MouseEvent) => {
      if (!panelDragging.current) return;
      const rect = container.getBoundingClientRect();
      const innerWidth = rect.width - 24; // subtract p-3 padding (12px each side)
      const mouseLeft = mv.clientX - rect.left - 12; // offset by left padding
      const min = innerWidth * 0.28;
      const max = innerWidth * 0.70;
      setLeftPanelPx(Math.max(min, Math.min(max, mouseLeft)));
    };
    const onUp = () => {
      panelDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }, []);

  // ── Zoom handlers ──────────────────────────────────────────────────────
  const stepZoom = (delta: number) => {
    setZoom(prev => {
      const next = prev + delta;
      return Math.max(50, Math.min(200, next));
    });
  };

  const handleFitWidth = () => {
    if (!previewScrollRef.current) return;
    const cw = previewScrollRef.current.clientWidth - 48;
    const contentW = outputMode === "a4" ? 794 : 308;
    setZoom(Math.round((cw / contentW) * 100));
  };

  const handleFitPage = () => {
    if (!previewScrollRef.current) return;
    const cw = previewScrollRef.current.clientWidth - 48;
    const ch = previewScrollRef.current.clientHeight - 48;
    const contentW = outputMode === "a4" ? 794 : 308;
    const contentH = outputMode === "a4" ? 1123 : 520;
    setZoom(Math.round(Math.min(cw / contentW, ch / contentH) * 100));
  };

  // ── Computed ───────────────────────────────────────────────────────────
  const totals = computeInvoiceTotals(items);
  const filteredCustomers = customers.filter(
    c =>
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      c.phone.includes(customerSearch) ||
      c.gstin.toLowerCase().includes(customerSearch.toLowerCase())
  );

  // ── Handlers ───────────────────────────────────────────────────────────
  const handleSelectCustomer = (c: Customer) => {
    setSelectedCustomer(c);
    setCustomerSearch("");
    setShowCustomerDrop(false);
    setDetails(d => ({ ...d, placeOfSupply: c.state || d.placeOfSupply }));
  };

  const handleNewCustomerCreated = (c: Customer) => {
    const updated = [...customers, c];
    setCustomers(updated);
    handleSelectCustomer(c);
  };

  const handleAddItem = () => setItems(prev => [...prev, newItem()]);
  const handleRemoveItem = (id: string) => setItems(prev => prev.filter(i => i.id !== id));
  const handleUpdateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  };
  const handleSelectProduct = (itemId: string, product: Product) => {
    setItems(prev => prev.map(i =>
      i.id === itemId
        ? { ...i, productId: product.id, description: product.name, hsn: product.hsn, rate: product.price, unit: product.unit || "pcs", gstRate: product.gstRate ?? 18 }
        : i
    ));
  };

  const handleClear = () => {
    setSelectedCustomer(null);
    setWalkinName("");
    setWalkinPhone("");
    setItems([newItem()]);
    setPaymentMethod("cash");
    setDetails(d => ({ ...d, invoiceNo: nextInvoiceNo(), invoiceDate: todayDate(), placeOfSupply: "", supplyDateTime: "", transportMode: "", vehicleNumber: "" }));
    toast.info("Invoice cleared");
  };

  const validate = () => {
    const custOk = customerMode === "walkin" ? !!walkinName.trim() : !!selectedCustomer;
    if (!custOk) { toast.error("Please select or enter a customer"); return false; }
    if (items.some(i => !i.description.trim())) { toast.error("All product rows must have a description"); return false; }
    return true;
  };

  const handleSaveDraft = () => toast.info("Draft saved (prototype — no persistence yet)");

  const handleSaveInvoice = () => {
    if (!validate()) return;
    const invoices = JSON.parse(localStorage.getItem("invoices") || "[]");
    invoices.push({
      id: details.invoiceNo,
      date: details.invoiceDate,
      customer: customerMode === "walkin" ? { name: walkinName, phone: walkinPhone } : selectedCustomer,
      items,
      ...totals,
      paymentMethod,
      outputMode,
      status: "Paid",
    });
    localStorage.setItem("invoices", JSON.stringify(invoices));
    toast.success(`Invoice ${details.invoiceNo} saved`);
    handleClear();
  };

  const handlePrint = () => {
    if (!validate()) return;
    toast.info(`Print triggered — ${outputMode === "a4" ? "A4 GST Invoice" : "Thermal Receipt"}`);
    window.print();
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-100">

      {/* ── Output Mode Selector ────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-white border-b border-slate-200 flex-shrink-0">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Invoice Output:</span>
        <div className="flex rounded-lg border border-slate-200 overflow-hidden">
          <button
            onClick={() => setOutputMode("a4")}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold transition-colors ${outputMode === "a4" ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
          >
            <FileText className="w-3.5 h-3.5" />
            A4 GST Invoice
          </button>
          <button
            onClick={() => setOutputMode("thermal")}
            className={`flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold transition-colors border-l border-slate-200 ${outputMode === "thermal" ? "bg-blue-600 text-white" : "bg-white text-slate-600 hover:bg-slate-50"}`}
          >
            <Printer className="w-3.5 h-3.5" />
            Thermal Receipt
          </button>
        </div>
        <span className="ml-auto text-xs text-slate-400">
          {outputMode === "a4" ? "Full GST invoice for business customers" : "80mm thermal receipt for walk-in customers"}
        </span>
      </div>

      {/* ── Main Split Area ─────────────────────────────────────────────── */}
      <div
        ref={splitContainerRef}
        className="flex flex-1 min-h-0 p-3"
        style={{ gap: 0 }}
      >

        {/* ════════════════════════════════════════════════════════════════
            LEFT PANEL — Invoice Form
        ════════════════════════════════════════════════════════════════ */}
        <div
          className="flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-shrink-0"
          style={{ width: leftPanelPx !== null ? `${leftPanelPx}px` : "52%" }}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-slate-50 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-bold text-slate-800">New Invoice</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-slate-600 font-mono">{details.invoiceNo}</span>
              <span className="text-xs text-slate-400">
                {details.invoiceDate ? new Date(details.invoiceDate + "T00:00:00").toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : ""}
              </span>
            </div>
          </div>

          {/* Scrollable form body */}
          <div className="flex-1 overflow-y-auto">

            {/* ── Section 1: Invoice Details (collapsible) ── */}
            <div className="border-b border-slate-100">
              <button
                onClick={() => setShowDetailsSection(v => !v)}
                className="w-full flex items-center justify-between px-5 py-2.5 hover:bg-slate-50 transition-colors"
              >
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Invoice Details</span>
                <div className="flex items-center gap-2">
                  {!showDetailsSection && (
                    <span className="text-[10px] text-slate-400">
                      {details.placeOfSupply || details.transportMode
                        ? [details.placeOfSupply, details.transportMode].filter(Boolean).join(" · ")
                        : "Optional fields"}
                    </span>
                  )}
                  {showDetailsSection ? (
                    <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
              </button>

              <AnimatePresence initial={false}>
                {showDetailsSection && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-4 grid grid-cols-3 gap-3">
                      {[
                        { key: "invoiceDate" as const, label: "Invoice Date", type: "date" },
                        { key: "placeOfSupply" as const, label: "Place of Supply", type: "text", placeholder: "Kerala" },
                        { key: "supplyDateTime" as const, label: "Supply Date/Time", type: "datetime-local" },
                        { key: "transportMode" as const, label: "Transport Mode", type: "text", placeholder: "Road / Rail / Air" },
                        { key: "vehicleNumber" as const, label: "Vehicle Number", type: "text", placeholder: "KL 01 AB 1234" },
                      ].map(({ key, label, type, placeholder }) => (
                        <div key={key}>
                          <label className="block text-[10px] font-semibold text-slate-500 mb-1">{label}</label>
                          <input
                            type={type}
                            value={(details as any)[key]}
                            onChange={e => setDetails(d => ({ ...d, [key]: e.target.value }))}
                            placeholder={placeholder}
                            className="w-full px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all"
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Section 2: Customer ── */}
            <div className="px-5 py-4 border-b border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Customer</span>
                <div className="flex rounded-md border border-slate-200 overflow-hidden">
                  <button
                    onClick={() => setCustomerMode("existing")}
                    className={`px-3 py-1 text-[10px] font-semibold transition-colors ${customerMode === "existing" ? "bg-blue-600 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}
                  >
                    Existing
                  </button>
                  <button
                    onClick={() => setCustomerMode("walkin")}
                    className={`px-3 py-1 text-[10px] font-semibold transition-colors border-l border-slate-200 ${customerMode === "walkin" ? "bg-blue-600 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}
                  >
                    Walk-In
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {customerMode === "existing" ? (
                  <motion.div
                    key="existing"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className="space-y-2"
                  >
                    <div ref={custSearchRef} className="relative">
                      <div className="flex gap-2">
                        <div className="flex-1 relative">
                          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                          <input
                            type="text"
                            value={customerSearch}
                            onChange={e => { setCustomerSearch(e.target.value); setShowCustomerDrop(true); }}
                            onFocus={() => setShowCustomerDrop(true)}
                            placeholder={selectedCustomer ? "Change customer..." : "Search by name, phone or GSTIN"}
                            className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all"
                          />
                        </div>
                        <button
                          onClick={() => setShowNewCustomer(true)}
                          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors flex-shrink-0"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          New
                        </button>
                      </div>

                      <AnimatePresence>
                        {showCustomerDrop && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={{ duration: 0.1 }}
                            className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden"
                          >
                            <div className="max-h-48 overflow-y-auto">
                              {filteredCustomers.length === 0 ? (
                                <div className="px-3 py-4 text-xs text-slate-400 text-center">No customers found</div>
                              ) : (
                                filteredCustomers.map(c => (
                                  <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => handleSelectCustomer(c)}
                                    className="w-full text-left px-3 py-2.5 hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0"
                                  >
                                    <div className="text-xs font-semibold text-slate-800">{c.name}</div>
                                    <div className="text-[10px] text-slate-400 mt-0.5">{c.phone} · {c.gstin || "No GSTIN"} · {c.state}</div>
                                  </button>
                                ))
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <AnimatePresence>
                      {selectedCustomer && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.15 }}
                          className="overflow-hidden"
                        >
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 relative">
                            <button
                              onClick={() => { setSelectedCustomer(null); setCustomerSearch(""); }}
                              className="absolute top-2 right-2 p-0.5 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                            <div className="pr-5 space-y-1">
                              <div className="flex items-center gap-1.5">
                                <User className="w-3 h-3 text-blue-500 flex-shrink-0" />
                                <span className="text-xs font-bold text-slate-800">{selectedCustomer.name}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                <span className="text-xs text-slate-600">{selectedCustomer.phone}</span>
                              </div>
                              {selectedCustomer.gstin && (
                                <div className="flex items-center gap-1.5">
                                  <Hash className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                  <span className="text-xs text-slate-600 font-mono">{selectedCustomer.gstin}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1.5">
                                <Building2 className="w-3 h-3 text-slate-400 flex-shrink-0" />
                                <span className="text-xs text-slate-600">
                                  {selectedCustomer.state}{selectedCustomer.stateCode ? ` (${selectedCustomer.stateCode})` : ""}
                                </span>
                              </div>
                              {selectedCustomer.address && (
                                <div className="flex items-start gap-1.5">
                                  <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0 mt-0.5" />
                                  <span className="text-xs text-slate-600">{selectedCustomer.address}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {!selectedCustomer && !showCustomerDrop && (
                      <div className="flex items-center gap-1.5 px-2 py-1.5 text-[10px] text-slate-400">
                        <AlertCircle className="w-3 h-3" />
                        No customer selected
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="walkin"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className="grid grid-cols-2 gap-3"
                  >
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Customer Name *</label>
                      <input
                        type="text"
                        value={walkinName}
                        onChange={e => setWalkinName(e.target.value)}
                        placeholder="Walk-in customer name"
                        className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-500 mb-1">Phone (optional)</label>
                      <input
                        type="tel"
                        value={walkinPhone}
                        onChange={e => setWalkinPhone(e.target.value)}
                        placeholder="+91 — — — — —"
                        className="w-full px-2.5 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ── Section 3: Products ── */}
            <div className="px-5 py-4 border-b border-slate-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Products / Services</span>
                <span className="text-[10px] text-slate-400">{items.length} item{items.length !== 1 ? "s" : ""}</span>
              </div>
              <ProductTable
                items={items}
                products={products}
                onAdd={handleAddItem}
                onRemove={handleRemoveItem}
                onUpdate={handleUpdateItem}
                onSelectProduct={handleSelectProduct}
              />
            </div>

            {/* ── Section 4: GST Summary + Payment ── */}
            <div className="px-5 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                  <div className="px-3 py-2 border-b border-slate-200 bg-white">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Invoice Summary</span>
                  </div>
                  <div className="px-3 py-2 space-y-1.5">
                    {[
                      { label: "Taxable Amount", value: fmt(totals.totalTaxable) },
                      { label: "CGST", value: fmt(totals.totalCGST) },
                      { label: "SGST", value: fmt(totals.totalSGST) },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between text-xs text-slate-600">
                        <span>{label}</span>
                        <span className="font-medium tabular-nums">{value}</span>
                      </div>
                    ))}
                    <div className="flex justify-between pt-1.5 border-t border-slate-300 text-sm font-bold text-slate-900">
                      <span>Grand Total</span>
                      <span className="text-blue-700 tabular-nums">{fmt(totals.grandTotal)}</span>
                    </div>
                  </div>
                  {totals.grandTotal > 0 && (
                    <div className="px-3 py-2 border-t border-slate-200 bg-white">
                      <p className="text-[9px] text-slate-400 italic leading-tight">
                        {numberToWords(totals.grandTotal)}
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                  <div className="px-3 py-2 border-b border-slate-200 bg-white">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Payment Method</span>
                  </div>
                  <div className="p-2 grid grid-cols-2 gap-1.5">
                    {PAYMENT_OPTIONS.map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPaymentMethod(id)}
                        className={`flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-xs font-semibold transition-all ${
                          paymentMethod === id
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Action Bar ── */}
          <div className="flex items-center gap-2 px-5 py-3 border-t border-slate-200 bg-slate-50 flex-shrink-0">
            <button onClick={handleClear} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors">
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
            <button onClick={handleSaveDraft} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors">
              <Save className="w-3.5 h-3.5" />
              Save Draft
            </button>
            <div className="flex-1" />
            <button onClick={handleSaveInvoice} className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm">
              <FileCheck className="w-3.5 h-3.5" />
              Save Invoice
            </button>
            <button onClick={handlePrint} className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm">
              <Printer className="w-3.5 h-3.5" />
              {outputMode === "thermal" ? "Print Receipt" : "Print A4"}
            </button>
          </div>
        </div>

        {/* ════════════════════════════════════════════════════════════════
            DRAG DIVIDER
        ════════════════════════════════════════════════════════════════ */}
        <div
          onMouseDown={startPanelDrag}
          className="w-3 flex-shrink-0 cursor-col-resize flex items-center justify-center group/divider select-none mx-1"
        >
          <div className="w-0.5 h-16 bg-slate-300 rounded-full group-hover/divider:bg-blue-400 group-hover/divider:h-24 transition-all duration-150" />
        </div>

        {/* ════════════════════════════════════════════════════════════════
            RIGHT PANEL — Live Preview
        ════════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col rounded-xl border border-slate-300 overflow-hidden bg-slate-200 shadow-sm flex-1 min-w-0">

          {/* Preview header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100 border-b border-slate-300 flex-shrink-0">
            <div className="flex items-center gap-2">
              {outputMode === "a4" ? (
                <FileText className="w-4 h-4 text-blue-600" />
              ) : (
                <Printer className="w-4 h-4 text-blue-600" />
              )}
              <span className="text-xs font-bold text-slate-700">
                {outputMode === "a4" ? "A4 GST Invoice Preview" : "Thermal Receipt Preview"}
              </span>
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-semibold rounded-full">Live</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button title="Download PDF" className="p-1.5 rounded-md bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                <Download className="w-3.5 h-3.5" />
              </button>
              <button onClick={handlePrint} title="Print" className="p-1.5 rounded-md bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
                <Printer className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ── Zoom Controls ── */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border-b border-slate-200 flex-shrink-0">
            <button
              onClick={() => stepZoom(-25)}
              disabled={zoom <= 50}
              title="Zoom Out"
              className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>

            <select
              value={ZOOM_PRESETS.includes(zoom) ? zoom : "custom"}
              onChange={e => setZoom(Number(e.target.value))}
              className="px-2 py-0.5 text-xs font-mono font-semibold text-slate-700 bg-white border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 cursor-pointer"
            >
              {ZOOM_PRESETS.map(z => (
                <option key={z} value={z}>{z}%</option>
              ))}
              {!ZOOM_PRESETS.includes(zoom) && (
                <option value="custom" disabled>{zoom}%</option>
              )}
            </select>

            <button
              onClick={() => stepZoom(25)}
              disabled={zoom >= 200}
              title="Zoom In"
              className="p-1 rounded hover:bg-slate-200 text-slate-500 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>

            <div className="w-px h-4 bg-slate-300 mx-0.5" />

            <button
              onClick={handleFitWidth}
              title="Fit to Width"
              className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"
            >
              <Maximize2 className="w-3 h-3" />
              Fit Width
            </button>

            <button
              onClick={handleFitPage}
              title="Fit to Page"
              className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors"
            >
              Fit Page
            </button>

            <button
              onClick={() => setZoom(100)}
              title="Reset zoom to 100%"
              className="px-2 py-0.5 text-[10px] font-semibold text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded transition-colors ml-auto"
            >
              Reset
            </button>
          </div>

          {/* Preview area with zoom applied */}
          <div
            ref={previewScrollRef}
            className="flex-1 overflow-auto py-6 px-6"
          >
            <AnimatePresence mode="wait">
              {outputMode === "a4" ? (
                <motion.div
                  key="a4"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  style={{ zoom: `${zoom}%`, width: "fit-content", margin: "0 auto" }}
                >
                  <InvoicePreviewA4
                    details={details}
                    customer={selectedCustomer}
                    walkinName={walkinName}
                    walkinPhone={walkinPhone}
                    isWalkin={customerMode === "walkin"}
                    items={items}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="thermal"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  style={{ zoom: `${zoom}%`, width: "fit-content", margin: "0 auto" }}
                >
                  <InvoicePreviewThermal
                    details={details}
                    customer={selectedCustomer}
                    walkinName={walkinName}
                    walkinPhone={walkinPhone}
                    isWalkin={customerMode === "walkin"}
                    items={items}
                    paymentMethod={paymentMethod}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* New Customer Modal */}
      <NewCustomerModal
        isOpen={showNewCustomer}
        onClose={() => setShowNewCustomer(false)}
        onCreated={handleNewCustomerCreated}
      />
    </div>
  );
}
