/* eslint-disable react-hooks/exhaustive-deps */
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
  const [boothCode, setBoothCode] = useState<string>("");

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

      const boothData = boothSnap.data() as BoothSettings & {
        boothCode?: string;
      };
      form.setFieldsValue({
        name: boothData.name,
        callback_url: boothData.settings?.callback_url || "",
        dslrbooth_api: boothData.settings?.dslrbooth_api || "",
        dslrbooth_password: boothData.settings?.dslrbooth_password || "",
        price: boothData.settings?.price || 0,
      });
      setBoothCode(boothData.boothCode || "");
    } catch (error: any) {
      notification.error({
        message: "Error fetching booth data",
        description:
          error.message || "An error occurred while fetching booth data.",
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
        description:
          error.message || "An error occurred while saving settings.",
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
        onClick={() => navigate("/")}
        style={{ marginBottom: 16 }}
      >
        Back to Dashboard
      </Button>
      <Title level={2}>Booth Settings</Title>
      <Text type="secondary">Booth ID: {boothId}</Text>
      <Card style={{ marginTop: 16 }}>
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item
            label="Booth Name" // Rely on global theme for label color
            name="name"
            rules={[{ required: true, message: "Please enter the booth name" }]}
          >
            <Input placeholder="Enter booth name" />
            {/* Rely on global theme for input style */}
          </Form.Item>
          <Form.Item
            label="Callback URL"
            name="callback_url"
            rules={[
              { required: true, message: "Please enter the callback URL" },
            ]}
          >
            <Input placeholder="Enter callback URL" />
          </Form.Item>
          <Form.Item
            label="DSLRBooth API Key"
            name="dslrbooth_api"
            rules={[
              { required: true, message: "Please enter the DSLRBooth API key" },
            ]}
          >
            <Input placeholder="Enter DSLRBooth API key" />
          </Form.Item>
          <Form.Item
            label="DSLRBooth Password"
            name="dslrbooth_password"
            rules={[
              {
                required: true,
                message: "Please enter the DSLRBooth password",
              },
            ]}
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
      {/* Installation Section (single, full-width, with copy icons, theme-aware) */}
      <Card
        style={{
          marginTop: 16,
        }}
      >
        <Title level={4} style={{ margin: 0, color: "var(--ant-color-text)" }}>
          Installation
        </Title>
        <Text
          type="secondary"
          style={{ fontSize: 15, color: "var(--ant-color-text-secondary)" }}
        >
          Use these details to connect your photobooth device or software.
        </Text>
        <div
          style={{
            marginTop: 18,
            display: "flex",
            flexDirection: "column",
            gap: 18,
            maxWidth: 520,
          }}
        >
          {/* Booth Code Row */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Text
              strong
              style={{ color: "var(--ant-color-text)", minWidth: 110 }}
            >
              Booth Code
            </Text>
            <Input
              value={boothCode || "XXXX-0000"}
              readOnly
              style={{
                background: "var(--ant-color-bg-container)",
                color: "var(--ant-color-text)",
                border: "1px solid var(--ant-color-border)",
                borderRadius: 6,
                fontWeight: 600,
                fontFamily: "monospace",
                letterSpacing: 2,
                fontSize: 16,
                flex: 1,
                minWidth: 0,
                boxShadow: "none",
              }}
              bordered={false}
              aria-label="Booth Code"
            />
            <Button
              icon={
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="9"
                    y="9"
                    width="10"
                    height="10"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <rect
                    x="5"
                    y="5"
                    width="10"
                    height="10"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                </svg>
              }
              type="default"
              size="middle"
              style={{ minWidth: 44 }}
              onClick={() => {
                navigator.clipboard.writeText(boothCode || "XXXX-0000");
                notification.success({ message: "Booth code copied!" });
              }}
              aria-label="Copy Booth Code"
            >
              Copy
            </Button>
          </div>
          {/* Callback URL Row */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Text
              strong
              style={{ color: "var(--ant-color-text)", minWidth: 110 }}
            >
              Callback URL
            </Text>
            <Input
              value={"https://dev.eagleies.com/xendit_webhook"}
              readOnly
              style={{
                background: "var(--ant-color-bg-container)",
                color: "var(--ant-color-text)",
                border: "1px solid var(--ant-color-border)",
                borderRadius: 6,
                fontFamily: "monospace",
                fontSize: 15,
                flex: 1,
                minWidth: 0,
                boxShadow: "none",
              }}
              bordered={false}
              aria-label="Callback URL"
            />
            <Button
              icon={
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="9"
                    y="9"
                    width="10"
                    height="10"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <rect
                    x="5"
                    y="5"
                    width="10"
                    height="10"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                </svg>
              }
              type="default"
              size="middle"
              style={{ minWidth: 44 }}
              onClick={() => {
                navigator.clipboard.writeText(
                  "https://dev.eagleies.com/xendit_webhook"
                );
                notification.success({ message: "Callback URL copied!" });
              }}
              aria-label="Copy Callback URL"
            >
              Copy
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BoothSettingsPage;
