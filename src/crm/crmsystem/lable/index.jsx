import React, { useState } from "react";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { useParams } from "react-router-dom";
import { Button, Table, Tag, Popconfirm, message } from "antd";
import AddLableModal from "./AddLableModal";
import EditLableModal from "./EditLableModal";
import { useGetLablesQuery, useDeleteLableMutation } from "./services/LableApi";

import "./lable.scss";
import { selectCurrentUser } from "../../../auth/services/authSlice";
import { useSelector } from "react-redux";

const Lable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLable, setSelectedLable] = useState(null);
  const userdata = useSelector(selectCurrentUser);

  const { data, isLoading, error } = useGetLablesQuery(userdata?.id);
  const [deleteLable] = useDeleteLableMutation();

  const lables = Array.isArray(data?.data)
    ? data.data.filter((item) => item.lableType === "lable")
    : Array.isArray(data)
    ? data.filter((item) => item.lableType === "lable")
    : [];

  const handleEditClick = (lable) => {
    setSelectedLable(lable);
    setIsEditModalOpen(true);
  };

  const handleDeleteLable = async (lableId) => {
    try {
      await deleteLable(lableId).unwrap();
      message.success("Lable deleted successfully");
    } catch (error) {
      message.error(error?.data?.message || "Failed to delete lable");
    }
  };

  const columns = [
    {
      title: "Lable",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Tag
          style={{
            padding: "6px 12px",
            fontSize: "14px",
            borderRadius: "6px",
            fontWeight: "500",
          }}
        >
          {text}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      width: 120,
      render: (_, record) => (
        <div
          style={{
            display: "flex",
            gap: "8px",
            justifyContent: "flex-start",
            alignItems: "center",
          }}
        >
          <Button
            type="text"
            icon={<FiEdit2 />}
            onClick={() => handleEditClick(record)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "32px",
              height: "32px",
              borderRadius: "6px",
              transition: "all 0.3s",
            }}
          />
          <Popconfirm
            title="Delete Lable"
            description="Are you sure you want to delete this lable?"
            onConfirm={() => handleDeleteLable(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<FiTrash2 />}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "32px",
                height: "32px",
                borderRadius: "6px",
                transition: "all 0.3s",
              }}
            />
          </Popconfirm>
        </div>
      ),
    },
  ];

  if (error) {
    return (
      <div
        style={{
          padding: "24px",
          textAlign: "center",
          color: "#ff4d4f",
          background: "#fff1f0",
          borderRadius: "8px",
          margin: "24px",
        }}
      >
        Error loading lables: {error.message}
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "24px",
        background: "#ffffff",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          padding: "0 0 16px",
          borderBottom: "1px solid #f0f0f0",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "24px",
            fontWeight: "600",
            color: "#111827",
          }}
        >
          {/* Lables */}
        </h2>
        <Button
          type="primary"
          icon={<FiPlus />}
          onClick={() => setIsModalOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            height: "40px",
            padding: "0 16px",
            borderRadius: "8px",
            fontWeight: "500",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
          }}
        >
          Add Lable
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={lables}
        rowKey="id"
        loading={isLoading}
        style={{
          borderRadius: "8px",
          overflow: "hidden",
        }}
        pagination={{
          pageSize: 10,
          position: ["bottomCenter"],
          style: { marginTop: "16px" },
        }}
      />

      <AddLableModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <EditLableModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedLable(null);
        }}
        lable={selectedLable}
      />
    </div>
  );
};

export default Lable;
