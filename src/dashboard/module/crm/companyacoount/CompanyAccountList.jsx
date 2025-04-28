import React, { useState } from "react";
import {
  Table,
  Button,
  Dropdown,
  Input,
  Space,
  Typography,
  Modal,
  message,
  Avatar,
} from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiMoreVertical,
  FiBriefcase,
  FiPhone,
  FiGlobe,
  FiMapPin,
  FiCalendar,
  FiUser,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useDeleteCompanyAccountMutation } from "./services/companyAccountApi";
import EditCompanyAccount from "./EditCompanyAccount";

const { Text } = Typography;

const CompanyAccountList = ({
  companyAccountsResponse,
  isLoading,
  searchText = "",
  loggedInUser,
  countries
}) => {
  const navigate = useNavigate();
  const [deleteCompanyAccount, { isLoading: isDeleting }] = useDeleteCompanyAccountMutation();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);

  // Safely handle company accounts data
  const companyAccounts = React.useMemo(() => {
    if (!companyAccountsResponse) return [];
    if (Array.isArray(companyAccountsResponse)) return companyAccountsResponse;
    if (companyAccountsResponse?.data && Array.isArray(companyAccountsResponse.data)) {
      return companyAccountsResponse.data;
    }
    return [];
  }, [companyAccountsResponse]);

  const handleView = (record) => {
    navigate(`/dashboard/crm/company-account/${record.id}`);
  };

  const handleEdit = (record) => {
    setSelectedCompany(record);
    setEditModalVisible(true);
  };

  const handleEditModalClose = () => {
    setSelectedCompany(null);
    setEditModalVisible(false);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Delete Company Account',
      content: 'Are you sure you want to delete this company account?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      bodyStyle: {
        padding: '20px',
      },
      onOk: async () => {
        try {
          await deleteCompanyAccount(id).unwrap();
          message.success('Company account deleted successfully');
        } catch (error) {
          console.error("Delete Error:", error);
          message.error(error?.data?.message || 'Failed to delete company account');
        }
      },
    });
  };

  const getDropdownItems = (record) => ({
    items: [
      {
        key: "view",
        icon: <FiEye />,
        label: "View Details",
        onClick: () => handleView(record),
      },
      {
        key: "edit",
        icon: <FiEdit2 />,
        label: "Edit",
        onClick: () => handleEdit(record),
      },
      {
        key: "delete",
        icon: <FiTrash2 />,
        label: "Delete",
        onClick: () => handleDelete(record.id),
        danger: true,
      },
    ],
  });

  const columns = [
    {
      title: "Company Name",
      key: "company_name",
      render: (_, record) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar
            style={{
              backgroundColor: '#1890ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {record.company_name ? record.company_name[0].toUpperCase() : 'C'}
          </Avatar>
          <div>
            <Text strong style={{ fontSize: '14px', cursor: 'pointer', color: '#1890ff' }} onClick={() => handleView(record)}>
              {record.company_name}
            </Text>
            {record.company_site && (
              <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                <FiGlobe style={{ marginRight: '4px' }} />
                {record.company_site}
              </div>
            )}
          </div>
        </div>
      ),
      sorter: (a, b) => (a.company_name || '').localeCompare(b.company_name || ''),
    },
    {
      title: "Account Owner",
      dataIndex: "created_by",
      key: "created_by",
      render: (owner) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiUser style={{ color: '#8c8c8c' }} />
          <Text>{owner || '-'}</Text>
        </div>
      ),
      sorter: (a, b) => (a.created_by || '').localeCompare(b.created_by || ''),
    },
    {
      title: "Phone",
      key: "phone",
      render: (_, record) => {
        // Get the selected country's phone code
        const selectedCountry = countries?.find(c => c.id === record.phone_code);
        const phoneCode = selectedCountry?.phoneCode || '';
        const phoneNumber = record.phone_number || '';
        const formattedPhone = phoneNumber ? `${phoneCode} ${phoneNumber}` : '-';

        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiPhone style={{ color: '#8c8c8c' }} />
            <Text>{formattedPhone}</Text>
          </div>
        );
      },
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiCalendar style={{ color: '#8c8c8c' }} />
          <Text>{dayjs(date).format("DD-MM-YYYY")}</Text>
        </div>
      ),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "Action",
      key: "actions",
      width: 80,
      align: "center",
      render: (_, record) => (
        <div onClick={(e) => e.stopPropagation()}>
          <Dropdown
            menu={getDropdownItems(record)}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={<FiMoreVertical style={{ fontSize: '16px', color: '#8c8c8c' }} />}
              className="action-btn"
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
        </div>
      ),
    },
  ];

  // Filter company accounts based on search text
  const filteredCompanyAccounts = React.useMemo(() => {
    if (!searchText) return companyAccounts;

    return companyAccounts.filter((company) => {
      const searchLower = searchText.toLowerCase();
      const companyName = (company.company_name || '').toLowerCase();
      const owner = (company.created_by || '').toLowerCase();
      const phone = (company.phone_number || '').toLowerCase();

      return (
        companyName.includes(searchLower) ||
        owner.includes(searchLower) ||
        phone.includes(searchLower)
      );
    });
  }, [companyAccounts, searchText]);

  return (
    <div className="company-account-list" style={{ background: "#ffffff", borderRadius: "8px", overflow: "hidden" }}>
      <Table
        columns={columns}
        dataSource={filteredCompanyAccounts}
        rowKey="id"
        loading={isLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} companies`,
          style: {
            margin: "16px 24px",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          },
        }}
        className="company-table"
        onRow={(record) => ({
          onClick: () => handleView(record),
          style: { cursor: 'pointer' }
        })}
      />

      <EditCompanyAccount
        open={editModalVisible}
        onCancel={handleEditModalClose}
        companyData={selectedCompany}
        loggedInUser={loggedInUser}
      />

      <style jsx global>{`
        .company-table {
          .ant-table {
            border-radius: 8px;
            overflow: hidden;

            .ant-table-thead > tr > th {
              background: #fafafa !important;
              color: #1f2937;
              font-weight: 600;
              border-bottom: 1px solid #f0f0f0;
              padding: 16px;

              &::before {
                display: none;
              }
            }

            .ant-table-tbody > tr {
              &:hover > td {
                background: rgba(24, 144, 255, 0.04) !important;
              }

              > td {
                padding: 16px;
                transition: all 0.3s ease;
              }

              &:nth-child(even) {
                background-color: #fafafa;
                
                &:hover > td {
                  background: rgba(24, 144, 255, 0.04) !important;
                }
              }
            }
          }

          .action-btn {
            width: 32px;
            height: 32px;
            padding: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            transition: all 0.3s;
            
            &:hover {
              color: #1890ff;
              background: rgba(24, 144, 255, 0.1);
            }
          }
        }
      `}</style>
    </div>
  );
};

export default CompanyAccountList;
