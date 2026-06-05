import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { Store, Lock, PowerOff, X } from "lucide-react";

type Phase = "dialog" | "confirm" | "shutting_down";

interface PowerDialogProps {
  onClose: () => void;
}

// ─── Animated dots helper ─────────────────────────────────────────────────────

function Dots() {
  const [count, setCount] = useState(1);
  useEffect(() => {
    const id = setInterval(() => setCount(c => (c % 3) + 1), 500);
    return () => clearInterval(id);
  }, []);
  return <span>{".".repeat(count)}</span>;
}

// ─── Shutdown fullscreen animation ───────────────────────────────────────────

function ShutdownScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-[200] bg-slate-950 flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      {/* Pulsing logo */}
      <motion.div
        animate={{ scale: [1, 1.06, 1], opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-black/50"
      >
        <Store className="w-8 h-8 text-slate-400" />
      </motion.div>

      {/* Status text */}
      <motion.p
        className="text-slate-500 text-sm font-medium tracking-widest uppercase"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Shutting Down<Dots />
      </motion.p>
    </motion.div>
  );
}

// ─── Main dialog ─────────────────────────────────────────────────────────────

export function PowerDialog({ onClose }: PowerDialogProps) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>("dialog");

  // Lock session — go straight to lock screen
  const handleLock = () => {
    onClose();
    navigate("/lock");
  };

  // Begin shutdown confirmation
  const handleShutdownRequest = () => setPhase("confirm");

  // Confirmed shutdown — play animation then redirect
  const handleShutdownConfirm = () => {
    setPhase("shutting_down");
    setTimeout(() => {
      localStorage.removeItem("shopmanager_token");
      navigate("/login");
    }, 2600);
  };

  // Shutdown screen takes over the entire viewport — render outside dialog
  if (phase === "shutting_down") {
    return <ShutdownScreen />;
  }

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        className="fixed inset-0 z-[100] flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {/* Dim overlay — click to cancel */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Dialog card */}
        <AnimatePresence mode="wait">
          {phase === "dialog" && (
            <motion.div
              key="main"
              className="relative z-10 w-full max-w-sm mx-4"
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 6 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                {/* Close button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {/* Header */}
                <div className="pt-10 pb-5 px-8 text-center">
                  <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-slate-900/20">
                    <Store className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-slate-900 font-bold" style={{ fontSize: "1.1rem" }}>
                    ShopManager OS
                  </h2>
                  <p className="text-slate-500 text-sm mt-1">What would you like to do?</p>
                </div>

                {/* Actions */}
                <div className="px-6 pb-7 space-y-3">
                  {/* Lock Session */}
                  <motion.button
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={handleLock}
                    className="w-full flex items-center gap-4 px-5 py-4 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl transition-all text-left group"
                  >
                    <div className="w-11 h-11 bg-blue-100 group-hover:bg-blue-200 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                      <Lock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">Lock Session</p>
                      <p className="text-xs text-slate-400 mt-0.5">Require password to continue</p>
                    </div>
                  </motion.button>

                  {/* Shut Down */}
                  <motion.button
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={handleShutdownRequest}
                    className="w-full flex items-center gap-4 px-5 py-4 bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 rounded-xl transition-all text-left group"
                  >
                    <div className="w-11 h-11 bg-red-100 group-hover:bg-red-200 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors">
                      <PowerOff className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">Shut Down System</p>
                      <p className="text-xs text-slate-400 mt-0.5">End the current session</p>
                    </div>
                  </motion.button>

                  {/* Cancel */}
                  <button
                    onClick={onClose}
                    className="w-full py-3 text-sm font-medium text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Shutdown confirmation */}
          {phase === "confirm" && (
            <motion.div
              key="confirm"
              className="relative z-10 w-full max-w-sm mx-4"
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="pt-10 pb-5 px-8 text-center">
                  <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-600/25">
                    <PowerOff className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-slate-900 font-bold" style={{ fontSize: "1.05rem" }}>
                    Shut Down ShopManager OS?
                  </h2>
                  <p className="text-slate-500 text-sm mt-2">
                    Your current session will be closed.
                  </p>
                </div>

                <div className="px-6 pb-7 flex flex-col gap-2.5">
                  <motion.button
                    whileHover={{ scale: 1.015 }}
                    whileTap={{ scale: 0.985 }}
                    onClick={handleShutdownConfirm}
                    className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm rounded-xl transition-colors shadow-lg shadow-red-600/25"
                  >
                    Shut Down
                  </motion.button>
                  <button
                    onClick={() => setPhase("dialog")}
                    className="w-full py-3 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors border border-slate-200 hover:border-slate-300 rounded-xl"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
