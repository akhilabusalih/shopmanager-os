import { motion } from "motion/react";
import { Check, ArrowRight } from "lucide-react";

interface LanguageScreenProps {
  onComplete: (language: string) => void;
  initialLanguage: string;
}

export function LanguageScreen({ onComplete }: LanguageScreenProps) {

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{
        background:
          "radial-gradient(ellipse at 25% 60%, #dbeafe 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, #e0e7ff 0%, transparent 55%), #f0f4f8",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="w-full max-w-lg"
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-200/60 overflow-hidden">
          {/* Progress bar — full */}
          <div className="h-1 bg-blue-500" />

          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex items-center gap-2 justify-center mb-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600" style={{ fontSize: "0.7rem", fontWeight: 700 }}>3</span>
                </div>
                <span className="text-blue-600" style={{ fontSize: "0.8rem", fontWeight: 500 }}>Step 3 of 3</span>
              </div>
              <h2
                className="text-slate-900"
                style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif", fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.02em" }}
              >
                Language Support
              </h2>
              <p className="text-slate-500 mt-2 leading-relaxed" style={{ fontSize: "0.875rem" }}>
                ShopManager OS currently uses <span className="font-semibold text-slate-700">English</span> as its primary language.<br />
                Additional regional language support will be added in future updates.
              </p>
            </div>

            {/* English — active card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.35 }}
              className="relative p-5 rounded-xl border-2 border-blue-500 bg-blue-50 mb-3"
            >
              {/* Supported badge */}
              <div className="absolute top-3.5 right-3.5 flex items-center gap-1 bg-blue-600 text-white px-2 py-0.5 rounded-full">
                <Check className="w-3 h-3" />
                <span style={{ fontSize: "0.7rem", fontWeight: 700 }}>Supported</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-blue-600/10 border border-blue-200 flex items-center justify-center flex-shrink-0">
                  <span style={{ fontSize: "1.3rem", fontWeight: 700, color: "#3b82f6", fontFamily: "system-ui, sans-serif" }}>A</span>
                </div>
                <div>
                  <p style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif", fontSize: "1rem", fontWeight: 700, color: "#1e40af" }}>
                    English
                  </p>
                  <p style={{ fontSize: "0.8rem", color: "#3b82f6", marginTop: "0.1rem" }}>Default System Language</p>
                </div>
              </div>
            </motion.div>

            {/* Coming soon languages — 2-col grid */}
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              {[
                { name: "Malayalam", symbol: "മ" },
                { name: "Tamil", symbol: "த" },
                { name: "Hindi", symbol: "ह" },
                { name: "Additional Languages", symbol: "+" },
              ].map((lang, i) => (
                <motion.div
                  key={lang.name}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.05, duration: 0.3 }}
                  className="relative p-4 rounded-xl border border-slate-200 bg-slate-50/70 cursor-not-allowed select-none opacity-60"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                      <span style={{ fontSize: "1.1rem", fontWeight: 600, color: "#94a3b8", fontFamily: "system-ui, sans-serif" }}>{lang.symbol}</span>
                    </div>
                    <div>
                      <p style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif", fontSize: "0.85rem", fontWeight: 600, color: "#94a3b8" }}>
                        {lang.name}
                      </p>
                      <p style={{ fontSize: "0.72rem", color: "#b0bec5", marginTop: "0.1rem" }}>Coming Soon</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Info note */}
            <div className="flex items-start gap-2.5 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-6">
              <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center mt-0.5 flex-shrink-0">
                <span style={{ fontSize: "0.6rem", fontWeight: 800, color: "#3b82f6" }}>i</span>
              </div>
              <p className="text-slate-500 leading-relaxed" style={{ fontSize: "0.78rem" }}>
                Future updates will introduce support for additional regional languages. English remains the default language for all invoices, reports, settings, and billing operations in <span className="font-semibold text-slate-600">Version 1</span>.
              </p>
            </div>

            {/* Continue */}
            <motion.button
              onClick={() => onComplete("English")}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 shadow-lg shadow-blue-600/20"
              style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif", fontWeight: 600, fontSize: "0.95rem" }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
