import React, { useState } from "react";
import { Table, Button, Space, Tooltip, Tag, Dropdown, Modal, message, Menu } from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiMoreVertical,
  FiFile,
  FiUserCheck,
  FiFileText,
  FiImage,
  FiVideo,
  FiMusic,
  FiArchive,
  FiCode
} from "react-icons/fi";
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

  // Row selection config
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    }
  };

  const handleTableChange = (pagination) => {
    onPageChange?.(pagination.current);
    onPageSizeChange?.(pagination.pageSize);
  };

  // Bulk actions component
  const BulkActions = () => (
    <div className={`bulk-actions ${selectedRowKeys.length > 0 ? 'active' : ''}`}>
      {selectedRowKeys.length > 0 && (
        <Button
          type="primary"
          danger
          icon={<FiTrash2 size={16} />}
          onClick={() => handleBulkDelete(selectedRowKeys)}
        >
          Delete Selected ({selectedRowKeys.length})
        </Button>
      )}
    </div>
  );

  const handleBulkDelete = (ids) => {
    Modal.confirm({
      title: 'Delete Selected Documents',
      content: `Are you sure you want to delete ${ids.length} selected documents?`,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => {
        Promise.all(ids.map(id => onDelete(id)))
          .then(() => {
            message.success(`${ids.length} documents deleted successfully`);
            setSelectedRowKeys([]);
          })
          .catch((error) => {
            message.error('Failed to delete documents');
          });
      },
    });
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return <FiFile />;

    const extension = fileName.split('.').pop().toLowerCase();

    const iconMap = {
      // Documents
      'pdf': <FiFileText style={{ color: '#FF4D4F' }} />,
      'doc': <FiFileText style={{ color: '#1677FF' }} />,
      'docx': <FiFileText style={{ color: '#1677FF' }} />,
      'txt': <FiFileText style={{ color: '#722ED1' }} />,

      // Images
      'jpg': <FiImage style={{ color: '#13C2C2' }} />,
      'jpeg': <FiImage style={{ color: '#13C2C2' }} />,
      'png': <FiImage style={{ color: '#13C2C2' }} />,
      'gif': <FiImage style={{ color: '#13C2C2' }} />,

      // Videos
      'mp4': <FiVideo style={{ color: '#FA8C16' }} />,
      'mov': <FiVideo style={{ color: '#FA8C16' }} />,
      'avi': <FiVideo style={{ color: '#FA8C16' }} />,

      // Audio
      'mp3': <FiMusic style={{ color: '#722ED1' }} />,
      'wav': <FiMusic style={{ color: '#722ED1' }} />,

      // Archives
      'zip': <FiArchive style={{ color: '#FA541C' }} />,
      'rar': <FiArchive style={{ color: '#FA541C' }} />,
      '7z': <FiArchive style={{ color: '#FA541C' }} />,

      // Code
      'js': <FiCode style={{ color: '#F0DB4F' }} />,
      'jsx': <FiCode style={{ color: '#61DAFB' }} />,
      'css': <FiCode style={{ color: '#264DE4' }} />,
      'html': <FiCode style={{ color: '#E34F26' }} />,
    };

    return iconMap[extension] || <FiFile style={{ color: '#8C8C8C' }} />;
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div className="item-wrapper">
          <div className="item-content">
            <div className="icon-wrapper" style={{ color: "#7C3AED", background: "rgba(124, 58, 237, 0.1)" }}>
              <FiFile className="item-icon" />
            </div>
            <div className="info-wrapper">
              <div className="name" style={{ color: "#262626", fontWeight: 600 }}>{text}</div>
              {record.description && (
                <div className="meta">{record.description.length > 50 ? `${record.description.substring(0, 50)}...` : record.description}</div>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <div className="item-wrapper">
          <div className="item-content">
            <div className="icon-wrapper" style={{ color: "#2563EB", background: "rgba(37, 99, 235, 0.1)" }}>
              <FiUserCheck className="item-icon" />
            </div>
            <div className="info-wrapper">
              <div className="name" style={{ color: "#2563EB", fontWeight: 500 }}>{role}</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "File",
      dataIndex: "file",
      key: "file",
      render: (fileUrl) => {
        if (!fileUrl) return null;

        const fileName = fileUrl.split('/').pop();
        return (
          <div
            className="item-wrapper"
            onClick={() => window.open(fileUrl, '_blank')}
            style={{ cursor: 'pointer' }}
          >
            <div className="item-content">
              <div className="icon-wrapper" style={{ color: "#059669", background: "rgba(5, 150, 105, 0.1)" }}>
                {getFileIcon(fileName)}
              </div>
              <div className="info-wrapper">
                <div className="name" style={{ color: "#059669", fontWeight: 500 }}>
                  {fileName.length > 30 ? `${fileName.substring(0, 30)}...` : fileName}
                </div>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Created By",
      dataIndex: "created_by",
      key: "created_by",
      render: (text) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => moment(date).format("DD MMM YYYY"),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Dropdown
          overlay={
            <Menu>
              <Menu.Item key="edit" onClick={() => onEdit(record)}>
                <FiEdit2 /> Edit
              </Menu.Item>
              <Menu.Item key="delete" danger onClick={() => onDelete(record.id)}>
                <FiTrash2 /> Delete
              </Menu.Item>
            </Menu>
          }
          trigger={["click"]}
        >
          <Button
            type="text"
            icon={<FiMoreVertical />}
            className="action-button"
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="document-list-container">
      <BulkActions />
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={documents}
        loading={loading}
        rowKey="id"
        onChange={handleTableChange}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
          pageSizeOptions: ['10', '20', '50', '100'],
          position: ['bottomRight'],
          onChange: (page, pageSize) => {
            onPageChange(page);
            if (pageSize !== pagination.pageSize) {
              onPageSizeChange(pageSize);
            }
          }
        }}
        // className="custom-table"
        scroll={{ 
          x: 'max-content',
          y: '100%'
        }}
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
        }}
      />
    </div>
  );
};

export default DocumentList;
