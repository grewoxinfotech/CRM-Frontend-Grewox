import React, { useState, useEffect } from 'react';
import {
    Card, Typography, Button, Modal, message, Input,
    Dropdown, Menu, Row, Col, Breadcrumb, Space, Select, Popover
} from 'antd';
import {
    FiPlus, FiSearch,
    FiDownload, FiHome,
    FiChevronDown, FiFilter
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import VendorList from './VendorList';
import CreateVendor from './CreateVendor';
import EditVendor from './EditVendor';
import './vendor.scss';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import dayjs from 'dayjs';
import { useGetVendorsQuery, useDeleteVendorMutation } from './services/vendorApi';

const { Title, Text } = Typography;
const { Option } = Select;

const Vendor = () => {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        status: undefined,
        country: undefined
    });
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });

    const { data: vendors, isLoading, refetch } = useGetVendorsQuery({
        page: pagination.current,
        pageSize: pagination.pageSize,
        search: searchText,
        ...filters
    });
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    const [deleteVendor] = useDeleteVendorMutation();

    // Update pagination when data changes
    useEffect(() => {
        if (vendors?.pagination) {
            setPagination(prev => ({
                ...prev,
                total: vendors.pagination.total
            }));
        }
    }, [vendors]);

    const handleTableChange = (newPagination, filters, sorter) => {
        setPagination(prev => ({
            ...prev,
            current: newPagination.current,
            pageSize: newPagination.pageSize
        }));
    };

    const handleCreate = () => {
        setSelectedVendor(null);
        setIsCreateModalOpen(true);
    };

    const handleEdit = (record) => {
        setSelectedVendor(record);
        setIsEditModalOpen(true);
    };

    const handleDelete = async (recordOrIds) => {
        const ids = Array.isArray(recordOrIds) ? recordOrIds : [recordOrIds.id];

        Modal.confirm({
            title: `Are you sure you want to delete ${ids.length > 1 ? 'these vendors' : 'this vendor'}?`,
            content: 'This action cannot be undone.',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    const promises = ids.map(id => deleteVendor(id).unwrap());
                    await Promise.all(promises);
                    message.success(`Successfully deleted ${ids.length} vendor${ids.length > 1 ? 's' : ''}`);
                    refetch();
                } catch (error) {
                    console.error('Delete Error:', error);
                    message.error('Failed to delete vendor(s)');
                }
            }
        });
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            status: undefined,
            country: undefined
        });
        setSearchText('');
    };

    const handleExport = async (type) => {
        try {
            if (!vendors?.data || vendors.data.length === 0) {
                message.warning('No data available to export');
                return;
            }

            const data = vendors.data.map(vendor => ({
                'Name': vendor.name,
                'Contact': vendor.contact,
                'Email': vendor.email,
                'Address': vendor.address,
                'City': vendor.city,
                'State': vendor.state,
                'Country': vendor.country,
                'Status': vendor.status || 'Active',
                'Created At': dayjs(vendor.createdAt).format('YYYY-MM-DD')
            }));

            const timestamp = dayjs().format('YYYY-MM-DD_HH-mm');
            const filename = `vendors_export_${timestamp}`;

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
        XLSX.utils.book_append_sheet(wb, ws, 'Vendors');
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

    const exportMenu = (
        <Menu>
            <Menu.Item key="excel" icon={<FiDownload />} onClick={() => handleExport('excel')}>
                Export as Excel
            </Menu.Item>
            <Menu.Item key="pdf" icon={<FiDownload />} onClick={() => handleExport('pdf')}>
                Export as PDF
            </Menu.Item>
            <Menu.Item key="csv" icon={<FiDownload />} onClick={() => handleExport('csv')}>
                Export as CSV
            </Menu.Item>
        </Menu>
    );

    const searchContent = (
        <div className="search-popup">
            <Input
                prefix={<FiSearch style={{ color: "#8c8c8c" }} />}
                placeholder="Search vendors..."
                allowClear
                onChange={(e) => setSearchText(e.target.value)}
                value={searchText}
                className="search-input"
                autoFocus
            />
        </div>
    );

    return (
        <div className="vendor-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/dashboard">
                            <FiHome style={{ marginRight: '4px' }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <Link to="/dashboard/purchase">Purchase</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Vendors</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Vendors</Title>
                    <Text className="page-description" type="secondary">Manage all vendors in the organization</Text>
                </div>
                <div className="header-actions">
                    <div className="desktop-actions">
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div className="search-container">
                                <Input
                                    prefix={<FiSearch style={{ color: "#8c8c8c" }} />}
                                    placeholder="Search vendors..."
                                    allowClear
                                    onChange={(e) => setSearchText(e.target.value)}
                                    value={searchText}
                                    className="search-input"
                                />
                                <Popover
                                    content={searchContent}
                                    trigger="click"
                                    open={isSearchVisible}
                                    onOpenChange={setIsSearchVisible}
                                    placement="bottomRight"
                                    className="mobile-search-popover"
                                >
                                    <Button
                                        className="search-icon-button"
                                        icon={<FiSearch size={16} />}
                                    />
                                </Popover>
                            </div>
                            {/* <Button
                                icon={<FiFilter />}
                                onClick={() => setShowFilters(!showFilters)}
                                className={showFilters ? 'filter-button active' : 'filter-button'}
                            >
                                <span className="button-text">Filters</span>
                            </Button> */}
                            <Dropdown overlay={exportMenu} trigger={['click']}>
                                <Button className="export-button">
                                    <FiDownload size={16} />
                                    <span className="button-text">Export</span>
                                </Button>
                            </Dropdown>
                            <Button
                                type="primary"
                                icon={<FiPlus size={16} />}
                                onClick={handleCreate}
                                className="add-button"
                            >
                                <span className="button-text">Add Vendor</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* {showFilters && (
                <Card className="filter-card">
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <Select
                                placeholder="Filter by status"
                                style={{ width: '100%' }}
                                allowClear
                                value={filters.status}
                                onChange={(value) => handleFilterChange('status', value)}
                            >
                                <Option value="active">Active</Option>
                                <Option value="inactive">Inactive</Option>
                            </Select>
                        </Col>
                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <Select
                                placeholder="Filter by country"
                                style={{ width: '100%' }}
                                allowClear
                                value={filters.country}
                                onChange={(value) => handleFilterChange('country', value)}
                            >
                                {Array.from(new Set(vendors?.data?.map(v => v.country) || [])).map(country => (
                                    <Option key={country} value={country}>{country}</Option>
                                ))}
                            </Select>
                        </Col>
                        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
                            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                                <Button type="primary" onClick={clearFilters}>
                                    Clear Filters
                                </Button>
                            </Space>
                        </Col>
                    </Row>
                </Card>
            )} */}

            <VendorList
                searchText={searchText}
                onEdit={handleEdit}
                onDelete={handleDelete}
                loading={isLoading}
                data={vendors}
                pagination={pagination}
                onChange={handleTableChange}
            />

            <CreateVendor
                open={isCreateModalOpen}
                onCancel={() => setIsCreateModalOpen(false)}
            />

            <EditVendor
                open={isEditModalOpen}
                onCancel={() => {
                    setIsEditModalOpen(false);
                    setSelectedVendor(null);
                }}
                initialValues={selectedVendor}
            />
        </div>
    );
};

export default Vendor;
