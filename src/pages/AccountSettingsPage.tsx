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
  Avatar, // Using Ant Design Avatar for placeholder consistency
} from "antd";
import {
  ArrowLeftOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";
// import Header from "../components/Header"; // REMOVE if handled by layout

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
    useGetIdentity<UserIdentity>(); // Renamed isLoading to avoid conflict
  const userId = userIdentity?.id;

  const [form] = Form.useForm();
  const [fetchingData, setFetchingData] = useState<boolean>(true); // For initial data fetch
  const [saving, setSaving] = useState<boolean>(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(
    null
  );
  // const [phoneNumber, setPhoneNumber] = useState<string>(""); // phoneNumber will be handled by form

  useEffect(() => {
    if (!userIdentity && !identityLoading) {
      // User not logged in or identity failed to load, redirect
      // navigate("/login"); // Or appropriate page
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
          email: rawData.email || userIdentity?.email || "", // Fallback to identity email
          name: rawData.name || userIdentity?.name || "", // Fallback to identity name
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
        // User document doesn't exist, prefill with identity data if available
        form.setFieldsValue({
          name: userIdentity?.name || "",
          email: userIdentity?.email || "",
          role: "client", // Default role
          phoneNumber: "",
        });
        setProfilePictureUrl(userIdentity?.profilePictureUrl || null);
        notification.info({
          message: "New User Profile",
          description: "Please complete your account details.",
        });
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
    email: string; // Email is usually not changed by user here, but kept for structure
    role?: string;
    phoneNumber?: string;
  }) => {
    if (!userId) return;
    setSaving(true);
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        name: values.name,
        profilePictureUrl: profilePictureUrl || "", // Ensure this is the latest URL if changed
        phoneNumber: values.phoneNumber || "",
        // email: values.email, // Typically email is not updated here directly
        // role: values.role, // Role might be admin-controlled
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

  const handleUpload = async (file: File) => {
    if (!userId) return false; // Return false to prevent Upload component's default action

    const storageRef = ref(storage, `profilePictures/${userId}/${file.name}`); // Corrected path segment
    try {
      setSaving(true); // Indicate loading state during upload
      await uploadBytes(storageRef, file);
      const imageUrl = await getDownloadURL(storageRef);

      // Update Firestore immediately with the new URL
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, { profilePictureUrl: imageUrl });

      setProfilePictureUrl(imageUrl); // Update local state for UI (though onSnapshot will also catch this)
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
    return false; // Important to prevent default upload behavior
  };

  useEffect(() => {
    if (userId) {
      fetchUserData(); // Initial fetch

      // Real-time listener for profile picture and other potential changes from elsewhere
      const userRef = doc(db, "users", userId);
      const unsubscribe = onSnapshot(
        userRef,
        (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setProfilePictureUrl(data.profilePictureUrl || null);
            // Optionally update other form fields if they can be changed externally
            // form.setFieldsValue({ name: data.name, phoneNumber: data.phoneNumber });
          }
        },
        (error) => {
          console.error("Error with Firestore onSnapshot:", error);
          notification.error({
            message: "Real-time sync error",
            description: "Could not sync account updates.",
          });
        }
      );

      return () => unsubscribe(); // Cleanup listener
    }
  }, [userId]); // form removed from deps, fetchUserData will set it.

  if (identityLoading || fetchingData) {
    return (
      <div
        style={{
          padding: 24,
          textAlign: "center",
          // background: "#3f3f3f", // REMOVE
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" tip="Loading account details..." />{" "}
        {/* REMOVE style={{ color: "#fff" }} */}
      </div>
    );
  }

  return (
    <div
      style={{
        padding: 24 /* REMOVE background, minHeight if layout manages it */,
      }}
    >
      {/* <Header /> REMOVE if handled by layout */}
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate("/")} // Navigate to dashboard or previous page
        style={{ marginBottom: 16 }}
        // REMOVE custom background/border/color
      >
        Back {/* Or "Back to Dashboard" */}
      </Button>
      <Title level={2} /* REMOVE style={{ color: "#fff" }} */>
        Account Settings
      </Title>
      <Card
        style={{
          marginTop: 16 /* REMOVE background, border, borderRadius if theme handles card style */,
        }}
        // REMOVE className="dark-card"
      >
        <Row gutter={[32, 24]}>
          {" "}
          {/* Increased gutter for more spacing */}
          {/* Left Column: Form Fields */}
          <Col xs={24} md={12}>
            <Form form={form} layout="vertical" onFinish={handleSave}>
              <Form.Item
                label="Name" // REMOVE <span style={{ color: "#fff" }}>
                name="name"
                rules={[{ required: true, message: "Please enter your name" }]}
              >
                <Input
                  placeholder="Enter your name" /* REMOVE custom styles */
                />
              </Form.Item>
              <Form.Item label="Email" name="email">
                <Input
                  disabled /* REMOVE custom styles, antd theme handles disabled */
                />
              </Form.Item>
              <Form.Item label="Role" name="role">
                <Input disabled /* REMOVE custom styles */ />
              </Form.Item>
              <Form.Item label="Phone Number" name="phoneNumber">
                <Input
                  placeholder="Enter your phone number" /* REMOVE custom styles */
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={saving} /* REMOVE custom styles */
                >
                  Save Changes
                </Button>
              </Form.Item>
            </Form>
          </Col>
          {/* Right Column: Profile Picture */}
          <Col xs={24} md={12}>
            <div style={{ textAlign: "center", paddingTop: "20px" }}>
              {" "}
              {/* Added padding top */}
              <Avatar // Using Ant Design Avatar for better theming and placeholder
                size={200} // Larger size
                src={profilePictureUrl}
                icon={!profilePictureUrl && <UserOutlined />} // Show icon if no URL
                style={{
                  marginBottom: 24,
                  border:
                    "2px solid #f0f0f0" /* Optional: a subtle border from theme */,
                }}
                // REMOVE custom background for placeholder div
              />
              <div>
                <Upload
                  beforeUpload={handleUpload}
                  showUploadList={false}
                  accept="image/png, image/jpeg, image/gif" // Specify accepted file types
                >
                  <Button
                    icon={
                      <UploadOutlined />
                    } /* REMOVE custom styles, type="primary" or default */
                  >
                    Change Picture
                  </Button>
                </Upload>
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default AccountSettingsPage;
