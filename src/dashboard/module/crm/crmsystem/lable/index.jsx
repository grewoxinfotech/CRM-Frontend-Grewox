import React, { useState } from "react";
import { FiEdit2, FiTrash2, FiTag, FiMoreVertical } from "react-icons/fi";
import { Button, Table, message, Modal, Dropdown, Typography } from "antd";
import AddLableModal from "./AddLableModal";
import EditLableModal from "./EditLableModal";
import { useGetLabelsQuery, useDeleteLabelMutation } from "../souce/services/SourceApi";
import "./lable.scss";
import { selectCurrentUser } from "../../../../../auth/services/authSlice";
import { useSelector } from "react-redux";

const { Text } = Typography;

const Lable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLable, setSelectedLable] = useState(null);
  const userdata = useSelector(selectCurrentUser);

  const { data, isLoading } = useGetLabelsQuery(userdata?.id);
  const [deleteLabel] = useDeleteLabelMutation();

  const labels = data?.data || [];

  const handleEdit = (label) => {
    setSelectedLable(label);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete Label',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await deleteLabel(id).unwrap();
          message.success('Deleted successfully');
        } catch (error) {
          message.error('Failed to delete');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Label Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              background: record.color || '#1890ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px'
            }}
          >
            <FiTag />
          </div>
          <Text strong style={{ color: '#1e293b' }}>{text}</Text>
        </div>
      ),
    },
    {
      title: 'Hex Code',
      dataIndex: 'color',
      key: 'color',
      render: (color) => (
        <code style={{ fontSize: '12px', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px' }}>{color}</code>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      render: (_, record) => (
        <Dropdown
            menu={{
                items: [
                    { key: 'edit', icon: <FiEdit2 />, label: 'Edit', onClick: () => handleEdit(record) },
                    { key: 'delete', icon: <FiTrash2 />, label: 'Delete', danger: true, onClick: () => handleDelete(record.id) }
                ]
            }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button type="text" icon={<FiMoreVertical />} className="action-dropdown-button" />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="label-wrapper">
      <Table
        columns={columns}
        dataSource={labels}
        rowKey="id"
        size="small"
        loading={isLoading}
        className="compact-table"
        pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} labels`
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
