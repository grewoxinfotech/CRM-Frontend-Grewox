import React, { useState } from 'react';
import { Table, Space, Button, Tooltip, Tag, message, Modal, Select, Dropdown, Input, Avatar } from 'antd';
import {
    FiEdit2,
    FiTrash2,
    FiMoreVertical,
    FiBriefcase,
    FiMapPin,
    FiUsers
} from 'react-icons/fi';
import {
    useGetAllDesignationsQuery,
    useDeleteDesignationMutation,
    useUpdateDesignationMutation
} from './services/designationApi';
import { useGetAllBranchesQuery } from '../Branch/services/branchApi';
import dayjs from 'dayjs';
import './designation.scss';

const { Option } = Select;

const DesignationList = ({ onEdit, searchText, filters }) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    // RTK Query hooks
    const { data: designationsData = [], isLoading: isLoadingDesignations } = useGetAllDesignationsQuery();
    const { data: branchesData = [], isLoading: isLoadingBranches } = useGetAllBranchesQuery();
    const [deleteDesignation] = useDeleteDesignationMutation();

    // Transform designations data
    const designations = React.useMemo(() => {
        let filteredData = [];

        if (!designationsData) return [];
        if (Array.isArray(designationsData)) {
            filteredData = designationsData;
        } else if (Array.isArray(designationsData.data)) {
            filteredData = designationsData.data;
        }

        // Apply filters
        return filteredData.filter(designation => {
            const matchesSearch = !searchText || searchText.toLowerCase() === '' ||
                designation.designation_name.toLowerCase().includes(searchText.toLowerCase()) ||
                (designation.company_type || '').toLowerCase().includes(searchText.toLowerCase());

            const matchesCompanyType = !filters.companyType ||
                designation.company_type === filters.companyType;

            const matchesStatus = !filters.status ||
                designation.status === filters.status;

            const matchesDateRange = !filters.dateRange?.length ||
                (dayjs(designation.created_at).isAfter(filters.dateRange[0]) &&
                    dayjs(designation.created_at).isBefore(filters.dateRange[1]));

            return matchesSearch && matchesCompanyType && matchesStatus && matchesDateRange;
        });
    }, [designationsData, searchText, filters]);

    // Transform branches data into a map for quick lookup
    const branchMap = React.useMemo(() => {
        const map = {};
        if (Array.isArray(branchesData)) {
            branchesData.forEach(branch => {
                map[branch.id] = branch;
            });
        } else if (Array.isArray(branchesData.data)) {
            branchesData.data.forEach(branch => {
                map[branch.id] = branch;
            });
        }
        return map;
    }, [branchesData]);

    const handleDelete = (recordOrIds) => {
        const isMultiple = Array.isArray(recordOrIds);
        const title = isMultiple ? 'Delete Selected Designations' : 'Delete Designation';
        const content = isMultiple
            ? `Are you sure you want to delete ${recordOrIds.length} selected designations?`
            : 'Are you sure you want to delete this designation?';

        Modal.confirm({
            title,
            content,
            okText: 'Yes',
            okType: 'danger',
            bodyStyle: { padding: '20px' },
            cancelText: 'No',
            onOk: async () => {
                try {
                    if (isMultiple) {
                        // Handle bulk delete
                        await Promise.all(recordOrIds.map(id => deleteDesignation(id).unwrap()));
                        message.success(`${recordOrIds.length} designations deleted successfully`);
                        setSelectedRowKeys([]); // Clear selection after delete
                    } else {
                        // Handle single delete
                        await deleteDesignation(recordOrIds).unwrap();
                        message.success('Designation deleted successfully');
                    }
                } catch (error) {
                    message.error(error?.data?.message || 'Failed to delete designation(s)');
                }
            },
        });
    };

    const getCompanyTypeColor = (type) => {
        switch (type?.toLowerCase()) {
            case 'private':
                return '#2563EB';
            case 'public':
                return '#059669';
            case 'government':
                return '#D97706';
            default:
                return '#6B7280';
        }
    };

    const getCompanyTypeBg = (type) => {
        switch (type?.toLowerCase()) {
            case 'private':
                return 'rgba(37, 99, 235, 0.1)';
            case 'public':
                return 'rgba(5, 150, 105, 0.1)';
            case 'government':
                return 'rgba(217, 119, 6, 0.1)';
            default:
                return 'rgba(107, 114, 128, 0.1)';
        }
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
            title: 'Designation Name',
            dataIndex: 'designation_name',
            key: 'designation_name',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Search designation name"
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
                (record.designation_name?.toLowerCase() || '').includes(value.toLowerCase()),
            render: (text, record) => (
                <div className="item-wrapper">
                    <div className="item-content">
                        <div
                            className="icon-wrapper"
                            style={{
                                color: "#7C3AED",
                                background: "rgba(124, 58, 237, 0.1)"
                            }}
                        >
                            <FiBriefcase className="item-icon" />
                        </div>
                        <div className="info-wrapper">
                            <div
                                className="name"
                                style={{
                                    color: "#7C3AED",
                                    fontWeight: 600,
                                    fontSize: "14px"
                                }}
                            >
                                {text}
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Branch',
            dataIndex: 'branch',
            key: 'branch',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Search branch"
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
                const branch = branchMap[record.branch];
                const branchName = branch?.branchName || '';
                return branchName.toLowerCase().includes(value.toLowerCase());
            },
            render: (branchId) => {
                const branch = branchMap[branchId];
                return (
                    <div className="item-wrapper">
                        <div className="item-content">
                            <div
                                className="icon-wrapper"
                                style={{
                                    color: "#2563EB",
                                    background: "rgba(37, 99, 235, 0.1)"
                                }}
                            >
                                <FiMapPin className="item-icon" />
                            </div>
                            <div className="info-wrapper">
                                <div
                                    className="name"
                                    style={{
                                        color: "#2563EB",
                                        fontWeight: 500,
                                        fontSize: "14px"
                                    }}
                                >
                                    {branch?.branchName || 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            },
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
                                    label: 'Edit Designation',
                                    onClick: () => onEdit(record),
                                },
                                {
                                    key: 'delete',
                                    icon: <FiTrash2 style={{ fontSize: '14px', color: '#ff4d4f' }} />,
                                    label: 'Delete Designation',
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
                dataSource={designations}
                loading={isLoadingDesignations}
                rowKey="id"
                rowSelection={rowSelection}
                pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} designations`,
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

export default DesignationList; 