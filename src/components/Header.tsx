import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetIdentity } from "@refinedev/core";
import { Layout, Avatar, Button, Switch } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { ColorModeContext } from "../contexts/color-mode";

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

  const { mode, setMode } = useContext(ColorModeContext);

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
        background: mode === "dark" ? "#181818" : "#fff",
        color: mode === "dark" ? "#fff" : "#181818",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: mode === "dark" ? "1px solid #333" : "1px solid #eee",
        boxShadow: mode === "dark" ? "0 2px 8px #0002" : "0 2px 8px #0001",
      }}
    >
      <div style={{ fontSize: "20px" }}>Dashboard</div>
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <Switch
          checkedChildren="🌛"
          unCheckedChildren="🔆"
          checked={mode === "dark"}
          onChange={() => setMode(mode === "light" ? "dark" : "light")}
          style={{ marginRight: 16 }}
        />
        <Button
          type="text"
          onClick={() => navigate("/account")}
          style={{ padding: 0 }}
        >
          <Avatar
            src={profilePictureUrl}
            icon={profilePictureUrl ? undefined : <UserOutlined />}
            size={64}
            style={{
              backgroundColor: mode === "dark" ? "#222" : "#1890ff",
              border: mode === "dark" ? "2px solid #444" : "2px solid #fff",
            }}
          />
        </Button>
      </div>
    </AntHeader>
  );
};

export default Header;
