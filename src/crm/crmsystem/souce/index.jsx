import React, { useState } from "react";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { useParams } from "react-router-dom";
import { Button, Table, Tag, Popconfirm } from "antd";
import AddSourceModal from "./AddSourceModal";
import EditSourceModal from "./EditSourceModal";
import {
  useGetSourcesQuery,
  useDeleteSourceMutation,
} from "./services/SourceApi";
import { toast } from "react-toastify";
import "./source.scss";
import { selectCurrentUser } from "../../../auth/services/authSlice";
import { useSelector } from "react-redux";

const Source = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);
  const userdata = useSelector(selectCurrentUser);

  const { data, isLoading, error } = useGetSourcesQuery(userdata?.id);
  const [deleteSource] = useDeleteSourceMutation();

  const sources = Array.isArray(data?.data)
    ? data.data.filter((item) => item.lableType === "source")
    : Array.isArray(data)
    ? data.filter((item) => item.lableType === "source")
    : [];

  const handleEditClick = (source) => {
    setSelectedSource(source);
    setIsEditModalOpen(true);
  };

  const handleDeleteSource = async (sourceId) => {
    try {
      await deleteSource(sourceId).unwrap();
      toast.success("Source deleted successfully");
    } catch (error) {
      toast.error(error?.data?.message || "Failed to delete source");
    }
  };

  const columns = [
    {
      title: "Source",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <Tag
          // color={record.color || "#1677ff"}
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
            title="Delete Source"
            description="Are you sure you want to delete this source?"
            onConfirm={() => handleDeleteSource(record.id)}
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
        Error loading sources: {error.message}
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
          {/* Sources */}
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
          Add Source
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={sources}
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

      <AddSourceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <EditSourceModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedSource(null);
        }}
        source={selectedSource}
      />
    </div>
  );
};

export default Source;
