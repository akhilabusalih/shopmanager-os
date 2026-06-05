import { motion } from "motion/react";
import { Store, ArrowRight, TrendingUp, Users, FileText, Package } from "lucide-react";

interface WelcomeScreenProps {
  onGetStarted: () => void;
  onSignIn: () => void;
}

function FloatingCard({
  className,
  delay,
  floatY = 10,
  children,
}: {
  className: string;
  delay: number;
  floatY?: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      className={`absolute pointer-events-none select-none ${className}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: [0, -floatY, 0] }}
      transition={{
        opacity: { delay, duration: 0.6 },
        y: {
          delay: delay + 0.1,
          duration: 4 + delay,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
    >
      <div className="bg-white/75 backdrop-blur-md rounded-2xl shadow-lg border border-white/60 p-4">
        {children}
      </div>
    </motion.div>
  );
}

export function WelcomeScreen({ onGetStarted, onSignIn }: WelcomeScreenProps) {
  return (
    <motion.div
      className="fixed inset-0 overflow-hidden flex items-center justify-center"
      style={{
        background:
          "radial-gradient(ellipse at 20% 50%, #bfdbfe 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, #c7d2fe 0%, transparent 55%), #f8fafc",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
    >
      {/* Floating preview cards — decorative background */}

      {/* Revenue card — top right */}
      <FloatingCard className="top-16 right-12 w-52 hidden lg:block" delay={0.5} floatY={8}>
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-slate-400">
            <TrendingUp className="w-3 h-3" />
            <span style={{ fontSize: "0.7rem" }}>Total Revenue</span>
          </div>
          <p
            className="text-slate-900"
            style={{
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              fontSize: "1.25rem",
              fontWeight: 700,
            }}
          >
            ₹1,24,500
          </p>
          <div className="flex items-center gap-1">
            <span className="text-green-500" style={{ fontSize: "0.7rem" }}>
              ↑ 12.5%
            </span>
            <span className="text-slate-400" style={{ fontSize: "0.7rem" }}>
              vs last month
            </span>
          </div>
          <div className="h-1 bg-slate-100 rounded-full">
            <div className="h-1 bg-blue-500 rounded-full w-3/4" />
          </div>
        </div>
      </FloatingCard>

      {/* Customer card — mid right */}
      <FloatingCard className="top-52 right-6 w-52 hidden lg:block" delay={0.7} floatY={12}>
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Users className="w-3 h-3" />
            <span style={{ fontSize: "0.7rem" }}>Recent Customers</span>
          </div>
          {["Ananya Sharma", "Kiran Menon", "Raj Patel"].map((name) => (
            <div key={name} className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600" style={{ fontSize: "0.65rem", fontWeight: 600 }}>
                  {name[0]}
                </span>
              </div>
              <span className="text-slate-700" style={{ fontSize: "0.75rem" }}>
                {name}
              </span>
            </div>
          ))}
        </div>
      </FloatingCard>

      {/* Invoice card — bottom right */}
      <FloatingCard className="bottom-28 right-16 w-44 hidden lg:block" delay={0.9} floatY={7}>
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-slate-400">
            <FileText className="w-3 h-3" />
            <span style={{ fontSize: "0.7rem" }}>Invoice #INV-0042</span>
          </div>
          <p
            className="text-slate-900"
            style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif", fontSize: "1rem", fontWeight: 600 }}
          >
            ₹8,500.00
          </p>
          <span
            className="inline-block bg-green-100 text-green-700 px-2 py-0.5 rounded-full"
            style={{ fontSize: "0.65rem", fontWeight: 500 }}
          >
            Paid
          </span>
        </div>
      </FloatingCard>

      {/* Products card — left */}
      <FloatingCard className="top-24 left-10 w-44 hidden lg:block" delay={0.6} floatY={9}>
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Package className="w-3 h-3" />
            <span style={{ fontSize: "0.7rem" }}>Products</span>
          </div>
          <p
            className="text-slate-900"
            style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif", fontSize: "1.1rem", fontWeight: 700 }}
          >
            248 items
          </p>
          <div className="flex gap-1">
            <span
              className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded"
              style={{ fontSize: "0.65rem", fontWeight: 500 }}
            >
              In Stock
            </span>
            <span
              className="bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded"
              style={{ fontSize: "0.65rem", fontWeight: 500 }}
            >
              Low: 3
            </span>
          </div>
        </div>
      </FloatingCard>

      {/* Billing card — bottom left */}
      <FloatingCard className="bottom-32 left-12 w-48 hidden lg:block" delay={0.8} floatY={11}>
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-slate-400">
            <FileText className="w-3 h-3" />
            <span style={{ fontSize: "0.7rem" }}>Today's Sales</span>
          </div>
          <div className="space-y-1">
            {[
              { label: "Bills", value: "24" },
              { label: "Amount", value: "₹18,340" },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between">
                <span className="text-slate-500" style={{ fontSize: "0.72rem" }}>
                  {label}
                </span>
                <span
                  className="text-slate-800"
                  style={{ fontSize: "0.72rem", fontWeight: 600 }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </FloatingCard>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="space-y-8"
        >
          {/* Brand mark */}
          <div className="flex items-center justify-center gap-2.5">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/25">
              <Store className="w-5 h-5 text-white" />
            </div>
            <span
              className="text-slate-600"
              style={{
                fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                fontSize: "0.85rem",
                fontWeight: 500,
                letterSpacing: "0.01em",
              }}
            >
              ShopManager OS
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-4">
            <h1
              className="text-slate-900"
              style={{
                fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                fontSize: "clamp(2rem, 5vw, 3rem)",
                fontWeight: 800,
                lineHeight: 1.1,
                letterSpacing: "-0.025em",
              }}
            >
              Welcome to{" "}
              <span className="text-blue-600">ShopManager OS</span>
            </h1>
            <p
              className="text-slate-500 leading-relaxed mx-auto"
              style={{ fontSize: "1.05rem", maxWidth: "380px" }}
            >
              Manage billing, inventory, customers,
              <br />
              and invoices from one workspace.
            </p>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.button
              onClick={onGetStarted}
              className="flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-colors duration-200"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif", fontWeight: 600 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              Get Started
              <ArrowRight className="w-4 h-4" />
            </motion.button>
            <motion.button
              onClick={onSignIn}
              className="flex items-center justify-center gap-2 px-8 py-3.5 bg-white/70 backdrop-blur-sm text-slate-700 rounded-xl border border-slate-200/80 hover:bg-white hover:border-slate-300 transition-all duration-200"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif", fontWeight: 500 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              Sign In
            </motion.button>
          </div>

          {/* Fine print */}
          <p className="text-slate-400" style={{ fontSize: "0.75rem" }}>
            Trusted by shops across Kerala, Tamil Nadu &amp; beyond.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
