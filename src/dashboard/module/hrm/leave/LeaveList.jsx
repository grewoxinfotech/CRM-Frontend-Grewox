import React, { useState, useMemo, useEffect } from "react";
import { Table, Button, Tag, Dropdown, Typography, Modal, message, Input, Space, Checkbox } from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiMoreVertical,
  FiCalendar,
  FiUser,
  FiClock,
  FiCheckCircle,
  FiXCircle,
} from "react-icons/fi";
import dayjs from "dayjs";
import {
  useGetLeaveQuery,
  useDeleteLeaveMutation,
  useUpdateLeaveMutation,
  useApproveLeaveMutation,
} from "./services/leaveApi";
import { useGetEmployeesQuery } from "../Employee/services/employeeApi";
import EditLeave from "./Editleave";

const { Text } = Typography;

const LeaveList = ({ onEdit, onView, searchText = "", filters = {} }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: response = {}, isLoading } = useGetLeaveQuery({
    page: currentPage,
    pageSize,
    search: searchText,
    ...filters
  });

  const { data: leaves = [], pagination = {} } = response;
  const { data: employeesData } = useGetEmployeesQuery();
  const employees = employeesData?.data || [];
  const [deleteLeave] = useDeleteLeaveMutation();
  const [updateLeave] = useUpdateLeaveMutation();
  const [approveLeave] = useApproveLeaveMutation();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [processingLeaveId, setProcessingLeaveId] = useState(null);
  const [processedLeaves, setProcessedLeaves] = useState(new Set());
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  // Create a map of employee IDs to employee names
  const employeeMap = useMemo(() => {
    return employees.reduce((acc, employee) => {
      acc[employee.id] = `${employee.firstName} ${employee.lastName}`;
      return acc;
    }, {});
  }, [employees]);

  const leaveTypes = [
    { id: 'annual', name: 'Annual' },
    { id: 'sick', name: 'Sick' },
    { id: 'casual', name: 'Casual' },
    { id: 'other', name: 'Other' },
  ];

  const statuses = [
    { id: 'approved', name: 'Approved' },
    { id: 'pending', name: 'Pending' },
    { id: 'rejected', name: 'Rejected' },
  ];

  const filteredLeaves = React.useMemo(() => {
    return leaves?.filter((leave) => {
      const searchLower = searchText.toLowerCase();
      const employeeName = employeeMap[leave.employeeId]?.toLowerCase() || "";
      const leaveType = leave?.leaveType?.toLowerCase() || "";
      const status = leave?.status?.toLowerCase() || "";
      const reason = leave?.reason?.toLowerCase() || "";

      const matchesSearch = !searchText ||
        employeeName.includes(searchLower) ||
        leaveType.includes(searchLower) ||
        status.includes(searchLower) ||
        reason.includes(searchLower);

      const matchesDateRange = !filters.dateRange?.length ||
        (dayjs(leave?.startDate).isAfter(filters.dateRange[0]) &&
          dayjs(leave?.endDate).isBefore(filters.dateRange[1]));

      return matchesSearch && matchesDateRange;
    });
  }, [leaves, searchText, employeeMap, filters]);

  // Row selection config
  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys) => {
      setSelectedRowKeys(newSelectedRowKeys);
    }
  };

  const handleBulkDelete = () => {
    Modal.confirm({
      title: "Delete Selected Leave Requests",
      content: `Are you sure you want to delete ${selectedRowKeys.length} selected leave requests?`,
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      bodyStyle: {
        padding: "20px",
      },
      onOk: async () => {
        try {
          await Promise.all(selectedRowKeys.map(id => deleteLeave(id).unwrap()));
          message.success(`${selectedRowKeys.length} leave requests deleted successfully`);
          setSelectedRowKeys([]);
        } catch (error) {
          message.error("Failed to delete some leave requests");
        }
      },
    });
  };

  // Bulk actions component
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

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Delete Leave Request",
      content: "Are you sure you want to delete this leave request?",
      okText: "Yes",
      okType: "danger",
      cancelText: "No",
      bodyStyle: {
        padding: "20px",
      },
      onOk: async () => {
        try {
          await deleteLeave(id).unwrap();
          message.success("Leave request deleted successfully");
        } catch (error) {
          message.error(
            error?.data?.message || "Failed to delete leave request"
          );
        }
      },
    });
  };

  const handleEdit = (record) => {
    setSelectedLeave(record);
    setEditModalVisible(true);
  };

  const handleEditModalClose = () => {
    setEditModalVisible(false);
    setSelectedLeave(null);
  };

  const handleLeaveAction = async (id, status, employeeId) => {
    setProcessingLeaveId(id);
    try {
      await approveLeave({
        id,
        data: {
          status,
          employeeId,
          remarks: status === "approved" ? "Leave approved." : "Leave rejected.",
        },
      }).unwrap();

      setProcessedLeaves((prev) => new Set([...prev, id]));
      message.success(
        `Leave ${status === "approved" ? "approved" : "rejected"} successfully`
      );
    } catch (error) {
      message.error(error?.data?.message || `Failed to ${status} leave`);
    } finally {
      setProcessingLeaveId(null);
    }
  };

  const getDropdownItems = (record) => ({
    items: [
      // {
      //   key: "view",
      //   icon: <FiEye />,
      //   label: "View Details",
      //   onClick: () => onView?.(record),
      // },
      {
        key: "edit",
        icon: <FiEdit2 />,
        label: "Edit",
        onClick: () => handleEdit(record),
      },
      {
        key: "delete",
        icon: <FiTrash2 />,
        label: "Delete",
        onClick: () => handleDelete(record.id),
        danger: true,
      },
    ],
  });

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "success";
      case "pending":
        return "warning";
      case "rejected":
        return "error";
      default:
        return "default";
    }
  };

  // Update columns with modern styling
  const columns = [
    {
      title: "Employee Name",
      dataIndex: "employeeId",
      key: "employeeId",
      width: 200,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search employee name"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
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
            <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
              Reset
            </Button>
          </Space>
        </div>
      ),
      onFilter: (value, record) =>
        record.employeeId.toLowerCase().includes(value.toLowerCase()) ||
        record.company_name?.toLowerCase().includes(value.toLowerCase()),
      render: (employeeId) => (
        <div className="item-wrapper">
          <div className="item-content">
            <div
              className="icon-wrapper"
              style={{
                color: "#7C3AED",
                background: "rgba(124, 58, 237, 0.1)"
              }}
            >
              <FiUser className="item-icon" />
            </div>
            <div className="info-wrapper">
              <div className="name" style={{ color: "#262626", fontWeight: 600 }}>
                {employeeMap[employeeId] || "Unknown Employee"}
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Leave Type",
      dataIndex: "leaveType",
      key: "leaveType",
      width: 200,
      filters: leaveTypes.map(leaveType => ({
        text: leaveType.name,
        value: leaveType.id
      })),
      onFilter: (value, record) => record.leaveType === value,
      render: (leaveType) => (
        <div className="item-wrapper">
          <div className="item-content">
            <div
              className="icon-wrapper"
              style={{
                color: "#059669",
                background: "rgba(5, 150, 105, 0.1)"
              }}
            >
              <FiClock className="item-icon" />
            </div>
            <div className="info-wrapper">
              <div className="name" style={{ color: "#059669", fontWeight: 500 }}>
                {leaveType}
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Duration",
      key: "duration",
      width: 200,
      render: (_, record) => {
        const start = dayjs(record.startDate);
        const end = dayjs(record.endDate);
        const days = end.diff(start, 'day') + 1;
        return (
          <div className="item-wrapper">
            <div className="item-content">
              <div
                className="icon-wrapper"
                style={{
                  color: "#D97706",
                  background: "rgba(217, 119, 6, 0.1)"
                }}
              >
                <FiCalendar className="item-icon" />
              </div>
              <div className="info-wrapper">
                <div className="name" style={{ color: "#D97706", fontWeight: 500 }}>
                  {days} day{days > 1 ? 's' : ''}
                </div>
                <div className="meta">
                  {dayjs(record.startDate).format('DD MMM')} - {dayjs(record.endDate).format('DD MMM YYYY')}
                </div>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 200,
      filters: statuses.map(status => ({
        text: status.name,
        value: status.id
      })),
      onFilter: (value, record) => record.status === value,
      render: (status) => {
        const statusConfig = {
          approved: {
            icon: <FiCheckCircle className="item-icon" />,
            color: "#059669",
            bg: "rgba(5, 150, 105, 0.1)"
          },
          rejected: {
            icon: <FiXCircle className="item-icon" />,
            color: "#DC2626",
            bg: "rgba(220, 38, 38, 0.1)"
          },
          pending: {
            icon: <FiClock className="item-icon" />,
            color: "#D97706",
            bg: "rgba(217, 119, 6, 0.1)"
          }
        };

        const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;

        return (
          <div className="item-wrapper">
            <div className="item-content">
              <div
                className="icon-wrapper"
                style={{
                  color: config.color,
                  background: config.bg
                }}
              >
                {config.icon}
              </div>
              <div className="info-wrapper">
                <div className="name" style={{ color: config.color, fontWeight: 500, textTransform: 'capitalize' }}>
                  {status || 'Pending'}
                </div>
              </div>
            </div>
          </div>
        );
      }
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
      width: 200,
      ellipsis: true,
      sorter: (a, b) => (a?.reason || "").localeCompare(b?.reason || ""),
      render: (reason) => (
        <Text style={{ color: "#595959", fontSize: "13px" }}>{reason}</Text>
      ),
    },
    {
      title: "Approval Actions",
      key: "approvalActions",
      width: 200,
      render: (_, record) => {
        const isProcessing = processingLeaveId === record.id;
        const isStatusFinal = record.status?.toLowerCase() === "approved" || record.status?.toLowerCase() === "rejected";
        const isProcessed = processedLeaves.has(record.id);
        const isDisabled = isProcessing || isStatusFinal || isProcessed;

        return (
          <div style={{ display: "flex", gap: "8px" }}>
            <Button
              type="primary"
              size="small"
              onClick={() =>
                handleLeaveAction(record.id, "approved", record.employeeId)
              }
              disabled={isDisabled}
              loading={isProcessing}
              style={{
                backgroundColor: "#4096ff",
                borderColor: "#4096ff",
                borderRadius: "6px",
                fontWeight: 500
              }}
            >
              Accept
            </Button>
            <Button
              danger
              size="small"
              onClick={() =>
                handleLeaveAction(record.id, "rejected", record.employeeId)
              }
              disabled={isDisabled}
              loading={isProcessing}
              style={{
                borderRadius: "6px",
                fontWeight: 500
              }}
            >
              Reject
            </Button>
          </div>
        );
      },
    },
    {
      title: "Action",
      key: "actions",
      width: 80,
      fixed: "right",
      render: (_, record) => (
        <Dropdown
          menu={getDropdownItems(record)}
          trigger={["click"]}
          placement="bottomRight"
          overlayClassName="leave-actions-dropdown"
        >
          <Button
            type="text"
            icon={
              <FiMoreVertical style={{ fontSize: "18px", color: "#8c8c8c" }} />
            }
            className="action-dropdown-button"
            onClick={(e) => e.preventDefault()}
            style={{
              padding: "4px",
              borderRadius: "4px",
              "&:hover": {
                background: "#f5f5f5",
              },
            }}
          />
        </Dropdown>
      ),
    },
  ];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle table change for pagination
  const handleTableChange = (newPagination, filters, sorter) => {
    if (newPagination.current !== currentPage) {
      setCurrentPage(newPagination.current);
    }
    if (newPagination.pageSize !== pageSize) {
      setPageSize(newPagination.pageSize);
    }
  };

  return (
    <div className="leave-list-container">
      <BulkActions />
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={leaves}
        loading={isLoading}
        rowKey="id"
        onChange={handleTableChange}
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
          pageSizeOptions: ['10', '20', '50', '100'],
          position: ['bottomRight'],
          hideOnSinglePage: false,
          showQuickJumper: true
        }}
        // className="custom-table"
        scroll={{ x: "max-content" ,y:"100%"}}
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)'
        }}
      />
      {editModalVisible && (
        <EditLeave
          visible={editModalVisible}
          onClose={handleEditModalClose}
          leave={selectedLeave}
        />
      )}
    </div>
  );
};

export default LeaveList;
