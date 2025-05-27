import React, { useState, useRef } from 'react';
import {
    Typography,
    Button,
    Modal,
    message,
    Input,
    Dropdown,
    Menu,
    Breadcrumb,
    Popover
} from 'antd';
import {
    FiPlus,
    FiSearch,
    FiChevronDown,
    FiDownload,
    FiHome,
} from 'react-icons/fi';
import './announcement.scss';
import moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import CreateAnnouncement from './CreateAnnouncement';
import AnnouncementList from './AnnouncementList';
import { Link } from 'react-router-dom';
import { useCreateAnnouncementMutation, useUpdateAnnouncementMutation, useDeleteAnnouncementMutation, useGetAnnouncementsQuery } from './services/announcementApi';

const { Title, Text } = Typography;

const Announcement = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);
    const [messageApi] = message.useMessage();
    const [searchText, setSearchText] = useState('');
    const searchInputRef = useRef(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isSearchVisible, setIsSearchVisible] = useState(false);

    // RTK Query mutations
    const [createAnnouncement] = useCreateAnnouncementMutation();
    const [updateAnnouncement] = useUpdateAnnouncementMutation();
    const [deleteAnnouncement, { isLoading: isDeleting }] = useDeleteAnnouncementMutation();

    const { data: response, isLoading } = useGetAnnouncementsQuery({
        page: currentPage,
        pageSize,
        search: searchText
    });

    const announcements = response?.message?.data || [];
    const pagination = response?.message?.pagination || {
        total: 0,
        current: 1,
        pageSize: 10,
        totalPages: 0
    };

    const handleSearch = (value) => {
        setSearchText(value);
        setCurrentPage(1);
    };

    const handleOpenModal = () => {
        setEditingAnnouncement(null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setEditingAnnouncement(null);
        setIsModalOpen(false);
    };

    const handleEdit = (record) => {
        setEditingAnnouncement(record);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        try {
            await deleteAnnouncement(id).unwrap();
            messageApi.success('Announcement deleted successfully');
        } catch (error) {
            messageApi.error(error?.data?.message || 'Failed to delete announcement');
        }
    };

    const handleFormSubmit = async (formData) => {
        try {
            if (editingAnnouncement) {
                await updateAnnouncement({ id: editingAnnouncement.id, data: formData }).unwrap();
                messageApi.success('Announcement updated successfully');
            } else {
                await createAnnouncement(formData).unwrap();
                messageApi.success('Announcement created successfully');
            }
            handleCloseModal();
        } catch (error) {
            messageApi.error(error?.data?.message || 'Operation failed');
        }
    };

    const handleExport = async (type) => {
        try {
            if (!announcements.length) {
                messageApi.warning('No data available to export');
                return;
            }

            const data = announcements.map(announcement => ({
                'Title': announcement.title || '-',
                'Description': announcement.description || '-',
                'Created By': announcement.created_by || '-',
                'Created Date': announcement.createdAt ? moment(announcement.createdAt).format('DD-MM-YYYY') : '-',
            }));

            const fileName = `announcements_${moment().format('DD-MM-YYYY')}`;

            switch (type) {
                case 'csv':
                    const csvContent = [
                        Object.keys(data[0]).join(','),
                        ...data.map(item =>
                            Object.values(item)
                                .map(value => `"${value?.toString().replace(/"/g, '""')}"`)
                                .join(',')
                        )
                    ].join('\n');

                    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.setAttribute('href', url);
                    link.setAttribute('download', `${fileName}.csv`);
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    messageApi.success('Successfully exported as CSV');
                    break;

                case 'excel':
                    const ws = XLSX.utils.json_to_sheet(data);
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, 'Announcements');
                    XLSX.writeFile(wb, `${fileName}.xlsx`);
                    messageApi.success('Successfully exported as Excel');
                    break;

                case 'pdf':
                    const doc = new jsPDF('l', 'pt', 'a4');
                    doc.autoTable({
                        head: [Object.keys(data[0])],
                        body: data.map(item => Object.values(item)),
                        margin: { top: 20 },
                        styles: { fontSize: 8 }
                    });
                    doc.save(`${fileName}.pdf`);
                    messageApi.success('Successfully exported as PDF');
                    break;

                default:
                    messageApi.error('Unsupported export type');
            }
        } catch (error) {
            console.error('Export error:', error);
            messageApi.error('Failed to export data');
        }
    };

    const searchContent = (
        <div className="search-popup">
            <Input
                prefix={<FiSearch style={{ color: "#8c8c8c" }} />}
                placeholder="Search announcements..."
                allowClear
                onChange={(e) => handleSearch(e.target.value)}
                value={searchText}
                className="search-input"
                autoFocus
            />
        </div>
    );

    const exportMenu = (
        <Menu>
            <Menu.Item key="csv" onClick={() => handleExport('csv')}>
                Export as CSV
            </Menu.Item>
            <Menu.Item key="excel" onClick={() => handleExport('excel')}>
                Export as Excel
            </Menu.Item>
            <Menu.Item key="pdf" onClick={() => handleExport('pdf')}>
                Export as PDF
            </Menu.Item>
        </Menu>
    );

    return (
        <div className="announcement-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/dashboard">
                            <FiHome style={{ marginRight: "4px" }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    {/* <Breadcrumb.Item>
                        <Link to="/dashboard/hrm">HRM</Link>
                    </Breadcrumb.Item> */}
                    <Breadcrumb.Item>Announcements</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Announcements</Title>
                    <Text type="secondary">Manage all announcements in the organization</Text>
                </div>
                <div className="header-actions">
                    <div className="desktop-actions">
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div className="search-container">
                                <Input
                                    prefix={<FiSearch style={{ color: "#8c8c8c", fontSize: "16px" }} />}
                                    placeholder="Search announcements..."
                                    allowClear
                                    onChange={(e) => handleSearch(e.target.value)}
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
                            <Dropdown overlay={exportMenu} trigger={["click"]}>
                                <Button className="export-button">
                                    <FiDownload size={16} />
                                    <span className="button-text">Export</span>
                                </Button>
                            </Dropdown>
                            <Button
                                type="primary"
                                icon={<FiPlus size={16} />}
                                onClick={handleOpenModal}
                                className="add-button"
                            >
                                <span className="button-text">Create Announcement</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="announcement-table-card">
                <AnnouncementList
                    loading={isLoading}
                    announcements={announcements}
                    pagination={pagination}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                />
            </div>

            <CreateAnnouncement
                open={isModalOpen}
                onCancel={handleCloseModal}
                onSubmit={handleFormSubmit}
                isEditing={!!editingAnnouncement}
                initialValues={editingAnnouncement}
            />
        </div>
    );
};

export default Announcement;
