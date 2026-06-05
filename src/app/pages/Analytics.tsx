import { useState } from "react";
import {
  TrendingUp, Users, Package, FileText, Receipt,
  RefreshCw, BarChart3, ArrowUpRight,
  DollarSign, ShoppingBag, Activity, Zap,
  InboxIcon,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

// ─── Data binding keys (internal reference only — not rendered) ───────────────
// today_sales | monthly_sales | invoice_count | customer_count
// average_invoice_value | gst_collected | sales_trend_data
// monthly_comparison_data | top_products_data | top_customers_data
// gst_total | cgst_total | sgst_total | igst_total | gst_trend_data

// ─── Empty Chart Overlay ──────────────────────────────────────────────────────

function EmptyChartOverlay() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[1px] rounded-lg z-10">
      <InboxIcon className="w-7 h-7 text-slate-300 mb-2" />
      <p className="text-xs text-slate-400 font-medium">No data available</p>
    </div>
  );
}

// ─── Chart scaffold stubs (axes/grid only — all values zero) ──────────────────

const TREND_STUB = [
  { x: "Jan", v: 0 }, { x: "Feb", v: 0 }, { x: "Mar", v: 0 },
  { x: "Apr", v: 0 }, { x: "May", v: 0 }, { x: "Jun", v: 0 },
  { x: "Jul", v: 0 }, { x: "Aug", v: 0 }, { x: "Sep", v: 0 },
  { x: "Oct", v: 0 }, { x: "Nov", v: 0 }, { x: "Dec", v: 0 },
];

const COMPARISON_STUB = [
  { x: "Jan", cur: 0, prev: 0 }, { x: "Feb", cur: 0, prev: 0 },
  { x: "Mar", cur: 0, prev: 0 }, { x: "Apr", cur: 0, prev: 0 },
  { x: "May", cur: 0, prev: 0 }, { x: "Jun", cur: 0, prev: 0 },
];

const GST_TREND_STUB = [
  { x: "Q1", cgst: 0, sgst: 0 }, { x: "Q2", cgst: 0, sgst: 0 },
  { x: "Q3", cgst: 0, sgst: 0 }, { x: "Q4", cgst: 0, sgst: 0 },
];

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KPICardProps {
  label: string;
  dataKey: string; // internal binding — not rendered
  icon: React.ElementType;
  iconColor: string;
  iconBg: string;
  prefix?: string;
}

function KPICard({ label, icon: Icon, iconColor, iconBg, prefix = "" }: KPICardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 px-4 py-4 flex flex-col gap-2.5">
      <div className="flex items-center justify-between">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </div>
        <div className="flex items-center gap-0.5 text-slate-300">
          <ArrowUpRight className="w-3.5 h-3.5" />
          <span className="text-xs font-medium">—</span>
        </div>
      </div>
      <div>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">{label}</p>
        <p className="text-2xl font-bold text-slate-300 tabular-nums">{prefix}—</p>
      </div>
      <p className="text-[10px] text-slate-300">No data for this period</p>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">{title}</p>
      {children}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyPanel({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <InboxIcon className="w-8 h-8 text-slate-200 mb-2" />
      <p className="text-xs text-slate-400">{message}</p>
    </div>
  );
}

// ─── Top Products Panel ───────────────────────────────────────────────────────

function TopProducts() {
  // dataKey: top_products_data — connect to /api/analytics/top-products
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-3">
      <SectionHeader title="Top Selling Products" />
      <EmptyPanel message="No product data available" />
    </div>
  );
}

// ─── Top Customers Panel ──────────────────────────────────────────────────────

function TopCustomers() {
  // dataKey: top_customers_data — connect to /api/analytics/top-customers
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-3">
      <SectionHeader title="Top Customers" />
      <EmptyPanel message="No customer data available" />
    </div>
  );
}

// ─── GST Analytics ────────────────────────────────────────────────────────────

