import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface PreparingScreenProps {
  onComplete: () => void;
}

const STATUS_MESSAGES = [
  "Setting up billing...",
  "Preparing inventory...",
  "Loading customer data...",
  "Applying your preferences...",
  "Almost ready...",
];

export function PreparingScreen({ onComplete }: PreparingScreenProps) {
  const [statusIndex, setStatusIndex] = useState(0);

  useEffect(() => {
    const stepDuration = 750;
    const interval = setInterval(() => {
      setStatusIndex((prev) =>
        prev < STATUS_MESSAGES.length - 1 ? prev + 1 : prev
      );
    }, stepDuration);

    const total = setTimeout(onComplete, STATUS_MESSAGES.length * stepDuration + 400);

    return () => {
      clearInterval(interval);
      clearTimeout(total);
    };
  }, [onComplete]);

  const progress = ((statusIndex + 1) / STATUS_MESSAGES.length) * 100;

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center"
      style={{ background: "#070d1a" }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.06 }}
      transition={{ duration: 0.55 }}
    >
      {/* Ambient glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)",
        }}
      />

      <motion.div
        className="flex flex-col items-center gap-9 relative z-10"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5 }}
      >
        {/* Spinner */}
        <div className="relative w-[72px] h-[72px]">
          {/* Static base ring */}
          <div
            className="absolute inset-0 rounded-full border-[1.5px]"
            style={{ borderColor: "rgba(255,255,255,0.06)" }}
          />
          {/* Animated spin ring */}
          <div
            className="absolute inset-0 rounded-full border-[2px] border-transparent animate-spin"
            style={{
              borderTopColor: "#3b82f6",
              animationDuration: "1.1s",
              animationTimingFunction: "linear",
            }}
          />
          {/* Soft trailing arc */}
          <div
            className="absolute inset-[6px] rounded-full border-[1px] border-transparent animate-spin"
            style={{
              borderTopColor: "rgba(59,130,246,0.25)",
              animationDuration: "1.7s",
              animationTimingFunction: "linear",
              animationDirection: "reverse",
            }}
          />
          {/* Center pulsing dot */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ scale: [0.75, 1.15, 0.75] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: "#60a5fa" }}
            />
          </motion.div>
        </div>

        {/* Text content */}
        <div className="text-center space-y-3">
          <h2
            className="text-white"
            style={{
              fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif",
              fontSize: "1.4rem",
              fontWeight: 600,
              letterSpacing: "-0.015em",
            }}
          >
            Preparing your workspace
          </h2>

          {/* Cycling status */}
          <div className="h-5 flex items-center justify-center overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={statusIndex}
                className="text-slate-400"
                style={{ fontSize: "0.875rem" }}
                initial={{ opacity: 0, y: 7 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -7 }}
                transition={{ duration: 0.22 }}
              >
                {STATUS_MESSAGES[statusIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Progress bar */}
        <div
          className="w-48 h-[2px] rounded-full overflow-hidden"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: "#3b82f6" }}
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          />
        </div>

        {/* Step dots */}
        <div className="flex gap-1.5 mt-1">
          {STATUS_MESSAGES.map((_, i) => (
            <motion.div
              key={i}
              className="h-[3px] rounded-full transition-colors duration-500"
              animate={{
                width: i <= statusIndex ? 20 : 6,
                backgroundColor:
                  i <= statusIndex ? "#3b82f6" : "rgba(255,255,255,0.1)",
              }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
