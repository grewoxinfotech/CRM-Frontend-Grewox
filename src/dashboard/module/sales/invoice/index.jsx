import React, { useState } from "react";
import {
  Card,
  Typography,
  Button,
  Input,
  Dropdown,
  Menu,
  Breadcrumb,
  message,
  Row,
  Col,
  Modal,
  DatePicker,
  Space,
  Spin,
  Popover,
} from "antd";
import {
  FiPlus,
  FiSearch,
  FiDownload,
  FiHome,
  FiChevronDown,
  FiFilter,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import InvoiceList from "./InvoiceList";
import CreateInvoice from "./CreateInvoice";
import EditInvoice from "./EditInvoice";
import ViewInvoice from "./ViewInvoice";
import "./invoice.scss";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import dayjs from "dayjs";
import { useGetInvoicesQuery } from "./services/invoiceApi";
import moment from "moment";
import { useGetProductsQuery } from "../product&services/services/productApi";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import { useSelector } from "react-redux";
import {
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
} from "./services/invoiceApi";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const Invoice = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const loggedInUser = useSelector(selectCurrentUser);
  const id = loggedInUser?.id;
  const { data: invoicesData, isLoading: isInvoiceLoading } = useGetInvoicesQuery({
    page: currentPage,
    pageSize,
    search: searchText
  });
  const invoices = (invoicesData?.data || []).filter(
    (invoice) => invoice.related_id === id
  );
  const { data: productsData, isLoading: productsLoading } =
    useGetProductsQuery(loggedInUser?.id);

  const [filters, setFilters] = useState({
    dateRange: [],
  });
  const [createInvoice] = useCreateInvoiceMutation();
  const [updateInvoice] = useUpdateInvoiceMutation();

  const [isMobileMenuVisible, setIsMobileMenuVisible] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const handleDateRangeChange = (dates) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: dates ? [dates[0].startOf("day"), dates[1].endOf("day")] : [],
    }));
  };

  const handleCreate = () => {
    setSelectedInvoice(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (record) => {
    setSelectedInvoice(record);
    setIsEditModalOpen(true);
  };

  const handleView = (record) => {
    setSelectedInvoice(record);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      // TODO: Implement API call to delete invoice
      await fetch(`/api/invoices/${id}`, {
        method: "DELETE",
      });
      message.success("Invoice deleted successfully");
      fetchInvoices();
    } catch (error) {
      console.error("Delete Error:", error);
      message.error("Failed to delete invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    try {
      setLoading(true);
      const data = invoices.map((invoice) => ({
        "Invoice Number": invoice.salesInvoiceNumber,
        "Issue Date": dayjs(invoice.issueDate).format("DD/MM/YYYY"),
        "Due Date": dayjs(invoice.dueDate).format("DD/MM/YYYY"),
        "Customer Name": invoice.customerName,
        Total: invoice.total,
        Amount: invoice.amount,
        Status: invoice.payment_status,
      }));

      switch (type) {
        case "csv":
          exportToCSV(data, "invoices_export");
          break;
        case "excel":
          exportToExcel(data, "invoices_export");
          break;
        case "pdf":
          exportToPDF(data, "invoices_export");
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

  const handleCreateInvoice = async (formData) => {
    try {
      setLoading(true);
      // TODO: Implement API call to create invoice
      await fetch("/api/invoices", {
        method: "POST",
        body: formData,
      });
      message.success("Invoice created successfully");
      setIsCreateModalOpen(false);
      fetchInvoices();
    } catch (error) {
      console.error("Create Error:", error);
      message.error("Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInvoice = async (formData) => {
    try {
      setLoading(true);
      // TODO: Implement API call to update invoice
      await fetch(`/api/invoices/${selectedInvoice.id}`, {
        method: "PUT",
        body: formData,
      });
      message.success("Invoice updated successfully");
      setIsEditModalOpen(false);
      setSelectedInvoice(null);
      fetchInvoices();
    } catch (error) {
      console.error("Edit Error:", error);
      message.error("Failed to update invoice");
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
    XLSX.utils.book_append_sheet(wb, ws, "Invoices");
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

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (size) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleSearch = (value) => {
    setSearchText(value);
    setCurrentPage(1);
  };
  const mobileActionMenu = (
    <Menu className="mobile-action-menu">
      <Menu.Item key="date" className="mobile-menu-item">
        <RangePicker
          onChange={handleDateRangeChange}
          value={filters.dateRange}
          allowClear
          placeholder={["Start Date", "End Date"]}
        />
      </Menu.Item>
      <Menu.Item key="export" className="mobile-menu-item">
        <Dropdown overlay={exportMenu} trigger={["click"]}>
          <Button className="export-button">
            <FiDownload size={16} />
            Export
          </Button>
        </Dropdown>
      </Menu.Item>
    </Menu>
  );

  const filterMenu = (
    <Menu className="filter-menu">
      <Menu.Item key="date" className="filter-menu-item">
        <div className="filter-section">
          <RangePicker
            onChange={handleDateRangeChange}
            value={filters.dateRange}
            allowClear
            placeholder={["Start Date", "End Date"]}
          />
        </div>
      </Menu.Item>
      <Menu.Item key="export" className="filter-menu-item">
        <div className="filter-section">
          <Dropdown overlay={exportMenu} trigger={["click"]}>
            <Button className="export-button">
              <FiDownload size={16} />
              Export
            </Button>
          </Dropdown>
        </div>
      </Menu.Item>
    </Menu>
  );

  const searchContent = (
    <div className="search-popup">
      <Input
        prefix={<FiSearch style={{ color: "#8c8c8c" }} />}
        placeholder="Search invoices..."
        allowClear
        onChange={(e) => setSearchText(e.target.value)}
        value={searchText}
        className="search-input"
        autoFocus
      />
    </div>
  );

  return (
    <div className="invoice-page">
      <div className="page-breadcrumb">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/dashboard">
              <FiHome style={{ marginRight: "4px" }} />
              Home
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/dashboard/sales">Sales</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Invoices</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className="page-header">
        <div className="header-content">
          <div className="page-title">
            <div className="title-row">
              <div className="title-column">
                <Title level={2}>Invoices</Title>
                <Text type="secondary">Manage all invoices in the organization</Text>
              </div>
              <div className="mobile-actions">
                <Button
                  type="primary"
                  icon={<FiPlus size={18} />}
                  onClick={() => handleCreate()}
                  className="mobile-add-button"
                />
                <Popover
                  content={searchContent}
                  trigger="click"
                  visible={isSearchVisible}
                  onVisibleChange={setIsSearchVisible}
                  placement="bottomRight"
                  overlayClassName="search-popover"
                  getPopupContainer={(triggerNode) => triggerNode.parentNode}
                >
                  <Button
                    icon={<FiSearch size={18} />}
                    className="mobile-search-button"
                  />
                </Popover>
                <Dropdown
                  overlay={filterMenu}
                  trigger={["click"]}
                  visible={isFilterVisible}
                  onVisibleChange={setIsFilterVisible}
                  placement="bottomRight"
                  getPopupContainer={(triggerNode) => triggerNode.parentNode}
                >
                  <Button
                    icon={<FiFilter size={18} />}
                    className="mobile-filter-button"
                  />
                </Dropdown>
              </div>
            </div>
          </div>

          <div className="header-actions">
            <div className="desktop-actions">
              <Input
                prefix={<FiSearch style={{ color: "#8c8c8c" }} />}
                placeholder="Search invoices..."
                allowClear
                onChange={(e) => handleSearch(e.target.value)}
                value={searchText}
                className="search-input"
              />
              <RangePicker
                onChange={handleDateRangeChange}
                value={filters.dateRange}
                allowClear
                style={{ width: '70%' }}
                placeholder={["Start Date", "End Date"]}
              />
              <Dropdown overlay={exportMenu} trigger={["click"]}>
                <Button className="export-button">
                  <FiDownload size={16} />
                  Export
                </Button>
              </Dropdown>
              <Button
                type="primary"
                icon={<FiPlus size={16} />}
                onClick={() => handleCreate()}
                className="add-button"
              >
                Create Invoice
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Card className="invoice-table-card">
        <InvoiceList
          loading={isInvoiceLoading || loading}
          invoices={invoices}
          searchText={searchText}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          filters={filters}
          pagination={{
            current: currentPage,
            pageSize,
            total: invoicesData?.pagination?.total || 0,
            totalPages: invoicesData?.pagination?.totalPages || 0,
            onChange: handlePageChange,
            onSizeChange: handlePageSizeChange
          }}
        />
      </Card>

      <CreateInvoice
        open={isCreateModalOpen}
        onSubmit={handleCreateInvoice}
        id={id}
        productsData={productsData}
        productsLoading={productsLoading}
        setCreateModalVisible={setIsCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
      />

      <EditInvoice
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setSelectedInvoice(null);
        }}
        onSubmit={handleUpdateInvoice}
        productsData={productsData}
        productsLoading={productsLoading}
        initialValues={selectedInvoice}
      />

      <ViewInvoice
        open={isViewModalOpen}
        onCancel={() => {
          setIsViewModalOpen(false);
          setSelectedInvoice(null);
        }}
        invoice={selectedInvoice}
      />
    </div>
  );
};

export default Invoice;
