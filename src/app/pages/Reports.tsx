import { useState, useEffect, useMemo } from "react";
import {
  FileText, Users, Package, Receipt, TrendingUp, Download,
  Printer, RefreshCw, ChevronRight, ChevronLeft, ChevronDown, ChevronUp,
  Search, X, BarChart3, ArrowUpDown, AlertCircle,
  FileSpreadsheet, CheckSquare, Square, Calendar, Eye,
} from "lucide-react";
import { toast } from "sonner";
import { fetchApi } from "../../lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type ReportCategory = "sales" | "customer" | "product" | "invoice" | "gst" | "export";
type SortConfig = { key: string; dir: "asc" | "desc" };

const CATEGORIES = [
  { id: "sales" as const, label: "Sales Reports", desc: "View sales records by date, customer, and invoice", icon: TrendingUp, iconBg: "bg-blue-100", color: "text-blue-600", border: "border-blue-200 hover:border-blue-400" },
  { id: "customer" as const, label: "Customer Reports", desc: "View customer purchasing history and summaries", icon: Users, iconBg: "bg-indigo-100", color: "text-indigo-600", border: "border-indigo-200 hover:border-indigo-400" },
  { id: "product" as const, label: "Product Reports", desc: "Analyze product performance and inventory movement", icon: Package, iconBg: "bg-amber-100", color: "text-amber-600", border: "border-amber-200 hover:border-amber-400" },
  { id: "invoice" as const, label: "Invoice Reports", desc: "Search and retrieve detailed invoice records", icon: FileText, iconBg: "bg-emerald-100", color: "text-emerald-600", border: "border-emerald-200 hover:border-emerald-400" },
  { id: "gst" as const, label: "GST Reports", desc: "Tax reporting and GST breakdowns by rate and period", icon: Receipt, iconBg: "bg-purple-100", color: "text-purple-600", border: "border-purple-200 hover:border-purple-400" },
  { id: "export" as const, label: "Export Center", desc: "Export business data in PDF, Excel, and CSV formats", icon: Download, iconBg: "bg-slate-100", color: "text-slate-600", border: "border-slate-200 hover:border-slate-400" },
];

const PER_PAGE = 12;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(s: string) {
  if (!s) return "—";
  try { return new Date(s).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }); } catch { return s; }
}

function inRange(dateStr: string, from: string, to: string) {
  if (!dateStr) return true;
  const d = (dateStr || "").split("T")[0];
  if (from && d < from) return false;
  if (to && d > to) return false;
  return true;
}

function sortArr<T>(data: T[], cfg: SortConfig | null): T[] {
  if (!cfg) return data;
  return [...data].sort((a: any, b: any) => {
    const av = a[cfg.key], bv = b[cfg.key];
    const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av ?? "").localeCompare(String(bv ?? ""));
    return cfg.dir === "asc" ? cmp : -cmp;
  });
}

