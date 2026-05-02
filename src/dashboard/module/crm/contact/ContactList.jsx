import React, { useState } from "react";
import {
  Table,
  Button,
  Dropdown,
  Typography,
  Modal,
  message,
  Avatar,
  Tag,
} from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiMoreVertical,
  FiMail,
  FiPhone,
  FiUser,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";

const { Text } = Typography;

const ContactList = ({
  onEdit,
  searchText = "",
  contactsResponse,
  isLoading,
  companyAccountsResponse,
  onDelete,
  pagination
}) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const navigate = useNavigate();

  const companyMap = React.useMemo(() => {
    const list = companyAccountsResponse?.data || [];
    return list.reduce((acc, c) => { acc[c.id] = c.company_name; return acc; }, {});
  }, [companyAccountsResponse]);

  const enhancedContacts = React.useMemo(() => {
    const list = contactsResponse?.data || [];
    return list.map(c => ({
      ...c,
      company_display_name: companyMap[c.company_name] || c.company_name || 'N/A'
    }));
  }, [contactsResponse, companyMap]);

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete Contact',
      content: 'Are you sure?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          if (onDelete) await onDelete(id);
        } catch (error) {
          message.error('Delete failed');
        }
      },
    });
  };

  const columns = [
    {
      title: "Contact",
      key: "contact",
      width: 250,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Avatar 
            size={32} 
            src={record.profile_pic} 
            icon={!record.profile_pic && <FiUser />} 
            style={{ backgroundColor: '#1890ff' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Text strong style={{ color: '#1e293b' }}>{record.first_name} {record.last_name}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}><FiMail size={10} /> {record.email || 'N/A'}</Text>
          </div>
        </div>
      ),
    },
    {
      title: "Company",
      key: "company",
      width: 200,
      render: (_, record) => (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Text strong style={{ fontSize: '13px' }}>{record.company_display_name}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}><FiPhone size={10} /> {record.phone || 'N/A'}</Text>
        </div>
      )
    },
    {
      title: "Location",
      key: "location",
      width: 150,
      render: (_, record) => (
        <Tag color="blue" style={{ borderRadius: '4px', border: 'none' }}>{record.city || 'N/A'}, {record.country || 'N/A'}</Tag>
      )
    },
    {
      title: "Created",
      dataIndex: "created_at",
      key: "date",
      width: 150,
      render: (date) => dayjs(date).format('DD MMM YYYY')
    },
    {
      title: "Actions",
      key: "actions",
      fixed: 'right',
      width: 80,
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: 'view', icon: <FiEye />, label: 'View', onClick: () => navigate(`/dashboard/crm/contact/${record.id}`) },
              { key: 'edit', icon: <FiEdit2 />, label: 'Edit', onClick: () => onEdit(record) },
              { key: 'delete', icon: <FiTrash2 />, label: 'Delete', danger: true, onClick: () => handleDelete(record.id) }
            ]
          }}
          trigger={['click']}
          placement="bottomRight"
        >
          <Button type="text" icon={<FiMoreVertical />} className="action-dropdown-button" />
        </Dropdown>
      )
    },
  ];

  return (
    <div className="contact-list-container">
      <Table
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        columns={columns}
        dataSource={enhancedContacts}
        loading={isLoading}
        rowKey="id"
        size="small"
        className="compact-table"
        pagination={pagination}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default ContactList;
