import React, { useMemo, useState, useEffect } from "react";
import {
  Table,
  Button,
  Tag,
  Dropdown,
  Menu,
  Avatar,
  message,
  Input,
  Space,
  Switch,
  Modal,
} from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiMoreVertical,
  FiUserCheck,
  FiUser,
  FiEye,
  FiBriefcase,
  FiLogIn,
  FiGitBranch,
  FiGrid,
  FiAward,
} from "react-icons/fi";
import moment from "moment";
import { useGetAllBranchesQuery } from "../Branch/services/branchApi";
import { useGetEmployeesQuery } from "./services/employeeApi";
import { useGetAllDepartmentsQuery } from "../Department/services/departmentApi";
import { useGetAllDesignationsQuery } from "../Designation/services/designationApi";
import { useNavigate } from "react-router-dom";
import { useAdminLoginMutation } from "../../../../auth/services/authApi";
import {
  useGetSalaryQuery,
  useUpdateSalaryMutation,
} from "../payRoll/services/salaryApi";
import { useDeleteEmployeeMutation } from "./services/employeeApi";

// Define styles outside the component
const switchStyles = `
  .status-switch.ant-switch {
    min-width: 40px;
    height: 22px;
    background: #faad14;
    padding: 0 2px;
  }

  .status-switch.ant-switch .ant-switch-handle {
    width: 18px;
    height: 18px;
    top: 2px;
    left: 2px;
    transition: all 0.2s ease-in-out;
  }

  .status-switch.ant-switch.ant-switch-checked .ant-switch-handle {
    left: calc(100% - 20px);
  }

  .status-switch.ant-switch.paid {
    background: #52c41a;
  }

  .status-switch.ant-switch:not(.ant-switch-disabled) {
    background-color: #faad14;
  }

  .status-switch.ant-switch.paid:not(.ant-switch-disabled) {
    background: #52c41a;
  }

  .status-switch.ant-switch:focus {
    box-shadow: none;
  }

  .status-switch.ant-switch .ant-switch-handle::before {
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
`;

