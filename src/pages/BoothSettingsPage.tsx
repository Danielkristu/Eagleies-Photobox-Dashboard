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
// import Header from "../components/Header"; // Remove if handled by layout

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
        navigate("/"); // Or a more appropriate error/redirect path
        return;
      }

      const boothData = boothSnap.data() as BoothSettings;
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
  }, [userId, boothId, form]); // Added form to dependencies for setFieldsValue

  if (loading) {
    return (
      // Consistent loading style with BoothBackgroundsPage
      <div style={{ padding: 24, textAlign: "center", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Spin tip="Loading booth settings..." />
      </div>
    );
  }

  return (
    // Consistent page padding, rely on layout for overall background
    <div style={{ padding: 24 }}>
      {/* <Header /> Remove if handled by layout */}
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/")} // Consider navigating to a more specific "back" path if needed
        style={{ marginBottom: 16 }}
      >
        Back to Dashboard
      </Button>
      <Title level={2}>Booth Settings</Title>
      <Text type="secondary">Booth ID: {boothId}</Text>
      <Card style={{ marginTop: 16 }}> {/* Remove explicit dark styles */}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            label="Booth Name" // Rely on global theme for label color
            name="name"
            rules={[{ required: true, message: "Please enter the booth name" }]}
          >
            <Input placeholder="Enter booth name" /> {/* Rely on global theme for input style */}
          </Form.Item>
          <Form.Item
            label="Callback URL"
            name="callback_url"
            rules={[{ required: true, message: "Please enter the callback URL" }]}
          >
            <Input placeholder="Enter callback URL" />
          </Form.Item>
          <Form.Item
            label="DSLRBooth API Key"
            name="dslrbooth_api"
            rules={[{ required: true, message: "Please enter the DSLRBooth API key" }]}
          >
            <Input placeholder="Enter DSLRBooth API key" />
          </Form.Item>
          <Form.Item
            label="DSLRBooth Password"
            name="dslrbooth_password"
            rules={[{ required: true, message: "Please enter the DSLRBooth password" }]}
          >
            <Input.Password placeholder="Enter DSLRBooth password" />
          </Form.Item>
          <Form.Item
            label="Price (IDR)"
            name="price"
            rules={[{ required: true, message: "Please enter the price" }]}
          >
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              placeholder="Enter price"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary" // Standard primary button
              htmlType="submit"
              loading={saving}
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