import React, { useMemo } from "react";
import { Table, Button, Space, Tooltip, Tag, Dropdown, Modal, message } from "antd";
import { FiEdit2, FiTrash2, FiEye, FiMoreVertical, FiLink } from "react-icons/fi";
import moment from "moment";
import { useGetDocumentsQuery, useDeleteDocumentMutation } from "./services/documentApi";

const DocumentList = ({ loading, onEdit, searchText, documents }) => {
  const { data: documentsData, isLoading } = useGetDocumentsQuery();
  const [deleteDocument] = useDeleteDocumentMutation();
  const docdata = documentsData?.data || documents;

  // Filter documents based on search text (only by name)
  const filteredDocuments = useMemo(() => {
    if (!docdata) return [];
    
    if (!searchText) return docdata;

    const searchLower = searchText.toLowerCase();
    return docdata.filter(doc => {
      const name = doc.name?.toLowerCase() || '';
      return name.includes(searchLower);
    });
  }, [docdata, searchText]);

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete Document',
      content: 'Are you sure you want to delete this document?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      bodyStyle: { padding: "20px" },
      onOk: async () => {
        try {
          await deleteDocument(id).unwrap();
          message.success('Document deleted successfully');
        } catch (error) {
          message.error(error?.data?.message || 'Failed to delete document');
        }
      },
    });
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: (a, b) => a.name.localeCompare(b.name),
      render: (name) => (
        <span className="text-base" style={{ 
          color: searchText && name.toLowerCase().includes(searchText.toLowerCase()) 
            ? '#1890ff' 
            : 'inherit' 
        }}>
          {name}
        </span>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      sorter: (a, b) => a.role.localeCompare(b.role),
      render: (role) => <Tag color="blue">{role}</Tag>,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => (
        <Tooltip title={text}>
          <span className="text-base" style={{ color: '#4b5563' }}>
            {text.length > 50 ? `${text.substring(0, 50)}...` : text}
          </span>
        </Tooltip>
      ),
    },
    {
      title: "Created At",
      dataIndex: "created_at",
      key: "created_at",
      sorter: (a, b) => moment(a.created_at).unix() - moment(b.created_at).unix(),
      render: (date) => (
        <span className="text-base">
          {moment(date).format('DD-MM-YYYY')}
        </span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      render: (_, record) => {
        const items = [
          {
            key: 'view',
            icon: <FiEye style={{ fontSize: '14px' }} />,
            label: 'View',
            onClick: () => onEdit(record),
          },
          {
            key: 'edit',
            icon: <FiEdit2 style={{ fontSize: '14px' }} />,
            label: 'Edit',
            onClick: () => onEdit(record),
          },
          {
            key: 'delete',
            icon: <FiTrash2 style={{ fontSize: '14px', color: '#ff4d4f' }} />,
            label: 'Delete',
            danger: true,
            onClick: () => handleDelete(record.id),
          },
          record.fileUrl && {
            key: 'download',
            icon: <FiLink style={{ fontSize: '14px' }} />,
            label: 'Download',
            onClick: () => window.open(record.fileUrl, '_blank'),
          },
        ].filter(Boolean);

        return (
          <Dropdown
            menu={{ items }}
            trigger={['click']}
            placement="bottomRight"
            overlayClassName="document-actions-dropdown"
          >
            <Button
              type="text"
              icon={<FiMoreVertical />}
              className="action-dropdown-button"
              onClick={(e) => e.preventDefault()}
            />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div className="document-list">
      <Table
        columns={columns}
        dataSource={filteredDocuments}
        loading={loading || isLoading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
        }}
        className="document-table"
      />
    </div>
  );
};

export default DocumentList;
