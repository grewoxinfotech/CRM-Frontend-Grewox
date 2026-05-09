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
      company_display_name: companyMap[c.company_name] || c.company_name || 'N/A',
      // normalize date field so table doesn't treat missing value as "today"
      created_at: c.created_at || c.createdAt || c.created_at_gmt || c.created_at_utc || null,
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
      title: "Date",
      dataIndex: "created_at",
      key: "date",
      width: 150,
      render: (date, record) => {
        const raw = date || record?.createdAt || record?.created_at;
        const itemDate = raw ? dayjs(raw) : dayjs.invalid();
        const today = dayjs().startOf('day');
        const yesterday = dayjs().subtract(1, 'day').startOf('day');
        const thisWeek = dayjs().subtract(7, 'day').startOf('day');

        let colors = {
          bg: "#fff1f0",
          text: "#cf1322",
          border: "#ffa39e"
        };

        if (itemDate.isValid() && itemDate.isSame(today, 'day')) {
          colors = { bg: "#f6ffed", text: "#389e0d", border: "#b7eb8f" };
        } else if (itemDate.isValid() && itemDate.isSame(yesterday, 'day')) {
          colors = { bg: "#e6f7ff", text: "#096dd9", border: "#91d5ff" };
        } else if (itemDate.isValid() && itemDate.isAfter(thisWeek)) {
          colors = { bg: "#fff7e6", text: "#d46b08", border: "#ffd591" };
        }

        return (
          <Tag
            style={{
              borderRadius: "6px",
              padding: "2px 10px",
              fontSize: "12px",
              fontWeight: "600",
              backgroundColor: colors.bg,
              color: colors.text,
              border: `1px solid ${colors.border}`,
              margin: 0,
              textTransform: 'uppercase'
            }}
          >
            {!itemDate.isValid() ? "N/A" :
             itemDate.isSame(today, 'day') ? "Today" :
             itemDate.isSame(yesterday, 'day') ? "Yesterday" :
             itemDate.format("DD MMM YYYY")}
          </Tag>
        );
      }
    },
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
      title: "Actions",
      key: "actions",
      fixed: 'right',
      width: 80,
      render: (_, record) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Dropdown
            menu={{
              items: [
                { 
                  key: 'view', 
                  icon: <FiEye style={{ color: "#1890ff" }} />, 
                  label: <Text style={{ color: "#1890ff", fontWeight: "500" }}>Overview</Text>, 
                  onClick: () => navigate(`/dashboard/crm/contact/${record.id}`) 
                },
                { 
                  key: 'edit', 
                  icon: <FiEdit2 style={{ color: "#52c41a" }} />, 
                  label: <Text style={{ color: "#52c41a", fontWeight: "500" }}>Edit Contact</Text>, 
                  onClick: () => onEdit(record) 
                },
                { 
                  key: 'delete', 
                  icon: <FiTrash2 style={{ color: "#ff4d4f" }} />, 
                  label: <Text style={{ color: "#ff4d4f", fontWeight: "500" }}>Delete Contact</Text>, 
                  danger: true, 
                  onClick: () => handleDelete(record.id) 
                }
              ]
            }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button type="text" icon={<FiMoreVertical />} className="action-dropdown-button" onClick={(e) => e.stopPropagation()} />
          </Dropdown>
        </div>
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
        onRow={(record) => ({
          onClick: () => navigate(`/dashboard/crm/contact/${record.id}`),
          style: { cursor: 'pointer' }
        })}
        pagination={pagination}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default ContactList;
