import { Table, Typography, Spin, Space, App as AntdApp, Select, DatePicker, Button } from "antd";
import React, { useEffect, useState, useCallback, useRef } from "react";
import { useGetIdentity } from "@refinedev/core";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { app } from "../firebase";
import { fetchInvoicesFromXendit } from "../utils/xendit";
import moment from "moment-timezone"; // Use moment-timezone

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
  const { data: userIdentity, isLoading: identityLoading } = useGetIdentity<UserIdentity>();
  const userId = userIdentity?.id;

  const { notification } = AntdApp.useApp();

  const [invoices, setInvoices] = useState<XenditInvoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredInvoices, setFilteredInvoices] = useState<XenditInvoice[]>([]);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[moment.Moment, moment.Moment] | null>(null);
  const [tempDateRange, setTempDateRange] = useState<[moment.Moment, moment.Moment] | null>(null); // Temporary state for date range
  const isFetchingRef = useRef(false); // Prevent multiple fetch calls

  const fetchData = useCallback(async () => {
    if (!userId || isFetchingRef.current) {
      console.log("Skipping fetchData: No userId or fetch in progress", { userId, isFetching: isFetchingRef.current });
      setLoading(false);
      return;
    }

    console.log("Current userId:", userId); // Log userId to verify
    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const invoices = await fetchInvoicesFromXendit(userId);
      console.log("Raw API response:", invoices); // Log raw API response
      setInvoices(invoices);
      setFilteredInvoices(invoices); // Initialize filtered invoices with all data
    } catch (err: unknown) {
      console.error("Error fetching invoices:", err);
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
      console.log("Auth state changed:", user ? user.uid : "No user");
      if (user && userId && !isFetchingRef.current) {
        fetchData();
      }
    });

    return () => unsubscribe();
  }, [userId, fetchData]);

  // Apply filters when status or date range changes
  useEffect(() => {
    let filtered = [...invoices];

    console.log("Initial invoices count:", invoices.length); // Log initial data count
    console.log("Initial invoices:", invoices); // Log initial data

    if (statusFilter) {
      filtered = filtered.filter((invoice) => invoice.status === statusFilter);
    }

    if (dateRange) {
      const [startDate, endDate] = dateRange.map(date => moment.tz(date, "Asia/Jakarta")); // Convert to moment-timezone
      filtered = filtered.filter((invoice) => {
        if (!invoice.paid_at) {
          console.log("No paid_at for invoice:", invoice);
          return false;
        }
        const invoiceDate = moment.tz(invoice.paid_at, "YYYY-MM-DDTHH:mm:ss.SSSZ", "Asia/Jakarta"); // Explicit UTC format
        const startDateAdjusted = startDate.clone().startOf("day").utcOffset("+07:00"); // Ensure WIB start
        const endDateAdjusted = endDate.clone().endOf("day").utcOffset("+07:00"); // Ensure WIB end
        const isWithinRange = invoiceDate.isSameOrAfter(startDateAdjusted) && invoiceDate.isSameOrBefore(endDateAdjusted);
        console.log(
          "Raw paid_at:", invoice.paid_at,
          "Parsed Invoice date:", invoiceDate.format(),
          "Range:", startDateAdjusted.format(), "to", endDateAdjusted.format(),
          "Within Range:", isWithinRange
        );
        return isWithinRange;
      });
    }

    console.log("Filtered invoices count:", filtered.length); // Log the number of filtered invoices
    console.log("Filtered invoices:", filtered); // Log filtered data
    setFilteredInvoices(filtered);
  }, [statusFilter, dateRange, invoices]);

  const handleStatusChange = (value: string) => {
    setStatusFilter(value === "all" ? null : value);
  };

  const handleApplyDateFilter = () => {
    if (tempDateRange && tempDateRange[0] && tempDateRange[1]) {
      console.log("Applying date range:", tempDateRange.map(date => date.format()));
      setDateRange(tempDateRange.map(date => moment.tz(date, "Asia/Jakarta"))); // Convert to moment-timezone
    } else {
      notification.warning({ message: "Invalid Date Range", description: "Please select both start and end dates." });
    }
  };

  const handleClearDateFilter = () => {
    setTempDateRange(null);
    setDateRange(null);
  };

  const uniqueStatuses = Array.from(new Set(invoices.map((invoice) => invoice.status)));

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
        <Text strong>Rp {amount ? amount.toLocaleString("id-ID") : "0"} {record.currency || "N/A"}</Text>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (value: string | undefined) => value || "N/A",
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
        <div style={{ padding: 8 }}>
          <Select
            value={selectedKeys[0] || "all"}
            onChange={(value) => setSelectedKeys(value ? [value] : [])}
            onBlur={confirm}
            style={{ width: 200, marginBottom: 8, display: "block" }}
            placeholder="Filter by status"
            allowClear
          >
            <Option value="all">All</Option>
            {uniqueStatuses.map((status) => (
              <Option key={status} value={status}>
                {status}
              </Option>
            ))}
          </Select>
        </div>
      ),
      onFilter: (value: string, record: XenditInvoice) => value === "all" || record.status === value,
    },
    {
      title: "Paid At",
      dataIndex: "paid_at",
      key: "paid_at",
      render: (paid_at: string | undefined) =>
        paid_at ? moment.tz(paid_at, "YYYY-MM-DDTHH:mm:ss.SSSZ", "Asia/Jakarta").format("DD MMM YYYY HH:mm") : "N/A",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (value: string | undefined) => value || "N/A",
    },
  ];

  if (identityLoading) {
    return <Spin size="large" style={{ display: "block", textAlign: "center", marginTop: "20vh" }} />;
  }

  return (
    <Space direction="vertical" size="large" style={{ width: "100%", padding: "20px" }}>
      <Title level={3}>Chat Transactions</Title>
      <Space direction="horizontal" size="middle">
        <Text>Filter by Date Range:</Text>
        <RangePicker
          value={tempDateRange}
          onChange={(dates) => setTempDateRange(dates as [moment.Moment, moment.Moment] | null)}
          style={{ width: 250 }}
          placeholder={["Start Date", "End Date"]}
          presets={[
            {
              label: "Today",
              value: () => [moment.tz("Asia/Jakarta"), moment.tz("Asia/Jakarta")],
            },
            {
              label: "Last 7 Days",
              value: () => [moment.tz("Asia/Jakarta").subtract(7, "days"), moment.tz("Asia/Jakarta")],
            },
            {
              label: "This Month",
              value: () => [moment.tz("Asia/Jakarta").startOf("month"), moment.tz("Asia/Jakarta").endOf("month")],
            },
          ]}
        />
        <Button type="primary" onClick={handleApplyDateFilter}>
          Apply Date Filter
        </Button>
        <Button onClick={handleClearDateFilter}>
          Clear Date Filter
        </Button>
      </Space>
      {loading ? (
        <Spin size="large" style={{ display: "block", textAlign: "center" }} />
      ) : error ? (
        <Text type="danger">Error: {error}</Text>
      ) : filteredInvoices.length === 0 ? (
        <Text type="secondary">No invoices to display.</Text>
      ) : (
        <Table
          dataSource={filteredInvoices}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: true }}
          key={dateRange?.toString()} // Force re-render on date range change
        />
      )}
    </Space>
  );
};

export default ChatTransactionsPage;