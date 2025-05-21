import React, { useState } from 'react';
import { Table, Button, Tag, Dropdown, Tooltip, Typography, Modal, Spin, Alert, Menu, Input, Space } from 'antd';
import { FiEdit2, FiTrash2, FiEye, FiMoreVertical, FiUser, FiPhone, FiMail, FiMapPin, FiGlobe } from 'react-icons/fi';
import dayjs from 'dayjs';
import { useGetVendorsQuery, useDeleteVendorMutation } from './services/vendorApi';
import { message } from 'antd';
import EditVendor from './EditVendor';

const { Text } = Typography;

const VendorList = ({
    onEdit,
    onDelete,
    onView,
    searchText,
    loading,
    data,
    pagination,
    onChange
}) => {
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [selectedVendorId, setSelectedVendorId] = useState(null);
    const [selectedVendor, setSelectedVendor] = useState(null);
    const { isError } = useGetVendorsQuery();
    const [deleteVendor] = useDeleteVendorMutation();
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);

    const vendors = data?.data || [];

    if (isError) {
        return <Alert type="error" message="Failed to fetch vendors" />;
    }

    const handleCancel = () => {
        setIsEditModalVisible(false);
        setSelectedVendorId(null);
        setSelectedVendor(null);
    };

    const handleBulkDelete = () => {
        onDelete(selectedRowKeys);
        setSelectedRowKeys([]);
    };

    const getDropdownItems = (record) => ({
        items: [
            {
                key: 'edit',
                icon: <FiEdit2 />,
                label: 'Edit',
                onClick: () => onEdit(record),
            },
            {
                key: 'delete',
                icon: <FiTrash2 />,
                label: 'Delete',
                onClick: () => onDelete(record),
                danger: true,
            },
        ],
    });

    const getActionItems = (record) => [
        {
            key: 'edit',
            icon: <FiEdit2 style={{ fontSize: '16px' }} />,
            label: 'Edit',
            onClick: () => onEdit(record)
        },
        {
            key: 'delete',
            icon: <FiTrash2 style={{ fontSize: '16px', color: '#ff4d4f' }} />,
            label: 'Delete',
            danger: true,
            onClick: () => onDelete(record)
        }
    ];

    const columns = [
        {
            title: 'Vendor Name',
            dataIndex: 'name',
            key: 'name',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Search vendor name"
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
                record.name.toLowerCase().includes(value.toLowerCase()) ||
                record.company_name?.toLowerCase().includes(value.toLowerCase()),
            render: (name) => (
                <div className="item-wrapper">
                    <div className="item-content">
                        <div className="icon-wrapper" style={{
                            color: "#1890ff",
                            background: "rgba(24, 144, 255, 0.1)",
                            width: "40px",
                            height: "40px",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <FiUser size={20} />
                        </div>
                        <div className="info-wrapper">
                            <div className="name" style={{ color: "#262626", fontWeight: 600, fontSize: "15px" }}>
                                {name || "N/A"}
                            </div>
                            <div className="subtitle" style={{ color: "#8c8c8c", fontSize: "13px" }}>
                                Vendor
                            </div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Contact',
            dataIndex: 'contact',
            key: 'contact',
            render: (contact) => (
                <div className="item-wrapper">
                    <div className="item-content">
                        <div className="icon-wrapper" style={{
                            color: "#52c41a",
                            background: "rgba(82, 196, 26, 0.1)",
                            width: "32px",
                            height: "32px",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <FiPhone size={16} />
                        </div>
                        <Text>{contact || "N/A"}</Text>
                    </div>
                </div>
            ),
            sorter: (a, b) => (a?.contact || '').localeCompare(b?.contact || ''),
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            ellipsis: true,
            sorter: (a, b) => (a?.email || '').localeCompare(b?.email || ''),
            render: (email) => (
                <div className="item-wrapper">
                    <div className="item-content">
                        <div className="icon-wrapper" style={{
                            color: "#722ed1",
                            background: "rgba(114, 46, 209, 0.1)",
                            width: "32px",
                            height: "32px",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <FiMail size={16} />
                        </div>
                        <Text>{email || "N/A"}</Text>
                    </div>
                </div>
            ),
        },
        {
            title: 'Location',
            key: 'location',
            render: (_, record) => (
                <div className="item-wrapper">
                    <div className="item-content">
                        <div className="icon-wrapper" style={{
                            color: "#f5222d",
                            background: "rgba(245, 34, 45, 0.1)",
                            width: "32px",
                            height: "32px",
                            borderRadius: "6px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <FiMapPin size={16} />
                        </div>
                        <Text>
                            {[record.city, record.state, record.country].filter(Boolean).join(', ') || 'N/A'}
                        </Text>
                    </div>
                </div>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = '#52c41a';
                let background = '#f6ffed';

                if (status?.toLowerCase() === 'inactive') {
                    color = '#ff4d4f';
                    background = '#fff1f0';
                }

                return (
                    <Tag style={{
                        color: color,
                        background: background,
                        border: 'none',
                        padding: '4px 12px',
                        borderRadius: '6px',
                        textTransform: 'capitalize'
                    }}>
                        {status || 'Active'}
                    </Tag>
                );
            }
        },
        {
            title: "Actions",
            key: "actions",
            width: 80,
            render: (_, record) => (
                <Dropdown
                    overlay={
                        <Menu>
                            {getActionItems(record).map(item => (
                                <Menu.Item key={item.key} icon={item.icon} onClick={item.onClick} danger={item.danger}>
                                    {item.label}
                                </Menu.Item>
                            ))}
                        </Menu>
                    }
                    trigger={['click']}
                >
                    <Button
                        type="text"
                        icon={<FiMoreVertical size={16} />}
                        style={{
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '6px',
                            transition: 'all 0.3s ease'
                        }}
                        className="action-btn"
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#f0f2f5';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                        }}
                    />
                </Dropdown>
            ),
        },
    ];

    // Remove local filtering since it's now handled by the server
    const filteredVendors = vendors;

    // Update pagination configuration
    const paginationConfig = {
        ...pagination,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `Total ${total} vendors`,
        pageSizeOptions: ["10", "20", "50", "100"]
    };

    // Row selection config
    const rowSelection = {
        selectedRowKeys,
        onChange: (newSelectedRowKeys) => {
            setSelectedRowKeys(newSelectedRowKeys);
        }
    };

    return (
        <>
            {selectedRowKeys.length > 0 && (
                <div className="bulk-actions">
                    <Button
                        type="primary"
                        danger
                        icon={<FiTrash2 size={16} />}
                        onClick={handleBulkDelete}
                    >
                        Delete Selected ({selectedRowKeys.length})
                    </Button>
                </div>
            )}
            <Table
                columns={columns}
                dataSource={filteredVendors}
                rowSelection={rowSelection}
                rowKey="id"
                loading={loading}
                scroll={{ x: 1200 }}
                pagination={paginationConfig}
                onChange={onChange}
                style={{
                    background: '#ffffff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                }}
            />

            {/* <EditVendor 
                vendorId={selectedVendorId}
                visible={isEditModalVisible}
                onCancel={handleCancel}
                initialValues={selectedVendor}
            /> */}
        </>
    );
};

export default VendorList;