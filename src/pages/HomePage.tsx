/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Col,
  Row,
  Typography,
  notification,
  Empty,
  Spin,
  Button,
  Skeleton,
} from "antd";
import {
  DollarOutlined,
  AppstoreAddOutlined,
  TeamOutlined,
  SettingOutlined,
  GiftOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import { useGetIdentity } from "@refinedev/core";
import { collection, getDocs } from "firebase/firestore";
import { db, app } from "../firebase";
import { fetchTotalRevenueFromXendit } from "../utils/xendit";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { ColorModeContext } from "../contexts/color-mode";

const { Title, Text } = Typography;

interface Booth {
  id: string;
  name: string;
  settings: Record<string, any>;
  created_at: { seconds: number; nanoseconds: number };
}

interface UserIdentity {
  id: string;
  email: string;
  name: string;
}

export function generateBoothCode() {
  // Format: 4 uppercase letters + '-' + 4 digits, e.g. AZTX-7821
  const letters = Array.from({ length: 4 }, () =>
    String.fromCharCode(65 + Math.floor(Math.random() * 26))
  ).join("");
  const digits = String(Math.floor(1000 + Math.random() * 9000));
  return `${letters}-${digits}`;
}

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { data: userIdentity } = useGetIdentity<UserIdentity>();
  const { mode } = useContext(ColorModeContext);

  const [booths, setBooths] = useState<Booth[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);
  const [loadingBooths, setLoadingBooths] = useState<boolean>(true);
  const [loadingRevenue, setLoadingRevenue] = useState<boolean>(true);
  const [errorBooths, setErrorBooths] = useState<string | null>(null);
  const [errorRevenue, setErrorRevenue] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  // ✅ Firebase auth check
  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login"); // ⬅️ redirect jika belum login
      } else {
        setAuthLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchBoothsData = async (currentUserId: string) => {
    setLoadingBooths(true);
    setErrorBooths(null);
    try {
      const colRef = collection(db, "Clients", currentUserId, "Booths");
      const snapshot = await getDocs(colRef);
      const boothData = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || "Unnamed Booth",
        settings: doc.data().settings || {},
        created_at: doc.data().created_at || { seconds: 0, nanoseconds: 0 },
      })) as Booth[];
      setBooths(boothData);
    } catch (error: any) {
      const errorMessage =
        error.message || "There was an issue fetching your booths.";
      setErrorBooths(errorMessage);
      notification.error({
        message: "Error fetching booths",
        description: errorMessage,
      });
    } finally {
      setLoadingBooths(false);
    }
  };

  const fetchUserData = async (currentUserId: string) => {
    setLoadingBooths(true);
    setErrorBooths(null);
    try {
      const colRef = collection(db, "users", currentUserId);
      const snapshot = await getDocs(colRef);
      const userData = snapshot.docs.map((doc) => ({
        id: doc.id,
        email: doc.data().email || "Unnamed User",
        name: doc.data().name || "Unnamed User",
      })) as UserIdentity[];
      setUser(userData[0] || { id: "", email: "", name: "Unnamed User" });
    } catch (error: any) {
      const errorMessage =
        error.message || "There was an issue fetching your user data.";
      setErrorUser(errorMessage);
      notification.error({
        message: "Error fetching user data",
        description: errorMessage,
      });
    } finally {
      setLoadingBooths(false);
    }
  };

  const fetchRevenueData = async (currentUserId: string) => {
    setLoadingRevenue(true);
    setErrorRevenue(null);
    try {
      const revenue = await fetchTotalRevenueFromXendit(currentUserId);
      setTotalRevenue(revenue);
    } catch (error: any) {
      const errorMessage =
        error.message || "There was an issue fetching the total revenue.";
      setErrorRevenue(errorMessage);
      notification.error({
        message: "Error fetching revenue",
        description: errorMessage,
      });
    } finally {
      setLoadingRevenue(false);
    }
  };

  useEffect(() => {
    console.log("userIdentity in HomePage:", userIdentity);
    if (userIdentity?.id) {
      fetchBoothsData(userIdentity.id);
      fetchRevenueData(userIdentity.id);
      fetchUserData(userIdentity.id);
    }
  }, [userIdentity]);

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  if (authLoading) {
    return (
      <div
        style={{
          padding: 24,
          textAlign: "center",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin tip="Loading user session..." />
      </div>
    );
  }

  return (
    <div style={{ padding: 12, maxWidth: "100%", margin: 0 }}>
      <Title
        level={2}
        style={{
          marginBottom: 24,
          fontSize: 24,
        }}
      >
        Welcome, {userIdentity?.name || "User"}!
      </Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} style={{ marginBottom: 12 }}>
          <Card
            title={<span style={{ fontSize: 16 }}>Total Pendapatan</span>}
            variant="borderless"
            extra={<DollarOutlined />}
            style={{ textAlign: "center", minHeight: 120, width: "100%" }}
          >
            {loadingRevenue ? (
              <Skeleton.Input
                active
                style={{ width: 150, display: "block", margin: "auto" }}
              />
            ) : errorRevenue ? (
              <>
                <Text type="danger">Failed to load</Text>
                <br />
                <Button
                  type="link"
                  onClick={() =>
                    userIdentity?.id && fetchRevenueData(userIdentity.id)
                  }
                >
                  Retry
                </Button>
              </>
            ) : (
              <Title level={3} style={{ margin: 0 }}>
                {formatRupiah(totalRevenue || 0)}
              </Title>
            )}
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8} style={{ marginBottom: 12 }}>
          <Card
            title={<span style={{ fontSize: 16 }}>Jumlah Booth</span>}
            variant="borderless"
            extra={<AppstoreAddOutlined />}
            style={{ textAlign: "center", minHeight: 120, width: "100%" }}
          >
            {loadingBooths ? (
              <Skeleton.Input
                active
                style={{ width: 50, display: "block", margin: "auto" }}
              />
            ) : errorBooths ? (
              <>
                <Text type="danger">Failed to load</Text>
                <br />
                <Button
                  type="link"
                  onClick={() =>
                    userIdentity?.id && fetchBoothsData(userIdentity.id)
                  }
                >
                  Retry
                </Button>
              </>
            ) : (
              <Title level={3} style={{ margin: 0 }}>
                {booths.length}
              </Title>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24}>
          <Card
            title={<span style={{ fontSize: 16 }}>Your Booths</span>}
            variant="borderless"
            extra={<TeamOutlined />}
            style={{ width: "100%" }}
          >
            {loadingBooths ? (
              <Row gutter={[16, 16]}>
                {[...Array(booths.length > 0 ? booths.length : 2)].map(
                  (_, index) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={index}>
                      <Skeleton active paragraph={{ rows: 3 }} />
                    </Col>
                  )
                )}
              </Row>
            ) : errorBooths ? (
              <div style={{ textAlign: "center" }}>
                <Empty
                  description={
                    <Text type="secondary">Failed to load booths</Text>
                  }
                />
                <Button
                  type="primary"
                  onClick={() =>
                    userIdentity?.id && fetchBoothsData(userIdentity.id)
                  }
                  style={{ marginTop: 16 }}
                >
                  Retry
                </Button>
              </div>
            ) : (
              <Row
                gutter={[12, 12]}
                justify="start"
                style={{
                  flexWrap: "wrap",
                  overflowX: "auto",
                  WebkitOverflowScrolling: "touch",
                  marginLeft: -4,
                  marginRight: -4,
                }}
              >
                {/* Add Booth Card - always show unless loadingBooths is true */}
                {!loadingBooths && (
                  <Col
                    xs={24}
                    sm={24}
                    md={12}
                    lg={12}
                    xl={8}
                    style={{
                      minWidth: 260,
                      maxWidth: "100%",
                      paddingLeft: 4,
                      paddingRight: 4,
                    }}
                    key="add-booth"
                  >
                    <Card
                      hoverable
                      variant="outlined"
                      style={{
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        minHeight: 160,
                        marginBottom: 8,
                        alignItems: "center",
                        justifyContent: "center",
                        border:
                          mode === "dark"
                            ? "2px dashed #888"
                            : "2px dashed #222",
                        background: mode === "dark" ? "#181818" : "#fff",
                        transition: "background 0.2s, border 0.2s",
                      }}
                      bodyStyle={{
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        paddingTop: 12,
                        paddingBottom: 12,
                      }}
                      onClick={() => navigate("/booths/new")}
                    >
                      <Button
                        type="dashed"
                        shape="circle"
                        size="large"
                        icon={<AppstoreAddOutlined style={{ fontSize: 28 }} />}
                        style={{
                          marginBottom: 8,
                          border: "none",
                          background: mode === "dark" ? "#222" : "#f5f5f5",
                          color: mode === "dark" ? "#fff" : "#222",
                          transition: "background 0.2s, color 0.2s",
                        }}
                      />
                      <span
                        style={{ color: "#aaa", fontWeight: 500, fontSize: 15 }}
                      >
                        Add Booth
                      </span>
                    </Card>
                  </Col>
                )}
                {/* Existing Booth Cards */}
                {!loadingBooths &&
                  booths.map((booth) => (
                    <Col
                      xs={24}
                      sm={24}
                      md={12}
                      lg={12}
                      xl={8}
                      key={booth.id}
                      style={{
                        minWidth: 260,
                        maxWidth: "100%",
                        paddingLeft: 4,
                        paddingRight: 4,
                      }}
                    >
                      <Card
                        hoverable
                        variant="outlined"
                        title={
                          <span style={{ fontSize: 15 }}>{booth.name}</span>
                        }
                        style={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          minHeight: 160,
                          marginBottom: 8,
                          overflow: "hidden",
                        }}
                        bodyStyle={{
                          flexGrow: 1,
                          paddingTop: 12,
                          paddingBottom: 12,
                        }}
                        actions={[
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              justifyContent: "flex-start",
                              width: "100%",
                            }}
                          >
                            <Button
                              key="settings"
                              icon={<SettingOutlined />}
                              onClick={() =>
                                navigate(`/booths/${booth.id}/settings`)
                              }
                              type="text"
                              style={{
                                borderRight: "1px solid #444",
                                borderRadius: 0,
                                marginRight: 0,
                                paddingRight: 16,
                                minWidth: 0,
                              }}
                            >
                              Settings
                            </Button>
                            <Button
                              key="vouchers"
                              icon={<GiftOutlined />}
                              onClick={() =>
                                navigate(`/booths/${booth.id}/vouchers`)
                              }
                              type="text"
                              style={{
                                borderRight: "1px solid #444",
                                borderRadius: 0,
                                marginRight: 0,
                                paddingRight: 16,
                                minWidth: 0,
                              }}
                            >
                              Vouchers
                            </Button>
                            <Button
                              key="backgrounds"
                              icon={<PictureOutlined />}
                              onClick={() =>
                                navigate(`/booths/${booth.id}/backgrounds`)
                              }
                              type="text"
                              style={{
                                borderRight: "none",
                                borderRadius: 0,
                                marginRight: 0,
                                paddingRight: 0,
                                minWidth: 0,
                              }}
                            >
                              Backgrounds
                            </Button>
                          </div>,
                        ]}
                      >
                        <Text
                          type="secondary"
                          style={{
                            fontSize: 13,
                            wordBreak: "break-all",
                          }}
                        >
                          Booth ID: {booth.id}
                        </Text>
                      </Card>
                    </Col>
                  ))}
              </Row>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HomePage;
function setErrorUser(errorMessage: any) {
  throw new Error("Function not implemented.");
}

function setUser(arg0: UserIdentity) {
  throw new Error("Function not implemented.");
}

