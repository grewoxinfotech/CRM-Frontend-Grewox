import React, { useState } from "react";
import {
  Table,
  Button,
  Tag,
  Dropdown,
  Tooltip,
  Typography,
  Modal,
  message,
} from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiMoreVertical,
} from "react-icons/fi";
import dayjs from "dayjs";
import EditCompanyAccount from "./EditCompanyAccount";
import CreateCompanyAccount from "./CreateCompanyAccount";
import { 
  useGetCompanyAccountsQuery,
  useDeleteCompanyAccountMutation 
} from "./services/companyAccountApi";

const { Text } = Typography;

const CompanyAccountList = ({ onEdit, onView, searchText = "" }) => {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  
  // RTK Query hooks
  const { data: companyAccountsResponse = { data: [] }, isLoading } = useGetCompanyAccountsQuery();
  const [deleteCompanyAccount] = useDeleteCompanyAccountMutation();

  // Extract the actual company accounts array from the response
  const companyAccounts = Array.isArray(companyAccountsResponse.data) 
    ? companyAccountsResponse.data 
    : Array.isArray(companyAccountsResponse) 
      ? companyAccountsResponse 
      : [];

  

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Delete Company",
      content: "Are you sure you want to delete this company?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      bodyStyle: {
        padding: "20px",
      },
      onOk: async () => {
        try {
          await deleteCompanyAccount(id).unwrap();
          message.success("Company deleted successfully");
        } catch (error) {
          message.error("Failed to delete company");
          console.error('Error deleting company:', error);
        }
      },
    });
  };

  const handleEdit = (record) => {
    setSelectedCompany(record);
    setEditModalVisible(true);
  };

  const handleEditModalClose = () => {
    setEditModalVisible(false);
    setSelectedCompany(null);
  };

  const handleCreateModalClose = () => {
    setCreateModalVisible(false);
  };

  // Filter companies based on search text
  const filteredCompanies = React.useMemo(() => {
    if (!Array.isArray(companyAccounts)) {
      return [];
    }
    return companyAccounts.filter((company) => {
      const searchLower = searchText.toLowerCase();
      const name = company?.company_name?.toLowerCase() || "";
      const owner = company?.account_owner?.toLowerCase() || "";
      const phone = company?.phone_number?.toLowerCase() || "";
      const status = company?.status?.toLowerCase() || "";

      return (
        !searchText ||
        name.includes(searchLower) ||
        owner.includes(searchLower) ||
        phone.includes(searchLower) ||
        status.includes(searchLower)
      );
    });
  }, [companyAccounts, searchText]);

  const getDropdownItems = (record) => ({
    items: [
      {
        key: "view",
        icon: <FiEye />,
        label: "View Details",
        onClick: () => onView?.(record),
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
      dataIndex: "company_name",
      key: "company_name",
      sorter: (a, b) => a.company_name.localeCompare(b.company_name),
      render: (name) => (
        <Text style={{ fontWeight: 500 }}>
          {name}
        </Text>
      ),
    },
    {
      title: "Account Owner",
      dataIndex: "account_owner",
      key: "account_owner",
      sorter: (a, b) => a.account_owner.localeCompare(b.account_owner),
    },
    {
      title: "Phone",
      dataIndex: "phone_number",
      key: "phone_number",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "Active" ? "green" : "red"}>
          {status || "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Created Date",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => dayjs(date).format("DD-MM-YYYY"),
      sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
    },
    {
      title: "Action",
      key: "actions",
      width: 80,
      align: "center", 
      render: (_, record) => (
        <Dropdown
          menu={getDropdownItems(record)}
          trigger={["click"]}
          placement="bottomRight"
          overlayClassName="company-actions-dropdown"
        >
          <Button
            type="text"
            icon={
              <FiMoreVertical style={{ fontSize: "18px", color: "#8c8c8c" }} />
            }
            className="action-dropdown-button"
            onClick={(e) => e.preventDefault()}
            style={{
              padding: "4px",
              borderRadius: "4px",
              "&:hover": {
                background: "#f5f5f5",
              },
            }}
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <>
      <div
        className="company-list"
        style={{
          background: "#ffffff",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <Table
          columns={columns}
          dataSource={filteredCompanies}
          rowKey="id"
          loading={isLoading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} items`,
            style: {
              margin: "16px 24px",
              display: "flex",
              justifyContent: "flex-end",
              alignItems: "center",
            },
          }}
          className="company-table"
          style={{
            "& .ant-table-thead > tr > th": {
              background: "#fafafa",
              fontWeight: 600,
              color: "#262626",
            },
            "& .ant-table-tbody > tr:hover > td": {
              background: "#f5f5f5",
            },
          }}
        />
      </div>

      <EditCompanyAccount
        open={editModalVisible}
        onCancel={handleEditModalClose}
        companyData={selectedCompany}
      />

      <CreateCompanyAccount 
        open={createModalVisible}
        onCancel={handleCreateModalClose}
      />
    </>
  );
};

export default CompanyAccountList;
