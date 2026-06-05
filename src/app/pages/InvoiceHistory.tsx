import { useState, useEffect } from "react";
import { Search, Filter, Printer, ExternalLink, Calendar, Receipt, Download, Eye, X, ArrowUpDown } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";

type Invoice = {
  id: string;
  date: string;
  customer: {
    name: string;
    gstin?: string;
    state?: string;
  };
  items: Array<{
    desc: string;
    hsn: string;
    qty: number;
    rate: number;
  }>;
  subtotal: number;
  cgst: number;
  sgst: number;
  total: number;
  status: "Paid" | "Pending" | "Cancelled";
};

type SortField = "date" | "id" | "customer" | "total";
type SortOrder = "asc" | "desc";

export function InvoiceHistory() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem("invoices");
    if (stored) {
      setInvoices(JSON.parse(stored));
    }
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const exportToCSV = () => {
    const headers = ["Invoice No", "Date", "Customer", "GSTIN", "Amount", "Status"];
    const rows = filteredAndSortedInvoices.map(inv => [
      inv.id,
      new Date(inv.date).toLocaleDateString(),
      inv.customer.name,
      inv.customer.gstin || "N/A",
      inv.total.toFixed(2),
      inv.status
    ]);

    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoices-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success("Invoice data exported successfully");
  };

  const filteredAndSortedInvoices = invoices
    .filter(inv => {
      const matchesSearch =
        inv.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customer.gstin?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDateRange = (!startDate || new Date(inv.date) >= new Date(startDate)) &&
        (!endDate || new Date(inv.date) <= new Date(endDate));

      const matchesStatus = statusFilter === "all" || inv.status === statusFilter;

      return matchesSearch && matchesDateRange && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case "date":
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case "id":
          comparison = a.id.localeCompare(b.id);
          break;
        case "customer":
          comparison = a.customer.name.localeCompare(b.customer.name);
          break;
        case "total":
          comparison = a.total - b.total;
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

  return (
    <div className="flex-1 flex flex-col bg-slate-100 p-4">
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col gap-4 bg-slate-50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-indigo-600" />
              Invoice Ledger & History
            </h2>
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportToCSV}
                className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" /> Export CSV
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm"
              >
                <Filter className="w-4 h-4" /> Filters
              </motion.button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex gap-4 items-center overflow-hidden"
              >
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search by invoice number or customer name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                </div>

                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 text-slate-600 bg-white"
                  />
                </div>
                <span className="text-slate-400">to</span>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 text-slate-600 bg-white"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 text-slate-600 bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="Paid">Paid</option>
                  <option value="Pending">Pending</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

                <button
                  onClick={() => {
                    setSearchTerm("");
                    setStartDate("");
                    setEndDate("");
                    setStatusFilter("all");
                  }}
                  className="px-4 py-2 text-sm text-slate-600 hover:text-slate-900"
                >
                  Clear
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex-1 overflow-auto">
          {filteredAndSortedInvoices.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 z-10">
                <tr>
                  <th className="py-3 px-6 text-sm font-semibold text-slate-600">
                    <button onClick={() => handleSort("date")} className="flex items-center gap-1 hover:text-indigo-600">
                      Date {sortField === "date" && <ArrowUpDown className="w-3 h-3" />}
                    </button>
                  </th>
                  <th className="py-3 px-6 text-sm font-semibold text-slate-600">
                    <button onClick={() => handleSort("id")} className="flex items-center gap-1 hover:text-indigo-600">
                      Invoice No. {sortField === "id" && <ArrowUpDown className="w-3 h-3" />}
                    </button>
                  </th>
                  <th className="py-3 px-6 text-sm font-semibold text-slate-600">
                    <button onClick={() => handleSort("customer")} className="flex items-center gap-1 hover:text-indigo-600">
                      Customer {sortField === "customer" && <ArrowUpDown className="w-3 h-3" />}
                    </button>
                  </th>
                  <th className="py-3 px-6 text-sm font-semibold text-slate-600">GSTIN</th>
                  <th className="py-3 px-6 text-sm font-semibold text-slate-600 text-right">
                    <button onClick={() => handleSort("total")} className="flex items-center gap-1 ml-auto hover:text-indigo-600">
                      Total Amount (₹) {sortField === "total" && <ArrowUpDown className="w-3 h-3" />}
                    </button>
                  </th>
                  <th className="py-3 px-6 text-sm font-semibold text-slate-600 text-center">Status</th>
                  <th className="py-3 px-6 text-sm font-semibold text-slate-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredAndSortedInvoices.map((inv, index) => (
                  <motion.tr
                    key={inv.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="py-3 px-6 text-sm text-slate-600">{new Date(inv.date).toLocaleDateString()}</td>
                    <td className="py-3 px-6 text-sm font-medium text-slate-900">{inv.id}</td>
                    <td className="py-3 px-6 text-sm text-slate-800">{inv.customer.name}</td>
                    <td className="py-3 px-6 text-sm text-slate-500 font-mono">{inv.customer.gstin || "N/A"}</td>
                    <td className="py-3 px-6 text-sm text-slate-900 font-bold text-right">{inv.total.toFixed(2)}</td>
                    <td className="py-3 px-6 text-sm text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' :
                        inv.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-6 text-sm text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                          title="View Invoice"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toast.info("Print feature coming soon")}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded"
                          title="Print/Reprint"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-16 text-center">
              <Receipt className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No invoices found</p>
              <p className="text-slate-400 text-sm mt-2">Try adjusting your filters or create a new invoice</p>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedInvoice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedInvoice(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
            >
              <div className="sticky top-0 bg-white border-b border-slate-200 p-4 flex items-center justify-between z-10">
                <h3 className="text-lg font-bold text-slate-800">Invoice Details - {selectedInvoice.id}</h3>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Invoice Number</p>
                    <p className="font-medium text-slate-900">{selectedInvoice.id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Date</p>
                    <p className="font-medium text-slate-900">{new Date(selectedInvoice.date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Customer</p>
                    <p className="font-medium text-slate-900">{selectedInvoice.customer.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">GSTIN</p>
                    <p className="font-medium text-slate-900 font-mono">{selectedInvoice.customer.gstin || "N/A"}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-slate-800 mb-3">Items</h4>
                  <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="py-2 px-3 text-left text-slate-600">Description</th>
                        <th className="py-2 px-3 text-left text-slate-600">HSN</th>
                        <th className="py-2 px-3 text-right text-slate-600">Qty</th>
                        <th className="py-2 px-3 text-right text-slate-600">Rate</th>
                        <th className="py-2 px-3 text-right text-slate-600">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {selectedInvoice.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2 px-3">{item.desc}</td>
                          <td className="py-2 px-3 font-mono text-xs">{item.hsn}</td>
                          <td className="py-2 px-3 text-right">{item.qty}</td>
                          <td className="py-2 px-3 text-right">₹{item.rate.toFixed(2)}</td>
                          <td className="py-2 px-3 text-right font-medium">₹{(item.qty * item.rate).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-700">Subtotal:</span>
                    <span className="font-medium">₹{selectedInvoice.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-700">CGST (9%):</span>
                    <span className="font-medium">₹{selectedInvoice.cgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-700">SGST (9%):</span>
                    <span className="font-medium">₹{selectedInvoice.sgst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg pt-2 border-t border-indigo-200">
                    <span className="font-bold text-slate-800">Total:</span>
                    <span className="font-bold text-indigo-700">₹{selectedInvoice.total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => toast.info("Print feature coming soon")}
                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                  >
                    <Printer className="w-4 h-4" /> Print Invoice
                  </button>
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="flex-1 bg-slate-100 text-slate-700 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
