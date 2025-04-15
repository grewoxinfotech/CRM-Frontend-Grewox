import React, { useMemo } from 'react';
import { Table, Button, Tag, Dropdown, Tooltip, Typography, Avatar, Space, Input, DatePicker } from 'antd';
import { FiEdit2, FiTrash2, FiEye, FiMoreVertical, FiFile, FiDownload, FiUser } from 'react-icons/fi';
import dayjs from 'dayjs';

const { Text } = Typography;
const { RangePicker } = DatePicker;

const TaskList = ({ onEdit, onDelete, onView, searchText = '', filters = {}, tasks = [], users = [] }) => {
    const userMap = useMemo(() => {
        return users.reduce((acc, user) => {
            acc[user.id] = user;
            return acc;
        }, {});
    }, [users]);

    // Define status options
    const statusOptions = [
        { id: 'Pending', name: 'Pending' },
        { id: 'In Progress', name: 'In Progress' },
        { id: 'Completed', name: 'Completed' }
    ];

    // Define priority options
    const priorityOptions = [
        { id: 'Low', name: 'Low' },
        { id: 'Medium', name: 'Medium' },
        { id: 'High', name: 'High' }
        ];

    // Define date options
   
    const filteredTasks = useMemo(() => {
        const tasksArray = Array.isArray(tasks) ? tasks : [];

        return tasksArray.filter(task => {
            const taskName = task?.taskName?.toLowerCase() || '';
            const description = task?.description?.toLowerCase() || '';
            const reporter = userMap[task?.task_reporter]?.username?.toLowerCase() || '';
            const searchLower = searchText.toLowerCase();

            const matchesSearch = !searchText ||
                taskName.includes(searchLower) ||
                description.includes(searchLower) ||
                reporter.includes(searchLower);

            const matchesPriority = !filters.priority ||
                task?.priority === filters.priority;

            const matchesStatus = !filters.status ||
                task?.status === filters.status;

            const matchesDateRange = !filters.dateRange?.length ||
                (dayjs(task?.startDate).isAfter(filters.dateRange[0]) &&
                    dayjs(task?.dueDate).isBefore(filters.dateRange[1]));

            return matchesSearch && matchesPriority && matchesStatus && matchesDateRange;
        });
    }, [tasks, searchText, filters, userMap]);

    const getDropdownItems = (record) => ({
        items: [
            {
                key: 'view',
                icon: <FiEye />,
                label: 'View Details',
                onClick: () => onView?.(record),
            },
            {
                key: 'edit',
                icon: <FiEdit2 />,
                label: 'Edit',
                onClick: () => onEdit?.(record),
            },
            {
                key: 'delete',
                icon: <FiTrash2 />,
                label: 'Delete',
                onClick: () => onDelete?.(record),
                danger: true,
            },
        ],
    });

    const getAssignedUsers = (assignTo) => {
        try {
            if (typeof assignTo === 'string') {
                const parsed = JSON.parse(assignTo);
                return parsed?.assignedusers || [];
            }
            return assignTo?.assignedusers || [];
        } catch (error) {
            return [];
        }
    };

    const columns = [
        {
            title: 'Title',
            dataIndex: 'taskName',
            key: 'taskName',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                  <Input
                    placeholder="Search task title"
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
                record.taskName.toLowerCase().includes(value.toLowerCase()),
            render: (text, record) => (
                <Text strong style={{ cursor: 'pointer' }} onClick={() => onView?.(record)}>
                    {text}
                </Text>
            ),
        },
        {
            title: 'Assigned To',
            dataIndex: 'assignTo',
            key: 'assignTo',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                  <Input
                    placeholder="Search assigned to"
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
                record.assignTo.toLowerCase().includes(value.toLowerCase()),
            render: (assignTo) => {
                const assignedUserIds = getAssignedUsers(assignTo);
                const assignedUsers = assignedUserIds.map(id => userMap[id]).filter(Boolean);

                if (assignedUsers.length === 0) {
                    return (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start' }}>
                            <span style={{ color: '#999' }}>Unassigned</span>
                        </div>
                    );
                }

                if (assignedUsers.length === 1) {
                    const user = assignedUsers[0];
                    return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Avatar
                                src={user.profilePic}
                                style={{
                                    backgroundColor: user.profilePic ? 'transparent' : '#1890ff'
                                }}
                            >
                                {!user.profilePic && (user.username?.[0] || user.email?.[0] || '').toUpperCase()}
                            </Avatar>
                            <span>{user.username || user.email}</span>
                        </div>
                    );
                }

                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Avatar.Group
                            maxCount={3}
                            maxStyle={{
                                color: '#f56a00',
                                backgroundColor: '#fde3cf',
                            }}
                        >
                            {assignedUsers.map((user) => (
                                <Tooltip key={user.id} title={user.username || user.email}>
                                    <Avatar
                                        src={user.profilePic}
                                        style={{
                                            backgroundColor: user.profilePic ? 'transparent' : '#1890ff'
                                        }}
                                    >
                                        {!user.profilePic && (user.username?.[0] || user.email?.[0] || '').toUpperCase()}
                                    </Avatar>
                                </Tooltip>
                            ))}
                        </Avatar.Group>
                    </div>
                );
            },
        },
        {
            title: 'Task Reporter',
            dataIndex: 'task_reporter',
            key: 'task_reporter',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                  <Input
                    placeholder="Search task reporter"
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
                record.task_reporter.toLowerCase().includes(value.toLowerCase()),
            render: (reporterId) => {
                const user = userMap[reporterId];
                if (!user) return <span>-</span>;

                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Avatar
                            src={user.profilePic}
                            style={{
                                backgroundColor: user.profilePic ? 'transparent' : '#1890ff'
                            }}
                        >
                            {!user.profilePic && (user.username?.[0] || user.email?.[0] || '').toUpperCase()}
                        </Avatar>
                        <span>{user.username || user.email}</span>
                    </div>
                );
            },
        },
        {
            title: 'Status',
            dataIndex: 'status',            
            key: 'status',
            filters: statusOptions.map(status => ({
                text: status.name,
                value: status.id
            })),
            onFilter: (value, record) => record.status === value,
            render: (status) => (
                <Tag color={
                    status === 'Completed' ? 'green' :
                        status === 'In Progress' ? 'blue' : 'orange'
                }
                    className={`task-status-tag ${(status || '').toLowerCase().replace(' ', '-')}`}
                >
                    {status || 'Pending'}
                </Tag>
            ),
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
            filters: priorityOptions.map(priority => ({
                text: priority.name,
                value: priority.id
            })),
            onFilter: (value, record) => record.priority === value,
            render: (priority) => (
                <Tag color={
                    priority === 'High' ? 'red' :
                        priority === 'Medium' ? 'orange' : 'green'
                }
                    className={`task-priority-tag ${(priority || '').toLowerCase()}`}
                >
                    {priority || 'Low'}
                </Tag>
            ),
        },
        {
            title: 'Start Date',
            dataIndex: 'startDate',
            key: 'startDate',
            // filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            //     <div style={{ padding: 8 }}>
            //         <RangePicker
            //             value={selectedKeys[0]}
            //             onChange={(dates) => setSelectedKeys(dates ? [dates] : [])}
            //             style={{ width: 250, marginBottom: 8, display: 'block' }}
            //         />
            //         <Space>
            //             <Button
            //                 type="primary"
            //                 onClick={() => confirm()}
            //                 size="small"
            //                 style={{ width: 90 }}
            //             >
            //                 Filter
            //             </Button>
            //             <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
            //                 Reset
            //             </Button>
            //         </Space>
            //     </div>
            // ),
            // onFilter: (value, record) => {
            //     if (!value || !record.startDate) return false;
            //     const startDate = dayjs(record.startDate);
            //     return startDate.isAfter(value[0]) && startDate.isBefore(value[1]);
            // },
            sorter: (a, b) => dayjs(a.startDate).diff(dayjs(b.startDate)),
            render: (date) => (
                <span>{date ? dayjs(date).format('MMM DD, YYYY') : '-'}</span>
            ),
        },
        {
            title: 'Due Date',
            dataIndex: 'dueDate',
            key: 'dueDate',
            sorter: (a, b) => dayjs(a.dueDate).diff(dayjs(b.dueDate)),
            render: (date) => (
                <span>{date ? dayjs(date).format('MMM DD, YYYY') : '-'}</span>
            ),
        },
        {
            title: 'Files',
            dataIndex: 'file',
            key: 'file',
            sorter: (a, b) => a.file.length - b.file.length,
            render: (file) => {
                if (!file) return <span>-</span>;

                // Handle array of files
                const files = Array.isArray(file) ? file : [file];

                return (
                    <div style={{ display: 'flex', gap: '8px' }}>
                        {files.map((fileUrl, index) => {
                            const fileName = fileUrl.split('/').pop();
                            const fileExtension = fileName.split('.').pop().toLowerCase();

                            // Determine if it's an image
                            const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExtension);

                            return (
                                <Tooltip key={index} title={fileName}>
                                    <Button
                                        type="text"
                                        className="file-button"
                                        onClick={() => window.open(fileUrl, '_blank')}
                                        icon={
                                            isImage ? (
                                                <div style={{
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '4px',
                                                    overflow: 'hidden',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    border: '1px solid #d9d9d9'
                                                }}>
                                                    <img
                                                        src={fileUrl}
                                                        alt={fileName}
                                                        style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            objectFit: 'cover'
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <FiFile style={{ fontSize: '16px' }} />
                                            )
                                        }
                                        style={{
                                            padding: 4,
                                            height: 'auto',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    />
                                </Tooltip>
                            );
                        })}
                    </div>
                );
            },
        },
        {
            title: 'Created By',
            dataIndex: 'created_by',
            key: 'created_by',
            sorter: (a, b) => a.created_by.localeCompare(b.created_by),
            render: (createdBy) => <span>{createdBy || '-'}</span>,
        },
        {
            title: 'Action',
            key: 'actions',
            width: 80,
            align: 'center',
            render: (_, record) => (
                <Dropdown
                    menu={getDropdownItems(record)}
                    trigger={['click']}
                    placement="bottomRight"
                    overlayClassName="task-actions-dropdown"
                >
                    <Button
                        type="text"
                        icon={<FiMoreVertical />}
                        className="action-dropdown-button"
                        onClick={(e) => e.preventDefault()}
                    />
                </Dropdown>
            ),
        },
    ];

    return (
        <div className="task-list">
            <Table
                columns={columns}
                dataSource={filteredTasks}
                rowKey="id"
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} items`
                }}
                className="task-table"
            />
        </div>
    );
};

export default TaskList;