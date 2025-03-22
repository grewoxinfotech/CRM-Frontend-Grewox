import React, { useState } from "react";
import { FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";
import { Button, Table, Tag, Popconfirm, message } from "antd";
import AddContractTypeModal from "./AddContractTypeModal";
import EditContractTypeModal from "./EditContractTypeModal";
import {
  useGetContractTypesQuery,
  useDeleteContractTypeMutation,
} from "./services/ContractTypeApi";

import "./contractType.scss";
import { selectCurrentUser } from "../../../auth/services/authSlice";
import { useSelector } from "react-redux";

const ContractType = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedContractType, setSelectedContractType] = useState(null);
  const userdata = useSelector(selectCurrentUser);

  const { data, isLoading, error } = useGetContractTypesQuery(userdata?.id);
  const [deleteContractType] = useDeleteContractTypeMutation();

  const contractTypes = Array.isArray(data?.data)
    ? data.data.filter((item) => item.lableType === "contractType")
    : Array.isArray(data)
    ? data.filter((item) => item.lableType === "contractType")
    : [];

  const handleEditClick = (contractType) => {
    setSelectedContractType(contractType);
    setIsEditModalOpen(true);
  };

  const handleDeleteContractType = async (contractTypeId) => {
    try {
      await deleteContractType(contractTypeId).unwrap();
      message.success("Contract type deleted successfully");
    } catch (error) {
      message.error(error?.data?.message || "Failed to delete contract type");
    }
  };

  const columns = [
    {
      title: "Contract Type",
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
              marginBottom: "24px",
            }}
          />
          <Popconfirm
            title="Delete Contract Type"
            description="Are you sure you want to delete this contract type?"
            onConfirm={() => handleDeleteContractType(record.id)}
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
        Error loading contract types: {error.message}
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
          {/* Contract Types */}
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
          Add Contract Type
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={contractTypes}
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

      <AddContractTypeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <EditContractTypeModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedContractType(null);
        }}
        contractType={selectedContractType}
      />
    </div>
  );
};

export default ContractType;
