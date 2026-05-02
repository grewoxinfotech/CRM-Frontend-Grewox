import React, { useMemo } from "react";
import { Table, Button, Tag, Dropdown, Typography, Modal, message } from "antd";
import {
  FiEdit2,
  FiTrash2,
  FiMoreVertical,
  FiCheckCircle,
  FiXCircle,
  FiClock,
} from "react-icons/fi";
import dayjs from "dayjs";
import {
  useDeleteLeaveMutation,
  useApproveLeaveMutation,
} from "./services/leaveApi";
import { useGetEmployeesQuery } from "../Employee/services/employeeApi";

const { Text } = Typography;

const LeaveList = ({ onEdit, leaves = [], loading, pagination }) => {
  const { data: employeesData } = useGetEmployeesQuery();
  const employees = employeesData?.data || [];
  const [deleteLeave] = useDeleteLeaveMutation();
  const [approveLeave] = useApproveLeaveMutation();

  const employeeMap = useMemo(() => {
    return employees.reduce((acc, employee) => {
      acc[employee.id] = `${employee.firstName} ${employee.lastName}`;
      return acc;
    }, {});
  }, [employees]);

  const handleLeaveAction = async (id, status, employeeId) => {
    try {
      await approveLeave({
        id,
        data: {
          status,
          employeeId,
          remarks: status === "approved" ? "Leave approved." : "Leave rejected.",
        },
      }).unwrap();
      message.success(`Leave ${status} successfully`);
    } catch (error) {
      message.error(`Failed to ${status} leave`);
    }
  };

  const columns = [
    {
      title: "Employee",
      dataIndex: "employeeId",
      key: "employeeId",
      render: (employeeId) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#7c3aed' }}>
                <FiClock size={12} />
            </div>
            <Text strong style={{ color: '#1e293b' }}>{employeeMap[employeeId] || "Unknown"}</Text>
        </div>
      ),
    },
    {
      title: "Type",
      dataIndex: "leaveType",
      key: "leaveType",
      render: (type) => <Tag style={{ borderRadius: '4px', border: 'none' }}>{type?.toUpperCase()}</Tag>
    },
    {
      title: "Duration",
      key: "duration",
      render: (_, record) => {
        const start = dayjs(record.startDate);
        const end = dayjs(record.endDate);
        const days = end.diff(start, 'day') + 1;
        return (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Text strong style={{ fontSize: '13px' }}>{days} Day{days > 1 ? 's' : ''}</Text>
            <Text type="secondary" style={{ fontSize: '11px' }}>{start.format('DD MMM')} - {end.format('DD MMM YYYY')}</Text>
          </div>
        );
      }
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const config = {
          approved: { color: '#059669', icon: <FiCheckCircle size={12} /> },
          rejected: { color: '#dc2626', icon: <FiXCircle size={12} /> },
          pending: { color: '#d97706', icon: <FiClock size={12} /> }
        }[status?.toLowerCase()] || { color: '#d97706', icon: <FiClock size={12} /> };
        
        return <Tag color={status === 'approved' ? 'success' : status === 'rejected' ? 'error' : 'warning'} style={{ borderRadius: '4px', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>{config.icon} {status?.toUpperCase() || 'PENDING'}</Tag>;
      }
    },
    {
      title: "Approval",
      key: "approval",
      render: (_, record) => {
        const isStatusFinal = record.status?.toLowerCase() === "approved" || record.status?.toLowerCase() === "rejected";
        if (isStatusFinal) return <Text type="secondary" style={{ fontSize: '12px' }}>Processed</Text>;
        
        return (
          <div style={{ display: "flex", gap: "6px" }}>
            <Button type="primary" size="small" onClick={() => handleLeaveAction(record.id, "approved", record.employeeId)} style={{ borderRadius: '4px', fontSize: '11px', height: '24px' }}>Accept</Button>
            <Button danger size="small" onClick={() => handleLeaveAction(record.id, "rejected", record.employeeId)} style={{ borderRadius: '4px', fontSize: '11px', height: '24px' }}>Reject</Button>
          </div>
        );
      }
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      fixed: "right",
      render: (_, record) => (
        <Dropdown
          menu={{
            items: [
              { key: "edit", icon: <FiEdit2 />, label: "Edit", onClick: () => onEdit(record) },
              { key: "delete", icon: <FiTrash2 />, label: "Delete", danger: true, onClick: () => {
                Modal.confirm({
                    title: 'Delete Leave Request',
                    content: 'Are you sure?',
                    onOk: async () => {
                        try {
                            await deleteLeave(record.id).unwrap();
                            message.success('Deleted successfully');
                        } catch (error) {
                            message.error('Failed to delete');
                        }
                    }
                });
              }}
            ]
          }}
          trigger={["click"]}
          placement="bottomRight"
        >
          <Button type="text" icon={<FiMoreVertical />} className="action-dropdown-button" />
        </Dropdown>
      ),
    },
  ];

  return (
    <div className="leave-list-container">
      <Table
        columns={columns}
        dataSource={leaves}
        loading={loading}
        rowKey="id"
        size="small"
        className="compact-table"
        pagination={{
            ...pagination,
            showTotal: (total) => `Total ${total} items`
        }}
        scroll={{ x: "max-content" }}
      />
    </div>
  );
};

export default LeaveList;
