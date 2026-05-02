import React, { useMemo, useState } from 'react';
import { Table, Button, Tag, Dropdown, Tooltip, Typography, Avatar, Modal } from 'antd';
import { FiEdit2, FiTrash2, FiEye, FiMoreVertical, FiCalendar, FiClock, FiCheckSquare } from 'react-icons/fi';
import dayjs from 'dayjs';

const { Text } = Typography;

const TaskList = ({ onEdit, onDelete, onView, searchText = '', filters = {}, tasks = [], users = [], pagination, onPaginationChange }) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const columns = [
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
                <Dropdown
                    menu={{
                        items: [
                            { key: 'view', icon: <FiEye />, label: 'View', onClick: () => onView(record) },
                            { key: 'edit', icon: <FiEdit2 />, label: 'Edit', onClick: () => onEdit(record) },
                            { key: 'delete', icon: <FiTrash2 />, label: 'Delete', danger: true, onClick: () => onDelete(record.id) }
                        ]
                    }}
                    trigger={['click']}
                    placement="bottomRight"
                >
                    <Button type="text" icon={<FiMoreVertical />} className="action-dropdown-button" />
                </Dropdown>
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