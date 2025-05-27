import React, { useState, useEffect, useRef } from 'react';
import {
    Card, Typography, Button, Modal, message, Input,
    Dropdown, Menu, Row, Col, Breadcrumb, Table, DatePicker,
    Popover
} from 'antd';
import {
    FiPlus, FiSearch,
    FiChevronDown, FiDownload,
    FiHome, FiCalendar, FiFilter
} from 'react-icons/fi';
import './job.scss';
import moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import CreateJob from './CreateJob';
import JobList from './JobList';
import { Link } from 'react-router-dom';
import { useGetAllJobsQuery, useDeleteJobMutation } from './services/jobApi';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { confirm } = Modal;
const { RangePicker } = DatePicker;

const Job = () => {
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [dateRange, setDateRange] = useState([]);
    const [exportLoading, setExportLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const searchInputRef = useRef(null);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [isFilterVisible, setIsFilterVisible] = useState(false);

    const { data: jobsData, isLoading, error, refetch } = useGetAllJobsQuery({
        page: currentPage,
        limit: pageSize,
        search: searchText,
        ...(dateRange?.length === 2 && {
            startDate: dateRange[0].format('YYYY-MM-DD'),
            endDate: dateRange[1].format('YYYY-MM-DD')
        })
    });
    const [deleteJob] = useDeleteJobMutation();

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(1); // Reset to first page on new search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchText, dateRange]);

    const handleAddJob = () => {
        setSelectedJob(null);
        setIsEditing(false);
        setIsFormVisible(true);
    };

    const handleEditJob = (job) => {
        setSelectedJob(job);
        setIsEditing(true);
        setIsFormVisible(true);
    };

    const handleViewJob = (job) => {
        setSelectedJob(job);
    };

    const handleDelete = (recordOrIds) => {
        const isMultiple = Array.isArray(recordOrIds);
        const title = isMultiple ? 'Delete Selected Jobs' : 'Delete Job';
        const content = isMultiple
            ? `Are you sure you want to delete ${recordOrIds.length} selected jobs?`
            : 'Are you sure you want to delete this job?';

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
                        await Promise.all(recordOrIds.map(id => deleteJob(id).unwrap()));
                        message.success(`${recordOrIds.length} jobs deleted successfully`);
                    } else {
                        await deleteJob(recordOrIds).unwrap();
                        message.success('Job deleted successfully');
                    }
                    // Refetch the data after successful delete
                    refetch();
                } catch (error) {
                    message.error(error?.data?.message || 'Failed to delete job(s)');
                }
            },
        });
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (isEditing) {
                const updatedJobs = jobsData.data.map(j =>
                    j.id === selectedJob.id ? { ...j, ...formData } : j
                );
                // Assuming jobsData.data is updated in the API
                // You might want to refetch the data after update
                message.success('Job updated successfully');
            } else {
                const newJob = {
                    id: Date.now(),
                    ...formData,
                    created_at: new Date().toISOString(),
                };
                // Assuming jobsData.data is updated in the API
                // You might want to refetch the data after creation
                message.success('Job created successfully');
            }
            setIsFormVisible(false);
        } catch (error) {
            message.error('Operation failed');
        }
    };

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const handleTableChange = (pagination, filters, sorter) => {
        setCurrentPage(pagination.current);
        setPageSize(pagination.pageSize);
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
            const data = jobsData?.data?.map(job => ({
                'Title': job.title || 'N/A',
                'Department': job.category || 'N/A',
                'Location': job.location || 'N/A',
                'Experience': job.workExperience || 'N/A',
                'Salary': `${job.currency || ''} ${job.expectedSalary || 'N/A'}`,
                'Status': job.status || 'N/A',
                'Created Date': moment(job.created_at).format('YYYY-MM-DD')
            })) || [];

            if (data.length === 0) {
                message.warning('No data available to export');
                return;
            }

            const timestamp = moment().format('YYYY-MM-DD_HH-mm');
            const filename = `jobs_export_${timestamp}`;

            switch (type) {
                case 'csv':
                    exportToCSV(data, filename);
                    break;
                case 'excel':
                    exportToExcel(data, filename);
                    break;
                case 'pdf':
                    exportToPDF(data, filename);
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
        XLSX.utils.book_append_sheet(wb, ws, 'Jobs');
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

    const searchContent = (
        <div className="search-popup">
            <Input
                prefix={<FiSearch style={{ color: "#8c8c8c" }} />}
                placeholder="Search jobs..."
                allowClear
                onChange={(e) => handleSearch(e.target.value)}
                value={searchText}
                className="search-input"
                autoFocus
            />
        </div>
    );

    const filterMenu = (
        <Menu className="filter-menu">
            <Menu.Item key="date" className="filter-menu-item">
                <div className="filter-section">
                    <RangePicker
                        onChange={(dates) => setDateRange(dates)}
                        value={dateRange}
                        allowClear
                        placeholder={['Start Date', 'End Date']}
                    />
                </div>
            </Menu.Item>
            <Menu.Item key="export" className="filter-menu-item">
                <div className="filter-section">
                    <Dropdown overlay={exportMenu} trigger={['click']} getPopupContainer={triggerNode => document.body}>
                        <Button className="export-buttons">
                            <FiDownload size={16} />
                            Export
                        </Button>
                    </Dropdown>
                </div>
            </Menu.Item>
        </Menu>
    );

    return (
        <div className="job-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/dashboard">
                            <FiHome style={{ marginRight: '4px' }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    {/* <Breadcrumb.Item>
                        <Link to="/dashboard/hrm">HRM</Link>
                    </Breadcrumb.Item> */}
                    <Breadcrumb.Item>Job</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <div className="title-row">
                        <Title level={2}>Jobs</Title>
                        <div className="mobile-actions">
                          
                            <Popover
                                content={searchContent}
                                trigger="click"
                                visible={isSearchVisible}
                                onVisibleChange={setIsSearchVisible}
                                placement="bottomRight"
                                overlayClassName="search-popover"
                                getPopupContainer={(triggerNode) => triggerNode.parentNode}
                            >
                                <Button
                                    icon={<FiSearch size={18} />}
                                    className="mobile-search-button"
                                />
                            </Popover>
                            <Dropdown
                                overlay={filterMenu}
                                trigger={['click']}
                                visible={isFilterVisible}
                                onVisibleChange={setIsFilterVisible}
                                placement="bottomRight"
                                getPopupContainer={triggerNode => document.body}
                            >
                                <Button
                                    icon={<FiFilter size={18} />}
                                    className="mobile-filter-button"
                                />
                            </Dropdown>
                            <Button
                                type="primary"
                                icon={<FiPlus size={18} />}
                                onClick={handleAddJob}
                                className="mobile-add-button"
                            />
                        </div>
                    </div>
                    <Text type="secondary">Manage all jobs in the organization</Text>
                </div>

                <div className="header-actions">
                    <div className="desktop-actions">
                        <Input
                            prefix={<FiSearch style={{ color: '#8c8c8c' }} />}
                            placeholder="Search jobs..."
                            allowClear
                            onChange={(e) => handleSearch(e.target.value)}
                            value={searchText}
                            className="search-input"
                        />
                        <RangePicker
                            suffixIcon={<FiCalendar style={{ color: '#8c8c8c' }} />}
                            onChange={(dates) => setDateRange(dates)}
                            value={dateRange}
                            allowClear
                            placeholder={['Start Date', 'End Date']}
                        />
                        <Dropdown overlay={exportMenu} trigger={['click']}>
                            <Button className="export-button" >
                                <FiDownload size={16} />
                                Export
                            </Button>
                        </Dropdown>
                        <Button
                            type="primary"
                            icon={<FiPlus size={16} />}
                            onClick={handleAddJob}
                            className="add-button"
                        >
                            Add Job
                        </Button>
                    </div>
                </div>
            </div>

            <Card className="job-table-card">
                <JobList
                    jobs={jobsData?.data || []}
                    onEdit={handleEditJob}
                    onDelete={handleDelete}
                    loading={isLoading}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: jobsData?.total || 0,
                        totalPages: jobsData?.totalPages || 1,
                        onChange: handleTableChange,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} items`
                    }}
                />
            </Card>

            {isFormVisible && (
                <CreateJob
                    open={isFormVisible}
                    onCancel={() => setIsFormVisible(false)}
                    onSubmit={handleFormSubmit}
                    initialValues={selectedJob}
                    isEditing={isEditing}
                />
            )}
        </div>
    );
};

export default Job;
