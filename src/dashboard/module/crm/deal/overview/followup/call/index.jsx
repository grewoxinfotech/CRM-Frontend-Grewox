import React, { useState } from "react";
import {
  Table,
  Tag,
  Space,
  Button,
  Avatar,
  Tooltip,
  Dropdown,
  Modal,
  message,
} from "antd";
import {
  FiCheckSquare,
  FiCalendar,
  FiEdit2,
  FiTrash2,
  FiMoreVertical,
  FiPhone,
} from "react-icons/fi";
import dayjs from "dayjs";
import "./followupcall.scss";
import {
  useGetFollowupCallsQuery,
  useDeleteFollowupCallMutation,
} from "./services/followupCallApi";
import EditFollowupCall from "./EditfollowupCall";
import EditFollowupLog from "./EditfollowupLog";

const FollowupCallList = ({ dealId, users }) => {
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editLogModalVisible, setEditLogModalVisible] = useState(false);
  const [selectedCallId, setSelectedCallId] = useState(null);
  const [selectedCallData, setSelectedCallData] = useState(null);

  const { data: followupCall, isLoading: followupCallLoading } =
    useGetFollowupCallsQuery(dealId);

  const [deleteFollowupCall] = useDeleteFollowupCallMutation();

  const handleEdit = (callId) => {
    const call = followupCall?.data?.find((c) => c.id === callId);
    setSelectedCallId(callId);
    setSelectedCallData(call);

    if (call?.call_type === "scheduled") {
      setEditModalVisible(true);
    } else if (call?.call_type === "log") {
      setEditLogModalVisible(true);
    }
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: "Delete Confirmation",
      content: "Are you sure you want to delete this call?",
      okType: "danger",
      bodyStyle: { padding: "20px" },
      cancelText: "No",
      onOk: async () => {
        try {
          await deleteFollowupCall(id).unwrap();
          message.success("Call deleted successfully");
        } catch (error) {
          message.error(error?.data?.message || "Failed to delete call");
        }
      },
    });
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      not_started: { color: "default", text: "Not Started" },
      in_progress: { color: "processing", text: "In Progress" },
      completed: { color: "success", text: "Completed" },
      cancelled: { color: "error", text: "Cancelled" },
      no_answer: { color: "warning", text: "No Answer" },
      busy: { color: "orange", text: "Busy" },
      wrong_number: { color: "red", text: "Wrong Number" },
      voicemail: { color: "purple", text: "Voicemail" },
    };

    const config = statusConfig[status] || statusConfig.not_started;
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: "Subject",
      dataIndex: "subject",
      key: "subject",
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <FiPhone style={{ color: "#1890ff" }} />
          <span>{text || "-"}</span>
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "call_status",
      key: "call_status",
      width: 100,
      render: (status) => getStatusTag(status),
    },
    {
      title: "Date & Time",
      key: "datetime",
      width: 150,
      render: (_, record) => {
        try {
          if (!record.call_start_date || !record.call_start_time) return "-";

          const dateTime = dayjs(
            `${record.call_start_date} ${record.call_start_time}`
          );

          return (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <FiCalendar style={{ color: "#1890ff" }} />
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span>{dateTime.format("DD MMM YYYY")}</span>
                <span style={{ fontSize: "12px", color: "#6B7280" }}>
                  {dateTime.format("hh:mm A")}
                </span>
              </div>
            </div>
          );
        } catch (error) {
          console.error("Error formatting date time:", error);
          return "-";
        }
      },
    },
    {
      title: "Purpose",
      dataIndex: "call_purpose",
      key: "call_purpose",
      width: 150,
      render: (purpose) => purpose || "-",
    },
    {
      title: "Assigned To",
      dataIndex: "assigned_to",
      key: "assigned_to",
      width: 150,
      render: (assignedTo) => {
        try {
          if (!assignedTo) return "-";
          const parsedAssignees =
            typeof assignedTo === "string"
              ? JSON.parse(assignedTo)
              : assignedTo;

          if (!parsedAssignees?.assigned_to?.length) return "-";

          return (
            <Avatar.Group
              maxCount={2}
              maxStyle={{ color: "#f56a00", backgroundColor: "#fde3cf" }}
            >
              {parsedAssignees.assigned_to.map((userId) => {
                const user = users?.find((u) => u.id === userId);
                return (
                  <Tooltip title={user?.username} key={userId}>
                    <Avatar
                      style={{
                        backgroundColor: user?.color || "#1890ff",
                      }}
                    >
                      {user?.username?.[0]?.toUpperCase() || "?"}
                    </Avatar>
                  </Tooltip>
                );
              })}
            </Avatar.Group>
          );
        } catch (e) {
          console.error("Error parsing assignedTo:", e);
          return "-";
        }
      },
    },
    {
      title: "Reminder",
      dataIndex: "call_reminder",
      key: "call_reminder",
      width: 100,
      render: (reminder) => {
        const reminderMap = {
          "5_min": "5 minutes before",
          "10_min": "10 minutes before",
          "15_min": "15 minutes before",
          "30_min": "30 minutes before",
          "1_hour": "1 hour before",
        };
        return reminderMap[reminder] || "-";
      },
    },
    {
      title: "Notes",
      dataIndex: "call_notes",
      key: "call_notes",
      width: 100,
      render: (notes) => notes || "-",
      ellipsis: true,
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      width: 100,
      render: (priority) => {
        const priorityMap = {
          highest: "High",
          high: "Medium",
          medium: "Low",
          low: "Lowest",
        };
        return priorityMap[priority] || "-";
      },
    },
    {
      title: "Call Type",
      dataIndex: "call_type",
      key: "call_type",
      width: 120,
      render: (callType) => {
        if (!callType) return "-";
        return callType;
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Dropdown
            menu={{
              items: [
                {
                  key: "edit",
                  label: "Edit",
                  icon: <FiEdit2 />,
                  onClick: () => handleEdit(record.id),
                },
                {
                  key: "delete",
                  label: "Delete",
                  icon: <FiTrash2 style={{ color: "#ff4d4f" }} />,
                  danger: true,
                  onClick: () => handleDelete(record.id),
                },
              ],
            }}
            trigger={["click"]}
          >
            <Button
              type="text"
              icon={<FiMoreVertical />}
              className="action-btn"
            />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Table
        dataSource={followupCall?.data || []}
        columns={columns}
        rowKey="id"
        loading={followupCallLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} calls`,
        }}
        scroll={{ x: 'max-content', y: '100%' }}
        // className="followup-table"
      />
      {editModalVisible && (
        <EditFollowupCall
          open={editModalVisible}
          onCancel={() => {
            setEditModalVisible(false);
            setSelectedCallId(null);
          }}
          callId={selectedCallId}
          callData={selectedCallData}
          dealId={dealId}
          onSubmit={() => {
            setEditModalVisible(false);
            setSelectedCallId(null);
          }}
        />
      )}
      {editLogModalVisible && (
        <EditFollowupLog
          open={editLogModalVisible}
          onCancel={() => {
            setEditLogModalVisible(false);
            setSelectedCallId(null);
          }}
          callId={selectedCallId}
          callData={selectedCallData}
          dealId={dealId}
          onSubmit={() => {
            setEditLogModalVisible(false);
            setSelectedCallId(null);
          }}
        />
      )}
    </>
  );
};

export default FollowupCallList;
