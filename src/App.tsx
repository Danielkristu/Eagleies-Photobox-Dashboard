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

import routerBindings, {
  DocumentTitleHandler,
  UnsavedChangesNotifier,
} from "@refinedev/react-router";

import { ConfigProvider, App as AntdApp } from "antd";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import { ColorModeContextProvider } from "./contexts/color-mode";
import { VoucherList } from "./pages/VoucherList";
import { photoboxDataProvider } from "./providers/photobox-data-provider";

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
                    {/* Login tanpa layout */}
                    <Route path="/login" element={<Login />} />

                    {/* Semua halaman lain pakai layout */}
                    <Route
                      element={
                        <ThemedLayoutV2>
                          <Outlet />
                        </ThemedLayoutV2>
                      }
                    >
                      <Route index element={<WelcomePage />} />
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
