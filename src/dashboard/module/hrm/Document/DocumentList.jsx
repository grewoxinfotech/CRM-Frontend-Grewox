import React, { useState } from "react";
import { Table, Button, Space, Tag, Dropdown, Modal, message, Menu } from "antd";
import { FiEdit2, FiTrash2, FiMoreVertical, FiFile, FiUserCheck, FiFileText, FiImage, FiVideo, FiMusic, FiArchive, FiCode } from "react-icons/fi";
import moment from "moment";
import './document.scss';

const DocumentList = ({
  loading,
  documents = [],
  pagination = {},
  onEdit,
  onDelete,
  onPageChange,
  onPageSizeChange
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const getFileIcon = (fileName) => {
    if (!fileName) return <FiFile />;
    const ext = fileName.split('.').pop().toLowerCase();
    const map = { pdf: <FiFileText color="#ef4444" />, doc: <FiFileText color="#3b82f6" />, docx: <FiFileText color="#3b82f6" />, jpg: <FiImage color="#10b981" />, png: <FiImage color="#10b981" />, mp4: <FiVideo color="#f59e0b" />, zip: <FiArchive color="#6366f1" /> };
    return map[ext] || <FiFile color="#64748b" />;
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FiFile color="#6366f1" size={14} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 600, color: '#1e293b' }}>{text}</span>
            <span style={{ fontSize: '11px', color: '#64748b' }}>{record.description?.substring(0, 30)}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => <Tag color="blue" style={{ borderRadius: '4px', border: 'none', background: '#eff6ff', color: '#3b82f6' }}>{role}</Tag>,
    },
    {
      title: "File",
      dataIndex: "file",
      key: "file",
      render: (fileUrl) => {
        if (!fileUrl) return '-';
        const fileName = fileUrl.split('/').pop();
        return (
          <Space style={{ cursor: 'pointer' }} onClick={() => window.open(fileUrl, '_blank')}>
            {getFileIcon(fileName)}
            <span style={{ fontSize: '12px', color: '#3b82f6' }}>{fileName.substring(0, 20)}...</span>
          </Space>
        );
      },
    },
    {
      title: "Created By",
      dataIndex: "created_by",
      key: "created_by",
      render: (text) => <Text style={{ fontSize: '12px' }}>{text}</Text>,
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => <span style={{ fontSize: '12px' }}>{moment(date).format("DD MMM YYYY")}</span>,
    },
    {
      title: "Actions",
      key: "actions",
      width: 60,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key="edit" icon={<FiEdit2 size={14} />} onClick={() => onEdit(record)}>Edit</Menu.Item>
              <Menu.Item key="delete" danger icon={<FiTrash2 size={14} />} onClick={() => onDelete(record.id)}>Delete</Menu.Item>
            </Menu>
          }
          trigger={["click"]}
        >
          <Button type="text" icon={<FiMoreVertical size={16} />} size="small" />
        </Dropdown>
      ),
    },
  ];

  return (
    <Table
      rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
      columns={columns}
      dataSource={documents}
      loading={loading}
      rowKey="id"
      size="small"
      className="compact-table"
      pagination={{
        ...pagination,
        showSizeChanger: true,
        size: 'small',
        onChange: (page, pageSize) => {
          onPageChange(page);
          if (pageSize !== pagination.pageSize) onPageSizeChange(pageSize);
        }
      }}
      scroll={{ x: 'max-content' }}
    />
  );
};

export default DocumentList;
