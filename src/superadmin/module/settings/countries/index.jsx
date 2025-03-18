import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Card, Typography, Button, Table, Input,
    Dropdown, Menu, Row, Col, Breadcrumb, message, Tag, Tooltip
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
import { useGetAllCountriesQuery } from '../services/settingsApi';
import { setCountries, setCountryLoading, setCountryError } from '../services/settingsSlice';
import { Link } from 'react-router-dom';
import './countries.scss';

const { Title, Text } = Typography;

// Date format helper functions
const formatDate = (date) => moment(date).format('MMM DD, YYYY');
const formatDateTime = (date) => moment(date).format('MMM DD, YYYY HH:mm');

const Countries = () => {
    const dispatch = useDispatch();
    const { list: countries, isLoading, error } = useSelector((state) => state.settings.countries);
    const [viewMode, setViewMode] = useState('table');
    const [searchText, setSearchText] = useState('');
    const [filteredCountries, setFilteredCountries] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);

    const { data, error: queryError, isLoading: queryLoading } = useGetAllCountriesQuery({
        page: currentPage,
        limit: 10
    });

    useEffect(() => {
        if (data) {
            dispatch(setCountries(data));
        }
        if (queryError) {
            dispatch(setCountryError(queryError.message));
        }
        dispatch(setCountryLoading(queryLoading));
    }, [data, queryError, queryLoading, dispatch]);

    useEffect(() => {
        let result = [...countries];
        if (searchText) {
            result = result.filter(country =>
                country.countryName?.toLowerCase().includes(searchText.toLowerCase()) ||
                country.countryCode?.toLowerCase().includes(searchText.toLowerCase()) ||
                country.phoneCode?.includes(searchText)
            );
        }
        setFilteredCountries(result);
    }, [countries, searchText]);

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
            const data = countries.map(country => ({
                'Country Name': country.countryName,
                'Country Code': country.countryCode,
                'Phone Code': country.phoneCode,
                'Created Date': formatDateTime(country.createdAt),
                'Last Updated': formatDateTime(country.updatedAt)
            }));

            switch (type) {
                case 'csv':
                    exportToCSV(data, 'countries_export');
                    break;
                case 'excel':
                    exportToExcel(data, 'countries_export');
                    break;
                case 'pdf':
                    exportToPDF(data, 'countries_export');
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
        XLSX.utils.book_append_sheet(wb, ws, 'Countries');
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

    const columns = [
        {
            title: 'Country Name',
            dataIndex: 'countryName',
            key: 'countryName',
            sorter: (a, b) => a.countryName.localeCompare(b.countryName),
            render: (text) => <Text strong>{text}</Text>
        },
        {
            title: 'Code',
            dataIndex: 'countryCode',
            key: 'countryCode',
            sorter: (a, b) => a.countryCode.localeCompare(b.countryCode),
            render: (text) => <Tag color="blue">{text}</Tag>
        },
        {
            title: 'Phone Code',
            dataIndex: 'phoneCode',
            key: 'phoneCode',
            render: (text) => <Text className="phone-code">{text}</Text>
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

    return (
        <div className="countries-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/superadmin">
                            <FiHome style={{ marginRight: '4px' }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Settings</Breadcrumb.Item>
                    <Breadcrumb.Item>Countries</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Countries</Title>
                    <Text type="secondary">View system countries</Text>
                </div>
                <Row justify="center" className="header-actions-wrapper">
                    <Col xs={24} sm={24} md={20} lg={16} xl={14}>
                        <div className="header-actions">
                            <Input
                                prefix={<FiSearch style={{ color: '#8c8c8c', fontSize: '16px' }} />}
                                placeholder="Search countries..."
                                allowClear
                                onChange={(e) => handleSearch(e.target.value)}
                                value={searchText}
                                className="search-input"
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
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>

            {viewMode === 'card' ? (
                <Row gutter={[16, 16]} className="countries-cards-grid">
                    {filteredCountries.map((country) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={country.countryCode}>
                            <div className="country-card">
                                <div className="country-info">
                                    <div className="country-header">
                                        <div className="country-name">{country.countryName}</div>
                                    </div>
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <span className="info-label">Country Code</span>
                                            <div className="info-value country-code">{country.countryCode}</div>
                                        </div>
                                        <div className="info-item">
                                            <span className="info-label">Phone Code</span>
                                            <div className="info-value phone-code">{country.phoneCode}</div>
                                        </div>
                                    </div>
                                    <div className="country-dates">
                                        <div className="date-item">
                                            <div className="date-label">
                                                <FiCalendar className="date-icon" />
                                                <Text type="secondary">Created</Text>
                                            </div>
                                            <div className="date-value">{formatDate(country.createdAt)}</div>
                                        </div>
                                        <div className="date-item">
                                            <div className="date-label">
                                                <FiClock className="date-icon" />
                                                <Text type="secondary">Updated</Text>
                                            </div>
                                            <div className="date-value">{formatDate(country.updatedAt)}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>
            ) : (
                <div className="countries-table-card">
                    <Table
                        columns={columns}
                        dataSource={filteredCountries}
                        loading={isLoading}
                        rowKey="countryCode"
                        pagination={{
                            current: currentPage,
                            onChange: (page) => setCurrentPage(page),
                            pageSize: 10,
                            showSizeChanger: false,
                            showQuickJumper: false,
                            total: data?.total || 0
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default Countries; 