import { useState } from "react";
import { motion } from "motion/react";
import { Mail, Lock, Eye, EyeOff, Store, ArrowRight } from "lucide-react";

interface AuthScreenProps {
  onComplete: (username?: string, password?: string) => void;
  isNewUser: boolean;
}

export function AuthScreen({ onComplete, isNewUser }: AuthScreenProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Remove the fake timeout. Just pass back data instantly.
    setIsLoading(false);
    onComplete(username, password);
  };

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        background:
          "radial-gradient(ellipse at 30% 60%, #dbeafe 0%, transparent 55%), radial-gradient(ellipse at 75% 25%, #e0e7ff 0%, transparent 55%), #f0f4f8",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 26, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-200/60 overflow-hidden">
          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-600/25">
                <Store className="w-4.5 h-4.5 text-white" style={{ width: "1.1rem", height: "1.1rem" }} />
              </div>
              <span
                className="text-slate-500"
                style={{
                  fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                }}
              >
                ShopManager OS
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
              {isNewUser ? "Create your access" : "Welcome back"}
            </h2>
            <p className="text-slate-500 mt-1" style={{ fontSize: "0.875rem" }}>
              {isNewUser
                ? "Set up credentials for your workspace."
                : "Sign in to continue to your workspace."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-7 space-y-5">
            {/* Email field */}
            <div className="space-y-1.5">
              <label
                className="text-slate-700"
                style={{ fontSize: "0.875rem", fontWeight: 500 }}
              >
                Username
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder="admin"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  style={{ fontSize: "0.9rem" }}
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label
                className="text-slate-700"
                style={{ fontSize: "0.875rem", fontWeight: 500 }}
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  style={{ fontSize: "0.9rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {!isNewUser && (
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-700 transition-colors"
                  style={{ fontSize: "0.8rem", fontWeight: 500 }}
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors duration-200 shadow-lg shadow-blue-600/20"
              style={{
                fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
                fontWeight: 600,
                fontSize: "0.95rem",
              }}
              whileHover={isLoading ? {} : { scale: 1.01 }}
              whileTap={isLoading ? {} : { scale: 0.98 }}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isNewUser ? "Continue" : "Sign In"}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>

            {/* Divider */}
            <div className="relative flex items-center">
              <div className="flex-1 border-t border-slate-100" />
              <div className="flex-1 border-t border-slate-100" />
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
