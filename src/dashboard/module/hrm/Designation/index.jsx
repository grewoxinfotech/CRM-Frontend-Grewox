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
import './designation.scss';
import moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import CreateDesignation from './CreateDesignation';
import DesignationList from './DesignationList';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

const Designation = () => {
    const [designations, setDesignations] = useState([]);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [selectedDesignation, setSelectedDesignation] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filteredDesignations, setFilteredDesignations] = useState([]);
    const searchInputRef = useRef(null);

    useEffect(() => {
        // TODO: Replace with actual API call
        const mockData = [
            {
                id: 1,
                title: 'Software Engineer',
                designation: 'Engineering',
                branch: 'Software development and technical operations',
                status: 'active',
                created_at: new Date().toISOString(),
                created_by: 'Admin'
            }
        ];
        setDesignations(mockData);
    }, []);

    useEffect(() => {
        let result = [...designations];
        if (searchText) {
            result = result.filter(designation =>
                designation.title.toLowerCase().includes(searchText.toLowerCase()) ||
                designation.department.toLowerCase().includes(searchText.toLowerCase()) ||
                designation.description.toLowerCase().includes(searchText.toLowerCase())
            );
        }
        setFilteredDesignations(result);
    }, [designations, searchText]);

    const handleAddDesignation = () => {
        setSelectedDesignation(null);
        setIsEditing(false);
        setIsFormVisible(true);
    };

    const handleEditDesignation = (designation) => {
        setSelectedDesignation(designation);
        setIsEditing(true);
        setIsFormVisible(true);
    };

    const handleDeleteConfirm = (designation) => {
        setSelectedDesignation(designation);
        setIsDeleteModalVisible(true);
    };

    const handleDeleteDesignation = async () => {
        try {
            // TODO: Implement delete API call
            const updatedDesignations = designations.filter(d => d.id !== selectedDesignation.id);
            setDesignations(updatedDesignations);
            message.success('Designation deleted successfully');
            setIsDeleteModalVisible(false);
        } catch (error) {
            message.error('Failed to delete designation');
        }
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (isEditing) {
                const updatedDesignations = designations.map(d =>
                    d.id === selectedDesignation.id ? { ...d, ...formData } : d
                );
                setDesignations(updatedDesignations);
                message.success('Designation updated successfully');
            } else {
                const newDesignation = {
                    id: Date.now(),
                    ...formData,
                    created_at: new Date().toISOString(),
                    status: 'active'
                };
                setDesignations([...designations, newDesignation]);
                message.success('Designation created successfully');
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
            const data = designations.map(designation => ({
                'Title': designation.title,
                'Department': designation.department,
                'Description': designation.description,
                'Status': designation.status,
                'Created Date': moment(designation.created_at).format('YYYY-MM-DD'),
            }));

            switch (type) {
                case 'csv':
                    exportToCSV(data, 'designations_export');
                    break;
                case 'excel':
                    exportToExcel(data, 'designations_export');
                    break;
                case 'pdf':
                    exportToPDF(data, 'designations_export');
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
        XLSX.utils.book_append_sheet(wb, ws, 'Designations');
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
        <div className="designation-page">
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
                    <Breadcrumb.Item>Designation</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Designations</Title>
                    <Text type="secondary">Manage all designations in the organization</Text>
                </div>
                <div className="header-actions">
                    <Input
                        prefix={<FiSearch style={{ color: '#8c8c8c', fontSize: '16px' }} />}
                        placeholder="Search designations..."
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
                            onClick={handleAddDesignation}
                            className="add-button"
                        >
                            Add Designation
                        </Button>
                    </div>
                </div>
            </div>

            <Card className="designation-table-card">
                <DesignationList
                    designations={filteredDesignations}
                    loading={loading}
                    onEdit={handleEditDesignation}
                    onDelete={handleDeleteConfirm}
                />
            </Card>

            <CreateDesignation
                open={isFormVisible}
                onCancel={() => setIsFormVisible(false)}
                onSubmit={handleFormSubmit}
                isEditing={isEditing}
                initialValues={selectedDesignation}
                loading={loading}
            />

            <Modal
                title="Delete Designation"
                open={isDeleteModalVisible}
                onOk={handleDeleteDesignation}
                onCancel={() => setIsDeleteModalVisible(false)}
                okText="Delete"
                okButtonProps={{
                    danger: true,
                    loading: loading
                }}
            >
                <p>Are you sure you want to delete <strong>{selectedDesignation?.title}</strong>?</p>
                <p>This action cannot be undone.</p>
            </Modal>
        </div>
    );
};

export default Designation;
