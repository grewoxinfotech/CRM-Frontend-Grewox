import React, { useState } from "react";
import { FiEdit2, FiTrash2, FiFileText, FiMoreVertical } from "react-icons/fi";
import { Button, Table, message, Dropdown, Typography, Modal } from "antd";
import AddContractTypeModal from "./AddContractTypeModal";
import EditContractTypeModal from "./EditContractTypeModal";
import { useGetContractTypesQuery, useDeleteContractTypeMutation } from "../souce/services/SourceApi";
import "./contractType.scss";
import { selectCurrentUser } from "../../../../../auth/services/authSlice";
import { useSelector } from "react-redux";

const { Text } = Typography;

const ContractType = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedContractType, setSelectedContractType] = useState(null);
  const userdata = useSelector(selectCurrentUser);

  const { data, isLoading } = useGetContractTypesQuery(userdata?.id);
  const [deleteContractType] = useDeleteContractTypeMutation();

  const contractTypes = data?.data || [];

  const handleEditClick = (contractType) => {
    setSelectedContractType(contractType);
    setIsEditModalOpen(true);
  };

  const handleDeleteContractType = (id) => {
    Modal.confirm({
      title: 'Delete Contract Type',
      content: 'Are you sure?',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteContractType(id).unwrap();
          message.success("Contract type deleted successfully");
        } catch (error) {
          message.error(error?.data?.message || "Failed to delete contract type");
        }
      }
    });
  };

  const columns = [
    {
      title: 'Contract Type Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiFileText color="#3b82f6" size={14} />
          </div>
          <Text strong style={{ color: '#1e293b' }}>{text}</Text>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 60,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: 'edit', icon: <FiEdit2 size={14} />, label: 'Edit', onClick: () => handleEditClick(record) },
              { key: 'delete', icon: <FiTrash2 size={14} />, label: 'Delete', danger: true, onClick: () => handleDeleteContractType(record.id) }
            ]
          }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button type="text" icon={<FiMoreVertical size={16} />} size="small" />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="contract-type-wrapper">
      <Table
        columns={columns}
        dataSource={contractTypes}
        rowKey="id"
        size="small"
        loading={isLoading}
        className="compact-table"
        pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} types`
        }}
        scroll={{ x: 'max-content' }}
      />

      <AddContractTypeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <EditContractTypeModal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setSelectedContractType(null); }} contractType={selectedContractType} />
    </div>
  );
};

export default ContractType;
