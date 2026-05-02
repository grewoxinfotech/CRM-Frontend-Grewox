import React, { useState } from "react";
import { Table, Button, Dropdown, Tag, Typography } from "antd";
import { FiMoreVertical, FiEdit2, FiTrash2, FiEye, FiFileText } from "react-icons/fi";
import ViewBilling from "./ViewBilling";
import dayjs from "dayjs";

const { Text } = Typography;

const BillingList = ({
  onEdit,
  onDelete,
  loading,
  billings = [],
  pagination
}) => {
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedBilling, setSelectedBilling] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const handleViewBilling = (record) => {
    if (record) {
      let items = [];
      try {
        if (typeof record.items === "string") {
          items = JSON.parse(record.items);
        } else if (Array.isArray(record.items)) {
          items = record.items;
        }
        items = items.map((item) => ({
          itemName: item.itemName || item.name || item.description,
          hsnSac: item.hsnSac || item.hsn_sac || item.hsn_code,
          quantity: Number(item.quantity) || 0,
          unitPrice: Number(item.unitPrice) || 0,
          tax: item.tax || "",
          taxAmount: Number(item.taxAmount) || 0,
          discount: Number(item.discount) || 0,
          discountAmount: Number(item.discountAmount) || 0,
          amount: Number(item.amount) || 0,
          currencyIcon: item.currencyIcon || '₹',
          discount_type: item.discount_type || 'fixed'
        }));

        setSelectedBilling({
          ...record,
          items: items,
          discount: Number(record.discount) || 0,
          tax: Number(record.tax) || 0,
          overallTax: record.overallTax || "",
          overallTaxAmount: Number(record.overallTaxAmount) || 0
        });
        setIsViewModalOpen(true);
      } catch (error) {
        console.error("Error parsing billing items:", error);
      }
    }
  };

  const columns = [
    {
      title: "Bill Number",
      dataIndex: "billNumber",
      key: "billNumber",
      width: 200,
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '6px', 
            background: '#fff7ed', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#f97316'
          }}>
            <FiFileText size={16} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Text strong style={{ color: '#1e293b' }}>{text || 'N/A'}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}>{dayjs(record.billDate).format('DD MMM YYYY')}</Text>
          </div>
        </div>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      width: 150,
      render: (amount, record) => {
        const items = typeof record.items === 'string' ? JSON.parse(record.items) : record.items;
        const currencyIcon = items?.[0]?.currencyIcon || '₹';
        return <Text strong style={{ color: '#2563eb' }}>{currencyIcon} {parseFloat(amount || 0).toLocaleString()}</Text>;
      },
    },
    {
      title: "Status",
      key: "status",
      width: 150,
      render: (_, record) => {
        const status = record.status || 'pending';
        let color = 'default';
        if (status === 'paid') color = 'success';
        if (status === 'pending') color = 'warning';
        if (status === 'unpaid') color = 'error';
        return (
            <Tag color={color} className="status-tag">
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Tag>
        );
      },
    },
    {
        title: "Bill Status",
        dataIndex: "bill_status",
        key: "bill_status",
        width: 120,
        render: (status) => (
            <Tag style={{ borderRadius: '4px', border: 'none', background: '#f1f5f9', color: '#475569' }}>
                {status || 'Draft'}
            </Tag>
        )
    },
    {
      title: "Actions",
      key: "actions",
      fixed: 'right',
      width: 80,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', icon: <FiEye />, label: 'View', onClick: () => handleViewBilling(record) },
              { key: 'edit', icon: <FiEdit2 />, label: 'Edit', onClick: () => onEdit(record) },
              { key: 'delete', icon: <FiTrash2 />, label: 'Delete', danger: true, onClick: () => onDelete(record) }
            ]
          }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button type="text" icon={<FiMoreVertical />} className="action-dropdown-button" />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="billing-list-container">
      <Table
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        columns={columns}
        dataSource={billings}
        rowKey="id"
        size="small"
        loading={loading}
        className="compact-table"
        pagination={{
            ...pagination,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} items`
        }}
        scroll={{ x: 'max-content' }}
      />

      {isViewModalOpen && selectedBilling && (
        <ViewBilling
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          data={selectedBilling}
        />
      )}
    </div>
  );
};

export default BillingList;
