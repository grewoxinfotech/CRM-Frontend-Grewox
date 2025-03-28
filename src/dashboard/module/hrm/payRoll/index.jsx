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
} from "antd";
import {
  FiPlus,
  FiSearch,
  FiDownload,
  FiHome,
  FiChevronDown,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import CreateSalary from "./CreateSalary";
import SalaryList from "./SalaryList";
import EditSalary from "./EditSalary";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";
import { useGetSalaryQuery } from "./services/salaryApi";

const { Title, Text } = Typography;

const Salary = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedSalary, setSelectedSalary] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: salaryData = [], isLoading } = useGetSalaryQuery();

  const handleCreate = () => {
    setSelectedSalary(null);
    setIsCreateModalOpen(true);
  };

  const handleEdit = (record) => {
    setSelectedSalary(record);
    setIsEditModalOpen(true);
  };

  const handleView = (record) => {
    console.log("View salary:", record);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ color: "#faad14", fontSize: "22px" }}>⚠</span>
          Delete Salary
        </div>
      ),
      content: "Are you sure you want to delete this salary?",
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
        message.success("Salary deleted successfully");
      },
    });
  };

  const handleExport = async (type) => {
    try {
      setLoading(true);
      const data = salaryData.map((salary) => ({
        "Employee Name": salary.employeeName,
        Salary: salary.salary,
        "Start Date": moment(salary.startDate).format("MMM DD, YYYY"),
        "End Date": moment(salary.endDate).format("MMM DD, YYYY"),
        Status: salary.status,
        Reason: salary.reason,
      }));

      switch (type) {
        case "csv":
          exportToCSV(data, "salary.csv");
          break;
        case "excel":
          exportToExcel(data, "salary.xlsx");
          break;
        case "pdf":
          exportToPDF(data, "salary.pdf");
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
    XLSX.utils.book_append_sheet(wb, ws, "Salary");
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
    <div
      className="salary-container"
      style={{ padding: "24px", backgroundColor: "#f5f7fa" }}
    >
      <div className="page-header" style={{ marginBottom: "24px" }}>
        <Breadcrumb
          items={[
            {
              title: (
                <Link
                  to="/dashboard"
                  style={{
                    color: "#1890ff",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <FiHome />
                </Link>
              ),
              key: "home",
            },
            {
              title: "HRM",
              key: "hrm",
            },
            {
              title: "Payroll Management",
              key: "payroll",
            },
          ]}
        />
        <Title
          level={2}
          style={{ margin: "16px 0", color: "#1f1f1f", fontWeight: 600 }}
        >
          Payroll Management
        </Title>
      </div>

      <Card
        className="salary-card"
        style={{
          borderRadius: "8px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          background: "#ffffff",
        }}
      >
        <div
          className="card-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            padding: "0 8px",
          }}
        >
          <div className="search-section">
            <Input
              placeholder="Search leave requests..."
              prefix={<FiSearch style={{ color: "#bfbfbf" }} />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{
                width: 300,
                borderRadius: "6px",
                border: "1px solid #d9d9d9",
                transition: "all 0.3s",
                "&:hover": {
                  borderColor: "#40a9ff",
                },
              }}
            />
          </div>
          <div
            className="actions-section"
            style={{ display: "flex", gap: "12px" }}
          >
            <Dropdown
              overlay={
                <Menu
                  style={{
                    borderRadius: "6px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                  }}
                >
                  <Menu.Item
                    key="csv"
                    onClick={() => handleExport("csv")}
                    style={{ padding: "8px 16px" }}
                  >
                    Export as CSV
                  </Menu.Item>
                  <Menu.Item
                    key="excel"
                    onClick={() => handleExport("excel")}
                    style={{ padding: "8px 16px" }}
                  >
                    Export as Excel
                  </Menu.Item>
                  <Menu.Item
                    key="pdf"
                    onClick={() => handleExport("pdf")}
                    style={{ padding: "8px 16px" }}
                  >
                    Export as PDF
                  </Menu.Item>
                </Menu>
              }
              trigger={["click"]}
              placement="bottomRight"
            >
              <Button
                icon={<FiDownload />}
                style={{
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
                loading={loading}
              >
                Export
                <FiChevronDown />
              </Button>
            </Dropdown>
            <Button
              type="primary"
              icon={<FiPlus />}
              onClick={handleCreate}
              style={{
                borderRadius: "6px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              New Leave Request
            </Button>
          </div>
        </div>

        <SalaryList
          onEdit={handleEdit}
          onView={handleView}
          searchText={searchText}
        />
      </Card>

      {isCreateModalOpen && (
        <CreateSalary
          open={isCreateModalOpen}
          onCancel={() => setIsCreateModalOpen(false)}
        />
      )}

      {isEditModalOpen && selectedSalary && (
        <EditSalary
          open={isEditModalOpen}
          onCancel={() => setIsEditModalOpen(false)}
          initialValues={selectedSalary}
        />
      )}
    </div>
  );
};

export default Salary;