const EmployeeList = ({ employees, onEdit, onDelete, onView }) => {
  const navigate = useNavigate();
  const [adminLogin] = useAdminLoginMutation();
  const [loading, setLoading] = useState(false);
  const [updateSalary] = useUpdateSalaryMutation();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [deleteEmployee] = useDeleteEmployeeMutation();
  const [isMobile, setIsMobile] = useState(false);
  const [salaryUpdateLoading, setSalaryUpdateLoading] = useState({});

  // Add branch data fetch
  const { data: branchesData } = useGetAllBranchesQuery({
    page: 1,
    pageSize: -1,
    search: ''
  });
  const { data: departmentsData } = useGetAllDepartmentsQuery({
    page: 1,
    pageSize: -1,
    search: ''
  });
  const { data: designationsData } = useGetAllDesignationsQuery({
    page: 1,
    pageSize: -1,
    search: ''
  });
  const { data: salaryData, refetch: refetchSalary } = useGetSalaryQuery({
    page: 1,
    pageSize: -1,
    search: ''
  }, {
    refetchOnMountOrArgChange: true
  });

  // console.log(salaryData, 'salaryData');

  // Helper functions to find names using find method
  const getBranchName = (branchId) => {
    const branch = branchesData?.data?.find((b) => b.id === branchId);
    return branch ? branch.branchName : "N/A";
  };

  const getDepartmentName = (departmentId) => {
    if (!departmentsData?.data) return "N/A";
    const department = departmentsData.data.find((d) => d.id === departmentId);
    return department ? department.department_name : "N/A";
  };

  const getDesignationName = (designationId) => {
    if (!designationsData?.data) return "N/A";
    const designation = designationsData.data.find((d) => d.id === designationId);
    return designation ? designation.designation_name : "N/A";
  };

  // Add designation style configuration
  const getDesignationStyle = (designationName) => {
    const baseStyles = {
      "senior software engineer": {
        color: "#1890FF",
        bg: "#E6F7FF",
        border: "#91D5FF",
        icon: <FiCode />
      },
      "software engineer": {
        color: "#52C41A",
        bg: "#F6FFED",
        border: "#B7EB8F",
        icon: <FiTerminal />
      },
      "ui designer": {
        color: "#722ED1",
        bg: "#F9F0FF",
        border: "#D3ADF7",
        icon: <FiLayout />
      },
      "project manager": {
        color: "#FA8C16",
        bg: "#FFF7E6",
        border: "#FFD591",
        icon: <FiBriefcase />
      },
      default: {
        color: "#8C8C8C",
        bg: "#FAFAFA",
        border: "#D9D9D9",
        icon: <FiBriefcase />
      }
    };

    const normalizedDesignation = designationName?.toLowerCase()?.trim() || 'default';
    return baseStyles[normalizedDesignation] || baseStyles.default;
  };

  const getInitials = (username) => {
    return username
      ? username
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
      : "U";
  };

  const handleEmployeeLogin = async (employee) => {
    try {
      const response = await adminLogin({
        email: employee.email,
        isClientPage: true,
      }).unwrap();

      if (response.success) {
        message.success("Logged in as employee successfully");
        navigate("/dashboard");
      }
    } catch (error) {
      message.error(error?.data?.message || "Failed to login as employee");
    }
  };

  const handleSalaryStatusChange = async (checked, salaryId, employeeId) => {
    if (!salaryId) {
      message.error('No salary record found for this employee');
      return;
    }

    try {
      setSalaryUpdateLoading((prev) => ({ ...prev, [employeeId]: true }));

      const response = await updateSalary({
        id: salaryId,
        data: {
          status: checked ? "paid" : "unpaid",
          payment_date: checked ? new Date().toISOString() : null,
          employeeId: employeeId
        }
      }).unwrap();

      if (response.success) {
        message.success(`Payment status updated to ${checked ? "paid" : "unpaid"}`);
        refetchSalary(); // Refresh salary data after update
      }
    } catch (error) {
      console.error("Error updating payment status:", error);
      message.error(error?.data?.message || "Failed to update payment status");
    } finally {
      setSalaryUpdateLoading((prev) => ({ ...prev, [employeeId]: false }));
    }
  };

  const getEmployeeSalary = (employeeId) => {
    if (!salaryData?.data) return null;

    // console.log(salaryData, 'salaryData');
  

    const foundSalary = salaryData.data.find(salary => salary.employeeId === employeeId);

    // console.log(foundSalary, 'foundSalary');

    if (!foundSalary) return null;

    return {
      id: foundSalary.id,
      salary: foundSalary.salary || 0,
      status: foundSalary.status || 'unpaid',
      payment_date: foundSalary.paymentDate,
      employeeId: foundSalary.employeeId
    };
  };

  const getActionMenu = (record) => (
    <Menu className="action-menu">
      <Menu.Item key="edit" icon={<FiEdit2 />} onClick={() => onEdit(record)}>
        Edit Employee
      </Menu.Item>
      <Menu.Item
        key="login"
        icon={<FiLogIn />}
        onClick={() => handleEmployeeLogin(record)}
      >
        Login as Employee
      </Menu.Item>
      <Menu.Item
        key="status"
        icon={<FiUserCheck />}
        onClick={() => console.log("Change status")}
      >
        Change Status
      </Menu.Item>
      <Menu.Item
        key="delete"
        icon={<FiTrash2 />}
        danger
        onClick={() => handleDelete(record.id)}
      >
        Delete Employee
      </Menu.Item>
    </Menu>
  );

  const getItemStyle = (type) => {
    const styles = {
      branch: {
        color: "#2563EB",
        icon: <FiGitBranch className="item-icon" />,
      },
      department: {
        color: "#7C3AED",
        icon: <FiGrid className="item-icon" />,
      },
      designation: {
        color: "#EA580C",
        icon: <FiAward className="item-icon" />,
      },
    };
    return styles[type];
  };

  const salaryColumn = {
    title: 'Salary Status',
    key: 'salaryStatus',
    width: 230,
    render: (_, record) => {
      const employeeId = record.id;
      const salaryInfo = getEmployeeSalary(employeeId);
      const isLoading = salaryUpdateLoading[employeeId] || false;

      return (
        <div className="salary-status" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {salaryInfo ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', minWidth: '120px' }}>
                <span style={{ color: '#52c41a', fontSize: '14px' }}>₹</span>
                <span style={{ fontWeight: 500, color: '#262626' }}>
                  {Number(salaryInfo.salary).toLocaleString('en-IN', {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2
                  })}
                </span>
                <span style={{ color: '#8c8c8c', fontSize: '13px', marginLeft: '2px' }}>INR</span>
              </div>
              <Switch
                size="small"
                checked={salaryInfo.status === 'paid'}
                onChange={(checked) => handleSalaryStatusChange(checked, salaryInfo.id, employeeId)}
                loading={isLoading}
                className={`status-switch ${salaryInfo.status === 'paid' ? 'paid' : ''}`}
                style={{ minWidth: '44px' }}
              />
              <Tag
                color={salaryInfo.status === 'paid' ? 'success' : 'warning'}
                style={{
                  margin: 0,
                  textTransform: 'capitalize',
                  borderRadius: '12px',
                  fontSize: '12px',
                  padding: '0 8px',
                  height: '22px',
                  display: 'flex',
                  alignItems: 'center',
                  minWidth: '60px',
                  justifyContent: 'center',
                  background: salaryInfo.status === 'paid' ? '#f6ffed' : '#fff7e6',
                  color: salaryInfo.status === 'paid' ? '#52c41a' : '#faad14',
                  border: `1px solid ${salaryInfo.status === 'paid' ? '#b7eb8f' : '#ffd591'}`
                }}
              >
                {salaryInfo.status}
              </Tag>
            </>
          ) : (
            <Tag
              color="default"
              style={{
                margin: 0,
                borderRadius: '12px',
                fontSize: '12px',
                padding: '0 12px',
                height: '22px',
                display: 'flex',
                alignItems: 'center',
                background: '#fafafa',
                border: '1px solid #d9d9d9',
                color: '#8c8c8c',
                width: '100%',
                justifyContent: 'center'
              }}
            >
              No Salary Record
            </Tag>
          )}
        </div>
      );
    }
  };

  const columns = [
    {
      title: "Employee",
      key: "employee",
      width: 200,
      fixed: "left",
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", width: '100%' }}>
          <Avatar
            size={36}
            src={record.profilePic}
            icon={!record.profilePic && <FiUser />}
            style={{
              backgroundColor: !record.profilePic ? "#1890ff" : "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0
            }}
          >
            {!record.profilePic && getInitials(record.name)}
          </Avatar>
          <div style={{
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            flex: 1
          }}>
            <div style={{
              fontWeight: 600,
              color: "#262626",
              fontSize: "14px",
              marginBottom: "2px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}>
              {record.name}
            </div>
            <div style={{
              color: "#8c8c8c",
              fontSize: "13px",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}>
              {record.email}
            </div>
          </div>
        </div>
      ),
      filterDropdown: ({
        setSelectedKeys,
        selectedKeys,
        confirm,
        clearFilters,
      }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search name or email"
            value={selectedKeys[0]}
            onChange={(e) =>
              setSelectedKeys(e.target.value ? [e.target.value] : [])
            }
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: "block" }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              size="small"
              style={{ width: 90 }}
            >
              Filter
            </Button>
            <Button
              onClick={() => clearFilters()}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) =>
        record.name.toLowerCase().includes(value.toLowerCase()) ||
        record.email?.toLowerCase().includes(value.toLowerCase()),
    },
    {
      title: "Branch",
      dataIndex: "branch",
      key: "branch",
      width: 150,
      render: (branchId) => {
        const branchName = getBranchName(branchId);
        return (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#2563EB',
            fontSize: '14px',
            width: '100%',
            overflow: 'hidden'
          }}>
            <FiGitBranch size={14} style={{ flexShrink: 0, color: '#2563EB' }} />
            <span style={{
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {branchName}
            </span>
          </div>
        );
      },
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      width: 150,
      render: (departmentId) => {
        const departmentName = getDepartmentName(departmentId);
        return (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#7C3AED',
            fontSize: '14px',
            width: '100%',
            overflow: 'hidden'
          }}>
            <FiGrid size={14} style={{ flexShrink: 0, color: '#7C3AED' }} />
            <span style={{
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {departmentName}
            </span>
          </div>
        );
      },
    },
    {
      title: "Designation",
      dataIndex: "designation",
      key: "designation",
      width: 180,
      render: (designationId) => {
        const designationName = getDesignationName(designationId);
        return (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            color: '#EA580C',
            fontSize: '14px',
            width: '100%',
            overflow: 'hidden'
          }}>
            <FiAward size={14} style={{ flexShrink: 0, color: '#EA580C' }} />
            <span style={{
              fontWeight: 600,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {designationName}
            </span>
          </div>
        );
      },
    },
    salaryColumn,
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 120,
      render: (_, record) => (
        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-start" }}>
          <Button
            type="primary"
            icon={<FiLogIn size={14} />}
            onClick={() => handleEmployeeLogin(record)}
            className="login-button"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              height: "32px",
              padding: "0 12px",
              borderRadius: "6px",
              fontWeight: 500,
              background: "linear-gradient(135deg, #4096ff 0%, #1677ff 100%)",
              border: "none",
              transition: "all 0.3s ease",
              boxShadow: "0 2px 4px rgba(24, 144, 255, 0.2)",
              fontSize: "13px",
            }}
          >
            Login
          </Button>
          <Dropdown
            overlay={getActionMenu(record)}
            trigger={["click"]}
            placement="bottomRight"
            overlayClassName="user-actions-dropdown"
          >
            <Button
              type="text"
              icon={<FiMoreVertical size={16} />}
              className="action-button"
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
        </div>
      ),
    },
  ];

  // Transform the employees data without role names
  const transformedEmployees = useMemo(() => {
    if (!employees) return [];
    return employees.map((emp) => ({
      ...emp,
      key: emp.id,
      employeeId: emp.employeeId || emp.id,
      name: emp.name || `${emp.firstName || ""} ${emp.lastName || ""}`.trim(),
      branchName: getBranchName(emp.branch),
      departmentName: getDepartmentName(emp.department),
      designationName: getDesignationName(emp.designation),
    }));
  }, [employees, branchesData, departmentsData, designationsData]);

  useEffect(() => {
    // Add styles to head
    const styleElement = document.createElement("style");
    styleElement.innerHTML = `
      .status-switch.ant-switch {
        min-width: 44px;
        height: 22px;
        background: #faad14;
        padding: 0 2px;
      }

      .status-switch.ant-switch .ant-switch-handle {
        width: 18px;
        height: 18px;
        top: 2px;
        left: 2px;
        transition: all 0.2s ease-in-out;
      }

      .status-switch.ant-switch.ant-switch-checked .ant-switch-handle {
        left: calc(100% - 20px);
      }

      .status-switch.ant-switch.paid {
        background: #52c41a;
      }

      .status-switch.ant-switch:not(.ant-switch-disabled) {
        background-color: #faad14;
      }

      .status-switch.ant-switch.paid:not(.ant-switch-disabled) {
        background: #52c41a;
      }

      .status-switch.ant-switch:focus {
        box-shadow: none;
      }

      .status-switch.ant-switch .ant-switch-handle::before {
        background-color: #fff;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
    `;
    document.head.appendChild(styleElement);

    return () => {
      // Cleanup styles on unmount
      document.head.removeChild(styleElement);
    };
  }, []);

  const handleDelete = async (recordOrIds) => {
    const isMultiple = Array.isArray(recordOrIds);
    const title = isMultiple ? 'Delete Selected Employees' : 'Delete Employee';
    const content = isMultiple
      ? `Are you sure you want to delete ${recordOrIds.length} selected employees?`
      : 'Are you sure you want to delete this employee?';

    Modal.confirm({
      title,
      content,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      bodyStyle: { padding: "20px" },
      onOk: async () => {
        try {
          if (isMultiple) {
            await Promise.all(recordOrIds.map(id => deleteEmployee(id).unwrap()));
            message.success(`${recordOrIds.length} employees deleted successfully`);
            setSelectedRowKeys([]);
          } else {
            await deleteEmployee(recordOrIds).unwrap();
            message.success('Employee deleted successfully');
          }
        } catch (error) {
          message.error(error?.data?.message || 'Failed to delete employee(s)');
        }
      },
    });
  };

  const BulkActions = () => (
    <div className={`bulk-actions ${selectedRowKeys.length > 0 ? 'active' : ''}`}>
      {selectedRowKeys.length > 0 && (
        <Button
          type="primary"
          danger
          icon={<FiTrash2 />}
          onClick={() => handleDelete(selectedRowKeys)}
        >
          Delete Selected ({selectedRowKeys.length})
        </Button>
      )}
    </div>
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const paginationConfig = {
    pageSize: 10,
    showSizeChanger: true,
    showTotal: (total) => `Total ${total} items`,
    pageSizeOptions: ['10', '20', '50', '100'],
    locale: {
      items_per_page: isMobile ? '' : '/ page', // Hide '/ page' on mobile/tablet
    },
  };

  return (
    <>
      <div className="employee-list-container">
        <BulkActions />
        <Table
          rowSelection={{
            type: 'checkbox',
            selectedRowKeys,
            onChange: (newSelectedRowKeys) => {
              setSelectedRowKeys(newSelectedRowKeys);
            },
          }}
          columns={columns}
          dataSource={transformedEmployees}
          rowKey="id"
          pagination={paginationConfig}
          className="custom-table"
          scroll={{ x: 1200, y: 'calc(100vh - 350px)' }}
          style={{
            width: "100%",
            minWidth: 0,
            background: "#ffffff",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
          }}
        />
      </div>
    </>
  );
};

export default EmployeeList;