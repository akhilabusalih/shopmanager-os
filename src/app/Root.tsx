import { useEffect, useState } from "react";
import { Outlet, useLocation, Navigate, useNavigate } from "react-router";
import { Toaster } from "sonner";
import { Sidebar } from "./components/Sidebar";
import { Navbar } from "./components/Navbar";
import { CommandPalette } from "./components/CommandPalette";
import { fetchApi } from "../lib/api";

export function Root() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLogin = location.pathname === "/login";
  const isOnboarding = location.pathname === "/onboarding";
  const isDashboard = location.pathname === "/";
  const isLock = location.pathname === "/lock";
  
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Ctrl+K / Cmd+K to open command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
      if (e.key === "Escape") {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Auth & Setup Initialization
  useEffect(() => {
    async function initialize() {
      try {
        // 1. Check if setup is needed
        const setupRes = await fetchApi("/auth/setup-status");
        if (setupRes.needs_setup) {
          setIsInitializing(false);
          if (!isOnboarding) {
            navigate("/onboarding", { replace: true });
          }
          return;
        }

        // 2. Setup is complete. Do we have a token?
        const token = localStorage.getItem("shopmanager_token");
        if (!token) {
          setIsAuthenticated(false);
          setIsInitializing(false);
          return;
        }

        // 3. Token exists, validate session
        const sessionRes = await fetchApi("/auth/validate-session");
        if (sessionRes && sessionRes.valid) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem("shopmanager_token");
        }
      } catch (err) {
        console.error("Initialization error:", err);
        setIsAuthenticated(false);
      } finally {
        setIsInitializing(false);
      }
    }

    initialize();
  }, [location.pathname, navigate]);

  if (isInitializing) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated and trying to access protected routes
  if (!isAuthenticated && !isLogin && !isOnboarding && !isLock) {
    return <Navigate to="/login" replace />;
  }

  if (isLogin || isOnboarding || isLock) {
    return (
      <>
        <Outlet />
        <Toaster position="top-right" richColors closeButton />
      </>
    );
  }

  // Dashboard is a full-screen app launcher — no sidebar
  if (isDashboard) {
    return (
      <div className="h-screen bg-slate-100 flex flex-col overflow-hidden">
        <Outlet />
        <CommandPalette
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
        />
        <Toaster position="top-right" richColors closeButton />
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-50 flex overflow-hidden">
      {/* Persistent Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <Navbar onSearchClick={() => setCommandPaletteOpen(true)} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
      />

      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
