import React, { useState } from "react";
import { Table, Button, Tag } from "antd";
import { FiEye, FiEdit2, FiTrash2 } from "react-icons/fi";
import moment from "moment";
import EditCompany from "./EditNotes";

const CompanyList = ({ companies, loading, onView, onEdit, onDelete }) => {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const handleEdit = (company) => {
    setSelectedCompany(company);
    setEditModalVisible(true);
  };

  const handleEditCancel = () => {
    setSelectedCompany(null);
    setEditModalVisible(false);
  };

  const handleEditComplete = (updatedCompany) => {
    setEditModalVisible(false);
    setSelectedCompany(null);
    if (onEdit) {
      onEdit(updatedCompany);
    }
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      sorter: (a, b) => (a.title || "").localeCompare(b.title || ""),
      render: (text) => <div style={{ fontWeight: 500 }}>{text || "N/A"}</div>,
      width: "20%",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => {
        const color = type === "important" ? "red" : "blue";
        return <Tag color={color}>{type.toUpperCase()}</Tag>;
      },
      width: "10%",
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => text || "N/A",
      width: "30%",
    },
    {
      title: "Created By",
      dataIndex: "created_by",
      key: "created_by",
      render: (text) => text || "N/A",
      width: "15%",
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      render: (date) => (date ? moment(date).format("YYYY-MM-DD HH:mm") : "-"),
      sorter: (a, b) =>
        new Date(a.created_at || 0) - new Date(b.created_at || 0),
      width: "15%",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <div className="action-buttons">
          <Button
            type="text"
            icon={<FiEye />}
            onClick={(e) => {
              e.stopPropagation();
              onView(record);
            }}
            title="View Note"
          />
          <Button
            type="text"
            icon={<FiEdit2 />}
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(record);
            }}
            title="Edit Note"
          />
          <Button
            type="text"
            icon={<FiTrash2 />}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(record);
            }}
            title="Delete Note"
            danger
          />
        </div>
      ),
      width: "150px",
      align: "center",
    },
  ];

  return (
    <>
      <Table
        dataSource={companies}
        columns={columns}
        rowKey={(record) => record.id}
        loading={loading}
        scroll={{ x: 1100 }}
        pagination={{
          current: currentPage,
          pageSize: 10,
          total: companies.length,
          showSizeChanger: false,
          showQuickJumper: false,
          onChange: (page) => setCurrentPage(page),
        }}
      />

      {editModalVisible && (
        <EditCompany
          visible={editModalVisible}
          onCancel={handleEditCancel}
          onComplete={handleEditComplete}
          initialValues={selectedCompany}
          loading={loading}
        />
      )}
    </>
  );
};

export default CompanyList;
