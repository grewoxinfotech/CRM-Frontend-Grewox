import React, { useState } from "react";
import {
  Card,
  Typography,
  Button,
  Modal,
  message,
  Input,
  Dropdown,
  Menu,
  Breadcrumb,
  Popover,
} from "antd";
import {
  FiPlus,
  FiSearch,
  FiDownload,
  FiHome,
  FiChevronDown,
  FiFilter,
  FiAlertCircle,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import CompanyAccountList from "./CompanyAccountList";
import CreateCompanyAccount from "./CreateCompanyAccount";
import EditCompanyAccount from "./EditCompanyAccount";
import { useCreateCompanyAccountMutation, useDeleteCompanyAccountMutation, useGetCompanyAccountsQuery } from "./services/companyAccountApi";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import { useSelector } from "react-redux";
import {
  useGetCategoriesQuery,
} from "../crmsystem/souce/services/SourceApi";
import CompanyAccountDetails from "./CompanyAccountDetails";
import moment from "moment";
import { useGetAllCountriesQuery } from '../../../module/settings/services/settingsApi';

const { Title, Text } = Typography;

const CompanyAccount = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedCompanyType, setSelectedCompanyType] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10
  });
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const loggedInUser = useSelector(selectCurrentUser);
  const [deleteCompanyAccount] = useDeleteCompanyAccountMutation();
  const [createCompanyAccount] = useCreateCompanyAccountMutation();

  const { data: companyAccountsResponse = { data: [], pagination: {} }, isLoading: isCompanyAccountsLoading } =
    useGetCompanyAccountsQuery({
      page: pagination.page,
      pageSize: pagination.pageSize,
      search: searchText,
      ...(selectedCompanyType && selectedCompanyType !== 'all' && { companyType: selectedCompanyType })
    });

  const { data: countries = [] } = useGetAllCountriesQuery();
  const { data: categoriesData } = useGetCategoriesQuery(loggedInUser?.id);

  const companyTypes = [
    { key: 'all', label: 'All Types' },
    { key: 'private', label: 'Private Limited' },
    { key: 'public', label: 'Public Limited' },
    { key: 'partnership', label: 'Partnership' },
    { key: 'proprietorship', label: 'Proprietorship' }
  ];

  const handleCompanyTypeFilter = (type) => {
    setSelectedCompanyType(type);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on filter change
  };

  const handleSearchChange = (value) => {
    setSearchText(value);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page on search
  };

  const handlePaginationChange = (page, pageSize) => {
    setPagination({ page, pageSize });
  };

  const filterMenu = (
    <Menu>
      {companyTypes.map((type) => (
        <Menu.Item
          key={type.key}
          onClick={() => handleCompanyTypeFilter(type.key)}
          style={{
            backgroundColor: selectedCompanyType === type.key ? '#e6f7ff' : 'transparent'
          }}
        >
          {type.label}
        </Menu.Item>
      ))}
    </Menu>
  );

  const handleCreate = () => {
    setSelectedCompany(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (record) => {
    setSelectedCompany(record);
    setIsEditModalOpen(true);
  };

  const handleView = (record) => {
  };

  const handleDelete = (recordOrIds) => {
    const isMultiple = Array.isArray(recordOrIds);
    Modal.confirm({
      icon: <FiAlertCircle style={{ color: '#faad14' }} />,
      title: isMultiple ? 'Delete Selected Companies' : 'Delete Company',
      content: (
        <div className="modal-content">
          <p>
            {isMultiple
              ? `Are you sure you want to delete ${recordOrIds.length} selected companies?`
              : 'Are you sure you want to delete this company?'}
          </p>
          <p className="modal-warning">This action cannot be undone.</p>
        </div>
      ),
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      width: 400,
      centered: true,
      className: 'delete-confirmation-modal',
      onOk: async () => {
        try {
          if (isMultiple) {
            await Promise.all(recordOrIds.map(id => deleteCompanyAccount(id).unwrap()));
            message.success(`${recordOrIds.length} companies deleted successfully`);
          } else {
            await deleteCompanyAccount(recordOrIds).unwrap();
            message.success('Company deleted successfully');
          }
        } catch (error) {
          console.error("Delete Error:", error);
          message.error(error?.data?.message || 'Failed to delete company(s)');
        }
      },
    });
  };

  const handleExport = async (type) => {
    try {
      setLoading(true);
      if (!companyAccountsResponse?.data?.length) {
        message.warning('No data available to export');
        return;
      }

      const data = companyAccountsResponse.data.map((company) => ({
        "Company Name": company.company_name,
        "Phone": company.phone_number,
        "Created Date": moment(company.created_at).format("YYYY-MM-DD")
      }));

      switch (type) {
        case "csv":
          exportToCSV(data, "companies_export");
          break;
        case "excel":
          exportToExcel(data, "companies_export");
          break;
        case "pdf":
          exportToPDF(data, "companies_export");
          break;
        default:
          break;
      }
      message.success(`Successfully exported as ${type.toUpperCase()}`);
    } catch (error) {
      message.error(`Failed to export: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data, filename) => {
    const csvContent = [
      Object.keys(data[0]).join(","),
      ...data.map((item) =>
        Object.values(item)
          .map((value) => `"${value?.toString().replace(/"/g, '""')}"`)
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const exportToExcel = (data, filename) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Companies");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const exportToPDF = (data, filename) => {
    const doc = new jsPDF("l", "pt", "a4");
    doc.autoTable({
      head: [Object.keys(data[0])],
      body: data.map((item) => Object.values(item)),
      margin: { top: 20 },
      styles: { fontSize: 8 },
    });
    doc.save(`${filename}.pdf`);
  };

  const exportMenu = (
    <Menu>
      <Menu.Item
        key="csv"
        icon={<FiDownload />}
        onClick={() => handleExport("csv")}
      >
        Export as CSV
      </Menu.Item>
      <Menu.Item
        key="excel"
        icon={<FiDownload />}
        onClick={() => handleExport("excel")}
      >
        Export as Excel
      </Menu.Item>
      <Menu.Item
        key="pdf"
        icon={<FiDownload />}
        onClick={() => handleExport("pdf")}
      >
        Export as PDF
      </Menu.Item>
    </Menu>
  );

  return (
    <div className="company-account-page">
      <div className="page-breadcrumb">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/dashboard">
              <FiHome style={{ marginRight: "4px" }} />
              Home
            </Link>
          </Breadcrumb.Item>
          {/* <Breadcrumb.Item>
            <Link to="/dashboard/sales">Sales</Link>
          </Breadcrumb.Item> */}
          <Breadcrumb.Item>Company Accounts</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className="page-header">
        <div className="page-title">
          <Title level={2}>Company Accounts</Title>
          <Text type="secondary">Manage all company accounts in the organization</Text>
        </div>
        <div className="header-actions">
          <div className="desktop-actions">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div className="search-container">
              <Input
              prefix={<FiSearch style={{ color: "#8c8c8c", fontSize: "16px" }} />}
              placeholder="Search companies..."
              allowClear
              onChange={(e) => handleSearchChange(e.target.value)}
              value={searchText}
              className="search-input"
              // style={{ width: 350 }}
            />
                <Popover
                  content={
                    <div className="search-popup">
                      <Input
                        prefix={<FiSearch style={{ color: "#8c8c8c" }} />}
                        placeholder="Search companies..."
                        allowClear
                        onChange={(e) => handleSearchChange(e.target.value)}
                        value={searchText}
                        className="search-input"
                        autoFocus
                      />
                    </div>
                  }
                  trigger="click"
                  open={isSearchVisible}
                  onOpenChange={setIsSearchVisible}
                  placement="bottomRight"
                  className="mobile-search-popover"
                >
                  <Button
                    className="search-icon-button"
                    icon={<FiSearch size={16} />}
                  />
                </Popover>
              </div>
              <Dropdown overlay={exportMenu} trigger={["click"]}>
                <Button className="export-button">
                  <FiDownload size={16} />
                  <span className="button-text">Export</span>
                </Button>
              </Dropdown>
              <Button
                type="primary"
                icon={<FiPlus size={16} />}
                onClick={handleCreate}
                className="add-button"
              >
                <span className="button-text">Add Company</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Card className="main-card">
        <CompanyAccountList
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
          searchText={searchText}
          loggedInUser={loggedInUser}
          categoriesData={categoriesData}
          companyAccountsResponse={companyAccountsResponse}
          isCompanyAccountsLoading={isCompanyAccountsLoading}
          countries={countries}
          onSearchChange={handleSearchChange}
          onPaginationChange={handlePaginationChange}
        />
      </Card>

      <CreateCompanyAccount
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        categoriesData={categoriesData}
        loggedInUser={loggedInUser}
        companyAccountsResponse={companyAccountsResponse}
        isCompanyAccountsLoading={isCompanyAccountsLoading}
      />

      <EditCompanyAccount
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        categoriesData={categoriesData}
        companyData={selectedCompany}
        loggedInUser={loggedInUser}
        companyAccountsResponse={companyAccountsResponse}
        isCompanyAccountsLoading={isCompanyAccountsLoading}
      />
    </div>
  );
};

export default CompanyAccount;
