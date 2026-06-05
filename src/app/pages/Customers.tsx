import { useState, useEffect } from "react";
import { Search, Plus, Edit2, Eye, X, Building2, Phone, MapPin, Hash, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

type Customer = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  city?: string;
  state: string;
  stateCode: string;
  pincode?: string;
  gstin: string;
};

const STORAGE_KEY = "customers";

export function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Customer>>({});

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setCustomers(JSON.parse(stored));
    } else {
      const mockCustomers: Customer[] = [
        { id: "CUST-001", name: "Acme Corp", phone: "9876543210", email: "contact@acme.com", address: "123 Business Park, Sector 4", city: "Mumbai", state: "Maharashtra", stateCode: "27", pincode: "400001", gstin: "27AADCB2230M1Z2" },
        { id: "CUST-002", name: "Rahul Sharma", phone: "9876543211", email: "rahul@example.com", address: "45 MG Road", city: "Bangalore", state: "Karnataka", stateCode: "29", pincode: "560001", gstin: "29ABCDE1234F1Z5" },
        { id: "CUST-003", name: "TechSolutions Ltd", phone: "9876543212", email: "info@techsolutions.com", address: "78 IT Park, Phase 2", city: "Pune", state: "Maharashtra", stateCode: "27", pincode: "411001", gstin: "27QWERT1234Z1Z2" },
        { id: "CUST-004", name: "Priya Traders", phone: "9876543213", email: "priya@traders.in", address: "101 Market Street", city: "Delhi", state: "Delhi", stateCode: "07", pincode: "110001", gstin: "07ASDFG9876Q1Z3" },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockCustomers));
      setCustomers(mockCustomers);
    }
  }, []);

  const saveCustomers = (newCustomers: Customer[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newCustomers));
    setCustomers(newCustomers);
  };

  const handleClosePanel = () => {
    setSelectedCustomer(null);
    setIsEditing(false);
    setIsCreating(false);
    setFormData({});
  };

  const handleView = (c: Customer) => {
    setSelectedCustomer(c);
    setFormData(c);
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleEdit = (c: Customer) => {
    setSelectedCustomer(c);
    setFormData(c);
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setSelectedCustomer(null);
    setFormData({});
    setIsEditing(true);
    setIsCreating(true);
  };

  const handleDelete = (c: Customer) => {
    if (confirm(`Are you sure you want to delete ${c.name}?`)) {
      const updated = customers.filter(cust => cust.id !== c.id);
      saveCustomers(updated);
      toast.success(`${c.name} deleted successfully`);
      handleClosePanel();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      toast.error("Name and phone are required");
      return;
    }

    if (isCreating) {
      const newCustomer: Customer = {
        id: `CUST-${String(customers.length + 1).padStart(3, '0')}`,
        name: formData.name!,
        phone: formData.phone!,
        email: formData.email || "",
        address: formData.address || "",
        city: formData.city || "",
        state: formData.state || "",
        stateCode: formData.stateCode || "",
        pincode: formData.pincode || "",
        gstin: formData.gstin || "",
      };
      saveCustomers([...customers, newCustomer]);
      toast.success(`${newCustomer.name} added successfully`);
    } else if (selectedCustomer) {
      const updated = customers.map(c =>
        c.id === selectedCustomer.id ? { ...c, ...formData } : c
      );
      saveCustomers(updated);
      toast.success(`${formData.name} updated successfully`);
    }

    handleClosePanel();
  };

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.gstin.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-100 p-4 gap-4">
      {/* LEFT SIDE: List */}
      <motion.div
        animate={{ width: (selectedCustomer || isCreating) ? "66%" : "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
      >
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Customers Database</h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 w-64 bg-white"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreate}
              className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Customer
            </motion.button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 shadow-sm z-10">
              <tr>
                <th className="py-3 px-6 text-sm font-semibold text-slate-600">ID</th>
                <th className="py-3 px-6 text-sm font-semibold text-slate-600">Name</th>
                <th className="py-3 px-6 text-sm font-semibold text-slate-600">Phone</th>
                <th className="py-3 px-6 text-sm font-semibold text-slate-600">GSTIN</th>
                <th className="py-3 px-6 text-sm font-semibold text-slate-600">State</th>
                <th className="py-3 px-6 text-sm font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((c, index) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-slate-50 transition-colors group"
                >
                  <td className="py-3 px-6 text-sm text-slate-500">{c.id}</td>
                  <td className="py-3 px-6 text-sm font-medium text-slate-900">{c.name}</td>
                  <td className="py-3 px-6 text-sm text-slate-600">{c.phone}</td>
                  <td className="py-3 px-6 text-sm text-slate-600 font-mono">{c.gstin || "N/A"}</td>
                  <td className="py-3 px-6 text-sm text-slate-600">{c.state}</td>
                  <td className="py-3 px-6 text-sm text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleView(c)} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded" title="View">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleEdit(c)} className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(c)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filteredCustomers.length === 0 && (
            <div className="py-16 text-center">
              <Users className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No customers found</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* RIGHT SIDE: Detail/Form Panel */}
      <AnimatePresence>
        {(selectedCustomer || isCreating) && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-1/3 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">
                {isCreating ? "New Customer" : isEditing ? "Edit Customer" : "Customer Details"}
              </h3>
              <button onClick={handleClosePanel} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Customer Name *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="w-4 h-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      readOnly={!isEditing}
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`block w-full pl-9 pr-3 py-2 border rounded-lg text-sm transition-colors ${
                        isEditing ? "border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white" : "border-transparent bg-slate-50 text-slate-700 font-medium"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="w-4 h-4 text-slate-400" />
                    </div>
                    <input
                      type="tel"
                      required
                      readOnly={!isEditing}
                      value={formData.phone || ""}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`block w-full pl-9 pr-3 py-2 border rounded-lg text-sm transition-colors ${
                        isEditing ? "border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white" : "border-transparent bg-slate-50 text-slate-700"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    readOnly={!isEditing}
                    value={formData.email || ""}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`block w-full px-3 py-2 border rounded-lg text-sm transition-colors ${
                      isEditing ? "border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white" : "border-transparent bg-slate-50 text-slate-700"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">GSTIN</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Hash className="w-4 h-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      readOnly={!isEditing}
                      value={formData.gstin || ""}
                      onChange={(e) => setFormData({ ...formData, gstin: e.target.value.toUpperCase() })}
                      className={`block w-full pl-9 pr-3 py-2 border rounded-lg text-sm font-mono transition-colors uppercase ${
                        isEditing ? "border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white" : "border-transparent bg-slate-50 text-slate-700"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                  <div className="relative">
                    <div className="absolute top-2.5 left-3 pointer-events-none">
                      <MapPin className="w-4 h-4 text-slate-400" />
                    </div>
                    <textarea
                      readOnly={!isEditing}
                      value={formData.address || ""}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={3}
                      className={`block w-full pl-9 pr-3 py-2 border rounded-lg text-sm transition-colors resize-none ${
                        isEditing ? "border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white" : "border-transparent bg-slate-50 text-slate-700"
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                    <input
                      type="text"
                      readOnly={!isEditing}
                      value={formData.city || ""}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className={`block w-full px-3 py-2 border rounded-lg text-sm transition-colors ${
                        isEditing ? "border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white" : "border-transparent bg-slate-50 text-slate-700"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Pincode</label>
                    <input
                      type="text"
                      readOnly={!isEditing}
                      value={formData.pincode || ""}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className={`block w-full px-3 py-2 border rounded-lg text-sm transition-colors ${
                        isEditing ? "border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white" : "border-transparent bg-slate-50 text-slate-700"
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                    <input
                      type="text"
                      readOnly={!isEditing}
                      value={formData.state || ""}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className={`block w-full px-3 py-2 border rounded-lg text-sm transition-colors ${
                        isEditing ? "border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white" : "border-transparent bg-slate-50 text-slate-700"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">State Code</label>
                    <input
                      type="text"
                      readOnly={!isEditing}
                      value={formData.stateCode || ""}
                      onChange={(e) => setFormData({ ...formData, stateCode: e.target.value })}
                      className={`block w-full px-3 py-2 border rounded-lg text-sm transition-colors ${
                        isEditing ? "border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white" : "border-transparent bg-slate-50 text-slate-700"
                      }`}
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="pt-4 border-t border-slate-200 mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={handleClosePanel}
                      className="flex-1 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-emerald-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                    >
                      {isCreating ? "Save Customer" : "Update Customer"}
                    </button>
                  </div>
                )}
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Users(props: any) {
  return <Building2 {...props} />;
}
