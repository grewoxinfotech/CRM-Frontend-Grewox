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
  useGetInvoicesQuery,
  useDeleteInvoiceMutation,
  useUpdateInvoiceMutation,
} from "./services/invoiceApi";
import EditInvoice from "./EditInvoice";
import ViewInvoice from './ViewInvoice';
import { useGetAllCurrenciesQuery } from "../../../../superadmin/module/settings/services/settingsApi";

const { Text } = Typography;

const InvoiceList = () => {
  const { data: invoicesdata = [], isLoading } = useGetInvoicesQuery();
  const { data: currenciesData } = useGetAllCurrenciesQuery();
  const [deleteInvoice] = useDeleteInvoiceMutation();
  const [updateInvoice] = useUpdateInvoiceMutation();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const invoices = invoicesdata?.data || [];


 // Sample invoice data
 

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

  const handleView = (record) => {
    // Ensure we have valid data
    if (record) {
        setSelectedInvoice({
            ...record,
            items: Array.isArray(record.items) ? record.items : []
        });
        setIsViewModalOpen(true);
    }
  };

  const getDropdownItems = (record) => ({
    items: [
      {
        key: "view",
        icon: <FiEye style={{ fontSize: '14px' }} />,
        label: "View",
        onClick: () => handleView(record),
      },
      {
        key: "edit",
        icon: <FiEdit2 style={{ fontSize: '14px' }} />,
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
      title: "Date",
      dataIndex: "issueDate",
      key: "issueDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
      sorter: (a, b) => new Date(a.issueDate) - new Date(b.issueDate),
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      render: (date) => dayjs(date).format("DD/MM/YYYY"),
      sorter: (a, b) => new Date(a.dueDate) - new Date(b.dueDate),
    },
    {
      title: "Total",
      dataIndex: "total",
      key: "total",
      render: (amount, record) => {
        // Get currency details from the record
        const currencyDetails = currenciesData?.find(curr => curr.id === record.currency);
        const currencyIcon = currencyDetails?.currencyIcon || '₹';
        
        return (
          <Text strong>
            {currencyIcon}
            {Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </Text>
        );
      },
      sorter: (a, b) => a.total - b.total,
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amount, record) => {
        // Get currency details from the record
        const currencyDetails = currenciesData?.find(curr => curr.id === record.currency);
        const currencyIcon = currencyDetails?.currencyIcon || '₹';
        
        return (
          <Text strong>
            {currencyIcon}
            {Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </Text>
        );
      },
      sorter: (a, b) => a.total - b.total,
    },

    {
      title: "Status",
      dataIndex: "payment_status",
      key: "payment_status",
      sorter: (a, b) => a.payment_status.localeCompare(b.payment_status),
      render: (payment_status) => getStatusTag(payment_status),
    
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
