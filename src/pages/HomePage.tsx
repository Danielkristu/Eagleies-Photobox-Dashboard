/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
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

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { data: userIdentity } = useGetIdentity<UserIdentity>();

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
    if (userIdentity?.id) {
      fetchBoothsData(userIdentity.id);
      fetchRevenueData(userIdentity.id);
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
        Welcome, User Client
      </Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} style={{ marginBottom: 12 }}>
          <Card
            title={<span style={{ fontSize: 16 }}>Total Pendapatan</span>}
            bordered={false}
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
            bordered={false}
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
            bordered={false}
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
            ) : booths.length === 0 ? (
              <Empty
                description={<Text type="secondary">No booths found.</Text>}
              />
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
                {booths.map((booth) => (
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
                      title={<span style={{ fontSize: 15 }}>{booth.name}</span>}
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
                            gap: 8,
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
                          >
                            Settings
                          </Button>
                          ,
                          <Button
                            key="vouchers"
                            icon={<GiftOutlined />}
                            onClick={() =>
                              navigate(`/booths/${booth.id}/vouchers`)
                            }
                            type="text"
                          >
                            Vouchers
                          </Button>
                          ,
                          <Button
                            key="backgrounds"
                            icon={<PictureOutlined />}
                            onClick={() =>
                              navigate(`/booths/${booth.id}/backgrounds`)
                            }
                            type="text"
                          >
                            Backgrounds
                          </Button>
                          ,
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
