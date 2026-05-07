import React, { useMemo, useState } from 'react';
import { Table, Button, Tag, Dropdown, Tooltip, Typography, Avatar, Modal } from 'antd';
import { FiEdit2, FiTrash2, FiEye, FiMoreVertical, FiCalendar, FiClock, FiCheckSquare } from 'react-icons/fi';
import dayjs from 'dayjs';

const { Text } = Typography;

const TaskList = ({ onEdit, onDelete, onView, searchText = '', filters = {}, tasks = [], users = [], pagination, onPaginationChange }) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const columns = [
        {
          title: "Date",
          dataIndex: "createdAt",
          key: "date",
          width: 150,
          render: (date) => {
            const itemDate = dayjs(date);
            const today = dayjs().startOf('day');
            const yesterday = dayjs().subtract(1, 'day').startOf('day');
            const thisWeek = dayjs().subtract(7, 'day').startOf('day');

            let colors = {
              bg: "#fff1f0",
              text: "#cf1322",
              border: "#ffa39e"
            };

            if (itemDate.isSame(today, 'day')) {
              colors = { bg: "#f6ffed", text: "#389e0d", border: "#b7eb8f" };
            } else if (itemDate.isSame(yesterday, 'day')) {
              colors = { bg: "#e6f7ff", text: "#096dd9", border: "#91d5ff" };
            } else if (itemDate.isAfter(thisWeek)) {
              colors = { bg: "#fff7e6", text: "#d46b08", border: "#ffd591" };
            }

            return (
              <Tag
                style={{
                  borderRadius: "6px",
                  padding: "2px 10px",
                  fontSize: "12px",
                  fontWeight: "600",
                  backgroundColor: colors.bg,
                  color: colors.text,
                  border: `1px solid ${colors.border}`,
                  margin: 0,
                  textTransform: 'uppercase'
                }}
              >
                {itemDate.isSame(today, 'day') ? "Today" : 
                 itemDate.isSame(yesterday, 'day') ? "Yesterday" : 
                 itemDate.format("DD MMM YYYY")}
              </Tag>
            );
          }
        },
        {
            title: 'Task Name',
            dataIndex: 'taskName',
            key: 'taskName',
            width: 250,
            render: (text) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FiCheckSquare style={{ color: '#7c3aed' }} />
                    <Text strong style={{ color: '#1e293b' }}>{text}</Text>
                </div>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => {
                let color = 'default';
                if (status === 'pending') color = 'warning';
                if (status === 'in_progress') color = 'processing';
                if (status === 'completed') color = 'success';
                return <Tag color={color} className="status-tag">{status}</Tag>;
            }
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
            width: 120,
            render: (priority) => {
                let color = 'default';
                if (priority === 'high' || priority === 'highest') color = 'error';
                if (priority === 'medium') color = 'warning';
                if (priority === 'low') color = 'success';
                return <Tag color={color} className="status-tag">{priority}</Tag>;
            }
        },
        {
            title: 'Timeline',
            key: 'timeline',
            width: 200,
            render: (_, record) => (
                <div style={{ display: 'flex', flexDirection: 'column', fontSize: '12px' }}>
                    <span><FiCalendar size={10} /> {dayjs(record.startDate).format('DD MMM')} - {dayjs(record.dueDate).format('DD MMM YYYY')}</span>
                </div>
            )
        },
        {
            title: 'Assigned To',
            dataIndex: 'assignTo',
            key: 'assignTo',
            width: 150,
            render: (assignTo) => {
                let assignedIds = [];
                try {
                    const parsed = typeof assignTo === 'string' ? JSON.parse(assignTo) : assignTo;
                    assignedIds = parsed?.assignedusers || [];
                } catch(e) { assignedIds = []; }
                
                const assignedUsers = assignedIds.map(id => users?.find(u => u.id === id)).filter(Boolean);

                return (
                    <Avatar.Group maxCount={3}>
                        {assignedUsers.map(user => (
                            <Tooltip key={user.id} title={user.username}>
                                <Avatar src={user.profilePic} />
                            </Tooltip>
                        ))}
                    </Avatar.Group>
                );
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            fixed: 'right',
            width: 80,
            render: (_, record) => (
                <div onClick={(e) => e.stopPropagation()}>
                    <Dropdown
                        menu={{
                            items: [
                                { 
                                  key: 'view', 
                                  icon: <FiEye style={{ color: "#1890ff" }} />, 
                                  label: <Text style={{ color: "#1890ff", fontWeight: "500" }}>Overview</Text>, 
                                  onClick: () => onView(record) 
                                },
                                { 
                                  key: 'edit', 
                                  icon: <FiEdit2 style={{ color: "#52c41a" }} />, 
                                  label: <Text style={{ color: "#52c41a", fontWeight: "500" }}>Edit Task</Text>, 
                                  onClick: () => onEdit(record) 
                                },
                                { 
                                  key: 'delete', 
                                  icon: <FiTrash2 style={{ color: "#ff4d4f" }} />, 
                                  label: <Text style={{ color: "#ff4d4f", fontWeight: "500" }}>Delete Task</Text>, 
                                  danger: true, 
                                  onClick: () => onDelete(record.id) 
                                }
                            ]
                        }}
                        trigger={['click']}
                        placement="bottomRight"
                    >
                        <Button type="text" icon={<FiMoreVertical />} className="action-dropdown-button" onClick={(e) => e.stopPropagation()} />
                    </Dropdown>
                </div>
            )
        }
    ];

    return (
        <div className="task-list-container">
            <Table
                rowSelection={{
                    selectedRowKeys,
                    onChange: setSelectedRowKeys,
                }}
                columns={columns}
                dataSource={tasks}
                rowKey="id"
                size="small"
                className="compact-table"
                onRow={(record) => ({
                    onClick: () => onView(record),
                    style: { cursor: 'pointer' }
                })}
                pagination={{
                    ...pagination,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} tasks`,
                    onChange: onPaginationChange
                }}
                scroll={{ x: 'max-content' }}
            />
        </div>
    );
};

export default TaskList;