import React, { useState } from 'react';
import { Table, Button, Tag, Dropdown, Avatar, message, Input, Space } from 'antd';
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

const CompanyList = ({ companies, loading, onView, onEdit, onDelete, pagination, onPageChange, searchText }) => {
    const [filteredInfo, setFilteredInfo] = useState({});
    const [adminLogin] = useAdminLoginMutation();
    const navigate = useNavigate();
    const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
    const [selectedCompany, setSelectedCompany] = useState(null);

    const handleTableChange = (pagination, filters, sorter) => {
        console.log('Table Change:', { pagination, filters, sorter });
        setFilteredInfo(filters);
        if (onPageChange) {
            onPageChange(pagination, filters, sorter);
        }
    };

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setFilteredInfo(prev => ({
            ...prev,
            [dataIndex]: selectedKeys
        }));
    };

    const handleReset = (clearFilters, confirm, dataIndex) => {
        clearFilters();
        confirm();
        setFilteredInfo(prev => ({
            ...prev,
            [dataIndex]: null
        }));
    };

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div className="custom-filter-dropdown">
                <div className="filter-input">
                    <Input
                        placeholder={`Search ${dataIndex}`}
                        value={selectedKeys[0]}
                        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        prefix={<FiSearch className="search-icon" />}
                        allowClear={{
                            clearIcon: <FiX className="clear-icon" />
                        }}
                        autoFocus
                    />
                </div>
                <Space className="filter-actions">
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        className="filter-button"
                        icon={<FiFilter />}
                    >
                        Apply Filter
                    </Button>
                    <Button
                        onClick={() => handleReset(clearFilters, confirm, dataIndex)}
                        className="filter-button"
                    >
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: filtered => (
            <FiFilter
                style={{
                    color: filtered ? '#3b82f6' : '#94a3b8'
                }}
            />
        ),
        onFilter: (value, record) => {
            return record[dataIndex]
                ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
                : '';
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
                        {!profilePic && getInitials(record.name)}
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
            dataIndex: 'name',
            key: 'name',
            ...getColumnSearchProps('name'),
            width: '200px',
            render: (text) => (
                <div className="company-name-cell">
                    {text || 'N/A'}
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
            dataIndex: 'created_at',
            key: 'created_at',
            width: '120px',
            render: (date) => (
                <div className="date-cell">
                    {date ? moment(date).format('YYYY-MM-DD') : '-'}
                </div>
            ),
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

    return (
        <div className="companies-table-wrapper">
            <Table
                columns={columns}
                dataSource={companies}
                loading={loading}
                pagination={pagination}
                onChange={handleTableChange}
                rowKey="id"
                className="companies-table"
                scroll={{ x: 1200 }}
            />
            <CreateUpgradePlan
                open={upgradeModalVisible}
                onCancel={handleUpgradeModalClose}
                companyId={selectedCompany?.id}
                isEditing={false}
                initialValues={null}
            />
        </div>
    );
};

export default CompanyList; 