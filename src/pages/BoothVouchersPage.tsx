import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetIdentity } from "@refinedev/core";
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  DatePicker,
  Switch,
  Card,
  Typography,
  notification,
  Spin,
  Popconfirm,
} from "antd";
import { ArrowLeftOutlined, PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import moment from "moment";
import Header from "../components/Header";

const { Title, Text } = Typography;

interface Voucher {
  id: string;
  code: string;
  discount: number;
  expiry_date?: { seconds: number; nanoseconds: number };
  is_active: boolean;
  created_at: { seconds: number; nanoseconds: number };
}

interface UserIdentity {
  id: string;
  email: string;
  name: string;
}

const BoothVouchersPage: React.FC = () => {
  const { boothId } = useParams<{ boothId: string }>();
  const navigate = useNavigate();
  const { data: userIdentity } = useGetIdentity<UserIdentity>();
  const userId = userIdentity?.id;

  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [form] = Form.useForm();

  const fetchVouchers = async () => {
    if (!userId || !boothId) return;
    setLoading(true);
    try {
      const vouchersRef = collection(db, "Clients", userId, "Booths", boothId, "vouchers");
      const snapshot = await getDocs(vouchersRef);
      const voucherData = snapshot.docs.map((doc) => ({
        id: doc.id,
        code: doc.id,
        ...doc.data(),
      })) as Voucher[];
      console.log("Fetched vouchers:", voucherData);
      setVouchers(voucherData);
    } catch (error: any) {
      notification.error({
        message: "Error fetching vouchers",
        description: error.message || "An error occurred while fetching vouchers.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddVoucher = async (values: any) => {
    if (!userId || !boothId) return;
    try {
      const voucherCode = values.code.toUpperCase();
      const voucherRef = doc(db, "Clients", userId, "Booths", boothId, "vouchers", voucherCode);
      await setDoc(voucherRef, {
        discount: values.discount,
        expiry_date: values.expiry_date ? values.expiry_date.toDate() : null,
        is_active: values.is_active,
        created_at: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
      });
      notification.success({
        message: "Success",
        description: "Voucher added successfully.",
      });
      setIsModalVisible(false);
      form.resetFields();
      fetchVouchers();
    } catch (error: any) {
      notification.error({
        message: "Error adding voucher",
        description: error.message || "An error occurred while adding the voucher. Ensure the code is unique.",
      });
    }
  };

  const handleEditVoucher = async (values: any) => {
    if (!userId || !boothId || !selectedVoucher) return;
    try {
      const voucherRef = doc(
        db,
        "Clients",
        userId,
        "Booths",
        boothId,
        "vouchers",
        selectedVoucher.code
      );
      await updateDoc(voucherRef, {
        discount: values.discount,
        expiry_date: values.expiry_date ? values.expiry_date.toDate() : selectedVoucher.expiry_date,
        is_active: values.is_active,
      });
      notification.success({
        message: "Success",
        description: "Voucher updated successfully.",
      });
      setIsEditModalVisible(false);
      fetchVouchers();
    } catch (error: any) {
      notification.error({
        message: "Error updating voucher",
        description: error.message || "An error occurred while updating the voucher.",
      });
    }
  };

  const toggleStatus = async (voucherId: string, checked: boolean) => {
    if (!userId || !boothId) return;
    try {
      const voucherRef = doc(db, "Clients", userId, "Booths", boothId, "vouchers", voucherId);
      await updateDoc(voucherRef, { is_active: checked });
      notification.success({
        message: "Success",
        description: `Voucher status changed to ${checked ? "ON" : "OFF"}.`,
      });
      fetchVouchers();
    } catch (error: any) {
      notification.error({
        message: "Error updating status",
        description: error.message || "An error occurred while updating the status.",
      });
    }
  };

  const handleDeleteVoucher = async (voucherId: string) => {
    if (!userId || !boothId) return;
    try {
      const voucherRef = doc(db, "Clients", userId, "Booths", boothId, "vouchers", voucherId);
      await deleteDoc(voucherRef);
      notification.success({
        message: "Success",
        description: "Voucher deleted successfully.",
      });
      fetchVouchers();
    } catch (error: any) {
      notification.error({
        message: "Error deleting voucher",
        description: error.message || "An error occurred while deleting the voucher.",
      });
    }
  };

  useEffect(() => {
    if (userId && boothId) {
      fetchVouchers();
    }
  }, [userId, boothId]);

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: "center", background: "#202223", minHeight: "100vh" }}>
        <Spin tip="Loading vouchers..." style={{ color: "#fff" }} />
      </div>
    );
  }

  const columns = [
    { title: "Code", dataIndex: "code", key: "code", render: (text: string) => <span style={{ color: "#fff" }}>{text}</span> },
    {
      title: "Discount (IDR)",
      dataIndex: "discount",
      key: "discount",
      render: (value: number) => (
        <span style={{ color: "#fff" }}>
          {new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
          }).format(value || 0)}
        </span>
      ),
    },
    {
      title: "Expiry Date",
      dataIndex: "expiry_date",
      key: "expiry_date",
      render: (value: { seconds: number; nanoseconds: number } | undefined) => (
        <span style={{ color: "#fff" }}>
          {value && value.seconds ? moment.unix(value.seconds).format("MMMM D, YYYY") : "N/A"}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      render: (value: boolean, record: Voucher) => (
        <Switch
          checked={value}
          onChange={(checked) => toggleStatus(record.code, checked)}
          checkedChildren="ON"
          unCheckedChildren="OFF"
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Voucher) => (
        <>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedVoucher(record);
              form.setFieldsValue({
                code: record.code,
                discount: record.discount,
                expiry_date: record.expiry_date ? moment.unix(record.expiry_date.seconds) : null,
                is_active: record.is_active,
              });
              setIsEditModalVisible(true);
            }}
            style={{ marginRight: 8, color: "#1890ff" }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure to delete this voucher?"
            onConfirm={() => handleDeleteVoucher(record.code)}
            okText="Yes"
            cancelText="No"
            overlayStyle={{ backgroundColor: "#2f2f2f", color: "#fff" }}
          >
            <Button type="link" icon={<DeleteOutlined />} style={{ color: "#ff4d4f" }}>
              Delete
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: "#202223", minHeight: "100vh" }}>
      <Header />
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/")}
        style={{ marginBottom: 16, background: "#2f2f2f", borderColor: "#2f2f2f", color: "#fff" }}
      >
        Back to Dashboard
      </Button>
      <Title level={2} style={{ color: "#fff" }}>Vouchers</Title>
      <Text type="secondary" style={{ color: "#b0b0b0" }}>Booth ID: {boothId}</Text>
      <Card style={{ marginTop: 16, background: "#2f2f2f", borderColor: "#2f2f2f" }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
          style={{ marginBottom: 16, background: "#1890ff", borderColor: "#1890ff" }}
        >
          Add Voucher
        </Button>
        <Table
          dataSource={vouchers}
          columns={columns}
          rowKey="code"
          loading={loading}
          style={{ marginTop: 16, background: "#2f2f2f", color: "#fff" }}
          rowClassName={() => "dark-row"}
          pagination={{ style: { background: "#2f2f2f", color: "#fff" } }}
        />
      </Card>
      <Modal
        title={<span style={{ color: "#fff" }}>Add New Voucher</span>}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        style={{ background: "#2f2f2f" }}
        wrapClassName="dark-modal"
      >
        <Form form={form} layout="vertical" onFinish={handleAddVoucher}>
          <Form.Item
            label={<span style={{ color: "#fff" }}>Code</span>}
            name="code"
            rules={[{ required: true, message: "Please enter the voucher code" }]}
            normalize={(value) => (value ? value.toUpperCase() : value)}
          >
            <Input
              placeholder="Enter voucher code (e.g., VOUCHER123)"
              style={{ background: "#3f3f3f", color: "#fff", borderColor: "#3f3f3f" }}
            />
          </Form.Item>
          <Form.Item
            label={<span style={{ color: "#fff" }}>Discount (IDR)</span>}
            name="discount"
            rules={[{ required: true, message: "Please enter the discount amount" }]}
          >
            <InputNumber
              min={0}
              style={{ width: "100%", background: "#3f3f3f", color: "#fff", borderColor: "#3f3f3f" }}
              placeholder="Enter discount"
            />
          </Form.Item>
          <Form.Item
            label={<span style={{ color: "#fff" }}>Expiry Date</span>}
            name="expiry_date"
            rules={[{ required: true, message: "Please select the expiry date" }]}
          >
            <DatePicker
              style={{ width: "100%", background: "#3f3f3f", color: "#fff", borderColor: "#3f3f3f" }}
            />
          </Form.Item>
          <Form.Item
            label={<span style={{ color: "#fff" }}>Active</span>}
            name="is_active"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="ON" unCheckedChildren="OFF" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{ background: "#1890ff", borderColor: "#1890ff" }}
            >
              Add Voucher
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={<span style={{ color: "#fff" }}>Edit Voucher</span>}
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        style={{ background: "#2f2f2f" }}
        wrapClassName="dark-modal"
      >
        <Form form={form} layout="vertical" onFinish={handleEditVoucher}>
          <Form.Item
            label={<span style={{ color: "#fff" }}>Code</span>}
            name="code"
            rules={[{ required: true, message: "Please enter the voucher code" }]}
            normalize={(value) => (value ? value.toUpperCase() : value)}
          >
            <Input
              placeholder="Enter voucher code"
              disabled
              style={{ background: "#3f3f3f", color: "#b0b0b0", borderColor: "#3f3f3f" }}
            />
          </Form.Item>
          <Form.Item
            label={<span style={{ color: "#fff" }}>Discount (IDR)</span>}
            name="discount"
            rules={[{ required: true, message: "Please enter the discount amount" }]}
          >
            <InputNumber
              min={0}
              style={{ width: "100%", background: "#3f3f3f", color: "#fff", borderColor: "#3f3f3f" }}
              placeholder="Enter discount"
            />
          </Form.Item>
          <Form.Item
            label={<span style={{ color: "#fff" }}>Expiry Date</span>}
            name="expiry_date"
            rules={[{ required: true, message: "Please select the expiry date" }]}
          >
            <DatePicker
              style={{ width: "100%", background: "#3f3f3f", color: "#fff", borderColor: "#3f3f3f" }}
            />
          </Form.Item>
          <Form.Item
            label={<span style={{ color: "#fff" }}>Active</span>}
            name="is_active"
            valuePropName="checked"
            initialValue={false}
          >
            <Switch checkedChildren="ON" unCheckedChildren="OFF" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              style={{ background: "#1890ff", borderColor: "#1890ff" }}
            >
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BoothVouchersPage;