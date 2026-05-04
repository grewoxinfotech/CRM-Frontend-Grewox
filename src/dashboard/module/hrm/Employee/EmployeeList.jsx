import React, { useMemo, useState, useEffect } from "react";
import {
  Table,
  Button,
  Tag,
  Dropdown,
  Menu,
  Avatar,
  message,
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
  FiLock,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAdminLoginMutation } from "../../../../auth/services/authApi";
import { useDeleteEmployeeMutation } from "./services/employeeApi";
import ResetPasswordModal from "../../../../superadmin/module/company/ResetPasswordModal";
import { useSelector } from 'react-redux';
import { selectCurrentUser } from "../../../../auth/services/authSlice";

const EmployeeList = ({ employees, onEdit, onDelete, loading }) => {
  const navigate = useNavigate();
  const [adminLogin] = useAdminLoginMutation();
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [deleteEmployee] = useDeleteEmployeeMutation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [resetPasswordModalVisible, setResetPasswordModalVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const currentUser = useSelector(selectCurrentUser);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Delete Employee",
      content: "Are you sure you want to delete this employee?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      onOk: async () => {
        try {
          await deleteEmployee(id).unwrap();
          message.success("Employee deleted successfully");
          onDelete();
        } catch (error) {
          message.error(error?.data?.message || "Failed to delete employee");
        }
      },
    });
  };

  const getActionMenuItems = (record) => [
    {
      key: "edit",
      label: "Edit Employee",
      icon: <FiEdit2 style={{color: '#52c41a'}}/>,
      onClick: () => onEdit(record)
    },
    {
      key: "login",
      label: "Login as Employee",
      icon: <FiLogIn style={{color: '#1890ff'}}/>,
      onClick: () => handleEmployeeLogin(record)
    },
    {
      key: "reset-password",
      label: "Reset Password",
      icon: <FiLock style={{color: '#faad14'}}/>,
      onClick: () => { setSelectedEmployee(record); setResetPasswordModalVisible(true); }
    },
    {
      key: "delete",
      label: "Delete Employee",
      icon: <FiTrash2 style={{color: '#ff4d4f'}}/>,
      danger: true,
      onClick: () => handleDelete(record.id)
    }
  ];

  const columns = [
    {
      title: "Employee",
      key: "employee",
      width: 250,
      render: (_, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Avatar
            size={32}
            src={record.profilePic}
            icon={!record.profilePic && <FiUser />}
            style={{ backgroundColor: !record.profilePic ? "#1890ff" : "transparent" }}
          />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ fontWeight: 600, color: "#1e293b", fontSize: "14px" }}>{record.name}</span>
            <span style={{ color: "#64748b", fontSize: "12px" }}>{record.email}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
      render: (dept) => (
        <Tag color="blue" style={{ borderRadius: '4px', border: 'none', fontWeight: '500' }}>
            <FiGrid style={{ marginRight: '4px' }} /> {dept || 'N/A'}
        </Tag>
      )
    },
    {
      title: "Designation",
      dataIndex: "designation_name",
      key: "designation",
      render: (des) => (
        <Tag color="purple" style={{ borderRadius: '4px', border: 'none', fontWeight: '500' }}>
            <FiAward style={{ marginRight: '4px' }} /> {des || 'N/A'}
        </Tag>
      )
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === 'active' ? 'success' : 'error'} className="status-tag">
          {status}
        </Tag>
      )
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 80,
      render: (_, record) => (
        <Dropdown menu={{ items: getActionMenuItems(record) }} trigger={["click"]} placement="bottomRight">
          <Button type="text" icon={<FiMoreVertical />} className="action-dropdown-button" />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="employee-list-container">
      <Table
        columns={columns}
        dataSource={employees}
        rowKey="id"
        size="small"
        loading={loading}
        pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} employees`,
        }}
        className="compact-table"
        scroll={{ x: 'max-content' }}
      />

      <ResetPasswordModal
        visible={resetPasswordModalVisible}
        onCancel={() => setResetPasswordModalVisible(false)}
        company={selectedEmployee}
        currentUserEmail={currentUser?.email}
      />
    </div>
  );
};

export default EmployeeList;