import React, { useState } from "react";
import { FiEdit2, FiTrash2, FiDatabase, FiMoreVertical } from "react-icons/fi";
import AddSourceModal from "./AddSourceModal";
import EditSourceModal from "./EditSourceModal";
import {
  useGetSourcesQuery,
  useDeleteSourceMutation,
} from "./services/SourceApi";
import "./source.scss";
import { Button, Modal, message, Table, Dropdown, Typography } from "antd";
import { selectCurrentUser } from "../../../../../auth/services/authSlice";
import { useSelector } from "react-redux";

const { Text } = Typography;

const Source = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState(null);
  const userdata = useSelector(selectCurrentUser);

  const { data: sourcesData = [], isLoading } = useGetSourcesQuery(userdata?.id);
  const [deleteSource] = useDeleteSourceMutation();

  const sources = sourcesData?.data?.filter(item => item.lableType === "source") || [];

  const handleEdit = (source) => {
    setSelectedSource(source);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete Source',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await deleteSource(id).unwrap();
          message.success('Deleted successfully');
        } catch (error) {
          message.error('Failed to delete');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Source Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '24px',
              height: '24px',
              borderRadius: '6px',
              backgroundColor: record.color || '#1890ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '12px'
            }}
          >
            <FiDatabase />
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
    <div className="source-wrapper">
      <Table
        columns={columns}
        dataSource={sources}
        rowKey="id"
        size="small"
        loading={isLoading}
        className="compact-table"
        pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} sources`
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
