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
import { FiHome, FiDownload, FiList, FiGrid, FiCalendar } from 'react-icons/fi';
import PageHeader from '../../../components/PageHeader';
import './Storage.scss';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import StorageList from './StorageList';
import StorageCard from './StorageCard';
import StorageStats from './StorageStats';
import { Link } from 'react-router-dom';
import { useGetClientStorageQuery } from './services/storageApi';

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
            <PageHeader
                title="Storage Settings"
                subtitle="Manage and monitor system storage"
                breadcrumbItems={[
                    {
                        title: (
                            <Link to="/superadmin">
                                <FiHome style={{ marginRight: '4px' }} />
                                Home
                            </Link>
                        )
                    },
                    { title: 'Storage' }
                ]}
                searchText={searchText}
                onSearch={(e) => setSearchText(e.target.value)}
                viewMode={viewMode}
                onViewChange={setViewMode}
                showViewToggle={true}
                exportMenu={{ items: exportMenuItems }}
                mobileSearchContent={searchContent}
                isSearchVisible={isSearchVisible}
                onSearchVisibleChange={setIsSearchVisible}
            />

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
