import { useState, useEffect } from "react";
import { Search, Plus, Edit2, Trash2, Package, X, Hash, DollarSign, Box } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

type Product = {
  id: string;
  name: string;
  description?: string;
  hsn: string;
  price: number;
  stock: number;
  category?: string;
  unit?: string;
};

const STORAGE_KEY = "products";

export function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({});

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setProducts(JSON.parse(stored));
    } else {
      const mockProducts: Product[] = [
        { id: "PRD-001", name: "Wireless Mouse", description: "Ergonomic wireless mouse with USB receiver", hsn: "84716060", price: 450, stock: 120, category: "Electronics", unit: "pcs" },
        { id: "PRD-002", name: "Mechanical Keyboard", description: "RGB backlit mechanical gaming keyboard", hsn: "84716060", price: 2100, stock: 45, category: "Electronics", unit: "pcs" },
        { id: "PRD-003", name: "24-inch Monitor", description: "Full HD LED display with HDMI", hsn: "85285200", price: 12500, stock: 15, category: "Electronics", unit: "pcs" },
        { id: "PRD-004", name: "USB-C Hub", description: "7-in-1 USB-C multiport adapter", hsn: "85366990", price: 850, stock: 200, category: "Accessories", unit: "pcs" },
        { id: "PRD-005", name: "Laptop Stand", description: "Aluminum adjustable laptop stand", hsn: "73269099", price: 1200, stock: 80, category: "Accessories", unit: "pcs" },
        { id: "PRD-006", name: "HDMI Cable 2m", description: "High speed HDMI cable", hsn: "85444900", price: 350, stock: 150, category: "Cables", unit: "pcs" },
        { id: "PRD-007", name: "Webcam 1080p", description: "Full HD webcam with microphone", hsn: "85258020", price: 2800, stock: 12, category: "Electronics", unit: "pcs" },
        { id: "PRD-008", name: "Power Bank 10000mAh", description: "Fast charging portable power bank", hsn: "85076000", price: 1500, stock: 65, category: "Electronics", unit: "pcs" },
      ];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockProducts));
      setProducts(mockProducts);
    }
  }, []);

  const saveProducts = (newProducts: Product[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProducts));
    setProducts(newProducts);
  };

  const handleClosePanel = () => {
    setSelectedProduct(null);
    setIsEditing(false);
    setIsCreating(false);
    setFormData({});
  };

  const handleView = (p: Product) => {
    setSelectedProduct(p);
    setFormData(p);
    setIsEditing(false);
    setIsCreating(false);
  };

  const handleEdit = (p: Product) => {
    setSelectedProduct(p);
    setFormData(p);
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleCreate = () => {
    setSelectedProduct(null);
    setFormData({ unit: "pcs", stock: 0, price: 0 });
    setIsEditing(true);
    setIsCreating(true);
  };

  const handleDelete = (p: Product) => {
    if (confirm(`Are you sure you want to delete ${p.name}?`)) {
      const updated = products.filter(prod => prod.id !== p.id);
      saveProducts(updated);
      toast.success(`${p.name} deleted successfully`);
      handleClosePanel();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.hsn || formData.price === undefined) {
      toast.error("Name, HSN, and price are required");
      return;
    }

    if (isCreating) {
      const newProduct: Product = {
        id: `PRD-${String(products.length + 1).padStart(3, '0')}`,
        name: formData.name!,
        description: formData.description || "",
        hsn: formData.hsn!,
        price: Number(formData.price),
        stock: Number(formData.stock) || 0,
        category: formData.category || "",
        unit: formData.unit || "pcs",
      };
      saveProducts([...products, newProduct]);
      toast.success(`${newProduct.name} added successfully`);
    } else if (selectedProduct) {
      const updated = products.map(p =>
        p.id === selectedProduct.id ? { ...p, ...formData, price: Number(formData.price), stock: Number(formData.stock) } : p
      );
      saveProducts(updated);
      toast.success(`${formData.name} updated successfully`);
    }

    handleClosePanel();
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.hsn.includes(searchTerm) ||
    p.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedProducts = [...filteredProducts].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="flex-1 flex overflow-hidden bg-slate-100 p-4 gap-4">
      <motion.div
        animate={{ width: (selectedProduct || isCreating) ? "66%" : "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
      >
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-600" />
            Inventory & Products
          </h2>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products by name or HSN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 w-72 bg-white"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreate}
              className="flex items-center gap-2 bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add Product
            </motion.button>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
              <tr>
                <th className="py-3 px-6 text-sm font-semibold text-slate-600">Product Code</th>
                <th className="py-3 px-6 text-sm font-semibold text-slate-600">Description</th>
                <th className="py-3 px-6 text-sm font-semibold text-slate-600">Category</th>
                <th className="py-3 px-6 text-sm font-semibold text-slate-600">HSN Code</th>
                <th className="py-3 px-6 text-sm font-semibold text-slate-600 text-right">Base Price (₹)</th>
                <th className="py-3 px-6 text-sm font-semibold text-slate-600 text-right">Stock Qty</th>
                <th className="py-3 px-6 text-sm font-semibold text-slate-600 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {sortedProducts.map((p, index) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="hover:bg-slate-50 transition-colors group cursor-pointer"
                  onClick={() => handleView(p)}
                >
                  <td className="py-3 px-6 text-sm font-medium text-slate-900">{p.id}</td>
                  <td className="py-3 px-6 text-sm text-slate-800">{p.name}</td>
                  <td className="py-3 px-6 text-sm text-slate-600">
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-xs">{p.category || "N/A"}</span>
                  </td>
                  <td className="py-3 px-6 text-sm text-slate-600 font-mono">{p.hsn}</td>
                  <td className="py-3 px-6 text-sm text-slate-900 font-medium text-right">{p.price.toFixed(2)}</td>
                  <td className="py-3 px-6 text-sm text-right">
                    <span className={`px-2.5 py-1 rounded-md font-medium ${p.stock < 20 ? 'bg-red-100 text-red-800' : p.stock < 50 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {p.stock} {p.unit || "pcs"}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-sm text-center">
                    <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleEdit(p); }}
                        className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(p); }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {filteredProducts.length === 0 && (
            <div className="py-16 text-center">
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No products found</p>
            </div>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {(selectedProduct || isCreating) && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-1/3 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
          >
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800">
                {isCreating ? "New Product" : isEditing ? "Edit Product" : "Product Details"}
              </h3>
              <button onClick={handleClosePanel} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Product Name *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Package className="w-4 h-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      readOnly={!isEditing}
                      value={formData.name || ""}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`block w-full pl-9 pr-3 py-2 border rounded-lg text-sm transition-colors ${
                        isEditing ? "border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white" : "border-transparent bg-slate-50 text-slate-700 font-medium"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                  <textarea
                    readOnly={!isEditing}
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className={`block w-full px-3 py-2 border rounded-lg text-sm transition-colors resize-none ${
                      isEditing ? "border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white" : "border-transparent bg-slate-50 text-slate-700"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">HSN Code *</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Hash className="w-4 h-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      required
                      readOnly={!isEditing}
                      value={formData.hsn || ""}
                      onChange={(e) => setFormData({ ...formData, hsn: e.target.value })}
                      className={`block w-full pl-9 pr-3 py-2 border rounded-lg text-sm font-mono transition-colors ${
                        isEditing ? "border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white" : "border-transparent bg-slate-50 text-slate-700"
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Base Price (₹) *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="w-4 h-4 text-slate-400" />
                      </div>
                      <input
                        type="number"
                        required
                        step="0.01"
                        min="0"
                        readOnly={!isEditing}
                        value={formData.price || ""}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        className={`block w-full pl-9 pr-3 py-2 border rounded-lg text-sm transition-colors ${
                          isEditing ? "border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white" : "border-transparent bg-slate-50 text-slate-700"
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Stock Quantity</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Box className="w-4 h-4 text-slate-400" />
                      </div>
                      <input
                        type="number"
                        min="0"
                        readOnly={!isEditing}
                        value={formData.stock || ""}
                        onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                        className={`block w-full pl-9 pr-3 py-2 border rounded-lg text-sm transition-colors ${
                          isEditing ? "border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white" : "border-transparent bg-slate-50 text-slate-700"
                        }`}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                    <input
                      type="text"
                      readOnly={!isEditing}
                      value={formData.category || ""}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className={`block w-full px-3 py-2 border rounded-lg text-sm transition-colors ${
                        isEditing ? "border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white" : "border-transparent bg-slate-50 text-slate-700"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                    <input
                      type="text"
                      readOnly={!isEditing}
                      value={formData.unit || ""}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      placeholder="pcs, kg, liters"
                      className={`block w-full px-3 py-2 border rounded-lg text-sm transition-colors ${
                        isEditing ? "border-slate-300 focus:ring-2 focus:ring-amber-500 bg-white" : "border-transparent bg-slate-50 text-slate-700"
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
                      className="flex-1 bg-amber-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors shadow-sm"
                    >
                      {isCreating ? "Save Product" : "Update Product"}
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
