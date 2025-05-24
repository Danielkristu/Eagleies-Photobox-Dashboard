/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Card, Col, Row, Typography, notification, Empty, Spin } from "antd";
import { fetchTotalRevenueFromXendit, fetchBoothsData } from "../utils/xendit";
import { useGetIdentity } from "@refinedev/core";
import {
  DollarOutlined,
  AppstoreAddOutlined,
  TeamOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

interface UserIdentity {
  id: string;
  // tambahkan properti lain jika ada
}

export default function HomePage() {
  const [booths, setBooths] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [loadingBooths, setLoadingBooths] = useState<boolean>(true);
  const [loadingRevenue, setLoadingRevenue] = useState<boolean>(true);

  const { data: userIdentity } = useGetIdentity<UserIdentity>();
  const userId = userIdentity?.id;

  useEffect(() => {
    if (!userId) return;

    fetchBoothsData(userId)
      .then((booths) => {
        setBooths(booths);
        setLoadingBooths(false);
      })
      .catch(() => {
        notification.error({
          message: "Error fetching booths",
          description: "There was an issue fetching your booths.",
        });
        setLoadingBooths(false);
      });
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    fetchTotalRevenueFromXendit(userId)
      .then((revenue) => {
        setTotalRevenue(revenue);
        setLoadingRevenue(false);
      })
      .catch(() => {
        notification.error({
          message: "Error fetching revenue",
          description: "There was an issue fetching the total revenue.",
        });
        setLoadingRevenue(false);
      });
  }, [userId]);

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Dashboard</Title>

      <Row gutter={24}>
        <Col xs={24} sm={12} md={8}>
          <Card
            title="Total Pendapatan"
            bordered={false}
            loading={loadingRevenue}
            extra={<DollarOutlined />}
            style={{ textAlign: "center" }}
          >
            <Title level={3}>{formatRupiah(totalRevenue)}</Title>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={8}>
          <Card
            title="Jumlah Booth"
            bordered={false}
            loading={loadingBooths}
            extra={<AppstoreAddOutlined />}
            style={{ textAlign: "center" }}
          >
            <Title level={3}>{booths.length}</Title>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card
            title="Your Booths"
            bordered={false}
            loading={loadingBooths}
            extra={<TeamOutlined />}
            style={{ minHeight: "300px" }}
          >
            {loadingBooths ? (
              <div style={{ textAlign: "center", paddingTop: 50 }}>
                <Spin tip="Loading booths..." />
              </div>
            ) : booths.length === 0 ? (
              <Empty description="No booths found" />
            ) : (
              booths.map((booth) => (
                <Card.Grid
                  key={booth.id}
                  style={{ width: "100%", marginBottom: 10, cursor: "pointer" }}
                  onClick={() => {
                    // contoh navigasi ke detail booth
                    // navigate(`/booth/${booth.id}`);
                  }}
                >
                  <Title level={4} style={{ margin: 0 }}>
                    {booth.name}
                  </Title>
                </Card.Grid>
              ))
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
