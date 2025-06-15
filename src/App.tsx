// src/App.tsx
import { Refine, WelcomePage } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { useNotificationProvider, ThemedLayoutV2 } from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";
import Login from "./pages/Login";
import { authProvider } from "./auth/authProvider";
import HomePage from "./pages/HomePage";
import routerBindings, {
  DocumentTitleHandler,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";

import { ConfigProvider, App as AntdApp } from "antd";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import CustomHeader from "./components/Header"; // Correctly imported
import { ColorModeContextProvider } from "./contexts/color-mode";
import AccountSettingsPage from "./pages/AccountSettingsPage";
import BoothBackgroundsPage from "./pages/BoothBackgroundsPage";
import BoothSettingsPage from "./pages/BoothSettingsPage";
import BoothVouchersPage from "./pages/BoothVouchersPage";

// --- NEW IMPORTS ---
import TransactionReportPage from "./pages/TransactionReportPage";
import { firestoreDataProvider } from "./providers/firestore-data-provider"; // Assuming this is your Firestore Data Provider
import ChatTransactionsPage from "./pages/ChatTransactionPage";
import SignUpPage from "./pages/SignUpPage";
import ManageUsersPage from "./pages/ManageUsersPage";

function App() {
  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <ConfigProvider>
            <AntdApp>
              <DevtoolsProvider>
                <Refine
                  authProvider={authProvider}
                  notificationProvider={useNotificationProvider()}
                  routerProvider={routerBindings}
                  // --- ADDED: firestoreDataProvider ---
                  dataProvider={firestoreDataProvider}
                  resources={[
                    {
                      name: "chat-transactions",
                      list: "/chat",
                      meta: {
                        label: "Transaction Report",
                      },
                    },
                    // --- ADD: Manage Users resource, only visible to admin ---
                    {
                      name: "manage-users",
                      list: "/manage-users",
                      meta: {
                        label: "Manage Users",
                        canAccess: (user: any) => user?.role === "admin",
                      },
                    },
                    // Other existing resources...
                  ]}
                  options={{
                    syncWithLocation: true,
                    warnWhenUnsavedChanges: true,
                    useNewQueryKeys: true,
                    projectId: "JbGobW-s8ff1v-UdeVw6",
                  }}
                >
                  <Routes>
                    {/* Routes that should NOT use ThemedLayoutV2 (e.g., public pages) */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/welcome" element={<WelcomePage />} />{" "}
                    <Route path="/signup" element={<SignUpPage />} />
                    {/* If WelcomePage is public/doesn't need the main header */}
                    {/* Routes that SHOULD use ThemedLayoutV2 with CustomHeader */}
                    <Route
                      element={
                        <ThemedLayoutV2 Header={CustomHeader}>
                          {" "}
                          {/* Correct usage of ThemedLayoutV2 and CustomHeader */}
                          <Outlet />
                        </ThemedLayoutV2>
                      }
                    >
                      {/* --- Move routes that need the layout here --- */}
                      <Route path="/" element={<HomePage />} />{" "}
                      {/* HomePage now uses the layout */}
                      <Route
                        path="/account"
                        element={<AccountSettingsPage />}
                      />{" "}
                      {/* AccountSettingsPage now uses the layout */}
                      <Route
                        path="/booths/:boothId/settings"
                        element={<BoothSettingsPage />}
                      />
                      <Route
                        path="/booths/:boothId/vouchers"
                        element={<BoothVouchersPage />}
                      />
                      <Route
                        path="/booths/:boothId/backgrounds"
                        element={<BoothBackgroundsPage />}
                      />
                      <Route path="/chat" element={<ChatTransactionsPage />} />
                      {/* --- ADD: Manage Users route (admin only) --- */}
                      <Route
                        path="/manage-users"
                        element={<ManageUsersPage />}
                      />
                      {/* You might want a 404 page for routes inside the layout */}
                      {/* <Route path="*" element={<NotFoundInsideLayout />} /> */}
                    </Route>
                    {/* A global 404 page for any routes not matched above */}
                    {/* <Route path="*" element={<GlobalNotFound />} /> */}
                  </Routes>

                  <RefineKbar />
                  <UnsavedChangesNotifier />
                  <DocumentTitleHandler />
                </Refine>
                <DevtoolsPanel />
              </DevtoolsProvider>
            </AntdApp>
          </ConfigProvider>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;