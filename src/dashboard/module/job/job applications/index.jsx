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

const { Title, Text } = Typography;

const JobApplications = () => {
    const [applications, setApplications] = useState([]);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filteredApplications, setFilteredApplications] = useState([]);
    const searchInputRef = useRef(null);

    useEffect(() => {
        // TODO: Replace with actual API call
        const mockData = [
            {
                id: 1,
                applicant_name: 'John Doe',
                email: 'john.doe@example.com',
                position: 'Software Engineer',
                notice_period: '2 months',
                current_location: 'San Francisco',
                phone: '+1234567890',
                total_experience: '5 years',
                applied_source: 'LinkedIn',
                cover_letter: 'i am a good candidate for this job',
                status: 'pending',
                resume: 'resume.pdf'
            }
        ];
        setApplications(mockData);
        setFilteredApplications(mockData);
    }, []);

    useEffect(() => {
        let result = [...applications];
        if (searchText) {
            result = result.filter(application =>
                application.applicant_name.toLowerCase().includes(searchText.toLowerCase()) ||
                application.email.toLowerCase().includes(searchText.toLowerCase()) ||
                application.position.toLowerCase().includes(searchText.toLowerCase()) ||
                application.status.toLowerCase().includes(searchText.toLowerCase())
            );
        }
        setFilteredApplications(result);
    }, [applications, searchText]);

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

    const handleViewApplication = (application) => {
        setSelectedApplication(application);
    };

    const handleDeleteConfirm = (application) => {
        setSelectedApplication(application);
        setIsDeleteModalVisible(true);
    };

    const handleDeleteApplication = async () => {
        try {
            // TODO: Implement delete API call
            const updatedApplications = applications.filter(a => a.id !== selectedApplication.id);
            setApplications(updatedApplications);
            message.success('Application deleted successfully');
            setIsDeleteModalVisible(false);
        } catch (error) {
            message.error('Failed to delete application');
        }
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (isEditing) {
                const updatedApplications = applications.map(a =>
                    a.id === selectedApplication.id ? { ...a, ...formData } : a
                );
                setApplications(updatedApplications);
                message.success('Application updated successfully');
            } else {
                const newApplication = {
                    id: Date.now(),
                    ...formData,
                    created_at: new Date().toISOString(),
                };
                setApplications([...applications, newApplication]);
                message.success('Application created successfully');
            }
            setIsFormVisible(false);
        } catch (error) {
            message.error('Operation failed');
        }
    };

    const handleSearch = (value) => {
        setSearchText(value);
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
            setLoading(true);
            const data = applications.map(application => ({
                'Applicant Name': application.applicant_name,
                'Email': application.email,
                'Phone': application.phone,
                'Position': application.position,
                'Experience': application.experience,
                'Current Salary': application.current_salary,
                'Expected Salary': application.expected_salary,
                'Notice Period': application.notice_period,
                'Interview Date': application.interview_date,
                'Status': application.status,
            }));

            switch (type) {
                case 'csv':
                    exportToCSV(data, 'job_applications_export');
                    break;
                case 'excel':
                    exportToExcel(data, 'job_applications_export');
                    break;
                case 'pdf':
                    exportToPDF(data, 'job_applications_export');
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
        <div className="job-applications-page">
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
                        prefix={<FiSearch style={{ color: '#8c8c8c', fontSize: '16px' }} />}
                        placeholder="Search applications..."
                        allowClear
                        onChange={(e) => handleSearch(e.target.value)}
                        value={searchText}
                        ref={searchInputRef}
                        className="search-input"
                    />
                    <div className="action-buttons">
                        <Dropdown overlay={exportMenu} trigger={['click']}>
                            <Button className="export-button">
                                <FiDownload size={16} />
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

            <Card className="job-applications-table-card">
                <JobApplicationList
                    applications={filteredApplications}
                    loading={loading}
                    onEdit={handleEditApplication}
                    onDelete={handleDeleteConfirm}
                    onView={handleViewApplication}
                />
            </Card>

            <CreateJobApplication
                open={isFormVisible}
                onCancel={() => setIsFormVisible(false)}
                onSubmit={handleFormSubmit}
                isEditing={isEditing}
                initialValues={selectedApplication}
                loading={loading}
            />

            <Modal
                title="Delete Application"
                open={isDeleteModalVisible}
                onOk={handleDeleteApplication}
                onCancel={() => setIsDeleteModalVisible(false)}
                okText="Delete"
                okButtonProps={{
                    danger: true,
                    loading: loading
                }}
            >
                <p>Are you sure you want to delete application for <strong>{selectedApplication?.applicant_name}</strong>?</p>
                <p>This action cannot be undone.</p>
            </Modal>
        </div>
    );
};

export default JobApplications;
