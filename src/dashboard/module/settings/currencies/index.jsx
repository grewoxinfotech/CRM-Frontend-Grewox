import React, { useState } from 'react';
import {
    Card, Typography, Button, Table, Input,
    Dropdown, Menu, Row, Col, Breadcrumb, message, Tag, Tooltip, Space, Popover
} from 'antd';
import {
    FiSearch, FiChevronDown,
    FiDownload, FiGrid, FiList, FiHome,
    FiCalendar, FiClock
} from 'react-icons/fi';
import moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useGetAllCurrenciesQuery, useSetDefaultCurrencyMutation } from '../services/settingsApi';
import { Link } from 'react-router-dom';
import PageHeader from '../../../../components/PageHeader';
import { FiCheckCircle, FiMoreVertical } from 'react-icons/fi';
import { Badge } from 'antd';
import './currencies.scss';

const { Title, Text } = Typography;

// Date format helper functions
const formatDate = (date) => moment(date).format('MMM DD, YYYY');
const formatDateTime = (date) => moment(date).format('MMM DD, YYYY HH:mm');

const Currencies = () => {
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isSearchVisible, setIsSearchVisible] = useState(false);

    const { data: currencies = [], error, isLoading } = useGetAllCurrenciesQuery({
        page: currentPage,
        limit: 10
    });

    const [setDefaultCurrency, { isLoading: isSettingDefault }] = useSetDefaultCurrencyMutation();

    const handleSetDefault = async (id) => {
        try {
            await setDefaultCurrency(id).unwrap();
            message.success('Default currency updated successfully');
        } catch (err) {
            message.error(err?.data?.message || 'Failed to update default currency');
        }
    };

    const filteredCurrencies = searchText
        ? currencies.filter(currency =>
            currency.currencyName?.toLowerCase().includes(searchText.toLowerCase()) ||
            currency.currencyCode?.toLowerCase().includes(searchText.toLowerCase()) ||
            currency.currencyIcon?.includes(searchText)
        )
        : currencies;

    const handleTableChange = (pagination) => {
        setCurrentPage(pagination.current);
    };

    const handleSearch = (value) => {
        setSearchText(value);
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

    const handleExport = (type) => {
        try {
            const data = currencies.map(currency => ({
                'Currency Name': currency.currencyName,
                'Currency Code': currency.currencyCode,
                'Currency Symbol': currency.currencyIcon,
                'Created Date': formatDateTime(currency.createdAt),
                'Last Updated': formatDateTime(currency.updatedAt)
            }));

            switch (type) {
                case 'csv':
                    exportToCSV(data, 'currencies_export');
                    break;
                case 'excel':
                    exportToExcel(data, 'currencies_export');
                    break;
                case 'pdf':
                    exportToPDF(data, 'currencies_export');
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
        XLSX.utils.book_append_sheet(wb, ws, 'Currencies');
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
                placeholder="Search currencies..."
                allowClear
                onChange={(e) => setSearchText(e.target.value)}
                value={searchText}
                className="search-input"
                autoFocus
            />
        </div>
    );

    const columns = [
        {
            title: 'Currency Name',
            dataIndex: 'currencyName',
            key: 'currencyName',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                  <Input
                    placeholder="Search currency name"
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => confirm()}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                  />
                  <Space>
                    <Button
                      type="primary"
                      onClick={() => confirm()}
                      size="small"
                      style={{ width: 90 }}
                    >
                      Filter
                    </Button>
                    <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
                      Reset
                    </Button>
                  </Space>
                </div>
              ),
              onFilter: (value, record) =>
                record.currencyName.toLowerCase().includes(value.toLowerCase()) ||
                record.currencyCode?.toLowerCase().includes(value.toLowerCase()),
            render: (text, record) => (
                <Space>
                    <Text strong>{text}</Text>
                    {record.isDefault && (
                        <Tag color="green" icon={<FiCheckCircle />} style={{ borderRadius: '4px' }}>
                            Default
                        </Tag>
                    )}
                </Space>
            )
        },
        {
            title: 'Code',
            dataIndex: 'currencyCode',
            key: 'currencyCode',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                  <Input
                    placeholder="Search currency code"
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => confirm()}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                  />
                  <Space>
                    <Button
                      type="primary"
                      onClick={() => confirm()}
                      size="small"
                      style={{ width: 90 }}
                    >
                      Filter
                    </Button>
                    <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
                      Reset
                    </Button>
                  </Space>
                </div>
              ),
              onFilter: (value, record) =>
                record.currencyCode.toLowerCase().includes(value.toLowerCase()),
            render: (text) => <Tag color="blue">{text}</Tag>
        },
        {
            title: 'Symbol',
            dataIndex: 'currencyIcon',
            key: 'currencyIcon',
            sorter: (a, b) => a.currencyIcon.localeCompare(b.currencyIcon),
            render: (text) => <Text className="currency-symbol">{text}</Text>
        },
        {
            title: 'Status',
            key: 'status',
            render: (_, record) => (
                record.isDefault ? (
                    <Badge status="success" text="Active Default" />
                ) : (
                    <Button 
                        type="link" 
                        size="small" 
                        onClick={() => handleSetDefault(record.id)}
                        loading={isSettingDefault}
                        style={{ padding: 0 }}
                    >
                        Set as Default
                    </Button>
                )
            )
        },
        {
            title: 'Created',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => (
                <Tooltip title={formatDateTime(date)}>
                    <div className="date-cell">
                        <FiCalendar className="date-icon" />
                        <Text>{formatDate(date)}</Text>
                    </div>
                </Tooltip>
            ),
            sorter: (a, b) => moment(a.createdAt).unix() - moment(b.createdAt).unix(),
        },
        {
            title: 'Last Updated',
            dataIndex: 'updatedAt',
            key: 'updatedAt',
            render: (date) => (
                <Tooltip title={formatDateTime(date)}>
                    <div className="date-cell">
                        <FiClock className="date-icon" />
                        <Text>{formatDate(date)}</Text>
                    </div>
                </Tooltip>
            ),
            sorter: (a, b) => moment(a.updatedAt).unix() - moment(b.updatedAt).unix(),
        }
    ];

    if (error) {
        message.error('Failed to load currencies');
    }

    const breadcrumbItems = [
        {
            title: (
                <Link to="/superadmin">
                    <FiHome style={{ marginRight: '4px' }} />
                    Home
                </Link>
            ),
        },
        { title: 'Settings' },
        { title: 'Currencies' },
    ];

    return (
        <div className="currencies-page">
            <PageHeader
                title="Currencies"
                subtitle="View system currencies"
                breadcrumbItems={breadcrumbItems}
                searchText={searchText}
                onSearch={handleSearch}
                searchPlaceholder="Search currencies..."
                exportMenu={{
                    items: [
                        { key: 'csv', label: 'Export as CSV', icon: <FiDownload />, onClick: () => handleExport('csv') },
                        { key: 'excel', label: 'Export as Excel', icon: <FiDownload />, onClick: () => handleExport('excel') },
                        { key: 'pdf', label: 'Export as PDF', icon: <FiDownload />, onClick: () => handleExport('pdf') }
                    ]
                }}
                mobileSearchContent={searchContent}
                isSearchVisible={isSearchVisible}
                onSearchVisibleChange={setIsSearchVisible}
            />

            <Card className="currencies-table-card">
                <div className="table-scroll-wrapper">
                    <Table
                        dataSource={filteredCurrencies}
                        columns={columns}
                        loading={isLoading}
                        onChange={handleTableChange}
                        pagination={{
                            current: currentPage,
                            pageSize: 10,
                            total: currencies.length,
                            showSizeChanger: false
                        }}
                        rowKey="id"
                        scroll={{ x: 1000, y: '' }}
                    />
                </div>
            </Card>
        </div>
    );
};

export default Currencies;
