import { useEffect } from "react";
import { Form, Input, InputNumber, Button, Spin, message } from "antd";
import { useForm } from "antd/es/form/Form";
import { useOne, useUpdate } from "@refinedev/core";
import { getBoothId } from "../hooks/useBoothId";

interface FormValues {
  price: number;
  xendit_api_key: string;
  callback_url: string;
  dslrbooth_api_url?: string;
  dslrbooth_api_password?: string;
}

export const AppConfigEdit = () => {
  const boothId = getBoothId();

  // **JANGAN lakukan return di sini, tetap panggil semua hook berikut!**

  const [form] = useForm();

  const { data, isLoading } = useOne({
    resource: "Photobox",
    id: boothId ?? "", // kasih default supaya hook tidak error
    dataProviderName: "photobox",
    queryOptions: {
      enabled: Boolean(boothId), // hook baru aktif kalau boothId ada
    },
  });

  const { mutate: update, isLoading: updating } = useUpdate();

  useEffect(() => {
    if (data?.data) {
      form.setFieldsValue(data.data);
    }
  }, [data, form]);

  // Kalau boothId tidak ada, tampilkan pesan, tapi hooks tetap sudah terpanggil
  if (!boothId) return <div>Booth ID tidak ditemukan.</div>;
  if (isLoading) return <Spin tip="Loading..." />;

  const onFinish = (values: FormValues) => {
    update(
      {
        resource: "Photobox",
        id: boothId,
        values,
        dataProviderName: "photobox",
      },
      {
        onSuccess: () => message.success("✅ Pengaturan berhasil disimpan!"),
        onError: () => message.error("❌ Gagal menyimpan pengaturan."),
      }
    );
  };

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
        <InputNumber style={{ width: "100%" }} />
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
