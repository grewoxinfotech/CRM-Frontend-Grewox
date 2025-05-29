import React, { useState } from 'react';
import {
    Card,
    Typography,
    Button,
    Input,
    Dropdown,
    Menu,
    Row,
    Col,
    Breadcrumb,
    message,
    Popover
} from 'antd';
import {
    SearchOutlined,
    DownloadOutlined,
    UnorderedListOutlined,
    AppstoreOutlined,
    HomeOutlined
} from '@ant-design/icons';
import './Storage.scss';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import StorageList from './StorageList';
import StorageCard from './StorageCard';
import StorageStats from './StorageStats';
import { Link } from 'react-router-dom';
import { useGetClientStorageQuery } from './services/storageApi';
import { FiDownload } from 'react-icons/fi';

const { Title, Text } = Typography;

const Storage = () => {
    const [searchText, setSearchText] = useState('');
    const [viewMode, setViewMode] = useState('table');
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const { data: storageData, isLoading } = useGetClientStorageQuery();

    const handleExport = async (type) => {
        try {
            if (!storageData?.data?.clientsStorage) {
                message.error('No data available to export');
                return;
            }

            const data = storageData.data.clientsStorage.map(client => ({
                'Client Name': client.clientName !== "null null" ? client.clientName : client.username,
                'Total Files': client.totalFiles || 0,
                'Storage Size': client.totalSize || '0 MB',
                'Storage Path': client.s3Path || ''
            }));

            switch (type) {
                case 'excel':
                    const ws = XLSX.utils.json_to_sheet(data);
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, 'Storage');
                    XLSX.writeFile(wb, 'storage_export.xlsx');
                    break;
                case 'pdf':
                    const doc = new jsPDF();
                    doc.autoTable({
                        head: [Object.keys(data[0])],
                        body: data.map(item => Object.values(item)),
                        margin: { top: 20 },
                        styles: { fontSize: 8 }
                    });
                    doc.save('storage_export.pdf');
                    break;
                default:
                    break;
            }
            message.success(`Successfully exported as ${type.toUpperCase()}`);
        } catch (error) {
            message.error(`Failed to export: ${error.message}`);
        }
    };

    const exportMenuItems = [
        {
            key: "excel",
            icon: <FiDownload />,
            label: "Export as Excel",
            onClick: () => handleExport("excel")
        },
        {
            key: "pdf",
            icon: <FiDownload />,
            label: "Export as PDF",
            onClick: () => handleExport("pdf")
        }
    ];

    const searchContent = (
        <div className="search-popup">
            <Input
                prefix={<SearchOutlined style={{ color: "#8c8c8c" }} />}
                placeholder="Search storage..."
                allowClear
                onChange={(e) => setSearchText(e.target.value)}
                value={searchText}
                className="search-input"
                autoFocus
            />
        </div>
    );

    return (
        <div className="storage-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/superadmin">
                            <HomeOutlined style={{ marginRight: "4px" }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Storage</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="header-content">
                    <div className="page-title">
                        <div className="title-row">
                            <div className="page-title-content">
                                <Title level={2}>Storage</Title>
                                <Text type="secondary">Manage storage usage across all companies</Text>
                            </div>
                            <div className="header-actions">
                                <div className="desktop-actions">
                                    <div className="action-buttons">
                                        <Button.Group className="view-toggle">
                                            <Button
                                                type={viewMode === 'table' ? 'primary' : 'default'}
                                                icon={<UnorderedListOutlined size={16} />}
                                                onClick={() => setViewMode('table')}
                                            />
                                            <Button
                                                type={viewMode === 'card' ? 'primary' : 'default'}
                                                icon={<AppstoreOutlined size={16} />}
                                                onClick={() => setViewMode('card')}
                                            />
                                        </Button.Group>
                                    </div>

                                    <div style={{ display: "flex", alignItems: "center", gap: "12px", width: "100%" }}>
                                        <div className="search-container" style={{ flex: 1 }}>
                                            <Input
                                                prefix={<SearchOutlined style={{ color: '#8c8c8c' }} />}
                                                placeholder="Search storage..."
                                                allowClear
                                                onChange={(e) => setSearchText(e.target.value)}
                                                value={searchText}
                                                className="search-input"
                                            />
                                        </div>
                                        <div className="action-buttons-group">
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
                                                    icon={<SearchOutlined size={16} />}
                                                />
                                            </Popover>
                                            <Dropdown menu={{ items: exportMenuItems }} trigger={["click"]}>
                                                <Button className="export-button">
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
                </div>
            </div>

            <StorageStats data={storageData?.data?.clientsStorage} />

            <Card className="policy-table-card">
                {viewMode === 'table' ? (
                    <StorageList
                        data={storageData?.data?.clientsStorage}
                        searchText={searchText}
                        loading={isLoading}
                    />
                ) : (
                    <StorageCard
                        data={storageData?.data?.clientsStorage}
                        searchText={searchText}
                        loading={isLoading}
                    />
                )}
            </Card>
        </div>
    );
};

export default Storage;
