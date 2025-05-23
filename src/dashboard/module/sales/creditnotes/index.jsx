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
} from "react-icons/fi";
import { Link } from "react-router-dom";
import CreateCreditNotes from "./CreateCreditNotes";
import CreditNotesList from "./CreditNotesList";
import EditCreditNotes from "./EditCreditNotes";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";
import {
  useGetCreditNotesQuery,
  useCreateCreditNoteMutation,
  useUpdateCreditNoteMutation,
} from "./services/creditNoteApi";

const { Title, Text } = Typography;

const CreditNotes = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCreditNote, setSelectedCreditNote] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const { data: creditNotesData = [], isLoading } = useGetCreditNotesQuery({
    page: currentPage,
    pageSize,
    search: searchText
  });
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const [createCreditNote] = useCreateCreditNoteMutation();
  const [updateCreditNote] = useUpdateCreditNoteMutation();

  const handleCreate = () => {
    setSelectedCreditNote(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (record) => {
    setSelectedCreditNote(record);
    setIsEditModalOpen(true);
  };

  const handleView = (record) => {
    console.log("View credit note:", record);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: "Delete Credit Note",
      content: "Are you sure you want to delete this credit note?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      bodyStyle: {
        padding: "20px",
      },
      onOk: async () => {
        try {
          // Add delete mutation here
          message.success("Credit note deleted successfully");
        } catch (error) {
          message.error(error?.data?.message || "Failed to delete credit note");
        }
      },
    });
  };

  const handleCreateSubmit = async (values) => {
    try {
      setLoading(true);
      await createCreditNote(values).unwrap();
      message.success("Credit note created successfully");
      setIsCreateModalOpen(false);
    } catch (error) {
      message.error(error?.data?.message || "Failed to create credit note");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async (values) => {
    try {
      setLoading(true);
      await updateCreditNote({ id: selectedCreditNote.id, ...values }).unwrap();
      message.success("Credit note updated successfully");
      setIsEditModalOpen(false);
      setSelectedCreditNote(null);
    } catch (error) {
      message.error(error?.data?.message || "Failed to update credit note");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    try {
      setLoading(true);
      const data = creditNotesData.map((note) => ({
        "Credit Note #": note.account,
        Amount: note.amount,
        Date: note.date,
        Customer: note.customer,
        "Invoice Reference": note.invoiceReference,
        Reason: note.reason,
        Status: note.status,
        Description: note.description,
      }));

      switch (type) {
        case "csv":
          exportToCSV(data, "credit_notes_export");
          break;
        case "excel":
          exportToExcel(data, "credit_notes_export");
          break;
        case "pdf":
          exportToPDF(data, "credit_notes_export");
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
    XLSX.utils.book_append_sheet(wb, ws, "Credit Notes");
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
  const searchContent = (
    <div className="search-popup">
      <Input
        prefix={<FiSearch style={{ color: "#8c8c8c" }} />}
        placeholder="Search credit notes..."
        allowClear
        onChange={(e) => setSearchText(e.target.value)}
        value={searchText}
        className="search-input"
        autoFocus
      />
    </div>
  );

  return (
    <div className="credit-notes-page">
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
          <Breadcrumb.Item>Credit Notes</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className="page-header">
        <div className="page-title">
          <Title level={2}>Credit Notes</Title>
          <Text className="page-description" type="secondary">
            Manage all credit notes in the organization
          </Text>
        </div>
        <div className="header-actions">
          <div className="desktop-actions">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div className="search-container">
              <Input
              prefix={
                <FiSearch style={{ color: "#8c8c8c", fontSize: "16px" }} />
              }
              placeholder="Search credit notes..."
              allowClear
              onChange={(e) => handleSearch(e.target.value)}
              value={searchText}
              className="search-input"
              // style={{ width: 350 }}
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
              <div className="action-buttons">
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
                  <span className="button-text">Add Credit Note</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Card className="content-card">
        <CreditNotesList
          data={creditNotesData?.data || []}
          loading={isLoading}
          onEdit={handleEdit}
          onView={handleView}
          onDelete={handleDelete}
          searchText={searchText}
          pagination={{
            current: currentPage,
            pageSize,
            total: creditNotesData?.pagination?.total || 0,
            totalPages: creditNotesData?.pagination?.totalPages || 0,
            onChange: handlePageChange,
            onSizeChange: handlePageSizeChange
          }}
        />
      </Card>

      <CreateCreditNotes
        open={isCreateModalOpen}
        onCancel={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
        loading={loading}
      />

      <EditCreditNotes
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setSelectedCreditNote(null);
        }}
        onSubmit={handleEditSubmit}
        creditNote={selectedCreditNote}
        loading={loading}
      />
    </div>
  );
};

export default CreditNotes;
