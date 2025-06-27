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
import BoothCreatePage from "./pages/BoothCreatePage"; // Importing the new BoothCreatePage
import { useEffect, useState } from "react";
import { OnboardingOverlay } from "./components/OnboardingOverlay";
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

function App() {
  // Use correct type for userIdentity
  const { data: userIdentity, isLoading: identityLoading } = useGetIdentity<{
    id: string;
  }>();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);

  useEffect(() => {
    console.log(
      "identityLoading:",
      identityLoading,
      "userIdentity:",
      userIdentity
    );
    const timeout = setTimeout(() => {
      if (checkingOnboarding) {
        console.error("Onboarding check timed out.");
        setCheckingOnboarding(false);
      }
    }, 10000); // 10 seconds
    const checkOnboarding = async () => {
      try {
        console.log("Checking onboarding for user:", userIdentity);
        if (!userIdentity?.id) {
          setShowOnboarding(false);
          setCheckingOnboarding(false);
          return;
        }
        // Check Xendit API key
        const clientRef = doc(db, "Clients", userIdentity.id);
        const clientSnap = await getDoc(clientRef);
        const xenditApiKey = clientSnap.exists()
          ? clientSnap.data().xendit_api_key
          : undefined;
        // Check for at least one real booth (not just placeholder)
        const boothsCol = collection(db, "Clients", userIdentity.id, "Booths");
        const boothsSnap = await getDocs(boothsCol);
        const realBooth = boothsSnap.docs.find(
          (doc) => doc.id !== "init_placeholder"
        );
        console.log("xenditApiKey:", xenditApiKey, "realBooth:", realBooth);
        // --- Onboarding overlay force for just signed up users ---
        const justSignedUp = localStorage.getItem("justSignedUp") === "1";
        if (!xenditApiKey || !realBooth || justSignedUp) {
          setShowOnboarding(true);
          if (justSignedUp) localStorage.removeItem("justSignedUp");
        } else {
          setShowOnboarding(false);
        }
        setCheckingOnboarding(false);
      } catch (err) {
        console.error("Onboarding check error:", err);
        setShowOnboarding(false);
        setCheckingOnboarding(false);
      } finally {
        clearTimeout(timeout);
      }
    };
    if (!identityLoading) checkOnboarding();
    return () => clearTimeout(timeout);
  }, [userIdentity, identityLoading]);

  const handleOnboardingComplete = async (
    apiKey: string,
    boothName: string
  ) => {
    if (!userIdentity?.id) return;
    // Save Xendit API key
    const clientRef = doc(db, "Clients", userIdentity.id);
    await updateDoc(clientRef, { xendit_api_key: apiKey });
    // Remove placeholder booth if exists
    const placeholderRef = doc(
      db,
      "Clients",
      userIdentity.id,
      "Booths",
      "init_placeholder"
    );
    try {
      await deleteDoc(placeholderRef);
    } catch {}
    // Add initial booth
    const boothsCol = collection(db, "Clients", userIdentity.id, "Booths");
    await addDoc(boothsCol, {
      name: boothName,
      created_at: new Date(),
      settings: {},
    });
    setShowOnboarding(false);
  };

  if (checkingOnboarding) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#f7f8fa",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: 16,
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
            padding: 48,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 28,
              fontWeight: 700,
              marginBottom: 16,
            }}
          >
            Loading...
          </span>
          <span
            style={{
              fontSize: 18,
              color: "#888",
            }}
          >
            Checking onboarding status, please wait.
          </span>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <RefineKbarProvider>
        <ColorModeContextProvider>
          <ConfigProvider>
            <AntdApp>
              <DevtoolsProvider>
                {/* Onboarding Overlay (blocks app if needed) */}
                {showOnboarding && !checkingOnboarding && (
                  <OnboardingOverlay
                    visible={showOnboarding}
                    onComplete={handleOnboardingComplete}
                  />
                )}
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