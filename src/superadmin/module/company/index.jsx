import React, { useState, useEffect, useRef } from 'react';
import {
    Typography,
    Button,
    Modal,
    message,
    Input,
    Dropdown,
    Menu,
    Row,
    Col,
    Breadcrumb,
    Card,
    Table,
    Pagination
} from 'antd';
import {
    FiPlus,
    FiSearch,
    FiChevronDown,
    FiDownload,
    FiGrid,
    FiList,
    FiHome,
    FiX
} from 'react-icons/fi';
import './company.scss';
import moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import CreateCompany from './createCompany';
import CompanyCard from './CompanyCard';
import CompanyList from './CompanyList';
import { useGetAllCompaniesQuery, useDeleteCompanyMutation } from './services/companyApi';
import { Link } from 'react-router-dom';
import EditCompany from './EditCompany';

const { Title, Text } = Typography;

const Company = () => {
    // States
    const [filters, setFilters] = useState({ search: '', page: 1, limit: 10 });
    const [viewMode, setViewMode] = useState('table');
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const searchInputRef = useRef(null);

    // Get companies with pagination and search
    const { data: companiesData, isLoading: isLoadingCompanies, isFetching } = useGetAllCompaniesQuery(filters);

    const [deleteCompany, { isLoading: isDeleting }] = useDeleteCompanyMutation();

    // Filter companies based on search
    const filteredCompanies = React.useMemo(() => {
        if (!companiesData?.data) return [];

        const searchTerm = filters.search.toLowerCase().trim();
        if (!searchTerm) return companiesData.data;

        return companiesData.data.filter(company =>
            company.username?.toLowerCase().includes(searchTerm) ||
            company.email?.toLowerCase().includes(searchTerm) ||
            company.phone?.toLowerCase().includes(searchTerm) ||
            `${company.firstName || ''} ${company.lastName || ''}`.toLowerCase().includes(searchTerm)
        );
    }, [companiesData, filters.search]);

    // Handle search
    const handleSearch = (e) => {
        const value = e.target.value;
        setFilters(prev => ({
            ...prev,
            search: value,
            page: 1 // Reset to first page when searching
        }));
    };

    // Handle pagination change
    const handlePageChange = (pagination) => {
        setFilters(prev => ({
            ...prev,
            page: pagination.current,
            limit: pagination.pageSize
        }));
    };

    // Handlers
    const handleAddCompany = () => {
        setSelectedCompany(null);
        setIsEditModalVisible(false);
        setIsFormVisible(true);
    };

    const handleEditCompany = (company) => {
        setSelectedCompany(company);
        setIsEditModalVisible(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: 'Delete Company',
            content: 'Are you sure you want to delete this company?',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            bodyStyle: {
                padding: '20px',
            },
            onOk: async () => {
                try {
                    await deleteCompany(record.id).unwrap();
                    message.success('Company deleted successfully');
                } catch (error) {
                    message.error(error?.data?.message || 'Failed to delete company');
                }
            },
        });
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (selectedCompany) {
                await updateCompany({ id: selectedCompany.id, data: formData }).unwrap();
                message.success('Company updated successfully');
            } else {
                await createCompany(formData).unwrap();
                message.success('Company created successfully');
            }
            setIsFormVisible(false);
        } catch (error) {
            message.error(error?.data?.message || 'Operation failed');
        }
    };

    // Export functions
    const handleExport = async (type) => {
        try {
            setLoading(true);
            const data = companiesData.data.map(company => ({
                'Company Name': company.name,
                'Email': company.email,
                'Phone': company.phone,
                'Status': company.status,
                'Created Date': moment(company.created_at).format('YYYY-MM-DD')
            }));

            switch (type) {
                case 'csv': exportToCSV(data, 'companies_export'); break;
                case 'excel': exportToExcel(data, 'companies_export'); break;
                case 'pdf': exportToPDF(data, 'companies_export'); break;
                default: break;
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
        XLSX.utils.book_append_sheet(wb, ws, 'Companies');
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
            <Menu.Item key="csv" icon={<FiDownload />} onClick={() => handleExport('csv')}>
                Export as CSV
            </Menu.Item>
            <Menu.Item key="excel" icon={<FiDownload />} onClick={() => handleExport('excel')}>
                Export as Excel
            </Menu.Item>
            <Menu.Item key="pdf" icon={<FiDownload />} onClick={() => handleExport('pdf')}>
                Export as PDF
            </Menu.Item>
        </Menu>
    );

    return (
        <div className="company-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/superadmin">
                            <FiHome style={{ marginRight: '4px' }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Company</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Companies</Title>
                    <Text type="secondary">Manage all companies in the system</Text>
                </div>
                <Row justify="center" className="header-actions-wrapper">
                    <Col xs={24} sm={24} md={20} lg={16} xl={14}>
                        <div className="header-actions">
                            <Input
                                ref={searchInputRef}
                                prefix={<FiSearch style={{ color: '#8c8c8c', fontSize: '16px' }} />}
                                placeholder="Search companies..."
                                allowClear
                                onChange={(e) => handleSearch(e)}
                                value={filters.search}
                                className="search-input"
                                size="large"
                            />
                            <div className="action-buttons">
                                <Button.Group className="view-toggle">
                                    <Button
                                        type={viewMode === 'table' ? 'primary' : 'default'}
                                        icon={<FiList size={16} />}
                                        onClick={() => setViewMode('table')}
                                    />
                                    <Button
                                        type={viewMode === 'card' ? 'primary' : 'default'}
                                        icon={<FiGrid size={16} />}
                                        onClick={() => setViewMode('card')}
                                    />
                                </Button.Group>
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
                                    onClick={handleAddCompany}
                                    className="add-button"
                                >
                                    Add Company
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>

            <Card className="company-table-card">
                {viewMode === 'table' ? (
                    <CompanyList
                        companies={{
                            data: filteredCompanies,
                            totalItems: companiesData?.totalItems || 0,
                            currentPage: filters.page,
                            pageSize: filters.limit,
                            totalPages: companiesData?.totalPages || 1
                        }}
                        loading={isLoadingCompanies || isFetching}
                        onEdit={handleEditCompany}
                        onDelete={handleDelete}
                        onPageChange={handlePageChange}
                        searchText={filters.search}
                    />
                ) : (
                    <Row gutter={[16, 16]} className="company-cards-grid">
                        {companiesData?.data?.map(company => (
                            <Col xs={24} sm={12} md={8} lg={6} key={company.id}>
                                <CompanyCard
                                    company={company}
                                    onEdit={handleEditCompany}
                                    onDelete={handleDelete}
                                />
                            </Col>
                        ))}
                        {companiesData?.total > filters.limit && (
                            <Col span={24} style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                                <Pagination
                                    current={companiesData.currentPage}
                                    pageSize={filters.limit}
                                    total={companiesData.total}
                                    showSizeChanger={true}
                                    showQuickJumper={true}
                                    onChange={(page, pageSize) => {
                                        setFilters({ page, pageSize });
                                    }}
                                    onShowSizeChange={(current, size) => {
                                        setFilters({ page: 1, limit: size });
                                    }}
                                    pageSizeOptions={['10', '20', '50', '100']}
                                />
                            </Col>
                        )}
                    </Row>
                )}
            </Card>

            <CreateCompany
                open={isFormVisible}
                onCancel={() => setIsFormVisible(false)}
                onSubmit={handleFormSubmit}
                initialValues={selectedCompany}
                loading={isLoadingCompanies || isDeleting}
            />

            <EditCompany
                visible={isEditModalVisible}
                onCancel={() => {
                    setIsEditModalVisible(false);
                    setSelectedCompany(null);
                }}
                initialValues={selectedCompany}
                loading={isLoadingCompanies}
            />
        </div>
    );
};

export default Company;
