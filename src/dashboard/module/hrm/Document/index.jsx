import React, { useState, useRef } from "react";
import {
  Typography,
  Button,
  Modal,
  message,
  Input,
  Dropdown,
  Menu,
  Breadcrumb,
  Card,
  Popover
} from "antd";
import {
  FiPlus,
  FiSearch,
  FiChevronDown,
  FiDownload,
  FiHome,
} from "react-icons/fi";
import "./document.scss";
import moment from "moment";
import * as XLSX from "xlsx";
import CreateDocument from "./CreateDocument";
import DocumentList from "./DocumentList";
import { Link } from "react-router-dom";
import { useGetDocumentsQuery, useDeleteDocumentMutation } from "./services/documentApi";

const { Title, Text } = Typography;

const Document = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const searchInputRef = useRef(null);
  const [deleteDocument, { isLoading: isDeleting }] = useDeleteDocumentMutation();

  const { data: response, isLoading } = useGetDocumentsQuery({
    page: currentPage,
    pageSize,
    search: searchText
  });

  const documents = response?.message?.data || [];
  const pagination = response?.message?.pagination || {
    total: 0,
    current: 1,
    pageSize: 10,
    totalPages: 0
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const handleAddDocument = () => {
    setSelectedDocument(null);
    setIsEditing(false);
    setIsFormVisible(true);
  };

  const handleEditDocument = (document) => {
    setSelectedDocument(document);
    setIsEditing(true);
    setIsFormVisible(true);
  };

  const handleDeleteConfirm = async (id) => {
    try {
      await deleteDocument(id).unwrap();
      message.success("Document deleted successfully");
    } catch (error) {
      message.error(error.data?.message || "Failed to delete document");
    }
  };

  const handleFormSubmit = async (formData) => {
    try {
      message.success(isEditing ? "Document updated successfully" : "Document created successfully");
      setIsFormVisible(false);
    } catch (error) {
      message.error("Operation failed");
    }
  };

  const handleExport = async (type) => {
    try {
      if (!documents.length) {
        message.warning('No data available to export');
        return;
      }

      const formattedData = documents.map(doc => ({
        'Name': doc.name || '-',
        'Role': doc.role || '-',
        'Description': doc.description || '-',
        'Created By': doc.created_by || '-',
        'Created Date': doc.createdAt ? moment(doc.createdAt).format('DD-MM-YYYY') : '-',
      }));

      const fileName = `documents_${moment().format('DD-MM-YYYY')}`;

      switch (type) {
        case 'csv':
          const csvContent = [
            Object.keys(formattedData[0]).join(','),
            ...formattedData.map(item =>
              Object.values(item)
                .map(value => `"${value?.toString().replace(/"/g, '""')}"`)
                .join(',')
            )
          ].join('\n');

          const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.setAttribute('href', url);
          link.setAttribute('download', `${fileName}.csv`);
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          message.success('Successfully exported as CSV');
          break;

        case 'excel':
          const ws = XLSX.utils.json_to_sheet(formattedData);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'Documents');
          XLSX.writeFile(wb, `${fileName}.xlsx`);
          message.success('Successfully exported as Excel');
          break;

        default:
          message.error('Unsupported export type');
      }
    } catch (error) {
      console.error('Export error:', error);
      message.error('Failed to export data');
    }
  };

  const searchContent = (
    <div className="search-content">
      <Input
        prefix={<FiSearch style={{ color: '#8c8c8c', fontSize: '16px' }} />}
        placeholder="Search documents..."
        allowClear
        onChange={(e) => handleSearch(e.target.value)}
        value={searchText}
        ref={searchInputRef}
        className="search-input"
      />
    </div>
  );

  return (
    <div className="document-page">
      <div className="page-breadcrumb">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/dashboard">
              <FiHome style={{ marginRight: "4px" }} />
              Home
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/dashboard/hrm">HRM</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Documents</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className="page-header">
        <div className="page-title">
          <Title level={2}>Documents</Title>
          <Text type="secondary">Manage all documents in the organization</Text>
        </div>
        <div className="header-actions">
          <div className="desktop-actions">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div className="search-container">
                <Input
                  prefix={<FiSearch style={{ color: "#8c8c8c", fontSize: "16px" }} />}
                  placeholder="Search documents..."
                  allowClear
                  onChange={(e) => handleSearch(e.target.value)}
                  value={searchText}
                  ref={searchInputRef}
                  className="search-input"
                />
                <Popover
                  content={searchContent}
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
              <Dropdown overlay={
                <Menu>
                  <Menu.Item key="csv" onClick={() => handleExport('csv')}>
                    Export as CSV
                  </Menu.Item>
                  <Menu.Item key="excel" onClick={() => handleExport('excel')}>
                    Export as Excel
                  </Menu.Item>
                </Menu>
              } trigger={['click']}>
                <Button className="export-button">
                  <FiDownload size={16} />
                  <span className="button-text">Export</span>
                </Button>
              </Dropdown>
              <Button
                type="primary"
                icon={<FiPlus size={16} />}
                onClick={handleAddDocument}
                className="add-button"
              >
                <span className="button-text">Create Document</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="document-table-card">
        <DocumentList
          loading={isLoading}
          documents={documents}
          pagination={pagination}
          onEdit={handleEditDocument}
          onDelete={handleDeleteConfirm}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
        />
      </div>

      <CreateDocument
        open={isFormVisible}
        onCancel={() => setIsFormVisible(false)}
        onSubmit={handleFormSubmit}
        initialValues={selectedDocument}
        isEditing={isEditing}
      />
    </div>
  );
};

export default Document;
