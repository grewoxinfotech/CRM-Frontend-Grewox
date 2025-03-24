import React from "react";
import { Table, Avatar, Dropdown, Button, message } from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiUser,
  FiMoreVertical,
} from "react-icons/fi";
import { useGetDealsQuery, useDeleteDealMutation } from "./services/DealApi";
import dayjs from "dayjs";

const DealList = ({ onEdit, onView }) => {
  const { data, isLoading, error } = useGetDealsQuery();
  const [deleteDeal, { isLoading: isDeleting }] = useDeleteDealMutation();

  // Ensure data is always an array
  const deals = Array.isArray(data) ? data : [];

  const handleDelete = async (record) => {
    try {
      await deleteDeal(record.id).unwrap();
      message.success("Deal deleted successfully");
    } catch (error) {
      message.error(
        "Failed to delete deal: " + (error.data?.message || "Unknown error")
      );
    }
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
      title: "Lead Title",
      dataIndex: "leadTitle",
      key: "leadTitle",
      sorter: (a, b) => (a.leadTitle || "").localeCompare(b.leadTitle || ""),
      render: (text) => text || "-",
    },
    {
      title: "Deal Name",
      dataIndex: "dealName",
      key: "dealName",
      sorter: (a, b) => (a.dealName || "").localeCompare(b.dealName || ""),
      render: (text) => text || "-",
    },
    {
      title: "Pipeline",
      dataIndex: "pipeline",
      key: "pipeline",
      sorter: (a, b) => (a.pipeline || "").localeCompare(b.pipeline || ""),
      render: (text) => text || "-",
    },
    {
      title: "Stage",
      dataIndex: "stage",
      key: "stage",
      sorter: (a, b) => (a.stage || "").localeCompare(b.stage || ""),
      render: (text) => text || "-",
    },
    {
      title: "Currency",
      dataIndex: "currency",
      key: "currency",
      sorter: (a, b) => (a.currency || "").localeCompare(b.currency || ""),
      render: (text) => text || "-",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      sorter: (a, b) => (Number(a.price) || 0) - (Number(b.price) || 0),
      render: (value) =>
        value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "-",
    },
    {
      title: "Closed Date",
      dataIndex: "closedDate",
      key: "closedDate",
      sorter: (a, b) => {
        const dateA = a.closedDate ? new Date(a.closedDate).getTime() : 0;
        const dateB = b.closedDate ? new Date(b.closedDate).getTime() : 0;
        return dateA - dateB;
      },
      render: (date) => (date ? dayjs(date).format("YYYY-MM-DD") : "-"),
    },
    {
      title: "Project",
      dataIndex: "project",
      key: "project",
      sorter: (a, b) => (a.project || "").localeCompare(b.project || ""),
      render: (text) => text || "-",
    },
    {
      title: "Created By",
      dataIndex: "created_by",
      key: "created_by",
      sorter: (a, b) => (a.created_by || "").localeCompare(b.created_by || ""),
      render: (text) => text || "-",
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      align: "center",
      render: (_, record) => (
        <Dropdown
          menu={getDropdownItems(record)}
          trigger={["click"]}
          placement="bottomRight"
          overlayClassName="deal-actions-dropdown"
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

  if (error) {
    return <div>Error loading deals: {error.message}</div>;
  }

  return (
    <Table
      columns={columns}
      dataSource={deals}
      rowKey="id"
      loading={isLoading}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `Total ${total} deals`,
      }}
      className="deal-table"
    />
  );
};

export default DealList;
