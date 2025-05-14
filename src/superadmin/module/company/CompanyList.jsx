import React, { useState } from 'react';
import { Table, Button, Tag, Dropdown, Avatar, message, Input, Space, Select } from 'antd';
import {
    FiEdit2,
    FiTrash2,
    FiMoreVertical,
    FiUser,
    FiLogIn,
    FiSearch,
    FiFilter,
    FiX,
    FiBriefcase,
    FiMail,
    FiPhone,
    FiCalendar,
    FiToggleRight,
    FiCheck,
    FiX as FiXCircle
} from 'react-icons/fi';
import { PiRocketBold } from 'react-icons/pi';
import moment from 'moment';
import { useAdminLoginMutation } from '../../../auth/services/authApi';
import { useNavigate } from 'react-router-dom';
import { useGetAllAssignedPlansQuery } from './services/companyApi';
import CreateUpgradePlan from './CreateUpgradePlan';

const CompanyList = ({ companies, loading, onView, onEdit, onDelete, onPageChange, searchText, disablePagination }) => {
    const [filteredInfo, setFilteredInfo] = useState({});
    const [adminLogin] = useAdminLoginMutation();
    const navigate = useNavigate();
    const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);

    const handleTableChange = (pagination, filters, sorter) => {
        setFilteredInfo(filters);
        if (onPageChange) {
            onPageChange(pagination);
        }
    };

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        const newFilters = {
            ...filteredInfo,
            [dataIndex]: selectedKeys
        };
        setFilteredInfo(newFilters);
    };

    const handleReset = (clearFilters, confirm, dataIndex) => {
        clearFilters();
        confirm();
        const newFilters = { ...filteredInfo };
        delete newFilters[dataIndex];
        setFilteredInfo(newFilters);
    };

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 16, background: '#fff', borderRadius: 8 }}>
                <Input
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ width: 200, marginBottom: 12, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<FiFilter />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Filter
                    </Button>
                    <Button
                        onClick={() => handleReset(clearFilters, confirm, dataIndex)}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: filtered => (
            <FiFilter
                style={{
                    color: filtered ? '#1890ff' : '#8c8c8c',
                    fontSize: '16px'
                }}
            />
        ),
        onFilter: (value, record) => {
            if (!record[dataIndex]) return false;
            return record[dataIndex].toString().toLowerCase().includes(value.toLowerCase());
        },
        filteredValue: filteredInfo[dataIndex] || null
    });

    // Fetch all assigned plans
    const { data: assignedPlans } = useGetAllAssignedPlansQuery();

    // Function to check if company has active subscription
    const hasActiveSubscription = (companyId) => {
        if (!assignedPlans?.data) return false;
        return assignedPlans.data.some(
            sub => sub.client_id === companyId && sub.status !== 'cancelled'
        );
    };

    const handleAdminLogin = async (company) => {
        try {
            if (!company || !company.email) {
                message.error('Invalid company data');
                return;
            }

            const response = await adminLogin({
                email: company.email,
                isClientPage: true
            }).unwrap();

            if (response?.success) {
                message.success('Logged in as company successfully');
                navigate('/dashboard', { replace: true });
            } else {
                message.error(response?.message || 'Failed to login as company');
            }
        } catch (error) {
            console.error('Company login error:', error);
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

    const handleUpgradeClick = (company) => {
        setSelectedCompany(company);
        setUpgradeModalVisible(true);
    };

    const handleUpgradeModalClose = () => {
        setUpgradeModalVisible(false);
        setSelectedCompany(null);
    };

    const getDropdownItems = (record) => ({
        items: [
            {
                key: 'upgrade',
                icon: <PiRocketBold />,
                label: 'Upgrade Plan',
                onClick: () => handleUpgradeClick(record),
                className: 'ant-dropdown-menu-item-upgrade'
            },
            {
                key: 'edit',
                icon: <FiEdit2 />,
                label: 'Edit Company',
                onClick: () => onEdit(record),
                className: 'ant-dropdown-menu-item-edit'
            },
            {
                key: 'login',
                icon: <FiLogIn />,
                label: 'Login as Company',
                onClick: () => handleAdminLogin(record),
                className: 'ant-dropdown-menu-item-view'
            },
            {
                key: 'delete',
                icon: <FiTrash2 />,
                label: 'Delete Company',
                danger: true,
                onClick: () => onDelete(record),
                className: 'ant-dropdown-menu-item-danger'
            }
        ]
    });

    // Status filter options
    const statusFilters = [
        { text: 'Active', value: true },
        { text: 'Inactive', value: false }
    ];

    const columns = [
        {
            title: (
                <div className="column-header">
                    <FiUser className="header-icon" />
                    <span>Profile</span>
                </div>
            ),
            dataIndex: 'profilePic',
            key: 'profile',
            width: '60px',
            render: (profilePic, record) => (
                <div className="profile-cell">
                    <Avatar
                        size={40}
                        src={profilePic}
                        icon={!profilePic && <FiUser />}
                        className={!profilePic ? 'default-avatar' : ''}
                    >
                        {record.firstName && record.lastName
                            ? `${record.firstName[0]}${record.lastName[0]}`
                            : record.username?.[0]?.toUpperCase() || 'U'}
                    </Avatar>
                </div>
            ),
        },
        {
            title: (
                <div className="column-header">
                    <FiBriefcase className="header-icon" />
                    <span>Company Name</span>
                </div>
            ),
            dataIndex: 'username',
            key: 'name',
            ...getColumnSearchProps('username'),
            width: '200px',
            render: (username, record) => (
                <div className="company-name-cell">
                    {record.firstName && record.lastName
                        ? `${record.firstName} ${record.lastName}`
                        : username || 'N/A'}
                </div>
            ),
        },
        {
            title: (
                <div className="column-header">
                    <FiMail className="header-icon" />
                    <span>Email</span>
                </div>
            ),
            dataIndex: 'email',
            key: 'email',
            ...getColumnSearchProps('email'),
            width: '250px',
            render: (text) => (
                <div className="email-cell">
                    {text && text !== 'N/A' ? (
                        <a href={`mailto:${text}`} onClick={(e) => e.stopPropagation()}>
                            {text}
                        </a>
                    ) : 'N/A'}
                </div>
            ),
        },
        {
            title: (
                <div className="column-header">
                    <FiPhone className="header-icon" />
                    <span>Phone</span>
                </div>
            ),
            dataIndex: 'phone',
            key: 'phone',
            ...getColumnSearchProps('phone'),
            width: '150px',
            render: (text) => (
                <div className="phone-cell">
                    {text || 'N/A'}
                </div>
            ),
        },
        {
            title: (
                <div className="column-header">
                    <FiToggleRight className="header-icon" />
                    <span>Status</span>
                </div>
            ),
            key: 'status',
            width: '120px',
            filters: statusFilters,
            filteredValue: filteredInfo.status || null,
            onFilter: (value, record) => hasActiveSubscription(record.id) === value,
            render: (_, record) => {
                const isActive = hasActiveSubscription(record.id);
                return (
                    <Tag
                        className={`status-tag ${isActive ? 'active' : 'inactive'}`}
                        icon={isActive ? <FiCheck style={{ fontSize: '14px' }} /> : <FiXCircle style={{ fontSize: '14px' }} />}
                    >
                        {isActive ? 'ACTIVE' : 'INACTIVE'}
                    </Tag>
                );
            },
        },
        {
            title: (
                <div className="column-header">
                    <FiCalendar className="header-icon" />
                    <span>Created</span>
                </div>
            ),
            dataIndex: 'createdAt',
            key: 'created_at',
            width: '150px',
            render: (date) => (
                <div className="date-cell">
                    {date ? moment(date).format('MMM DD, YYYY') : '-'}
                </div>
            ),
            sorter: (a, b) => {
                if (!a.createdAt || !b.createdAt) return 0;
                return moment(a.createdAt).unix() - moment(b.createdAt).unix();
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            width: '100px',
            fixed: 'right',
            render: (_, record) => (
                <div style={{ display: 'flex', gap: '10px' }}>
                    <Button
                        type="primary"
                        icon={<FiLogIn />}
                        onClick={() => handleAdminLogin(record)}
                        className="login-button"
                        style={{
                            background: 'linear-gradient(135deg, #4096ff 0%, #1677ff 100%)',
                            border: 'none',
                            borderRadius: '8px',
                            height: '32px',
                            width: 'auto',
                            padding: '0 12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                        }}
                    >
                        Login
                    </Button>
                    <Dropdown
                        menu={getDropdownItems(record)}
                        trigger={['click']}
                        placement="bottomRight"
                        overlayClassName="company-actions-dropdown"
                    >
                        <Button
                            type="text"
                            icon={<FiMoreVertical className="action-icon" />}
                            className="action-button more"
                        />
                    </Dropdown>
                </div>
            ),
        }
    ];

    // Calculate if there are more pages
    const hasNextPage = companies?.data?.length > 0 &&
        companies.currentPage * companies.pageSize < companies.total;

    return (
        <div className="companies-table-wrapper">
            <Table
                columns={columns}
                dataSource={companies?.data || []}
                loading={loading}
                onChange={handleTableChange}
                rowKey="id"
                className="companies-table"
                scroll={{ x: 1200 }}
                pagination={
                    disablePagination ? false : {
                        current: companies?.currentPage || 1,
                        pageSize: companies?.pageSize || 10,
                        total: companies?.totalItems || 0,
                        showSizeChanger: true,
                        showQuickJumper: false,
                        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
                        pageSizeOptions: ['10', '20', '30'],
                        position: ['bottomRight']
                    }
                }
            />
            <style jsx="true">{`
                .companies-table-wrapper {
                    .ant-table-pagination {
                        display: flex;
                        justify-content: flex-end;
                        align-items: center;
                        width: 100%;
                        margin: 16px 0;
                        
                        .ant-pagination-prev,
                        .ant-pagination-next {
                            margin: 0 4px;
                        }
                        
                        .ant-pagination-item {
                            margin: 0 4px;
                        }
                        
                        .ant-pagination-total-text {
                            margin: 0 8px;
                            order: 2;
                        }
                        
                        .ant-pagination-options {
                            margin-left: 8px;
                            order: 3;
                        }
                        
                        .ant-select {
                            min-width: 60px;
                            
                            .ant-select-selector {
                                border-radius: 6px;
                                padding: 0 8px;
                            }
                        }
                    }
                }
            `}</style>
            <CreateUpgradePlan
                open={upgradeModalVisible}
                onCancel={handleUpgradeModalClose}
                company={selectedCompany}
            />
        </div>
    );
};

export default CompanyList;