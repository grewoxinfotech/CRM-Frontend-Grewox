import React, { useState } from 'react';
import {
    Card, Typography, Button, Modal, message, Input,
    Dropdown, Menu, Row, Col, Breadcrumb, Space, Select
} from 'antd';
import {
    FiPlus, FiSearch,
    FiChevronDown, FiDownload,
    FiHome, FiFilter
} from 'react-icons/fi';
import './department.scss';
import moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import CreateDepartment from './CreateDepartment';
import { Link } from 'react-router-dom';
import DepartmentList from './DepartmentList';
import { useGetAllDepartmentsQuery } from './services/departmentApi';

const { Title, Text } = Typography;
const { Option } = Select;

const Department = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [filters, setFilters] = useState({
        branch: undefined
    });

    // Fetch departments using RTK Query
    const { data: departmentData, isLoading } = useGetAllDepartmentsQuery({
        search: searchText,
        ...filters
    });

    const handleCreate = () => {
        setIsCreateModalOpen(true);
    };

    const handleEdit = (department) => {
        setSelectedDepartment(department);
        setIsEditModalOpen(true);
    };

    const handleCreateSubmit = () => {
        setIsCreateModalOpen(false);
        message.success('Department created successfully');
    };

    const handleEditSubmit = () => {
        setIsEditModalOpen(false);
        setSelectedDepartment(null);
        message.success('Department updated successfully');
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            branch: undefined
        });
        setSearchText('');
    };

    const exportToExcel = (data) => {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Departments');
        XLSX.writeFile(wb, 'departments_export.xlsx');
    };

    const exportMenu = (
        <Menu>
            <Menu.Item key="excel" onClick={() => exportToExcel(departmentData?.data || [])}>
                Export to Excel
            </Menu.Item>
            <Menu.Item key="pdf" onClick={() => exportToPDF(departmentData?.data || [], 'departments_export')}>
                Export to PDF
            </Menu.Item>
        </Menu>
    );

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
        <div className="department-page">
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
                    <Breadcrumb.Item>Departments</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Departments</Title>
                    <Text type="secondary">Manage all departments in the organization</Text>
                </div>
                <div className="header-actions">
                    <div className="search-filter-group">
                        <Input
                            prefix={<FiSearch style={{ color: '#8c8c8c' }} />}
                            placeholder="Search departments..."
                            allowClear
                            onChange={(e) => setSearchText(e.target.value)}
                            value={searchText}
                            className="search-input"
                            style={{
                                width: '300px',
                                borderRadius: '20px',
                                height: '38px'
                            }}
                        />
                    </div>
                    <div className="action-buttons">
                        <Dropdown overlay={exportMenu} trigger={['click']}>
                            <Button
                                icon={<FiDownload size={16} />}
                                className="export-button"
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
                            Add Department
                        </Button>
                    </div>
                </div>
            </div>

            <Card className="department-table-card">
                <DepartmentList
                    onEdit={handleEdit}
                    searchText={searchText}
                    filters={filters}
                />
            </Card>

            <CreateDepartment
                open={isCreateModalOpen}
                onCancel={() => setIsCreateModalOpen(false)}
                onSubmit={handleCreateSubmit}
            />

            <CreateDepartment
                open={isEditModalOpen}
                onCancel={() => {
                    setIsEditModalOpen(false);
                    setSelectedDepartment(null);
                }}
                onSubmit={handleEditSubmit}
                isEditing={true}
                initialValues={selectedDepartment}
            />
        </div>
    );
};

export default Department;
