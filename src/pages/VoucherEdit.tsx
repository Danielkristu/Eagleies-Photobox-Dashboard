import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber, Switch } from "antd";

export const VoucherEdit = () => {
  const { formProps, saveButtonProps } = useForm();

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item label="Kode Voucher" name="id">
          <Input disabled />
        </Form.Item>

        <Form.Item
          label="Harga"
          name="price"
          rules={[{ required: true, type: "number", min: 0 }]}
        >
          <InputNumber prefix="Rp" style={{ width: "100%" }} />
        </Form.Item>

        <Form.Item
          label="Aktif"
          name="active"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>
      </Form>
    </Edit>
  );
};
