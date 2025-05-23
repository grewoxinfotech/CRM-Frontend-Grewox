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
  FiAlertCircle,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import ContactList from "./ContactList";
import CreateContact from "./CreateContact";
import EditContact from "./EditContact";
import { useGetContactsQuery, useDeleteContactMutation } from "./services/contactApi";
import { useGetCompanyAccountsQuery } from "../companyacoount/services/companyAccountApi";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import { useSelector } from "react-redux";
import moment from "moment";
import './contact.scss';

const { Title, Text } = Typography;

const Contact = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const { data: contactsResponse, isLoading } = useGetContactsQuery({
    page: currentPage,
    pageSize,
    search: searchText
  });

  const { data: companyAccountsResponse = { data: [] }, isLoading: isCompanyAccountsLoading } = useGetCompanyAccountsQuery();
  const [deleteContact] = useDeleteContactMutation();
  const loggedInUser = useSelector(selectCurrentUser);

  const handleTableChange = (pagination, filters, sorter) => {
    setCurrentPage(pagination.current);
    setPageSize(pagination.pageSize);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setCurrentPage(1); // Reset to first page on new search
  };

  const handleCreate = () => {
    setSelectedContact(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (record) => {
    setSelectedContact(record);
    setIsEditModalOpen(true);
  };

  const handleView = (record) => {
    console.log("View contact:", record);
  };

  const handleDelete = (recordOrIds) => {
    const isMultiple = Array.isArray(recordOrIds);
    Modal.confirm({
      title: isMultiple ? 'Delete Selected Contacts' : 'Delete Contact',
      content: isMultiple
        ? `Are you sure you want to delete ${recordOrIds.length} selected contacts?`
        : 'Are you sure you want to delete this contact?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      bodyStyle: {
        padding: "20px",
      },
      onOk: async () => {
        try {
          if (isMultiple) {
            const results = await Promise.all(recordOrIds.map(id => deleteContact(id).unwrap()));
            const allSuccessful = results.every(result => result.success);
            if (allSuccessful) {
              message.success(`${recordOrIds.length} contacts deleted successfully`);
            } else {
              throw new Error('Some contacts could not be deleted');
            }
          } else {
            const result = await deleteContact(recordOrIds).unwrap();
            if (result.success) {
              message.success('Contact deleted successfully');
            } else {
              throw new Error(result.message || 'Failed to delete contact');
            }
          }
        } catch (error) {
          message.error(error?.data?.message || error.message || 'Failed to delete contact(s)');
        }
      },
    });
  };

  const handleCreateSubmit = async (values) => {
    try {
      setLoading(true);
      message.success('Contact created successfully');
      setIsCreateModalOpen(false);
    } catch (error) {
      message.error('Failed to create contact');
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (values) => {
    try {
      setLoading(true);
      message.success('Contact updated successfully');
      setIsEditModalOpen(false);
      setSelectedContact(null);
    } catch (error) {
      message.error('Failed to update contact');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    try {
      setLoading(true);
      const data = contactsResponse?.data?.map((contact) => ({
        "Name": `${contact.first_name} ${contact.last_name}`,
        "Email": contact.email,
        "Phone": contact.phone,
        "Company": contact.company_name || 'N/A',
        "Contact Owner": contact.contact_owner === loggedInUser?.id ? loggedInUser?.username : contact.contact_owner,
        "Created Date": moment(contact.createdAt).format("DD-MM-YYYY")
      })) || [];

      if (data.length === 0) {
        message.warning('No data available to export');
        return;
      }

      switch (type) {
        case "csv":
          exportToCSV(data, "contacts_export");
          break;
        case "excel":
          exportToExcel(data, "contacts_export");
          break;
        case "pdf":
          exportToPDF(data, "contacts_export");
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
    XLSX.utils.book_append_sheet(wb, ws, "Contacts");
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
    <div className="contact-page">
      <div className="page-breadcrumb">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/dashboard">
              <FiHome style={{ marginRight: "4px" }} />
              Home
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Contacts</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className="page-header">
        <div className="page-title">
          <Title level={2}>Contacts</Title>
          <Text type="secondary">Manage all contacts in the organization</Text>
        </div>
        <div className="header-actions">
          <div className="desktop-actions">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div className="search-container">
                <Input
                  prefix={<FiSearch style={{ color: "#8c8c8c", fontSize: "16px" }} />}
                  placeholder="Search contacts..."
                  allowClear
                  onChange={(e) => handleSearch(e.target.value)}
                  value={searchText}
                  className="search-input"
                />
                <Popover
                  content={
                    <div className="search-popup">
                      <Input
                        prefix={<FiSearch style={{ color: "#8c8c8c" }} />}
                        placeholder="Search contacts..."
                        allowClear
                        onChange={(e) => handleSearch(e.target.value)}
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
                <span className="button-text">Add Contact</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Card className="content-card">
        <ContactList
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
          searchText={searchText}
          isLoading={isLoading}
          loggedInUser={loggedInUser}
          contactsResponse={contactsResponse}
          companyAccountsResponse={companyAccountsResponse}
          isCompanyAccountsLoading={isCompanyAccountsLoading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: contactsResponse?.pagination?.total || 0,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} contacts`,
            onChange: handleTableChange
          }}
        />
      </Card>

      <CreateContact
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        isLoading={isLoading}
        loggedInUser={loggedInUser}
        contactsResponse={contactsResponse}
        companyAccountsResponse={companyAccountsResponse}
        isCompanyAccountsLoading={isCompanyAccountsLoading}
      />

      <EditContact
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        onSubmit={handleEditSubmit}
        contactData={selectedContact}
        isLoading={isLoading}
        loggedInUser={loggedInUser}
        contactsResponse={contactsResponse}
        companyAccountsResponse={companyAccountsResponse}
        isCompanyAccountsLoading={isCompanyAccountsLoading}
      />
    </div>
  );
};

export default Contact;
