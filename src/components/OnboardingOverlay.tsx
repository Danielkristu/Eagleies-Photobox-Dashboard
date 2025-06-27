import React, { useState } from "react";
import { Modal, Steps, Form, Input, Button, Card, Typography, message } from "antd";
import { UploadOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

interface OnboardingOverlayProps {
  visible: boolean;
  onComplete: (apiKey: string, boothName: string) => Promise<void>;
}

export const OnboardingOverlay: React.FC<OnboardingOverlayProps> = ({ visible, onComplete }) => {
  const [step, setStep] = useState(0);
  const [apiKey, setApiKey] = useState("");
  const [boothName, setBoothName] = useState("");
  const [loading, setLoading] = useState(false);

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
              onChange={e => setApiKey(e.target.value)}
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
              onChange={e => setBoothName(e.target.value)}
              style={{ borderRadius: 8 }}
            />
          </Form.Item>
        </Form>
      ),
    },
  ];

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

  return (
    <Modal
      open={visible}
      footer={null}
      closable={false}
      width={600}
      style={{ top: 0, padding: 0 }}
      bodyStyle={{ padding: 0, minHeight: "100vh", background: "#f7f8fa" }}
      maskStyle={{ background: "rgba(0,0,0,0.7)" }}
      centered
      destroyOnClose
      zIndex={2000}
    >
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", background: "#f7f8fa" }}>
        <Card
          style={{ width: 480, borderRadius: 16, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", marginTop: 32 }}
          bodyStyle={{ padding: 32 }}
        >
          <Steps
            current={step}
            items={steps.map(s => ({ title: s.title }))}
            style={{ marginBottom: 32 }}
          />
          <div style={{ minHeight: 120 }}>{steps[step].content}</div>
          <Button
            type="primary"
            size="large"
            block
            style={{ marginTop: 32, borderRadius: 8 }}
            loading={loading}
            onClick={handleNext}
            disabled={loading || (step === 0 ? !apiKey : !boothName)}
          >
            {step === steps.length - 1 ? "Simpan & Lanjutkan" : "Lanjutkan"}
          </Button>
        </Card>
      </div>
    </Modal>
  );
};
