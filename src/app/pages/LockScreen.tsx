import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Store, Lock, Eye, EyeOff, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { fetchApi } from "../../lib/api";

export function LockScreen() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [username, setUsername] = useState("admin");

  useEffect(() => {
    // We could fetch user details from /api/auth/validate-session
    // but for now we just allow unlock via login API
    fetchApi("/auth/validate-session").then(res => {
      if (res && res.user) {
        setUsername(res.user.username);
      }
    }).catch(() => {
      // If token invalid, force full login
      localStorage.removeItem("shopmanager_token");
      navigate("/login");
    });
  }, [navigate]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    
    try {
      // Re-authenticate to unlock
      const loginRes = await fetchApi("/auth/login", {
        method: "POST",
        body: {
          username: username,
          password: passcode
        }
      });
      
      // Update token in case it was refreshed
      localStorage.setItem("shopmanager_token", loginRes.access_token);
      navigate("/");
    } catch (err) {
      setErrorMsg("Incorrect password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  const dateStr = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 relative overflow-hidden">
      {/* Background patterns */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-[100px]"
        style={{ background: "radial-gradient(circle, #3b82f6, transparent)" }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-10 blur-[100px]"
        style={{ background: "radial-gradient(circle, #6366f1, transparent)" }}
      />

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="text-white text-6xl font-light tracking-tight mb-2">{timeStr}</div>
          <div className="text-slate-400 font-medium">{dateStr}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl shadow-black/50 text-center"
        >
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-900/50">
            <Store className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-xl font-bold text-white mb-1">Session Locked</h2>
          <p className="text-slate-400 text-sm mb-6">
            Enter passcode for {username} to unlock
          </p>

          <form onSubmit={handleUnlock} className="space-y-4">
            {errorMsg && (
              <div className="p-2 bg-red-500/20 text-red-200 text-xs rounded-lg border border-red-500/30">
                {errorMsg}
              </div>
            )}
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                autoFocus
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-500"
                placeholder="Enter passcode"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-blue-600/30"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Unlock
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>
          
          <div className="mt-6">
             <button 
               type="button"
               onClick={() => {
                 localStorage.removeItem("shopmanager_token");
                 navigate("/login");
               }}
               className="text-xs text-slate-400 hover:text-white transition-colors"
             >
               Sign in as different user
             </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
