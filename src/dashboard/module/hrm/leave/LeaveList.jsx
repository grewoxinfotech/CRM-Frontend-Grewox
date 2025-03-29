import React, { useState, useMemo } from "react";
import { Table, Button, Tag, Dropdown, Typography, Modal, message } from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiEye,
  FiMoreVertical,
  FiCalendar,
} from "react-icons/fi";
import dayjs from "dayjs";
import {
  useGetLeaveQuery,
  useDeleteLeaveMutation,
  useUpdateLeaveMutation,
} from "./services/LeaveApi";
import { useGetEmployeesQuery } from "../Employee/services/employeeApi";
import EditLeave from "./Editleave";

const { Text } = Typography;

const LeaveList = ({ onEdit, onView, searchText = "" }) => {
  const { data: leavedata = [], isLoading } = useGetLeaveQuery();
  const { data: employeesData } = useGetEmployeesQuery();
  const leaves = leavedata.data || [];
  const employees = employeesData?.data || [];
  const [deleteLeave] = useDeleteLeaveMutation();
  const [updateLeave] = useUpdateLeaveMutation();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [processingLeaveId, setProcessingLeaveId] = useState(null);
  const [processedLeaves, setProcessedLeaves] = useState(new Set());

  // Create a map of employee IDs to employee names
  const employeeMap = useMemo(() => {
    return employees.reduce((acc, employee) => {
      acc[employee.id] = `${employee.firstName} ${employee.lastName}`;
      return acc;
    }, {});
  }, [employees]);

  const filteredLeaves = React.useMemo(() => {
    return leaves?.filter((leave) => {
      const searchLower = searchText.toLowerCase();
      const employeeName = employeeMap[leave.employeeId]?.toLowerCase() || "";
      const leaveType = leave?.leaveType?.toLowerCase() || "";
      const status = leave?.status?.toLowerCase() || "";
      const reason = leave?.reason?.toLowerCase() || "";

      return (
        !searchText ||
        employeeName.includes(searchLower) ||
        leaveType.includes(searchLower) ||
        status.includes(searchLower) ||
        reason.includes(searchLower)
      );
    });
  }, [leaves, searchText, employeeMap]);

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
      await updateLeave({
        id,
        data: {
          status,
          employeeId,
          remarks:
            status === "approved" ? "Leave approved." : "Leave rejected.",
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
      {
        key: "view",
        icon: <FiEye />,
        label: "View Details",
        onClick: () => onView?.(record),
      },
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

  const columns = [
    {
      title: "Employee Name",
      dataIndex: "employeeId",
      key: "employeeId",
      sorter: (a, b) =>
        (employeeMap[a.employeeId] || "").localeCompare(
          employeeMap[b.employeeId] || ""
        ),
      render: (employeeId) => (
        <Text style={{ color: "#262626" }}>
          {employeeMap[employeeId] || "Unknown Employee"}
        </Text>
      ),
    },
    {
      title: "Leave Type",
      dataIndex: "leaveType",
      key: "leaveType",
      sorter: (a, b) => (a?.leaveType || "").localeCompare(b?.leaveType || ""),
      render: (leaveType) => (
        <Tag
          color="blue"
          style={{ borderRadius: "4px", padding: "2px 8px", fontSize: "13px" }}
        >
          {leaveType}
        </Tag>
      ),
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      sorter: (a, b) => dayjs(a.startDate).unix() - dayjs(b.startDate).unix(),
      render: (startDate) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FiCalendar style={{ color: "#1890ff", fontSize: "16px" }} />
          <Text>{dayjs(startDate).format("MMM DD, YYYY")}</Text>
        </div>
      ),
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      key: "endDate",
      sorter: (a, b) => dayjs(a.endDate).unix() - dayjs(b.endDate).unix(),
      render: (endDate) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FiCalendar style={{ color: "#1890ff", fontSize: "16px" }} />
          <Text>{dayjs(endDate).format("MMM DD, YYYY")}</Text>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      sorter: (a, b) => (a?.status || "").localeCompare(b?.status || ""),
      render: (status) => (
        <Tag
          color={getStatusColor(status)}
          style={{ borderRadius: "4px", padding: "2px 8px", fontSize: "13px" }}
        >
          {status}
        </Tag>
      ),
    },
    {
      title: "Reason",
      dataIndex: "reason",
      key: "reason",
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
        const isStatusFinal = ["approved", "rejected"].includes(
          record.status?.toLowerCase()
        );
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
              style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
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
      align: "center",
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

  return (
    <div
      className="leave-list"
      style={{
        background: "#ffffff",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <Table
        columns={columns}
        dataSource={filteredLeaves}
        rowKey="id"
        loading={isLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} items`,
          style: {
            margin: "16px 24px",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          },
        }}
        className="leave-table"
        style={{
          "& .ant-table-thead > tr > th": {
            background: "#fafafa",
            fontWeight: 600,
            color: "#262626",
          },
          "& .ant-table-tbody > tr:hover > td": {
            background: "#f5f5f5",
          },
        }}
      />
      {selectedLeave && (
        <EditLeave
          open={editModalVisible}
          onCancel={handleEditModalClose}
          initialValues={selectedLeave}
        />
      )}
    </div>
  );
};

export default LeaveList;
