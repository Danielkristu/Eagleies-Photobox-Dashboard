/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetIdentity } from "@refinedev/core";
import { doc, getDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase";
import {
  Form,
  Input,
  Button,
  Card,
  Typography,
  notification,
  Spin,
  Upload,
  Row,
  Col,
  Avatar,
} from "antd";
import {
  ArrowLeftOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Title } = Typography;

interface UserIdentity {
  id: string;
  email: string;
  name: string;
  role?: string;
  profilePictureUrl?: string;
  phoneNumber?: string;
}

const AccountSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: userIdentity, isLoading: identityLoading } =
    useGetIdentity<UserIdentity>();
  const userId = userIdentity?.id;

  const [form] = Form.useForm();
  const [xenditForm] = Form.useForm(); // Form for Xendit API Key
  const [fetchingData, setFetchingData] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [savingXenditKey, setSavingXenditKey] = useState<boolean>(false); // Separate loading state for Xendit save
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(
    null
  );
  const [xenditApiKey, setXenditApiKey] = useState<string | null>(null); // State to hold Xendit API Key

  useEffect(() => {
    if (!userIdentity && !identityLoading) {
      return;
    }
  }, [userIdentity, identityLoading, navigate]);

  const fetchUserData = async () => {
    if (!userId) return;
    setFetchingData(true);
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const rawData = userSnap.data();
        const userData = {
          id: userId,
          email: rawData.email || userIdentity?.email || "",
          name: rawData.name || userIdentity?.name || "",
          role: rawData.role || "client",
          profilePictureUrl: rawData.profilePictureUrl || undefined,
          phoneNumber: rawData.phoneNumber || "",
        };
        form.setFieldsValue({
          name: userData.name,
          email: userData.email,
          role: userData.role,
          phoneNumber: userData.phoneNumber,
        });
        setProfilePictureUrl(userData.profilePictureUrl || null);
      } else {
        form.setFieldsValue({
          name: userIdentity?.name || "",
          email: userIdentity?.email || "",
          role: "client",
          phoneNumber: "",
        });
        setProfilePictureUrl(userIdentity?.profilePictureUrl || null);
        notification.info({
          message: "New User Profile",
          description: "Please complete your account details.",
        });
      }

      // Fetch Xendit API Key from clients collection
      const clientRef = doc(db, "clients", userId);
      const clientSnap = await getDoc(clientRef);
      if (clientSnap.exists()) {
        const clientData = clientSnap.data();
        const apiKey = clientData.xendit_api_key || "";
        xenditForm.setFieldsValue({ xenditApiKey: apiKey });
        setXenditApiKey(apiKey);
      } else {
        xenditForm.setFieldsValue({ xenditApiKey: "" });
        setXenditApiKey("");
      }
    } catch (error: any) {
      notification.error({
        message: "Error fetching user data",
        description: error.message || "An error occurred.",
      });
    } finally {
      setFetchingData(false);
    }
  };

  const handleSave = async (values: {
    name: string;
    email: string;
    role?: string;
    phoneNumber?: string;
  }) => {
    if (!userId) return;
    setSaving(true);
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        name: values.name,
        profilePictureUrl: profilePictureUrl || "",
        phoneNumber: values.phoneNumber || "",
      });
      notification.success({
        message: "Success",
        description: "Account settings updated successfully.",
      });
    } catch (error: any) {
      notification.error({
        message: "Error saving settings",
        description: error.message || "An error occurred.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveXenditKey = async (values: { xenditApiKey: string }) => {
    if (!userId) return;
    setSavingXenditKey(true);
    try {
      const clientRef = doc(db, "clients", userId);
      await updateDoc(clientRef, {
        xendit_api_key: values.xenditApiKey || "",
      });
      setXenditApiKey(values.xenditApiKey);
      notification.success({
        message: "Success",
        description: "Xendit API Key updated successfully.",
      });
    } catch (error: any) {
      notification.error({
        message: "Error saving Xendit API Key",
        description: error.message || "An error occurred.",
      });
    } finally {
      setSavingXenditKey(false);
    }
  };

  const handleUpload = async (file: File) => {
    if (!userId) return false;

    const storageRef = ref(storage, `profilePictures/${userId}/${file.name}`);
    try {
      setSaving(true);
      await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(storageRef);

      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { profilePictureUrl: imageUrl });

      setProfilePictureUrl(imageUrl);
      notification.success({
        message: "Success",
        description: "Profile picture uploaded successfully.",
      });
    } catch (error: any) {
      notification.error({
        message: "Error uploading profile picture",
        description: error.message || "An error occurred.",
      });
    } finally {
      setSaving(false);
    }
    return false;
  };

  useEffect(() => {
    if (userId) {
      fetchUserData();

      // Real-time listener for user data
      const userRef = doc(db, "users", userId);
      const unsubscribeUser = onSnapshot(
        userRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfilePictureUrl(data.profilePictureUrl || null);
            form.setFieldsValue({
              name: data.name,
              phoneNumber: data.phoneNumber,
            });
          }
        },
        (error) => {
          console.error("Error with Firestore onSnapshot (users):", error);
          notification.error({
            message: "Real-time sync error",
            description: "Could not sync account updates.",
          });
        }
      );

      // Real-time listener for client data (Xendit API Key)
      const clientRef = doc(db, "clients", userId);
      const unsubscribeClient = onSnapshot(
        clientRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const apiKey = data.xendit_api_key || "";
            xenditForm.setFieldsValue({ xenditApiKey: apiKey });
            setXenditApiKey(apiKey);
          }
        },
        (error) => {
          console.error("Error with Firestore onSnapshot (clients):", error);
          notification.error({
            message: "Real-time sync error",
            description: "Could not sync Xendit API Key.",
          });
        }
      );

      return () => {
        unsubscribeUser();
        unsubscribeClient();
      };
    }
  }, [userId]);

  if (identityLoading || fetchingData) {
    return (
      <div
        style={{
          padding: 24,
          textAlign: "center",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" tip="Loading account details..." />
      </div>
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/")}
        style={{ marginBottom: 16 }}
      >
        Back
      </Button>
      <Title level={2}>Account Settings</Title>
      <Card style={{ marginTop: 16 }}>
        <Row gutter={[32, 24]}>
          <Col xs={24} md={12}>
            <Form form={form} layout="vertical" onFinish={handleSave}>
              <Form.Item
                label="Name"
                name="name"
                rules={[{ required: true, message: "Please enter your name" }]}
              >
                <Input placeholder="Enter your name" />
              </Form.Item>
              <Form.Item label="Email" name="email">
                <Input disabled />
              </Form.Item>
              <Form.Item label="Role" name="role">
                <Input disabled />
              </Form.Item>
              <Form.Item label="Phone Number" name="phoneNumber">
                <Input placeholder="Enter your phone number" />
              </Form.Item>
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={saving}>
                  Save Changes
                </Button>
              </Form.Item>
            </Form>
          </Col>
          <Col xs={24} md={12}>
            <div style={{ textAlign: "center", paddingTop: "20px" }}>
              <Avatar
                size={200}
                src={profilePictureUrl}
                icon={!profilePictureUrl && <UserOutlined />}
                style={{
                  marginBottom: 24,
                  border: "2px solid #f0f0f0",
                }}
              />
              <div>
                <Upload
                  beforeUpload={handleUpload}
                  showUploadList={false}
                  accept="image/png, image/jpeg, image/gif"
                >
                  <Button icon={<UploadOutlined />}>Change Picture</Button>
                </Upload>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Xendit API Key Settings */}
      <Card style={{ marginTop: 24 }}>
        <Title level={4}>Xendit API Key Settings</Title>
        <Form
          form={xenditForm}
          layout="vertical"
          onFinish={handleSaveXenditKey}
        >
          <Form.Item
            label="Xendit API Key"
            name="xenditApiKey"
            rules={[
              { required: true, message: "Please enter your Xendit API Key" },
            ]}
          >
            <Input placeholder="Enter your Xendit API Key" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={savingXenditKey}>
              Save Xendit API Key
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default AccountSettingsPage;