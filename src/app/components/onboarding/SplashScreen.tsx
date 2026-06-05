import { useEffect } from "react";
import { motion } from "motion/react";
import { Store } from "lucide-react";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 2600);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div
      className="fixed inset-0 flex flex-col items-center justify-center"
      style={{ background: "#070d1a" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.5 }}
    >
      {/* Ambient radial glow behind logo */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 70%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 22, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.25, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center gap-7 relative z-10"
      >
        {/* Logo mark */}
        <div className="relative">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl">
            <Store className="w-10 h-10 text-white" />
          </div>
          <div
            className="absolute inset-0 rounded-3xl blur-2xl scale-150 opacity-30"
            style={{ background: "#3b82f6" }}
          />
        </div>

        {/* Wordmark */}
        <div className="text-center space-y-2">
          <h1
            className="text-white tracking-tight"
            style={{
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              fontSize: "1.75rem",
              fontWeight: 700,
              letterSpacing: "-0.02em",
            }}
          >
            ShopManager OS
          </h1>
          <p
            className="text-slate-500 uppercase tracking-widest"
            style={{ fontSize: "0.65rem", letterSpacing: "0.2em" }}
          >
            Business Operating System
          </p>
        </div>
      </motion.div>

      {/* Loading indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.4 }}
        className="absolute bottom-14 flex flex-col items-center gap-3"
      >
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#3b82f6" }}
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.7, 1, 0.7] }}
              transition={{
                duration: 1.3,
                repeat: Infinity,
                delay: i * 0.22,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>
        <p className="text-slate-600" style={{ fontSize: "0.7rem" }}>
          Initializing workspace...
        </p>
      </motion.div>
    </motion.div>
  );
}
