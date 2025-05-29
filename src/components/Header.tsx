import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetIdentity } from "@refinedev/core";
import { Layout, Avatar, Button } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const { Header: AntHeader } = Layout;

interface UserIdentity {
  id: string;
  email: string;
  name: string;
  role?: string;
  profilePictureUrl?: string;
}

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { data: userIdentity, isLoading } = useGetIdentity<UserIdentity>();
  const userId = userIdentity?.id;

  const [profilePictureUrl, setProfilePictureUrl] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (userId) {
      // Real-time listener for profile picture
      const userRef = doc(db, `users/${userId}`);
      const unsubscribe = onSnapshot(
        userRef,
        (doc) => {
          if (doc.exists()) {
            const data = doc.data();
            setProfilePictureUrl(data.profilePictureUrl || null);
            console.log(
              "Header profile picture synced from Firestore:",
              data.profilePictureUrl
            );
          }
        },
        (error) => {
          console.error("Error syncing profile picture in Header:", error);
        }
      );

      return () => unsubscribe(); // Cleanup listener on unmount
    }
  }, [userId]);

  if (isLoading) {
    return null; // Avoid rendering until user identity is loaded
  }

  return (
    <AntHeader
      style={{
        background: "#2f2f2f",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div style={{ color: "#fff", fontSize: "20px" }}>Dashboard</div>
      <Button
        type="text"
        onClick={() => navigate("/account")}
        style={{ padding: 0 }}
      >
        <Avatar
          src={profilePictureUrl}
          icon={profilePictureUrl ? undefined : <UserOutlined />}
          size={64} // Larger size for the profile button
          style={{
            backgroundColor: profilePictureUrl ? "transparent" : "#1890ff",
            border: "2px solid #fff", // Optional: Add a border for better visibility
          }}
        />
      </Button>
    </AntHeader>
  );
};

export default Header;
