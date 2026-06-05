import { useState } from "react";
import { X, User, Phone, Mail, MapPin, Hash, Building2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import type { Customer } from "./billingTypes";

interface NewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (customer: Customer) => void;
}

const EMPTY = {
  name: "", phone: "", email: "", gstin: "",
  address: "", city: "", state: "", stateCode: "", pincode: "",
};

export function NewCustomerModal({ isOpen, onClose, onCreated }: NewCustomerModalProps) {
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);

  const set = (k: keyof typeof EMPTY, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.name.trim()) { toast.error("Customer name is required"); return; }
    if (!form.phone.trim()) { toast.error("Phone number is required"); return; }
    setSaving(true);

    const stored: Customer[] = JSON.parse(localStorage.getItem("customers") || "[]");
    const customer: Customer = {
      id: `CUST-${Date.now()}`,
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || undefined,
      gstin: form.gstin.trim().toUpperCase(),
      address: form.address.trim(),
      city: form.city.trim() || undefined,
      state: form.state.trim(),
      stateCode: form.stateCode.trim(),
      pincode: form.pincode.trim() || undefined,
    };

    stored.push(customer);
    localStorage.setItem("customers", JSON.stringify(stored));
    toast.success(`Customer "${customer.name}" created`);
    onCreated(customer);
    setForm({ ...EMPTY });
    setSaving(false);
    onClose();
  };

  const fields = [
    { key: "name" as const, label: "Customer Name *", icon: User, placeholder: "Full name" },
    { key: "phone" as const, label: "Phone Number *", icon: Phone, placeholder: "+91 98765 43210" },
    { key: "email" as const, label: "Email", icon: Mail, placeholder: "email@example.com" },
    { key: "gstin" as const, label: "GSTIN", icon: Hash, placeholder: "29ABCDE1234F1Z5", mono: true, upper: true },
    { key: "address" as const, label: "Address", icon: MapPin, placeholder: "Street / Area" },
    { key: "city" as const, label: "City", icon: Building2, placeholder: "City name" },
    { key: "state" as const, label: "State", icon: MapPin, placeholder: "Kerala" },
    { key: "stateCode" as const, label: "State Code", icon: Hash, placeholder: "32" },
    { key: "pincode" as const, label: "Pincode", icon: Hash, placeholder: "682001" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="relative z-10 bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden"
            initial={{ scale: 0.96, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">New Customer</h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                {fields.map(({ key, label, icon: Icon, placeholder, mono, upper }) => (
                  <div key={key} className={key === "address" ? "col-span-2" : ""}>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
                    <div className="relative">
                      <Icon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                      <input
                        type="text"
                        value={(form as any)[key]}
                        onChange={e => set(key, upper ? e.target.value.toUpperCase() : e.target.value)}
                        placeholder={placeholder}
                        className={`w-full pl-8 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none ${mono ? "font-mono tracking-wide" : ""}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 px-5 py-4 border-t border-slate-200 bg-slate-50">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
              >
                {saving ? "Saving..." : "Save Customer"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
