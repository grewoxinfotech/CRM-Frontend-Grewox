import React, { useState, useEffect } from 'react';
import { Table, Space, Button, Tooltip, Tag, message, Modal, Select, Dropdown, Input, Avatar } from 'antd';
import {
    FiEdit2,
    FiTrash2,
    FiMoreVertical,
    FiUsers,
    FiMapPin,
} from 'react-icons/fi';
import { useGetAllDepartmentsQuery, useDeleteDepartmentMutation } from './services/departmentApi';
import { useGetAllBranchesQuery } from '../Branch/services/branchApi';
import dayjs from 'dayjs';
import './department.scss';

const { Option } = Select;

const DepartmentList = ({ onEdit, searchText = '', filters = {} }) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // RTK Query hooks
    const { data: response = {}, isLoading } = useGetAllDepartmentsQuery({
        page: currentPage,
        pageSize,
        search: searchText,
        ...filters
    });
    const { data: branchesData = [], isLoading: isLoadingBranches } = useGetAllBranchesQuery();
    const [deleteDepartment] = useDeleteDepartmentMutation();

    // Destructure data and pagination from response
    const { data: departments = [], pagination = {} } = response;

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
        const title = isMultiple ? 'Delete Selected Departments' : 'Delete Department';
        const content = isMultiple
            ? `Are you sure you want to delete ${recordOrIds.length} selected departments?`
            : 'Are you sure you want to delete this department?';

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
                        await Promise.all(recordOrIds.map(id => deleteDepartment(id).unwrap()));
                        message.success(`${recordOrIds.length} departments deleted successfully`);
                        setSelectedRowKeys([]);
                    } else {
                        await deleteDepartment(recordOrIds).unwrap();
                        message.success('Department deleted successfully');
                    }
                } catch (error) {
                    message.error(error?.data?.message || 'Failed to delete department(s)');
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
        <div className={`bulk-actions ${selectedRowKeys.length > 0 ? 'active' : ''}`}>
            {selectedRowKeys.length > 0 && (
                <Button
                    type="primary"
                    danger
                    icon={<FiTrash2 />}
                    onClick={() => handleDelete(selectedRowKeys)}
                >
                    Delete Selected ({selectedRowKeys.length})
                </Button>
            )}
        </div>
    );

    const columns = [
        {
            title: 'Department Name',
            dataIndex: 'department_name',
            key: 'department_name',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Search department name"
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
                (record.department_name?.toLowerCase() || '').includes(value.toLowerCase()),
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
                            <FiUsers className="item-icon" />
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
            title: 'Created By',
            dataIndex: 'created_by',
            key: 'created_by',
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => dayjs(date).format('DD MMM YYYY'),
        },
        {
            title: 'Actions',
            key: 'actions',
            width: '80px',
            fixed: 'right',
            render: (_, record) => (
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <Dropdown
                        menu={{
                            items: [
                                {
                                    key: 'edit',
                                    icon: <FiEdit2 style={{ fontSize: '14px', color: '#1890ff' }} />,
                                    label: 'Edit Department',
                                    onClick: () => onEdit(record),
                                },
                                {
                                    key: 'delete',
                                    icon: <FiTrash2 style={{ fontSize: '14px', color: '#ff4d4f' }} />,
                                    label: 'Delete Department',
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

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const paginationConfig = {
        current: currentPage,
        pageSize: pageSize,
        total: pagination.total,
        onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
        },
        showSizeChanger: true,
        showTotal: (total) => `Total ${total} items`,
        pageSizeOptions: ['10', '20', '50', '100'],
        locale: {
            items_per_page: isMobile ? '' : '/ page',
        },
    };

    return (
        <>
            <BulkActions />
            <div className='department-list-container'>
                <Table
                    columns={columns}
                    dataSource={departments}
                    loading={isLoading}
                    rowKey="id"
                    rowSelection={rowSelection}
                    pagination={paginationConfig}
                    // className="custom-table"
                    scroll={{ x: 1300, y: '' }}
                    style={{
                        background: '#ffffff',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                    }}
                />
            </div>
        </>
    );
};

export default DepartmentList; 