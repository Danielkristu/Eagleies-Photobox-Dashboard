import { useForm } from "@refinedev/antd";
import { Create } from "@refinedev/antd";
import { Form, Input, InputNumber, Switch } from "antd";

export const VoucherCreate = () => {
  const { formProps, saveButtonProps } = useForm({
    resource: "voucher",
  });

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="Kode Voucher"
          name="id"
          rules={[
            { required: true, message: "Kode voucher wajib diisi" },
            { whitespace: true },
          ]}
        >
          <Input
            placeholder="Misal: PROMO50"
            onChange={(e) => {
              const upper = e.target.value.toUpperCase();
              formProps.form?.setFieldValue("id", upper);
            }}
          />
        </Form.Item>

        <Form.Item
          label="Harga Voucher"
          name="price"
          rules={[{ required: true, message: "Harga wajib diisi" }]}
        >
          <InputNumber prefix="Rp" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Status Aktif"
          name="active"
          valuePropName="checked"
        >
          <Switch defaultChecked />
        </Form.Item>
      </Form>
    </Create>
  );
};
