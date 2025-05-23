import { useNavigation, useList } from "@refinedev/core";
import { Table, Tag, Space, Button } from "antd"; // ⬅️ pastikan Button di-import
import { EditButton, DeleteButton } from "@refinedev/antd";
import { PlusOutlined } from "@ant-design/icons";

export const VoucherList = () => {
  const { data, isLoading } = useList({ resource: "voucher" });
  const { create } = useNavigation(); // ⬅️ akses create navigation

  return (
    <>
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "flex-end" }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => create("Voucher")}>
          Create Voucher
        </Button>
      </div>

      <Table
        dataSource={data?.data}
        loading={isLoading}
        rowKey="id"
        columns={[
          { title: "Kode", dataIndex: "id" },
          { title: "Harga", dataIndex: "price" },
          {
            title: "Status",
            dataIndex: "active",
            render: (val: boolean) =>
              val ? <Tag color="green">Aktif</Tag> : <Tag color="red">Nonaktif</Tag>,
          },
          {
            title: "Aksi",
            dataIndex: "id",
            render: (id) => (
              <Space>
                <EditButton size="small" recordItemId={id} />
                <DeleteButton size="small" recordItemId={id} />
              </Space>
            ),
          },
        ]}
      />
    </>
  );
};
