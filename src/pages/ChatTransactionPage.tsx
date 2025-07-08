import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import {
  Table,
  Typography,
  Spin,
  Space,
  App as AntdApp,
  Select,
  DatePicker,
  Button,
  type DatePickerProps,
} from "antd";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useGetIdentity } from "@refinedev/core";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../firebase";
import { fetchInvoicesFromXendit } from "../utils/xendit";
import moment from "moment-timezone";

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

interface UserIdentity {
  id: string;
  name: string;
}

interface XenditInvoice {
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

const ChatTransactionsPage: React.FC = () => {
  const { data: userIdentity, isLoading: identityLoading } =
    useGetIdentity<UserIdentity>();
  const userId = userIdentity?.id;

  const { notification } = AntdApp.useApp();

  const [invoices, setInvoices] = useState<XenditInvoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredInvoices, setFilteredInvoices] = useState<XenditInvoice[]>([]);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<
    [moment.Moment, moment.Moment] | null
  >(null);
  const [tempDateRange, setTempDateRange] = useState<
    [moment.Moment, moment.Moment] | null
  >(null);
  const isFetchingRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (!userId || isFetchingRef.current) {
      setLoading(false);
      return;
    }

    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const invoices = await fetchInvoicesFromXendit(userId);
      setInvoices(invoices);
    } catch (err: unknown) {
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
      isFetchingRef.current = false;
    }
  }, [userId, notification]);

  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && userId && !isFetchingRef.current) {
        fetchData();
      }
    });

    return () => unsubscribe();
  }, [userId, fetchData]);

  useEffect(() => {
    let filtered = [...invoices];

    if (statusFilter) {
      filtered = filtered.filter((invoice) => invoice.status === statusFilter);
    }

    if (dateRange && dateRange[0] && dateRange[1]) {
      const startOfDayInJakarta = dateRange[0]
        .clone()
        .tz("Asia/Jakarta")
        .startOf("day");
      const endOfDayInJakarta = dateRange[1]
        .clone()
        .tz("Asia/Jakarta")
        .endOf("day");

      filtered = filtered.filter((invoice) => {
        if (!invoice.paid_at) return false;
        const invoiceDateInJakarta = moment
          .utc(invoice.paid_at)
          .tz("Asia/Jakarta");
        return (
          invoiceDateInJakarta.isSameOrAfter(startOfDayInJakarta) &&
          invoiceDateInJakarta.isSameOrBefore(endOfDayInJakarta)
        );
      });
    }

    setFilteredInvoices(filtered);
  }, [statusFilter, dateRange, invoices]);

  const handleStatusChange = (value: string) => {
    setStatusFilter(value === "all" ? null : value);
  };

  const handleApplyDateFilter = () => {
    if (tempDateRange && tempDateRange[0] && tempDateRange[1]) {
      const start = moment(tempDateRange[0]).tz("Asia/Jakarta").startOf("day");
      const end = moment(tempDateRange[1]).tz("Asia/Jakarta").endOf("day");

      setDateRange([start, end]);
    } else {
      notification.warning({
        message: "Invalid Date Range",
        description: "Please select both start and end dates.",
      });
    }
  };

  const handleClearDateFilter = () => {
    setTempDateRange(null);
    setDateRange(null);
  };

  const uniqueStatuses = Array.from(
    new Set(invoices.map((invoice) => invoice.status))
  );

  const columns = [
    {
      title: "Invoice ID",
      dataIndex: "external_id",
      key: "external_id",
      render: (value: string | undefined) => value || "N/A",
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number, record: XenditInvoice) => (
        <Text strong>
          Rp {amount ? amount.toLocaleString("id-ID") : "0"}{" "}
          {record.currency || "N/A"}
        </Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: uniqueStatuses.map((status) => ({
        text: status,
        value: status,
      })),
      onFilter: (value: any, record: { status: any; }) => record.status === value,
    },

    {
      title: "Paid At",
      dataIndex: "paid_at",
      key: "paid_at",
      render: (paid_at: string | undefined) =>
        paid_at
          ? moment.utc(paid_at).tz("Asia/Jakarta").format("DD MMM YYYY HH:mm")
          : "N/A",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (value: string | undefined) => value || "N/A",
    },
  ];

  const paidInvoicesByDate = filteredInvoices
    .filter((inv) => inv.status === "PAID" && inv.paid_at)
    .reduce<Record<string, number>>((acc, inv) => {
      const dateKey = moment
        .utc(inv.paid_at)
        .tz("Asia/Jakarta")
        .format("YYYY-MM-DD");
      acc[dateKey] = (acc[dateKey] || 0) + 1;
      return acc;
    }, {});

  const chartData = Object.entries(paidInvoicesByDate).map(([date, count]) => ({
    date,
    transactions: count,
  }));

  if (identityLoading) {
    return (
      <Spin
        size="large"
        style={{ display: "block", textAlign: "center", marginTop: "20vh" }}
      />
    );
  }

  return (
    <Space
      direction="vertical"
      size="large"
      style={{ width: "100%", padding: "20px" }}
    >
      <Title level={3}>Chat Transactions</Title>
      <Space direction="horizontal" size="middle">
        <Text>Filter by Date Range:</Text>
        <RangePicker
          value={tempDateRange}
          onChange={(dates: DatePickerProps["value"]) =>
            setTempDateRange(dates as [moment.Moment, moment.Moment] | null)
          }
          style={{ width: 250 }}
          placeholder={["Start Date", "End Date"]}
          presets={[
            {
              label: "Today",
              value: [
                moment.tz("Asia/Jakarta").startOf("day"),
                moment.tz("Asia/Jakarta").endOf("day"),
              ],
            },
            {
              label: "Last 7 Days",
              value: [
                moment.tz("Asia/Jakarta").subtract(6, "days").startOf("day"),
                moment.tz("Asia/Jakarta").endOf("day"),
              ],
            },
            {
              label: "This Month",
              value: [
                moment.tz("Asia/Jakarta").startOf("month"),
                moment.tz("Asia/Jakarta").endOf("month"),
              ],
            },
          ]}
        />
        <Button type="primary" onClick={handleApplyDateFilter}>
          Apply Date Filter
        </Button>
        <Button onClick={handleClearDateFilter}>Clear Date Filter</Button>
      </Space>
      <Space>
        <Text>Filter by Status:</Text>
        <Select
          value={statusFilter || "all"}
          onChange={(value) => setStatusFilter(value === "all" ? null : value)}
          style={{ width: 200 }}
          placeholder="Select status"
          allowClear
        >
          <Option value="all">All</Option>
          {uniqueStatuses.map((status) => (
            <Option key={status} value={status}>
              {status}
            </Option>
          ))}
        </Select>
      </Space>

      {loading ? (
        <Spin size="large" style={{ display: "block", textAlign: "center" }} />
      ) : error ? (
        <Text type="danger">Error: {error}</Text>
      ) : filteredInvoices.length === 0 ? (
        <Text type="secondary">
          No invoices to display for the selected filters.
        </Text>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="transactions" fill="#1890ff" />
            </BarChart>
          </ResponsiveContainer>

          <Table
            dataSource={filteredInvoices}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: true }}
          />
        </>
      )}
    </Space>
  );
};

export default ChatTransactionsPage;
