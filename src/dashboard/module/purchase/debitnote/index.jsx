import React, { useState, useEffect } from "react";
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
  Alert,
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
import DebitNoteList from "./DebitNoteList";
import CreateDebitNote from "./CreateDebitNote";
import "./debitnote.scss";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";
import {
  useGetDebitNotesQuery,
  useCreateDebitNoteMutation,
  useDeleteDebitNoteMutation,
} from "./services/debitnoteApi";
import { useSelector } from "react-redux";

const { Title, Text } = Typography;

const getCompanyId = (state) => {
  const user = state.auth.user;
  return user?.companyId || user?.company_id || user?.id;
};

const DebitNote = () => {
  const entireState = useSelector((state) => state);
  const loggedInUser = useSelector((state) => state.auth.user);
  const companyId = useSelector(getCompanyId);

  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedDebitNote, setSelectedDebitNote] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [loading, setLoading] = useState(false);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [createDebitNote] = useCreateDebitNoteMutation();
  const [deleteDebitNote] = useDeleteDebitNoteMutation();

  const {
    data: debitNotes,
    isLoading,
    isError,
    refetch,
  } = useGetDebitNotesQuery({
    page: pagination.current,
    pageSize: pagination.pageSize,
    search: searchText,
    company_id: companyId
  }, {
    skip: !companyId
  });

  useEffect(() => {
    if (!companyId) {
      console.warn("No company ID found in user data");
    }
  }, [companyId]);

  useEffect(() => {
    if (debitNotes?.pagination) {
      setPagination(prev => ({
        ...prev,
        total: debitNotes.pagination.total
      }));
    }
  }, [debitNotes]);

  const handleEdit = (record) => {
    console.log("Edit record:", record);
    setSelectedDebitNote(record);
    setIsEditModalVisible(true);
  };

  const handleView = (record) => {
    console.log("View debit note:", record);
  };

  const handleDelete = async (recordOrIds) => {
    try {
      const ids = Array.isArray(recordOrIds) ? recordOrIds : [recordOrIds.id || recordOrIds._id];

      if (!ids.length || ids.some(id => !id)) {
        throw new Error("Invalid debit note ID(s)");
      }

      Modal.confirm({
        title: `Are you sure you want to delete ${ids.length > 1 ? 'these debit notes' : 'this debit note'}?`,
        content: "This action cannot be undone.",
        okText: "Yes",
        okType: "danger",
        cancelText: "No",
        onOk: async () => {
          try {
            const promises = ids.map(id => deleteDebitNote(id).unwrap());
            await Promise.all(promises);
            message.success(`Successfully deleted ${ids.length} debit note${ids.length > 1 ? 's' : ''}`);
            refetch();
          } catch (error) {
            console.error("Delete Error:", error);
            message.error(error.data?.message || error.message || "Failed to delete debit note(s)");
          }
        },
      });
    } catch (error) {
      console.error("Delete Error:", error);
      message.error(error.message || "Failed to delete debit note(s)");
    }
  };

  const handleExport = async (type) => {
    try {
      setLoading(true);
      const data =
        debitNotes?.data?.map((note) => ({
          "Bill Number": note.billNumber || note.bill_number || note.bill,
          Date: note.date || note.createdAt,
          Amount: note.amount || note.total,
          Description: note.description || note.discription,
        })) || [];

      switch (type) {
        case "csv":
          exportToCSV(data, "debitnote_export");
          break;
        case "excel":
          exportToExcel(data, "debitnote_export");
          break;
        case "pdf":
          exportToPDF(data, "debitnote_export");
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
    XLSX.utils.book_append_sheet(wb, ws, "DebitNotes");
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

  const searchContent = (
    <div className="search-popup">
      <Input
        prefix={<FiSearch style={{ color: "#8c8c8c" }} />}
        placeholder="Search debit notes..."
        allowClear
        onChange={(e) => setSearchText(e.target.value)}
        value={searchText}
        className="search-input"
        autoFocus
      />
    </div>
  );

  const handleCreateDebitNote = async (formData) => {
    try {
      if (!companyId) {
        message.error("Company ID not found");
        return;
      }

      const response = await createDebitNote({
        id: companyId,
        data: formData,
      });

      if (response.data?.success) {
        message.success("Debit note created successfully");
        setIsCreateModalVisible(false);
        refetch();
      } else {
        message.error(
          response.error?.data?.message || "Failed to create debit note"
        );
      }
    } catch (error) {
      message.error("Failed to create debit note");
      console.error("Create debit note error:", error);
    }
  };

  const handleSearch = (e) => {
    setSearchText(e.target.value);
    setPagination(prev => ({
      ...prev,
      current: 1
    }));
  };

  const handleTableChange = (newPagination, filters, sorter) => {
    setPagination(prev => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize
    }));
  };

  return (
    <div className="debitnote-page">
      <div className="page-breadcrumb">
        <Breadcrumb>
          <Breadcrumb.Item>
            <Link to="/dashboard">
              <FiHome style={{ marginRight: "4px" }} />
              Home
            </Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <Link to="/dashboard/purchase">Purchase</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Debit Notes</Breadcrumb.Item>
        </Breadcrumb>
      </div>

      <div className="page-header">
        <div className="page-title">
          <Title level={2}>Debit Notes</Title>
          <Text className="page-description" type="secondary">Manage all debit notes in the organization</Text>
        </div>
        <div className="header-actions">
          <div className="desktop-actions">
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div className="search-container">
              <Input
              prefix={<FiSearch style={{ color: "#8c8c8c", fontSize: "16px" }} />}
              placeholder="Search debit notes..."
              allowClear
              onChange={handleSearch}
              value={searchText}
              className="search-input"
              // style={{
              //   width: "300px",
              //   borderRadius: "20px",
              //   height: "38px",
              // }}
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
              <Dropdown overlay={exportMenu} trigger={["click"]}>
                <Button className="export-button">
                  <FiDownload size={16} />
                  <span className="button-text">Export</span>
                </Button>
              </Dropdown>
              <Button
                type="primary"
                icon={<FiPlus size={16} />}
                onClick={() => setIsCreateModalVisible(true)}
                className="add-button"
              >
                <span className="button-text">Add Debit Note</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {!companyId && (
        <Alert
          message="Warning"
          description="Company ID not found. Some features may not work properly."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}

      <Card className="debitnote-table-card">
        <DebitNoteList
          debitNotes={debitNotes?.data || []}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          searchText={searchText}
          loading={isLoading}
          pagination={pagination}
          onChange={handleTableChange}
        />
      </Card>

      <CreateDebitNote
        open={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        onSubmit={handleCreateDebitNote}
      />
    </div>
  );
};

export default DebitNote;
