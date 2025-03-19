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
import './branch.scss';
import moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import CreateBranch from './CreateBranch';
import BranchList from './BranchList';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

const Branch = () => {
    const [branches, setBranches] = useState([]);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filteredBranches, setFilteredBranches] = useState([]);
    const searchInputRef = useRef(null);

    useEffect(() => {
        // TODO: Replace with actual API call
        const mockData = [
            {
                id: 1,
                name: 'Main Branch',
                location: 'New York',
                manager: 'John Doe',
                phone: '+1234567890',
                email: 'main@example.com',
                status: 'active',
                created_at: new Date().toISOString(),
                address: '123 Main St',
                city: 'New York',
                state: 'NY',
                country: 'USA',
                zipcode: '10001'
            }
        ];
        setBranches(mockData);
    }, []);

    useEffect(() => {
        let result = [...branches];
        if (searchText) {
            result = result.filter(branch =>
                branch.name.toLowerCase().includes(searchText.toLowerCase()) ||
                branch.location.toLowerCase().includes(searchText.toLowerCase()) ||
                branch.manager.toLowerCase().includes(searchText.toLowerCase()) ||
                branch.email.toLowerCase().includes(searchText.toLowerCase()) ||
                branch.phone.includes(searchText) ||
                (branch.city && branch.city.toLowerCase().includes(searchText.toLowerCase())) ||
                (branch.state && branch.state.toLowerCase().includes(searchText.toLowerCase()))
            );
        }
        setFilteredBranches(result);
    }, [branches, searchText]);

    const handleAddBranch = () => {
        setSelectedBranch(null);
        setIsEditing(false);
        setIsFormVisible(true);
    };

    const handleEditBranch = (branch) => {
        setSelectedBranch(branch);
        setIsEditing(true);
        setIsFormVisible(true);
    };

    const handleViewBranch = (branch) => {
        setSelectedBranch(branch);
    };

    const handleDeleteConfirm = (branch) => {
        setSelectedBranch(branch);
        setIsDeleteModalVisible(true);
    };

    const handleDeleteBranch = async () => {
        try {
            // TODO: Implement delete API call
            const updatedBranches = branches.filter(b => b.id !== selectedBranch.id);
            setBranches(updatedBranches);
            message.success('Branch deleted successfully');
            setIsDeleteModalVisible(false);
        } catch (error) {
            message.error('Failed to delete branch');
        }
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (isEditing) {
                const updatedBranches = branches.map(b =>
                    b.id === selectedBranch.id ? { ...b, ...formData } : b
                );
                setBranches(updatedBranches);
                message.success('Branch updated successfully');
            } else {
                const newBranch = {
                    id: Date.now(),
                    ...formData,
                    created_at: new Date().toISOString(),
                    status: 'active'
                };
                setBranches([...branches, newBranch]);
                message.success('Branch created successfully');
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
            const data = branches.map(branch => ({
                'Branch Name': branch.name,
                'Location': branch.location,
                'Manager': branch.manager,
                'Email': branch.email,
                'Phone': branch.phone,
                'Status': branch.status,
                'Created Date': moment(branch.created_at).format('YYYY-MM-DD')
            }));

            switch (type) {
                case 'csv':
                    exportToCSV(data, 'branches_export');
                    break;
                case 'excel':
                    exportToExcel(data, 'branches_export');
                    break;
                case 'pdf':
                    exportToPDF(data, 'branches_export');
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
        XLSX.utils.book_append_sheet(wb, ws, 'Branches');
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
        <div className="branch-page">
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
                    <Breadcrumb.Item>Branch</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Branches</Title>
                    <Text type="secondary">Manage all branches in the organization</Text>
                </div>
                <div className="header-actions">
                    <Input
                        prefix={<FiSearch style={{ color: '#8c8c8c', fontSize: '16px' }} />}
                        placeholder="Search branches..."
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
                            onClick={handleAddBranch}
                            className="add-button"
                        >
                            Add Branch
                        </Button>
                    </div>
                </div>
            </div>

            <Card className="branch-table-card">
                <BranchList
                    branches={filteredBranches}
                    loading={loading}
                    onEdit={handleEditBranch}
                    onDelete={handleDeleteConfirm}
                    onView={handleViewBranch}
                />
            </Card>

            <CreateBranch
                open={isFormVisible}
                onCancel={() => setIsFormVisible(false)}
                onSubmit={handleFormSubmit}
                isEditing={isEditing}
                initialValues={selectedBranch}
                loading={loading}
            />

            <Modal
                title="Delete Branch"
                open={isDeleteModalVisible}
                onOk={handleDeleteBranch}
                onCancel={() => setIsDeleteModalVisible(false)}
                okText="Delete"
                okButtonProps={{
                    danger: true,
                    loading: loading
                }}
            >
                <p>Are you sure you want to delete <strong>{selectedBranch?.name}</strong>?</p>
                <p>This action cannot be undone.</p>
            </Modal>
        </div>
    );
};

export default Branch;
