import { useState } from "react";
import { Search, Bell, Zap, User, Moon, Sun, PowerOff } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PowerDialog } from "./PowerDialog";

interface NavbarProps {
  onSearchClick: () => void;
}

export function Navbar({ onSearchClick }: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showPower, setShowPower] = useState(false);

  const notifications = [
    { id: 1, title: "New invoice created", time: "2 mins ago", unread: true },
    { id: 2, title: "Low stock alert: Wireless Mouse", time: "10 mins ago", unread: true },
    { id: 3, title: "Payment received from Acme Corp", time: "1 hour ago", unread: false },
  ];

  return (
    <>
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 sticky top-0 z-10">
      {/* Search */}
      <div className="flex-1 max-w-xl">
        <button
          onClick={onSearchClick}
          className="w-full relative group text-left"
        >
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
          <div className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm hover:bg-white hover:border-blue-300 transition-all cursor-pointer">
            <span className="text-slate-400">Search customers, products, invoices... (Ctrl+K)</span>
          </div>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-xs font-medium text-slate-400 bg-white border border-slate-200 rounded">
              Ctrl
            </kbd>
            <kbd className="px-1.5 py-0.5 text-xs font-medium text-slate-400 bg-white border border-slate-200 rounded">
              K
            </kbd>
          </div>
        </button>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 ml-4">
        {/* Quick Actions */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors relative group"
          title="Quick Actions"
        >
          
        </motion.button>

        {/* Dark Mode Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-slate-600" />
          ) : (
            null
          )}
        </motion.button>

        {/* Notifications */}
        <div className="relative">
          

          <AnimatePresence>
            {showNotifications && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowNotifications(false)}
                  className="fixed inset-0 z-40"
                />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 top-12 w-80 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-900">Notifications</h3>
                  </div>
                  <div className="max-h-96 overflow-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={`p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer ${
                          notif.unread ? "bg-blue-50/50" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {notif.unread && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm font-medium text-slate-900">
                              {notif.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">{notif.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-slate-200 text-center">
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                      View all notifications
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Power Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowPower(true)}
          title="Power"
          className="p-2 hover:bg-red-50 rounded-lg transition-colors group"
        >
          <PowerOff className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors" />
        </motion.button>

        {/* User Profile */}
        <div className="relative">


          <AnimatePresence>
            {showProfile && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowProfile(false)}
                  className="fixed inset-0 z-40"
                />
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="absolute right-0 top-12 w-56 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-slate-200">
                    <p className="font-semibold text-slate-900">Admin User</p>
                    <p className="text-xs text-slate-500 mt-1">admin@shopmanager.com</p>
                  </div>
                  <div className="p-2">
                    <button className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                      Profile Settings
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg transition-colors">
                      Preferences
                    </button>
                    <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>

    {showPower && <PowerDialog onClose={() => setShowPower(false)} />}
    </>
  );
}
