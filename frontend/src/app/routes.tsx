import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/shared/components/layout/AppLayout";
import { ProtectedRoute } from "@/shared/components/layout/ProtectedRoute";
import { LoginPage } from "@/modules/auth/pages/LoginPage";
import { ProfilePage } from "@/modules/auth/pages/ProfilePage";
import { DashboardPage } from "@/modules/dashboard/pages/DashboardPage";
import { OrdersPage } from "@/modules/orders/pages/OrdersPage";
import { DispatchPage } from "@/modules/dispatch/pages/DispatchPage";
import { TrackingPage } from "@/modules/tracking/pages/TrackingPage";
import { FleetPage } from "@/modules/fleet/pages/FleetPage";
import { DriversPage } from "@/modules/drivers/pages/DriversPage";
import { WarehousesPage } from "@/modules/warehouses/pages/WarehousesPage";
import { RoutesPage } from "@/modules/routes/pages/RoutesPage";
import { ReportsPage } from "@/modules/reports/pages/ReportsPage";
import { AiAssistantPage } from "@/modules/ai-assistant/pages/AiAssistantPage";
import { SettingsPage } from "@/modules/dashboard/pages/SettingsPage";
import { HelpPage } from "@/modules/dashboard/pages/HelpPage";
import { NotFoundPage } from "@/modules/dashboard/pages/NotFoundPage";
import { DriverPortalPage } from "@/modules/driver/pages/DriverPortalPage";
import { PublicTrackingPage } from "@/modules/public-tracking/pages/PublicTrackingPage";
import { NotificationsPage } from "@/modules/notifications/pages/NotificationsPage";
import { CustomersPage } from "@/modules/customers/pages/CustomersPage";
import { IncidentsPage } from "@/modules/incidents/pages/IncidentsPage";
import { CodReconciliationPage } from "@/modules/finance/pages/CodReconciliationPage";
import { BillingPage } from "@/modules/finance/pages/BillingPage";
import { InvoicePaymentPortalPage } from "@/modules/finance/pages/InvoicePaymentPortalPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/track",
    element: <PublicTrackingPage />,
  },
  {
    path: "/track/:orderCode",
    element: <PublicTrackingPage />,
  },
  {
    path: "/public-tracking",
    element: <PublicTrackingPage />,
  },
  {
    path: "/public-tracking/:orderCode",
    element: <PublicTrackingPage />,
  },
  {
    path: "/portal/pay/:invoiceCode",
    element: <InvoicePaymentPortalPage />,
  },
  {
    path: "/pay/:invoiceCode",
    element: <InvoicePaymentPortalPage />,
  },

  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/dashboard" replace />,
          },
          {
            path: "dashboard",
            element: <DashboardPage />,
          },
          {
            path: "orders",
            element: <OrdersPage />,
          },
          {
            path: "dispatch",
            element: <DispatchPage />,
          },
          {
            path: "tracking",
            element: <TrackingPage />,
          },
          {
            path: "fleet",
            element: <FleetPage />,
          },
          {
            path: "drivers",
            element: <DriversPage />,
          },
          {
            path: "driver",
            element: <DriverPortalPage />,
          },
          {
            path: "warehouses",
            element: <WarehousesPage />,
          },
          {
            path: "routes",
            element: <RoutesPage />,
          },
          {
            path: "reports",
            element: <ReportsPage />,
          },
          {
            path: "ai-assistant",
            element: <AiAssistantPage />,
          },
          {
            path: "notifications",
            element: <NotificationsPage />,
          },
          {
            path: "customers",
            element: <CustomersPage />,
          },
          {
            path: "incidents",
            element: <IncidentsPage />,
          },
          {
            path: "finance/cod",
            element: <CodReconciliationPage />,
          },
          {
            path: "finance/billing",
            element: <BillingPage />,
          },
          {
            path: "settings",
            element: <SettingsPage />,
          },
          {
            path: "help",
            element: <HelpPage />,
          },
          {
            path: "profile",
            element: <ProfilePage />,
          },
          {
            path: "*",
            element: <NotFoundPage />,
          },
        ],
      },
    ],
  },
]);
