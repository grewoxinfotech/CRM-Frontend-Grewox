import React, { useState } from "react";
import { Table, Button, Tag, Space, Dropdown, Modal, Tabs, Row, Col, Typography, Tooltip, message, Input } from "antd";
import { FiEdit2, FiTrash2, FiMoreVertical, FiEye, FiX, FiShield, FiCheck, FiPlus, FiEdit, FiUsers } from "react-icons/fi";
import EditRole from "./EditRole";

const { Text } = Typography;

const RoleList = ({ roles, onEdit, onDelete }) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [viewPermissionsModal, setViewPermissionsModal] = useState(false);
    const [selectedPermissions, setSelectedPermissions] = useState(null);
    const [selectedRole, setSelectedRole] = useState(null);
    const [activeTab, setActiveTab] = useState('CRM');
    const [currentPage, setCurrentPage] = useState(1);

    const modules = ['User Management', 'CRM', 'Communication', 'HRM', 'Job'];
    const subModules = {
        'User Management': [
            { key: 'extra-users-list', title: 'Users' },
            { key: 'extra-users-client-list', title: 'Clients' }
        ],
        CRM: [
            { key: 'dashboards-project-list', title: 'Project' },
            { key: 'dashboards-sales', title: 'Sales' },
            { key: 'dashboards-lead', title: 'Leads' },
            { key: 'dashboards-deal', title: 'Deals' },
            { key: 'dashboards-proposal', title: 'Proposal' },
            { key: 'dashboards-task', title: 'Task' },
            { key: 'dashboards-TaskCalendar', title: 'Task Calendar' },
            { key: 'dashboards-systemsetup', title: 'CRM System Setup' }
        ],
        // Communication: [
        //     { key: 'dashboards-mail', title: 'Mail' },
        //     { key: 'dashboards-chat', title: 'Chat' },
        //     { key: 'dashboards-calendar', title: 'Calendar' },
        // ],
        HRM: [
            { key: 'extra-hrm-employee', title: 'Employee' },
            { key: 'extra-hrm-payroll', title: 'Payroll' },
            { key: 'extra-hrm-performance-indicator', title: 'Indicator' },
            { key: 'extra-hrm-role', title: 'Role' },
            { key: 'extra-hrm-designation', title: 'Designation' },
            { key: 'extra-hrm-department', title: 'Department' },
            { key: 'extra-hrm-attendance-attendancelist', title: 'Attendance' },
            { key: 'extra-hrm-leave-leavelist', title: 'Leave Management' },
            { key: 'extra-hrm-meeting', title: 'Meeting' },
            { key: 'extra-hrm-announcement', title: 'Announcement' },
            { key: 'extra-hrm-jobs-joblist', title: 'Job' },
            { key: 'extra-hrm-document', title: 'Document' },
            { key: 'extra-hrm-trainingSetup', title: 'Training Setup' }
        ],
        Job: [
            { key: 'extra-hrm-jobs-joblist', title: 'Jobs' },
            { key: 'extra-hrm-jobs-jobcandidate', title: 'Job Candidates' },
            { key: 'extra-hrm-jobs-jobonbording', title: 'Job On-Boarding' },
            { key: 'extra-hrm-jobs-jobapplication', title: 'Job Applications' },
            { key: 'extra-hrm-jobs-jobofferletter', title: 'Offer Letters' },
            { key: 'extra-hrm-jobs-interview', title: 'Interviews' }
        ]
    };

    const handleEdit = (record) => {
        // Close permissions modal if it's open
        if (viewPermissionsModal) {
            setViewPermissionsModal(false);
            setSelectedPermissions(null);
        }

        // Call the parent's onEdit handler with the record
        if (onEdit) {
            onEdit(record);
        }
    };

    const handleDelete = async (recordOrIds) => {
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
            cancelText: 'No',
            bodyStyle: { padding: "20px" },
            onOk: async () => {
                try {
                    if (isMultiple) {
                        // Handle bulk delete
                        await Promise.all(recordOrIds.map(id => onDelete(id)));
                        message.success(`${recordOrIds.length} roles deleted successfully`);
                        setSelectedRowKeys([]); // Clear selection after successful delete
                    } else {
                        // Handle single delete
                        await onDelete(recordOrIds);
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

    // Bulk actions component
    const BulkActions = () => (
        <div className="bulk-actions" style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
            {selectedRowKeys.length > 0 && (
                <Button
                    type="primary"
                    danger
                    icon={<FiTrash2 size={16} />}
                    onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(selectedRowKeys);
                    }}
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
            title: "Role",
            dataIndex: "role_name",
            key: "role_name",
            render: (text, record) => (
                <div className="item-wrapper">
                    <div className="item-content">
                        <div className="icon-wrapper" style={{ color: "#1890ff", background: "rgba(24, 144, 255, 0.1)" }}>
                            <FiUsers className="item-icon" />
                        </div>
                        <div className="info-wrapper">
                            <div className="name" style={{ color: "#262626", fontWeight: 600 }}>{text}</div>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: "Permissions",
            dataIndex: "permissions",
            key: "permissions",
            width: "65%",
            render: (permissions, record) => renderPermissionTags(permissions, record),
        },
        {
            title: "Actions",
            key: "actions",
            width: 80,
            render: (_, record) => {
                const menuItems = [
                    {
                        key: 'edit',
                        icon: <FiEdit2 size={14} />,
                        label: 'Edit',
                        onClick: (e) => {
                            e.domEvent.stopPropagation();
                            handleEdit(record);
                        }
                    }
                ];

                if (record.role_name !== 'super-admin' && record.role_name !== 'client') {
                    menuItems.push({
                        key: 'delete',
                        icon: <FiTrash2 size={14} />,
                        label: 'Delete',
                        danger: true,
                        onClick: (e) => {
                            e.domEvent.stopPropagation();
                            handleDelete(record.id);
                        }
                    });
                }

                return (
                    <div onClick={(e) => e.stopPropagation()}>
                        <Dropdown
                            menu={{
                                items: menuItems,
                                onClick: (e) => e.domEvent.stopPropagation()
                            }}
                            trigger={['click']}
                            placement="bottomRight"
                        >
                            <Button
                                type="text"
                                icon={<FiMoreVertical size={16} />}
                                className="action-button"
                            />
                        </Dropdown>
                    </div>
                );
            }
        }
    ];

    return (
        <div className="role-list-container">
            <BulkActions />
            <Table
                rowSelection={rowSelection}
                columns={columns}
                dataSource={roles}
                rowKey="id"
                pagination={{
                    current: currentPage,
                    onChange: (page) => setCurrentPage(page),
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} items`,
                }}
                className="custom-table"
                onRow={(record) => ({
                    onClick: () => showAllPermissions(record)
                })}
            />

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
        </div>
    );
};

export default RoleList; 