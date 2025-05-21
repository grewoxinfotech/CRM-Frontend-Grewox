import React, { useState, useEffect, useRef } from 'react';
import {
    Card, Typography, Button, Modal, message, Input,
    Dropdown, Menu, Row, Col, Breadcrumb, Table
} from 'antd';
import {
    FiPlus, FiSearch,
    FiChevronDown, FiDownload,
    FiHome
} from 'react-icons/fi';
import './jobApplications.scss';
import moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import CreateJobApplication from './CreateJobApplication';
import JobApplicationList from './JobApplicationList';
import { Link } from 'react-router-dom';
import { useGetAllJobApplicationsQuery, useDeleteJobApplicationMutation } from './services/jobApplicationApi';
import { useSelector, useDispatch } from 'react-redux';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { confirm } = Modal;

const JobApplications = () => {
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [exportLoading, setExportLoading] = useState(false);
    const searchInputRef = useRef(null);

    const { data: applications, isLoading } = useGetAllJobApplicationsQuery({
        page: currentPage,
        limit: pageSize,
        search: searchText
    });

    const [deleteApplication] = useDeleteJobApplicationMutation();

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setCurrentPage(1); // Reset to first page on new search
        }, 500);
        return () => clearTimeout(timer);
    }, [searchText]);

    const handleAddApplication = () => {
        setSelectedApplication(null);
        setIsEditing(false);
        setIsFormVisible(true);
    };

    const handleEditApplication = (application) => {
        setSelectedApplication(application);
        setIsEditing(true);
        setIsFormVisible(true);
    };

    const handleDelete = (recordOrIds) => {
        const isMultiple = Array.isArray(recordOrIds);
        const title = isMultiple ? 'Delete Selected Applications' : 'Delete Application';
        const content = isMultiple
            ? `Are you sure you want to delete ${recordOrIds.length} selected applications?`
            : 'Are you sure you want to delete this application?';

        Modal.confirm({
            title,
            content,
            okText: 'Yes',
            okType: 'danger',
            okText: 'Yes',
            cancelText: 'No',
            bodyStyle: { padding: '20px' },
            onOk: async () => {
                try {
                    if (isMultiple) {
                        await Promise.all(recordOrIds.map(id => deleteApplication(id).unwrap()));
                        message.success(`${recordOrIds.length} applications deleted successfully`);
                    } else {
                        await deleteApplication(recordOrIds).unwrap();
                        message.success('Application deleted successfully');
                    }
                } catch (error) {
                    message.error(error?.data?.message || 'Failed to delete application(s)');
                }
            },
        });
    };

    const handleFormClose = () => {
        setIsFormVisible(false);
        setSelectedApplication(null);
        setIsEditing(false);
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
            const data = applications?.data?.map(application => ({
                'Name': application.name || 'N/A',
                'Email': application.email || 'N/A',
                'Phone': application.phone || 'N/A',
                'Job': application.job || 'N/A',
                'Experience': application.total_experience || 'N/A',
                'Notice Period': application.notice_period || 'N/A',
                'Status': application.status || 'N/A',
                'Applied Date': moment(application.created_at).format('YYYY-MM-DD')
            })) || [];

            if (data.length === 0) {
                message.warning('No data available to export');
                return;
            }

            const timestamp = moment().format('YYYY-MM-DD_HH-mm');
            const filename = `job_applications_export_${timestamp}`;

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
        XLSX.utils.book_append_sheet(wb, ws, 'Applications');
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
        <div className="job-applications-page" style={{
            height: '100vh',
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            scrollbarColor: '#d4d4d4 #f5f5f5'
        }}>
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
                    <Breadcrumb.Item>Job Applications</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Job Applications</Title>
                    <Text type="secondary">Manage all job applications</Text>
                </div>
                <div className="header-actions">
                    <Input
                        prefix={<FiSearch style={{ color: '#8c8c8c' }} />}
                        placeholder="Search applications..."
                        allowClear
                        onChange={(e) => handleSearch(e.target.value)}
                        value={searchText}
                        ref={searchInputRef}
                        style={{
                            width: '300px',
                            marginRight: '16px',
                            borderRadius: '20px'
                        }}
                    />
                    <div className="action-buttons">
                        <Dropdown
                            overlay={exportMenu}
                            trigger={['click']}
                            disabled={isLoading || exportLoading}
                        >
                            <Button className="export-button" loading={exportLoading}>
                                {!exportLoading && <FiDownload size={16} />}
                                <span>Export</span>
                                <FiChevronDown size={14} />
                            </Button>
                        </Dropdown>
                        <Button
                            type="primary"
                            icon={<FiPlus size={16} />}
                            onClick={handleAddApplication}
                            className="add-button"
                        >
                            Add Application
                        </Button>
                    </div>
                </div>
            </div>

            <Card className="job-applications-table-card" style={{
                maxHeight: 'calc(100vh - 250px)',
                overflowY: 'auto',
                scrollbarWidth: 'thin',
                scrollbarColor: '#d4d4d4 #f5f5f5'
            }}>
                <JobApplicationList
                    applications={applications?.data || []}
                    loading={isLoading}
                    onEdit={handleEditApplication}
                    onDelete={handleDelete}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: applications?.total || 0,
                        totalPages: applications?.totalPages || 1,
                        onChange: handleTableChange,
                        showSizeChanger: true,
                        showTotal: (total) => `Total ${total} items`
                    }}
                />
            </Card>

            <CreateJobApplication
                open={isFormVisible}
                onCancel={handleFormClose}
                isEditing={isEditing}
                initialValues={selectedApplication}
            />
        </div>
    );
};

export default JobApplications;
