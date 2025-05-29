/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetIdentity } from "@refinedev/core";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
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
import {
  ArrowLeftOutlined,
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
} from "@ant-design/icons";
import moment from "moment";
// import Header from "../components/Header"; // Remove if handled by layout

const { Title, Text } = Typography;

interface Voucher {
  id: string; // Should match the document ID, which is the code
  code: string;
  discount: number;
  expiry_date?: { seconds: number; nanoseconds: number } | Date; // Allow Date for Firestore writes
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
      const vouchersRef = collection(
        db,
        "Clients",
        userId,
        "Booths",
        boothId,
        "vouchers"
      );
      const snapshot = await getDocs(vouchersRef);
      const voucherData = snapshot.docs.map((doc) => ({
        id: doc.id,
        code: doc.id, // Assuming voucher code is the document ID
        ...doc.data(),
      })) as Voucher[];
      setVouchers(voucherData);
    } catch (error: any) {
      notification.error({
        message: "Error fetching vouchers",
        description:
          error.message || "An error occurred while fetching vouchers.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddVoucher = async (values: any) => {
    if (!userId || !boothId) return;
    try {
      const voucherCode = values.code.toUpperCase();
      const voucherRef = doc(
        db,
        "Clients",
        userId,
        "Booths",
        boothId,
        "vouchers",
        voucherCode
      );
      await setDoc(voucherRef, {
        // code: voucherCode, // Not needed if doc ID is the code
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
        description:
          error.message || "An error occurred. Ensure the code is unique.",
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
        expiry_date: values.expiry_date
          ? values.expiry_date.toDate()
          : selectedVoucher.expiry_date, // Preserve if not changed
        is_active: values.is_active,
      });
      notification.success({
        message: "Success",
        description: "Voucher updated successfully.",
      });
      setIsEditModalVisible(false);
      form.resetFields(); // Reset form after successful edit
      fetchVouchers();
    } catch (error: any) {
      notification.error({
        message: "Error updating voucher",
        description: error.message || "An error occurred while updating.",
      });
    }
  };

  const toggleStatus = async (voucherCode: string, checked: boolean) => {
    if (!userId || !boothId) return;
    try {
      const voucherRef = doc(
        db,
        "Clients",
        userId,
        "Booths",
        boothId,
        "vouchers",
        voucherCode
      );
      await updateDoc(voucherRef, { is_active: checked });
      notification.success({
        message: "Success",
        description: `Voucher status changed to ${checked ? "ON" : "OFF"}.`,
      });
      fetchVouchers(); // Refresh list
    } catch (error: any) {
      notification.error({
        message: "Error updating status",
        description: error.message || "An error occurred.",
      });
    }
  };

  const handleDeleteVoucher = async (voucherCode: string) => {
    if (!userId || !boothId) return;
    try {
      const voucherRef = doc(
        db,
        "Clients",
        userId,
        "Booths",
        boothId,
        "vouchers",
        voucherCode
      );
      await deleteDoc(voucherRef);
      notification.success({
        message: "Success",
        description: "Voucher deleted successfully.",
      });
      fetchVouchers(); // Refresh list
    } catch (error: any) {
      notification.error({
        message: "Error deleting voucher",
        description: error.message || "An error occurred.",
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
      <div
        style={{
          padding: 24,
          textAlign: "center",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spin tip="Loading vouchers..." />
      </div>
    );
  }

  const columns = [
    {
      title: "Code",
      dataIndex: "code",
      key: "code" /* Rely on global theme for text color */,
    },
    {
      title: "Discount (IDR)",
      dataIndex: "discount",
      key: "discount",
      render: (value: number) =>
        new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          minimumFractionDigits: 0,
        }).format(value || 0),
    },
    {
      title: "Expiry Date",
      dataIndex: "expiry_date",
      key: "expiry_date",
      render: (value?: { seconds: number; nanoseconds: number } | Date) => {
        if (!value) return "N/A";
        // Handle both Firestore Timestamp and Date objects (from picker before save)
        const date = (value as any).seconds
          ? moment.unix((value as any).seconds)
          : moment(value as Date);
        return date.isValid() ? date.format("MMMM D, YYYY") : "N/A";
      },
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      render: (isActive: boolean, record: Voucher) => (
        <Switch
          checked={isActive}
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
                expiry_date: record.expiry_date
                  ? (record.expiry_date as any).seconds
                    ? moment.unix((record.expiry_date as any).seconds)
                    : moment(record.expiry_date as Date)
                  : null,
                is_active: record.is_active,
              });
              setIsEditModalVisible(true);
            }}
            style={{ marginRight: 8 }} // type="link" should get color from theme
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure to delete this voucher?"
            onConfirm={() => handleDeleteVoucher(record.code)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" icon={<DeleteOutlined />} danger>
              {" "}
              {/* danger prop handles red color */}
              Delete
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {" "}
      {/* Rely on layout for overall background */}
      {/* <Header /> Remove if handled by layout */}
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/")}
        style={{ marginBottom: 16 }}
      >
        Back to Dashboard
      </Button>
      <Title level={2}>Vouchers</Title> {/* Rely on theme for color */}
      <Text type="secondary">Booth ID: {boothId}</Text>{" "}
      {/* Rely on theme for color */}
      <Card style={{ marginTop: 16 }}>
        {" "}
        {/* Remove explicit dark styles */}
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            form.resetFields(); // Reset form for add modal
            setIsModalVisible(true);
          }}
          style={{ marginBottom: 16 }} // Standard primary button
        >
          Add Voucher
        </Button>
        <Table
          dataSource={vouchers}
          columns={columns}
          rowKey="code" // Using code as key, assuming it's unique
          loading={loading}
          style={{ marginTop: 16 }} // Remove explicit dark styles
        />
      </Card>
      <Modal
        title="Add New Voucher" // Rely on theme for modal title color
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null} // Custom footer buttons in form
        // Remove explicit dark styles for Modal
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddVoucher}
          initialValues={{ is_active: true }}
        >
          <Form.Item
            label="Code" // Rely on theme for label color
            name="code"
            rules={[
              { required: true, message: "Please enter the voucher code" },
            ]}
            normalize={(value) => (value ? value.toUpperCase() : value)}
          >
            <Input placeholder="Enter voucher code (e.g., VOUCHER123)" />{" "}
            {/* Rely on theme */}
          </Form.Item>
          <Form.Item
            label="Discount (IDR)"
            name="discount"
            rules={[
              { required: true, message: "Please enter the discount amount" },
            ]}
          >
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              placeholder="Enter discount"
            />
          </Form.Item>
          <Form.Item
            label="Expiry Date"
            name="expiry_date"
            rules={[
              { required: true, message: "Please select the expiry date" },
            ]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Active"
            name="is_active"
            valuePropName="checked"
            // initialValue={true} // Moved to Form initialValues for clarity
          >
            <Switch checkedChildren="ON" unCheckedChildren="OFF" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Add Voucher
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Edit Voucher"
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleEditVoucher}>
          <Form.Item
            label="Code"
            name="code"
            rules={[
              { required: true, message: "Please enter the voucher code" },
            ]}
          >
            <Input placeholder="Enter voucher code" disabled />{" "}
            {/* Code usually not editable */}
          </Form.Item>
          <Form.Item
            label="Discount (IDR)"
            name="discount"
            rules={[
              { required: true, message: "Please enter the discount amount" },
            ]}
          >
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              placeholder="Enter discount"
            />
          </Form.Item>
          <Form.Item
            label="Expiry Date"
            name="expiry_date"
            rules={[
              { required: true, message: "Please select the expiry date" },
            ]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Active" name="is_active" valuePropName="checked">
            <Switch checkedChildren="ON" unCheckedChildren="OFF" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save Changes
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BoothVouchersPage;
