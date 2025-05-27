/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { Form, Input, InputNumber, Button, Spin, message } from "antd";
import { useForm } from "antd/es/form/Form";
import { useOne, useUpdate } from "@refinedev/core";
import { getBoothId } from "../hooks/useBoothId";

export const AppConfigEdit = () => {
  const boothId = getBoothId();
  const [form] = useForm();

  // 🔍 Ambil data dari Firestore
  const { data, isLoading } = useOne({
    resource: "Photobox",
    id: boothId,
    dataProviderName: "photobox",
  });

  // 🚀 Untuk update
  const { mutate: update, isLoading: updating } = useUpdate();

  // 🧠 Isi form saat data udah siap
  useEffect(() => {
    if (data?.data) {
      form.setFieldsValue(data.data);
    }
  }, [data, form]);

  // 📝 Simpan perubahan
  const onFinish = (values: any) => {
    update(
      {
        resource: "Photobox",
        id: boothId!,
        values,
        dataProviderName: "photobox",
      },
      {
        onSuccess: () => message.success("✅ Pengaturan berhasil disimpan!"),
        onError: () => message.error("❌ Gagal menyimpan pengaturan."),
      }
    );
  };

  if (isLoading) return <Spin tip="Loading..." />;

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={data?.data}
    >
      <Form.Item
        label="Harga per Sesi"
        name="price"
        rules={[{ required: true }]}
      >
        <InputNumber prefix="Rp" style={{ width: "100%" }} />
      </Form.Item>

      <Form.Item
        label="Xendit API Key"
        name="xendit_api_key"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        label="Callback URL"
        name="callback_url"
        rules={[{ required: true }]}
      >
        <Input />
      </Form.Item>

      <Form.Item label="DSLRBooth API URL" name="dslrbooth_api_url">
        <Input />
      </Form.Item>

      <Form.Item label="DSLRBooth API Password" name="dslrbooth_api_password">
        <Input.Password />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={updating}>
          Simpan Perubahan
        </Button>
      </Form.Item>
    </Form>
  );
};
