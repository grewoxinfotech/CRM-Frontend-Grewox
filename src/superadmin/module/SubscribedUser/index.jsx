import React, { useState, useEffect, useRef } from 'react';
import {
    Card, Typography, Button, Modal, message, Input,
    Dropdown, Menu, Row, Col, Breadcrumb, Table, DatePicker, Popover
} from 'antd';
import {
    FiPlus, FiSearch,
    FiChevronDown, FiDownload,
    FiHome, FiCalendar, FiFilter
} from 'react-icons/fi';
import './SubscribedUser.scss';
import moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import SubscribedUserList from './SubscribedUserList';
import { Link } from 'react-router-dom';
import { useGetAllSubscribedUsersQuery } from './services/SubscribedUserApi';

const { Title, Text } = Typography;
const { confirm } = Modal;
const { RangePicker } = DatePicker;

const SubscribedUser = () => {
    const [searchText, setSearchText] = useState('');
    const [dateRange, setDateRange] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const searchInputRef = useRef(null);

    const { data: subscribedUsersData, isLoading, error } = useGetAllSubscribedUsersQuery();

    const filteredUsers = React.useMemo(() => {
        if (!subscribedUsersData?.data) return [];
        
        const searchTerm = searchText.toLowerCase().trim();
        
        return subscribedUsersData.data.filter(user => {
            const matchesSearch = !searchTerm || 
                (user.client_name?.toLowerCase() || '').includes(searchTerm) ||
                (user.plan_name?.toLowerCase() || '').includes(searchTerm) ||
                String(user.current_clients_count || '').includes(searchTerm) ||
                String(user.current_storage_used || '').includes(searchTerm) ||
                String(user.current_users_count || '').includes(searchTerm) ||
                (user.payment_status?.toLowerCase() || '').includes(searchTerm) ||
                (user.status?.toLowerCase() || '').includes(searchTerm);

            const matchesDateRange = !dateRange?.length || (
                moment(user.start_date).isSameOrAfter(dateRange[0], 'day') &&
                moment(user.end_date).isSameOrBefore(dateRange[1], 'day')
            );

            return matchesSearch && matchesDateRange;
        });
    }, [subscribedUsersData?.data, searchText, dateRange]);

    const handleSearch = (value) => {
        setSearchText(value);
    };

    const exportMenu = {
        items: [
            {
                key: 'csv',
                icon: <FiDownload />,
                label: 'Export as CSV',
                onClick: () => handleExport('csv')
            },
            {
                key: 'excel',
                icon: <FiDownload />,
                label: 'Export as Excel',
                onClick: () => handleExport('excel')
            },
            {
                key: 'pdf',
                icon: <FiDownload />,
                label: 'Export as PDF',
                onClick: () => handleExport('pdf')
            }
        ]
    };

    const handleExport = async (type) => {
        try {
            setLoading(true);
            if (!subscribedUsersData?.data || subscribedUsersData.data.length === 0) {
                message.warning('No data to export');
                return;
            }

            const data = subscribedUsersData.data.map(user => ({
                'Client Name': user.client_name,
                'Plan Name': user.plan_name,
                'Total Client Count': user.current_clients_count,
                'Total Storage Used': `${user.current_storage_used} GB`,
                'Total Users Count': user.current_users_count,
                'Payment Status': user.payment_status,
                'Status': user.status,
                'Start Date': moment(user.start_date).format('DD-MM-YYYY'),
                'End Date': moment(user.end_date).format('DD-MM-YYYY')
            }));

            switch (type) {
                case 'csv':
                    exportToCSV(data, 'subscribed_users_export');
                    break;
                case 'excel':
                    exportToExcel(data, 'subscribed_users_export');
                    break;
                case 'pdf':
                    exportToPDF(data, 'subscribed_users_export');
                    break;
                default:
                    break;
            }
            message.success(`Successfully exported as ${type.toUpperCase()}`);
        } catch (error) {
            console.error('Export error:', error);
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
        XLSX.utils.book_append_sheet(wb, ws, 'Subscribed Users');
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
                placeholder="Search by client name, plan, status..."
                allowClear
                onChange={(e) => handleSearch(e.target.value)}
                value={searchText}
                className="search-input"
                autoFocus
            />
        </div>
    );

    const filterMenu = (
        <Menu className="filter-menu">
            <Menu.Item key="date" className="filter-menu-item">
                <div className="filter-section">
                    <RangePicker
                        onChange={(dates) => setDateRange(dates)}
                        value={dateRange}
                        allowClear
                        placeholder={['Start Date', 'End Date']}
                    />
                </div>
            </Menu.Item>
            <Menu.Item key="export" className="filter-menu-item">
                <div className="filter-section">
                    <Dropdown menu={exportMenu} trigger={['click']}>
                        <Button className="export-button">
                            <FiDownload size={16} />
                            Export
                        </Button>
                    </Dropdown>
                </div>
            </Menu.Item>
        </Menu>
    );

    return (
        <div className="subscribed-user-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/dashboard">
                            <FiHome style={{ marginRight: '4px' }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <Link to="/dashboard/users">Users</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Subscribed Users</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="header-content">
                    <div className="page-title">
                        <div className="title-row">
                            <div className="title-column">
                                <Title level={2}>Subscribed Users</Title>
                                <Text type="secondary">Manage all subscribed users</Text>
                            </div>
                            <div className="mobile-actions">
                                <Popover
                                    content={searchContent}
                                    trigger="click"
                                    open={isSearchVisible}
                                    onOpenChange={setIsSearchVisible}
                                    placement="bottomRight"
                                    overlayClassName="search-popover"
                                    getPopupContainer={(triggerNode) => triggerNode.parentNode}
                                >
                                    <Button
                                        icon={<FiSearch size={18} />}
                                        className="mobile-search-button"
                                    />
                                </Popover>
                                <Dropdown
                                    overlay={filterMenu}
                                    trigger={['click']}
                                    open={isFilterVisible}
                                    onOpenChange={setIsFilterVisible}
                                    placement="bottomRight"
                                    getPopupContainer={(triggerNode) => triggerNode.parentNode}
                                >
                                    <Button
                                        icon={<FiFilter size={18} />}
                                        className="mobile-filter-button"
                                    />
                                </Dropdown>
                            </div>
                        </div>
                    </div>

                    <div className="header-actions">
                        <div className="desktop-actions">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                                <div className="search-container" style={{ flex: 1 }}>
                                    <Input
                                        prefix={<FiSearch style={{ color: '#8c8c8c' }} />}
                                        placeholder="Search by client name, plan, status..."
                                        allowClear
                                        onChange={(e) => handleSearch(e.target.value)}
                                        value={searchText}
                                        ref={searchInputRef}
                                        className="search-input"
                                    />
                                </div>
                                <div className="date-picker-container" style={{ flex: 1 }}>
                                    <RangePicker
                                        suffixIcon={<FiCalendar style={{ color: '#8c8c8c', fontSize: '16px' }} />}
                                        onChange={(dates) => setDateRange(dates)}
                                        value={dateRange}
                                        allowClear
                                        style={{ width: '100%', height: '40px' }}
                                        placeholder={['Start Date', 'End Date']}
                                    />
                                </div>
                                <div className="action-buttons-group">
                                    <Dropdown 
                                        menu={exportMenu} 
                                        trigger={['click']}
                                        disabled={loading || !subscribedUsersData?.data?.length}
                                   
                                    >
                                        <Button className="export-button" loading={loading}>
                                            <FiDownload size={16} />
                                            <span className="button-text">Export</span>
                                        </Button>
                                    </Dropdown>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Card className="user-table-card">
                <SubscribedUserList 
                    data={filteredUsers}
                    loading={isLoading}
                />
            </Card>
        </div>
    );
};

export default SubscribedUser;
