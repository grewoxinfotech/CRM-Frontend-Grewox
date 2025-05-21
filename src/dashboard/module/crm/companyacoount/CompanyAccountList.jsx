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
  Alert,
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
  FiAlertCircle,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useDeleteCompanyAccountMutation } from "./services/companyAccountApi";
import EditCompanyAccount from "./EditCompanyAccount";
import "./companyaccount.scss";

const { Text } = Typography;

const CompanyAccountList = ({
  companyAccountsResponse,
  isLoading,
  searchText = "",
  loggedInUser,
  countries,
  onDelete,
  onSearchChange,
  onPaginationChange,
}) => {
  const navigate = useNavigate();
  const [deleteCompanyAccount, { isLoading: isDeleting }] = useDeleteCompanyAccountMutation();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // Safely handle company accounts data
  const companyAccounts = React.useMemo(() => {
    if (!companyAccountsResponse) return [];
    return companyAccountsResponse.data || [];
  }, [companyAccountsResponse]);

  const handleRowClick = (event, record) => {
    // Don't navigate if clicking on the actions button or its dropdown
    if (event.target.closest('.action-button') || event.target.closest('.ant-dropdown')) {
      return;
    }
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

  const handleDelete = (recordOrIds) => {
    const isMultiple = Array.isArray(recordOrIds);
    Modal.confirm({
      title: isMultiple ? 'Delete Selected Companies' : 'Delete Company',
      content: isMultiple
        ? `Are you sure you want to delete ${recordOrIds.length} selected companies?`
        : 'Are you sure you want to delete this company?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      bodyStyle: {
        padding: "20px",
      },
      onOk: async () => {
        try {
          if (isMultiple) {
            for (const id of recordOrIds) {
              await deleteCompanyAccount(id).unwrap();
            }
            message.success(`${recordOrIds.length} companies deleted successfully`);
            setSelectedRowKeys([]);
          } else {
            await deleteCompanyAccount(recordOrIds).unwrap();
            message.success('Company deleted successfully');
          }
          if (onDelete) onDelete();
        } catch (error) {
          message.error(error?.data?.message || 'Failed to delete company(s)');
        }
      },
    });
  };

  // Row selection config
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    }
  };

  const getDropdownItems = (record) => ({
    items: [
      {
        key: "view",
        label: (
          <Button
            type="text"
            className="dropdown-button"
            onClick={(e) => {
              e.stopPropagation();
              handleRowClick(e, record);
            }}
          >
            <FiEye className="dropdown-icon" /> View Details
          </Button>
        ),
      },
      {
        key: "edit",
        label: (
          <Button
            type="text"
            className="dropdown-button"
            onClick={(e) => {
              e.stopPropagation();
              handleEdit(record);
            }}
          >
            <FiEdit2 className="dropdown-icon" /> Edit Company
          </Button>
        ),
      },
      {
        key: "delete",
        label: (
          <Button
            type="text"
            danger
            className="dropdown-button"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(record.id);
            }}
          >
            <FiTrash2 className="dropdown-icon" /> Delete Company
          </Button>
        ),
      },
    ],
  });

  const columns = [
    {
      title: "Company",
      key: "company_name",
      render: (_, record) => (
        <div className="item-wrapper">
          <div className="item-content">
            <div className="icon-wrapper" style={{ color: "#2563EB", background: "rgba(37, 99, 235, 0.1)" }}>
              {record.company_logo ? (
                <Avatar src={record.company_logo} />
              ) : (
                <FiBriefcase className="item-icon" />
              )}
            </div>
            <div className="info-wrapper">
              <div className="name">{record.company_name}</div>
              <div className="meta">
                <FiGlobe size={12} />
                {record.website || 'No website'}
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Contact",
      key: "contact",
      render: (_, record) => {
        const selectedCountry = countries?.find(c => c.id === record.phone_code);
        const phoneCode = selectedCountry?.phoneCode || '';
        const phoneNumber = record.phone_number || '';
        const formattedPhone = phoneNumber ? `${phoneCode} ${phoneNumber}` : '-';

        return (
          <div className="item-wrapper">
            <div className="item-content">
              <div className="icon-wrapper" style={{ color: "#059669", background: "rgba(5, 150, 105, 0.1)" }}>
                <FiPhone className="item-icon" />
              </div>
              <div className="info-wrapper">
                <div className="name">{formattedPhone}</div>
                <div className="meta">
                  <FiMapPin size={12} />
                  {record.city || 'No location'}
                </div>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Owner",
      key: "created_by",
      render: (_, record) => (
        <div className="item-wrapper">
          <div className="item-content">
            <div className="icon-wrapper" style={{ color: "#2563EB", background: "rgba(37, 99, 235, 0.1)" }}>
              <FiUser className="item-icon" />
            </div>
            <div className="info-wrapper">
              <div className="name">{record.created_by || 'No owner'}</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Created",
      key: "createdAt",
      render: (_, record) => (
        <div className="item-wrapper">
          <div className="item-content">
            <div className="icon-wrapper" style={{ color: "#2563EB", background: "rgba(37, 99, 235, 0.1)" }}>
              <FiCalendar className="item-icon" />
            </div>
            <div className="info-wrapper">
              <div className="name">{dayjs(record.createdAt).format('MMM DD, YYYY')}</div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 60,
      render: (_, record) => (
        <Dropdown
          menu={getDropdownItems(record)}
          trigger={['click']}
          placement="bottomRight"
          overlayClassName="company-actions-dropdown"
        >
          <Button
            type="text"
            icon={<FiMoreVertical />}
            className="action-button"
            onClick={e => e.stopPropagation()}
          />
        </Dropdown>
      ),
    },
  ];

  // Bulk actions component
  const BulkActions = () => (
    <div className="bulk-actions">
      {selectedRowKeys.length > 0 && (
        <Button
          type="primary"
          danger
          icon={<FiTrash2 size={16} />}
          onClick={() => handleDelete(selectedRowKeys)}
          className="delete-button"
        >
          Delete Selected ({selectedRowKeys.length})
        </Button>
      )}
    </div>
  );

  return (
    <div className="company-list-container">
      {/* Bulk Actions */}
      <BulkActions />

      {/* Company Table */}
      <Table
        rowSelection={{
          type: 'checkbox',
          ...rowSelection,
          selectedRowKeys,
          onChange: (newSelectedRowKeys) => {
            setSelectedRowKeys(newSelectedRowKeys);
          },
        }}
        onRow={(record) => ({
          onClick: (e) => handleRowClick(e, record),
          style: { cursor: 'pointer' }
        })}
        columns={columns}
        dataSource={companyAccounts}
        loading={isLoading}
        rowKey="id"
        className="modern-table"
        pagination={{
          total: companyAccountsResponse?.pagination?.total || 0,
          current: companyAccountsResponse?.pagination?.current || 1,
          pageSize: companyAccountsResponse?.pagination?.pageSize || 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} companies`,
          onChange: (page, pageSize) => {
            if (onPaginationChange) {
              onPaginationChange(page, pageSize);
            }
          }
        }}
      />

      {/* Edit Modal */}
      {editModalVisible && (
        <EditCompanyAccount
          open={editModalVisible}
          onCancel={handleEditModalClose}
          companyData={selectedCompany}
          isLoading={isLoading}
          loggedInUser={loggedInUser}
          companyAccountsResponse={companyAccountsResponse}
        />
      )}
    </div>
  );
};

export default CompanyAccountList;
