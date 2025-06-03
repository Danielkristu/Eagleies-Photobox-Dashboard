import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Typography,
  notification,
  Divider,
} from "antd";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

const { Title, Text } = Typography;

const SignUpPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailSignUp = async (values: {
    email: string;
    password: string;
    phone: string;
  }) => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );

      await setDoc(doc(db, "users", userCredential.user.uid), {
        email: values.email,
        phone: values.phone,
        uid: userCredential.user.uid,
        createdAt: new Date(),
        provider: "email",
      });

      notification.success({
        message: "Registration Successful",
        description: `Welcome, ${values.email}`,
      });

      navigate("/");
    } catch (error: any) {
      notification.error({
        message: "Registration Failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        phone: user.phoneNumber || "",
        uid: user.uid,
        name: user.displayName || "",
        createdAt: new Date(),
        provider: "google",
      });

      notification.success({
        message: "Google Sign-In Successful",
        description: `Welcome, ${user.displayName || user.email}`,
      });

      navigate("/");
    } catch (error: any) {
      notification.error({
        message: "Google Sign-In Failed",
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
        backgroundColor: "#202223",
        padding: 20,
      }}
    >
      <Form
        layout="vertical"
        onFinish={handleEmailSignUp}
        style={{
          width: 350,
          backgroundColor: "black",
          padding: 24,
          borderRadius: 8,
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Title level={3} style={{ marginBottom: 0, color: "white" }}>
            Sign Up to PhotoBox
          </Title>
        </div>

        <Button
          onClick={handleGoogleSignUp}
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
          Sign up with Google
        </Button>

        <Divider style={{ borderColor: "#444" }}>or</Divider>

        <Form.Item
          label={<Text style={{ color: "#fff" }}>Email</Text>}
          name="email"
          rules={[
            { required: true, message: "Please enter your email" },
            { type: "email", message: "Invalid email format" },
          ]}
        >
          <Input size="large" placeholder="you@example.com" />
        </Form.Item>

        <Form.Item
          label={<Text style={{ color: "#fff" }}>Password</Text>}
          name="password"
          rules={[
            { required: true, message: "Please enter your password" },
            { min: 6, message: "Password must be at least 6 characters" },
          ]}
        >
          <Input.Password size="large" placeholder="Create a password" />
        </Form.Item>

        <Form.Item
          label={<Text style={{ color: "#fff" }}>Phone Number</Text>}
          name="phone"
          rules={[
            { required: true, message: "Please enter your phone number" },
            { pattern: /^[0-9]+$/, message: "Only numbers are allowed" },
          ]}
        >
          <Input size="large" placeholder="08xxxxxxxxxx" />
        </Form.Item>

        <Form.Item>
          <Button
            htmlType="submit"
            loading={loading}
            block
            size="large"
            style={{ borderColor: "#a19787", color: "#fff" }}
          >
            Sign Up
          </Button>
        </Form.Item>

        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Text style={{ color: "#bbb" }}>
            Already have an account?{" "}
            <a onClick={() => navigate("/login")} style={{ color: "#a19787" }}>
              Log in here
            </a>
          </Text>
        </div>
      </Form>
    </div>
  );
};

export default SignUpPage;
