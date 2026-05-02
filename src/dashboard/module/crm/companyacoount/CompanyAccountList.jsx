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
  onDelete,
  onPaginationChange,
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
                <Tag color="blue" style={{ borderRadius: '4px', border: 'none', width: 'fit-content', marginTop: '2px' }}>{record.city || 'N/A'}</Tag>
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
      title: "Created",
      dataIndex: "createdAt",
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
              { key: 'view', icon: <FiEye />, label: 'View', onClick: () => navigate(`/dashboard/crm/company-account/${record.id}`) },
              { key: 'edit', icon: <FiEdit2 />, label: 'Edit', onClick: () => { /* Add Edit Logic */ } },
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
    <div className="company-list-container">
      <Table
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
        }}
        columns={columns}
        dataSource={companyAccounts}
        loading={isLoading}
        rowKey="id"
        size="small"
        className="compact-table"
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
