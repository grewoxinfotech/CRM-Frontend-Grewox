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
import { Link, useParams } from "react-router-dom";
import InvoiceList from "../../../../sales/invoice/InvoiceList";
import CreateInvoice from "../../../../sales/invoice/CreateInvoice";
import EditInvoice from "../../../../sales/invoice/EditInvoice";
import ViewInvoice from "../../../../sales/invoice/ViewInvoice";
// import "../../../../sales/invoice/invoice.scss";
import "./invoice.scss";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import dayjs from "dayjs";
import { useGetInvoicesQuery } from "../../../../sales/invoice/services/invoiceApi";
import moment from "moment";
import { useGetProductsQuery } from "../../../../sales/product&services/services/productApi";
import { selectCurrentUser } from "../../../../../../auth/services/authSlice";
import { useSelector } from "react-redux";
import {
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
} from "../../../../sales/invoice/services/invoiceApi";
import { useGetDealsQuery } from "../../services/DealApi";
// import { useGetDealsQuery } from "../../../services/DealApi";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const Invoice = () => {
  const idd = useParams();
  const id = idd.dealId;
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const loggedInUser = useSelector(selectCurrentUser);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const { data: deals } = useGetDealsQuery({ 
    page: 1,
    pageSize: -1,
    search: ''
  });

  const { data: invoicesData, isLoading, error } = useGetInvoicesQuery({
    page: currentPage,
    pageSize,
    search: searchText,
    id: id
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

  const handleDateRangeChange = (dates) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: dates ? [dates[0].startOf("day"), dates[1].endOf("day")] : [],
    }));
  };

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

  const handleCreate = () => {
    setIsCreateModalOpen(true);
  };

  const handleEdit = (invoice) => {
    setSelectedInvoice(invoice);
    setIsEditModalOpen(true);
  };

  const handleView = (invoice) => {
    setSelectedInvoice(invoice);
    setIsViewModalOpen(true);
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
      <div className="page-header">
        <div className="header-content">
          <div className="page-title">
            <div className="title-row">
              <div className="title-column">
                <Title level={2}>Invoices</Title>
                <Text type="secondary">Manage all invoices for this deal</Text>
              </div>
              <div className="mobile-actions">
                <Button
                  type="primary"
                  icon={<FiPlus size={18} />}
                  onClick={handleCreate}
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
                onClick={handleCreate}
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
          loading={isLoading || loading}
          invoices={invoices}
          deals={deals}
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
        onSubmit={(formData) => {
          // Handle create submission
        }}
        productsData={productsData}
        id={id}
        invoices={invoices}
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
        onSubmit={(formData) => {
          // Handle edit submission
        }}
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
