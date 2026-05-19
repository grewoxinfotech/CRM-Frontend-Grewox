import React, { useState, useMemo } from 'react';
import {
    Card, Typography, Button, Modal, Drawer, Input, Avatar,
    Dropdown, Row, Col, Table, Descriptions, Tooltip, message, Space, Tag
} from 'antd';
import {
    FiPlus, FiSearch, FiCalendar,
    FiDownload, FiHome, FiMail, FiPhone,
    FiEdit2, FiTrash2, FiEye, FiX, FiCheckCircle,
    FiBriefcase, FiUsers, FiMoreVertical, FiBookmark, FiList
} from 'react-icons/fi';
import PageHeader from '../../../components/PageHeader';
import './demo-request.scss';
import { Link, useNavigate } from 'react-router-dom';
import CreateDemoRequestModal from './CreateDemoRequestModal';
import CreateCompany from '../company/createCompany';
import { useGetAllDemoRequestsQuery, useDeleteDemoRequestMutation, useUpdateDemoRequestMutation } from './services/demoRequestApi';
import moment from 'moment';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const { Title, Text } = Typography;

const DemoRequestList = () => {
    const navigate = useNavigate();
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [isCreateCompanyVisible, setIsCreateCompanyVisible] = useState(false);
    const [companyOnboardData, setCompanyOnboardData] = useState(null);
    const [isDetailViewActive, setIsDetailViewActive] = useState(false);
    const [onboardedDemoRequestId, setOnboardedDemoRequestId] = useState(null);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    const { data: responseData, isLoading, refetch } = useGetAllDemoRequestsQuery({
        page: currentPage,
        limit: pageSize,
        search: searchText,
        status: statusFilter
    });

    const [deleteDemoRequest, { isLoading: isDeleting }] = useDeleteDemoRequestMutation();
    const [updateDemoRequest] = useUpdateDemoRequestMutation();

    const handleOnboardCompany = (record) => {
        setOnboardedDemoRequestId(record.id);
        const cleanBusiness = record.businessName ? record.businessName.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() : '';
        const randomNum = Math.floor(100 + Math.random() * 900);
        const username = cleanBusiness ? `${cleanBusiness}${randomNum}` : `user${randomNum}`;

        const nameParts = record.fullName ? record.fullName.trim().split(/\s+/) : ['', ''];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        setCompanyOnboardData({
            username: username,
            email: record.email || '',
            firstName: firstName,
            lastName: lastName,
            phone: record.mobileNumber || '',
            industry: record.businessType || '',
            website: '',
            address: ''
        });
        setIsCreateCompanyVisible(true);
    };

    const handleSearch = (value) => {
        setSearchText(value);
        setCurrentPage(1);
    };

    const handleStatusFilter = (status) => {
        setStatusFilter(status);
        setCurrentPage(1);
    };

    const handleEdit = (record) => {
        setSelectedRequest(record);
        setIsFormVisible(true);
    };

    const handleDeleteClick = (record) => {
        setSelectedRequest(record);
        setIsDeleteModalVisible(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await deleteDemoRequest(selectedRequest.id).unwrap();
            message.success('Demo request deleted successfully');
            refetch();
        } catch (error) {
            message.error(error?.data?.message || 'Failed to delete request');
        } finally {
            setIsDeleteModalVisible(false);
            setSelectedRequest(null);
        }
    };

    const handleView = (record) => {
        setSelectedRequest(record);
        setIsDetailViewActive(true);
    };

    const columns = [
        {
            title: 'Full Name',
            dataIndex: 'fullName',
            key: 'fullName',
            width: 180,
            render: (text) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Avatar style={{
                        background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                        color: '#ffffff',
                        fontWeight: '600'
                    }}>
                        {text ? text[0].toUpperCase() : '?'}
                    </Avatar>
                    <span style={{ fontWeight: '600', color: '#1e293b' }}>{text}</span>
                </div>
            )
        },
        {
            title: 'Mobile Number',
            dataIndex: 'mobileNumber',
            key: 'mobileNumber',
            width: 150,
            render: (text) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiPhone style={{ color: '#059669' }} />
                    <span>{text}</span>
                </div>
            )
        },
        {
            title: 'Business Name',
            dataIndex: 'businessName',
            key: 'businessName',
            width: 180,
            render: (text) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiBriefcase style={{ color: '#2563eb' }} />
                    <span style={{ fontWeight: '500' }}>{text}</span>
                </div>
            )
        },
        {
            title: 'Business Type',
            dataIndex: 'businessType',
            key: 'businessType',
            width: 140,
            render: (text) => text ? <Tag color="blue">{text}</Tag> : '-'
        },
        {
            title: 'Team Size',
            dataIndex: 'teamSize',
            key: 'teamSize',
            width: 110,
            render: (text) => text ? <Tag color="purple">{text} Employees</Tag> : '-'
        },
        {
            title: 'What they want?',
            dataIndex: 'requirements',
            key: 'requirements',
            width: 250,
            render: (reqs) => {
                if (!reqs) return '-';
                // Handle both JSON array or raw string format
                const requirementsList = typeof reqs === 'string' ? JSON.parse(reqs) : reqs;
                return (
                    <div className="requirements-tags-wrapper">
                        {requirementsList.map((req, idx) => (
                            <Tag key={idx} color="cyan" style={{ borderRadius: '4px', margin: '2px 0' }}>{req}</Tag>
                        ))}
                    </div>
                );
            }
        },
        {
            title: 'Scheduled Time',
            dataIndex: 'preferredTime',
            key: 'preferredTime',
            width: 180,
            render: (date) => (
                date ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiCalendar style={{ color: '#2563eb' }} />
                        <span>{moment(date).format('YYYY-MM-DD HH:mm')}</span>
                    </div>
                ) : <span style={{ color: '#94a3b8' }}>Not scheduled</span>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 130,
            render: (status) => {
                const currentStatus = status || 'pending';
                return (
                    <span className={`demo-status-tag ${currentStatus}`}>
                        {currentStatus === 'pending' && <FiBookmark />}
                        {currentStatus === 'scheduled' && <FiCalendar />}
                        {currentStatus === 'completed' && <FiCheckCircle />}
                        {currentStatus === 'cancelled' && <FiX />}
                        {currentStatus === 'onboarded' && <FiUsers />}
                        {currentStatus}
                    </span>
                );
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 80,
            fixed: 'right',
            align: 'center',
            render: (_, record) => (
                <Dropdown
                    menu={{
                        items: [
                            {
                                key: 'view',
                                label: 'View Details',
                                icon: <FiEye style={{ color: '#2563eb' }} />,
                                onClick: () => handleView(record)
                            },
                            {
                                key: 'onboard',
                                label: 'Onboard Company',
                                icon: <FiUsers style={{ color: '#8b5cf6' }} />,
                                onClick: () => handleOnboardCompany(record)
                            },
                            {
                                key: 'edit',
                                label: 'Schedule / Edit',
                                icon: <FiEdit2 style={{ color: '#059669' }} />,
                                onClick: () => handleEdit(record)
                            },
                            {
                                key: 'delete',
                                label: 'Delete',
                                icon: <FiTrash2 style={{ color: '#ef4444' }} />,
                                danger: true,
                                onClick: () => handleDeleteClick(record)
                            }
                        ]
                    }}
                    trigger={['click']}
                    placement="bottomRight"
                >
                    <Button
                        type="text"
                        icon={<FiMoreVertical style={{ fontSize: '16px' }} />}
                        className="action-btn"
                    />
                </Dropdown>
            )
        }
    ];

    const exportMenuItems = [
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
    ];

    const handleExport = async (type) => {
        try {
            setLoading(true);
            const requests = responseData?.data?.requests || [];
            if (requests.length === 0) {
                message.warning('No data to export');
                return;
            }

            const data = requests.map(req => ({
                'Full Name': req.fullName || 'N/A',
                'Mobile Number': req.mobileNumber || 'N/A',
                'Business Name': req.businessName || 'N/A',
                'Email': req.email || 'N/A',
                'Business Type': req.businessType || 'N/A',
                'Team Size': req.teamSize || 'N/A',
                'Requirements': req.requirements ? (typeof req.requirements === 'string' ? JSON.parse(req.requirements) : req.requirements).join(', ') : 'N/A',
                'Scheduled Time': req.preferredTime ? moment(req.preferredTime).format('YYYY-MM-DD HH:mm') : 'N/A',
                'Status': req.status || 'pending',
                'Notes': req.notes || 'N/A'
            }));

            switch (type) {
                case 'csv':
                    exportToCSV(data, 'demo_requests_export');
                    break;
                case 'excel':
                    exportToExcel(data, 'demo_requests_export');
                    break;
                case 'pdf':
                    exportToPDF(data, 'demo_requests_export');
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
        XLSX.utils.book_append_sheet(wb, ws, 'Demo Requests');
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

    if (isDetailViewActive && selectedRequest) {
        return (
            <div className="demo-request-page" style={{ padding: '24px', background: '#f8fafc', minHeight: '100vh' }}>
                <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                    <Button 
                        type="link" 
                        onClick={() => {
                            setIsDetailViewActive(false);
                            setSelectedRequest(null);
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: 0, fontSize: '15px', color: '#64748b', fontWeight: 600 }}
                    >
                        <span style={{ fontSize: '18px' }}>←</span> Back to Demo Requests
                    </Button>
                    <div style={{ display: 'flex', gap: '12px' }}>
                        <Button
                            icon={<FiUsers />}
                            type="primary"
                            onClick={() => {
                                handleOnboardCompany(selectedRequest);
                            }}
                            style={{
                                height: '40px',
                                borderRadius: '8px',
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontWeight: 500,
                                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)'
                            }}
                        >
                            Onboard Company
                        </Button>
                        <Button
                            icon={<FiEdit2 />}
                            onClick={() => {
                                handleEdit(selectedRequest);
                            }}
                            style={{ height: '40px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }}
                        >
                            Schedule / Edit
                        </Button>
                    </div>
                </div>

                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={15}>
                        <Card 
                            bordered={false} 
                            style={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)', overflow: 'hidden' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', paddingBottom: '20px', borderBottom: '1px solid #f1f5f9' }}>
                                <Avatar size={72} style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', color: '#ffffff', fontSize: '24px', fontWeight: 'bold' }}>
                                    {selectedRequest.fullName ? selectedRequest.fullName[0].toUpperCase() : '?'}
                                </Avatar>
                                <div>
                                    <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>{selectedRequest.fullName}</h1>
                                    <div style={{ fontSize: '15px', color: '#64748b', marginTop: '4px', fontWeight: 500 }}>
                                        {selectedRequest.businessName} • {selectedRequest.businessType || 'No Industry'}
                                    </div>
                                    <div style={{ marginTop: '8px' }}>
                                        <span className={`demo-status-tag ${selectedRequest.status || 'pending'}`}>
                                            {selectedRequest.status || 'pending'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <Descriptions bordered column={1} labelStyle={{ background: '#f8fafc', fontWeight: 600, width: '200px', color: '#475569', padding: '16px 24px' }} contentStyle={{ color: '#0f172a', fontWeight: 500, padding: '16px 24px' }}>
                                <Descriptions.Item label="Ticket ID">
                                    <span style={{ fontFamily: 'monospace', fontSize: '13px', color: '#475569', background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                                        {selectedRequest.id}
                                    </span>
                                </Descriptions.Item>
                                <Descriptions.Item label="Mobile Number">
                                    <a href={`tel:${selectedRequest.mobileNumber}`} style={{ color: '#2563eb', fontWeight: 600 }}>{selectedRequest.mobileNumber}</a>
                                </Descriptions.Item>
                                <Descriptions.Item label="Email Address">
                                    {selectedRequest.email ? <a href={`mailto:${selectedRequest.email}`} style={{ color: '#2563eb', fontWeight: 600 }}>{selectedRequest.email}</a> : <span style={{ color: '#94a3b8' }}>N/A</span>}
                                </Descriptions.Item>
                                <Descriptions.Item label="Team Size">
                                    {selectedRequest.teamSize ? `${selectedRequest.teamSize} Employees` : 'N/A'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Requested Modules">
                                    {selectedRequest.requirements ? (
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                            {(typeof selectedRequest.requirements === 'string' ? JSON.parse(selectedRequest.requirements) : selectedRequest.requirements).map((req, idx) => (
                                                <Tag key={idx} color="cyan" style={{ borderRadius: '4px', fontWeight: '500', border: '1px solid #b2f2f2' }}>{req}</Tag>
                                            ))}
                                        </div>
                                    ) : 'N/A'}
                                </Descriptions.Item>
                                <Descriptions.Item label="Preferred Date & Time">
                                    {selectedRequest.preferredTime ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a', fontWeight: 600 }}>
                                            <FiCalendar style={{ color: '#2563eb' }} />
                                            {moment(selectedRequest.preferredTime).format('MMMM DD, YYYY hh:mm A')}
                                        </div>
                                    ) : <span style={{ color: '#94a3b8' }}>Not scheduled yet</span>}
                                </Descriptions.Item>
                                <Descriptions.Item label="Superadmin Follow-up Notes">
                                    {selectedRequest.notes ? (
                                        <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', borderLeft: '4px solid #cbd5e1', fontStyle: 'italic', color: '#334155' }}>
                                            "{selectedRequest.notes}"
                                        </div>
                                    ) : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No notes added yet</span>}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </Col>

                    <Col xs={24} lg={9}>
                        <Card 
                            bordered={false} 
                            title={
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <FiCalendar style={{ color: '#8b5cf6' }} />
                                    <span style={{ fontWeight: 700, fontSize: '16px', color: '#1e293b' }}>Reschedule Audit History</span>
                                </div>
                            }
                            style={{ borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)', height: '100%' }}
                        >
                            {!selectedRequest.rescheduleHistory || (typeof selectedRequest.rescheduleHistory === 'string' ? JSON.parse(selectedRequest.rescheduleHistory) : selectedRequest.rescheduleHistory).length === 0 ? (
                                <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0', fontStyle: 'italic' }}>
                                    No reschedule logs recorded for this request.
                                </div>
                            ) : (
                                <div className="custom-timeline-container" style={{ 
                                    position: 'relative', 
                                    paddingLeft: '24px', 
                                    borderLeft: '2px solid #e2e8f0', 
                                    marginLeft: '12px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '20px',
                                    maxHeight: '500px',
                                    overflowY: 'auto',
                                    paddingRight: '8px'
                                }}>
                                    {(typeof selectedRequest.rescheduleHistory === 'string' ? JSON.parse(selectedRequest.rescheduleHistory) : selectedRequest.rescheduleHistory).map((log, idx) => {
                                        const rescheduledByUser = log.rescheduledBy && log.rescheduledBy.trim() !== "" ? log.rescheduledBy : "Super Admin";
                                        const logNotes = log.notes && log.notes.trim() !== "" ? log.notes : "Schedule updated from dashboard";

                                        return (
                                            <div key={idx} className="timeline-item" style={{ position: 'relative' }}>
                                                <span style={{ 
                                                    position: 'absolute', 
                                                    left: '-33px', 
                                                    top: '4px', 
                                                    width: '16px', 
                                                    height: '16px', 
                                                    borderRadius: '50%', 
                                                    background: '#ffffff', 
                                                    border: '3px solid #8b5cf6', 
                                                    boxShadow: '0 0 0 4px rgba(139, 92, 246, 0.15)',
                                                    display: 'inline-block',
                                                    zIndex: '2'
                                                }} />

                                                <div style={{ 
                                                    background: '#ffffff', 
                                                    border: '1px solid #e2e8f0', 
                                                    borderRadius: '12px', 
                                                    padding: '16px', 
                                                    boxShadow: '0 2px 8px rgba(241, 245, 249, 0.6)',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '8px'
                                                }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                            {log.oldTime ? (
                                                                <Tag color="default" style={{ borderRadius: '6px', fontWeight: '500' }}>
                                                                    {moment(log.oldTime).format('MMM DD, hh:mm A')}
                                                                </Tag>
                                                            ) : (
                                                                <Tag color="blue" style={{ borderRadius: '6px', fontWeight: '500' }}>None</Tag>
                                                            )}
                                                            <span style={{ color: '#94a3b8', fontSize: '12px' }}>➡️</span>
                                                            <Tag color="purple" style={{ borderRadius: '6px', fontWeight: '600', color: '#7c3aed' }}>
                                                                {moment(log.newTime).format('MMM DD, hh:mm A')}
                                                            </Tag>
                                                        </div>
                                                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '500' }}>
                                                            {moment(log.rescheduledAt).format('YYYY-MM-DD HH:mm')}
                                                        </span>
                                                    </div>

                                                    <div style={{ 
                                                        display: 'flex', 
                                                        alignItems: 'center', 
                                                        justifyContent: 'space-between', 
                                                        paddingTop: '8px', 
                                                        borderTop: '1px solid #f1f5f9',
                                                        fontSize: '12px',
                                                        color: '#64748b'
                                                    }}>
                                                        <span>
                                                            <strong>Updated By:</strong> <Tag color="geekblue" style={{ borderRadius: '4px', fontSize: '11px', fontWeight: '500', marginLeft: '4px' }}>{rescheduledByUser}</Tag>
                                                        </span>
                                                    </div>

                                                    <div style={{ 
                                                        background: '#f8fafc', 
                                                        borderRadius: '8px', 
                                                        padding: '8px 12px', 
                                                        fontSize: '12px', 
                                                        color: '#475569',
                                                        borderLeft: '3px solid #cbd5e1',
                                                        fontStyle: 'italic'
                                                    }}>
                                                        "{logNotes}"
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </Card>
                    </Col>
                </Row>

                {isCreateCompanyVisible && (
                    <CreateCompany
                        open={isCreateCompanyVisible}
                        onCancel={() => {
                            setIsCreateCompanyVisible(false);
                            setCompanyOnboardData(null);
                        }}
                        isEditing={false}
                        initialValues={companyOnboardData}
                        loading={false}
                        onSuccess={async () => {
                            if (onboardedDemoRequestId) {
                                try {
                                    await updateDemoRequest({ id: onboardedDemoRequestId, status: 'onboarded' }).unwrap();
                                    refetch();
                                } catch (err) {
                                    console.error("Failed to update status", err);
                                }
                            }
                            setIsCreateCompanyVisible(false);
                            setCompanyOnboardData(null);
                            setOnboardedDemoRequestId(null);
                            message.success('Company created and verified successfully! Redirecting...');
                            setTimeout(() => {
                                navigate('/superadmin/company');
                            }, 1200);
                        }}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="demo-request-page">
            <PageHeader
                title="Demo Requests"
                subtitle="Manage and schedule all client CRM demos"
                breadcrumbItems={[
                    {
                        title: (
                            <Link to="/superadmin">
                                <FiHome style={{ marginRight: "4px" }} />
                                Home
                            </Link>
                        )
                    },
                    { title: 'Demo Requests' }
                ]}
                searchText={searchText}
                onSearch={handleSearch}
                onAdd={() => {
                    setSelectedRequest(null);
                    setIsFormVisible(true);
                }}
                addText="Add Demo Request"
                exportMenu={{
                    items: exportMenuItems
                }}
                isSearchVisible={isSearchVisible}
                onSearchVisibleChange={setIsSearchVisible}
            />

            {/* Overview Stats Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px', display: 'flex', flexWrap: 'wrap' }}>
                <Col xs={24} sm={12} md={8} lg={4.8} style={{ flex: '1 0 200px' }}>
                    <Card bordered={false} className="stat-overview-card" style={{
                        background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
                        borderRadius: '16px',
                        boxShadow: '0 4px 20px rgba(37, 99, 235, 0.06)',
                        border: '1px solid rgba(37, 99, 235, 0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <Text style={{ color: '#1e3a8a', fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>Total Requests</Text>
                                <Title level={2} style={{ margin: 0, color: '#1e3a8a', fontWeight: '700', fontSize: '28px' }}>
                                    {responseData?.data?.stats?.total || 0}
                                </Title>
                            </div>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: '#2563eb',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ffffff',
                                fontSize: '20px',
                                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)'
                            }}>
                                <FiList />
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={4.8} style={{ flex: '1 0 200px' }}>
                    <Card bordered={false} className="stat-overview-card" style={{
                        background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
                        borderRadius: '16px',
                        boxShadow: '0 4px 20px rgba(249, 115, 22, 0.06)',
                        border: '1px solid rgba(249, 115, 22, 0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <Text style={{ color: '#7c2d12', fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>Pending Reviews</Text>
                                <Title level={2} style={{ margin: 0, color: '#7c2d12', fontWeight: '700', fontSize: '28px' }}>
                                    {responseData?.data?.stats?.pending || 0}
                                </Title>
                            </div>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: '#f97316',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ffffff',
                                fontSize: '20px',
                                boxShadow: '0 4px 12px rgba(249, 115, 22, 0.25)'
                            }}>
                                <FiBookmark />
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={4.8} style={{ flex: '1 0 200px' }}>
                    <Card bordered={false} className="stat-overview-card" style={{
                        background: 'linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%)',
                        borderRadius: '16px',
                        boxShadow: '0 4px 20px rgba(139, 92, 246, 0.06)',
                        border: '1px solid rgba(139, 92, 246, 0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <Text style={{ color: '#4c1d95', fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>Demos Scheduled</Text>
                                <Title level={2} style={{ margin: 0, color: '#4c1d95', fontWeight: '700', fontSize: '28px' }}>
                                    {responseData?.data?.stats?.scheduled || 0}
                                </Title>
                            </div>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: '#8b5cf6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ffffff',
                                fontSize: '20px',
                                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)'
                            }}>
                                <FiCalendar />
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={4.8} style={{ flex: '1 0 200px' }}>
                    <Card bordered={false} className="stat-overview-card" style={{
                        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                        borderRadius: '16px',
                        boxShadow: '0 4px 20px rgba(34, 197, 94, 0.06)',
                        border: '1px solid rgba(34, 197, 94, 0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <Text style={{ color: '#14532d', fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>Demos Completed</Text>
                                <Title level={2} style={{ margin: 0, color: '#14532d', fontWeight: '700', fontSize: '28px' }}>
                                    {responseData?.data?.stats?.completed || 0}
                                </Title>
                            </div>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: '#22c55e',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ffffff',
                                fontSize: '20px',
                                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.25)'
                            }}>
                                <FiCheckCircle />
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={8} lg={4.8} style={{ flex: '1 0 200px' }}>
                    <Card bordered={false} className="stat-overview-card" style={{
                        background: 'linear-gradient(135deg, #fdf4ff 0%, #fae8ff 100%)',
                        borderRadius: '16px',
                        boxShadow: '0 4px 20px rgba(217, 70, 239, 0.06)',
                        border: '1px solid rgba(217, 70, 239, 0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <Text style={{ color: '#701a75', fontSize: '14px', fontWeight: '500', display: 'block', marginBottom: '4px' }}>Onboarded Done</Text>
                                <Title level={2} style={{ margin: 0, color: '#701a75', fontWeight: '700', fontSize: '28px' }}>
                                    {responseData?.data?.stats?.onboarded || 0}
                                </Title>
                            </div>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: '#d946ef',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#ffffff',
                                fontSize: '20px',
                                boxShadow: '0 4px 12px rgba(217, 70, 239, 0.25)'
                            }}>
                                <FiUsers />
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Card
                className="demo-request-table-card"
                bodyStyle={{ padding: 0 }}
            >
                <div style={{ padding: '16px', display: 'flex', gap: '8px', borderBottom: '1px solid #f1f5f9' }}>
                    <Button 
                        type={statusFilter === '' ? 'primary' : 'default'}
                        onClick={() => handleStatusFilter('')}
                        style={{ borderRadius: '6px' }}
                    >
                        All Requests
                    </Button>
                    <Button 
                        type={statusFilter === 'pending' ? 'primary' : 'default'}
                        onClick={() => handleStatusFilter('pending')}
                        style={{ borderRadius: '6px' }}
                    >
                        Pending
                    </Button>
                    <Button 
                        type={statusFilter === 'scheduled' ? 'primary' : 'default'}
                        onClick={() => handleStatusFilter('scheduled')}
                        style={{ borderRadius: '6px' }}
                    >
                        Scheduled
                    </Button>
                    <Button 
                        type={statusFilter === 'completed' ? 'primary' : 'default'}
                        onClick={() => handleStatusFilter('completed')}
                        style={{ borderRadius: '6px' }}
                    >
                        Completed
                    </Button>
                    <Button 
                        type={statusFilter === 'onboarded' ? 'primary' : 'default'}
                        onClick={() => handleStatusFilter('onboarded')}
                        style={{ borderRadius: '6px' }}
                    >
                        Onboarded Done
                    </Button>
                </div>

                <Table
                    columns={columns}
                    dataSource={responseData?.data?.requests || []}
                    rowKey="id"
                    loading={isLoading}
                    scroll={{ x: 1200 }}
                    pagination={{
                        current: currentPage,
                        pageSize: pageSize,
                        total: responseData?.data?.pagination?.total || 0,
                        onChange: (page, size) => {
                            setCurrentPage(page);
                            setPageSize(size);
                        },
                        showSizeChanger: true
                    }}
                    className="colorful-table"
                    onRow={(record) => ({
                        onClick: (event) => {
                            const isActionClick = event.target.closest('.ant-dropdown-trigger') || 
                                                  event.target.closest('.ant-dropdown') || 
                                                  event.target.closest('button') || 
                                                  event.target.closest('a');
                            if (!isActionClick) {
                                handleView(record);
                            }
                        },
                        style: { cursor: 'pointer' }
                    })}
                />
            </Card>

            <CreateDemoRequestModal
                open={isFormVisible}
                onCancel={() => {
                    setIsFormVisible(false);
                    setSelectedRequest(null);
                }}
                onSubmit={() => {
                    setIsFormVisible(false);
                    setSelectedRequest(null);
                    refetch();
                }}
                isEditing={!!selectedRequest}
                initialValues={selectedRequest}
            />

            <Modal
                title="Delete Request"
                open={isDeleteModalVisible}
                onOk={handleDeleteConfirm}
                confirmLoading={isDeleting}
                onCancel={() => {
                    setIsDeleteModalVisible(false);
                    setSelectedRequest(null);
                }}
                okText="Delete"
                okButtonProps={{ danger: true }}
            >
                <p>Are you sure you want to delete this demo request?</p>
                <p>This action cannot be undone.</p>
            </Modal>



            {isCreateCompanyVisible && (
                <CreateCompany
                    open={isCreateCompanyVisible}
                    onCancel={() => {
                        setIsCreateCompanyVisible(false);
                        setCompanyOnboardData(null);
                    }}
                    isEditing={false}
                    initialValues={companyOnboardData}
                    loading={false}
                    onSuccess={async () => {
                        if (onboardedDemoRequestId) {
                            try {
                                await updateDemoRequest({ id: onboardedDemoRequestId, status: 'onboarded' }).unwrap();
                                refetch();
                            } catch (err) {
                                console.error("Failed to update status", err);
                            }
                        }
                        setIsCreateCompanyVisible(false);
                        setCompanyOnboardData(null);
                        setOnboardedDemoRequestId(null);
                        message.success('Company created and verified successfully! Redirecting...');
                        setTimeout(() => {
                            navigate('/superadmin/company');
                        }, 1200);
                    }}
                />
            )}
        </div>
    );
};

export default DemoRequestList;
