import React, { useState, useEffect, useMemo } from 'react';
import {
    Card, Typography, Button, Modal, Input, Avatar,
    Dropdown, Menu, Row, Col, Breadcrumb, Table, Descriptions, Tooltip, message
} from 'antd';
import {
    FiPlus, FiSearch, FiMessageSquare,
    FiChevronDown, FiDownload,
    FiHome, FiMail, FiPhone, FiCalendar,
    FiEdit2, FiTrash2, FiEye, FiX, FiCheckCircle,
    FiBook, FiMoreVertical
} from 'react-icons/fi';
import './inquary.scss';
import { Link } from 'react-router-dom';
import CreateInquary from './CreateInquary';
import { useGetAllInquiriesQuery, useDeleteInquiryMutation } from './services/inquaryApi';
import moment from 'moment';

const { Title, Text } = Typography;

const formatDate = (date) => moment(date).format('MMM DD, YYYY');
const formatDateTime = (date) => moment(date).format('MMM DD, YYYY HH:mm');

const Inquiry = () => {
    const [searchText, setSearchText] = useState('');
    const [isFormVisible, setIsFormVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [selectedInquiry, setSelectedInquiry] = useState(null);
    const [isViewModalVisible, setIsViewModalVisible] = useState(false);

    const { data: inquiriesData, isLoading, error } = useGetAllInquiriesQuery();
    const [deleteInquiryMutation, { isLoading: isDeleting }] = useDeleteInquiryMutation();

    // Add the filtering logic using useMemo to avoid unnecessary recalculations
    const filteredInquiries = useMemo(() => {
        if (!inquiriesData?.data) return [];
        if (!searchText.trim()) return inquiriesData.data;

        const searchLower = searchText.toLowerCase().trim();
        return inquiriesData.data.filter(inquiry => {
            return (
                (inquiry.name && inquiry.name.toLowerCase().includes(searchLower)) ||
                (inquiry.email && inquiry.email.toLowerCase().includes(searchLower)) ||
                (inquiry.phone && inquiry.phone.toLowerCase().includes(searchLower)) ||
                (inquiry.subject && inquiry.subject.toLowerCase().includes(searchLower)) ||
                (inquiry.message && inquiry.message.toLowerCase().includes(searchLower))
            );
        });
    }, [inquiriesData?.data, searchText]);

    const handleEdit = (inquiry) => {
        setSelectedInquiry(inquiry);
        setIsFormVisible(true);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: 'Delete Inquiry',
            content: 'Are you sure you want to delete this inquiry?',
            okText: 'Yes',
            okType: 'danger',
            bodyStyle: { padding: '20px' },
            cancelText: 'No',
            onOk: async () => {
                try {
                    await deleteInquiryMutation(record.id).unwrap();
                    message.success('Inquiry deleted successfully');
                } catch (error) {
                    message.error(error?.data?.message || 'Failed to delete inquiry');
                }
            },
        });
    };

    const handleView = (inquiry) => {
        setSelectedInquiry(inquiry);
        setIsViewModalVisible(true);
    };

    const getDropdownItems = (record) => ({
        items: [
            {
                key: 'view',
                icon: <FiEye />,
                label: 'View Details',
                onClick: () => handleView(record),
            },
            {
                key: 'edit',
                icon: <FiEdit2 />,
                label: 'Edit Inquiry',
                onClick: () => handleEdit(record),
            },
            {
                key: 'delete',
                icon: <FiTrash2 />,
                label: 'Delete Inquiry',
                danger: true,
                onClick: () => handleDelete(record),
            }
        ]
    });

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => a.name.localeCompare(b.name)
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email'
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone'
        },
        {
            title: 'Subject',
            dataIndex: 'subject',
            key: 'subject'
        },
        {
            title: 'Message',
            dataIndex: 'message',
            key: 'message',
            ellipsis: true
        },
        {
            title: 'Created Date',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => (
                <Tooltip title={formatDateTime(date)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiCalendar />
                        <span>{formatDate(date)}</span>
                    </div>
                </Tooltip>
            ),
            sorter: (a, b) => moment(a.createdAt).unix() - moment(b.createdAt).unix(),
        },
        {
            title: 'Actions',
            key: 'actions',
            align: 'center',
            render: (_, record) => (
                <Dropdown
                    menu={getDropdownItems(record)}
                    trigger={['click']}
                    placement="bottomRight"
                    overlayClassName="plan-actions-dropdown"
                >
                    <Button
                        type="text"
                        icon={<FiMoreVertical />}
                        className="action-dropdown-button"
                        onClick={(e) => e.preventDefault()}
                    />
                </Dropdown>
            ),
            width: '80px',
            fixed: 'right'
        },
    ];

    const exportMenu = (
        <Menu>
            <Menu.Item
                key="csv"
                icon={<FiDownload />}
            >
                Export as CSV
            </Menu.Item>
            <Menu.Item
                key="excel"
                icon={<FiDownload />}
            >
                Export as Excel
            </Menu.Item>
            <Menu.Item
                key="pdf"
                icon={<FiDownload />}
            >
                Export as PDF
            </Menu.Item>
        </Menu>
    );

    return (
        <div className="inquiry-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/superadmin">
                            <FiHome style={{ marginRight: '4px' }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Inquiry</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Inquiries</Title>
                    <Text type="secondary">Manage all inquiries in the system</Text>
                </div>
                <Row justify="center" className="header-actions-wrapper">
                    <Col xs={24} sm={24} md={20} lg={16} xl={14}>
                        <div className="header-actions">
                            <Input
                                prefix={<FiSearch style={{ color: '#8c8c8c', fontSize: '16px' }} />}
                                placeholder="Search inquiries..."
                                allowClear
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                className="search-input"
                            />
                            <div className="action-buttons">
                                <Dropdown menu={exportMenu} trigger={['click']}>
                                    <Button className="export-button">
                                        <FiDownload size={16} />
                                        <span>Export</span>
                                        <FiChevronDown size={14} />
                                    </Button>
                                </Dropdown>
                                <Button
                                    type="primary"
                                    icon={<FiPlus size={16} />}
                                    onClick={() => setIsFormVisible(true)}
                                    className="add-button"
                                >
                                    Add Inquiry
                                </Button>
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>

            <Card className="inquiry-table-card">
                <Table
                    columns={columns}
                    dataSource={filteredInquiries}
                    loading={isLoading}
                    rowKey="id"
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `Total ${total} items`,
                    }}
                />
            </Card>

            <CreateInquary
                open={isFormVisible}
                onCancel={() => {
                    setIsFormVisible(false);
                    setSelectedInquiry(null);
                }}
                onSubmit={() => {
                    setIsFormVisible(false);
                    setSelectedInquiry(null);
                }}
                isEditing={!!selectedInquiry}
                initialValues={selectedInquiry}
            />

            <Modal
                title="View Inquiry Details"
                open={isViewModalVisible}
                onCancel={() => {
                    setIsViewModalVisible(false);
                    setSelectedInquiry(null);
                }}
                footer={null}
                width={600}
            >
                {selectedInquiry && (
                    <Descriptions column={1}>
                        <Descriptions.Item label="Name">
                            {selectedInquiry.name}
                        </Descriptions.Item>
                        <Descriptions.Item label="Email">
                            {selectedInquiry.email}
                        </Descriptions.Item>
                        <Descriptions.Item label="Phone">
                            {selectedInquiry.phone}
                        </Descriptions.Item>
                        <Descriptions.Item label="Subject">
                            {selectedInquiry.subject}
                        </Descriptions.Item>
                        <Descriptions.Item label="Message">
                            {selectedInquiry.message}
                        </Descriptions.Item>
                        <Descriptions.Item label="Created Date">
                            {formatDateTime(selectedInquiry.createdAt)}
                        </Descriptions.Item>
                    </Descriptions>
                )}
            </Modal>
        </div>
    );
};

export default Inquiry;
