import { Refine, WelcomePage } from "@refinedev/core";
import { DevtoolsPanel, DevtoolsProvider } from "@refinedev/devtools";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { voucherDataProvider } from "./providers/voucher-data-provider";
import { useNotificationProvider, ThemedLayoutV2 } from "@refinedev/antd";
import "@refinedev/antd/dist/reset.css";
import { VoucherCreate } from "./pages/VoucherCreate";
import { VoucherEdit } from "./pages/VoucherEdit";
import { AppConfigEdit } from "./pages/AppConfigEdit";
import { TransactionReport } from "./pages/TransactionReport";
import Login from "./pages/Login";
import { authProvider } from "./auth/authProvider";
import HomePage from "./pages/HomePage";
import routerBindings, {
  DocumentTitleHandler,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";

import { ConfigProvider, App as AntdApp } from "antd";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import { ColorModeContextProvider } from "./contexts/color-mode";
import { VoucherList } from "./pages/VoucherList";
import { photoboxDataProvider } from "./providers/photobox-data-provider";
import AccountSettingsPage from "./pages/AccountSettingsPage";
import BoothBackgroundsPage from "./pages/BoothBackgroundsPage";
import BoothSettingsPage from "./pages/BoothSettingsPage";
import BoothVouchersPage from "./pages/BoothVouchersPage";

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
                  dataProvider={{
                    default: voucherDataProvider,
                    photobox: photoboxDataProvider,
                  }}
                  notificationProvider={useNotificationProvider()}
                  routerProvider={routerBindings}
                  resources={[
                    {
                      name: "Voucher",
                      list: "/voucher",
                      create: "/voucher/create",
                      edit: "/voucher/edit/:id",
                      icon: <i className="ri-gift-line" />,
                    },
                    {
                      name: "Settings",
                      list: "/settings",
                      icon: <i className="ri-settings-3-line" />,
                    },
                    {
                      name: "report",
                      list: "/report",
                      icon: <i className="ri-bar-chart-2-line" />,
                    },
                  ]}
                  options={{
                    syncWithLocation: true,
                    warnWhenUnsavedChanges: true,
                    useNewQueryKeys: true,
                    projectId: "JbGobW-s8ff1v-UdeVw6",
                  }}
                >
                  <Routes>
                    {/* Login route */}
                    <Route path="/login" element={<Login />} />
                    {/* Home route */}
                    <Route path="/" element={<HomePage />} />{" "}
                    {/* Ganti / ke HomePage */}
                    {/* Optionally, keep the WelcomePage at another path */}
                    <Route path="/welcome" element={<WelcomePage />} />
                    {/* Protected route for the rest */}
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
                    <Route path="/account" element={<AccountSettingsPage />} />
                    <Route
                      element={
                        <ThemedLayoutV2>
                          <Outlet />
                        </ThemedLayoutV2>
                      }
                    >
                      <Route path="/voucher" element={<VoucherList />} />
                      <Route
                        path="/voucher/create"
                        element={<VoucherCreate />}
                      />
                      <Route
                        path="/voucher/edit/:id"
                        element={<VoucherEdit />}
                      />
                      <Route path="/settings" element={<AppConfigEdit />} />
                      <Route path="/report" element={<TransactionReport />} />
                    </Route>
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
