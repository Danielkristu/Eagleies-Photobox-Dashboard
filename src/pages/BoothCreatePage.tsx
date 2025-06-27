import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, Form, Input, Button, Typography, notification } from "antd";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useGetIdentity } from "@refinedev/core";

const { Title } = Typography;

type UserIdentity = {
  id: string;
  [key: string]: any;
};

const BoothCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { data: userIdentity } = useGetIdentity<UserIdentity>();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { name: string }) => {
    if (!userIdentity?.id) {
      notification.error({ message: "User not authenticated" });
      return;
    }
    setLoading(true);
    try {
      const colRef = collection(db, "Clients", userIdentity.id, "Booths");
      await addDoc(colRef, {
        name: values.name,
        created_at: serverTimestamp(),
        settings: {},
      });
      notification.success({ message: "Booth created successfully!" });
      navigate("/");
    } catch (error: any) {
      notification.error({ message: "Failed to create booth", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 16 }}>
      <Card bordered>
        <Title level={3} style={{ marginBottom: 24 }}>
          Create New Booth
        </Title>
        <Form layout="vertical" onFinish={onFinish} requiredMark>
          <Form.Item
            label="Booth Name"
            name="name"
            rules={[{ required: true, message: "Please enter a booth name" }]}
          >
            <Input placeholder="Enter booth name" autoFocus maxLength={40} />
          </Form.Item>
          <div style={{ display: "flex", justifyContent: "center", width: "100%", gap: 12 }}>
            <Button type="primary" htmlType="submit" loading={loading} style={{ minWidth: 160 }}>
              Create Booth
            </Button>
            <Button type="default" variant="outlined" color="danger" onClick={() => navigate("/")} style={{ minWidth: 140 }}>
              Cancel
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default BoothCreatePage;
