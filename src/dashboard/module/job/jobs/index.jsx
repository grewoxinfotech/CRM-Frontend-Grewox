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
import './job.scss';
import moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import CreateJob from './CreateJob';
import JobList from './JobList';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

const Job = () => {
    const [jobs, setJobs] = useState([]);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filteredJobs, setFilteredJobs] = useState([]);
    const searchInputRef = useRef(null);

    useEffect(() => {
        // TODO: Replace with actual API call
        const mockData = [
            {
                id: 1,
                title: 'Senior React Developer',
                category: 'Engineering',
                interview_round: 'New York',
                job_type: 'Full-time',
                work_experience: '3-5 years',
                job_location: 'New York',
                recruiter: 'active',
                start_date: new Date().toLocaleDateString(),
                end_date: new Date().toLocaleDateString(),
                expected_salary: '$80,000',
                status: 'active',
                description: 'We are looking for a Senior React Developer...',
              
            }
        ];
        setJobs(mockData);
        setFilteredJobs(mockData);
    }, []);

    useEffect(() => {
        let result = [...jobs];
        if (searchText) {
            result = result.filter(job =>
                job.title.toLowerCase().includes(searchText.toLowerCase()) ||
                job.department.toLowerCase().includes(searchText.toLowerCase()) ||
                job.location.toLowerCase().includes(searchText.toLowerCase()) ||
                job.type.toLowerCase().includes(searchText.toLowerCase()) ||
                job.experience.toLowerCase().includes(searchText.toLowerCase()) ||
                (job.salaryMin && job.salaryMin.toString().includes(searchText)) ||
                (job.salaryMax && job.salaryMax.toString().includes(searchText))
            );
        }
        setFilteredJobs(result);
    }, [jobs, searchText]);

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

    const handleDeleteConfirm = (job) => {
        setSelectedJob(job);
        setIsDeleteModalVisible(true);
    };

    const handleDeleteJob = async () => {
        try {
            // TODO: Implement delete API call
            const updatedJobs = jobs.filter(j => j.id !== selectedJob.id);
            setJobs(updatedJobs);
            message.success('Job deleted successfully');
            setIsDeleteModalVisible(false);
        } catch (error) {
            message.error('Failed to delete job');
        }
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (isEditing) {
                const updatedJobs = jobs.map(j =>
                    j.id === selectedJob.id ? { ...j, ...formData } : j
                );
                setJobs(updatedJobs);
                message.success('Job updated successfully');
            } else {
                const newJob = {
                    id: Date.now(),
                    ...formData,
                    created_at: new Date().toISOString(),
                };
                setJobs([...jobs, newJob]);
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
            const data = jobs.map(job => ({
                'Job Title': job.title,
                'Department': job.department,
                'Location': job.location,
                'Type': job.type,
                'Experience': job.experience,
                'Minimum Salary': `$${job.salaryMin.toLocaleString()}`,
                'Maximum Salary': `$${job.salaryMax.toLocaleString()}`,
                'Status': job.status,
                'Created Date': moment(job.created_at).format('YYYY-MM-DD')
            }));

            switch (type) {
                case 'csv':
                    exportToCSV(data, 'jobs_export');
                    break;
                case 'excel':
                    exportToExcel(data, 'jobs_export');
                    break;
                case 'pdf':
                    exportToPDF(data, 'jobs_export');
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
                    <Breadcrumb.Item>
                        <Link to="/dashboard/hrm">HRM</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Job</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Jobs</Title>
                    <Text type="secondary">Manage all jobs in the organization</Text>
                </div>
                <div className="header-actions">
                    <Input
                        prefix={<FiSearch style={{ color: '#8c8c8c', fontSize: '16px' }} />}
                        placeholder="Search jobs..."
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
                    jobs={filteredJobs}
                    loading={loading}
                    onEdit={handleEditJob}
                    onDelete={handleDeleteConfirm}
                    onView={handleViewJob}
                />
            </Card>

            <CreateJob
                open={isFormVisible}
                onCancel={() => setIsFormVisible(false)}
                onSubmit={handleFormSubmit}
                isEditing={isEditing}
                initialValues={selectedJob}
                loading={loading}
            />

            <Modal
                title="Delete Job"
                open={isDeleteModalVisible}
                onOk={handleDeleteJob}
                onCancel={() => setIsDeleteModalVisible(false)}
                okText="Delete"
                okButtonProps={{
                    danger: true,
                    loading: loading
                }}
            >
                <p>Are you sure you want to delete <strong>{selectedJob?.title}</strong>?</p>
                <p>This action cannot be undone.</p>
            </Modal>
        </div>
    );
};

export default Job;
