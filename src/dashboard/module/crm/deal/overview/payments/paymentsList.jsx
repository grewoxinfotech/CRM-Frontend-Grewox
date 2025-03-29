import React from "react";
import { Table, Avatar, Dropdown, Button, message, Tag, Typography } from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiMoreVertical,
  FiDollarSign,
} from "react-icons/fi";
import { useDeleteDealPaymentMutation, useGetDealPaymentsQuery } from "./services/dealpaymentApi";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../../../auth/services/authSlice";

const { Text } = Typography;

const PaymentsList = ({ deal, onEdit, onView }) => {
  const loggedInUser = useSelector(selectCurrentUser);
  const { data, isLoading, error } = useGetDealPaymentsQuery(deal?.deal?.id);
  const [deletePayment, { isLoading: isDeleting }] = useDeleteDealPaymentMutation();

  // Ensure data is always an array
  const payments = Array.isArray(data) ? data : [];

  const handleDelete = async (record) => {
    try {
      await deletePayment(record.id).unwrap();
      message.success("Payment deleted successfully");
    } catch (error) {
      message.error(
        "Failed to delete payment: " + (error.data?.message || "Unknown error")
      );
    }
  };

  const getMethodTag = (method) => {
    let className = "";
    switch (method?.toLowerCase()) {
      case "cash":
        className = "cash";
        break;
      case "bank_transfer":
        className = "bank_transfer";
        break;
      case "credit_card":
        className = "credit_card";
        break;
      case "debit_card":
        className = "debit_card";
        break;
      case "upi":
        className = "upi";
        break;
      case "cheque":
        className = "cheque";
        break;
      default:
        className = "";
    }
    return <Tag className={`method-tag ${className}`}>{method || "Unknown"}</Tag>;
  };

  const getDropdownItems = (record) => ({
    items: [
      {
        key: "view",
        icon: <FiEye />,
        label: "View Details",
        onClick: () => onView(record),
      },
      {
        key: "edit",
        icon: <FiEdit2 />,
        label: "Edit",
        onClick: () => onEdit(record),
      },
      {
        key: "delete",
        icon: <FiTrash2 />,
        label: "Delete",
        onClick: () => handleDelete(record),
        danger: true,
        disabled: isDeleting,
      },
    ],
  });

  const columns = [
    {
      title: "Invoice",
      dataIndex: "invoice",
      key: "invoice",
      sorter: (a, b) => (a.invoice || "").localeCompare(b.invoice || ""),
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Avatar 
            icon={<FiDollarSign />} 
            style={{ 
              backgroundColor: "#e6f7ff", 
              color: "#1890ff",
              marginRight: "12px" 
            }} 
          />
          <div>
            <Text strong>{text || "-"}</Text>
            <div>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {record.description || "-"}
              </Text>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Created By",
      dataIndex: "createdBy",
      key: "createdBy",
      render: (text) => text || "-",
    },
    {
      title: "Paid On",
      dataIndex: "paidOn",
      key: "paidOn",
      sorter: (a, b) => {
        const dateA = a.paidOn ? new Date(a.paidOn).getTime() : 0;
        const dateB = b.paidOn ? new Date(b.paidOn).getTime() : 0;
        return dateA - dateB;
      },
      render: (date) => (date ? dayjs(date).format("YYYY-MM-DD") : "-"),
    },
    {
      title: "Amount",
      key: "amount",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Text strong>
            {record.currency} {record.amount ? `${record.amount}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "-"}
          </Text>
        </div>
      ),
    },
    {
      title: "Payment Method",
      dataIndex: "paymentMethod",
      key: "paymentMethod",
      render: (method) => getMethodTag(method),
    },
    {
      title: "Transaction ID",
      dataIndex: "transactionId",
      key: "transactionId",
      render: (text) => text || "-",
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      render: (_, record) => (
        <Dropdown
          menu={getDropdownItems(record)}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Button
            type="text"
            icon={<FiMoreVertical />}
            className="action-button"
          />
        </Dropdown>
      ),
    },
  ];

  if (error) {
    return <div>Error loading payments: {error.message}</div>;
  }

  return (
    <div className="payment-content">
      <Table
        columns={columns}
        dataSource={payments}
        rowKey="id"
        loading={isLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} payments`,
        }}
        className="payment-table"
      />
    </div>
  );
};

export default PaymentsList;
