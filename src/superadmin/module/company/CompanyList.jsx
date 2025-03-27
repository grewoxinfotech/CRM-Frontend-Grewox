import React, { useState } from 'react';
import { Table, Button, Tag, Dropdown, Modal, Avatar, message } from 'antd';
import { FiEye, FiEdit2, FiTrash2, FiMoreVertical, FiUser, FiLogIn } from 'react-icons/fi';
import moment from 'moment';
import EditCompany from './EditCompany';
import { useAdminLoginMutation } from '../../../auth/services/authApi';

const CompanyList = ({ companies, loading, onView, onEdit, onDelete }) => {
    
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [adminLogin] = useAdminLoginMutation();

    const handleAdminLogin = async (company) => {
        try {
            const response = await adminLogin({
                email: company.email,
                isClientPage: true
            }).unwrap();

            if (response.success) {
                message.success('Logged in as company successfully');
                // Force reload to update the app state with new user
                window.location.href = '/dashboard';
            }
        } catch (error) {
            message.error(error?.data?.message || 'Failed to login as company');
        }
    };

    const getInitials = (username) => {
        return username
            ? username.split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
            : 'U';
    };
    
    const getDropdownItems = (record) => ({
        items: [
            {
                key: 'view',
                icon: <FiEye />,
                label: 'View Details',
                onClick: () => onView(record),
            },
            {
                key: 'edit',
                icon: <FiEdit2 />,
                label: 'Edit Company',
                onClick: () => onEdit(record),
            },
            {
                key: 'login',
                icon: <FiLogIn />,
                label: 'Login as Company',
                onClick: () => handleAdminLogin(record),
            },
            {
                key: 'delete',
                icon: <FiTrash2 />,
                label: 'Delete Company',
                danger: true,
                onClick: () => onDelete(record),
            }
        ]
    });

    const columns = [
        {
            title: 'Profile',
            dataIndex: 'profilePic',
            key: 'profilePic',
            width: 80,
            render: (profilePic, record) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar
                        size={40}
                        src={profilePic}
                        icon={!profilePic && <FiUser />}
                        style={{
                            backgroundColor: !profilePic ? '#1890ff' : 'transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {!profilePic && getInitials(record.username)}
                    </Avatar>
                </div>
            ),
        },
        {
            title: 'Company Name',
            dataIndex: 'name',
            key: 'name',
            sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
            render: (text) => (
                <div style={{ fontWeight: 500 }}>{text || 'N/A'}</div>
            ),
            width: '20%',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (text) => (
                text && text !== 'N/A' ? (
                    <a href={`mailto:${text}`} onClick={(e) => e.stopPropagation()}>
                        {text}
                    </a>
                ) : 'N/A'
            ),
            width: '25%',
        },
        {
            title: 'Phone',
            dataIndex: 'phone',
            key: 'phone',
            render: (text) => text || 'N/A',
            width: '15%',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const currentStatus = status || 'inactive';
                const color = currentStatus === 'active' ? 'success' : 'error';
                return <Tag color={color}>{currentStatus.toUpperCase()}</Tag>;
            },
            width: '10%',
        },
        {
            title: 'Created',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => date ? moment(date).format('YYYY-MM-DD') : '-',
            sorter: (a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0),
            width: '15%',
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 200,
            render: (_, record) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button
                        type="primary"
                        icon={<FiLogIn />}
                        onClick={() => handleAdminLogin(record)}
                        style={{
                            background: 'linear-gradient(135deg, #4096ff 0%, #1677ff 100%)',
                            border: 'none',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '0 12px',
                            borderRadius: '6px',
                            fontSize: '13px'
                        }}
                    >
                        Login
                    </Button>
                    <Dropdown
                        menu={getDropdownItems(record)}
                        trigger={['click']}
                        placement="bottomRight"
                    >
                        <Button
                            icon={<FiMoreVertical />}
                            style={{
                                border: '1px solid #E5E7EB',
                                width: '32px',
                                height: '32px',
                                padding: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        />
                    </Dropdown>
                </div>
            ),
        }
    ];

    return (
        <>
            <Table
                dataSource={companies}
                columns={columns}
                rowKey={record => record.id}
                loading={loading}
                scroll={{ x: 1100 }}
                pagination={{
                    current: currentPage,
                    pageSize: 10,
                    total: companies.length,
                    showSizeChanger: false,
                    showQuickJumper: false,
                    onChange: (page) => setCurrentPage(page)
                }}
            />

            {editModalVisible && (
                <EditCompany
                    visible={editModalVisible}
                    onCancel={() => {
                        setEditModalVisible(false);
                        setSelectedCompany(null);
                    }}
                    onComplete={(updatedCompany) => {
                        setEditModalVisible(false);
                        setSelectedCompany(null);
                        if (onEdit) {
                            onEdit(updatedCompany);
                        }
                    }}
                    initialValues={selectedCompany}
                    loading={loading}
                />
            )}
        </>
    );
};

export default CompanyList; 