function downloadCSV(rows: Record<string, any>[], filename: string) {
  if (!rows.length) { toast.error("No data to export"); return; }
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(","), ...rows.map(r => headers.map(h => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(","))];
  const blob = new Blob([lines.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
  toast.success(`Exported ${filename}`);
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useSort() {
  const [cfg, setCfg] = useState<SortConfig | null>(null);
  const toggle = (key: string) => setCfg(prev => prev?.key === key ? { key, dir: prev.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" });
  return { sortCfg: cfg, onSort: toggle };
}

function useSelection(data: any[], keyField: string) {
  const [ids, setIds] = useState<Set<string>>(new Set());
  const toggleAll = () => data.every(r => ids.has(r[keyField])) ? setIds(new Set()) : setIds(new Set(data.map(r => r[keyField])));
  const toggleOne = (id: string) => setIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  return { selectedIds: ids, setSelectedIds: setIds, toggleAll, toggleOne };
}

// ─── Reusable Components ──────────────────────────────────────────────────────

function SortableHeader({ col, sortCfg, onSort }: { col: { key: string; label: string; align?: string }; sortCfg: SortConfig | null; onSort: (k: string) => void }) {
  const active = sortCfg?.key === col.key;
  return (
    <th
      onClick={() => onSort(col.key)}
      className={`px-3 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wide cursor-pointer select-none hover:bg-slate-200 transition-colors whitespace-nowrap ${col.align === "right" ? "text-right" : "text-left"}`}
    >
      <div className={`flex items-center gap-1 ${col.align === "right" ? "justify-end" : ""}`}>
        {col.label}
        {active ? (sortCfg!.dir === "asc" ? <ChevronUp className="w-3 h-3 text-blue-600" /> : <ChevronDown className="w-3 h-3 text-blue-600" />) : <ArrowUpDown className="w-3 h-3 opacity-25" />}
      </div>
    </th>
  );
}

function TableCheckbox({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className="text-slate-400 hover:text-blue-600 transition-colors">
      {checked ? <CheckSquare className="w-3.5 h-3.5 text-blue-600" /> : <Square className="w-3.5 h-3.5" />}
    </button>
  );
}

function EmptyState({ message, onClear }: { message?: string; onClear?: () => void }) {
  return (
    <div className="py-16 text-center">
      <AlertCircle className="w-10 h-10 text-slate-300 mx-auto mb-3" />
      <p className="text-slate-500 text-sm mb-3">{message ?? "No records found for the selected filters."}</p>
      {onClear && (
        <button onClick={onClear} className="text-xs text-blue-600 hover:text-blue-700 font-semibold border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">
          Clear Filters
        </button>
      )}
    </div>
  );
}

function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  const totalPages = Math.ceil(total / PER_PAGE);
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-200 bg-white flex-shrink-0">
      <p className="text-xs text-slate-500">
        Showing {Math.min((page - 1) * PER_PAGE + 1, total)}–{Math.min(page * PER_PAGE, total)} of {total}
      </p>
      <div className="flex items-center gap-1">
        <button disabled={page === 1} onClick={() => onChange(page - 1)} className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronLeft className="w-3.5 h-3.5 text-slate-600" />
        </button>
        {pages.map(p => (
          <button key={p} onClick={() => onChange(p)} className={`w-7 h-7 rounded text-xs font-medium transition-colors ${page === p ? "bg-blue-600 text-white" : "hover:bg-slate-100 text-slate-600"}`}>{p}</button>
        ))}
        {totalPages > 7 && <span className="text-slate-400 text-xs px-1">…{totalPages}</span>}
        <button disabled={page === totalPages} onClick={() => onChange(page + 1)} className="p-1.5 rounded hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed">
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        </button>
      </div>
    </div>
  );
}

function FilterRow({ children, onApply, onReset }: { children: React.ReactNode; onApply: () => void; onReset: () => void }) {
  return (
    <div className="flex items-end gap-3 px-5 py-3.5 bg-white border-b border-slate-200 flex-wrap">
      {children}
      <div className="flex gap-2 ml-auto">
        <button onClick={onReset} className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors">
          <X className="w-3.5 h-3.5" /> Reset
        </button>
        <button onClick={onApply} className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
          <Search className="w-3.5 h-3.5" /> Apply Filters
        </button>
      </div>
    </div>
  );
}

function FilterInput({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div className="flex flex-col gap-1 min-w-0">
      <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all w-36"
      />
    </div>
  );
}

function ExportBar({ label, onCSV, onPrint }: { label: string; onCSV: () => void; onPrint: () => void }) {
  return (
    <div className="flex items-center gap-2 px-5 py-3 bg-slate-50 border-t border-slate-200 flex-shrink-0">
      <span className="text-xs text-slate-500 font-medium">{label}</span>
      <div className="flex gap-2 ml-auto">
        <button onClick={onCSV} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors">
          <FileSpreadsheet className="w-3.5 h-3.5" /> Export CSV
        </button>
        <button onClick={onPrint} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors">
          <Printer className="w-3.5 h-3.5" /> Print
        </button>
      </div>
    </div>
  );
}

// ─── Report Sections ──────────────────────────────────────────────────────────

function SalesReport({ invoices }: { invoices: any[] }) {
  const [from, setFrom] = useState(""); const [to, setTo] = useState("");
  const [custQ, setCustQ] = useState(""); const [invQ, setInvQ] = useState("");
  const [page, setPage] = useState(1);
  const { sortCfg, onSort } = useSort();

  const filtered = useMemo(() => invoices.filter(inv =>
    inRange(inv.date || inv.createdAt || "", from, to) &&
    (custQ ? (inv.customer?.name || "").toLowerCase().includes(custQ.toLowerCase()) : true) &&
    (invQ ? (inv.id || "").toLowerCase().includes(invQ.toLowerCase()) : true)
  ), [invoices, from, to, custQ, invQ]);

  const sorted = useMemo(() => sortArr(filtered, sortCfg), [filtered, sortCfg]);
  const paged = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const { selectedIds, toggleAll, toggleOne } = useSelection(paged, "id");

  const totals = useMemo(() => filtered.reduce((acc, inv) => ({
    taxable: acc.taxable + (inv.totalTaxable || 0),
    cgst: acc.cgst + (inv.totalCGST || 0),
    sgst: acc.sgst + (inv.totalSGST || 0),
    grand: acc.grand + (inv.grandTotal || inv.total || 0),
  }), { taxable: 0, cgst: 0, sgst: 0, grand: 0 }), [filtered]);

  const cols = [
    { key: "id", label: "Invoice #" },
    { key: "date", label: "Date" },
    { key: "customerName", label: "Customer" },
    { key: "items", label: "Items", align: "right" as const },
    { key: "totalTaxable", label: "Taxable", align: "right" as const },
    { key: "gstAmount", label: "GST", align: "right" as const },
    { key: "grandTotal", label: "Grand Total", align: "right" as const },
  ];

  const reset = () => { setFrom(""); setTo(""); setCustQ(""); setInvQ(""); setPage(1); };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <FilterRow onApply={() => setPage(1)} onReset={reset}>
        <FilterInput label="From Date" value={from} onChange={setFrom} type="date" />
        <FilterInput label="To Date" value={to} onChange={setTo} type="date" />
        <FilterInput label="Customer" value={custQ} onChange={setCustQ} placeholder="Search name…" />
        <FilterInput label="Invoice No." value={invQ} onChange={setInvQ} placeholder="INV-…" />
      </FilterRow>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-100 border-b border-slate-200">
            <tr>
              <th className="w-8 px-3 py-2.5"><TableCheckbox checked={paged.length > 0 && paged.every(r => selectedIds.has(r.id))} onChange={toggleAll} /></th>
              {cols.map(c => <SortableHeader key={c.key} col={c} sortCfg={sortCfg} onSort={onSort} />)}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={8}><EmptyState onClear={reset} /></td></tr>
            ) : paged.map((inv, i) => {
              const gst = (inv.totalCGST || 0) + (inv.totalSGST || 0);
              return (
                <tr key={inv.id} className={`border-b border-slate-100 hover:bg-blue-50/30 transition-colors ${selectedIds.has(inv.id) ? "bg-blue-50" : i % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}>
                  <td className="px-3 py-2.5"><TableCheckbox checked={selectedIds.has(inv.id)} onChange={() => toggleOne(inv.id)} /></td>
                  <td className="px-3 py-2.5 font-mono font-semibold text-slate-800">{inv.id}</td>
                  <td className="px-3 py-2.5 text-slate-600">{fmtDate(inv.date || inv.createdAt || "")}</td>
                  <td className="px-3 py-2.5 text-slate-700">{inv.customer?.name || "Walk-In"}</td>
                  <td className="px-3 py-2.5 text-right text-slate-600">{(inv.items || []).length}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{fmt(inv.totalTaxable || 0)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-slate-600">{fmt(gst)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-slate-900">{fmt(inv.grandTotal || inv.total || 0)}</td>
                </tr>
              );
            })}
          </tbody>
          {filtered.length > 0 && (
            <tfoot className="bg-slate-100 border-t-2 border-slate-300 sticky bottom-0">
              <tr>
                <td colSpan={4} className="px-3 py-2.5 text-xs font-bold text-slate-700">
                  Total — {filtered.length} invoice{filtered.length !== 1 ? "s" : ""}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums font-bold text-slate-800">{fmt(totals.taxable)}</td>
                <td className="px-3 py-2.5 text-right tabular-nums font-bold text-slate-800">{fmt(totals.cgst + totals.sgst)}</td>
                <td className="px-3 py-2.5 text-right tabular-nums font-bold text-blue-700">{fmt(totals.grand)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      <Pagination page={page} total={filtered.length} onChange={setPage} />
      <ExportBar
        label={`${filtered.length} records · ${selectedIds.size > 0 ? `${selectedIds.size} selected` : "all"}`}
        onCSV={() => downloadCSV(filtered.map(inv => ({ "Invoice No": inv.id, "Date": fmtDate(inv.date || ""), "Customer": inv.customer?.name || "Walk-In", "Taxable": inv.totalTaxable || 0, "GST": (inv.totalCGST || 0) + (inv.totalSGST || 0), "Grand Total": inv.grandTotal || inv.total || 0 })), "sales-report.csv")}
        onPrint={() => { toast.info("Print triggered"); window.print(); }}
      />
    </div>
  );
}

function CustomerReport({ invoices, customers }: { invoices: any[]; customers: any[] }) {
  const [nameQ, setNameQ] = useState(""); const [from, setFrom] = useState(""); const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const { sortCfg, onSort } = useSort();
  const [selected, setSelected] = useState<any | null>(null);

  const rows = useMemo(() => customers
    .filter(c => nameQ ? c.name.toLowerCase().includes(nameQ.toLowerCase()) : true)
    .map(c => {
      const custInvoices = invoices.filter(inv =>
        (inv.customer?.id === c.id || inv.customer?.phone === c.phone) &&
        inRange(inv.date || inv.createdAt || "", from, to)
      );
      const total = custInvoices.reduce((s, i) => s + (i.grandTotal || i.total || 0), 0);
      const last = custInvoices.slice().sort((a, b) => (b.date || "").localeCompare(a.date || ""))[0];
      return { ...c, invoiceCount: custInvoices.length, totalPurchase: total, lastDate: last?.date || last?.createdAt || "", custInvoices };
    }), [customers, invoices, nameQ, from, to]);

  const sorted = useMemo(() => sortArr(rows, sortCfg), [rows, sortCfg]);
  const paged = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const { selectedIds, toggleAll, toggleOne } = useSelection(paged, "id");
  const reset = () => { setNameQ(""); setFrom(""); setTo(""); setPage(1); };

  return (
    <div className="flex flex-1 min-h-0 overflow-hidden">
      <div className="flex flex-col flex-1 min-h-0 min-w-0">
        <FilterRow onApply={() => setPage(1)} onReset={reset}>
          <FilterInput label="Customer Name" value={nameQ} onChange={setNameQ} placeholder="Search…" />
          <FilterInput label="From Date" value={from} onChange={setFrom} type="date" />
          <FilterInput label="To Date" value={to} onChange={setTo} type="date" />
        </FilterRow>
        <div className="flex-1 overflow-auto">
          <table className="w-full text-xs border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-100 border-b border-slate-200">
              <tr>
                <th className="w-8 px-3 py-2.5"><TableCheckbox checked={paged.length > 0 && paged.every(r => selectedIds.has(r.id))} onChange={toggleAll} /></th>
                {[{ key: "name", label: "Customer Name" }, { key: "phone", label: "Phone" }, { key: "invoiceCount", label: "Invoices", align: "right" as const }, { key: "totalPurchase", label: "Total Purchase", align: "right" as const }, { key: "lastDate", label: "Last Purchase" }].map(c => <SortableHeader key={c.key} col={c} sortCfg={sortCfg} onSort={onSort} />)}
                <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Details</th>
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={7}><EmptyState onClear={reset} /></td></tr>
              ) : paged.map((c, i) => (
                <tr key={c.id} className={`border-b border-slate-100 hover:bg-blue-50/30 cursor-pointer transition-colors ${selected?.id === c.id ? "bg-blue-50" : i % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}>
                  <td className="px-3 py-2.5"><TableCheckbox checked={selectedIds.has(c.id)} onChange={() => toggleOne(c.id)} /></td>
                  <td className="px-3 py-2.5 font-semibold text-slate-800">{c.name}</td>
                  <td className="px-3 py-2.5 text-slate-600 font-mono">{c.phone}</td>
                  <td className="px-3 py-2.5 text-right">{c.invoiceCount}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-slate-800">{fmt(c.totalPurchase)}</td>
                  <td className="px-3 py-2.5 text-slate-600">{fmtDate(c.lastDate)}</td>
                  <td className="px-3 py-2.5">
                    <button onClick={() => setSelected(selected?.id === c.id ? null : c)} className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium">
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Pagination page={page} total={rows.length} onChange={setPage} />
        <ExportBar
          label={`${rows.length} customers`}
          onCSV={() => downloadCSV(rows.map(c => ({ "Name": c.name, "Phone": c.phone, "GSTIN": c.gstin, "Invoices": c.invoiceCount, "Total Purchase": c.totalPurchase, "Last Purchase": fmtDate(c.lastDate) })), "customer-report.csv")}
          onPrint={() => { toast.info("Print triggered"); window.print(); }}
        />
      </div>

      {/* Customer detail panel */}
      {selected && (
        <div className="w-72 border-l border-slate-200 bg-white flex flex-col overflow-hidden flex-shrink-0">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Customer Summary</span>
            <button onClick={() => setSelected(null)} className="p-1 rounded hover:bg-slate-200 text-slate-500"><X className="w-3.5 h-3.5" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <p className="text-sm font-bold text-slate-900">{selected.name}</p>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{selected.phone}</p>
              {selected.gstin && <p className="text-xs text-slate-500 font-mono mt-0.5">{selected.gstin}</p>}
              {selected.address && <p className="text-xs text-slate-500 mt-1">{selected.address}</p>}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Total Invoices", value: selected.invoiceCount },
                { label: "Total Purchase", value: fmt(selected.totalPurchase) },
                { label: "Avg. Invoice", value: selected.invoiceCount > 0 ? fmt(selected.totalPurchase / selected.invoiceCount) : "—" },
                { label: "Last Purchase", value: fmtDate(selected.lastDate) },
              ].map(s => (
                <div key={s.label} className="bg-slate-50 rounded-lg p-2.5 border border-slate-200">
                  <p className="text-[10px] text-slate-500 mb-0.5">{s.label}</p>
                  <p className="text-sm font-bold text-slate-800 tabular-nums">{s.value}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-2">Purchase History</p>
              <div className="space-y-1.5">
                {selected.custInvoices.slice(0, 8).map((inv: any) => (
                  <div key={inv.id} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                    <div>
                      <p className="text-xs font-semibold text-slate-800 font-mono">{inv.id}</p>
                      <p className="text-[10px] text-slate-400">{fmtDate(inv.date || "")}</p>
                    </div>
                    <p className="text-xs font-bold text-slate-800 tabular-nums">{fmt(inv.grandTotal || inv.total || 0)}</p>
                  </div>
                ))}
                {selected.custInvoices.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No invoices found</p>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProductReport({ invoices, products }: { invoices: any[]; products: any[] }) {
  const [nameQ, setNameQ] = useState(""); const [from, setFrom] = useState(""); const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const { sortCfg, onSort } = useSort();

  const rows = useMemo(() => {
    const map: Record<string, { name: string; hsn: string; qtySold: number; revenue: number; gst: number; lastDate: string }> = {};
    invoices.filter(inv => inRange(inv.date || inv.createdAt || "", from, to)).forEach(inv => {
      (inv.items || []).forEach((item: any) => {
        const key = item.productId || item.description;
        if (!map[key]) map[key] = { name: item.description, hsn: item.hsn || "", qtySold: 0, revenue: 0, gst: 0, lastDate: "" };
        const taxable = (item.qty || 0) * (item.rate || 0);
        const gstAmt = taxable * ((item.gstRate || 0) / 100);
        map[key].qtySold += item.qty || 0;
        map[key].revenue += taxable + gstAmt;
        map[key].gst += gstAmt;
        const d = inv.date || inv.createdAt || "";
        if (!map[key].lastDate || d > map[key].lastDate) map[key].lastDate = d;
      });
    });
    return Object.entries(map)
      .map(([k, v]) => ({ id: k, ...v }))
      .filter(r => nameQ ? r.name.toLowerCase().includes(nameQ.toLowerCase()) : true);
  }, [invoices, products, nameQ, from, to]);

  const sorted = useMemo(() => sortArr(rows, sortCfg), [rows, sortCfg]);
  const paged = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const { selectedIds, toggleAll, toggleOne } = useSelection(paged, "id");
  const reset = () => { setNameQ(""); setFrom(""); setTo(""); setPage(1); };

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <FilterRow onApply={() => setPage(1)} onReset={reset}>
        <FilterInput label="Product Name" value={nameQ} onChange={setNameQ} placeholder="Search…" />
        <FilterInput label="From Date" value={from} onChange={setFrom} type="date" />
        <FilterInput label="To Date" value={to} onChange={setTo} type="date" />
      </FilterRow>
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-100 border-b border-slate-200">
            <tr>
              <th className="w-8 px-3 py-2.5"><TableCheckbox checked={paged.length > 0 && paged.every(r => selectedIds.has(r.id))} onChange={toggleAll} /></th>
              {[{ key: "name", label: "Product Name" }, { key: "hsn", label: "HSN" }, { key: "qtySold", label: "Qty Sold", align: "right" as const }, { key: "revenue", label: "Revenue", align: "right" as const }, { key: "gst", label: "GST Collected", align: "right" as const }, { key: "lastDate", label: "Last Sold" }].map(c => <SortableHeader key={c.key} col={c} sortCfg={sortCfg} onSort={onSort} />)}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={7}><EmptyState onClear={reset} /></td></tr>
            ) : paged.map((p, i) => (
              <tr key={p.id} className={`border-b border-slate-100 hover:bg-blue-50/30 transition-colors ${selectedIds.has(p.id) ? "bg-blue-50" : i % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}>
                <td className="px-3 py-2.5"><TableCheckbox checked={selectedIds.has(p.id)} onChange={() => toggleOne(p.id)} /></td>
                <td className="px-3 py-2.5 font-semibold text-slate-800">{p.name}</td>
                <td className="px-3 py-2.5 font-mono text-slate-500">{p.hsn || "—"}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{p.qtySold}</td>
                <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-slate-800">{fmt(p.revenue)}</td>
                <td className="px-3 py-2.5 text-right tabular-nums text-slate-600">{fmt(p.gst)}</td>
                <td className="px-3 py-2.5 text-slate-600">{fmtDate(p.lastDate)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} total={rows.length} onChange={setPage} />
      <ExportBar
        label={`${rows.length} products`}
        onCSV={() => downloadCSV(rows.map(p => ({ "Product": p.name, "HSN": p.hsn, "Qty Sold": p.qtySold, "Revenue": p.revenue, "GST": p.gst, "Last Sold": fmtDate(p.lastDate) })), "product-report.csv")}
        onPrint={() => { toast.info("Print triggered"); window.print(); }}
      />
    </div>
  );
}

function InvoiceReport({ invoices }: { invoices: any[] }) {
  const [invQ, setInvQ] = useState(""); const [custQ, setCustQ] = useState("");
  const [from, setFrom] = useState(""); const [to, setTo] = useState("");
  const [statusQ, setStatusQ] = useState("");
  const [page, setPage] = useState(1);
  const { sortCfg, onSort } = useSort();

  const filtered = useMemo(() => invoices.filter(inv =>
    (invQ ? (inv.id || "").toLowerCase().includes(invQ.toLowerCase()) : true) &&
    (custQ ? (inv.customer?.name || "").toLowerCase().includes(custQ.toLowerCase()) : true) &&
    (statusQ ? (inv.status || "") === statusQ : true) &&
    inRange(inv.date || inv.createdAt || "", from, to)
  ), [invoices, invQ, custQ, statusQ, from, to]);

  const sorted = useMemo(() => sortArr(filtered, sortCfg), [filtered, sortCfg]);
  const paged = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);
  const { selectedIds, toggleAll, toggleOne } = useSelection(paged, "id");
  const reset = () => { setInvQ(""); setCustQ(""); setStatusQ(""); setFrom(""); setTo(""); setPage(1); };

  const totals = useMemo(() => ({
    count: filtered.length,
    revenue: filtered.reduce((s, i) => s + (i.grandTotal || i.total || 0), 0),
  }), [filtered]);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <FilterRow onApply={() => setPage(1)} onReset={reset}>
        <FilterInput label="Invoice No." value={invQ} onChange={setInvQ} placeholder="INV-…" />
        <FilterInput label="Customer" value={custQ} onChange={setCustQ} placeholder="Name…" />
        <FilterInput label="From Date" value={from} onChange={setFrom} type="date" />
        <FilterInput label="To Date" value={to} onChange={setTo} type="date" />
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">Status</label>
          <select value={statusQ} onChange={e => setStatusQ(e.target.value)} className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:ring-1 focus:ring-blue-400 outline-none w-28">
            <option value="">All</option>
            <option value="Paid">Paid</option>
            <option value="Draft">Draft</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </FilterRow>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-100 border-b border-slate-200">
            <tr>
              <th className="w-8 px-3 py-2.5"><TableCheckbox checked={paged.length > 0 && paged.every(r => selectedIds.has(r.id))} onChange={toggleAll} /></th>
              {[{ key: "id", label: "Invoice #" }, { key: "date", label: "Date" }, { key: "customerName", label: "Customer" }, { key: "totalTaxable", label: "Taxable", align: "right" as const }, { key: "gstAmt", label: "GST", align: "right" as const }, { key: "grandTotal", label: "Total", align: "right" as const }, { key: "status", label: "Status" }].map(c => <SortableHeader key={c.key} col={c} sortCfg={sortCfg} onSort={onSort} />)}
              <th className="px-3 py-2.5 text-left text-xs font-semibold text-slate-600 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr><td colSpan={9}><EmptyState onClear={reset} /></td></tr>
            ) : paged.map((inv, i) => {
              const gst = (inv.totalCGST || 0) + (inv.totalSGST || 0);
              const statusColor = inv.status === "Paid" ? "bg-emerald-100 text-emerald-700" : inv.status === "Draft" ? "bg-slate-100 text-slate-500" : "bg-amber-100 text-amber-700";
              return (
                <tr key={inv.id} className={`border-b border-slate-100 hover:bg-blue-50/30 transition-colors ${selectedIds.has(inv.id) ? "bg-blue-50" : i % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}>
                  <td className="px-3 py-2.5"><TableCheckbox checked={selectedIds.has(inv.id)} onChange={() => toggleOne(inv.id)} /></td>
                  <td className="px-3 py-2.5 font-mono font-semibold text-slate-800">{inv.id}</td>
                  <td className="px-3 py-2.5 text-slate-600">{fmtDate(inv.date || inv.createdAt || "")}</td>
                  <td className="px-3 py-2.5 text-slate-700">{inv.customer?.name || "Walk-In"}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums">{fmt(inv.totalTaxable || 0)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums text-slate-600">{fmt(gst)}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-bold text-slate-900">{fmt(inv.grandTotal || inv.total || 0)}</td>
                  <td className="px-3 py-2.5"><span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${statusColor}`}>{inv.status || "—"}</span></td>
                  <td className="px-3 py-2.5">
                    <button onClick={() => toast.info(`Printing ${inv.id}`)} className="text-blue-600 hover:text-blue-800"><Printer className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
          {filtered.length > 0 && (
            <tfoot className="bg-slate-100 border-t-2 border-slate-300 sticky bottom-0">
              <tr>
                <td colSpan={5} className="px-3 py-2.5 text-xs font-bold text-slate-700">{totals.count} invoices</td>
                <td className="px-3 py-2.5" />
                <td className="px-3 py-2.5 text-right tabular-nums font-bold text-blue-700">{fmt(totals.revenue)}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      <Pagination page={page} total={filtered.length} onChange={setPage} />
      <ExportBar
        label={`${totals.count} invoices · ${fmt(totals.revenue)} total`}
        onCSV={() => downloadCSV(filtered.map(inv => ({ "Invoice #": inv.id, "Date": fmtDate(inv.date || ""), "Customer": inv.customer?.name || "Walk-In", "Taxable": inv.totalTaxable || 0, "GST": (inv.totalCGST || 0) + (inv.totalSGST || 0), "Total": inv.grandTotal || inv.total || 0, "Status": inv.status || "" })), "invoice-report.csv")}
        onPrint={() => { toast.info("Print triggered"); window.print(); }}
      />
    </div>
  );
}

function GSTReport({ invoices }: { invoices: any[] }) {
  const [from, setFrom] = useState(""); const [to, setTo] = useState(""); const [rateQ, setRateQ] = useState("");

  const { byRate, summary } = useMemo(() => {
    const rateMap: Record<number, { rate: number; taxable: number; cgst: number; sgst: number; count: number }> = {};
    const sum = { taxable: 0, cgst: 0, sgst: 0, igst: 0 };
    invoices.filter(inv => inRange(inv.date || inv.createdAt || "", from, to)).forEach(inv => {
      (inv.items || []).forEach((item: any) => {
        const rate = item.gstRate ?? 18;
        if (rateQ && String(rate) !== rateQ) return;
        if (!rateMap[rate]) rateMap[rate] = { rate, taxable: 0, cgst: 0, sgst: 0, count: 0 };
        const taxable = (item.qty || 0) * (item.rate || 0);
        const gstAmt = taxable * (rate / 100);
        rateMap[rate].taxable += taxable;
        rateMap[rate].cgst += gstAmt / 2;
        rateMap[rate].sgst += gstAmt / 2;
        rateMap[rate].count += 1;
        sum.taxable += taxable; sum.cgst += gstAmt / 2; sum.sgst += gstAmt / 2;
      });
    });
    return { byRate: Object.values(rateMap).sort((a, b) => a.rate - b.rate), summary: sum };
  }, [invoices, from, to, rateQ]);

  const reset = () => { setFrom(""); setTo(""); setRateQ(""); };

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto">
      <FilterRow onApply={() => {}} onReset={reset}>
        <FilterInput label="From Date" value={from} onChange={setFrom} type="date" />
        <FilterInput label="To Date" value={to} onChange={setTo} type="date" />
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">GST Rate</label>
          <select value={rateQ} onChange={e => setRateQ(e.target.value)} className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:ring-1 focus:ring-blue-400 outline-none w-24">
            <option value="">All Rates</option>
            {[0, 5, 12, 18, 28].map(r => <option key={r} value={r}>{r}%</option>)}
          </select>
        </div>
      </FilterRow>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4 p-5 border-b border-slate-200 bg-slate-50 flex-shrink-0">
        {[
          { label: "Taxable Value", value: fmt(summary.taxable), color: "text-slate-800" },
          { label: "CGST Collected", value: fmt(summary.cgst), color: "text-blue-700" },
          { label: "SGST Collected", value: fmt(summary.sgst), color: "text-indigo-700" },
          { label: "Total GST", value: fmt(summary.cgst + summary.sgst), color: "text-purple-700" },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className={`text-lg font-bold tabular-nums ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* GST breakdown table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs border-collapse">
          <thead className="sticky top-0 z-10 bg-slate-100 border-b border-slate-200">
            <tr>
              {[{ label: "GST Rate" }, { label: "Taxable Amount", align: "right" }, { label: "CGST", align: "right" }, { label: "SGST", align: "right" }, { label: "Total GST", align: "right" }, { label: "Invoices", align: "right" }].map(h => (
                <th key={h.label} className={`px-4 py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wide ${h.align === "right" ? "text-right" : "text-left"}`}>{h.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {byRate.length === 0 ? (
              <tr><td colSpan={6}><EmptyState onClear={reset} /></td></tr>
            ) : byRate.map((r, i) => (
              <tr key={r.rate} className={`border-b border-slate-100 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/40"}`}>
                <td className="px-4 py-3 font-bold text-slate-800">{r.rate}%</td>
                <td className="px-4 py-3 text-right tabular-nums">{fmt(r.taxable)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-blue-700">{fmt(r.cgst)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-indigo-700">{fmt(r.sgst)}</td>
                <td className="px-4 py-3 text-right tabular-nums font-bold text-purple-700">{fmt(r.cgst + r.sgst)}</td>
                <td className="px-4 py-3 text-right text-slate-500">{r.count}</td>
              </tr>
            ))}
          </tbody>
          {byRate.length > 0 && (
            <tfoot className="bg-slate-100 border-t-2 border-slate-300 sticky bottom-0">
              <tr>
                <td className="px-4 py-2.5 font-bold text-slate-700">Total</td>
                <td className="px-4 py-2.5 text-right tabular-nums font-bold">{fmt(summary.taxable)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums font-bold text-blue-700">{fmt(summary.cgst)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums font-bold text-indigo-700">{fmt(summary.sgst)}</td>
                <td className="px-4 py-2.5 text-right tabular-nums font-bold text-purple-700">{fmt(summary.cgst + summary.sgst)}</td>
                <td className="px-4 py-2.5 text-right text-slate-600 font-bold">{byRate.reduce((s, r) => s + r.count, 0)}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
      <ExportBar
        label="GST Report"
        onCSV={() => downloadCSV(byRate.map(r => ({ "GST Rate": `${r.rate}%`, "Taxable": r.taxable, "CGST": r.cgst, "SGST": r.sgst, "Total GST": r.cgst + r.sgst, "Items": r.count })), "gst-report.csv")}
        onPrint={() => { toast.info("Print triggered"); window.print(); }}
      />
    </div>
  );
}

function ExportCenter({ invoices, customers, products }: { invoices: any[]; customers: any[]; products: any[] }) {
  const EXPORTS = [
    { label: "Customer Database", desc: `${customers.length} records`, icon: Users, color: "text-blue-600 bg-blue-50", data: () => customers.map(c => ({ Name: c.name, Phone: c.phone, GSTIN: c.gstin, State: c.state, Address: c.address })), file: "customers.csv" },
    { label: "Product Database", desc: `${products.length} records`, icon: Package, color: "text-amber-600 bg-amber-50", data: () => products.map(p => ({ Name: p.name, HSN: p.hsn, Price: p.price, Stock: p.stock, Unit: p.unit, "GST Rate": p.gstRate })), file: "products.csv" },
    { label: "Invoice Database", desc: `${invoices.length} records`, icon: FileText, color: "text-emerald-600 bg-emerald-50", data: () => invoices.map(inv => ({ "Invoice #": inv.id, Date: fmtDate(inv.date || ""), Customer: inv.customer?.name || "Walk-In", Total: inv.grandTotal || inv.total || 0, Status: inv.status || "" })), file: "invoices.csv" },
    { label: "Sales Report", desc: "All invoice revenue data", icon: TrendingUp, color: "text-indigo-600 bg-indigo-50", data: () => invoices.map(inv => ({ "Invoice #": inv.id, Date: fmtDate(inv.date || ""), Customer: inv.customer?.name || "Walk-In", Taxable: inv.totalTaxable || 0, GST: (inv.totalCGST || 0) + (inv.totalSGST || 0), Total: inv.grandTotal || inv.total || 0 })), file: "sales-report.csv" },
    { label: "GST Report", desc: "CGST, SGST breakdown", icon: Receipt, color: "text-purple-600 bg-purple-50", data: () => { const m: any = {}; invoices.forEach(inv => (inv.items || []).forEach((it: any) => { const r = it.gstRate ?? 18; if (!m[r]) m[r] = { Rate: `${r}%`, Taxable: 0, CGST: 0, SGST: 0 }; const t = (it.qty || 0) * (it.rate || 0); m[r].Taxable += t; m[r].CGST += t * r / 200; m[r].SGST += t * r / 200; })); return Object.values(m); }, file: "gst-report.csv" },
    { label: "Configuration Backup", desc: "Settings and preferences", icon: Download, color: "text-slate-600 bg-slate-50", data: () => { try { const s = localStorage.getItem("shopmanager_settings") || "{}"; return [JSON.parse(s)]; } catch { return [{}]; } }, file: "settings-backup.csv" },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl">
        <p className="text-sm text-slate-500 mb-6">Select any dataset below to download it as a CSV file.</p>
        <div className="grid grid-cols-2 gap-4">
          {EXPORTS.map(ex => (
            <div key={ex.label} className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${ex.color}`}>
                <ex.icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800">{ex.label}</p>
                <p className="text-xs text-slate-400 mt-0.5 mb-3">{ex.desc}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => downloadCSV(ex.data(), ex.file)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" /> CSV
                  </button>
                  <button
                    onClick={() => toast.info("PDF export — coming in production build")}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" /> PDF
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function Reports() {
  const [category, setCategory] = useState<ReportCategory | null>(null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [isOffline, setIsOffline] = useState(false);

  const load = async () => {
    try {
      const [invoicePage, customerPage, productPage] = await Promise.all([fetchApi("/invoices?per_page=100"), fetchApi("/customers?per_page=100"), fetchApi("/products?per_page=100")]);
      setInvoices((invoicePage.items || []).map((invoice: any) => ({ ...invoice, invoiceNo: invoice.invoice_no, date: invoice.invoice_date, customerName: invoice.customer_name, customer: { name: invoice.customer_name }, totalTaxable: invoice.subtotal, totalCGST: invoice.cgst, totalSGST: invoice.sgst, grandTotal: invoice.total, createdAt: invoice.created_at })));
      setCustomers((customerPage.items || []).map((customer: any) => ({ ...customer, stateCode: customer.state_code })));
      setProducts((productPage.items || []).map((product: any) => ({ ...product, gstRate: product.gst_rate })));
      setIsOffline(false);
    } catch {
      if (localStorage.getItem("shopmanager_migrated") !== "true") {
        setInvoices(JSON.parse(localStorage.getItem("invoices") || "[]")); setCustomers(JSON.parse(localStorage.getItem("customers") || "[]")); setProducts(JSON.parse(localStorage.getItem("products") || "[]"));
        setIsOffline(true);
      }
    }
  };

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => {
    const totalSales = invoices.reduce((s, i) => s + (i.grandTotal || i.total || 0), 0);
    const totalGST = invoices.reduce((s, i) => s + (i.totalCGST || 0) + (i.totalSGST || 0), 0);
    return [
      { label: "Total Sales", value: fmt(totalSales), sub: `${invoices.length} invoices` },
      { label: "Total Invoices", value: invoices.length.toString(), sub: "all time" },
      { label: "Total Customers", value: customers.length.toString(), sub: "in database" },
      { label: "Total Products", value: products.length.toString(), sub: "in catalog" },
      { label: "GST Collected", value: fmt(totalGST), sub: "CGST + SGST" },
      { label: "Avg. Invoice Value", value: invoices.length > 0 ? fmt(totalSales / invoices.length) : "—", sub: "per invoice" },
    ];
  }, [invoices, customers, products]);

  const activeCat = CATEGORIES.find(c => c.id === category);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50">
      {isOffline && <div className="px-6 py-2 text-xs font-semibold text-amber-700 bg-amber-50 border-b border-amber-200">Offline Mode – Showing Cached Data</div>}

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-6 py-3.5 bg-white border-b border-slate-200 flex-shrink-0">
        {category && (
          <button onClick={() => setCategory(null)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mr-1 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className={category ? "cursor-pointer hover:text-slate-700 transition-colors" : "font-semibold text-slate-900"} onClick={() => setCategory(null)}>Reports</span>
          {category && (
            <>
              <ChevronRight className="w-3 h-3" />
              <span className="font-semibold text-slate-900">{activeCat?.label}</span>
            </>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={load} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button onClick={() => toast.info("PDF export — coming in production build")} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button onClick={() => { toast.info("Print triggered"); window.print(); }} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors">
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
        </div>
      </div>

      {/* ── Category Home ── */}
      {!category && (
        <div className="flex-1 overflow-y-auto">
          {/* Summary Stats */}
          <div className="grid grid-cols-6 gap-3 p-5 border-b border-slate-200">
            {stats.map(s => (
              <div key={s.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mb-1">{s.label}</p>
                <p className="text-lg font-bold text-slate-900 tabular-nums">{s.value}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Category cards */}
          <div className="p-5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-4">Select a Report Category</p>
            <div className="grid grid-cols-3 gap-4">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`text-left bg-white rounded-xl border-2 p-5 transition-all group hover:-translate-y-0.5 hover:shadow-md ${cat.border}`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${cat.iconBg}`}>
                    <cat.icon className={`w-5 h-5 ${cat.color}`} />
                  </div>
                  <p className="text-sm font-semibold text-slate-900 mb-1">{cat.label}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">{cat.desc}</p>
                  <div className="flex items-center gap-1 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className={`text-xs font-semibold ${cat.color}`}>Open Report</span>
                    <ChevronRight className={`w-3.5 h-3.5 ${cat.color}`} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Report Content ── */}
      {category && (
        <div className="flex flex-col flex-1 min-h-0 bg-white">
          {/* Report section header */}
          <div className="flex items-center gap-3 px-5 py-3 bg-slate-50 border-b border-slate-200 flex-shrink-0">
            {activeCat && (
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${activeCat.iconBg}`}>
                <activeCat.icon className={`w-3.5 h-3.5 ${activeCat.color}`} />
              </div>
            )}
            <div>
              <p className="text-sm font-bold text-slate-900">{activeCat?.label}</p>
              <p className="text-[10px] text-slate-400">{activeCat?.desc}</p>
            </div>
          </div>

          {category === "sales" && <SalesReport invoices={invoices} />}
          {category === "customer" && <CustomerReport invoices={invoices} customers={customers} />}
          {category === "product" && <ProductReport invoices={invoices} products={products} />}
          {category === "invoice" && <InvoiceReport invoices={invoices} />}
          {category === "gst" && <GSTReport invoices={invoices} />}
          {category === "export" && <ExportCenter invoices={invoices} customers={customers} products={products} />}
        </div>
      )}
    </div>
  );
}
