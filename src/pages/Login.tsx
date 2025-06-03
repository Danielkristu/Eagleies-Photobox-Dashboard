// src/pages/Login.tsx

import React from "react";
import { useLogin } from "@refinedev/core";
import { Form, Input, Button, App as AntdApp, Typography } from "antd";
import type { HttpError } from "@refinedev/core";

const { Title } = Typography;

export default function Login() {
  const { mutate: login, isLoading } = useLogin();

  const { notification } = AntdApp.useApp();

  const onFinish = (values: { email: string; password: string }) => {
    login(values, {
      onError: (error: HttpError) => {
        let errorMessage = "Unknown error occurred.";

        if (error.statusCode) {
          if (
            typeof error.statusCode === "number" &&
            error.statusCode === 401
          ) {
            errorMessage = "Invalid email or password.";
          } else {
            errorMessage = `Login failed with status code ${error.statusCode}.`;
          }
        }
        if (error.message) {
          errorMessage = error.message;
        } else if (error.errors && error.errors.length > 0) {
          errorMessage = error.errors
            .map((e: any) => e.message || e.detail || e.field)
            .join(", ");
        }

        notification.error({
          message: "Login Failed",
          description: errorMessage,
        });
      },
    });
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        // --- CHANGED: Dark background for the entire page ---
        backgroundColor: "#202223", // Using the dark color from your HomePage.tsx comments
        padding: 20,
        borderColor: "#a19787",
      }}
    >
      <Form
        layout="vertical"
        onFinish={onFinish}
        style={{
          width: 350,
          backgroundColor: "black", // Keep the form itself white for contrast
          padding: 24,
          borderRadius: 8,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)", // Slightly stronger shadow for visibility on dark bg
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Title level={3} style={{ marginBottom: 0, color: "white" }}>
            {" "}
            {/* Default dark text for heading on white card */}
            Login to PhotoBox
          </Title>
        </div>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Please input your email!" },
            { type: "email", message: "Invalid email format!" },
          ]}
        >
          <Input size="large" />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password size="large" />
        </Form.Item>

        <Form.Item>
          <Button
            htmlType="submit"
            loading={isLoading}
            block
            size="large"
            style={{ borderColor: "#a19787" }}
          >
            Login
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
