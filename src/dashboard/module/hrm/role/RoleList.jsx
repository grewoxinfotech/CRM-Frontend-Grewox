import React, { useState, useEffect } from 'react';
import { Table, Space, Button, Tooltip, Tag, message, Modal, Select, Dropdown, Input } from 'antd';
import {
    FiEdit2,
    FiTrash2,
    FiMoreVertical,
    FiEye,
    FiX,
    FiShield,
    FiCheck,
    FiPlus,
    FiEdit,
    FiUsers
} from 'react-icons/fi';
import { useGetAllRolesQuery, useDeleteRoleMutation } from './services/roleApi';

const RoleList = ({ onEdit, searchText, filters }) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
        total: 0
    });
    const [viewPermissionsModal, setViewPermissionsModal] = useState(false);
    const [selectedPermissions, setSelectedPermissions] = useState(null);
    const [selectedRole, setSelectedRole] = useState(null);
    const [activeTab, setActiveTab] = useState('CRM');

    // RTK Query hooks
    const { data: rolesResponse = { data: [], pagination: {} }, isLoading } = useGetAllRolesQuery({
        page: pagination.current,
        pageSize: pagination.pageSize,
        search: searchText,
        ...filters
    });
    const [deleteRole] = useDeleteRoleMutation();

    // Update pagination when response changes
    useEffect(() => {
        if (rolesResponse?.pagination) {
            setPagination(prev => ({
                ...prev,
                total: rolesResponse.pagination.total
            }));
        }
    }, [rolesResponse]);

    const handleTableChange = (newPagination, filters, sorter) => {
        setPagination(prev => ({
            ...prev,
            current: newPagination.current,
            pageSize: newPagination.pageSize
        }));
    };

    const handleDelete = (recordOrIds) => {
        const isMultiple = Array.isArray(recordOrIds);
        const title = isMultiple ? 'Delete Selected Roles' : 'Delete Role';
        const content = isMultiple
            ? `Are you sure you want to delete ${recordOrIds.length} selected roles?`
            : 'Are you sure you want to delete this role?';

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
                        await Promise.all(recordOrIds.map(id => deleteRole(id).unwrap()));
                        message.success(`${recordOrIds.length} roles deleted successfully`);
                        setSelectedRowKeys([]); // Clear selection after delete
                    } else {
                        await deleteRole(recordOrIds).unwrap();
                        message.success('Role deleted successfully');
                    }
                } catch (error) {
                    message.error(error?.data?.message || 'Failed to delete role(s)');
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

    const showAllPermissions = (role) => {
        if (!role?.permissions) {
            message.warning("No permissions to display");
            return;
        }

        try {
            const parsedPermissions = typeof role.permissions === 'string'
                ? JSON.parse(role.permissions)
                : role.permissions;

            // Find first module with permissions and set it as active
            for (const module of modules) {
                const hasPermissions = subModules[module]?.some(subModule => {
                    const perms = parsedPermissions[subModule.key];
                    return perms && perms[0]?.permissions?.length > 0;
                });
                if (hasPermissions) {
                    setActiveTab(module);
                    break;
                }
            }

            setSelectedRole(role);
            setSelectedPermissions(parsedPermissions);
            setViewPermissionsModal(true);
        } catch (error) {
            console.error('Error parsing permissions:', error);
            message.error("Failed to parse permissions");
        }
    };

    const handleClosePermissionsModal = () => {
        setViewPermissionsModal(false);
        setSelectedRole(null);
        setSelectedPermissions(null);
        setActiveTab('CRM');
    };

    const renderFullPermissions = (permissions) => {
        if (!permissions) return <div>No Permissions</div>;

        try {
            return (
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    type="card"
                    className="custom-tabs"
                    items={modules.map(module => ({
                        key: module,
                        label: module,
                        children: (
                            <div className="permission-section">
                                <Row className="permission-header" align="middle" style={{
                                    marginBottom: '16px',
                                    padding: '12px 16px',
                                    backgroundColor: '#fafafa',
                                    borderRadius: '8px',
                                }}>
                                    <Col span={8}>
                                        <Text strong style={{ fontSize: '14px', color: '#262626' }}>
                                            Module Name
                                        </Text>
                                    </Col>
                                    <Col span={16}>
                                        <Row align="middle">
                                            {['View', 'Create', 'Update', 'Delete'].map(action => (
                                                <Col key={action} span={6} style={{
                                                    fontSize: '14px',
                                                    color: '#262626',
                                                    textAlign: 'center',
                                                    fontWeight: 500,
                                                }}>
                                                    {action}
                                                </Col>
                                            ))}
                                        </Row>
                                    </Col>
                                </Row>

                                {subModules[module]?.map(subModule => {
                                    const modulePerms = permissions[subModule.key]?.[0]?.permissions || [];

                                    return (
                                        <Row
                                            key={subModule.key}
                                            className="permission-row"
                                            align="middle"
                                            style={{
                                                padding: '12px 16px',
                                                borderBottom: '1px solid #f0f0f0',
                                                transition: 'background-color 0.3s ease',
                                                '&:hover': {
                                                    backgroundColor: '#fafafa',
                                                }
                                            }}
                                        >
                                            <Col span={8}>
                                                <Text style={{ fontSize: '14px', color: '#595959' }}>
                                                    {subModule.title}
                                                </Text>
                                            </Col>
                                            <Col span={16}>
                                                <Row align="middle" justify="space-around">
                                                    {['view', 'create', 'update', 'delete'].map(action => (
                                                        <Col key={action} span={6} style={{ textAlign: 'center' }}>
                                                            {modulePerms.includes(action) ? (
                                                                <FiCheck className="permission-check" />
                                                            ) : (
                                                                <div className="permission-empty" />
                                                            )}
                                                        </Col>
                                                    ))}
                                                </Row>
                                            </Col>
                                        </Row>
                                    );
                                })}
                            </div>
                        ),
                    }))}
                />
            );
        } catch (error) {
            console.error('Error rendering permissions:', error);
            return <div>Error displaying permissions</div>;
        }
    };

    const renderPermissionTags = (permissions, record) => {
        if (!permissions) return <Tag color="default">No Permissions</Tag>;

        try {
            const parsedPermissions = typeof permissions === 'string' ? JSON.parse(permissions) : permissions;
            const modules = Object.keys(parsedPermissions);
            const firstThreeModules = modules.slice(0, 3);

            return (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    {firstThreeModules.map(moduleName => {
                        const modulePerms = parsedPermissions[moduleName][0]?.permissions || [];
                        const displayName = moduleName
                            .replace('dashboards-', '')
                            .replace('extra-pages-customersupports-', '')
                            .replace('extra-', '');

                        return (
                            <Tag
                                key={moduleName}
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    background: '#1890ff',
                                    border: 'none',
                                    color: '#ffffff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    height: '36px'
                                }}
                            >
                                <span style={{ fontWeight: '500' }}>{displayName}</span>
                                <span style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px',
                                    borderLeft: '1px solid rgba(255,255,255,0.3)',
                                    marginLeft: '4px',
                                    paddingLeft: '8px',
                                    height: '20px'
                                }}>
                                    {modulePerms.includes('view') && (
                                        <Tooltip title="View Permission">
                                            <FiEye size={16} style={{ cursor: 'pointer' }} />
                                        </Tooltip>
                                    )}
                                    {modulePerms.includes('create') && (
                                        <Tooltip title="Create Permission">
                                            <FiPlus size={16} style={{ cursor: 'pointer' }} />
                                        </Tooltip>
                                    )}
                                    {modulePerms.includes('update') && (
                                        <Tooltip title="Update Permission">
                                            <FiEdit size={16} style={{ cursor: 'pointer' }} />
                                        </Tooltip>
                                    )}
                                    {modulePerms.includes('delete') && (
                                        <Tooltip title="Delete Permission">
                                            <FiTrash2 size={16} style={{ cursor: 'pointer' }} />
                                        </Tooltip>
                                    )}
                                </span>
                            </Tag>
                        );
                    })}
                    <Tooltip title="View All Permissions">
                        <Button
                            type="primary"
                            icon={<FiEye size={16} />}
                            onClick={(e) => {
                                e.stopPropagation();
                                showAllPermissions({
                                    ...record,
                                    permissions: parsedPermissions
                                });
                            }}
                            style={{
                                padding: '8px 12px',
                                height: '36px',
                                fontSize: '14px',
                                background: '#1890ff',
                                border: 'none',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                fontWeight: '500',
                                boxShadow: 'none'
                            }}
                        >
                            <span>View All</span>
                            <Tag
                                style={{
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    borderRadius: '4px',
                                    padding: '0 6px',
                                    fontSize: '12px',
                                    border: 'none',
                                    color: '#ffffff',
                                    margin: 0,
                                    height: '20px',
                                    lineHeight: '20px'
                                }}
                            >
                                {modules.length}
                            </Tag>
                        </Button>
                    </Tooltip>
                </div>
            );
        } catch (error) {
            console.error('Error rendering permission tags:', error);
            return <Tag color="default">Invalid Permissions</Tag>;
        }
    };

    const columns = [
        {
            title: 'Role Name',
            dataIndex: 'role_name',
            key: 'role_name',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        placeholder="Search role name"
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
                (record.role_name?.toLowerCase() || '').includes(value.toLowerCase()),
        },
        {
            title: "Permissions",
            dataIndex: "permissions",
            key: "permissions",
            width: "65%",
            render: (permissions, record) => renderPermissionTags(permissions, record),
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
                                    label: 'Edit Role',
                                    onClick: () => onEdit(record),
                                },
                                {
                                    key: 'delete',
                                    icon: <FiTrash2 style={{ fontSize: '14px', color: '#ff4d4f' }} />,
                                    label: 'Delete Role',
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
        ...pagination,
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
            <div className='role-list-container'>
                <Table
                    columns={columns}
                    dataSource={rolesResponse.data}
                    loading={isLoading}
                    rowKey="id"
                    rowSelection={rowSelection}
                    pagination={paginationConfig}
                    onChange={handleTableChange}
                    className="custom-table"
                    scroll={{ x: 1000, y: '' }}
                    style={{
                        background: '#ffffff',
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                    }}
                    onRow={(record) => ({
                        onClick: () => showAllPermissions(record)
                    })}
                />
            </div>
            {viewPermissionsModal && (
                <Modal
                    title={
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <FiShield style={{ color: '#FFF' }} size={24} />
                            <span style={{ fontSize: '16px', fontWeight: 600, color: '#FFF' }}>View Permissions - {selectedRole?.role_name}</span>
                        </div>
                    }
                    open={viewPermissionsModal}
                    onCancel={handleClosePermissionsModal}
                    footer={null}
                    width={800}
                    className="permissions-modal"
                    destroyOnClose
                >
                    {selectedPermissions && renderFullPermissions(selectedPermissions)}
                </Modal>
            )}
        </>
    );
};

export default RoleList; 