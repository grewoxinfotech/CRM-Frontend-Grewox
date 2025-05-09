import React, { useState, useMemo } from 'react';
import { Table, Space, Button, Tooltip, Tag, message, Modal, Dropdown, Input, Avatar } from 'antd';
import {
    FiEdit2,
    FiTrash2,
    FiMoreVertical,
    FiMapPin,
    FiUser,
    FiUsers,
    FiPhone,
    FiMail,
    FiLogIn
} from 'react-icons/fi';
import { FaCodeBranch } from "react-icons/fa6";
import { useGetAllBranchesQuery, useDeleteBranchMutation } from './services/branchApi';
import dayjs from 'dayjs';
import { useGetUsersQuery } from '../../user-management/users/services/userApi';
import './branch.scss';

const BranchList = ({ onEdit, searchText = '', filters = {} }) => {
    // RTK Query hooks
    const { data: branchesData = [], isLoading } = useGetAllBranchesQuery();
    const [deleteBranch] = useDeleteBranchMutation();
    const { data: userData, isLoading: isLoadingUsers } = useGetUsersQuery();
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    // Create a map of user IDs to user data for quick lookup
    const userMap = useMemo(() => {
        const map = {};
        if (userData?.data) {
            userData.data.forEach(user => {
                if (user && user.id) {
                    map[user.id] = user;
                }
            });
        }
        return map;
    }, [userData]);

    // Transform branches data
    const branches = useMemo(() => {
        let filteredData = [];

        if (!branchesData) return [];
        if (Array.isArray(branchesData)) {
            filteredData = branchesData;
        } else if (Array.isArray(branchesData.data)) {
            filteredData = branchesData.data;
        }

        // Apply filters
        return filteredData.filter(branch => {
            if (!branch) return false;

            const branchManager = userMap[branch.branchManager] || {};
            const managerName = branchManager?.username || 'No Manager';

            const matchesSearch = !searchText || searchText.toLowerCase() === '' ||
                (branch.branchName || '').toLowerCase().includes(searchText.toLowerCase()) ||
                managerName.toLowerCase().includes(searchText.toLowerCase());

            const matchesDesignationType = !filters.designationType ||
                branch.designation_type === filters.designationType;

            const matchesStatus = !filters.status ||
                branch.status === filters.status;

            const matchesDateRange = !filters.dateRange?.length ||
                (dayjs(branch.created_at).isAfter(filters.dateRange[0]) &&
                    dayjs(branch.created_at).isBefore(filters.dateRange[1]));

            return matchesSearch && matchesDesignationType && matchesStatus && matchesDateRange;
        });
    }, [branchesData, searchText, filters, userMap]);

    const handleDelete = async (recordOrIds) => {
        const isMultiple = Array.isArray(recordOrIds);
        const title = isMultiple ? 'Delete Selected Branches' : 'Delete Branch';
        const content = isMultiple
            ? `Are you sure you want to delete ${recordOrIds.length} selected branches?`
            : 'Are you sure you want to delete this branch?';

        Modal.confirm({
            title,
            content,
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            bodyStyle: { padding: "20px" },
            onOk: async () => {
                try {
                    if (isMultiple) {
                        // Handle bulk delete
                        await Promise.all(recordOrIds.map(id => deleteBranch(id).unwrap()));
                        message.success(`${recordOrIds.length} branches deleted successfully`);
                        setSelectedRowKeys([]); // Clear selection after delete
                    } else {
                        // Handle single delete
                        await deleteBranch(recordOrIds).unwrap();
                        message.success('Branch deleted successfully');
                    }
                } catch (error) {
                    message.error(error?.data?.message || 'Failed to delete branch(es)');
                }
            },
        });
    };

    // Row selection config
    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys) => {
            setSelectedRowKeys(newSelectedRowKeys);
        }
    };

    // Bulk actions component
    const BulkActions = () => (
        <div className="bulk-actions">
            {selectedRowKeys.length > 0 && (
                <Button
                    type="primary"
                    danger
                    icon={<FiTrash2 size={16} />}
                    onClick={() => handleDelete(selectedRowKeys)}
                >
                    Delete Selected ({selectedRowKeys.length})
                </Button>
            )}
        </div>
    );

    const getBranchStyle = () => {
        return {
            color: "#2563EB",
            bg: "#E6F7FF",
            iconBg: "rgba(37, 99, 235, 0.1)"
        };
    };

    const columns = [
        {
            title: '#',
            dataIndex: 'index',
            key: 'index',
            width: '60px',
            render: (_, __, index) => (
                <div style={{
                    color: '#1677ff',
                    fontSize: '14px',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#f0f7ff',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    margin: '0 auto',
                    width: '28px',
                    height: '28px'
                }}>
                    {index + 1}
                </div>
            ),
        },
        {
            title: 'Branch Name',
            dataIndex: 'branchName',
            key: 'branchName',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Search branch name"
                        value={selectedKeys[0]}
                        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={() => confirm()}
                        style={{ width: 188, marginBottom: 8, display: 'block' }}
                    />
                    <Space>
                        <Button
                            type="primary"
                            onClick={() => confirm()}
                            size="small"
                            style={{ width: 90 }}
                        >
                            Filter
                        </Button>
                        <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
                            Reset
                        </Button>
                    </Space>
                </div>
            ),
            onFilter: (value, record) =>
                record.branchName?.toLowerCase().includes(value.toLowerCase()),
            render: (text, record) => {
                const style = getBranchStyle();
                return (
                    <div className="item-wrapper">
                        <div className="item-content">
                            <div
                                className="icon-wrapper"
                                style={{
                                    color: style.color,
                                    background: style.iconBg
                                }}
                            >
                                <FaCodeBranch className="item-icon" />
                            </div>
                            <div className="info-wrapper">
                                <div
                                    className="name"
                                    style={{
                                        color: style.color,
                                        fontWeight: 600,
                                        fontSize: "14px"
                                    }}
                                >
                                    {text}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            title: 'Branch Manager',
            dataIndex: 'branchManager',
            key: 'branchManager',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Search manager"
                        value={selectedKeys[0]}
                        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={() => confirm()}
                        style={{ width: 188, marginBottom: 8, display: 'block' }}
                    />
                    <Space>
                        <Button
                            type="primary"
                            onClick={() => confirm()}
                            size="small"
                            style={{ width: 90 }}
                        >
                            Filter
                        </Button>
                        <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
                            Reset
                        </Button>
                    </Space>
                </div>
            ),
            onFilter: (value, record) => {
                const manager = userMap[record.branchManager] || {};
                const managerName = manager?.username || '';
                return managerName.toLowerCase().includes(value.toLowerCase());
            },
            render: (managerId) => {
                const manager = userMap[managerId] || {};
                const managerName = manager?.username || 'No Manager';
                return (
                    <div className="item-wrapper">
                        <div className="item-content" style={{ padding: '4px 8px' }}>
                            <div
                                className="icon-wrapper"
                                style={{
                                    color: "#7C3AED",
                                    background: "rgba(124, 58, 237, 0.1)",
                                    width: '28px',
                                    height: '28px'
                                }}
                            >
                                <FiUser className="item-icon" />
                            </div>
                            <div className="info-wrapper">
                                <Tooltip title={manager?.email || 'No email'} placement="topLeft">
                                    <div
                                        className="name"
                                        style={{
                                            color: "#7C3AED",
                                            fontWeight: 500,
                                            fontSize: "14px"
                                        }}
                                    >
                                        {managerName}
                                    </div>
                                </Tooltip>
                            </div>
                        </div>
                    </div>
                );
            },
        },
        {
            title: 'Address',
            dataIndex: 'branchAddress',
            key: 'branchAddress',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Search address"
                        value={selectedKeys[0]}
                        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={() => confirm()}
                        style={{ width: 188, marginBottom: 8, display: 'block' }}
                    />
                    <Space>
                        <Button
                            type="primary"
                            onClick={() => confirm()}
                            size="small"
                            style={{ width: 90 }}
                        >
                            Filter
                        </Button>
                        <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
                            Reset
                        </Button>
                    </Space>
                </div>
            ),
            onFilter: (value, record) =>
                (record.branchAddress?.toLowerCase() || '').includes(value.toLowerCase()) ||
                (record.phone?.toLowerCase() || '').includes(value.toLowerCase()),
            render: (address, record) => (
                <div className="item-wrapper">
                    <div className="item-content">
                        <div
                            className="icon-wrapper"
                            style={{
                                color: "#EA580C",
                                background: "rgba(234, 88, 12, 0.1)"
                            }}
                        >
                            <FiMapPin className="item-icon" />
                        </div>
                        <div className="info-wrapper">
                            <Tooltip title={address}>
                                <div className="name" style={{ color: "#EA580C", fontWeight: 500 }}>
                                    {address || 'N/A'}
                                </div>
                            </Tooltip>
                            {record.phone && (
                                <div className="text-sm text-gray-500" style={{ fontSize: "12px", marginTop: "2px" }}>
                                    <FiPhone className="inline mr-1" style={{ fontSize: "12px" }} />
                                    {record.phone}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: '80px',
            align: 'center',
            render: (_, record) => (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Dropdown
                        menu={{
                            items: [
                                {
                                    key: 'edit',
                                    icon: <FiEdit2 style={{ fontSize: '14px', color: '#1890ff' }} />,
                                    label: 'Edit Branch',
                                    onClick: () => onEdit(record),
                                },
                                {
                                    key: 'delete',
                                    icon: <FiTrash2 style={{ fontSize: '14px', color: '#ff4d4f' }} />,
                                    label: 'Delete Branch',
                                    danger: true,
                                    onClick: () => handleDelete(record.id),
                                }
                            ]
                        }}
                        placement="bottomRight"
                        trigger={['click']}
                    >
                        <Button
                            type="text"
                            icon={<FiMoreVertical size={16} />}
                            className="action-button"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </Dropdown>
                </div>
            ),
        },
    ];

    return (
        <>
            <BulkActions />
            <Table
                columns={columns}
                dataSource={branches}
                loading={isLoading}
                rowKey="id"
                rowSelection={rowSelection}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} branches`,
                }}
                className="custom-table"
                scroll={{ x: 1000, y: 'calc(100vh - 350px)' }}
                style={{
                    background: '#ffffff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                }}
            />
        </>
    );
};

export default BranchList; 