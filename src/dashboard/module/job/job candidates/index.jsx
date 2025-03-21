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
import './jobCandidates.scss';
import moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import JobCandidateList from './JobCandidateList';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

const JobCandidates = () => {
    const [candidates, setCandidates] = useState([]);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filteredCandidates, setFilteredCandidates] = useState([]);
    const searchInputRef = useRef(null);

    useEffect(() => {
        // TODO: Replace with actual API call
        const mockData = [
            {
                id: 1,
                name: 'John Doe',
                location: 'New York',
                phone: '+1234567890',
                job: 'Senior React Developer',
                total_experience: '5 years',
                applied_source: 'LinkedIn',
                cover_letter: 'I am a senior react developer with 5 years of experience in the field.',
                notice_period: '2 months',
                current_location: 'New York',
                status: 'shortlisted',
              
            }
        ];
        setCandidates(mockData);
        setFilteredCandidates(mockData);
    }, []);

    useEffect(() => {
        let result = [...candidates];
        if (searchText) {
            result = result.filter(candidate =>
                candidate.name.toLowerCase().includes(searchText.toLowerCase()) ||
                candidate.email.toLowerCase().includes(searchText.toLowerCase()) ||
                candidate.position.toLowerCase().includes(searchText.toLowerCase()) ||
                candidate.status.toLowerCase().includes(searchText.toLowerCase())
            );
        }
        setFilteredCandidates(result);
    }, [candidates, searchText]);

    const handleAddCandidate = () => {
        setSelectedCandidate(null);
        setIsEditing(false);
        setIsFormVisible(true);
    };

    const handleEditCandidate = (candidate) => {
        setSelectedCandidate(candidate);
        setIsEditing(true);
        setIsFormVisible(true);
    };

    const handleViewCandidate = (candidate) => {
        setSelectedCandidate(candidate);
    };

    const handleDeleteConfirm = (candidate) => {
        setSelectedCandidate(candidate);
        setIsDeleteModalVisible(true);
    };

    const handleDeleteCandidate = async () => {
        try {
            // TODO: Implement delete API call
            const updatedCandidates = candidates.filter(c => c.id !== selectedCandidate.id);
            setCandidates(updatedCandidates);
            message.success('Candidate deleted successfully');
            setIsDeleteModalVisible(false);
        } catch (error) {
            message.error('Failed to delete candidate');
        }
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (isEditing) {
                const updatedCandidates = candidates.map(c =>
                    c.id === selectedCandidate.id ? { ...c, ...formData } : c
                );
                setCandidates(updatedCandidates);
                message.success('Candidate updated successfully');
            } else {
                const newCandidate = {
                    id: Date.now(),
                    ...formData,
                    created_at: new Date().toISOString(),
                };
                setCandidates([...candidates, newCandidate]);
                message.success('Candidate created successfully');
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
            const data = candidates.map(candidate => ({
                'Name': candidate.name,
                'Email': candidate.email,
                'Phone': candidate.phone,
                'Position': candidate.position,
                'Experience': candidate.experience,
                'Current Salary': candidate.current_salary,
                'Expected Salary': candidate.expected_salary,
                'Notice Period': candidate.notice_period,
                'Interview Date': candidate.interview_date,
                'Status': candidate.status,
            }));

            switch (type) {
                case 'csv':
                    exportToCSV(data, 'job_candidates_export');
                    break;
                case 'excel':
                    exportToExcel(data, 'job_candidates_export');
                    break;
                case 'pdf':
                    exportToPDF(data, 'job_candidates_export');
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
        XLSX.utils.book_append_sheet(wb, ws, 'Candidates');
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
        <div className="job-candidates-page">
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
                    <Breadcrumb.Item>Job Candidates</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Job Candidates</Title>
                    <Text type="secondary">Manage all job candidates in the organization</Text>
                </div>
                <div className="header-actions">
                    <Input
                        prefix={<FiSearch style={{ color: '#8c8c8c', fontSize: '16px' }} />}
                        placeholder="Search candidates..."
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
                    </div>
                </div>
            </div>

            <Card className="job-candidates-table-card">
                <JobCandidateList
                    candidates={filteredCandidates}
                    loading={loading}
                    onEdit={handleEditCandidate}
                    onDelete={handleDeleteConfirm}
                    onView={handleViewCandidate}
                />
            </Card>

            

            <Modal
                title="Delete Candidate"
                open={isDeleteModalVisible}
                onOk={handleDeleteCandidate}
                onCancel={() => setIsDeleteModalVisible(false)}
                okText="Delete"
                okButtonProps={{
                    danger: true,
                    loading: loading
                }}
            >
                <p>Are you sure you want to delete <strong>{selectedCandidate?.name}</strong>?</p>
                <p>This action cannot be undone.</p>
            </Modal>
        </div>
    );
};

export default JobCandidates;
