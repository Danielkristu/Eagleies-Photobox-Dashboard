/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/HomePage.tsx
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
import { db } from "../firebase"; // Ensure this path is correct
import { fetchTotalRevenueFromXendit } from "../utils/xendit"; // Ensure this path is correct

// Header component is assumed to be handled by the main layout (e.g., ThemedLayoutV2 in App.tsx)

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
    if (!userIdentity || !userIdentity.id) {
      setAuthLoading(true);
      return;
    }
    setAuthLoading(false);
    fetchBoothsData(userIdentity.id);
    fetchRevenueData(userIdentity.id);
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
          // background: "#202223", // REMOVE: Rely on layout background
          minHeight: "100vh", // Can keep for full height before content loads
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin tip="Loading user data..." />{" "}
        {/* Spin color will be from theme */}
      </div>
    );
  }

  return (
    // REMOVE explicit background, rely on layout for overall background
    // Keep padding for content spacing
    <div
      style={{
        padding: 24 /* minHeight: "100vh" // Usually not needed if layout handles height */,
      }}
    >
      <Title level={2} style={{ marginBottom: 24 }}>
        {" "}
        {/* REMOVE color: "#fff" */}
        Welcome, User CLient
      </Title>

      <Row gutter={[24, 24]}>
        {/* Total Revenue */}
        <Col xs={24} sm={12} md={8}>
          <Card
            title="Total Pendapatan" // REMOVE <span style={{ color: "#fff" }}>
            bordered={false}
            extra={<DollarOutlined />} // REMOVE style={{ color: "#fff" }}
            style={{ textAlign: "center" /* REMOVE background: "#2f2f2f" */ }}
          >
            {loadingRevenue ? (
              <Skeleton.Input
                active
                style={{ width: 150, display: "block", margin: "auto" }}
              />
            ) : errorRevenue ? (
              <>
                <Text type="danger">
                  {" "}
                  {/* style={{ color: "#ff4d4f" }} is default for type="danger" */}
                  Failed to load
                </Text>
                <br />
                <Button
                  type="link"
                  onClick={() =>
                    userIdentity?.id && fetchRevenueData(userIdentity.id)
                  }
                  // style={{ padding: 0, color: "#1890ff" }} // type="link" usually gets themed color
                >
                  Retry
                </Button>
              </>
            ) : (
              <Title level={3} style={{ margin: 0 }}>
                {" "}
                {/* REMOVE color: "#fff" */}
                {formatRupiah(totalRevenue || 0)}
              </Title>
            )}
          </Card>
        </Col>

        {/* Booth Count */}
        <Col xs={24} sm={12} md={8}>
          <Card
            title="Jumlah Booth" // REMOVE <span style={{ color: "#fff" }}>
            bordered={false}
            extra={<AppstoreAddOutlined />} // REMOVE style={{ color: "#fff" }}
            style={{ textAlign: "center" /* REMOVE background: "#2f2f2f" */ }}
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
                  // style={{ padding: 0, color: "#1890ff" }}
                >
                  Retry
                </Button>
              </>
            ) : (
              <Title level={3} style={{ margin: 0 }}>
                {" "}
                {/* REMOVE color: "#fff" */}
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
            title="Your Booths" // REMOVE <span style={{ color: "#fff" }}>
            bordered={false}
            extra={<TeamOutlined />} // REMOVE style={{ color: "#fff" }}
            // style={{ background: "#2f2f2f" }} // REMOVE
          >
            {loadingBooths ? (
              <Row gutter={[16, 16]}>
                {[...Array(booths.length > 0 ? booths.length : 2)].map(
                  (
                    _,
                    index // Show 2 skeletons if no booths yet
                  ) => (
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
                />{" "}
                {/* Use Text type="secondary" or rely on Empty's theme */}
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
              <Row gutter={[16, 16]}>
                {booths.map((booth) => (
                  <Col xs={24} sm={12} md={8} lg={6} key={booth.id}>
                    <Card
                      hoverable
                      title={booth.name} // REMOVE <span style={{ color: "#fff" }}>
                      style={{
                        height: "100%",
                        // background: "#3f3f3f", // REMOVE
                        // borderColor: "#3f3f3f", // REMOVE
                        display: "flex",
                        flexDirection: "column",
                      }}
                      bodyStyle={{
                        flexGrow: 1,
                        // color: "#b0b0b0", // REMOVE, let theme handle text color in card body
                        paddingTop: 16,
                        paddingBottom: 16,
                      }}
                      actions={[
                        <Button
                          key="settings"
                          icon={<SettingOutlined />}
                          onClick={() =>
                            navigate(`/booths/${booth.id}/settings`)
                          }
                          type="text" // type="text" is good for actions
                          // style={{ color: "#1890ff", fontSize: "14px" }} // color will be from theme for text buttons
                        >
                          Settings
                        </Button>,
                        <Button
                          key="vouchers"
                          icon={<GiftOutlined />}
                          onClick={() =>
                            navigate(`/booths/${booth.id}/vouchers`)
                          }
                          type="text"
                          // style={{ color: "#1890ff", fontSize: "14px" }}
                        >
                          Vouchers
                        </Button>,
                        <Button
                          key="backgrounds"
                          icon={<PictureOutlined />}
                          onClick={() =>
                            navigate(`/booths/${booth.id}/backgrounds`)
                          }
                          type="text"
                          // style={{ color: "#1890ff", fontSize: "14px" }}
                        >
                          Backgrounds
                        </Button>,
                      ]}
                    >
                      <Text type="secondary">
                        {" "}
                        {/* Use Text with type="secondary" or rely on inherited card body color */}
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
