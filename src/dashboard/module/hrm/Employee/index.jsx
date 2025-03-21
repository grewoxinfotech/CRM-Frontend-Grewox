import React, { useState, useEffect, useRef } from 'react';
import {
    Card, Typography, Button, Modal, message, Input,
    Dropdown, Menu, Row, Col, Breadcrumb, Table
} from 'antd';
import {
    FiPlus, FiSearch,
    FiChevronDown, FiDownload,
    FiGrid, FiList, FiHome
} from 'react-icons/fi';
import './Employee.scss';
import moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import EmployeeList from './EmployeeList';
import CreateEmployee from './CreateEmployee';
import { useGetAllEmployeesQuery, useDeleteEmployeeMutation, useCreateEmployeeMutation, useUpdateEmployeeMutation } from './services/employeeApi';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setSelectedEmployee } from './services/employeeSlice';

const { Title, Text } = Typography;

const Employee = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { data: employeesData, isLoading: isLoadingEmployees, refetch } = useGetAllEmployeesQuery({});
    const [deleteEmployee] = useDeleteEmployeeMutation();
    const [createEmployee] = useCreateEmployeeMutation();
    const [updateEmployee] = useUpdateEmployeeMutation();
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [filteredEmployees, setFilteredEmployees] = useState([]);
    const searchInputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);

    useEffect(() => {
        if (employeesData?.data) {
            const transformedData = employeesData.data.map(employee => ({
                id: employee.id,
                name: `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'N/A',
                email: employee.email || 'N/A',
                phone: employee.phone || 'N/A',
                department: employee.department || 'N/A',
                designation: employee.designation || 'N/A',
                status: employee.status || 'active',
                created_at: employee.createdAt || '-'
            }));
            setFilteredEmployees(transformedData);
        }
    }, [employeesData]);

    const handleSearch = (value) => {
        setSearchText(value);
        if (employeesData?.data) {
            const filtered = employeesData.data.filter(employee =>
                employee.firstName?.toLowerCase().includes(value.toLowerCase()) ||
                employee.lastName?.toLowerCase().includes(value.toLowerCase()) ||
                employee.email?.toLowerCase().includes(value.toLowerCase()) ||
                employee.phone?.includes(value) ||
                employee.department?.toLowerCase().includes(value.toLowerCase()) ||
                employee.designation?.toLowerCase().includes(value.toLowerCase())
            );
            setFilteredEmployees(filtered);
        }
    };

    const handleDelete = (employee) => {
        Modal.confirm({
            title: 'Are you sure you want to delete this employee?',
            content: 'This action cannot be undone.',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            bodyStyle: {
                padding: '20px',
            },
            onOk: async () => {
                try {
                    await deleteEmployee(employee.id).unwrap();
                    message.success('Employee deleted successfully');
                    refetch();
                } catch (error) {
                    message.error('Failed to delete employee');
                }
            },
        });
    };

    const handleView = (employee) => {
        dispatch(setSelectedEmployee(employee));
        navigate(`/dashboard/hrm/employee/view/${employee.id}`);
    };

    const handleEdit = (employee) => {
        setEditingEmployee(employee);
        setIsModalOpen(true);
    };

    const handleAddEmployee = () => {
        setEditingEmployee(null);
        setIsModalOpen(true);
    };

    const handleModalCancel = () => {
        setIsModalOpen(false);
        setEditingEmployee(null);
    };

    const handleModalSubmit = async (values) => {
        try {
            if (editingEmployee) {
                await updateEmployee({
                    id: editingEmployee.id,
                    data: values
                }).unwrap();
                message.success('Employee updated successfully');
            } else {
                await createEmployee(values).unwrap();
                message.success('Employee created successfully');
            }
            setIsModalOpen(false);
            setEditingEmployee(null);
            refetch();
        } catch (error) {
            message.error(error?.data?.message || 'Operation failed');
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
            setLoading(true);
            const data = filteredEmployees.map(employee => ({
                'Employee Name': employee.name,
                'Email': employee.email,
                'Phone': employee.phone,
                'Department': employee.department,
                'Designation': employee.designation,
                'Status': employee.status,
                'Created Date': moment(employee.created_at).format('YYYY-MM-DD')
            }));

            switch (type) {
                case 'csv':
                    exportToCSV(data, 'employees_export');
                    break;
                case 'excel':
                    exportToExcel(data, 'employees_export');
                    break;
                case 'pdf':
                    exportToPDF(data, 'employees_export');
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
        XLSX.utils.book_append_sheet(wb, ws, 'Employees');
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
        <div className="employee-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/dashboard">
                            <FiHome style={{ marginRight: '4px' }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Employee</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Employees</Title>
                    <Text type="secondary">Manage all employees in the system</Text>
                </div>
                <Row justify="center" className="header-actions-wrapper">
                    <Col xs={24} sm={24} md={20} lg={16} xl={14}>
                        <div className="header-actions">
                            <Input
                                prefix={<FiSearch style={{ color: '#8c8c8c', fontSize: '16px' }} />}
                                placeholder="Search employees by name, email, phone, or department"
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
                                    onClick={handleAddEmployee}
                                    className="add-button"
                                >
                                    Add Employee
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>

            <Card className="employee-table-card">
                <EmployeeList
                    employees={filteredEmployees}
                    loading={isLoadingEmployees}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onView={handleView}
                />
            </Card>

            <CreateEmployee
                open={isModalOpen}
                onCancel={handleModalCancel}
                onSubmit={handleModalSubmit}
                isEditing={!!editingEmployee}
                initialValues={editingEmployee}
            />
        </div>
    );
};

export default Employee;
