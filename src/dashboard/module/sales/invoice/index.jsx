import React, { useState } from "react";
import {
  Card,
  Typography,
  Button,
  Input,
  Dropdown,
  Menu,
  message,
  DatePicker,
} from "antd";
import {
  FiPlus,
  FiSearch,
  FiDownload,
  FiHome,
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
import { useGetProductsQuery } from "../product&services/services/productApi";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import { useSelector } from "react-redux";
import {
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
} from "./services/invoiceApi";
import { useGetDealsQuery } from "../../crm/deal/services/DealApi";
import PageHeader from "../../../../components/PageHeader";

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

  const { data: deals } = useGetDealsQuery({ page: 1, pageSize: -1, search: '' });
  const { data: invoicesData, isLoading: isInvoiceLoading } = useGetInvoicesQuery({
    page: currentPage, pageSize, search: searchText, id: id
  });
  const invoices = invoicesData?.data || [];
  const { data: productsData, isLoading: productsLoading } = useGetProductsQuery(loggedInUser?.id);

  const [filters, setFilters] = useState({ dateRange: [] });
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const handleDateRangeChange = (dates) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: dates ? [dates[0].startOf("day"), dates[1].endOf("day")] : [],
    }));
  };

  const handleExport = async (type) => {
    try {
      setLoading(true);
      const data = invoices.map((inv) => ({
        "Invoice #": inv.salesInvoiceNumber,
        "Customer": inv.customerName,
        "Total": inv.total,
        "Status": inv.payment_status,
        "Date": dayjs(inv.issueDate).format("DD/MM/YYYY"),
      }));

      switch (type) {
        case "csv": exportToCSV(data, "invoices"); break;
        case "excel": exportToExcel(data, "invoices"); break;
        case "pdf": exportToPDF(data, "invoices"); break;
      }
      message.success(`Exported as ${type.toUpperCase()}`);
    } catch (error) {
      message.error("Export failed");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data, filename) => {
    const csv = [Object.keys(data[0]).join(","), ...data.map(i => Object.values(i).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
  };

  const exportToExcel = (data, filename) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Invoices");
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const exportToPDF = (data, filename) => {
    const doc = new jsPDF("l", "pt", "a4");
    doc.autoTable({ head: [Object.keys(data[0])], body: data.map(i => Object.values(i)) });
    doc.save(`${filename}.pdf`);
  };

  return (
    <div className="invoice-page standard-page-container">
      <PageHeader
        title="Invoices"
        count={invoicesData?.pagination?.total || 0}
        subtitle="Manage all sales invoices"
        breadcrumbItems={[
          { title: <Link to="/dashboard"><FiHome style={{marginRight: "4px"}}/> Home</Link> },
          { title: "Sales" },
          { title: "Invoices" },
        ]}
        searchText={searchText}
        onSearch={setSearchText}
        searchPlaceholder="Search invoices..."
        onAdd={() => setIsCreateModalOpen(true)}
        addText="Create Invoice"
        isSearchVisible={isSearchVisible}
        onSearchVisibleChange={setIsSearchVisible}
        exportMenu={{
          items: [
            { key: 'csv', label: 'Export CSV', icon: <FiDownload />, onClick: () => handleExport('csv') },
            { key: 'excel', label: 'Export Excel', icon: <FiDownload />, onClick: () => handleExport('excel') },
            { key: 'pdf', label: 'Export PDF', icon: <FiDownload />, onClick: () => handleExport('pdf') },
          ]
        }}
        extraActions={
          <DatePicker.RangePicker 
            onChange={handleDateRangeChange}
            style={{ borderRadius: '8px', height: '30px' }}
          />
        }
      />

      <Card className="standard-content-card">
        <InvoiceList
          loading={isInvoiceLoading || loading}
          invoices={invoices}
          deals={deals}
          onEdit={(inv) => { setSelectedInvoice(inv); setIsEditModalOpen(true); }}
          onDelete={(id) => message.info("Delete functionality integration pending")}
          onView={(inv) => { setSelectedInvoice(inv); setIsViewModalOpen(true); }}
          pagination={{
            current: currentPage,
            pageSize,
            total: invoicesData?.pagination?.total || 0,
            onChange: setCurrentPage,
            onSizeChange: setPageSize
          }}
        />
      </Card>

      <CreateInvoice
        open={isCreateModalOpen}
        id={id}
        productsData={productsData}
        productsLoading={productsLoading}
        onCancel={() => setIsCreateModalOpen(false)}
      />

      <EditInvoice
        open={isEditModalOpen}
        onCancel={() => { setIsEditModalOpen(false); setSelectedInvoice(null); }}
        productsData={productsData}
        productsLoading={productsLoading}
        initialValues={selectedInvoice}
      />

      <ViewInvoice
        open={isViewModalOpen}
        onCancel={() => { setIsViewModalOpen(false); setSelectedInvoice(null); }}
        invoice={selectedInvoice}
      />
    </div>
  );
};

export default Invoice;
