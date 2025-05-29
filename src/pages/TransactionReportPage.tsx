import { Typography, Spin, Card, Table, Space, App as AntdApp } from "antd";
import React, { useEffect, useState, useCallback } from "react";
import { useGetIdentity, useNavigation } from "@refinedev/core";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import moment from "moment";
import { Column } from "@ant-design/plots";

const { Title, Text } = Typography;

interface UserIdentity {
  id: string;
  name: string;
}

interface XenditTransaction {
  id: string;
  external_id: string;
  amount: number;
  status: string;
  currency: string;
  payer_email?: string;
  description?: string;
  created?: string;
  paid_at?: string;
}

interface FetchTransactionsResponseData {
  data: XenditTransaction[];
}

const TransactionReportPage: React.FC = () => {
  const { data: userIdentity, isLoading: identityLoading } = useGetIdentity<UserIdentity>();
  const userId = userIdentity?.id;
  const { push } = useNavigation();

  const { notification } = AntdApp.useApp();

  const [transactions, setTransactions] = useState<XenditTransaction[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const auth = getAuth(app);
      const user = auth.currentUser;
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Fetch Xendit API key from Firestore
      const clientRef = doc(db, "Clients", userId);
      const clientSnap = await getDoc(clientRef);
      if (!clientSnap.exists()) {
        throw new Error("Client data not found in Firestore.");
      }
      const clientData = clientSnap.data();
      const xenditApiKey = clientData?.xenditSettings?.xenditApiKey || clientData?.xenditApiKey;
      if (!xenditApiKey) {
        throw new Error("Xendit API key not found in Firestore.");
      }

      // Call Xendit API directly
      const base64ApiKey = Buffer.from(xenditApiKey + ":").toString("base64");
      const xenditApiUrl = "https://api.xendit.co/v2/invoices";
      const params = {
        limit: 100,
        status: "PAID",
      };

      const response = await fetch(xenditApiUrl, {
        method: "GET",
        headers: {
          Authorization: `Basic ${base64ApiKey}`,
          "Content-Type": "application/json",
        },
        params,
      });

      if (!response.ok) {
        throw new Error(`Xendit API error: ${response.statusText}`);
      }

      const result: FetchTransactionsResponseData = await response.json();
      const fetchedTransactions = result.data || [];

      let totalRevenueCalc = 0;
      fetchedTransactions.forEach((transaction: XenditTransaction) => {
        if (transaction.status === "PAID") {
          totalRevenueCalc += transaction.amount;
        }
      });

      setTransactions(fetchedTransactions);
      setTotalRevenue(totalRevenueCalc);
    } catch (err: unknown) {
      console.error("Error fetching transactions:", err);
      let errorMessage = "Could not fetch transaction data.";
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }

      notification.error({
        message: "API Error",
        description: errorMessage,
      });
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userId, notification]);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthLoading(false);
        if (userId) {
          fetchData();
        }
      } else {
        setAuthLoading(false);
        push("/login");
      }
    });

    return () => unsubscribe();
  }, [userId, fetchData, push]);

  const columns = [
    {
      title: "Invoice ID",
      dataIndex: "external_id",
      key: "external_id",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => (
        <Text strong>Rp {amount.toLocaleString("id-ID")}</Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => <Text type="success">{status}</Text>,
    },
    {
      title: "Paid At",
      dataIndex: "paid_at",
      key: "paid_at",
      render: (paid_at: string | undefined) =>
        paid_at ? moment(paid_at).format("DD MMM YYYY HH:mm") : "N/A",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
    },
  ];

  const chartData = transactions
    .map((transaction) => ({
      date: moment(transaction.paid_at).format("YYYY-MM-DD"),
      amount: transaction.amount,
    }))
    .reduce((acc: { date: string; value: number }[], item) => {
      const existing = acc.find((d) => d.date === item.date);
      if (existing) {
        existing.value += item.amount;
      } else {
        acc.push({ date: item.date, value: item.amount });
      }
      return acc;
    }, [])
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const chartConfig = {
    data: chartData,
    xField: "date",
    yField: "value",
    seriesField: "date",
    color: ({ date }: { date: string }) => {
      const month = moment(date).month();
      const colors = ["#1890FF", "#2FC25B", "#FACC14", "#F04864", "#8543E0", "#13C2C2"];
      return colors[month % colors.length];
    },
    label: {
      position: "middle",
      style: {
        fill: "#FFFFFF",
        opacity: 0.6,
      },
      content: (item: { value: number }) => `Rp ${item.value.toLocaleString("id-ID")}`,
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
      },
    },
    meta: {
      date: {
        alias: "Date",
      },
      value: {
        alias: "Revenue (Rp)",
      },
    },
    tooltip: {
      formatter: (data: { date: string; value: number }) => {
        return { name: moment(data.date).format("DD MMM YYYY"), value: `Rp ${data.value.toLocaleString("id-ID")}` };
      },
    },
  };

  if (identityLoading || authLoading) {
    return <Spin size="large" style={{ display: "block", textAlign: "center", marginTop: "20vh" }} />;
  }

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      <Title level={3}>Transaction Report</Title>

      <Card title="Total Revenue Trend">
        {loading ? (
          <Spin size="large" style={{ display: "block", textAlign: "center" }} />
        ) : error ? (
          <Text type="danger">Error: {error}</Text>
        ) : chartData.length > 0 ? (
          <Column {...chartConfig} />
        ) : (
          <Text type="secondary">No data to display.</Text>
        )}
      </Card>

      <Card title="Transaction Details">
        {loading ? (
          <Spin size="large" style={{ display: "block", textAlign: "center" }} />
        ) : error ? (
          <Text type="danger">Error: {error}</Text>
        ) : (
          <Table
            dataSource={transactions}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: true }}
          />
        )}
      </Card>
    </Space>
  );
};

export default TransactionReportPage;