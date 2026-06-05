import { useState, useEffect, useRef } from "react";
import {
  Store, FileText, Printer, Users, Package, LayoutTemplate, Image,
  Database, Shield, Info, Save, Upload, Eye, RotateCcw, Trash2,
  Download, Lock, AlertTriangle, HardDrive, X, Check, ChevronRight,
  Hash, Phone, Mail, MapPin, Building2, CreditCard, RefreshCw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type SettingsData = {
  shop: {
    businessName: string; ownerName: string; phone: string; altPhone: string;
    email: string; address: string; city: string; state: string; pinCode: string;
  };
  gst: {
    gstin: string; pan: string; state: string; stateCode: string;
  };
  invoice: {
    prefix: string; startingNumber: number; terms: string; signatureText: string;
    bankName: string; accountNumber: string; ifsc: string; upiId: string;
  };
  print: {
    defaultOutput: "a4" | "thermal"; thermalWidth: "58mm" | "80mm";
    printBehavior: "auto" | "ask";
  };
  customerDefaults: {
    defaultState: string; defaultStateCode: string;
    requirePhone: boolean; requireGSTIN: boolean; requireAddress: boolean;
  };
  productDefaults: {
    defaultGSTRate: number; defaultUnit: string;
    lowStockThreshold: number; priceIncludesGST: boolean;
  };
  branding: {
    logoUrl: string; signatureUrl: string; stampUrl: string;
  };
  security: {
    username: string; requirePasswordOnStartup: boolean; autoLock: string;
  };
};

const DEFAULT: SettingsData = {
  shop: {
    businessName: "ShopManager OS Demo", ownerName: "Admin User",
    phone: "+91 9876543210", altPhone: "", email: "admin@shopmanager.in",
    address: "123 Market Street", city: "Kochi", state: "Kerala", pinCode: "682001",
  },
  gst: { gstin: "32AADCB2230M1Z2", pan: "AADCB2230M", state: "Kerala", stateCode: "32" },
  invoice: {
    prefix: "INV", startingNumber: 1,
    terms: "1. Goods once sold will not be taken back or exchanged.\n2. Interest @18% p.a. will be charged if payment is delayed beyond due date.\n3. Subject to local jurisdiction only.",
    signatureText: "Authorized Signatory",
    bankName: "HDFC Bank", accountNumber: "12345678901234", ifsc: "HDFC0001234", upiId: "shop@upi",
  },
  print: { defaultOutput: "a4", thermalWidth: "80mm", printBehavior: "ask" },
  customerDefaults: {
    defaultState: "Kerala", defaultStateCode: "32",
    requirePhone: true, requireGSTIN: false, requireAddress: false,
  },
  productDefaults: { defaultGSTRate: 18, defaultUnit: "pcs", lowStockThreshold: 10, priceIncludesGST: false },
  branding: { logoUrl: "", signatureUrl: "", stampUrl: "" },
  security: { username: "admin", requirePasswordOnStartup: false, autoLock: "never" },
};

// ─── Nav definition ───────────────────────────────────────────────────────────

const NAV_GROUPS = [
  {
    label: "Business Setup",
    items: [
      { id: "shop", label: "Shop Information", icon: Store, desc: "Name, contact, address" },
      { id: "gst", label: "GST Information", icon: Hash, desc: "GSTIN, PAN, state code" },
    ],
  },
  {
    label: "Operations",
    items: [
      { id: "invoice", label: "Invoice Preferences", icon: FileText, desc: "Prefix, terms, bank" },
      { id: "print", label: "Print Settings", icon: Printer, desc: "Paper, output defaults" },
    ],
  },
  {
    label: "Defaults",
    items: [
      { id: "customerDefaults", label: "Customer Defaults", icon: Users, desc: "Required fields" },
      { id: "productDefaults", label: "Product Defaults", icon: Package, desc: "GST rate, unit, stock" },
    ],
  },
  {
    label: "Customization",
    items: [
      { id: "templates", label: "Invoice Templates", icon: LayoutTemplate, desc: "A4 & thermal layouts" },
      { id: "branding", label: "Branding", icon: Image, desc: "Logo, signature, stamp" },
    ],
  },
  {
    label: "Administration",
    items: [
      { id: "data", label: "Data Management", icon: Database, desc: "Backup, export, clear" },
      { id: "security", label: "Security", icon: Shield, desc: "Password, auto-lock" },
      { id: "system", label: "System Information", icon: Info, desc: "App version, storage" },
    ],
  },
];

// ─── Small helpers ────────────────────────────────────────────────────────────

function Label({ children, help, optional, footnote }: { children: React.ReactNode; help?: string; optional?: boolean; footnote?: boolean }) {
  return (
    <div className="mb-1.5">
      <label className="block text-sm font-medium text-slate-700">
        {children}
        {optional && <span className="ml-1.5 text-xs font-normal text-slate-400">(optional)</span>}
        {footnote && <span className="ml-0.5 text-xs font-normal text-slate-400">*</span>}
      </label>
      {help && <p className="text-xs text-slate-400 mt-0.5">{help}</p>}
    </div>
  );
}

function Field({ label, help, helpBelow, optional, footnote, children }: { label: string; help?: string; helpBelow?: boolean; optional?: boolean; footnote?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <Label help={helpBelow ? undefined : help} optional={optional} footnote={footnote}>{label}</Label>
      {children}
      {helpBelow && help && <p className="text-xs text-slate-400 mt-1.5">{help}</p>}
    </div>
  );
}

function Input({ value, onChange, type = "text", placeholder = "", mono = false, upper = false }: {
  value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; mono?: boolean; upper?: boolean;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(upper ? e.target.value.toUpperCase() : e.target.value)}
      placeholder={placeholder}
      className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${mono ? "font-mono tracking-wide" : ""}`}
    />
  );
}

function Textarea({ value, onChange, rows = 3, mono = false }: {
  value: string; onChange: (v: string) => void; rows?: number; mono?: boolean;
}) {
  return (
    <textarea
      rows={rows}
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none ${mono ? "font-mono" : ""}`}
    />
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none ${value ? "bg-blue-600" : "bg-slate-200"}`}
    >
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${value ? "translate-x-4" : "translate-x-[3px]"}`} />
    </button>
  );
}

