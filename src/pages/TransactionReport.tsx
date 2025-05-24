/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback } from "react";
import {
  Table,
  DatePicker,
  Select,
  Typography,
  Row,
  Col,
  Card,
  Spin,
  message,
} from "antd";
import { Bar } from "react-chartjs-2";
import dayjs from "dayjs";
import { fetchXenditTransactions } from "../services/xenditService";
import { getBoothId } from "../hooks/useBoothId";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Registrasi elemen ChartJS yang diperlukan
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const { RangePicker } = DatePicker;
const { Option } = Select;

export const TransactionReport = () => {
  const boothId = getBoothId();
  const [data, setData] = useState<any[]>([]);
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [range, setRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  >(null);

  const [loading, setLoading] = useState(false);

  // Fungsi fetch data dari Xendit
  const fetchData = useCallback(async () => {
    if (!boothId) return;

    setLoading(true);

    try {
      // Untuk filters:
      const filters: Record<string, string> = {};
      if (status) filters.statuses = status;
      if (range && range[0] !== null && range[1] !== null) {
        filters.created_after = range[0].startOf("day").toISOString();
        filters.created_before = range[1].endOf("day").toISOString();
      }

      const txs = await fetchXenditTransactions(boothId, filters);

      if (!Array.isArray(txs)) {
        console.error("❌ Data transaksi bukan array:", txs);
        setData([]);
        setLoading(false);
        return;
      }

      const cleanData = txs.map((tx) => ({
        id: tx.id,
        amount: tx.amount,
        created: tx.created,
        status: tx.status,
      }));

      setData(cleanData);
    } catch (error) {
      console.error("❌ Error fetch data:", error);
      message.error("Gagal mengambil data transaksi Xendit.");
    } finally {
      setLoading(false);
    }
  }, [boothId, status, range]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Hitung data untuk grafik
  const grouped = data.reduce<Record<string, { count: number; total: number }>>(
    (acc, tx) => {
      const date = tx.created ? tx.created.substring(0, 10) : "Unknown";
      if (!acc[date]) acc[date] = { count: 0, total: 0 };
      acc[date].count++;
      acc[date].total += tx.amount ?? 0;
      return acc;
    },
    {}
  );

  const sortedDates = Object.keys(grouped).sort();
  const chartData = {
    labels: sortedDates,
    datasets: [
      {
        label: "Jumlah Transaksi",
        data: sortedDates.map((d) => grouped[d].count),
        backgroundColor: "rgba(54, 162, 235, 0.5)",
        yAxisID: "y1",
      },
      {
        label: "Total Amount (Rp)",
        data: sortedDates.map((d) => grouped[d].total),
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        yAxisID: "y2",
      },
    ],
  };
  console.log("🔎 Data yang di-render di tabel dan grafik:", data);
  console.log("🔎 Data untuk grafik:", chartData);

  return (
    <>
      <Typography.Title level={3}>
        📡 Laporan Transaksi dari Xendit
      </Typography.Title>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col>
          <Select
            allowClear
            placeholder="Filter Status"
            style={{ width: 180 }}
            value={status}
            onChange={(val) => setStatus(val)}
          >
            <Option value="PAID">PAID</Option>
            <Option value="EXPIRED">EXPIRED</Option>
            <Option value="FAILED">FAILED</Option>
            <Option value="PENDING">PENDING</Option>
          </Select>
        </Col>
        <Col>
          <RangePicker
            onChange={(val) => setRange(val)}
            allowEmpty={[true, true]}
            style={{ width: 280 }}
          />
        </Col>
      </Row>

      <Card style={{ marginBottom: 24, height: 350 }}>
        <Bar
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y1: {
                type: "linear",
                position: "left",
                beginAtZero: true,
                title: {
                  display: true,
                  text: "Jumlah Transaksi",
                },
              },
              y2: {
                type: "linear",
                position: "right",
                beginAtZero: true,
                grid: {
                  drawOnChartArea: false,
                },
                title: {
                  display: true,
                  text: "Total Amount (Rp)",
                },
              },
            },
            plugins: {
              legend: {
                position: "top",
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    if (context.dataset.label === "Total Amount (Rp)") {
                      return `${
                        context.dataset.label
                      }: Rp ${context.parsed.y.toLocaleString("id-ID")}`;
                    }
                    return `${context.dataset.label}: ${context.parsed.y}`;
                  },
                },
              },
            },
          }}
        />
      </Card>

      <Spin spinning={loading}>
        <Table
          dataSource={data}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          columns={[
            { title: "Invoice ID", dataIndex: "id" },
            {
              title: "Amount",
              dataIndex: "amount",
              render: (amt: number) => `Rp ${amt.toLocaleString("id-ID")}`,
            },
            { title: "Status", dataIndex: "status" },
            {
              title: "Tanggal",
              dataIndex: "created",
              render: (val: string) => dayjs(val).format("YYYY-MM-DD HH:mm"),
            },
          ]}
        />
      </Spin>
    </>
  );
};
