import React, { useState, useEffect, useRef } from 'react';
import {
    Card, Typography, Button, Modal, message, Input,
    Dropdown, Menu, Row, Col, Breadcrumb, Table, Popover
} from 'antd';
import {
    FiPlus, FiSearch,
    FiChevronDown, FiDownload,
    FiHome, FiFilter
} from 'react-icons/fi';
import './tax.scss';
import moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import CreateTax from './CreateTax';
import TaxList from './TaxList';
import { Link } from 'react-router-dom';
import PageHeader from '../../../../components/PageHeader';
import { useGetAllTaxesQuery, useDeleteTaxMutation } from './services/taxApi';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { confirm } = Modal;

const Tax = () => {
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [selectedTax, setSelectedTax] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(false);
    const searchInputRef = useRef(null);
    const [isMobileMenuVisible, setIsMobileMenuVisible] = useState(false);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [isFilterVisible, setIsFilterVisible] = useState(false);

    const { data: taxesData, isLoading, error } = useGetAllTaxesQuery();
    const [deleteTax] = useDeleteTaxMutation();

    const filteredTaxes = React.useMemo(() => {
        if (!taxesData?.data) return [];
        
        const searchTerm = searchText.toLowerCase().trim();
        if (!searchTerm) return taxesData.data;
        
        return taxesData.data.filter(tax => 
            tax.gstName?.toLowerCase().includes(searchTerm)
        );
    }, [taxesData, searchText]);

    const handleAddTax = () => {
        setSelectedTax(null);
        setIsEditing(false);
        setIsFormVisible(true);
    };

    const handleEditTax = (tax) => {
        setSelectedTax(tax);
        setIsEditing(true);
        setIsFormVisible(true);
    };

    const handleViewTax = (tax) => {
        setSelectedTax(tax);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: 'Delete Confirmation',
            content: 'Are you sure you want to delete this tax?',
            okType: 'danger',
            bodyStyle: { padding: '20px' },
            cancelText: 'No',
            onOk: async () => {
                try {
                    await deleteTax(record.id).unwrap();
                    message.success('Tax deleted successfully');
                } catch (error) {
                    message.error(error?.data?.message || 'Failed to delete tax');
                }
            },
        });
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (isEditing) {
                const updatedTaxes = taxesData.data.map(t =>
                    t.id === selectedTax.id ? { ...t, ...formData } : t
                );
                message.success('Tax updated successfully');
            } else {
                const newTax = {
                    id: Date.now(),
                    ...formData,
                    created_at: new Date().toISOString(),
                };
                message.success('Tax created successfully');
            }
            setIsFormVisible(false);
        } catch (error) {
            message.error('Operation failed');
        }
    };

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const exportMenuItems = [
        { key: 'csv', label: 'Export as CSV', icon: <FiDownload />, onClick: () => handleExport('csv') },
        { key: 'excel', label: 'Export as Excel', icon: <FiDownload />, onClick: () => handleExport('excel') },
        { key: 'pdf', label: 'Export as PDF', icon: <FiDownload />, onClick: () => handleExport('pdf') },
    ];

    const handleExport = async (type) => {
        try {
            setLoading(true);
            const data = taxesData.data.map(tax => ({
                'Tax Name': tax.gstName,
                'Percentage': `${tax.gstPercentage}%`,
                'Status': tax.isActive ? 'Active' : 'Inactive',
                'Created Date': moment(tax.created_at).format('YYYY-MM-DD')
            }));

            switch (type) {
                case 'csv':
                    exportToCSV(data, 'taxes_export');
                    break;
                case 'excel':
                    exportToExcel(data, 'taxes_export');
                    break;
                case 'pdf':
                    exportToPDF(data, 'taxes_export');
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
        XLSX.utils.book_append_sheet(wb, ws, 'Taxes');
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

    const searchContent = (
        <div className="search-popup">
            <Input
                prefix={<FiSearch style={{ color: "#8c8c8c" }} />}
                placeholder="Search taxes..."
                allowClear
                onChange={(e) => setSearchText(e.target.value)}
                value={searchText}
                className="search-input"
                autoFocus
            />
        </div>
    );

    const filterMenu = (
        <Menu className="filter-menu">
            <Menu.Item key="export" className="filter-menu-item">
                <div className="filter-section">
                    <Dropdown menu={{ items: exportMenuItems }} trigger={['click']}>
                        <Button className="export-button">
                            <FiDownload size={16} />
                            Export
                        </Button>
                    </Dropdown>
                </div>
            </Menu.Item>
        </Menu>
    );

    const breadcrumbItems = [
        {
            title: (
                <Link to="/dashboard">
                    <FiHome style={{ marginRight: '4px' }} />
                    Home
                </Link>
            ),
        },
        {
            title: <Link to="/dashboard/settings">Settings</Link>
        },
        { title: 'Tax' },
    ];

    return (
        <div className="tax-page">
            <PageHeader
                title="Tax"
                subtitle="Manage all taxes in the organization"
                breadcrumbItems={breadcrumbItems}
                searchText={searchText}
                onSearch={handleSearch}
                searchPlaceholder="Search by GST name..."
                exportMenu={{
                    items: [
                        { key: 'csv', label: 'Export as CSV', icon: <FiDownload />, onClick: () => handleExport('csv') },
                        { key: 'excel', label: 'Export as Excel', icon: <FiDownload />, onClick: () => handleExport('excel') },
                        { key: 'pdf', label: 'Export as PDF', icon: <FiDownload />, onClick: () => handleExport('pdf') }
                    ]
                }}
                onAdd={handleAddTax}
                addText="Add Tax"
                mobileSearchContent={searchContent}
                isSearchVisible={isSearchVisible}
                onSearchVisibleChange={setIsSearchVisible}
            />

            <Card className="tax-table-card">
                <TaxList
                    taxes={filteredTaxes}
                    loading={isLoading}
                    onEdit={handleEditTax}
                    onDelete={handleDelete}
                    onView={handleViewTax}
                    searchText={searchText}
                />
            </Card>

            <CreateTax
                open={isFormVisible}
                onCancel={() => setIsFormVisible(false)}
                onSubmit={handleFormSubmit}
                isEditing={isEditing}
                initialValues={selectedTax}
                loading={isLoading}
            />
        </div>
    );
};

export default Tax;
