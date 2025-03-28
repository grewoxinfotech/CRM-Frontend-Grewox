import React, { useState } from "react";
import { Table, Button, Tag, Dropdown, Typography, Modal, message } from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiMoreVertical,
  FiDownload,
} from "react-icons/fi";
import dayjs from "dayjs";
import {
  useGetDealInvoicesQuery,
  useDeleteDealInvoiceMutation,
  useUpdateDealInvoiceMutation,
} from "./services/dealinvoiceApi";
import EditInvoice from "./EditInvoice";

const { Text } = Typography;

const InvoiceList = (deal) => {

  const dealId = deal.deal.id;
  const { data: invoicesdata = [], isLoading } = useGetDealInvoicesQuery(dealId);
  const [deleteInvoice] = useDeleteDealInvoiceMutation();
  const [updateInvoice] = useUpdateDealInvoiceMutation();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const invoices = invoicesdata?.data || [];
  // console.log("invoices", invoices);
  // Sample invoice data
  const sampleInvoices = [
    {
      id: 1,
      invoice_number: "INV-2024-001",
      customer_name: "John Doe Enterprises",
      date: "2024-03-20",
      due_date: "2024-04-20",
      total: 2500.0,
      status: "pending",
    },
    {
      id: 2,
      invoice_number: "INV-2024-002",
      customer_name: "Tech Solutions Inc.",
      date: "2024-03-18",
      due_date: "2024-04-18",
      total: 4750.5,
      status: "paid",
    },
    {
      id: 3,
      invoice_number: "INV-2024-003",
      customer_name: "Global Services Ltd.",
      date: "2024-03-15",
      due_date: "2024-03-22",
      total: 1850.75,
      status: "overdue",
    },
    {
      id: 4,
      invoice_number: "INV-2024-004",
      customer_name: "Creative Design Co.",
      date: "2024-03-22",
      due_date: "2024-04-22",
      total: 3200.0,
      status: "draft",
    },
    {
      id: 5,
      invoice_number: "INV-2024-005",
      customer_name: "Marketing Pro Agency",
      date: "2024-03-19",
      due_date: "2024-04-19",
      total: 5600.25,
      status: "paid",
    },
    {
      id: 6,
      invoice_number: "INV-2024-006",
      customer_name: "Digital Solutions LLC",
      date: "2024-03-21",
      due_date: "2024-04-21",
      total: 7200.0,
      status: "pending",
    },
    {
      id: 7,
      invoice_number: "INV-2024-007",
      customer_name: "Innovative Systems Corp",
      date: "2024-03-17",
      due_date: "2024-03-24",
      total: 3450.75,
      status: "overdue",
    },
    {
      id: 8,
      invoice_number: "INV-2024-008",
      customer_name: "Smart Tech Solutions",
      date: "2024-03-23",
      due_date: "2024-04-23",
      total: 4800.5,
      status: "draft",
    },
  ];

  const getStatusTag = (status) => {
    const statusColors = {
      draft: "#d97706",
      pending: "#2563eb",
      paid: "#059669",
      overdue: "#dc2626",
    };

    const statusBgColors = {
      draft: "#fef3c7",
      pending: "#dbeafe",
      paid: "#d1fae5",
      overdue: "#fee2e2",
    };

    return (
      <Tag
        className={`status-tag ${status}`}
        style={{
          color: statusColors[status],
          backgroundColor: statusBgColors[status],
          border: "none",
          textTransform: "capitalize",
          borderRadius: "6px",
          padding: "4px 8px",
        }}
      >
        {status}
      </Tag>
    );
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Delete Invoice",
      content: "Are you sure you want to delete this invoice?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      bodyStyle: {
        padding: "20px",
      },
      onOk: async () => {
        try {
          await deleteInvoice(id).unwrap();
          message.success("Invoice deleted successfully");
        } catch (error) {
          message.error(error?.data?.message || "Failed to delete invoice");
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

  const getDropdownItems = (record) => ({
    items: [
      {
        key: "view",
        icon: <FiEye />,
        label: "View Details",
        onClick: () => console.log("View invoice:", record.invoice_number),
      },
      {
        key: "edit",
        icon: <FiEdit2 />,
        label: "Edit",
        onClick: () => handleEdit(record),
      },
      {
        key: "download",
        icon: <FiDownload />,
        label: "Download PDF",
        onClick: () => console.log("Download PDF:", record.invoice_number),
      },
      {
        key: "delete",
        icon: <FiTrash2 />,
        label: "Delete",
        onClick: () => handleDelete(record.id),
        danger: true,
      },
    ],
  });

  const columns = [
    {
      title: "Invoice Number",
      dataIndex: "salesInvoiceNumber",
      key: "salesInvoiceNumber",
      sorter: (a, b) =>
        a.salesInvoiceNumber.localeCompare(b.salesInvoiceNumber),
      render: (text, record) => (
        <Text
          strong
          style={{ cursor: "pointer" }}
          onClick={() =>
            console.log("View invoice:", record.salesInvoiceNumber)
          }
        >
          {text}
        </Text>
      ),
    },
    {
      title: "Created By",
      dataIndex: "created_by",
      key: "created_by",
      sorter: (a, b) => a.created_by.localeCompare(b.created_by),
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: "Due Date",
      dataIndex: "due_date",
      key: "due_date",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
      sorter: (a, b) => new Date(a.due_date) - new Date(b.due_date),
    },
    {
      title: "Amount",
      dataIndex: "total",
      key: "total",
      align: "right",
      render: (amount) => (
        <Text strong>
          ₹
          {Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
        </Text>
      ),
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => getStatusTag(status),
      filters: [
        { text: "Draft", value: "draft" },
        { text: "Pending", value: "pending" },
        { text: "Paid", value: "paid" },
        { text: "Overdue", value: "overdue" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Action",
      key: "actions",
      width: 80,
      align: "center",
      render: (_, record) => (
        <Dropdown
          menu={getDropdownItems(record)}
          trigger={["click"]}
          placement="bottomRight"
          overlayClassName="invoice-actions-dropdown"
        >
          <Button
            type="text"
            icon={<FiMoreVertical />}
            className="action-dropdown-button"
            onClick={(e) => e.preventDefault()}
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="invoice-list">
      <Table
        columns={columns}
        dataSource={invoices}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
        }}
        className="invoice-table"
      />
      <EditInvoice
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setSelectedInvoice(null);
        }}
        onSubmit={handleEditSubmit}
        initialValues={selectedInvoice}
      />
    </div>
  );
};

export default InvoiceList;
