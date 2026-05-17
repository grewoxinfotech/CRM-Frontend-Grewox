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
  FiBriefcase,
  FiPhone,
  FiGlobe,
  FiMail,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useDeleteCompanyAccountMutation } from "./services/companyAccountApi";

const { Text } = Typography;

const CompanyAccountList = ({
  companyAccountsResponse,
  isLoading,
  searchText = "",
  countries,
  onEdit,
  onDelete,
  onPaginationChange,
  hasPermission,
}) => {
  const navigate = useNavigate();
  const [deleteCompanyAccount] = useDeleteCompanyAccountMutation();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const companyAccounts = React.useMemo(() => companyAccountsResponse?.data || [], [companyAccountsResponse]);

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete Company',
      content: 'Are you sure?',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteCompanyAccount(id).unwrap();
          message.success('Deleted successfully');
          if (onDelete) onDelete();
        } catch (error) {
          message.error('Delete failed');
        }
      },
    });
  };

  const columns = [
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "date",
      width: 150,
      render: (date) => {
        const itemDate = dayjs(date);
        const today = dayjs().startOf('day');
        const yesterday = dayjs().subtract(1, 'day').startOf('day');
        const thisWeek = dayjs().subtract(7, 'day').startOf('day');

        let colors = {
          bg: "#fff1f0",
          text: "#cf1322",
          border: "#ffa39e"
        };

        if (itemDate.isSame(today, 'day')) {
          colors = { bg: "#f6ffed", text: "#389e0d", border: "#b7eb8f" };
        } else if (itemDate.isSame(yesterday, 'day')) {
          colors = { bg: "#e6f7ff", text: "#096dd9", border: "#91d5ff" };
        } else if (itemDate.isAfter(thisWeek)) {
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
            {itemDate.isSame(today, 'day') ? "Today" : 
             itemDate.isSame(yesterday, 'day') ? "Yesterday" : 
             itemDate.format("DD MMM YYYY")}
          </Tag>
        );
      }
    },
    {
      title: "Company",
      key: "company",
      width: 250,
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Avatar 
            size={32} 
            src={record.company_logo} 
            icon={!record.company_logo && <FiBriefcase />} 
            style={{ backgroundColor: '#1890ff' }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Text strong style={{ color: '#1e293b' }}>{record.company_name}</Text>
            <Text type="secondary" style={{ fontSize: '12px' }}><FiGlobe size={10} /> {record.website || 'N/A'}</Text>
          </div>
        </div>
      ),
    },
    {
        title: "Contact",
        key: "contact",
        width: 180,
        render: (_, record) => (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Text style={{ fontSize: '13px' }}><FiPhone size={12} /> {record.phone_number || 'N/A'}</Text>
            </div>
        )
    },
    {
        title: "City",
        key: "city",
        width: 150,
        render: (_, record) => {
            const city = record.city || record.billing_city || record.shipping_city;
            return city ? (
                <Tag color="blue" style={{ borderRadius: '4px', border: 'none', width: 'fit-content' }}>
                    {city}
                </Tag>
            ) : <Text style={{ fontSize: '13px', color: '#8c8c8c' }}>N/A</Text>;
        }
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
      render: (email) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FiMail size={14} style={{ color: '#64748b' }} />
          <Text style={{ fontSize: '13px' }}>{email || 'N/A'}</Text>
        </div>
      )
    },
    {
      title: "Owner",
      dataIndex: "created_by",
      key: "owner",
      width: 150,
      render: (text) => <Tag color="purple" style={{ borderRadius: '4px', border: 'none' }}>{text || 'N/A'}</Tag>
    },

    {
      title: "Actions",
      key: "actions",
      fixed: 'right',
      width: 80,
      render: (_, record) => {
        const items = [
          {
            key: 'view',
            icon: <FiEye style={{ color: "#1890ff" }} />,
            label: <Text style={{ color: "#1890ff", fontWeight: "500" }}>Overview</Text>,
            onClick: () => navigate(`/dashboard/crm/company-account/${record.id}`)
          },
        ];
        if (!hasPermission || hasPermission('update')) {
          items.push({
            key: 'edit',
            icon: <FiEdit2 style={{ color: "#52c41a" }} />,
            label: <Text style={{ color: "#52c41a", fontWeight: "500" }}>Edit Company</Text>,
            onClick: () => onEdit(record)
          });
        }
        if (!hasPermission || hasPermission('delete')) {
          items.push({
            key: 'delete',
            icon: <FiTrash2 style={{ color: "#ff4d4f" }} />,
            label: <Text style={{ color: "#ff4d4f", fontWeight: "500" }}>Delete Company</Text>,
            danger: true,
            onClick: () => handleDelete(record.id)
          });
        }
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight">
              <Button type="text" icon={<FiMoreVertical />} className="action-dropdown-button" onClick={(e) => e.stopPropagation()} />
            </Dropdown>
          </div>
        );
      }
    },
  ];

  return (
    <div className="company-list-container">
      <Table
        rowSelection={(!hasPermission || hasPermission('delete')) ? {
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        } : undefined}
        columns={columns}
        dataSource={companyAccounts}
        loading={isLoading}
        rowKey="id"
        size="small"
        className="compact-table"
        onRow={(record) => ({
          onClick: () => navigate(`/dashboard/crm/company-account/${record.id}`),
          style: { cursor: 'pointer' }
        })}
        pagination={{
          total: companyAccountsResponse?.pagination?.total || 0,
          current: companyAccountsResponse?.pagination?.current || 1,
          pageSize: companyAccountsResponse?.pagination?.pageSize || 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} companies`,
          onChange: onPaginationChange
        }}
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
};

export default CompanyAccountList;
