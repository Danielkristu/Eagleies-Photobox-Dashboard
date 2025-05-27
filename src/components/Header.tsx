import React from "react";
import { useGetIdentity } from "@refinedev/core";
import { Avatar, Dropdown, Menu, Button } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

interface UserIdentity {
  id: string;
  email: string;
  name: string;
}

const Header: React.FC = () => {
  const { data: userIdentity } = useGetIdentity<UserIdentity>();
  const navigate = useNavigate();
  const userName = userIdentity?.name || "Guest";
  const userEmail = userIdentity?.email || "guest@example.com";

  const handleLogout = () => {
    // Add your logout logic here (e.g., clear auth, redirect to login)
    console.log("Logout clicked");
    navigate("/login"); // Replace with your login route
  };

  const handleAccount = () => {
    // Add your account settings logic here (e.g., navigate to account page)
    console.log("Account clicked");
    navigate("/account"); // Replace with your account route
  };

  const menu = (
    <Menu style={{ background: "#2f2f2f", color: "#fff" }}>
      <Menu.Item key="account" onClick={handleAccount} icon={<UserOutlined />}>
        Account
      </Menu.Item>
      <Menu.Item key="logout" onClick={handleLogout} icon={<LogoutOutlined />}>
        Logout
      </Menu.Item>
    </Menu>
  );

  // Default profile picture URL (replace with actual image URL if available)
  const profilePictureUrl = "https://via.placeholder.com/40"; // Placeholder image

  return (
    <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 16px", background: "#202223" }}>
      <Dropdown overlay={menu} trigger={["click"]}>
        <Avatar
          src={profilePictureUrl}
          size={40}
          style={{ cursor: "pointer", backgroundColor: "#1890ff" }}
        >
          {!profilePictureUrl && userName.charAt(0)}
        </Avatar>
      </Dropdown>
    </div>
  );
};

export default Header;