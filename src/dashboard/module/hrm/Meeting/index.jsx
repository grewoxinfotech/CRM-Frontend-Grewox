import React, { useState } from 'react';
import {
    Typography,
    Button,
    Input,
    Dropdown,
    Menu,
    Breadcrumb,
    Popover,
} from 'antd';
import {
    FiPlus,
    FiSearch,
    FiChevronDown,
    FiDownload,
    FiHome,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useGetMeetingsQuery, useUpdateMeetingMutation, useDeleteMeetingMutation } from './services/meetingApi';
import { useGetAllDepartmentsQuery } from '../Department/services/departmentApi';
import MeetingList from './MeetingList';
import CreateMeeting from './CreateMeeting';
import EditMeeting from './EditMeeting';
import './meeting.scss';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
const { Title, Text } = Typography;
const Meeting = () => {
    const [searchText, setSearchText] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingMeeting, setEditingMeeting] = useState(null);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    // API Queries
    const { data: meetingsData, isLoading } = useGetMeetingsQuery({
        page: currentPage,
        pageSize,
        search: searchText
    });
    const { data: departmentsData } = useGetAllDepartmentsQuery({
        page: 1,
        pageSize: -1,
        search: ''
      });
    const [updateMeeting] = useUpdateMeetingMutation();
    const [deleteMeeting] = useDeleteMeetingMutation();
    // Create department map for easy lookup
    const departmentMap = {};
    if (departmentsData) {
        departmentsData?.data.forEach(dept => {
            if (dept && dept.id) {
                departmentMap[dept.id] = dept.department_name;
            }
        });
    }
    // Handlers
    const handleSearch = (value) => {
        setSearchText(value);
        setCurrentPage(1); // Reset to first page on new search
    };
    const handleEdit = (record) => {
        setEditingMeeting(record);
        setIsEditModalOpen(true);
    };
    const handleDelete = async (id) => {
        try {
            await deleteMeeting(id).unwrap();
        } catch (error) {
            console.error('Delete error:', error);
        }
    };
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };
    const handlePageSizeChange = (size) => {
        setPageSize(size);
        setCurrentPage(1);
    };
    const handleExport = async (type) => {
        try {
            const data = meetingsData?.data?.map((meeting) => ({
                'Title': meeting.title || '-',
                'Department': departmentMap[meeting.department] || '-',
                'Date': meeting.date ? dayjs(meeting.date).format('DD-MM-YYYY') : '-',
                'Start Time': meeting.startTime || '-',
                'End Time': meeting.endTime || '-',
                'Status': meeting.status || '-',
                'Description': meeting.description || '-',
                'Created By': meeting.created_by || '-',
                'Created At': meeting.createdAt ? dayjs(meeting.createdAt).format('DD-MM-YYYY') : '-'
            })) || [];
            if (data.length === 0) return;
            const fileName = `meetings_${dayjs().format('DD-MM-YYYY')}`;
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
                    break;
                case 'excel':
                    const ws = XLSX.utils.json_to_sheet(data);
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, 'Meetings');
                    XLSX.writeFile(wb, `${fileName}.xlsx`);
                    break;
                case 'pdf':
                    const doc = new jsPDF('l', 'pt', 'a4');
                    doc.autoTable({
                        head: [Object.keys(data[0])],
                        body: data.map(item => Object.values(item)),
                        margin: { top: 20 },
                        styles: {
                            fontSize: 8,
                            cellPadding: 2
                        },
                        theme: 'grid'
                    });
                    doc.save(`${fileName}.pdf`);
                    break;
                default:
                    break;
            }
        } catch (error) {
            console.error('Export error:', error);
        }
    };


    const searchContent = (
        <div className="search-popup">
          <Input
            prefix={<FiSearch style={{ color: "#8c8c8c" }} />}
            placeholder="Search debit notes..."
            allowClear
            onChange={(e) => setSearchText(e.target.value)}
            value={searchText}
            className="search-input"
            autoFocus
          />
        </div>
      );

    return (
        <div className="meeting-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/dashboard">
                            <FiHome style={{ marginRight: '4px' }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <Link to="/dashboard/hrm">HRM</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Meetings</Breadcrumb.Item>
                </Breadcrumb>
            </div>
            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Meetings</Title>
                    <Text className="page-description" type="secondary">Manage all meetings in the organization</Text>
                </div>
                <div className="header-actions">
                    <div className="desktop-actions">
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div className="search-container">
                                <Input
                                    prefix={<FiSearch style={{ color: "#8c8c8c", fontSize: "16px" }} />}
                                    placeholder="Search meetings..."
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
                            <Dropdown
                                menu={{
                                    items: [
                                        {
                                            key: 'csv',
                                            label: 'Export as CSV',
                                            icon: <FiDownload />,
                                            onClick: () => handleExport('csv')
                                        },
                                        {
                                            key: 'excel',
                                            label: 'Export as Excel',
                                            icon: <FiDownload />,
                                            onClick: () => handleExport('excel')
                                        },
                                        {
                                            key: 'pdf',
                                            label: 'Export as PDF',
                                            icon: <FiDownload />,
                                            onClick: () => handleExport('pdf')
                                        }
                                    ]
                                }}
                                trigger={['click']}
                                placement="bottomRight"
                            >
                                <Button className="export-button">
                                    <FiDownload size={16} />
                                    <span className="button-text">Export</span>
                                </Button>
                            </Dropdown>
                            <Button
                                type="primary"
                                icon={<FiPlus size={16} />}
                                onClick={() => setIsCreateModalOpen(true)}
                                className="add-button"
                            >
                                <span className="button-text">Add Meeting</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="meeting-table-card">
                <MeetingList
                    loading={isLoading}
                    meetings={meetingsData?.data || []}
                    pagination={{
                        current: currentPage,
                        pageSize,
                        total: meetingsData?.pagination?.total || 0,
                        totalPages: meetingsData?.pagination?.totalPages || 0
                    }}
                    departmentMap={departmentMap}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            </div>
            <CreateMeeting
                open={isCreateModalOpen}
                onCancel={() => setIsCreateModalOpen(false)}
                departments={departmentsData || []}
            />
            {editingMeeting && (
                <EditMeeting
                    open={isEditModalOpen}
                    onCancel={() => {
                        setIsEditModalOpen(false);
                        setEditingMeeting(null);
                    }}
                    meeting={editingMeeting}
                    departments={departmentsData || []}
                />
            )}
        </div>
    );
};
export default Meeting;