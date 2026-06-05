import { useState } from "react";
import { useNavigate } from "react-router";
import { Store, User, Lock, Eye, EyeOff, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { fetchApi } from "../../lib/api";

export function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [operatorId, setOperatorId] = useState("");
  const [passcode, setPasscode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const shopData = (() => {
    try {
      const raw = localStorage.getItem("shopmanager_shop_data") || localStorage.getItem("shopmanager_settings");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  })();
  const shopName = shopData.shopName || "ShopManager OS";
  const ownerName = shopData.ownerName || "Administrator";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    
    try {
      const loginRes = await fetchApi("/auth/login", {
        method: "POST",
        body: {
          username: operatorId,
          password: passcode
        }
      });
      
      localStorage.setItem("shopmanager_token", loginRes.access_token);
      navigate("/");
    } catch (err) {
      setErrorMsg("Invalid username or password.");
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div
      className="h-screen flex overflow-hidden"
      style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}
    >
      {/* Left Panel — Branding */}
      <div className="w-[420px] shrink-0 bg-slate-900 flex flex-col relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Blue accent blob */}
        <div
          className="absolute top-0 left-0 w-80 h-80 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, #3b82f6, transparent)" }}
        />
        <div
          className="absolute bottom-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl"
          style={{ background: "radial-gradient(circle, #6366f1, transparent)" }}
        />

        {/* Top status bar */}
        <div className="relative z-10 flex items-center justify-between px-8 pt-8">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-slate-400 text-xs">System Online</span>
          </div>
          <span className="text-slate-500 text-xs">{timeStr}</span>
        </div>

        {/* Center content */}
        <div className="relative z-10 flex-1 flex flex-col items-start justify-center px-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Logo */}
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-8 shadow-2xl shadow-blue-900/60">
              <Store className="w-8 h-8 text-white" />
            </div>

            {/* Brand */}
            <h1 className="text-white mb-1" style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.5px" }}>
              ShopManager OS
            </h1>
            <p className="text-blue-400 text-sm mb-8" style={{ fontWeight: 500 }}>
              Professional Shop Management System
            </p>

            {/* Divider */}
            <div className="w-12 h-0.5 bg-slate-700 mb-8" />

            {/* Shop Info */}
            <div className="space-y-2">
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Active Store</p>
                <p className="text-white" style={{ fontWeight: 600, fontSize: "15px" }}>{shopName}</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-widest mb-1">Operator</p>
                <p className="text-slate-300" style={{ fontWeight: 500, fontSize: "14px" }}>{ownerName}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 px-10 pb-8">
          <p className="text-slate-600 text-xs">{dateStr}</p>
          <p className="text-slate-700 text-xs mt-1">v1.0.0 · Build 2026.06</p>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 bg-slate-50 flex flex-col items-center justify-center relative">
        {/* Subtle top border accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 to-indigo-600" />

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="w-full max-w-sm"
        >
          {/* Form header */}
          <div className="mb-10">
            <h2 className="text-slate-900 mb-2" style={{ fontSize: "22px", fontWeight: 700 }}>
              Operator Sign In
            </h2>
            <p className="text-slate-500 text-sm">
              Enter your credentials to access the system
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100 font-medium">
                {errorMsg}
              </div>
            )}
            {/* Operator ID */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                Operator ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={operatorId}
                  onChange={(e) => setOperatorId(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter operator ID"
                />
              </div>
            </div>

            {/* Passcode */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1.5">
                Passcode
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-white border border-slate-300 rounded-lg text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter passcode"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                id="remember"
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="remember" className="text-sm text-slate-600">
                Keep me signed in
              </label>
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.99 }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-blue-600/30"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Access Terminal
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer note */}
          <div className="mt-10 pt-6 border-t border-slate-200">
            <p className="text-slate-400 text-xs text-center">
              Authorized personnel only · Unauthorized access is prohibited
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
