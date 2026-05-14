import React, { useState } from "react";
import { FiEdit2, FiTrash2, FiTag, FiMoreVertical } from "react-icons/fi";
import { Button, Table, message, Modal, Dropdown, Typography } from "antd";
import AddLableModal from "./AddLableModal";
import EditLableModal from "./EditLableModal";
import { useGetTagsQuery, useDeleteTagMutation } from "../souce/services/SourceApi";
import "./lable.scss";
import { selectCurrentUser } from "../../../../../auth/services/authSlice";
import { useSelector } from "react-redux";

const { Text } = Typography;

const Lable = ({ isModalOpen, setIsModalOpen }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);
  const userdata = useSelector(selectCurrentUser);

  const { data, isLoading } = useGetTagsQuery(userdata?.client_id || userdata?.id);
  const [deleteTag] = useDeleteTagMutation();

  const tags = data?.data || [];

  const handleEdit = (tag) => {
    setSelectedTag(tag);
    setIsEditModalOpen(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete Tag',
      content: 'Are you sure?',
      onOk: async () => {
        try {
          await deleteTag(id).unwrap();
          message.success('Tag deleted successfully');
        } catch (error) {
          message.error('Failed to delete tag');
        }
      },
    });
  };

  const columns = [
    {
      title: 'Tag Name',
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
        dataSource={tags}
        rowKey="id"
        size="small"
        loading={isLoading}
        className="compact-table"
        pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} tags`
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
          setSelectedTag(null);
        }}
        lable={selectedTag}
      />
    </div>
  );
};

export default Lable;
