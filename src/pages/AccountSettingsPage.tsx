/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetIdentity, useLogout } from "@refinedev/core";
import { doc, getDoc, updateDoc } from "firebase/firestore";
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
} from "antd";
import { ArrowLeftOutlined, LogoutOutlined, UploadOutlined } from "@ant-design/icons"; // Added UploadOutlined
import Header from "../components/Header";

const { Title, Text } = Typography;

interface UserIdentity {
  id: string;
  email: string;
  name: string;
  role?: string;
  profilePictureUrl?: string;
}

const AccountSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: userIdentity, isLoading: identityLoading } = useGetIdentity<UserIdentity>();
  const { mutate: logout } = useLogout();
  const userId = userIdentity?.id;

  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(null);

  const fetchUserData = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data() as UserIdentity;
        form.setFieldsValue({
          name: userData.name,
          email: userData.email,
          role: userData.role || "client",
        });
        setProfilePictureUrl(userData.profilePictureUrl || null);
      }
    } catch (error: any) {
      notification.error({
        message: "Error fetching user data",
        description: error.message || "An error occurred while fetching user data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: { name: string; email: string; role?: string }) => {
    if (!userId) return;
    setSaving(true);
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        name: values.name,
        profilePictureUrl: profilePictureUrl,
      });
      notification.success({
        message: "Success",
        description: "Account settings updated successfully.",
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

  const handleUpload = async (file: File) => {
    if (!userId) return;

    const storageRef = ref(storage, `profilePictures/${userId}/${file.name}`);
    try {
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      setProfilePictureUrl(downloadUrl);
      notification.success({
        message: "Success",
        description: "Profile picture uploaded successfully.",
      });
    } catch (error: any) {
      notification.error({
        message: "Error uploading profile picture",
        description: error.message || "An error occurred while uploading the profile picture.",
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  if (identityLoading || loading) {
    return (
      <div style={{ padding: 24, textAlign: "center", background: "#202223", minHeight: "100vh" }}>
        <Spin tip="Loading account settings..." style={{ color: "#fff" }} />
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
      <Title level={2} style={{ color: "#fff" }}>Account Settings</Title>
      <Card style={{ marginTop: 16, background: "#2f2f2f", borderColor: "#2f2f2f" }} className="dark-card">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={{ name: "", email: "danielkristioutomo@gmail.com", role: "client" }}
        >
          <Form.Item
            label={<span style={{ color: "#fff" }}>Name</span>}
            name="name"
            rules={[{ required: true, message: "Please enter your name" }]}
          >
            <Input
              placeholder="Enter your name"
              style={{ background: "#3f3f3f", color: "#fff", borderColor: "#3f3f3f" }}
            />
          </Form.Item>
          <Form.Item
            label={<span style={{ color: "#fff" }}>Email</span>}
            name="email"
          >
            <Input
              placeholder="Enter your email"
              disabled
              style={{ background: "#3f3f3f", color: "#b0b0b0", borderColor: "#3f3f3f" }}
            />
          </Form.Item>
          <Form.Item
            label={<span style={{ color: "#fff" }}>Role</span>}
            name="role"
          >
            <Input
              placeholder="Enter your role"
              disabled
              style={{ background: "#3f3f3f", color: "#b0b0b0", borderColor: "#3f3f3f" }}
            />
          </Form.Item>
          <Form.Item
            label={<span style={{ color: "#fff" }}>Profile Picture</span>}
          >
            {profilePictureUrl ? (
              <img
                src={profilePictureUrl}
                alt="Profile"
                style={{ width: "100px", height: "100px", borderRadius: "50%", marginBottom: "10px" }}
              />
            ) : (
              <Text style={{ color: "#b0b0b0" }}>No profile picture uploaded</Text>
            )}
            <Upload
              beforeUpload={(file) => {
                handleUpload(file);
                return false;
              }}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />} style={{ background: "#1890ff", borderColor: "#1890ff", color: "#fff" }}>
                Upload Picture
              </Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={saving}
              style={{ background: "#1890ff", borderColor: "#1890ff" }}
            >
              Save Changes
            </Button>
          </Form.Item>
        </Form>
        <Button
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          style={{ marginTop: 16, background: "#2f2f2f", borderColor: "#2f2f2f", color: "#fff" }}
        >
          Logout
        </Button>
      </Card>
    </div>
  );
};

export default AccountSettingsPage;