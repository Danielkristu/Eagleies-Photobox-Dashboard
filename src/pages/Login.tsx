// src/pages/Login.tsx

import React, { useEffect, useRef } from "react";
import { useLogin } from "@refinedev/core";
import { Form, Input, Button, App as AntdApp, Typography } from "antd";
import type { HttpError } from "@refinedev/core";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "../firebase";

const { Title } = Typography;
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_V3_SITE_KEY;

export default function Login() {
  const { mutate: login, isLoading } = useLogin();
  const recaptchaLoaded = useRef(false);

  const { notification } = AntdApp.useApp();

  useEffect(() => {
    if (!recaptchaLoaded.current) {
      const script = document.createElement("script");
      script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
      script.async = true;
      script.onload = () => {
        recaptchaLoaded.current = true;
      };
      document.body.appendChild(script);
    }
  }, []);

  const onFinish = async (values: { email: string; password: string }) => {
    if (!(window as any).grecaptcha) {
      notification.error({
        message: "reCAPTCHA Error",
        description: "reCAPTCHA not loaded. Please try again.",
      });
      return;
    }
    try {
      const token = await (window as any).grecaptcha.execute(
        RECAPTCHA_SITE_KEY,
        {
          action: "login",
        }
      );
      login(
        { ...values, recaptchaToken: token },
        {
          onError: (error: any) => {
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
            } else if (
              error.errors &&
              Array.isArray(error.errors) &&
              error.errors.length > 0
            ) {
              errorMessage = error.errors
                .map((e: any) => e.message || e.detail || e.field)
                .join(", ");
            }

            notification.error({
              message: "Login Failed",
              description: errorMessage,
            });
          },
        }
      );
    } catch (err) {
      notification.error({
        message: "reCAPTCHA Error",
        description: "Failed to verify reCAPTCHA. Please try again.",
      });
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      // Optionally sync user to Firestore (if not already handled in authProvider)
      // You can add more logic here if needed
      notification.success({
        message: "Google Login Successful",
        description: `Welcome, ${user.displayName || user.email}`,
      });
      window.location.href = "/";
    } catch (error: any) {
      notification.error({
        message: "Google Login Failed",
        description: error.message,
      });
    }
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

        <Form.Item>
          <Button
            onClick={handleGoogleLogin}
            block
            style={{
              background: "#fff",
              color: "#000",
              fontWeight: 500,
              marginBottom: 24,
              border: "1px solid #dadce0",
              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
            }}
          >
            <img
              src="https://developers.google.com/identity/images/g-logo.png"
              alt="google"
              style={{ width: 18, marginRight: 8, verticalAlign: "middle" }}
            />
            Login with Google
          </Button>
        </Form.Item>

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
        <div style={{ textAlign: "center", color: "#fff", marginTop: 8 }}>
          Don't have an account?{"  "}
          <a href="/signup" style={{ color: "#a19787" }}>
            Create new account
          </a>
        </div>
      </Form>
    </div>
  );
}
