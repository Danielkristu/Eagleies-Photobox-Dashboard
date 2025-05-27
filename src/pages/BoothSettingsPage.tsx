/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetIdentity } from "@refinedev/core";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  notification,
  Spin,
  InputNumber,
} from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import Header from "../components/Header";

const { Title, Text } = Typography;

interface BoothSettings {
  name: string;
  settings: {
    callback_url: string;
    dslrbooth_api: string;
    dslrbooth_password: string;
    price: number;
  };
}

interface UserIdentity {
  id: string;
  email: string;
  name: string;
}

const BoothSettingsPage: React.FC = () => {
  const { boothId } = useParams<{ boothId: string }>();
  const navigate = useNavigate();
  const { data: userIdentity } = useGetIdentity<UserIdentity>();
  const userId = userIdentity?.id;

  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // Fetch booth data
  const fetchBoothData = async () => {
    if (!userId || !boothId) return;
    setLoading(true);
    try {
      const boothRef = doc(db, "Clients", userId, "Booths", boothId);
      const boothSnap = await getDoc(boothRef);

      if (!boothSnap.exists()) {
        notification.error({
          message: "Error",
          description: "Booth not found.",
        });
        navigate("/");
        return;
      }

      const boothData = boothSnap.data() as BoothSettings;
      // Prepopulate form with fetched data
      form.setFieldsValue({
        name: boothData.name,
        callback_url: boothData.settings?.callback_url || "",
        dslrbooth_api: boothData.settings?.dslrbooth_api || "",
        dslrbooth_password: boothData.settings?.dslrbooth_password || "",
        price: boothData.settings?.price || 0,
      });
    } catch (error: any) {
      notification.error({
        message: "Error fetching booth data",
        description: error.message || "An error occurred while fetching booth data.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Save updated settings
  const handleSave = async (values: any) => {
    if (!userId || !boothId) return;
    setSaving(true);
    try {
      const boothRef = doc(db, "Clients", userId, "Booths", boothId);
      await updateDoc(boothRef, {
        name: values.name,
        settings: {
          callback_url: values.callback_url,
          dslrbooth_api: values.dslrbooth_api,
          dslrbooth_password: values.dslrbooth_password,
          price: values.price,
        },
      });
      notification.success({
        message: "Success",
        description: "Booth settings updated successfully.",
      });
    } catch (error: any) {
      notification.error({
        message: "Error saving settings",
        description: error.message || "An error occurred while saving settings.",
      });
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (userId && boothId) {
      fetchBoothData();
    }
  }, [userId, boothId]);

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: "center", background: "#202223", minHeight: "100vh" }}>
        <Spin tip="Loading booth settings..." style={{ color: "#fff" }} />
      </div>
    );
  }

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
      <Title level={2} style={{ color: "#fff" }}>Booth Settings</Title>
      <Text type="secondary" style={{ color: "#b0b0b0" }}>Booth ID: {boothId}</Text>
      <Card style={{ marginTop: 16, background: "#2f2f2f", borderColor: "#2f2f2f" }} className="dark-card">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{
            name: "",
            callback_url: "",
            dslrbooth_api: "",
            dslrbooth_password: "",
            price: 0,
          }}
        >
          <Form.Item
            label={<span style={{ color: "#fff" }}>Booth Name</span>}
            name="name"
            rules={[{ required: true, message: "Please enter the booth name" }]}
          >
            <Input
              placeholder="Enter booth name"
              style={{ background: "#3f3f3f", color: "#fff", borderColor: "#3f3f3f" }}
            />
          </Form.Item>
          <Form.Item
            label={<span style={{ color: "#fff" }}>Callback URL</span>}
            name="callback_url"
            rules={[{ required: true, message: "Please enter the callback URL" }]}
          >
            <Input
              placeholder="Enter callback URL"
              style={{ background: "#3f3f3f", color: "#fff", borderColor: "#3f3f3f" }}
            />
          </Form.Item>
          <Form.Item
            label={<span style={{ color: "#fff" }}>DSLRBooth API Key</span>}
            name="dslrbooth_api"
            rules={[{ required: true, message: "Please enter the DSLRBooth API key" }]}
          >
            <Input
              placeholder="Enter DSLRBooth API key"
              style={{ background: "#3f3f3f", color: "#fff", borderColor: "#3f3f3f" }}
            />
          </Form.Item>
          <Form.Item
            label={<span style={{ color: "#fff" }}>DSLRBooth Password</span>}
            name="dslrbooth_password"
            rules={[{ required: true, message: "Please enter the DSLRBooth password" }]}
          >
            <Input.Password
              placeholder="Enter DSLRBooth password"
              style={{ background: "#3f3f3f", color: "#fff", borderColor: "#3f3f3f" }}
            />
          </Form.Item>
          <Form.Item
            label={<span style={{ color: "#fff" }}>Price (IDR)</span>}
            name="price"
            rules={[{ required: true, message: "Please enter the price" }]}
          >
            <InputNumber
              min={0}
              style={{ width: "100%", background: "#3f3f3f", color: "#fff", borderColor: "#3f3f3f" }}
              placeholder="Enter price"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={saving}
              style={{ background: "#1890ff", borderColor: "#1890ff" }}
            >
              Save Settings
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default BoothSettingsPage;