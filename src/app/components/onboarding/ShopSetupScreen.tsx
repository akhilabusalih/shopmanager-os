import { useState } from "react";
import { motion } from "motion/react";
import {
  Store,
  User,
  Phone,
  FileText,
  MapPin,
  ArrowRight,
  Building2,
} from "lucide-react";

export interface ShopSetupData {
  shopName: string;
  ownerName: string;
  phone: string;
  gstin: string;
  address: string;
}

interface ShopSetupScreenProps {
  onComplete: (data: ShopSetupData) => void;
  initialData: ShopSetupData;
}

const FIELDS = [
  {
    key: "shopName" as const,
    label: "Shop Name",
    icon: Store,
    placeholder: "e.g. Krishna General Stores",
    type: "text",
  },
  {
    key: "ownerName" as const,
    label: "Owner Name",
    icon: User,
    placeholder: "e.g. Rajesh Kumar",
    type: "text",
  },
  {
    key: "phone" as const,
    label: "Phone Number",
    icon: Phone,
    placeholder: "e.g. +91 98765 43210",
    type: "tel",
  },
  {
    key: "gstin" as const,
    label: "GSTIN",
    icon: FileText,
    placeholder: "e.g. 29ABCDE1234F1Z5",
    type: "text",
  },
  {
    key: "address" as const,
    label: "Shop Address",
    icon: MapPin,
    placeholder: "e.g. 12 Market Street, Kochi",
    type: "text",
  },
];

export function ShopSetupScreen({ onComplete, initialData }: ShopSetupScreenProps) {
  const [data, setData] = useState<ShopSetupData>({ ...initialData });

  const update = (key: keyof ShopSetupData, value: string) =>
    setData((prev) => ({ ...prev, [key]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete(data);
  };

  const preview = {
    name: data.shopName || "Your Shop Name",
    owner: data.ownerName || "Owner Name",
    phone: data.phone || "+91 — — — — —",
    address: data.address || "Shop Address",
    gstin: data.gstin || "GSTIN",
  };

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        background:
          "radial-gradient(ellipse at 25% 60%, #dbeafe 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, #e0e7ff 0%, transparent 55%), #f0f4f8",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="w-full max-w-4xl"
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-200/60 overflow-hidden">
          {/* Progress bar */}
          <div className="h-1 bg-slate-100">
            <motion.div
              className="h-1 bg-blue-500"
              initial={{ width: "33%" }}
              animate={{ width: "66%" }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            />
          </div>

          <div className="grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
            {/* Left — Form */}
            <div className="p-7 lg:p-8">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                    <span
                      className="text-blue-600"
                      style={{ fontSize: "0.7rem", fontWeight: 700 }}
                    >
                      2
                    </span>
                  </div>
                  <span
                    className="text-blue-600"
                    style={{ fontSize: "0.8rem", fontWeight: 500 }}
                  >
                    Step 2 of 3
                  </span>
                </div>
                <h2
                  className="text-slate-900"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                  }}
                >
                  Set up your shop
                </h2>
                <p className="text-slate-500 mt-1" style={{ fontSize: "0.875rem" }}>
                  Enter your business details to personalize your workspace.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {FIELDS.map(({ key, label, icon: Icon, placeholder, type }) => (
                  <div key={key} className="space-y-1.5">
                    <label
                      className="text-slate-700"
                      style={{ fontSize: "0.875rem", fontWeight: 500 }}
                    >
                      {label}
                    </label>
                    <div className="relative">
                      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                      <input
                        type={type}
                        value={data[key]}
                        onChange={(e) => update(key, e.target.value)}
                        placeholder={placeholder}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        style={{ fontSize: "0.9rem" }}
                      />
                    </div>
                  </div>
                ))}

                <motion.button
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 shadow-lg shadow-blue-600/20 mt-2"
                  style={{
                    fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </form>
            </div>

            {/* Right — Live Preview */}
            <div className="p-7 lg:p-8 bg-slate-50/60 flex flex-col justify-center">
              <p
                className="text-slate-400 uppercase mb-5"
                style={{ fontSize: "0.65rem", letterSpacing: "0.15em", fontWeight: 600 }}
              >
                Live Preview
              </p>

              {/* Business card */}
              <motion.div
                className="rounded-2xl border border-slate-200 shadow-lg overflow-hidden"
                layout
                transition={{ duration: 0.2 }}
              >
                {/* Card header */}
                <div className="bg-blue-600 px-6 py-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="min-w-0">
                      <motion.p
                        key={preview.name}
                        className="text-white leading-tight truncate"
                        style={{
                          fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                          fontSize: "1.05rem",
                          fontWeight: 700,
                        }}
                        initial={{ opacity: 0.6 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {preview.name}
                      </motion.p>
                      <p className="text-blue-200 mt-0.5" style={{ fontSize: "0.75rem" }}>
                        Business Workspace
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card body */}
                <div className="bg-white px-6 py-5 space-y-3">
                  {[
                    { icon: User, value: preview.owner },
                    { icon: Phone, value: preview.phone },
                    { icon: MapPin, value: preview.address },
                    { icon: FileText, value: preview.gstin, mono: true },
                  ].map(({ icon: Icon, value, mono }, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <motion.span
                        key={value}
                        className={`text-slate-700 truncate ${mono ? "font-mono" : ""}`}
                        style={{ fontSize: mono ? "0.78rem" : "0.875rem" }}
                        initial={{ opacity: 0.5 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {value}
                      </motion.span>
                    </div>
                  ))}
                </div>

                {/* Card footer */}
                <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full" />
                  <span className="text-slate-400" style={{ fontSize: "0.75rem" }}>
                    Workspace ready to initialize
                  </span>
                </div>
              </motion.div>

              <p className="text-slate-400 text-center mt-4" style={{ fontSize: "0.75rem" }}>
                Used across billing, invoices &amp; reports.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