function GSTAnalytics() {
  // dataKeys: gst_total | cgst_total | sgst_total | igst_total | gst_trend_data
  const GST_CARDS = [
    { label: "Total GST", color: "text-purple-500 bg-purple-50 border-purple-100" },
    { label: "CGST Collected", color: "text-blue-500 bg-blue-50 border-blue-100" },
    { label: "SGST Collected", color: "text-indigo-500 bg-indigo-50 border-indigo-100" },
    { label: "IGST Collected", color: "text-violet-500 bg-violet-50 border-violet-100" },
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <SectionHeader title="GST Analytics" />
      <div className="grid grid-cols-4 gap-3 mb-4">
        {GST_CARDS.map(c => {
          const [textCls, bgCls, borderCls] = c.color.split(" ");
          return (
            <div key={c.label} className={`rounded-lg border px-3 py-2.5 ${bgCls} ${borderCls}`}>
              <p className={`text-[10px] font-semibold uppercase tracking-wide mb-1.5 ${textCls}`}>
                {c.label}
              </p>
              <p className="text-lg font-bold text-slate-300 tabular-nums">₹—</p>
            </div>
          );
        })}
      </div>

      <div className="relative h-44">
        <EmptyChartOverlay />
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={GST_TREND_STUB} barSize={18} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="x" tick={{ fontSize: 11, fill: "#cbd5e1" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "#e2e8f0" }} axisLine={false} tickLine={false} />
            <Tooltip content={() => null} />
            <Bar name="cgst-bar" dataKey="cgst" fill="#c7d2fe" radius={[3, 3, 0, 0]} />
            <Bar name="sgst-bar" dataKey="sgst" fill="#e0e7ff" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-center gap-4 mt-2">
        {[
          { label: "CGST", color: "bg-blue-300" },
          { label: "SGST", color: "bg-indigo-300" },
          { label: "IGST", color: "bg-violet-300" },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5 text-[10px] text-slate-400">
            <span className={`w-2 h-2 rounded-full ${l.color} opacity-50 inline-block`} />
            {l.label}: <span className="text-slate-300 font-medium">—</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Analytics ───────────────────────────────────────────────────────────

const PERIODS = ["Today", "Week", "Month", "Quarter", "Year"];

const KPI_CARDS: KPICardProps[] = [
  { label: "Today's Sales", dataKey: "today_sales", prefix: "₹", icon: DollarSign, iconBg: "bg-blue-50", iconColor: "text-blue-400" },
  { label: "Monthly Sales", dataKey: "monthly_sales", prefix: "₹", icon: TrendingUp, iconBg: "bg-emerald-50", iconColor: "text-emerald-400" },
  { label: "Total Invoices", dataKey: "invoice_count", icon: FileText, iconBg: "bg-amber-50", iconColor: "text-amber-400" },
  { label: "Customers", dataKey: "customer_count", icon: Users, iconBg: "bg-indigo-50", iconColor: "text-indigo-400" },
  { label: "Avg. Invoice Value", dataKey: "average_invoice_value", prefix: "₹", icon: ShoppingBag, iconBg: "bg-rose-50", iconColor: "text-rose-400" },
  { label: "GST Collected", dataKey: "gst_collected", prefix: "₹", icon: Receipt, iconBg: "bg-purple-50", iconColor: "text-purple-400" },
];

export function Analytics() {
  const [period, setPeriod] = useState("Month");

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-6 py-3 bg-white border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-bold text-slate-900">Analytics</span>
        </div>
        <p className="text-xs text-slate-400 hidden sm:block">Business performance overview</p>

        <div className="flex items-center bg-slate-100 rounded-lg p-0.5 ml-4">
          {PERIODS.map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 rounded-md text-xs font-semibold transition-all ${
                period === p ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="ml-auto">
          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* ── Scrollable Content ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-5 space-y-5">

          {/* KPI Cards */}
          <div className="grid grid-cols-6 gap-3">
            {KPI_CARDS.map(card => (
              <KPICard key={card.dataKey} {...card} />
            ))}
          </div>

          {/* Main Content: Charts + Side Panels */}
          <div className="flex gap-5 min-h-0">

            {/* Left: Charts */}
            <div className="flex-1 min-w-0 space-y-4">

              {/* Sales Trend Chart */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                {/* dataKey: sales_trend_data */}
                <div className="flex items-center justify-between mb-1">
                  <SectionHeader title="Sales Trend">
                    <div className="flex items-center gap-3 text-[10px] text-slate-300">
                      <span>Peak: —</span>
                      <span>Total: ₹—</span>
                    </div>
                  </SectionHeader>
                </div>

                <div className="relative h-52">
                  <EmptyChartOverlay />
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={TREND_STUB} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.08} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="x" tick={{ fontSize: 11, fill: "#cbd5e1" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#e2e8f0" }} axisLine={false} tickLine={false} />
                      <Tooltip content={() => null} />
                      <Area type="monotone" dataKey="v" stroke="#bfdbfe" strokeWidth={1.5} fill="url(#trendGrad)" dot={false} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Monthly Comparison Chart */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                {/* dataKey: monthly_comparison_data, current_month_sales, previous_month_sales, growth_percentage */}
                <SectionHeader title="Monthly Comparison">
                  <div className="flex items-center gap-3 text-[10px] text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-200 inline-block" />
                      Current: ₹—
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-200 inline-block" />
                      Previous: ₹—
                    </div>
                    <div className="flex items-center gap-1">
                      <Activity className="w-3 h-3 text-slate-300" />
                      <span>Growth: —</span>
                    </div>
                  </div>
                </SectionHeader>

                <div className="relative h-44">
                  <EmptyChartOverlay />
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={COMPARISON_STUB} barSize={14} barGap={3} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="x" tick={{ fontSize: 11, fill: "#cbd5e1" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#e2e8f0" }} axisLine={false} tickLine={false} />
                      <Tooltip content={() => null} cursor={{ fill: "#f8fafc" }} />
                      <Bar name="cur-bar" dataKey="cur" fill="#bfdbfe" radius={[3, 3, 0, 0]} />
                      <Bar name="prev-bar" dataKey="prev" fill="#e2e8f0" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* Right: Leaderboards */}
            <div className="w-72 flex-shrink-0 space-y-4">
              <TopProducts />
              <TopCustomers />
            </div>
          </div>

          {/* GST Analytics */}
          <GSTAnalytics />

          {/* No-data notice */}
          <div className="bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <Zap className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <p className="text-[11px] text-slate-500">
              Analytics data will populate once invoices and transactions are recorded.
              Use the <span className="font-semibold text-slate-600">Billing</span> module to create your first invoice.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
