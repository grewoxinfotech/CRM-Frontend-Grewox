import React, { useState, useEffect } from "react";
import {
  Modal,
  message,
  Input,
  Card,
} from "antd";
import {
  FiPlus,
  FiDownload,
  FiSearch,
  FiHome,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import {
  useGetEmployeesQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} from "./services/employeeApi";
import CreateEmployee from "./CreateEmployee";
import EmployeeList from "./EmployeeList";
import EmployeeCard from "./EmployeeCard";
import "./Employee.scss";
import moment from "moment";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../../../../auth/services/authSlice";
import EditEmployee from "./EditEmployee";
import ResetPasswordModal from "../../../../superadmin/module/company/ResetPasswordModal";
import PageHeader from "../../../../components/PageHeader";

const Employee = () => {
  // States
  const [searchText, setSearchText] = useState("");
  const [isCreateFormVisible, setIsCreateFormVisible] = useState(false);
  const [isEditFormVisible, setIsEditFormVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resetPasswordVisible, setResetPasswordVisible] = useState(false);
  const loggedInUser = useSelector(selectCurrentUser);
  
  const [createEmployee, { isLoading: isCreating }] = useCreateEmployeeMutation();
  const [updateEmployee, { isLoading: isUpdating }] = useUpdateEmployeeMutation();
  const [deleteEmployee, { isLoading: isDeleting }] = useDeleteEmployeeMutation();
  const {
    data: employeesData,
    isLoading: isLoadingEmployees,
    refetch,
  } = useGetEmployeesQuery();

  const [viewMode, setViewMode] = useState("table");
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  useEffect(() => {
    if (employeesData?.data) {
      try {
        const filteredData = employeesData.data.filter(
          (employee) =>
            employee?.created_by === loggedInUser?.username ||
            employee?.client_id === loggedInUser?.id
        );

        const transformedData = filteredData.map((employee) => ({
            id: employee.id,
            employeeId: employee.employeeId,
            firstName: employee.firstName || "N/A",
            lastName: employee.lastName || "N/A",
            name: employee.name || `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || "N/A",
            username: employee.username || "N/A",
            email: employee.email || "N/A",
            phone: employee.phone || "N/A",
            department: employee.department || "N/A",
            designation_name: employee.designation_name || "N/A",
            status: employee.status || "inactive",
            key: employee.id
        }));
        setEmployees(transformedData);
        setFilteredEmployees(transformedData);
      } catch (error) {
        console.error("Error processing employees data:", error);
        message.error("Error loading employee data");
      }
    }
  }, [employeesData, loggedInUser]);

  useEffect(() => {
    const filtered = employees.filter(
      (employee) =>
        employee.name?.toLowerCase().includes(searchText.toLowerCase()) ||
        employee.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        employee.department?.toLowerCase().includes(searchText.toLowerCase()) ||
        employee.designation_name?.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredEmployees(filtered);
  }, [employees, searchText]);

  const handleSearch = (value) => {
    setSearchText(value);
  };

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setIsCreateFormVisible(true);
  };

  const handleExport = async (type) => {
    try {
      setLoading(true);
      const data = filteredEmployees.map((employee) => ({
        "Employee Name": employee.name,
        Email: employee.email,
        Phone: employee.phone,
        Department: employee.department,
        Designation: employee.designation,
        Status: employee.status,
      }));

      switch (type) {
        case "csv": exportToCSV(data, "employees_export"); break;
        case "excel": exportToExcel(data, "employees_export"); break;
        case "pdf": exportToPDF(data, "employees_export"); break;
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
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    link.click();
  };

  const exportToExcel = (data, filename) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employees");
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

  const searchContent = (
    <div className="search-popup">
      <Input
        prefix={<FiSearch style={{ color: "#8c8c8c" }} />}
        placeholder="Search employees..."
        allowClear
        onChange={(e) => handleSearch(e.target.value)}
        value={searchText}
        className="search-input"
        autoFocus
      />
    </div>
  );

  return (
    <div className="employee-page standard-page-container">
      <PageHeader
        title="Employees"
        count={filteredEmployees.length}
        subtitle="Manage all employees in the system"
        breadcrumbItems={[
          {
            title: (
              <Link to="/dashboard">
                <FiHome style={{ marginRight: "4px" }} />
                Home
              </Link>
            ),
          },
          { title: "Employees" },
        ]}
        searchText={searchText}
        onSearch={handleSearch}
        searchPlaceholder="Search employees..."
        viewMode={viewMode}
        onViewChange={setViewMode}
        onAdd={handleAddEmployee}
        addText="Add Employee"
        mobileSearchContent={searchContent}
        isSearchVisible={isSearchVisible}
        onSearchVisibleChange={setIsSearchVisible}
        exportMenu={{
          items: [
            { key: 'csv', label: 'Export as CSV', icon: <FiDownload />, onClick: () => handleExport('csv') },
            { key: 'excel', label: 'Export as Excel', icon: <FiDownload />, onClick: () => handleExport('excel') },
            { key: 'pdf', label: 'Export as PDF', icon: <FiDownload />, onClick: () => handleExport('pdf') },
          ]
        }}
      />

      <Card className="standard-content-card">
        {viewMode === "table" ? (
          <EmployeeList
            employees={filteredEmployees}
            loading={isLoadingEmployees}
            onEdit={(emp) => { setSelectedEmployee(emp); setIsEditFormVisible(true); }}
            onDelete={refetch}
          />
        ) : (
          <div className="employee-grid">
            {filteredEmployees.map((employee) => (
              <EmployeeCard
                key={employee.id}
                employee={employee}
                onEdit={(emp) => { setSelectedEmployee(emp); setIsEditFormVisible(true); }}
                onDelete={refetch}
              />
            ))}
          </div>
        )}
      </Card>

      <CreateEmployee
        visible={isCreateFormVisible}
        onCancel={() => setIsCreateFormVisible(false)}
        onSubmit={async (data) => {
          await createEmployee(data).unwrap();
          message.success("Employee created successfully");
          setIsCreateFormVisible(false);
          refetch();
        }}
        loading={isCreating}
      />
      
      <EditEmployee
        visible={isEditFormVisible}
        onCancel={() => setIsEditFormVisible(false)}
        initialValues={selectedEmployee}
        onSuccess={() => {
          setIsEditFormVisible(false);
          refetch();
          message.success("Employee updated successfully");
        }}
      />
      
      <ResetPasswordModal
        visible={resetPasswordVisible}
        onCancel={() => setResetPasswordVisible(false)}
        company={selectedEmployee}
      />
    </div>
  );
};

export default Employee;
