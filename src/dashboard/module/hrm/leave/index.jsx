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
  Row,
  Col,
  Tabs,
} from "antd";
import {
  FiPlus,
  FiSearch,
  FiDownload,
  FiHome,
  FiChevronDown,
  FiGrid,
  FiList,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import CreateLeave from "./CreateLeave";
import LeaveList from "./LeaveList";
import EditLeave from "./Editleave";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";
import { useGetLeaveQuery } from "./services/LeaveApi";
import "./leave.scss";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Leave = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [viewType, setViewType] = useState("list"); // 'list' or 'grid'
  const { data: leaveData = [], isLoading } = useGetLeaveQuery();

  const handleCreate = () => {
    setSelectedLeave(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (record) => {
    setSelectedLeave(record);
    setIsEditModalOpen(true);
  };

  const handleView = (record) => {
    console.log("View leave request:", record);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "#faad14", fontSize: "22px" }}>⚠</span>
          Delete Leave Request
        </div>
      ),
      content: "Are you sure you want to delete this leave request?",
      okText: "Yes",
      cancelText: "No",
      centered: true,
      className: "custom-delete-modal",
      icon: null,
      maskClosable: true,
      okButtonProps: {
        danger: true,
        size: "middle",
      },
      cancelButtonProps: {
        size: "middle",
      },
      onOk: () => {
        message.success("Leave request deleted successfully");
      },
    });
  };

  const handleExport = async (type) => {
    try {
      setLoading(true);
      const data = leaveData.map((leave) => ({
        "Employee Name": leave.employeeName,
        "Leave Type": leave.leaveType,
        "Start Date": moment(leave.startDate).format("MMM DD, YYYY"),
        "End Date": moment(leave.endDate).format("MMM DD, YYYY"),
        Status: leave.status,
        Reason: leave.reason,
      }));

      switch (type) {
        case "csv":
          exportToCSV(data, "leave_requests.csv");
          break;
        case "excel":
          exportToExcel(data, "leave_requests.xlsx");
          break;
        case "pdf":
          exportToPDF(data, "leave_requests.pdf");
          break;
        default:
          break;
      }
    } catch (error) {
      message.error("Failed to export data");
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = (data, filename) => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      data.map((row) => Object.values(row).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = (data, filename) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leave Requests");
    XLSX.writeFile(wb, filename);
  };

  const exportToPDF = (data, filename) => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [Object.keys(data[0])],
      body: data.map((row) => Object.values(row)),
      theme: "grid",
    });
    doc.save(filename);
  };

  return (
    <div className="revenue-page">
      <div className="page-breadcrumb">
        <Breadcrumb
          items={[
            {
              title: (
                <Link to="/dashboard">
                  <FiHome /> Home
                </Link>
              ),
            },
            {
              title: "HRM",
            },
            {
              title: "Leave Management",
            },
          ]}
        />
      </div>

      <div className="page-header">
        <div className="page-title">
          <h2>Leave Management</h2>
          <Text type="secondary">Manage employee leave requests</Text>
        </div>
        <div className="header-actions">
          <div className="search-input">
            <Input
              placeholder="Search leave requests..."
              prefix={<FiSearch />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
          <div className="action-buttons">
            <Dropdown
              overlay={
                <Menu>
                  <Menu.Item key="csv" onClick={() => handleExport("csv")}>
                    Export as CSV
                  </Menu.Item>
                  <Menu.Item key="excel" onClick={() => handleExport("excel")}>
                    Export as Excel
                  </Menu.Item>
                  <Menu.Item key="pdf" onClick={() => handleExport("pdf")}>
                    Export as PDF
                  </Menu.Item>
                </Menu>
              }
              trigger={["click"]}
            >
              <Button className="export-button" loading={loading}>
                <FiDownload /> Export <FiChevronDown />
              </Button>
            </Dropdown>
            <Button type="primary" className="add-button" onClick={handleCreate}>
              <FiPlus /> New Leave Request
            </Button>
          </div>
        </div>
      </div>

     
            <LeaveList
              onEdit={handleEdit}
              onView={handleView}
              searchText={searchText}
            />

      {isCreateModalOpen && (
        <CreateLeave
          open={isCreateModalOpen}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      )}

      {isEditModalOpen && selectedLeave && (
        <EditLeave
          open={isEditModalOpen}
          onCancel={() => setIsEditModalOpen(false)}
          initialValues={selectedLeave}
        />
      )}
    </div>
  );
};

export default Leave;