function ToggleRow({ label, help, value, onChange }: {
  label: string; help?: string; value: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <div>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {help && <p className="text-xs text-slate-400 mt-0.5">{help}</p>}
      </div>
      <Toggle value={value} onChange={onChange} />
    </div>
  );
}

function SectionHeader({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="mb-6 pb-4 border-b border-slate-200">
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <p className="text-sm text-slate-500 mt-1">{desc}</p>
    </div>
  );
}

function CardBlock({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden mb-6">
      {title && (
        <div className="px-4 py-2.5 border-b border-slate-200 bg-white">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</p>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

function DangerBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 overflow-hidden mb-4">
      <div className="px-4 py-2.5 border-b border-red-200 flex items-center gap-2">
        <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
        <p className="text-xs font-bold text-red-600 uppercase tracking-wider">{title}</p>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function ActionBtn({
  onClick, icon: Icon, label, variant = "default", disabled,
}: {
  onClick: () => void; icon: any; label: string;
  variant?: "default" | "primary" | "danger" | "ghost"; disabled?: boolean;
}) {
  const styles = {
    default: "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300",
    primary: "bg-blue-600 border-blue-600 text-white hover:bg-blue-700",
    danger: "bg-white border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300",
    ghost: "bg-transparent border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700",
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-3.5 py-2 text-sm font-medium border rounded-lg transition-all disabled:opacity-40 ${styles[variant]}`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      {label}
    </button>
  );
}

function BrandingUpload({
  label, help, value, onChange,
}: { label: string; help: string; value: string; onChange: (v: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
    toast.success(`${label} uploaded`);
  };

  return (
    <div className="flex items-start gap-4">
      {/* Preview area */}
      <div
        className={`w-20 h-20 flex-shrink-0 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden cursor-pointer transition-colors ${value ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-slate-300"}`}
        onClick={() => inputRef.current?.click()}
      >
        {value ? (
          <img src={value} alt={label} className="w-full h-full object-contain p-1" />
        ) : (
          <Upload className="w-5 h-5 text-slate-300" />
        )}
      </div>

      {/* Info + actions */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <p className="text-xs text-slate-400 mt-0.5 mb-2">{help}</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload
          </button>
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-red-500 bg-white hover:bg-red-50 rounded-lg border border-slate-200 hover:border-red-200 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Remove
            </button>
          )}
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Settings() {
  const [activeSection, setActiveSection] = useState("shop");
  const [settings, setSettings] = useState<SettingsData>({ ...DEFAULT });
  const [hasChanges, setHasChanges] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [systemInfo, setSystemInfo] = useState({ customers: 0, products: 0, invoices: 0, storageKB: 0 });

  useEffect(() => {
    const stored = localStorage.getItem("shopmanager_settings");
    if (stored) {
      try { setSettings(s => ({ ...DEFAULT, ...JSON.parse(stored) })); } catch {}
    }
  }, []);

  useEffect(() => {
    if (activeSection === "system") {
      const customers = JSON.parse(localStorage.getItem("customers") || "[]").length;
      const products = JSON.parse(localStorage.getItem("products") || "[]").length;
      const invoices = JSON.parse(localStorage.getItem("invoices") || "[]").length;
      let storageKB = 0;
      for (const key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          storageKB += (localStorage.getItem(key) || "").length * 2 / 1024;
        }
      }
      setSystemInfo({ customers, products, invoices, storageKB: Math.round(storageKB) });
    }
  }, [activeSection]);

  function update<S extends keyof SettingsData>(
    section: S, field: keyof SettingsData[S], value: any
  ) {
    setSettings(prev => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
    setHasChanges(true);
  }

  const SETTINGS_SECTIONS = ["shop", "gst", "invoice", "print", "customerDefaults", "productDefaults", "branding", "security"];

  const save = () => {
    localStorage.setItem("shopmanager_settings", JSON.stringify(settings));
    setHasChanges(false);
    toast.success("Settings saved");
  };

  // ── Data management actions ───────────────────────────────────────────────
  const downloadJSON = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = filename; a.click();
  };

  const downloadCSV = (rows: any[], filename: string) => {
    if (!rows.length) { toast.error("No data to export"); return; }
    const headers = Object.keys(rows[0]).join(",");
    const body = rows.map(r => Object.values(r).map(v => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([headers + "\n" + body], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = filename; a.click();
    toast.success(`Exported ${rows.length} records`);
  };

  const createBackup = () => {
    const backup: Record<string, any> = {};
    ["customers", "products", "invoices", "shopmanager_settings", "shopmanager_shop_data"].forEach(k => {
      const v = localStorage.getItem(k);
      if (v) backup[k] = JSON.parse(v);
    });
    downloadJSON(backup, `shopmanager-backup-${new Date().toISOString().split("T")[0]}.json`);
    toast.success("Backup created and downloaded");
  };

  const clearData = (key: string, label: string) => {
    if (!confirm(`Are you sure you want to clear all ${label}? This cannot be undone.`)) return;
    localStorage.removeItem(key);
    toast.success(`${label} cleared`);
  };

  const changePassword = () => {
    if (!newPassword) { toast.error("New password cannot be empty"); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
    toast.success("Password updated");
    setNewPassword(""); setConfirmPassword("");
    setShowPasswordFields(false);
  };

  // ── Current section title for header ─────────────────────────────────────
  const currentItem = NAV_GROUPS.flatMap(g => g.items).find(i => i.id === activeSection);

  // ── Section content ───────────────────────────────────────────────────────
  const renderSection = () => {
    switch (activeSection) {

      // ── SHOP INFORMATION ──────────────────────────────────────────────────
      case "shop": return (
        <div className="max-w-2xl">
          <SectionHeader title="Shop Information" desc="Your business details appear on all invoices, receipts, and documents." />
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Business Name">
                <Input value={settings.shop.businessName} onChange={v => update("shop", "businessName", v)} placeholder="Your Shop Name" />
              </Field>
              <Field label="Owner Name">
                <Input value={settings.shop.ownerName} onChange={v => update("shop", "ownerName", v)} placeholder="Full name" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Primary Phone">
                <Input value={settings.shop.phone} onChange={v => update("shop", "phone", v)} placeholder="+91 98765 43210" />
              </Field>
              <Field label="Alternate Phone" optional>
                <Input value={settings.shop.altPhone} onChange={v => update("shop", "altPhone", v)} placeholder="+91 — — — — —" />
              </Field>
            </div>
            <Field label="Email Address">
              <Input value={settings.shop.email} onChange={v => update("shop", "email", v)} type="email" placeholder="shop@example.com" />
            </Field>
            <Field label="Street Address">
              <Textarea value={settings.shop.address} onChange={v => update("shop", "address", v)} rows={2} />
            </Field>
            <div className="grid grid-cols-3 gap-4">
              <Field label="City">
                <Input value={settings.shop.city} onChange={v => update("shop", "city", v)} placeholder="Kochi" />
              </Field>
              <Field label="State">
                <Input value={settings.shop.state} onChange={v => update("shop", "state", v)} placeholder="Kerala" />
              </Field>
              <Field label="PIN Code">
                <Input value={settings.shop.pinCode} onChange={v => update("shop", "pinCode", v)} placeholder="682001" />
              </Field>
            </div>
          </div>
        </div>
      );

      // ── GST INFORMATION ───────────────────────────────────────────────────
      case "gst": return (
        <div className="max-w-2xl">
          <SectionHeader title="GST Information" desc="Tax identification details used in all GST invoices and filings." />
          <div className="space-y-5">
            <Field label="GSTIN" help="15-character Goods and Services Tax Identification Number">
              <Input value={settings.gst.gstin} onChange={v => update("gst", "gstin", v)} mono upper placeholder="29ABCDE1234F1Z5" />
            </Field>
            <Field label="PAN Number" help="Permanent Account Number linked to your business">
              <Input value={settings.gst.pan} onChange={v => update("gst", "pan", v)} mono upper placeholder="ABCDE1234F" />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Registered State">
                <Input value={settings.gst.state} onChange={v => update("gst", "state", v)} placeholder="Kerala" />
              </Field>
              <Field label="State Code" help="2-digit code (e.g. 32 for Kerala)">
                <Input value={settings.gst.stateCode} onChange={v => update("gst", "stateCode", v)} placeholder="32" />
              </Field>
            </div>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">GSTIN and state information is printed on every A4 GST invoice. Ensure these match your official registration documents.</p>
            </div>
          </div>
        </div>
      );

      // ── INVOICE PREFERENCES ───────────────────────────────────────────────
      case "invoice": return (
        <div className="max-w-2xl">
          <SectionHeader title="Invoice Preferences" desc="Configure numbering, terms, and banking details for your invoices." />
          <div className="space-y-6">
            <CardBlock title="Invoice Numbering">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Invoice Prefix" help='Will appear as "PREFIX-YEAR-001"'>
                  <Input value={settings.invoice.prefix} onChange={v => update("invoice", "prefix", v)} placeholder="INV" />
                </Field>
                <Field label="Starting Number">
                  <input
                    type="number"
                    min={1}
                    value={settings.invoice.startingNumber}
                    onChange={e => update("invoice", "startingNumber", parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </Field>
              </div>
              <div className="mt-2 px-3 py-2 bg-slate-100 rounded-lg">
                <p className="text-xs text-slate-500">Preview: <span className="font-mono font-semibold text-slate-700">{settings.invoice.prefix}-{new Date().getFullYear()}-{String(settings.invoice.startingNumber).padStart(3, "0")}</span></p>
              </div>
            </CardBlock>

            <CardBlock title="Terms & Conditions">
              <Field label="Default Terms" help="Printed at the bottom of every A4 invoice">
                <Textarea value={settings.invoice.terms} onChange={v => update("invoice", "terms", v)} rows={4} />
              </Field>
              <div className="mt-3">
                <Field label="Signature Label">
                  <Input value={settings.invoice.signatureText} onChange={v => update("invoice", "signatureText", v)} placeholder="Authorized Signatory" />
                </Field>
              </div>
            </CardBlock>

            <CardBlock title="Bank & Payment Details">
              <p className="text-xs text-slate-500 mb-4">Printed on invoices for customer payment reference.</p>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Bank Name">
                    <Input value={settings.invoice.bankName} onChange={v => update("invoice", "bankName", v)} placeholder="HDFC Bank" />
                  </Field>
                  <Field label="IFSC Code">
                    <Input value={settings.invoice.ifsc} onChange={v => update("invoice", "ifsc", v)} mono upper placeholder="HDFC0001234" />
                  </Field>
                </div>
                <Field label="Account Number">
                  <Input value={settings.invoice.accountNumber} onChange={v => update("invoice", "accountNumber", v)} mono placeholder="12345678901234" />
                </Field>
                <Field label="UPI ID">
                  <Input value={settings.invoice.upiId} onChange={v => update("invoice", "upiId", v)} placeholder="yourshop@upi" />
                </Field>
              </div>
            </CardBlock>
          </div>
        </div>
      );

      // ── PRINT SETTINGS ────────────────────────────────────────────────────
      case "print": return (
        <div className="max-w-2xl">
          <SectionHeader title="Print Settings" desc="Configure default output format and print behaviour for invoices." />
          <div className="space-y-6">
            <CardBlock title="Default Output Format">
              <p className="text-xs text-slate-500 mb-3">Which format opens by default in the billing screen.</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: "a4", label: "A4 GST Invoice", desc: "Full page document for business customers" },
                  { id: "thermal", label: "Thermal Receipt", desc: "80mm receipt for walk-in sales" },
                ].map(opt => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => update("print", "defaultOutput", opt.id)}
                    className={`text-left p-4 rounded-xl border-2 transition-all ${settings.print.defaultOutput === opt.id ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-white hover:border-slate-300"}`}
                  >
                    <div className="flex items-start justify-between">
                      <p className={`text-sm font-semibold ${settings.print.defaultOutput === opt.id ? "text-blue-700" : "text-slate-800"}`}>{opt.label}</p>
                      {settings.print.defaultOutput === opt.id && <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </CardBlock>

            <CardBlock title="Thermal Printer Width">
              <div className="flex gap-3">
                {["58mm", "80mm"].map(w => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => update("print", "thermalWidth", w)}
                    className={`flex-1 py-2.5 text-sm font-semibold rounded-lg border-2 transition-all ${settings.print.thermalWidth === w ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}
                  >
                    {w} Paper
                  </button>
                ))}
              </div>
            </CardBlock>

            <CardBlock title="Print Behaviour">
              {[
                { id: "ask", label: "Ask Before Printing", desc: "Opens a confirmation dialog before sending to printer" },
                { id: "auto", label: "Auto-Print on Save", desc: "Automatically sends to printer when invoice is saved" },
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => update("print", "printBehavior", opt.id)}
                  className={`w-full text-left flex items-center justify-between p-3 mb-2 last:mb-0 rounded-lg border transition-all ${settings.print.printBehavior === opt.id ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
                >
                  <div>
                    <p className={`text-sm font-medium ${settings.print.printBehavior === opt.id ? "text-blue-700" : "text-slate-700"}`}>{opt.label}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{opt.desc}</p>
                  </div>
                  {settings.print.printBehavior === opt.id && <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />}
                </button>
              ))}
            </CardBlock>
          </div>
        </div>
      );

      // ── CUSTOMER DEFAULTS ─────────────────────────────────────────────────
      case "customerDefaults": return (
        <div className="max-w-2xl">
          <SectionHeader title="Customer Defaults" desc="Default values and required fields for the customer module." />
          <div className="space-y-6">
            <CardBlock title="Location Defaults">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Default State" footnote help="* Prefilled when adding a new customer" helpBelow>
                  <Input value={settings.customerDefaults.defaultState} onChange={v => update("customerDefaults", "defaultState", v)} placeholder="Kerala" />
                </Field>
                <Field label="Default State Code">
                  <Input value={settings.customerDefaults.defaultStateCode} onChange={v => update("customerDefaults", "defaultStateCode", v)} placeholder="32" />
                </Field>
              </div>
            </CardBlock>

            <CardBlock title="Required Fields">
              <p className="text-xs text-slate-500 mb-3">Control which fields are mandatory when adding customers.</p>
              <div className="divide-y divide-slate-100">
                <ToggleRow label="Phone Number" help="Required when creating a new customer" value={settings.customerDefaults.requirePhone} onChange={v => update("customerDefaults", "requirePhone", v)} />
                <ToggleRow label="GSTIN" help="Require GST identification for all customers" value={settings.customerDefaults.requireGSTIN} onChange={v => update("customerDefaults", "requireGSTIN", v)} />
                <ToggleRow label="Address" help="Require full address for all customers" value={settings.customerDefaults.requireAddress} onChange={v => update("customerDefaults", "requireAddress", v)} />
              </div>
            </CardBlock>
          </div>
        </div>
      );

      // ── PRODUCT DEFAULTS ──────────────────────────────────────────────────
      case "productDefaults": return (
        <div className="max-w-2xl">
          <SectionHeader title="Product Defaults" desc="Default values applied when adding new products to the catalog." />
          <div className="space-y-6">
            <CardBlock title="Tax Defaults">
              <Field label="Default GST Rate" help="Applied to new products if not specified">
                <div className="flex gap-2 flex-wrap mt-1">
                  {[0, 5, 12, 18, 28].map(rate => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => update("productDefaults", "defaultGSTRate", rate)}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg border-2 transition-all ${settings.productDefaults.defaultGSTRate === rate ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"}`}
                    >
                      {rate}%
                    </button>
                  ))}
                </div>
              </Field>
            </CardBlock>

            <CardBlock title="Unit & Stock">
              <div className="space-y-4">
                <Field label="Default Unit">
                  <select
                    value={settings.productDefaults.defaultUnit}
                    onChange={e => update("productDefaults", "defaultUnit", e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  >
                    {["pcs", "kg", "g", "L", "mL", "m", "cm", "box", "set", "pair", "dozen"].map(u => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Low Stock Alert Threshold" help="Shows alert when stock falls below this number">
                  <input
                    type="number"
                    min={0}
                    value={settings.productDefaults.lowStockThreshold}
                    onChange={e => update("productDefaults", "lowStockThreshold", parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </Field>
              </div>
            </CardBlock>

            <CardBlock title="Pricing">
              <ToggleRow
                label="Prices Include GST"
                help="When enabled, entered price is treated as GST-inclusive (MRP mode)"
                value={settings.productDefaults.priceIncludesGST}
                onChange={v => update("productDefaults", "priceIncludesGST", v)}
              />
            </CardBlock>
          </div>
        </div>
      );

      // ── INVOICE TEMPLATES ─────────────────────────────────────────────────
      case "templates": return (
        <div className="max-w-2xl">
          <SectionHeader title="Invoice Templates" desc="Manage the HTML templates used for printing A4 invoices and thermal receipts." />
          <div className="space-y-4">
            {[
              { label: "A4 GST Invoice Template", desc: "Used for printing full-page GST invoices for business customers.", icon: FileText },
              { label: "Thermal Receipt Template", desc: "Used for 80mm thermal receipt printing at the point of sale.", icon: Printer },
            ].map(({ label, desc, icon: Icon }) => (
              <div key={label} className="bg-slate-50 rounded-xl border border-slate-200 p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg border border-slate-200 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-slate-500" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full">Default</span>
                </div>
                <div className="flex gap-2">
                  <ActionBtn onClick={() => toast.info("Template preview — coming soon")} icon={Eye} label="Preview" />
                  <ActionBtn onClick={() => toast.info("Upload custom template — coming soon")} icon={Upload} label="Upload Custom" />
                  <ActionBtn onClick={() => toast.success("Template restored to default")} icon={RotateCcw} label="Restore Default" variant="ghost" />
                </div>
              </div>
            ))}
            <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">Custom template upload accepts Jinja2 HTML templates. Incorrect templates may break invoice rendering. Always test before using in production.</p>
            </div>
          </div>
        </div>
      );

      // ── BRANDING ──────────────────────────────────────────────────────────
      case "branding": return (
        <div className="max-w-2xl">
          <SectionHeader title="Branding" desc="Upload your business logo, signature, and stamp. These are embedded in printed invoices." />
          <div className="space-y-6">
            <CardBlock title="Visual Identity">
              <div className="space-y-6">
                <BrandingUpload
                  label="Company Logo"
                  help="Appears in the top-left of all A4 invoices. Recommended: PNG, max 2MB."
                  value={settings.branding.logoUrl}
                  onChange={v => update("branding", "logoUrl", v)}
                />
                <hr className="border-slate-200" />
                <BrandingUpload
                  label="Authorized Signature"
                  help="Printed in the signature area. Use a transparent PNG of your signature."
                  value={settings.branding.signatureUrl}
                  onChange={v => update("branding", "signatureUrl", v)}
                />
                <hr className="border-slate-200" />
                <BrandingUpload
                  label="Company Stamp / Seal"
                  help="Optional round stamp image printed beside the signature."
                  value={settings.branding.stampUrl}
                  onChange={v => update("branding", "stampUrl", v)}
                />
              </div>
            </CardBlock>
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700">Branding images are stored locally in this browser. They will be embedded in printed documents but will not appear on other devices unless uploaded again.</p>
            </div>
          </div>
        </div>
      );

      // ── DATA MANAGEMENT ───────────────────────────────────────────────────
      case "data": return (
        <div className="max-w-2xl">
          <SectionHeader title="Data Management" desc="Backup your data, export records, and manage storage." />
          <div className="space-y-5">
            <CardBlock title="Backup & Restore">
              <p className="text-xs text-slate-500 mb-3">Create a full backup of all your data including customers, products, invoices, and settings.</p>
              <div className="flex gap-3">
                <ActionBtn onClick={createBackup} icon={Download} label="Create Backup" variant="primary" />
                <ActionBtn onClick={() => toast.info("Restore backup — select a .json file")} icon={Upload} label="Restore Backup" />
              </div>
            </CardBlock>

            <CardBlock title="Export Data">
              <p className="text-xs text-slate-500 mb-3">Export individual data sets as CSV files for use in spreadsheets.</p>
              <div className="flex flex-wrap gap-2">
                <ActionBtn onClick={() => downloadCSV(JSON.parse(localStorage.getItem("customers") || "[]"), "customers.csv")} icon={Users} label="Export Customers" />
                <ActionBtn onClick={() => downloadCSV(JSON.parse(localStorage.getItem("products") || "[]"), "products.csv")} icon={Package} label="Export Products" />
                <ActionBtn onClick={() => downloadCSV(JSON.parse(localStorage.getItem("invoices") || "[]"), "invoices.csv")} icon={FileText} label="Export Invoices" />
              </div>
            </CardBlock>

            <DangerBlock title="Danger Zone">
              <p className="text-xs text-red-700 mb-3">These actions permanently delete data and cannot be undone. Create a backup before proceeding.</p>
              <div className="flex flex-wrap gap-2">
                <ActionBtn onClick={() => clearData("invoices", "Invoice History")} icon={Trash2} label="Clear Invoices" variant="danger" />
                <ActionBtn onClick={() => clearData("customers", "All Customers")} icon={Trash2} label="Clear Customers" variant="danger" />
                <ActionBtn onClick={() => clearData("products", "All Products")} icon={Trash2} label="Clear Products" variant="danger" />
                <ActionBtn
                  onClick={() => {
                    if (!confirm("This will reset ALL application data including settings. Are you absolutely sure?")) return;
                    localStorage.clear();
                    toast.success("All data cleared. Please refresh.");
                  }}
                  icon={RefreshCw} label="Reset Everything" variant="danger"
                />
              </div>
            </DangerBlock>
          </div>
        </div>
      );

      // ── SECURITY ──────────────────────────────────────────────────────────
      case "security": return (
        <div className="max-w-2xl">
          <SectionHeader title="Security" desc="Manage operator access, password protection, and session settings." />
          <div className="space-y-6">
            <CardBlock title="Account">
              <div className="space-y-4">
                <Field label="Operator Username">
                  <Input value={settings.security.username} onChange={v => update("security", "username", v)} placeholder="admin" />
                </Field>

                {!showPasswordFields ? (
                  <div>
                    <Label>Password</Label>
                    <button
                      type="button"
                      onClick={() => setShowPasswordFields(true)}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-all"
                    >
                      <Lock className="w-4 h-4" />
                      Change Password
                    </button>
                  </div>
                ) : (
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200"
                    >
                      <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Change Password</p>
                      {[
                        { label: "New Password", value: newPassword, set: setNewPassword },
                        { label: "Confirm Password", value: confirmPassword, set: setConfirmPassword },
                      ].map(({ label, value, set }) => (
                        <div key={label}>
                          <Label>{label}</Label>
                          <input
                            type="password"
                            value={value}
                            onChange={e => set(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="••••••••"
                          />
                        </div>
                      ))}
                      <div className="flex gap-2 pt-1">
                        <button onClick={changePassword} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                          Update Password
                        </button>
                        <button onClick={() => { setShowPasswordFields(false); setNewPassword(""); setConfirmPassword(""); }} className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                          Cancel
                        </button>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </CardBlock>

            <CardBlock title="Session Security">
              <div className="divide-y divide-slate-100">
                <ToggleRow
                  label="Require Password on Startup"
                  help="Prompt for password each time the application is opened"
                  value={settings.security.requirePasswordOnStartup}
                  onChange={v => update("security", "requirePasswordOnStartup", v)}
                />
                <div className="py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-700">Auto Lock</p>
                      <p className="text-xs text-slate-400 mt-0.5">Automatically lock after a period of inactivity</p>
                    </div>
                    <select
                      value={settings.security.autoLock}
                      onChange={e => update("security", "autoLock", e.target.value)}
                      className="px-3 py-1.5 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    >
                      <option value="never">Never</option>
                      <option value="5">5 minutes</option>
                      <option value="10">10 minutes</option>
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                    </select>
                  </div>
                </div>
              </div>
            </CardBlock>
          </div>
        </div>
      );

      // ── SYSTEM INFORMATION ────────────────────────────────────────────────
      case "system": return (
        <div className="max-w-2xl">
          <SectionHeader title="System Information" desc="Application details, storage usage, and diagnostic information." />
          <div className="space-y-5">
            <CardBlock title="Application">
              {[
                ["Application", "ShopManager OS"],
                ["Version", "1.0.0 (Prototype)"],
                ["Build Date", "June 2026"],
                ["Stack", "React + TypeScript + Tailwind CSS"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2.5 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-500">{k}</span>
                  <span className="text-sm font-medium text-slate-800">{v}</span>
                </div>
              ))}
            </CardBlock>

            <CardBlock title="Data Storage">
              {[
                ["Customers", `${systemInfo.customers} records`],
                ["Products", `${systemInfo.products} records`],
                ["Invoices", `${systemInfo.invoices} records`],
                ["Storage Used", `~${systemInfo.storageKB} KB (localStorage)`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2.5 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-500">{k}</span>
                  <span className="text-sm font-medium text-slate-800">{v}</span>
                </div>
              ))}
            </CardBlock>

            <CardBlock title="Browser Environment">
              {[
                ["User Agent", navigator.userAgent.split(")")[0].split("(")[1] || "Unknown"],
                ["Platform", navigator.platform],
                ["Language", navigator.language],
                ["Online", navigator.onLine ? "Yes" : "No"],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between py-2.5 border-b border-slate-100 last:border-0">
                  <span className="text-sm text-slate-500">{k}</span>
                  <span className="text-sm font-medium text-slate-800 truncate max-w-[260px] text-right">{v}</span>
                </div>
              ))}
            </CardBlock>
          </div>
        </div>
      );

      default: return null;
    }
  };

  const isActionSection = ["templates", "data", "system"].includes(activeSection);

  return (
    <div className="flex h-full overflow-hidden bg-slate-100">

      {/* ── Left Navigation Panel ──────────────────────────────────────────── */}
      <div className="w-56 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col overflow-hidden">
        <div className="px-4 py-3.5 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-900">Configuration</h2>
          <p className="text-xs text-slate-400 mt-0.5">Application Settings</p>
        </div>

        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {NAV_GROUPS.map(group => (
            <div key={group.label} className="mb-1">
              <p className="px-2 pt-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {group.label}
              </p>
              {group.items.map(item => {
                const active = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 mb-0.5 rounded-lg text-left transition-all group ${active ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"}`}
                  >
                    <item.icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-white" : "text-slate-400 group-hover:text-slate-600"}`} />
                    <span className="text-xs font-medium leading-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* ── Right Content Panel ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Section header bar */}
        <div className="flex items-center gap-2 px-6 py-3 bg-white border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Settings</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-700 font-medium">{currentItem?.label}</span>
          </div>
          {hasChanges && !isActionSection && (
            <span className="ml-auto flex items-center gap-1.5 text-xs text-amber-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Unsaved changes
            </span>
          )}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.15 }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Save bar — only for form sections */}
        {!isActionSection && (
          <div className="flex-shrink-0 flex items-center justify-between px-6 py-3 bg-white border-t border-slate-200">
            <div className="text-xs text-slate-400">
              {hasChanges ? "Changes will take effect after saving." : "All changes saved."}
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={save}
              disabled={!hasChanges}
              className={`flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg transition-all shadow-sm ${hasChanges ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
            >
              <Save className="w-4 h-4" />
              Save Changes
            </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}
