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
import { db } from "../firebase";
import { fetchTotalRevenueFromXendit } from "../utils/xendit";
import Header from "../components/Header";

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
  console.log("User identity:", userIdentity);
  const userId = userIdentity?.id;

  const [booths, setBooths] = useState<Booth[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number | null>(null);
  const [loadingBooths, setLoadingBooths] = useState<boolean>(true);
  const [loadingRevenue, setLoadingRevenue] = useState<boolean>(true);
  const [errorBooths, setErrorBooths] = useState<string | null>(null);
  const [errorRevenue, setErrorRevenue] = useState<string | null>(null); // Fixed: Changed state to useState
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  const fetchBooths = async (userId: string) => {
    setLoadingBooths(true);
    setErrorBooths(null);
    try {
      const colRef = collection(db, "Clients", userId, "Booths");
      console.log("Querying Firestore at path:", colRef.path);
      const snapshot = await getDocs(colRef);
      console.log("Booths snapshot:", snapshot.docs);
      const boothData = snapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name || "Unnamed Booth",
        settings: doc.data().settings || {},
        created_at: doc.data().created_at || { seconds: 0, nanoseconds: 0 },
      })) as Booth[];
      console.log("Parsed booth data:", boothData);
      setBooths(boothData);
    } catch (error: any) {
      console.log("Error fetching booths:", error.message);
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

  const fetchRevenue = async (userId: string) => {
    setLoadingRevenue(true);
    setErrorRevenue(null);
    try {
      const revenue = await fetchTotalRevenueFromXendit(userId);
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
    if (!userIdentity) {
      console.log("No userId available");
      setAuthLoading(true);
      return;
    }
    setAuthLoading(false);
    console.log("Fetching booths and revenue for userId:", userId);
    fetchBooths(userId);
    fetchRevenue(userId);
  }, [userIdentity, userId]);

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
          background: "#202223",
          minHeight: "100vh",
        }}
      >
        <Spin tip="Loading user data..." style={{ color: "#fff" }} />
      </div>
    );
  }

  return (
    <div style={{ padding: 24, background: "#202223", minHeight: "100vh" }}>
      <Header />
      <Title level={2} style={{ color: "#fff" }}>
        Dashboard
      </Title>

      <Row gutter={[24, 24]}>
        {/* Total Revenue */}
        <Col xs={24} sm={12} md={8}>
          <Card
            title={<span style={{ color: "#fff" }}>Total Pendapatan</span>}
            bordered={false}
            loading={loadingRevenue}
            extra={<DollarOutlined style={{ color: "#fff" }} />}
            style={{
              textAlign: "center",
              background: "#2f2f2f",
              borderColor: "#2f2f2f",
            }}
            className="dark-card"
          >
            {loadingRevenue ? (
              <Skeleton.Input active style={{ width: 150 }} />
            ) : errorRevenue ? (
              <>
                <Text type="danger" style={{ color: "#ff4d4f" }}>
                  Failed to load
                </Text>
                <br />
                <Button
                  type="link"
                  onClick={() => userId && fetchRevenue(userId)}
                  style={{ padding: 0, color: "#1890ff" }}
                >
                  Retry
                </Button>
              </>
            ) : (
              <Title level={3} style={{ color: "#fff" }}>
                {formatRupiah(totalRevenue || 0)}
              </Title>
            )}
          </Card>
        </Col>

        {/* Booth Count */}
        <Col xs={24} sm={12} md={8}>
          <Card
            title={<span style={{ color: "#fff" }}>Jumlah Booth</span>}
            bordered={false}
            loading={loadingBooths}
            extra={<AppstoreAddOutlined style={{ color: "#fff" }} />}
            style={{
              textAlign: "center",
              background: "#2f2f2f",
              borderColor: "#2f2f2f",
            }}
            className="dark-card"
          >
            {loadingBooths ? (
              <Skeleton.Input active style={{ width: 50 }} />
            ) : errorBooths ? (
              <>
                <Text type="danger" style={{ color: "#ff4d4f" }}>
                  Failed to load
                </Text>
                <br />
                <Button
                  type="link"
                  onClick={() => userId && fetchBooths(userId)}
                  style={{ padding: 0, color: "#1890ff" }}
                >
                  Retry
                </Button>
              </>
            ) : (
              <Title level={3} style={{ color: "#fff" }}>
                {booths.length}
              </Title>
            )}
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        {/* Your Booths */}
        <Col xs={24}>
          <Card
            title={<span style={{ color: "#fff" }}>Your Booths</span>}
            bordered={false}
            loading={loadingBooths}
            extra={<TeamOutlined style={{ color: "#fff" }} />}
            style={{ background: "#2f2f2f", borderColor: "#2f2f2f" }}
            className="dark-card"
          >
            {loadingBooths ? (
              <Row gutter={[16, 16]}>
                {[...Array(3)].map((_, index) => (
                  <Col xs={24} sm={12} md={8} key={index}>
                    <Skeleton active paragraph={{ rows: 2 }} />
                  </Col>
                ))}
              </Row>
            ) : errorBooths ? (
              <div style={{ textAlign: "center" }}>
                <Empty
                  description={
                    <span style={{ color: "#fff" }}>Failed to load booths</span>
                  }
                />
                <Button
                  type="primary"
                  onClick={() => userId && fetchBooths(userId)}
                  style={{ background: "#1890ff", borderColor: "#1890ff" }}
                >
                  Retry
                </Button>
              </div>
            ) : booths.length === 0 ? (
              <Empty
                description={
                  <span style={{ color: "#fff" }}>No booths found</span>
                }
              />
            ) : (
              <Row gutter={[16, 16]}>
                {booths.map((booth) => (
                  <Col xs={24} sm={12} md={8} key={booth.id}>
                    <Card
                      hoverable
                      title={
                        <span style={{ color: "#fff" }}>{booth.name}</span>
                      }
                      style={{
                        height: "100%",
                        background: "#3f3f3f",
                        borderColor: "#3f3f3f",
                      }}
                      className="dark-card"
                      actions={[
                        <Button
                          key="settings"
                          icon={<SettingOutlined />}
                          onClick={() =>
                            navigate(`/booths/${booth.id}/settings`)
                          }
                          block
                          style={{ color: "#1890ff", borderColor: "#4f4f4f" }}
                        >
                          Settings
                        </Button>,
                        <Button
                          key="vouchers"
                          icon={<GiftOutlined />}
                          onClick={() =>
                            navigate(`/booths/${booth.id}/vouchers`)
                          }
                          block
                          style={{ color: "#1890ff", borderColor: "#4f4f4f" }}
                        >
                          Vouchers
                        </Button>,
                        <Button
                          key="backgrounds"
                          icon={<PictureOutlined />}
                          onClick={() =>
                            navigate(`/booths/${booth.id}/backgrounds`)
                          }
                          block
                          style={{ color: "#1890ff", borderColor: "#4f4f4f" }}
                        >
                          Backgrounds
                        </Button>,
                      ]}
                    >
                      <Text style={{ color: "#b0b0b0" }}>
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