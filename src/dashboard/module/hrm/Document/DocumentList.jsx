import React from "react";
import { Table, Button, Space, Tooltip, Tag, Empty } from "antd";
import { FiEdit2, FiTrash2, FiLink } from "react-icons/fi";
import moment from "moment";
import { useGetDocumentsQuery } from "./services/documentApi";

const DocumentList = ({ loading, onEdit, onDelete }) => {
  const { data: documents, isLoading, error } = useGetDocumentsQuery();
  console.log("documents", documents);
  const docdata = documents?.data;

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name) => <Tag color="blue">{name}</Tag>,
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      sorter: (a, b) => a.role.localeCompare(b.role),
      render: (role) => <Tag color="blue">{role}</Tag>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      sorter: (a, b) => a.description.localeCompare(b.description),
      render: (description) => (
        <span style={{ color: "#262626" }}>{description}</span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_, record) => (
        <Space className="action-buttons" size={4}>
          <Tooltip title="Edit Document">
            <Button
              type="text"
              icon={<FiEdit2 size={16} />}
              onClick={() => onEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Document">
            <Button
              type="text"
              danger
              icon={<FiTrash2 size={16} />}
              onClick={() => onDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Handle loading state
  if (isLoading) {
    return <Table loading={true} columns={columns} dataSource={[]} />;
  }

  // Handle error state
  if (error) {
    return (
      <Table
        columns={columns}
        dataSource={docdata}
        locale={{
          emptyText: <Empty description="Error loading documents" />,
        }}
      />
    );
  }

  // Ensure documents is an array
  const documentsList = Array.isArray(documents) ? documents : [];

  return (
    <Table
      columns={columns}
      dataSource={docdata}
      loading={loading}
      rowKey="id"
      pagination={{
        total: documentsList.length,
        pageSize: 10,
        showTotal: (total) => `Total ${total} documents`,
        showSizeChanger: true,
        showQuickJumper: true,
        size: "default",
        position: ["bottomRight"],
      }}
    />
  );
};

export default DocumentList;
