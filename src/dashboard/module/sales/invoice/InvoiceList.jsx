import React, { useState } from "react";
import {
  Table,
  Button,
  Tag,
  Dropdown,
  Typography,
  Modal,
  message,
  Menu,
} from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiMoreVertical,
  FiFileText,
  FiCalendar,
} from "react-icons/fi";
import dayjs from "dayjs";
import { useDeleteInvoiceMutation } from "./services/invoiceApi";
import { useGetAllCurrenciesQuery } from "../../../../superadmin/module/settings/services/settingsApi";
import { useGetCustomersQuery } from "../customer/services/custApi";

const { Text } = Typography;

const InvoiceList = ({
  invoices = [],
  loading,
  deals = [],
  onEdit,
  onView,
  searchText = "",
  pagination = {}
}) => {
  const { data: currenciesData } = useGetAllCurrenciesQuery();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [deleteInvoice] = useDeleteInvoiceMutation();
  const { data: customersData } = useGetCustomersQuery();

  const filteredInvoices = React.useMemo(() => {
    return invoices?.filter((inv) => {
      const searchLower = searchText.toLowerCase();
      return !searchText || 
             inv?.salesInvoiceNumber?.toLowerCase().includes(searchLower) ||
             inv?.customerName?.toLowerCase().includes(searchLower);
    });
  }, [invoices, searchText]);

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Delete Invoice",
      content: "Are you sure you want to delete this invoice?",
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteInvoice(id).unwrap();
          message.success('Invoice deleted successfully');
        } catch (error) {
          message.error('Failed to delete invoice');
        }
      },
    });
  };

  const columns = [
    {
      title: "Invoice #",
      dataIndex: "salesInvoiceNumber",
      key: "number",
      width: 150,
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiFileText style={{ color: '#1890ff' }} />
          <Text strong onClick={() => onView(record)} style={{ cursor: 'pointer' }}>{text}</Text>
        </div>
      )
    },
    {
      title: "Customer",
      dataIndex: "customerName",
      key: "customer",
      width: 200,
      render: (text) => <Text strong>{text || "N/A"}</Text>
    },
    {
      title: "Date",
      dataIndex: "issueDate",
      key: "date",
      width: 150,
      render: (date) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FiCalendar style={{ color: '#faad14' }} />
          <Text>{dayjs(date).format('DD MMM YYYY')}</Text>
        </div>
      )
    },
    {
      title: "Total Amount",
      dataIndex: "total",
      key: "total",
      width: 150,
      render: (total) => <Text strong style={{ color: '#52c41a' }}>₹ {Number(total).toLocaleString('en-IN')}</Text>
    },
    {
      title: "Status",
      dataIndex: "payment_status",
      key: "status",
      width: 120,
      render: (status) => (
        <Tag color={status === 'paid' ? 'success' : 'warning'} className="status-tag">
          {status}
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
          overlay={
            <Menu>
              <Menu.Item key="view" icon={<FiEye />} onClick={() => onView(record)}>View Details</Menu.Item>
              <Menu.Item key="edit" icon={<FiEdit2 />} onClick={() => onEdit(record)}>Edit</Menu.Item>
              <Menu.Item key="delete" icon={<FiTrash2 />} danger onClick={() => handleDelete(record.id)}>Delete</Menu.Item>
            </Menu>
          }
          trigger={['click']}
        >
          <Button type="text" icon={<FiMoreVertical />} className="action-dropdown-button" />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="invoice-list-container">
      <Table
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        columns={columns}
        dataSource={filteredInvoices}
        loading={loading}
        rowKey="id"
        size="small"
        className="compact-table"
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} invoices`,
        }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default InvoiceList;
