
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

const SubscribedUser = () => {
    const [searchText, setSearchText] = useState('');
    const searchInputRef = useRef(null);

    const { data: subscribedUsersData, isLoading, error } = useGetAllSubscribedUsersQuery();

    const filteredUsers = React.useMemo(() => {
        if (!subscribedUsersData?.data) return [];
        
        return subscribedUsersData.data.filter(user => {
            if (!searchText) return true;
            
            const searchTerm = searchText.toLowerCase();
            return (
                user.name?.toLowerCase().includes(searchTerm) ||
                user.email?.toLowerCase().includes(searchTerm)
            );
        });
    }, [subscribedUsersData, searchText]);


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
            const data = subscribedUsersData.data.map(user => ({
                'Name': user.name,
                'Email': user.email,
                'Created Date': moment(user.created_at).format('YYYY-MM-DD')
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
                <div className="page-title">
                    <Title level={2}>Subscribed Users</Title>
                    <Text type="secondary">Manage all subscribed users</Text>
                </div>
                <div className="header-actions">
                    <Input
                        prefix={<FiSearch style={{ color: '#8c8c8c', fontSize: '16px' }} />}
                        placeholder="Search users..."
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

            <Card className="user-table-card">
                <SubscribedUserList />
            </Card>
        </div>
    );
};

export default SubscribedUser;
