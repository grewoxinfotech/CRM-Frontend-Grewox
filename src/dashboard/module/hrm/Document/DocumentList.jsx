import React, { useState, useMemo, useEffect } from "react";
import { Table, Button, Space, Tooltip, Tag, Dropdown, Modal, message, Input } from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiMoreVertical,
  FiLink,
  FiFile,
  FiUserCheck,
  FiDownload,
  FiPaperclip,
  FiAlertCircle,
  FiFileText,
  FiImage,
  FiVideo,
  FiMusic,
  FiArchive,
  FiCode
} from "react-icons/fi";
import moment from "moment";
import { useGetDocumentsQuery, useDeleteDocumentMutation } from "./services/documentApi";
import './document.scss';

const DocumentList = ({ loading, onEdit, searchText, documents }) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const { data: documentsData, isLoading } = useGetDocumentsQuery();
  const [deleteDocument] = useDeleteDocumentMutation();
  const [isMobile, setIsMobile] = useState(false);
  const docdata = documentsData?.data || documents;

  // Row selection config
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    }
  };

  // Bulk actions component
  const BulkActions = () => (
    <div className={`bulk-actions ${selectedRowKeys.length > 0 ? 'active' : ''}`}>
      {selectedRowKeys.length > 0 && (
        <Button
          type="primary"
          danger
          icon={<FiTrash2 size={16} />}
          onClick={() => handleDelete(selectedRowKeys)}
        >
          Delete Selected ({selectedRowKeys.length})
        </Button>
      )}
    </div>
  );

  // Filter documents based on search text
  const filteredDocuments = useMemo(() => {
    if (!docdata) return [];

    if (!searchText) return docdata;

    const searchLower = searchText.toLowerCase();
    return docdata.filter(doc => {
      const name = doc.name?.toLowerCase() || '';
      return name.includes(searchLower);
    });
  }, [docdata, searchText]);

  const handleDelete = (recordOrIds) => {
    const isMultiple = Array.isArray(recordOrIds);
    const title = isMultiple ? 'Delete Selected Documents' : 'Delete Document';
    const content = isMultiple
      ? `Are you sure you want to delete ${recordOrIds.length} selected documents?`
      : 'Are you sure you want to delete this document?';

    Modal.confirm({
      title,
      content,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      bodyStyle: { padding: "20px" },
      onOk: async () => {
        try {
          if (isMultiple) {
            await Promise.all(recordOrIds.map(id => deleteDocument(id).unwrap()));
            message.success(`${recordOrIds.length} documents deleted successfully`);
            setSelectedRowKeys([]);
          } else {
            await deleteDocument(recordOrIds).unwrap();
            message.success('Document deleted successfully');
          }
        } catch (error) {
          message.error(error?.data?.message || 'Failed to delete document(s)');
        }
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
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search document name"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button type="primary" onClick={() => confirm()} size="small" style={{ width: 90 }}>Filter</Button>
            <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>Reset</Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) => record.name.toLowerCase().includes(value.toLowerCase()),
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
        const extension = fileName.split('.').pop().toLowerCase();

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
                <Tag color="blue" style={{ margin: 0 }}>{extension.toUpperCase()}</Tag>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'edit',
                icon: <FiEdit2 size={14} />,
                label: 'Edit',
                onClick: () => onEdit(record),
              },
              {
                key: 'delete',
                icon: <FiTrash2 size={14} />,
                label: 'Delete',
                danger: true,
                onClick: () => handleDelete(record.id),
              },
            ],
          }}
          trigger={['click']}
        >
          <Button
            type="text"
            icon={<FiMoreVertical size={16} />}
            className="action-button"
          />
        </Dropdown>
      ),
    },
  ];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
}, []);

const paginationConfig = {
    pageSize: 10,
    showSizeChanger: true,
    showTotal: (total) => `Total ${total} items`,
    pageSizeOptions: ['10', '20', '50', '100'],

    locale: {
        items_per_page: isMobile ? '' : '/ page', // Hide '/ page' on mobile/tablet
    },
};

  return (
    <div className="document-list-container">
      <BulkActions />
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={filteredDocuments}
        loading={loading || isLoading}
        rowKey="id"
        pagination={paginationConfig}
        className="custom-table"
        scroll={{ x: 1000, y: '' }}
        style={{
          background: '#ffffff',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        }}
      />
    </div>
  );
};

export default DocumentList;
