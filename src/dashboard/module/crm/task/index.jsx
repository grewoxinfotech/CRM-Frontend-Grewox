import React, { useState } from 'react';
import {
    Card, Typography, Button, Modal, message, Input,
    Dropdown, Menu, Row, Col, Breadcrumb, DatePicker
} from 'antd';
import {
    FiPlus, FiSearch,
    FiDownload, FiHome, FiFilter
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import TaskList from './TaskList';
import CreateTask from './CreateTask';
import EditTask from './EditTask';
import './task.scss';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import moment from 'moment';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const Task = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [filters, setFilters] = useState({
        dateRange: [],
        status: undefined,
        priority: undefined
    });
    const [loading, setLoading] = useState(false);

    const handleCreate = () => {
        setSelectedTask(null);
        setIsCreateModalOpen(true);
    };

    const handleEdit = (record) => {
        setSelectedTask(record);
        setIsEditModalOpen(true);
    };

    const handleModalSubmit = () => {
        setIsCreateModalOpen(false);
        setSelectedTask(null);
    };

    const handleView = (record) => {
        console.log('View task:', record);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: 'Delete Task',
            content: 'Are you sure you want to delete this task?',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: () => {
                console.log('Delete task:', record);
                message.success('Task deleted successfully');
            },
        });
    };

    const handleExport = async (type) => {
        try {
            setLoading(true);
            const data = tasks.map(task => ({
                'Task Name': task.taskName,
                'Category': task.category,
                'Status': task.status,
                'Priority': task.priority,
                'Assigned To': task.assignedTo,
                'Start Date': moment(task.startDate).format('YYYY-MM-DD'),
                'Due Date': moment(task.dueDate).format('YYYY-MM-DD'),
                'Created Date': moment(task.created_at).format('YYYY-MM-DD')
            }));

            switch (type) {
                case 'csv':
                    exportToCSV(data, 'tasks_export');
                    break;
                case 'excel':
                    exportToExcel(data, 'tasks_export');
                    break;
                case 'pdf':
                    exportToPDF(data, 'tasks_export');
                    break;
                default:
                    break;
            }
            message.success(`Successfully exported as ${type.toUpperCase()}`);
        } catch (error) {
            message.error(`Failed to export: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const exportToCSV = (data, filename) => {
        const csvContent = [
            Object.keys(data[0]).join(','),
            ...data.map(item => Object.values(item).map(value =>
                `"${value?.toString().replace(/"/g, '""')}"`
            ).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `${filename}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const exportToExcel = (data, filename) => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Tasks');
        XLSX.writeFile(wb, `${filename}.xlsx`);
    };

    const exportToPDF = (data, filename) => {
        const doc = new jsPDF('l', 'pt', 'a4');
        doc.autoTable({
            head: [Object.keys(data[0])],
            body: data.map(item => Object.values(item)),
            margin: { top: 20 },
            styles: { fontSize: 8 }
        });
        doc.save(`${filename}.pdf`);
    };

    const exportMenu = (
        <Menu>
            <Menu.Item
                key="csv"
                icon={<FiDownload />}
                onClick={() => handleExport('csv')}
            >
                Export as CSV
            </Menu.Item>
            <Menu.Item
                key="excel"
                icon={<FiDownload />}
                onClick={() => handleExport('excel')}
            >
                Export as Excel
            </Menu.Item>
            <Menu.Item
                key="pdf"
                icon={<FiDownload />}
                onClick={() => handleExport('pdf')}
            >
                Export as PDF
            </Menu.Item>
        </Menu>
    );

  return (
        <div className="task-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/dashboard">
                            <FiHome style={{ marginRight: '4px' }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <Link to="/dashboard/crm">CRM</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Tasks</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Tasks</Title>
                    <Text type="secondary">Manage all tasks in the organization</Text>
                </div>
                <div className="header-actions">
                    <div className="search-filter-group">
                        <Input
                            prefix={<FiSearch style={{ color: '#8c8c8c', fontSize: '16px' }} />}
                            placeholder="Search tasks..."
                            allowClear
                            onChange={(e) => setSearchText(e.target.value)}
                            value={searchText}
                            className="search-input"
                            style={{ width: 300 }}
                        />
                    </div>
                    <div className="action-buttons">
                        <Dropdown overlay={exportMenu} trigger={['click']}>
                            <Button
                                className="export-button"
                                icon={<FiDownload size={16} />}
                                loading={loading}
                            >
                                Export
                            </Button>
                        </Dropdown>
                        <Button
                            type="primary"
                            icon={<FiPlus size={16} />}
                            onClick={handleCreate}
                            className="add-button"
                        >
                            Add Task
                        </Button>
                    </div>
                </div>
            </div>

            <Card className="task-table-card">
                <TaskList 
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                    searchText={searchText}
                    filters={filters}
                />
            </Card>

            <CreateTask
                open={isCreateModalOpen}
                onCancel={() => setIsCreateModalOpen(false)}
                onSubmit={(values) => {
                    // Handle create submission
                    setIsCreateModalOpen(false);
                }}
            />

            <EditTask
                open={isEditModalOpen}
                onCancel={() => {
                    setIsEditModalOpen(false);
                    setSelectedTask(null);
                }}
                onSubmit={(values) => {
                    // Handle edit submission
                    setIsEditModalOpen(false);
                    setSelectedTask(null);
                }}
                initialValues={selectedTask}
            />
        </div>
    );
};

export default Task;
