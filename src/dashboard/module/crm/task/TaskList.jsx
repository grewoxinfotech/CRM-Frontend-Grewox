import React, { useMemo } from 'react';
import { Table, Space, Button, Tooltip, Tag, Dropdown } from 'antd';
import { FiEdit2, FiTrash2, FiEye, FiMoreVertical } from 'react-icons/fi';
import dayjs from 'dayjs';

const TaskList = ({ onEdit, onDelete, onView, searchText = '', filters = {} }) => {
    // Mock data for tasks
    const mockTasks = [
        {
            id: 1,
            taskName: 'Website Redesign',
            category: 'Design',
            task_reporter: 'Jane Smith',
            startDate: '2024-03-20',
            dueDate: '2024-03-25',
            priority: 'High',
            status: 'In Progress',
            assignedTo: 'John Doe',
            description: 'Redesign the company website with new brand guidelines'
        },
        {
            id: 2,
            taskName: 'Client Meeting',
            category: 'Sales',
            task_reporter: 'John Doe',
            startDate: '2024-03-21',
            dueDate: '2024-03-23',
            priority: 'Medium',
            status: 'Todo',
            assignedTo: 'Sarah Smith',
            description: 'Quarterly review meeting with major client'
        },
        {
            id: 3,
            taskName: 'Bug Fixes',
            category: 'Development',
            task_reporter: 'Mike Johnson',
            startDate: '2024-03-22',
            dueDate: '2024-03-24',
            priority: 'High',
            status: 'In Progress',
            assignedTo: 'Sarah Smith',
            description: 'Fix reported bugs in the mobile app'
        },
        {
            id: 4,
            taskName: 'Content Update',
            category: 'Marketing',
            task_reporter: 'Emily Brown',
            startDate: '2024-03-26',
            dueDate: '2024-03-28',
            priority: 'Low',
            status: 'Completed',
            assignedTo: 'Emily Brown',
            description: 'Update blog content and social media posts'
        },
        {
            id: 5,
            taskName: 'Database Optimization',
            category: 'Development',
            task_reporter: 'David Wilson',
            startDate: '2024-03-27',
            dueDate: '2024-03-29',
            priority: 'Medium',
            status: 'Todo',
            assignedTo: 'Sarah Smith',
            description: 'Optimize database queries for better performance'
        }
    ];

    // Filter and search functionality
    const filteredTasks = useMemo(() => {
        return mockTasks.filter(task => {
            const matchesSearch = !searchText || 
                task.taskName.toLowerCase().includes(searchText.toLowerCase()) ||
                task.description.toLowerCase().includes(searchText.toLowerCase()) ||
                task.assignedTo.toLowerCase().includes(searchText.toLowerCase());

            const matchesPriority = !filters.priority || 
                task.priority === filters.priority;

            const matchesStatus = !filters.status || 
                task.status === filters.status;

            const matchesDateRange = !filters.dateRange?.length ||
                (dayjs(task.dueDate).isAfter(filters.dateRange[0]) &&
                dayjs(task.dueDate).isBefore(filters.dateRange[1]));

            return matchesSearch && matchesPriority && matchesStatus && matchesDateRange;
        });
    }, [mockTasks, searchText, filters]);

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

    const columns = [
        {
            title: 'Task Name',
            dataIndex: 'taskName',
            key: 'taskName',
            sorter: (a, b) => (a.taskName || '').localeCompare(b.taskName || ''),
        },
        
        {
            title: 'Category',
            dataIndex: 'category',
            key: 'category',
            sorter: (a, b) => (a.category || '').localeCompare(b.category || ''),
        },
        {
            title: 'Task Reporter',
            dataIndex: 'task_reporter',
            key: 'task_reporter',
            sorter: (a, b) => (a.task_reporter || '').localeCompare(b.task_reporter || ''),
        },
        {
            title: 'Start Date',
            dataIndex: 'startDate',
            key: 'startDate',
            sorter: (a, b) => (a.startDate || '').localeCompare(b.startDate || ''),
        },
        {
            title: 'Due Date',
            dataIndex: 'dueDate',
            key: 'dueDate',
            render: (date) => (
                <span>{dayjs(date).format('MMM DD, YYYY')}</span>
            ),
            sorter: (a, b) => new Date(a.dueDate) - new Date(b.dueDate),
        },
        {
            title: 'Assigned To',
            dataIndex: 'assignedTo',
            key: 'assignedTo',
            render: (text) => <span>{text || 'Unassigned'}</span>,
            sorter: (a, b) => (a.assignedTo || '').localeCompare(b.assignedTo || ''),
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
            render: (priority) => (
                <Tag color={
                    priority === 'High' ? 'red' :
                    priority === 'Medium' ? 'orange' : 'green'
                }
                className={`task-priority-tag ${priority.toLowerCase()}`}
                >
                    {priority}
                </Tag>
            ),
            sorter: (a, b) => (a.priority || '').localeCompare(b.priority || ''),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                <Tag color={
                    status === 'Completed' ? 'green' :
                    status === 'In Progress' ? 'blue' : 'orange'
                }
                className={`task-status-tag ${status.toLowerCase().replace(' ', '-')}`}
                >
                    {status}
                </Tag>
            ),
            sorter: (a, b) => (a.status || '').localeCompare(b.status || ''),
        },

      
        
        {
            title: 'Actions',
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
                    showTotal: (total) => `Total ${total} items`,
                }}
                className="task-table"
            />
        </div>
    );
};

export default TaskList; 