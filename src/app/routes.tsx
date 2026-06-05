import { createBrowserRouter } from "react-router";
import { Root } from "./Root";
import { Login } from "./pages/Login";
import { LockScreen } from "./pages/LockScreen";
import { Onboarding } from "./pages/Onboarding";
import { Dashboard } from "./pages/Dashboard";
import { Customers } from "./pages/Customers";
import { Billing } from "./pages/Billing";
import { Products } from "./pages/Products";
import { InvoiceHistory } from "./pages/InvoiceHistory";
import { Analytics } from "./pages/Analytics";
import { Reports } from "./pages/Reports";
import { Settings } from "./pages/Settings";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Dashboard },
      { path: "login", Component: Login },
      { path: "lock", Component: LockScreen },
      { path: "onboarding", Component: Onboarding },
      { path: "billing", Component: Billing },
      { path: "customers", Component: Customers },
      { path: "products", Component: Products },
      { path: "history", Component: InvoiceHistory },
      { path: "analytics", Component: Analytics },
      { path: "reports", Component: Reports },
      { path: "settings", Component: Settings },
    ],
  },
]);
