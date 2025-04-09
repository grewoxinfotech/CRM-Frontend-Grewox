import React from "react";
import { Table, Avatar, Dropdown, Button, message, Tag, Typography, Select } from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiMoreVertical,
  FiFileText,
} from "react-icons/fi";
import { useDeleteDealInvoiceMutation, useGetInvoiceByIdQuery, useUpdateDealInvoiceMutation } from "./services/dealinvoiceApi";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../../../auth/services/authSlice";

const { Text } = Typography;
const { Option } = Select;

const InvoiceList = ({ deal, onEdit, onView, currencies }) => {

  const dealId = deal?.deal?.id;
  const loggedInUser = useSelector(selectCurrentUser);
  const { data: invoice, isLoading, error } = useGetInvoiceByIdQuery(dealId);
  const [deleteInvoice, { isLoading: isDeleting }] = useDeleteDealInvoiceMutation();
  const [updateInvoice] = useUpdateDealInvoiceMutation();

  // Ensure invoices is always an array
  const invoices = React.useMemo(() => {
    if (!invoice?.data) return [];
    if (Array.isArray(invoice.data)) return invoice.data;
    if (invoice.data && typeof invoice.data === 'object') return [invoice.data];
    return [];
  }, [invoice]);


  const handleDelete = async (record) => {
    try {
      await deleteInvoice(record.id).unwrap();
      message.success("Invoice deleted successfully");
    } catch (error) {
      message.error(
        "Failed to delete invoice: " + (error.data?.message || "Unknown error")
      );
    }
  };

  const handleStatusChange = async (record, newStatus) => {
    try {
      // Parse items if it's a string
      let items = record.items;
      try {
        if (typeof record.items === 'string') {
          items = JSON.parse(record.items);
        }
      } catch (e) {
        console.error('Error parsing items:', e);
        items = {};
      }

      // Prepare the data for update
      const updateData = {
        ...record,
        status: newStatus,
        items: items // Send parsed items object
      };

      // Remove fields that might cause issues
      delete updateData.createdAt;
      delete updateData.updatedAt;
      delete updateData.created_by;
      delete updateData.updated_by;

      await updateInvoice({
        id: record.id,
        data: updateData
      }).unwrap();
      
      message.success("Invoice status updated successfully");
    } catch (error) {
      console.error('Update error:', error);
      message.error("Failed to update invoice status: " + (error.data?.message || "Unknown error"));
    }
  };

  const getStatusTag = (status) => {
    let color = "";
    switch (status?.toLowerCase()) {
      case "paid":
        color = "success";
        break;
      case "pending":
        color = "warning";
        break;
      case "overdue":
        color = "error";
        break;
      case "draft":
        color = "default";
        break;
      default:
        color = "default";
    }
    return <Tag color={color}>{status || "Unknown"}</Tag>;
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
      title: "Invoice Number",
      dataIndex: "invoiceNumber",
      key: "invoiceNumber",
      sorter: (a, b) => (a.invoiceNumber || "").localeCompare(b.invoiceNumber || ""),
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <Avatar 
            icon={<FiFileText />} 
            style={{ 
              backgroundColor: "#e6f7ff", 
              color: "#1890ff",
              marginRight: "12px" 
            }} 
          />
          <div>
            <Text strong>{text || "-"}</Text>
            {/* <div>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                {record.description || "-"}
              </Text>
            </div> */}
          </div>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 150,
      render: (status, record) => (
        <Select
          value={status || "draft"}
          style={{ width: "100%" }}
          onChange={(value) => handleStatusChange(record, value)}
          bordered={false}
          dropdownMatchSelectWidth={false}
        >
          <Option value="draft">
            <Tag color="default">Draft</Tag>
          </Option>
          <Option value="pending">
            <Tag color="warning">Pending</Tag>
          </Option>
          <Option value="paid">
            <Tag color="success">Paid</Tag>
          </Option>
          <Option value="overdue">
            <Tag color="error">Overdue</Tag>
          </Option>
        </Select>
      ),
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      key: "dueDate",
      sorter: (a, b) => {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        return dateA - dateB;
      },
      render: (date) => (date ? dayjs(date).format("DD-MM-YYYY") : "-"),
    },
    {
      title: "Amount",
      key: "amount",
      render: (_, record) => {
        const currencyDetails = currencies?.find(c => c.id === record.currency);
        
        return (
          <div style={{ display: "flex", alignItems: "center" }}>
            <Text strong>
              {currencyDetails?.currencyIcon || '₹'} {record.total ? `${record.total}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "-"}
            </Text>
          </div>
        );
      },
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
    return <div>Error loading invoices: {error.message}</div>;
  }

  return (
    <div className="invoice-content">
      <Table
        columns={columns}
        dataSource={invoices}
        rowKey="id"
        loading={isLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} invoices`,
        }}
        className="invoice-table"
      />
    </div>
  );
};

export default InvoiceList;
