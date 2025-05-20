import React, { useState } from "react";
import {
  Table,
  Button,
  Tag,
  Dropdown,
  Typography,
  Modal,
  message,
  Space,
  Input,
  DatePicker,
  Menu,
} from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiMoreVertical,
  FiDownload,
  FiPlus,
  FiSearch,
  FiSend,
  FiFileText,
  FiCalendar,
  FiDollarSign,
} from "react-icons/fi";
import dayjs from "dayjs";
import {
  useGetInvoicesQuery,
  useDeleteInvoiceMutation,
  useUpdateInvoiceMutation,
} from "./services/invoiceApi";
import EditInvoice from "./EditInvoice";
import ViewInvoice from "./ViewInvoice";
import { useGetAllCurrenciesQuery } from "../../../../superadmin/module/settings/services/settingsApi";
import { useGetCustomersQuery } from "../customer/services/custApi";
import { useGetContactsQuery } from "../../crm/contact/services/contactApi";
import { useGetCompanyAccountsQuery } from "../../crm/companyacoount/services/companyAccountApi";
import "./invoice.scss";

const { Text } = Typography;
const { RangePicker } = DatePicker;

const InvoiceList = ({
  searchText = "",
  // invoices,
  // isLoading,
  filters = {},
}) => {
  const { data: invoicesdata = [], isLoading } = useGetInvoicesQuery();
  const { data: currenciesData } = useGetAllCurrenciesQuery();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [deleteInvoice] = useDeleteInvoiceMutation();
  const [updateInvoice] = useUpdateInvoiceMutation();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const invoices = invoicesdata?.data || [];
  const { data: customersData } = useGetCustomersQuery();

  const statuses = [
    { id: "paid", name: "Paid" },
    { id: "unpaid", name: "Unpaid" },
    { id: "partial", name: "Partial" },
  ];

  // Filter invoices based on search text and date range
  const filteredInvoices = React.useMemo(() => {
    return invoices?.filter((invoice) => {
      const searchLower = searchText.toLowerCase();
      const invoiceNumber = invoice?.salesInvoiceNumber?.toLowerCase() || "";
      const customerName = invoice?.customer?.toLowerCase() || "";
      const total = invoice?.total?.toString().toLowerCase() || "";
      const status = invoice?.payment_status?.toLowerCase() || "";

      const matchesSearch =
        !searchText ||
        invoiceNumber.includes(searchLower) ||
        customerName.includes(searchLower) ||
        total.includes(searchLower) ||
        status.includes(searchLower);

      const matchesDateRange =
        !filters.dateRange?.length ||
        (dayjs(invoice?.issueDate).isAfter(filters.dateRange[0]) &&
          dayjs(invoice?.dueDate).isBefore(filters.dateRange[1]));

      return matchesSearch && matchesDateRange;
    });
  }, [invoices, searchText, filters]);

  const getStatusTag = (status) => {
    const statusConfig = {
      paid: {
        color: '#059669',
        bgColor: '#d1fae5',
        icon: <FiDollarSign className="status-icon" />,
      },
      unpaid: {
        color: '#dc2626',
        bgColor: '#fee2e2',
        icon: <FiDollarSign className="status-icon" />,
      },
      partially_paid: {
        color: '#7c3aed',
        bgColor: '#ede9fe',
        icon: <FiDollarSign className="status-icon" />,
      },
    };

    const config = statusConfig[status] || statusConfig.unpaid;

    return (
      <Tag
        className={`status-tag ${status}`}
        style={{
          color: config.color,
          backgroundColor: config.bgColor,
          border: 'none',
          textTransform: 'capitalize',
          borderRadius: '6px',
          padding: '4px 8px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        {config.icon}
        {status.replace('_', ' ')}
      </Tag>
    );
  };

  const handleDelete = (recordOrIds) => {
    const isMultiple = Array.isArray(recordOrIds);
    const title = isMultiple ? 'Delete Invoices' : 'Delete Invoice';
    const content = isMultiple
      ? `Are you sure you want to delete ${recordOrIds.length} selected invoices? This action cannot be undone.`
      : 'Are you sure you want to delete this invoice?';

    Modal.confirm({
      title,
      content,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      bodyStyle: { padding: "20px" },
      onOk: async () => {
        try {
          if (isMultiple) {
            await Promise.all(recordOrIds.map(id => deleteInvoice(id).unwrap()));
            message.success(`${recordOrIds.length} invoices deleted successfully`);
            setSelectedRowKeys([]);
          } else {
            await deleteInvoice(recordOrIds).unwrap();
            message.success('Invoice deleted successfully');
          }
        } catch (error) {
          message.error(error?.data?.message || 'Failed to delete invoice(s)');
        }
      },
    });
  };

  const handleEdit = (record) => {
    setSelectedInvoice(record);
    setEditModalVisible(true);
  };

  const handleEditSubmit = async (formData) => {
    try {
      await updateInvoice({
        id: selectedInvoice.id,
        data: formData,
      }).unwrap();
      setEditModalVisible(false);
      setSelectedInvoice(null);
    } catch (error) {
      message.error(error?.data?.message || "Failed to update invoice");
    }
  };

  const handleView = (record) => {
    // Ensure we have valid data
    if (record) {
      let items = [];
      try {
        // Parse items if it's a string
        if (typeof record.items === "string") {
          items = JSON.parse(record.items);
        } else if (Array.isArray(record.items)) {
          items = record.items;
        }

        // Format items to ensure consistent structure
        items = items.map((item) => ({
          item_name: item.item_name || item.name || item.description,
          quantity: Number(item.quantity) || 0,
          unit_price: Number(item.unit_price || item.rate) || 0,
          description: item.description || item.item_name || item.name,
          hsn_sac: item.hsn_sac || item.hsnSac || item.hsn,
          tax_rate: item.tax_rate || item.taxRate,
          tax_amount: item.tax_amount || item.taxAmount,
          discount: item.discount || 0,
          amount: item.amount || 0,
          discount_type: item.discount_type || item.discountType,
        }));
      } catch (error) {
        console.error("Error parsing invoice items:", error);
        items = [];
      }

      // Format the invoice data
      const formattedInvoice = {
        ...record,
        items,
        subtotal: Number(record.subtotal) || 0,
        tax: Number(record.tax) || 0,
        discount: Number(record.discount) || 0,
        total: Number(record.total) || 0,
        issueDate: record.issueDate || new Date(),
        dueDate: record.dueDate || new Date(),
      };

      setSelectedInvoice(formattedInvoice);
      setIsViewModalOpen(true);
    }
  };

  const getDropdownItems = (record) => ({
    items: [
      {
        key: "view",
        icon: <FiEye style={{ fontSize: "14px" }} />,
        label: "View Invoice",
        onClick: () => handleView(record),
      },
      {
        key: "edit",
        icon: <FiEdit2 style={{ fontSize: "14px" }} />,
        label: "Edit Invoice",
        onClick: () => handleEdit(record),
      },
      // {
      //   key: "send_invoice",
      //   icon: <FiSend style={{ fontSize: "14px" }} />,
      //   label: "Send Invoice to Customer",
      //   onClick: () => handleSendInvoice(record),
      // },
      // {
      //   key: "download",
      //   icon: <FiDownload />,
      //   label: "Download Invoice",
      //   onClick: () => {
      //     setSelectedInvoice(record);
      //     setIsViewModalOpen(true);
      //   },
      // },
      {
        key: "delete",
        icon: <FiTrash2 />,
        label: "Delete Invoice",
        onClick: () => handleDelete(record.id),
        danger: true,
      },
    ],
  });

  const getCustomerName = (customerId) => {
    if (!customerId || !customersData?.data) return "N/A";
    const customer = customersData.data.find(c => c.id === customerId);
    return customer?.name || customer?.companyName || "N/A";
  };

  const columns = [
    {
      title: "Invoice Details",
      key: "invoice",
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search invoice number"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button type="primary" onClick={() => confirm()} size="small" style={{ width: 90 }}>Filter</Button>
            <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>Reset</Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) => record.salesInvoiceNumber?.toLowerCase().includes(value.toLowerCase()),
      render: (_, record) => (
        <div className="item-wrapper">
          <div className="item-content">
            <div className="icon-wrapper" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
              <FiFileText className="item-icon" />
            </div>
            <div className="info-wrapper">
              <div className="name">{record.salesInvoiceNumber}</div>
              <div className="meta" style={{ color: '#4b5563' }}>{getCustomerName(record.customer)}</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Dates",
      key: "dates",
      render: (_, record) => (
        <div className="item-wrapper">
          <div className="item-content">
            <div className="icon-wrapper" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
              <FiCalendar className="item-icon" />
            </div>
            <div className="info-wrapper">
              <div className="main-info">
                <Text>Issue: {dayjs(record.issueDate).format('DD MMM YYYY')}</Text>
              </div>
              <Text type="secondary" className="sub-info">
                Due: {dayjs(record.dueDate).format('DD MMM YYYY')}
              </Text>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Amount",
      key: "amount",
      sorter: (a, b) => a.total - b.total,
      render: (_, record) => (
        <div className="item-wrapper">
          <div className="item-content">
            <div className="info-wrapper" style={{ padding: '8px 0' }}>
              <div className="name" style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                ₹ {record.total?.toFixed(2)}
              </div>
              <div className="meta">
                {getStatusTag(record.payment_status)}
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      render: (_, record) => (
        <Dropdown
          overlay={
            <Menu>
              {getDropdownItems(record).items.map(item => (
                <Menu.Item key={item.key} icon={item.icon} onClick={item.onClick} danger={item.danger}>
                  {item.label}
                </Menu.Item>
              ))}
            </Menu>
          }
          trigger={['click']}
        >
          <Button
            type="text"
            icon={<FiMoreVertical size={16} />}
            className="action-button"
          />
        </Dropdown>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  return (
    <div className="invoice-list-container">
      {selectedRowKeys.length > 0 && (
        <div className="bulk-actions">
          <Button
            type="primary"
            danger
            icon={<FiTrash2 />}
            onClick={() => handleDelete(selectedRowKeys)}
          >
            Delete Selected ({selectedRowKeys.length})
          </Button>
        </div>
      )}

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={filteredInvoices}
        loading={isLoading}
        rowKey="id"
        className="custom-table"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} invoices`,
        }}
      />

      <EditInvoice
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedInvoice(null);
        }}
        initialValues={selectedInvoice}
      />

      <ViewInvoice
        open={isViewModalOpen}
        onCancel={() => {
          setIsViewModalOpen(false);
          setSelectedInvoice(null);
        }}
        invoice={selectedInvoice}
      />
    </div>
  );
};

export default InvoiceList;
