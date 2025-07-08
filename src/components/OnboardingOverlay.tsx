import React, { useState, useEffect } from "react";
import { Modal, Steps, Form, Input, Button, Typography, message } from "antd";
import {
  UploadOutlined,
  CloseOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons";
import { useGetIdentity } from "@refinedev/core";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";

const { Text } = Typography;

interface OnboardingOverlayProps {
  visible: boolean;
  onComplete: (apiKey: string, boothName: string) => Promise<void>;
  onClose?: () => void; // <-- add optional onClose prop
}

export const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({
  visible,
  onComplete,
  onClose, // <-- add this prop
}) => {
  const [step, setStep] = useState(0);
  const [apiKey, setApiKey] = useState("");
  const [boothName, setBoothName] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: userIdentity } = useGetIdentity<{ id: string }>();

  const steps = [
    {
      title: "Xendit API Key",
      content: (
        <Form layout="vertical">
          <Form.Item
            label={<Text strong>Xendit API Key</Text>}
            required
            help="Masukkan API key Xendit Anda."
          >
            <Input.Password
              size="large"
              placeholder="API Key Xendit"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              style={{ borderRadius: 8 }}
            />
          </Form.Item>
        </Form>
      ),
    },
    {
      title: "Nama Booth Awal",
      content: (
        <Form layout="vertical">
          <Form.Item
            label={<Text strong>Nama Booth Awal</Text>}
            required
            help="Masukkan nama booth pertama Anda."
          >
            <Input
              size="large"
              placeholder="Nama Booth"
              value={boothName}
              onChange={(e) => setBoothName(e.target.value)}
              style={{ borderRadius: 8 }}
            />
          </Form.Item>
        </Form>
      ),
    },
  ];

  // Check onboarding status on mount and when user changes
  useEffect(() => {
    const checkOnboarding = async () => {
      if (!userIdentity?.id) return;
      // Check Xendit API key
      const clientRef = doc(db, "Clients", userIdentity.id);
      const clientSnap = await getDoc(clientRef);
      const xenditApiKey = clientSnap.exists()
        ? clientSnap.data().xendit_api_key
        : undefined;
      // Check for at least one real booth (not just placeholder)
      const boothsCol = collection(db, "Clients", userIdentity.id, "Booths");
      const boothsSnap = await getDocs(boothsCol);
      const realBooth = boothsSnap.docs.find(
        (doc) => doc.data().name && doc.data().name !== "Booth Pertama"
      );
      if (xenditApiKey) setApiKey(xenditApiKey);
      if (realBooth) setBoothName(realBooth.data().name);
      // If not completed, keep overlay visible
    };
    if (visible) checkOnboarding();
  }, [userIdentity, visible]);

  // Always reset step to 0 when overlay is shown
  useEffect(() => {
    if (visible) setStep(0);
  }, [visible]);

  const handleNext = async () => {
    if (step === 0 && !apiKey) {
      message.error("API Key tidak boleh kosong");
      return;
    }
    if (step === 1 && !boothName) {
      message.error("Nama booth tidak boleh kosong");
      return;
    }
    if (step === 1) {
      setLoading(true);
      try {
        // Save Xendit API key
        if (userIdentity?.id) {
          const clientRef = doc(db, "Clients", userIdentity.id);
          await updateDoc(clientRef, { xendit_api_key: apiKey });
          // Find the first booth and update its name if needed
          const boothsCol = collection(
            db,
            "Clients",
            userIdentity.id,
            "Booths"
          );
          const boothsSnap = await getDocs(boothsCol);
          const firstBooth = boothsSnap.docs[0];
          if (firstBooth && firstBooth.data().name !== boothName) {
            await updateDoc(firstBooth.ref, { name: boothName });
          }
        }
        await onComplete(apiKey, boothName);
      } catch (e) {
        message.error("Gagal menyimpan data. Coba lagi.");
        setLoading(false);
        return;
      }
      setLoading(false);
    } else {
      setStep(step + 1);
    }
  };

  const handleClose = () => {
    if (onClose) onClose(); // call parent onClose if provided
  };

  // Remove modalRender and all extra nested divs. Use Modal's default rendering and absolutely position the close button inside the Modal. This will fix the close button and scrolling issues, and keep the form centered and full-page.
  return (
    <Modal
      open={visible}
      footer={null}
      closable={false}
      width="100vw"
      style={{
        top: 0,
        left: 0,
        padding: 0,
        maxWidth: "100vw",
        height: "100vh",
        margin: 0,
        overflow: "hidden", // prevent double scroll
      }}
      styles={{
        body: {
          padding: 0,
          minHeight: 0, // fix: don't force 100vh on body
          height: "100vh",
          background: "#fff",
          overflow: "hidden",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        },
        mask: { background: "#fff" },
      }}
      centered
      destroyOnClose
      zIndex={3001}
    >
      {/* Close button absolutely positioned in Modal body */}
      <button
        onClick={handleClose}
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 10,
          background: "rgba(0,0,0,0.08)",
          border: "none",
          borderRadius: "50%",
          width: 40,
          height: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          fontSize: 20,
        }}
        aria-label="Tutup"
      >
        <CloseOutlined />
      </button>
      {/* Centered content, no extra 100vh wrappers */}
      <div
        style={{
          width: "100%",
          maxWidth: 600,
          margin: "0 auto",
          borderRadius: 24,
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          minHeight: 380,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#181818",
          color: "#fff",
        }}
      >
        <Steps
          current={step}
          items={steps.map((s) => ({ title: s.title }))}
          style={{
            marginBottom: 32,
            padding: 32,
            paddingBottom: 0,
            background: "transparent",
          }}
          responsive
          direction="horizontal"
        />
        <div
          style={{
            minHeight: 120,
            marginBottom: 24,
            padding: 32,
            paddingTop: 0,
          }}
        >
          {steps[step].content}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            padding: 32,
            paddingTop: 0,
          }}
        >
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => setStep(Math.max(0, step - 1))}
            disabled={step === 0 || loading}
            style={{
              minWidth: 100,
              borderRadius: 8,
              marginBottom: 8,
            }}
          >
            Kembali
          </Button>
          <Button
            type="primary"
            size="large"
            block
            style={{ borderRadius: 8, flex: 1, minWidth: 180 }}
            loading={loading}
            onClick={handleNext}
            disabled={loading || (step === 0 ? !apiKey : !boothName)}
          >
            {step === steps.length - 1 ? "Simpan & Lanjutkan" : "Lanjutkan"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
