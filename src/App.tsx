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

import { ConfigProvider, App as AntdApp, Alert } from "antd";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import CustomHeader from "./components/Header"; // Correctly imported
import { ColorModeContextProvider } from "./contexts/color-mode";
import AccountSettingsPage from "./pages/AccountSettingsPage";
import BoothBackgroundsPage from "./pages/BoothBackgroundsPage";
import BoothSettingsPage from "./pages/BoothSettingsPage";
import BoothVouchersPage from "./pages/BoothVouchersPage";
import InstructionPage from "./pages/Instructions/InstructionPage";

// --- NEW IMPORTS ---
import { firestoreDataProvider } from "./providers/firestore-data-provider"; // Assuming this is your Firestore Data Provider
import ChatTransactionsPage from "./pages/ChatTransactionPage";
import SignUpPage from "./pages/SignUpPage";
import ManageUsersPage from "./pages/ManageUsersPage";
import BoothCreatePage from "./pages/BoothCreatePage"; // Importing the new BoothCreatePage
import { useEffect, useState } from "react";
import { useGetIdentity } from "@refinedev/core";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  addDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { v4 as uuidv4 } from "uuid";
import {
  BarChartOutlined,
  ReadOutlined,
  UserOutlined,
} from "@ant-design/icons";

function generateBoothCode() {
  // Format: 4 uppercase letters + '-' + 4 digits, e.g. AZTX-7821
  const letters = Array.from({ length: 4 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26))
  ).join("");
  const digits = String(Math.floor(1000 + Math.random() * 9000));
  return `${letters}-${digits}`;
}

function App() {
  // Remove all onboarding-related state and logic
  // ...existing code...
  // Remove useEffect, handleOnboardingComplete, handleBannerOnboarding, etc.
  // Remove checkingOnboarding and onboardingIncomplete usage

  // Add banner state only
  const [showBanner, setShowBanner] = useState(true);

  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <ConfigProvider>
            <AntdApp>
              <Refine
                authProvider={authProvider}
                notificationProvider={useNotificationProvider()}
                routerProvider={routerBindings}
                dataProvider={firestoreDataProvider}
                resources={[
                  {
                    name: "chat-transactions",
                    list: "/chat",
                    icon: <BarChartOutlined />,
                    meta: {
                      label: "Transaction Report",
                    },
                  },
                  {
                    name: "manage-users",
                    list: "/manage-users",
                    icon: <UserOutlined />,
                    meta: {
                      label: "Manage Users",
                      canAccess: (user: any) => user?.role === "admin",
                    },
                  },
                  {
                    name: "instructions",
                    list: "/instructions",
                    icon: <ReadOutlined />,
                    meta: {
                      label: "Instructions",
                    },
                  },
                ]}
                options={{
                  syncWithLocation: true,
                  warnWhenUnsavedChanges: true,
                  useNewQueryKeys: true,
                  projectId: "JbGobW-s8ff1v-UdeVw6",
                  title: {
                    text: "ChronoSnap",
                  },
                }}
              >
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/welcome" element={<WelcomePage />} />
                  <Route path="/signup" element={<SignUpPage />} />
                  <Route
                    element={
                      <ThemedLayoutV2 Header={CustomHeader}>
                        {/* Banner below header, above content */}
                        {showBanner && (
                          <Alert
                            message="Lengkapi onboarding: Masukkan Xendit API Key dan nama booth awal Anda."
                            type="warning"
                            showIcon
                            style={{
                              position: "relative",
                              top: 0,
                              left: 0,
                              right: 0,
                              zIndex: 2,
                              borderRadius: 0,
                              marginBottom: 0,
                            }}
                            action={
                              <div style={{ display: "flex", gap: 8 }}>
                                <button
                                  style={{
                                    background: "#52c41a",
                                    color: "#fff",
                                    border: "none",
                                    borderRadius: 4,
                                    padding: "4px 16px",
                                    cursor: "pointer",
                                  }}
                                  onClick={() => setShowBanner(false)}
                                >
                                  Selesai
                                </button>
                              </div>
                            }
                          />
                        )}
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
                    <Route path="/instructions" element={<InstructionPage />} />
                    {/* --- ADD: Manage Users route (admin only) --- */}
                    <Route path="/manage-users" element={<ManageUsersPage />} />
                    <Route path="/booths/new" element={<BoothCreatePage />} />
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
            </AntdApp>
          </ConfigProvider>
        </ColorModeContextProvider>
      </RefineKbarProvider>
    </BrowserRouter>
  );
}

export default App;