import React, { useState, useEffect, useRef } from 'react';
import {
    Card, Typography, Button, Modal, message, Input,
    Dropdown, Menu, Row, Col, Breadcrumb, Table, DatePicker
} from 'antd';
import {
    FiPlus, FiSearch,
    FiChevronDown, FiDownload,
    FiHome, FiCalendar
} from 'react-icons/fi';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import './jobOnboarding.scss';
import moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import CreateJobOnboarding from './CreateJobOnboarding';
import JobOnboardingList from './JobOnboardingList';
import { Link } from 'react-router-dom';
import { useGetAllJobOnboardingQuery, useDeleteJobOnboardingMutation } from './services/jobOnboardingApi';

const { Title, Text } = Typography;
const { confirm } = Modal;
const { RangePicker } = DatePicker;

const JobOnboarding = () => {
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [selectedOnboarding, setSelectedOnboarding] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [dateRange, setDateRange] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [exportLoading, setExportLoading] = useState(false);
    const searchInputRef = useRef(null);

    const { data: onboardingsData, isLoading, error } = useGetAllJobOnboardingQuery({
        page: currentPage,
        limit: pageSize,
        search: searchText,
        ...(dateRange?.length === 2 && {
            startDate: dateRange[0].format('YYYY-MM-DD'),
            endDate: dateRange[1].format('YYYY-MM-DD')
        })
    });
    const [deleteOnboarding] = useDeleteJobOnboardingMutation();

    // Ensure we have default pagination values
    const paginationData = {
        current: currentPage,
        pageSize: pageSize,
        total: onboardingsData?.pagination?.total || 0
    };

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(1); // Reset to first page on new search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchText, dateRange]);

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const handleTableChange = (pagination, filters, sorter) => {
        setCurrentPage(pagination.current || 1);
        setPageSize(pagination.pageSize || 10);
    };

    const handleAddOnboarding = () => {
        setSelectedOnboarding(null);
        setIsEditing(false);
        setIsFormVisible(true);
    };

    const handleEditOnboarding = (onboarding) => {
        setSelectedOnboarding(onboarding);
        setIsEditing(true);
        setIsFormVisible(true);
    };

    const handleDelete = (recordOrIds) => {
        const isMultiple = Array.isArray(recordOrIds);
        const title = isMultiple ? 'Delete Selected Onboardings' : 'Delete Onboarding';
        const content = isMultiple
            ? `Are you sure you want to delete ${recordOrIds.length} selected onboardings?`
            : 'Are you sure you want to delete this onboarding?';

        Modal.confirm({
            title,
            content,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            icon: <ExclamationCircleOutlined />,
            bodyStyle: { padding: "20px" },
            onOk: async () => {
                try {
                    if (isMultiple) {
                        await Promise.all(recordOrIds.map(id => deleteOnboarding(id).unwrap()));
                        message.success(`${recordOrIds.length} onboardings deleted successfully`);
                    } else {
                        await deleteOnboarding(recordOrIds).unwrap();
                        message.success('Onboarding deleted successfully');
                    }
                } catch (error) {
                    message.error(error?.data?.message || 'Failed to delete onboarding(s)');
                }
            },
        });
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (isEditing) {
                message.success('Onboarding record updated successfully');
            } else {
                message.success('Onboarding record created successfully');
            }
            setIsFormVisible(false);
        } catch (error) {
            message.error('Operation failed');
        }
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

    const handleExport = async (type) => {
        try {
            setExportLoading(true);
            const data = onboardingsData?.data.map(onboarding => ({
                'Employee Name': onboarding.employee_name,
                'Position': onboarding.position,
                'Department': onboarding.department,
                'Joining Date': onboarding.joining_date,
                'Mentor': onboarding.mentor,
                'Status': onboarding.status,
                'Tasks Completed': onboarding.tasks_completed,
                'Documents Submitted': onboarding.documents_submitted,
                'Orientation Date': onboarding.orientation_date
            }));

            switch (type) {
                case 'csv':
                    exportToCSV(data, 'job_onboarding_export');
                    break;
                case 'excel':
                    exportToExcel(data, 'job_onboarding_export');
                    break;
                case 'pdf':
                    exportToPDF(data, 'job_onboarding_export');
                    break;
                default:
                    break;
            }
            message.success(`Successfully exported as ${type.toUpperCase()}`);
        } catch (error) {
            message.error(`Failed to export: ${error.message}`);
        } finally {
            setExportLoading(false);
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
        XLSX.utils.book_append_sheet(wb, ws, 'Onboarding');
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

    return (
        <div className="job-onboarding-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/dashboard">
                            <FiHome style={{ marginRight: '4px' }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <Link to="/dashboard/job">Job</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Job Onboarding</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Job Onboarding</Title>
                    <Text type="secondary">Manage employee onboarding process</Text>
                </div>
                <div className="header-actions">
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <Input
                            prefix={<FiSearch style={{ color: '#8c8c8c', fontSize: '16px' }} />}
                            placeholder="Search onboardings..."
                            allowClear
                            onChange={(e) => handleSearch(e.target.value)}
                            value={searchText}
                            ref={searchInputRef}
                            className="search-input"
                            style={{ width: '300px' }}
                        />
                        <RangePicker
                            suffixIcon={<FiCalendar style={{ color: '#8c8c8c', fontSize: '16px' }} />}
                            onChange={(dates) => setDateRange(dates)}
                            value={dateRange}
                            allowClear
                            style={{ width: '300px', height: '40px' }}
                            placeholder={['Start Date', 'End Date']}
                        />
                    </div>
                    <div className="action-buttons">
                        <Dropdown overlay={exportMenu} trigger={['click']}>
                            <Button
                                className="export-button"
                                icon={<FiDownload size={16} />}
                                loading={exportLoading}
                            >
                                Export
                                <FiChevronDown size={16} />
                            </Button>
                        </Dropdown>
                        <Button
                            type="primary"
                            icon={<FiPlus size={16} />}
                            onClick={handleAddOnboarding}
                            className="add-button"
                        >
                            Add Onboarding
                        </Button>
                    </div>
                </div>
            </div>

            <Card className="job-onboarding-table-card">
                <JobOnboardingList
                    onboardings={onboardingsData?.data || []}
                    onEdit={handleEditOnboarding}
                    onDelete={handleDelete}
                    loading={isLoading}
                    pagination={{
                        ...paginationData,
                        onChange: handleTableChange,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} items`
                    }}
                />
            </Card>

            <CreateJobOnboarding
                open={isFormVisible}
                onCancel={() => setIsFormVisible(false)}
                onSubmit={handleFormSubmit}
                isEditing={isEditing}
                initialValues={selectedOnboarding}
            />
        </div>
    );
};

export default JobOnboarding;
