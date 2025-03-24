import React from "react";
import { Table, Avatar, Dropdown, Button, message } from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiUser,
  FiMoreVertical,
} from "react-icons/fi";
import { useGetLeadsQuery, useDeleteLeadMutation } from "./services/LeadApi";

const LeadList = ({ onEdit, onView }) => {
  const { data: leadsData, isLoading, error } = useGetLeadsQuery();
  const [deleteLead] = useDeleteLeadMutation();

  const handleDelete = async (record) => {
    try {
      await deleteLead(record.id).unwrap();
      message.success("Lead deleted successfully");
    } catch (error) {
      message.error(
        "Failed to delete lead: " + (error.data?.message || "Unknown error")
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
      },
    ],
  });

  const columns = [
    {
      title: "Lead Title",
      dataIndex: "leadTitle",
      key: "leadTitle",
      sorter: (a, b) => a.leadTitle.localeCompare(b.leadTitle),
    },
    {
      title: "Name",
      key: "name",
      render: (record) => `${record.firstName} ${record.lastName}`,
      sorter: (a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(
          `${b.firstName} ${b.lastName}`
        ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      sorter: (a, b) => a.email.localeCompare(b.email),
    },
    {
      title: "Phone",
      dataIndex: "telephone",
      key: "telephone",
      sorter: (a, b) => (a.telephone || "").localeCompare(b.telephone || ""),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <span
          style={{
            textTransform: "capitalize",
            color:
              status === "active"
                ? "#52c41a"
                : status === "pending"
                ? "#faad14"
                : status === "lost"
                ? "#ff4d4f"
                : "#1890ff",
          }}
        >
          {status}
        </span>
      ),
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
          overlayClassName="lead-actions-dropdown"
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
    return <div>Error loading leads: {error.message}</div>;
  }

  return (
    <Table
      columns={columns}
      dataSource={leadsData?.data || []}
      rowKey="id"
      loading={isLoading}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showTotal: (total) => `Total ${total} items`,
      }}
      className="lead-table"
    />
  );
};

export default LeadList;
