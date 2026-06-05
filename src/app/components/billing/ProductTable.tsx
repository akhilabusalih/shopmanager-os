import { useRef, useState, useEffect } from "react";
import { Plus, Trash2, Search, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { InvoiceItem, Product } from "./billingTypes";
import { computeItemTotals } from "./billingTypes";
import { fmt } from "./billingUtils";

const GST_RATES = [0, 5, 12, 18, 28];

// Column layout: # | Description | HSN | Qty | Rate | GST% | Taxable | Amount | ×
// Description gets ~38% of flex space; numeric cols are fixed.
const COLS = "24px minmax(140px,1fr) 82px 64px 90px 70px 92px 96px 28px";

interface ProductTableProps {
  items: InvoiceItem[];
  products: Product[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof InvoiceItem, value: string | number) => void;
  onSelectProduct: (itemId: string, product: Product) => void;
}

// ─── Shared cell input style ──────────────────────────────────────────────────

const cellInput =
  "w-full h-9 px-2.5 text-sm border border-slate-200 rounded-lg bg-white " +
  "focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 outline-none " +
  "transition-all placeholder-slate-300 text-slate-800";

const cellInputMono = cellInput + " font-mono tracking-wide";

// ─── Product search dropdown ──────────────────────────────────────────────────

function ProductSearchDropdown({
  products,
  onSelect,
  onClose,
}: {
  products: Product[];
  onSelect: (p: Product) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const filtered = products.filter(
    p =>
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      (p.hsn || "").includes(query)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.12 }}
      className="absolute top-full left-0 z-30 mt-1 w-[360px] bg-white border border-slate-200 rounded-xl shadow-2xl shadow-slate-200/60 overflow-hidden"
    >
      {/* Search bar */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-100 bg-slate-50">
        <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by name or HSN…"
          className="flex-1 text-sm bg-transparent outline-none text-slate-800 placeholder-slate-400"
        />
      </div>

      {/* Results */}
      <div className="max-h-52 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">No products found</div>
        ) : (
          filtered.map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => { onSelect(p); onClose(); }}
              className="w-full text-left px-3 py-2.5 hover:bg-blue-50 transition-colors border-b border-slate-50 last:border-0 group"
            >
              <div className="flex justify-between items-baseline gap-2">
                <span className="text-sm font-semibold text-slate-800 truncate">{p.name}</span>
                <span className="text-sm font-bold text-blue-600 flex-shrink-0">{fmt(p.price)}</span>
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                {p.hsn && <span className="text-[10px] text-slate-400 font-mono">HSN {p.hsn}</span>}
                {p.stock !== undefined && <span className="text-[10px] text-slate-400">Stock: {p.stock}</span>}
                {p.gstRate !== undefined && (
                  <span className="text-[10px] text-slate-400">GST {p.gstRate}%</span>
                )}
              </div>
            </button>
          ))
        )}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="w-full text-center text-xs text-slate-400 hover:text-slate-600 py-2 border-t border-slate-100 bg-slate-50 transition-colors"
      >
        Dismiss
      </button>
    </motion.div>
  );
}

// ─── Main table ───────────────────────────────────────────────────────────────

export function ProductTable({
  items, products, onAdd, onRemove, onUpdate, onSelectProduct,
}: ProductTableProps) {
  const [openSearch, setOpenSearch] = useState<string | null>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // Close search when clicking outside the table
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (tableRef.current && !tableRef.current.contains(e.target as Node)) {
        setOpenSearch(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={tableRef} className="flex flex-col rounded-xl border border-slate-200 overflow-hidden bg-white">

      {/* ── Header row ──────────────────────────────────────────────────── */}
      <div
        className="grid items-center gap-2 px-3 py-2.5 bg-slate-50 border-b-2 border-slate-200"
        style={{ gridTemplateColumns: COLS }}
      >
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">#</span>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2.5">Products</span>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">HSN</span>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Qty</span>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right pr-2.5">Rate</span>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center pl-2.5">GST%</span>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right pr-2.5">Taxable</span>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right pr-2.5">Amount</span>
        <span />
      </div>

      {/* ── Item rows ────────────────────────────────────────────────────── */}
      <div className="divide-y divide-slate-100">
        <AnimatePresence initial={false}>
          {items.map((item, idx) => {
            const t = computeItemTotals(item);
            const isSearchOpen = openSearch === item.id;

            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.15 }}
                className={`grid items-center gap-2 px-3 py-2.5 transition-colors ${
                  isSearchOpen ? "bg-blue-50/30" : "hover:bg-slate-50/70"
                }`}
                style={{ gridTemplateColumns: COLS }}
              >
                {/* Row number */}
                <div className="flex items-center justify-center">
                  <span className="w-5 h-5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-400 flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                </div>

                {/* Description with product search */}
                <div className="relative min-w-0">
                  <input
                    type="text"
                    value={item.description}
                    onChange={e => onUpdate(item.id, "description", e.target.value)}
                    onFocus={() => setOpenSearch(item.id)}
                    placeholder="Product / Service description"
                    className={cellInput}
                  />
                  <AnimatePresence>
                    {isSearchOpen && (
                      <ProductSearchDropdown
                        products={products}
                        onSelect={p => onSelectProduct(item.id, p)}
                        onClose={() => setOpenSearch(null)}
                      />
                    )}
                  </AnimatePresence>
                </div>

                {/* HSN */}
                <input
                  type="text"
                  value={item.hsn}
                  onChange={e => onUpdate(item.id, "hsn", e.target.value)}
                  placeholder="——"
                  className={cellInputMono + " text-center text-xs"}
                />

                {/* Qty */}
                <input
                  type="number"
                  value={item.qty}
                  min={0.01}
                  step="0.01"
                  onChange={e => onUpdate(item.id, "qty", parseFloat(e.target.value) || 1)}
                  className={cellInput + " text-center"}
                />

                {/* Rate */}
                <input
                  type="number"
                  value={item.rate}
                  min={0}
                  step="0.01"
                  onChange={e => onUpdate(item.id, "rate", parseFloat(e.target.value) || 0)}
                  className={cellInput + " text-right"}
                />

                {/* GST% */}
                <div className="relative">
                  <select
                    value={item.gstRate}
                    onChange={e => onUpdate(item.id, "gstRate", parseInt(e.target.value))}
                    className={
                      "w-full h-9 pl-2.5 pr-6 text-sm border border-slate-200 rounded-lg bg-white " +
                      "focus:ring-2 focus:ring-blue-400/40 focus:border-blue-400 outline-none " +
                      "transition-all text-slate-800 appearance-none cursor-pointer text-center"
                    }
                  >
                    {GST_RATES.map(r => (
                      <option key={r} value={r}>{r}%</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                </div>

                {/* Taxable (read-only) */}
                <div className="h-9 flex items-center justify-end px-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-sm text-slate-600 tabular-nums">{fmt(t.taxable)}</span>
                </div>

                {/* Final Amount (read-only) */}
                <div className="h-9 flex items-center justify-end px-2.5 rounded-lg bg-blue-50/50 border border-blue-100/70">
                  <span className="text-sm font-semibold text-slate-800 tabular-nums">{fmt(t.amount)}</span>
                </div>

                {/* Delete */}
                {items.length > 1 ? (
                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    className="w-7 h-7 flex items-center justify-center text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <span />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ── Add row button ─────────────────────────────────────────────── */}
      <div className="px-3 py-2 border-t border-slate-100 bg-slate-50/50">
        <button
          type="button"
          onClick={onAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg border border-dashed border-blue-200 hover:border-blue-400 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Row
        </button>
      </div>
    </div>
  );
}
