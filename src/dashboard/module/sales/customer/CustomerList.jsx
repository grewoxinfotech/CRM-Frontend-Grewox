import React from "react";
import {
  Table,
  Button,
  Tag,
  Dropdown,
  Typography,
  Modal,
  message,
} from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiMoreVertical,
  FiUser,
} from "react-icons/fi";
import { useDeleteCustomerMutation } from "./services/custApi";
import dayjs from "dayjs";

const { Text } = Typography;

const CustomerList = ({
  onEdit,
  custdata,
  pagination,
  onChange,
  loading
}) => {
  const [deleteCustomer] = useDeleteCustomerMutation();

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete Customer',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await deleteCustomer(id).unwrap();
          message.success('Deleted successfully');
        } catch (error) {
          message.error('Failed to delete');
        }
      },
    });
  };

  const columns = [
    {
      title: "Customer Details",
      key: "name",
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="icon-wrapper" style={{ 
            width: '24px', 
            height: '24px', 
            borderRadius: '6px', 
            background: '#f1f5f9', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: '#64748b'
          }}>
            <FiUser size={14} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Text strong style={{ color: '#1e293b' }}>{record.name}</Text>
            <Text type="secondary" style={{ fontSize: '11px' }}>{record.customerNumber}</Text>
          </div>
        </div>
      ),
    },
    {
      title: "Contact Info",
      key: "contact",
      render: (_, record) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <Text style={{ fontSize: '13px' }}>{record.email}</Text>
          <Text type="secondary" style={{ fontSize: '11px' }}>{record.contact}</Text>
        </div>
      ),
    },
    {
      title: "Location",
      key: "location",
      render: (_, record) => {
        let billing = {};
        if (record.billing_address) {
          try {
            billing = typeof record.billing_address === 'string' ? JSON.parse(record.billing_address) : record.billing_address;
          } catch (e) { billing = {}; }
        }
        return (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Text style={{ fontSize: '13px' }}>{billing.city || 'N/A'}</Text>
            <Text type="secondary" style={{ fontSize: '11px' }}>{billing.country || 'N/A'}</Text>
          </div>
        );
      },
    },
    {
      title: "Tax Number",
      dataIndex: "tax_number",
      key: "tax_number",
      render: (tax) => tax ? <Tag style={{ borderRadius: '4px', border: 'none' }}>{tax}</Tag> : '-'
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => <Text type="secondary" style={{ fontSize: '12px' }}>{dayjs(date).format('DD MMM YYYY')}</Text>
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: 'edit', icon: <FiEdit2 />, label: 'Edit', onClick: () => onEdit(record) },
              { key: 'delete', icon: <FiTrash2 />, label: 'Delete', danger: true, onClick: () => handleDelete(record.id) }
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
    <div className="customer-list-container">
      <Table
        columns={columns}
        dataSource={custdata?.data}
        rowKey="id"
        size="small"
        loading={loading}
        className="compact-table"
        pagination={{
            ...pagination,
            total: custdata?.pagination?.total,
            showTotal: (total) => `Total ${total} customers`
        }}
        onChange={onChange}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default CustomerList;
