/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Switch,
  Card,
  Typography,
  notification,
  Spin,
  Popconfirm,
} from "antd";
import { ArrowLeftOutlined, PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface Background {
  id: string;
  name: string;
  url: string;
  is_active: boolean;
  created_at: { seconds: number; nanoseconds: number };
}

interface UserIdentity {
  id: string;
  email: string;
  name: string;
}

const BoothBackgroundsPage: React.FC = () => {
  const { boothId } = useParams<{ boothId: string }>();
  const navigate = useNavigate();
  const { data: userIdentity } = useGetIdentity<UserIdentity>();
  const userId = userIdentity?.id;

  const [backgrounds, setBackgrounds] = useState<Background[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [selectedBackground, setSelectedBackground] = useState<Background | null>(null);
  const [form] = Form.useForm();

  const fetchBackgrounds = async () => {
    if (!userId || !boothId) return;
    setLoading(true);
    try {
      const backgroundsRef = collection(db, "Clients", userId, "Booths", boothId, "backgrounds");
      const snapshot = await getDocs(backgroundsRef);
      const backgroundData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Background[];
      console.log("Fetched backgrounds:", backgroundData);
      setBackgrounds(backgroundData);
    } catch (error: any) {
      notification.error({
        message: "Error fetching backgrounds",
        description: error.message || "An error occurred while fetching backgrounds.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddBackground = async (values: any) => {
    if (!userId || !boothId) return;
    try {
      const backgroundId = Date.now().toString();
      const backgroundRef = doc(db, "Clients", userId, "Booths", boothId, "backgrounds", backgroundId);
      await setDoc(backgroundRef, {
        name: values.name,
        url: values.url,
        is_active: values.is_active,
        created_at: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
      });
      notification.success({
        message: "Success",
        description: "Background added successfully.",
      });
      setIsModalVisible(false);
      form.resetFields();
      fetchBackgrounds();
    } catch (error: any) {
      notification.error({
        message: "Error adding background",
        description: error.message || "An error occurred while adding the background.",
      });
    }
  };

  const handleEditBackground = async (values: any) => {
    if (!userId || !boothId || !selectedBackground) return;
    try {
      const backgroundRef = doc(
        db,
        "Clients",
        userId,
        "Booths",
        boothId,
        "backgrounds",
        selectedBackground.id
      );
      await updateDoc(backgroundRef, {
        name: values.name,
        url: values.url,
        is_active: values.is_active,
      });
      notification.success({
        message: "Success",
        description: "Background updated successfully.",
      });
      setIsEditModalVisible(false);
      fetchBackgrounds();
    } catch (error: any) {
      notification.error({
        message: "Error updating background",
        description: error.message || "An error occurred while updating the background.",
      });
    }
  };

  const toggleStatus = async (backgroundId: string, checked: boolean) => {
    if (!userId || !boothId) return;
    try {
      const backgroundRef = doc(db, "Clients", userId, "Booths", boothId, "backgrounds", backgroundId);
      await updateDoc(backgroundRef, { is_active: checked });
      notification.success({
        message: "Success",
        description: `Background status changed to ${checked ? "ON" : "OFF"}.`,
      });
      fetchBackgrounds();
    } catch (error: any) {
      notification.error({
        message: "Error updating status",
        description: error.message || "An error occurred while updating the status.",
      });
    }
  };

  const handleDeleteBackground = async (backgroundId: string) => {
    if (!userId || !boothId) return;
    try {
      const backgroundRef = doc(db, "Clients", userId, "Booths", boothId, "backgrounds", backgroundId);
      await deleteDoc(backgroundRef);
      notification.success({
        message: "Success",
        description: "Background deleted successfully.",
      });
      fetchBackgrounds();
    } catch (error: any) {
      notification.error({
        message: "Error deleting background",
        description: error.message || "An error occurred while deleting the background.",
      });
    }
  };

  useEffect(() => {
    if (userId && boothId) {
      fetchBackgrounds();
    }
  }, [userId, boothId]);

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: "center" }}>
        <Spin tip="Loading backgrounds..." />
      </div>
    );
  }

  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    {
      title: "URL",
      dataIndex: "url",
      key: "url",
      render: (url: string) => (
        <a href={url} target="_blank" rel="noopener noreferrer">
          View Background
        </a>
      ),
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "is_active",
      render: (value: boolean, record: Background) => (
        <Switch
          checked={value}
          onChange={(checked) => toggleStatus(record.id, checked)}
          checkedChildren="ON"
          unCheckedChildren="OFF"
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: Background) => (
        <>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => {
              setSelectedBackground(record);
              form.setFieldsValue({
                name: record.name,
                url: record.url,
                is_active: record.is_active,
              });
              setIsEditModalVisible(true);
            }}
            style={{ marginRight: 8 }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure to delete this background?"
            onConfirm={() => handleDeleteBackground(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" icon={<DeleteOutlined />} danger>
              Delete
            </Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/")}
        style={{ marginBottom: 16 }}
      >
        Back to Dashboard
      </Button>
      <Title level={2}>Backgrounds</Title>
      <Text type="secondary">Booth ID: {boothId}</Text>
      <Card style={{ marginTop: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setIsModalVisible(true)}
          style={{ marginBottom: 16 }}
        >
          Add Background
        </Button>
        <Table
          dataSource={backgrounds}
          columns={columns}
          rowKey="id"
          loading={loading}
          style={{ marginTop: 16 }}
        />
      </Card>
      <Modal
        title="Add New Background"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddBackground}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter the background name" }]}
          >
            <Input placeholder="Enter background name (e.g., Summer Theme)" />
          </Form.Item>
          <Form.Item
            label="Background URL"
            name="url"
            rules={[{ required: true, message: "Please enter the background URL" }]}
          >
            <Input placeholder="Enter background image URL" />
          </Form.Item>
          <Form.Item label="Active" name="is_active" valuePropName="checked" initialValue={false}>
            <Switch checkedChildren="ON" unCheckedChildren="OFF" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Add Background
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Edit Background"
        open={isEditModalVisible}
        onCancel={() => {
          setIsEditModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleEditBackground}>
          <Form.Item
            label="Name"
            name="name"
            rules={[{ required: true, message: "Please enter the background name" }]}
          >
            <Input placeholder="Enter background name" />
          </Form.Item>
          <Form.Item
            label="Background URL"
            name="url"
            rules={[{ required: true, message: "Please enter the background URL" }]}
          >
            <Input placeholder="Enter background image URL" />
          </Form.Item>
          <Form.Item label="Active" name="is_active" valuePropName="checked" initialValue={false}>
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

export default BoothBackgroundsPage;