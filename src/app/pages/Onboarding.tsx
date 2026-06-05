import { useState } from "react";
import { useNavigate } from "react-router";
import { AnimatePresence } from "motion/react";
import { SplashScreen } from "../components/onboarding/SplashScreen";
import { WelcomeScreen } from "../components/onboarding/WelcomeScreen";
import { AuthScreen } from "../components/onboarding/AuthScreen";
import { ShopSetupScreen, type ShopSetupData } from "../components/onboarding/ShopSetupScreen";
import { LanguageScreen } from "../components/onboarding/LanguageScreen";
import { PreparingScreen } from "../components/onboarding/PreparingScreen";
import { fetchApi } from "../../lib/api";

type Step = "splash" | "welcome" | "auth" | "setup" | "language" | "preparing";

const EMPTY_SHOP: ShopSetupData = {
  shopName: "",
  ownerName: "",
  phone: "",
  gstin: "",
  address: "",
};

export function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("splash");
  const [isNewUser, setIsNewUser] = useState(true);
  const [shopData, setShopData] = useState<ShopSetupData>({ ...EMPTY_SHOP });
  const [language, setLanguage] = useState("English");
  
  // Store auth credentials temporarily
  const [authCreds, setAuthCreds] = useState({ username: "", password: "" });

  const handleSplashComplete = () => {
    // Just default to welcome instead of local storage checking
    setStep("welcome");
  };

  const handleGetStarted = () => {
    setIsNewUser(true);
    setStep("auth");
  };

  const handleSignIn = () => {
    navigate("/login");
  };

  const handleAuthComplete = (username?: string, password?: string) => {
    if (username && password) {
      setAuthCreds({ username, password });
    }
    
    if (isNewUser) {
      setStep("setup");
    } else {
      setStep("preparing");
    }
  };

  const handleSetupComplete = (data: ShopSetupData) => {
    setShopData(data);
    setStep("language");
  };

  const handleLanguageComplete = (lang: string) => {
    setLanguage(lang);
    setStep("preparing");
  };

  const handlePreparingComplete = async () => {
    try {
      if (isNewUser && authCreds.username && authCreds.password) {
        // 1. Create Admin User & Generate JWT
        const loginRes = await fetchApi("/auth/setup", {
          method: "POST",
          body: {
            username: authCreds.username,
            password: authCreds.password
          }
        });
        
        // Save the JWT
        localStorage.setItem("shopmanager_token", loginRes.access_token);
        
        // 2. Save Business Settings
        await fetchApi("/settings", {
          method: "PUT",
          body: {
            settings: { ...shopData, language }
          }
        });
      }

      // Remove the deprecated local storage flag dependency
      localStorage.removeItem("shopmanager_onboarded");
      
      // Navigate to dashboard
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Failed to complete onboarding:", err);
      // In a real app we'd show a toast error here
      navigate("/login");
    }
  };

  return (
    <div className="relative" style={{ fontFamily: "'Plus Jakarta Sans', 'Inter', sans-serif" }}>
      <AnimatePresence mode="wait">
        {step === "splash" && (
          <SplashScreen key="splash" onComplete={handleSplashComplete} />
        )}
        {step === "welcome" && (
          <WelcomeScreen
            key="welcome"
            onGetStarted={handleGetStarted}
            onSignIn={handleSignIn}
          />
        )}
        {step === "auth" && (
          <AuthScreen key="auth" onComplete={handleAuthComplete} isNewUser={isNewUser} />
        )}
        {step === "setup" && (
          <ShopSetupScreen
            key="setup"
            onComplete={handleSetupComplete}
            initialData={shopData}
          />
        )}
        {step === "language" && (
          <LanguageScreen
            key="language"
            onComplete={handleLanguageComplete}
            initialLanguage={language}
          />
        )}
        {step === "preparing" && (
          <PreparingScreen key="preparing" onComplete={handlePreparingComplete} />
        )}
      </AnimatePresence>
    </div>
  );
}
