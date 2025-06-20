import React, { useEffect, useState } from "react";
import { Table, Typography, Spin, Card } from "antd";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useGetIdentity } from "@refinedev/core";

const { Title } = Typography;

interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  role?: string;
  boothsCount?: number;
  createdAt?: any;
}

const ManageUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: userIdentity, isLoading: identityLoading } =
    useGetIdentity<User>();

  // Admin-only access check
  console.log("userIdentity:", userIdentity);
  if (!identityLoading && userIdentity && userIdentity.role !== "admin") {
    return (
      <div style={{ padding: 24 }}>
        <Card>
          <Typography.Text type="danger">
            You do not have permission to view this page.
          </Typography.Text>
        </Card>
      </div>
    );
  }
  if (!identityLoading && !userIdentity) {
    return (
      <div style={{ padding: 24 }}>
        <Card>
          <Typography.Text type="danger">
            You must be logged in to view this page.
          </Typography.Text>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const usersCol = collection(db, "users");
        const usersSnap = await getDocs(usersCol);
        const userList: User[] = [];
        for (const docSnap of usersSnap.docs) {
          const userData = docSnap.data();
          const userId = docSnap.id;
          // Debug: log userData
          console.log("User from Firestore:", userId, userData);
          // Defensive: skip if no name or email (corrupt doc)
          if (!userData || (!userData.name && !userData.email)) continue;
          // Fetch booths count
          const boothsCol = collection(db, "Clients", userId, "Booths");
          const boothsSnap = await getDocs(boothsCol);
          userList.push({
            id: userId,
            name: userData.name || "-",
            email: userData.email || "-",
            phoneNumber: userData.phoneNumber || "-",
            address: userData.address || "-",
            role: userData.role || "-",
            boothsCount: boothsSnap.size,
            createdAt: userData.createdAt || null,
          });
        }
        console.log("Final userList:", userList);
        setUsers(userList);
      } catch (err) {
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading || identityLoading) {
    return (
      <Spin size="large" style={{ display: "block", margin: "20vh auto" }} />
    );
  }

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Manage Users</Title>
      <Card style={{ marginTop: 16 }}>
        <Table
          dataSource={users}
          rowKey="id"
          columns={[
            { title: "Name", dataIndex: "name", key: "name" },
            { title: "Email", dataIndex: "email", key: "email" },
            { title: "Phone", dataIndex: "phoneNumber", key: "phoneNumber" },
            { title: "Address", dataIndex: "address", key: "address" },
            { title: "Role", dataIndex: "role", key: "role" },
            {
              title: "Booths Count",
              dataIndex: "boothsCount",
              key: "boothsCount",
            },
            {
              title: "Created At",
              dataIndex: "createdAt",
              key: "createdAt",
              render: (value) =>
                value
                  ? new Date(
                      value.seconds ? value.seconds * 1000 : value
                    ).toLocaleString()
                  : "-",
            },
          ]}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default ManageUsersPage;
