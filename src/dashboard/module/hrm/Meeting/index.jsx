import React, { useState, useEffect, useRef } from 'react';
import {
    Typography,
    Button,
    Modal,
    message,
    Input,
    Dropdown,
    Menu,
    Breadcrumb,
} from 'antd';
import {
    FiPlus,
    FiSearch,
    FiChevronDown,
    FiDownload,
    FiHome,
} from 'react-icons/fi';
import './meeting.scss';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import CreateMeeting from './CreateMeeting';
import MeetingList from './MeetingList';
import { Link } from 'react-router-dom';

const { Title, Text } = Typography;

const Meeting = () => {
    const [meetings, setMeetings] = useState([]);
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [filteredMeetings, setFilteredMeetings] = useState([]);
    const searchInputRef = useRef(null);

    useEffect(() => {
        fetchMeetings();
    }, []);

    useEffect(() => {
        handleSearch(searchText);
    }, [meetings, searchText]);

    const fetchMeetings = async () => {
        try {
            setLoading(true);
            // TODO: Replace with actual API call
            const mockData = [
                {
                    id: 1,
                    title: 'Team Sync',
                    type: 'team_meeting',
                    location: 'Conference Room 1',
                    date: '2025-01-01',
                    startTime: '10:00',
                    endTime: '11:00',
                    department: 'HR',
                    meetingLink: 'https://meet.google.com/abc123',
                    description: 'Weekly team sync meeting',
                    created_at: dayjs(),
                    created_by: 'Admin',
                    status: 'scheduled'
                }
            ];
            setMeetings(mockData);
        } catch (error) {
            message.error('Failed to fetch meetings');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value) => {
        setSearchText(value);
        let result = [...meetings];
        if (value) {
            result = result.filter(meeting =>
                meeting.title?.toLowerCase().includes(value.toLowerCase()) ||
                meeting.description?.toLowerCase().includes(value.toLowerCase())
            );
        }
        setFilteredMeetings(result);
    };

    const handleAddMeeting = () => {
        setSelectedMeeting(null);
        setIsEditing(false);
        setIsFormVisible(true);
    };

    const handleEditMeeting = (meeting) => {
        // Convert date strings to dayjs objects before editing
        const formattedMeeting = {
            ...meeting,
            date: dayjs(meeting.date),
            startTime: dayjs(meeting.startTime, 'HH:mm'),
            endTime: meeting.endTime ? dayjs(meeting.endTime, 'HH:mm') : null
        };
        setSelectedMeeting(formattedMeeting);
        setIsEditing(true);
        setIsFormVisible(true);
    };

    const handleDeleteConfirm = (meeting) => {
        setSelectedMeeting(meeting);
        setIsDeleteModalVisible(true);
    };

    const handleDeleteMeeting = async () => {
        try {
            setLoading(true);
            // TODO: Implement delete API call
            const updatedMeetings = meetings.filter(m => m.id !== selectedMeeting.id);
            setMeetings(updatedMeetings);
            message.success('Meeting deleted successfully');
            setIsDeleteModalVisible(false);
        } catch (error) {
            message.error('Failed to delete meeting');
        } finally {
            setLoading(false);
        }
    };

    const handleFormSubmit = async (formData) => {
        try {
            setLoading(true);
            const processedData = {
                ...formData,
                date: formData.date ? dayjs(formData.date) : null,
                startTime: formData.startTime ? dayjs(formData.startTime, 'HH:mm') : null,
                endTime: formData.endTime ? dayjs(formData.endTime, 'HH:mm') : null
            };

            if (isEditing) {
                // TODO: Implement update API call
                const updatedMeetings = meetings.map(m =>
                    m.id === selectedMeeting.id ? { ...m, ...processedData } : m
                );
                setMeetings(updatedMeetings);
                message.success('Meeting updated successfully');
            } else {
                // TODO: Implement create API call
                const newMeeting = {
                    id: Date.now(),
                    ...processedData,
                    created_at: dayjs(),
                    created_by: 'Admin',
                    status: 'scheduled'
                };
                setMeetings([...meetings, newMeeting]);
                message.success('Meeting created successfully');
            }
            setIsFormVisible(false);
        } catch (error) {
            message.error('Operation failed');
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
        XLSX.utils.book_append_sheet(wb, ws, 'Meetings');
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

    const handleExport = async (type) => {
        try {
            setLoading(true);
            const data = meetings.map(meeting => {
                const timeString = meeting.startTime 
                    ? `${meeting.startTime.format('HH:mm')}${meeting.endTime ? ` - ${meeting.endTime.format('HH:mm')}` : ''}`
                    : '';
                    
                return {
                    'Title': meeting.title,
                    'Type': meeting.type,
                    'Location': meeting.location,
                    'Date': meeting.date ? meeting.date.format('YYYY-MM-DD') : '',
                    'Time': timeString,
                    'Description': meeting.description,
                    'Status': meeting.status,
                    'Created By': meeting.created_by,
                    'Created Date': meeting.created_at.format('YYYY-MM-DD')
                };
            });

            switch (type) {
                case 'csv':
                    exportToCSV(data, 'meetings_export');
                    break;
                case 'excel':
                    exportToExcel(data, 'meetings_export');
                    break;
                case 'pdf':
                    exportToPDF(data, 'meetings_export');
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
                    <Text type="secondary">Manage all meetings in the organization</Text>
                </div>
                <div className="header-actions">
                    <Input
                        prefix={<FiSearch style={{ color: '#8c8c8c', fontSize: '16px' }} />}
                        placeholder="Search meetings..."
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
                        <Button
                            type="primary"
                            icon={<FiPlus size={16} />}
                            onClick={handleAddMeeting}
                            className="add-button"
                        >
                            Add Meeting
                        </Button>
                    </div>
                </div>
            </div>

            <div className="meeting-table-card">
                <MeetingList
                    meetings={filteredMeetings}
                    loading={loading}
                    onEdit={handleEditMeeting}
                    onDelete={handleDeleteConfirm}
                />
            </div>

            <CreateMeeting
                open={isFormVisible}
                onCancel={() => setIsFormVisible(false)}
                onSubmit={handleFormSubmit}
                isEditing={isEditing}
                initialValues={selectedMeeting}
                loading={loading}
            />

            

            <Modal
                title="Delete Meeting"
                open={isDeleteModalVisible}
                onOk={handleDeleteMeeting}
                onCancel={() => setIsDeleteModalVisible(false)}
                okText="Delete"
                okButtonProps={{
                    danger: true,
                    loading: loading
                }}
            >
                <p>Are you sure you want to delete this meeting?</p>
                <p>This action cannot be undone.</p>
            </Modal>
        </div>
    );
};

export default Meeting;
