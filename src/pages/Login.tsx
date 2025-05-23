import React from "react";
import { useLogin } from "@refinedev/core";
import { Form, Input, Button, notification } from "antd";

export default function Login() {
  const { mutate: login, isLoading } = useLogin();

  const onFinish = (values: { email: string; password: string }) => {
    login(values, {
      onError: (error: any) => {
        notification.error({
          message: "Login Failed",
          description: error?.message || "Unknown error",
        });
      },
    });
  };

  return (
    <div style={{
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#f0f2f5",
      padding: 20,
    }}>
      <Form
        layout="vertical"
        onFinish={onFinish}
        style={{ width: 350, background: "white", padding: 24, borderRadius: 8 }}
      >
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Please input your email!" },
            { type: "email", message: "Invalid email format!" },
          ]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: "Please input your password!" }]}
        >
          <Input.Password />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isLoading} block>
            Login
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
