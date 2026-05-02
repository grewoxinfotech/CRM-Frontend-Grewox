import React, { useState } from 'react';
import { Table, Space, Button, Tooltip, Tag, message, Modal, Dropdown } from 'antd';
import { FiEdit2, FiTrash2, FiMoreVertical, FiEye, FiShield, FiCheck } from 'react-icons/fi';
import { useGetAllRolesQuery, useDeleteRoleMutation } from './services/roleApi';

const RoleList = ({ onEdit, searchText }) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [viewPermissionsModal, setViewPermissionsModal] = useState(false);
    const [selectedRole, setSelectedRole] = useState(null);

    const { data: rolesResponse = { data: [], pagination: {} }, isLoading } = useGetAllRolesQuery({
        page: pagination.current,
        pageSize: pagination.pageSize,
        search: searchText
    });
    const [deleteRole] = useDeleteRoleMutation();

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Delete Role',
            content: 'Are you sure you want to delete this role?',
            okText: 'Yes',
            okType: 'danger',
            onOk: async () => {
                try {
                    await deleteRole(id).unwrap();
                    message.success('Role deleted successfully');
                } catch (error) {
                    message.error(error?.data?.message || 'Failed to delete role');
                }
            },
        });
    };

    const columns = [
        {
            title: 'Role Name',
            dataIndex: 'role_name',
            key: 'role_name',
            render: (text) => <span style={{ fontWeight: 600, color: '#1e293b' }}>{text}</span>
        },
        {
            title: "Permissions",
            dataIndex: "permissions",
            key: "permissions",
            render: (permissions, record) => {
                if (!permissions) return <Tag>No Permissions</Tag>;
                const parsed = typeof permissions === 'string' ? JSON.parse(permissions) : permissions;
                const modules = Object.keys(parsed);
                return (
                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {modules.slice(0, 3).map(m => (
                            <Tag key={m} color="blue" style={{ borderRadius: '4px', fontSize: '11px', border: 'none', background: '#eff6ff', color: '#3b82f6' }}>{m.replace('dashboards-', '')}</Tag>
                        ))}
                        {modules.length > 3 && <Tag style={{ borderRadius: '4px', fontSize: '11px', border: 'none' }}>+{modules.length - 3} more</Tag>}
                        <Button type="link" size="small" icon={<FiEye />} onClick={(e) => { e.stopPropagation(); setSelectedRole(record); setViewPermissionsModal(true); }} style={{ padding: 0, height: 'auto', fontSize: '11px' }}>View All</Button>
                    </div>
                );
            }
        },
        {
            title: 'Actions',
            key: 'actions',
            width: '60px',
            fixed: 'right',
            align: 'center',
            render: (_, record) => (
                <Dropdown
                    menu={{
                        items: [
                            { key: 'edit', icon: <FiEdit2 size={14} />, label: 'Edit', onClick: () => onEdit(record) },
                            { key: 'delete', icon: <FiTrash2 size={14} />, label: 'Delete', danger: true, onClick: () => handleDelete(record.id) }
                        ]
                    }}
                    trigger={['click']}
                >
                    <Button type="text" icon={<FiMoreVertical size={16} />} size="small" />
                </Dropdown>
            ),
        },
    ];

    return (
        <>
            <Table
                columns={columns}
                dataSource={rolesResponse.data}
                loading={isLoading}
                rowKey="id"
                rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
                pagination={{
                    ...pagination,
                    total: rolesResponse.pagination?.total || 0,
                    showSizeChanger: true,
                    size: 'small'
                }}
                onChange={(p) => setPagination({ ...pagination, current: p.current, pageSize: p.pageSize })}
                className="compact-table"
                scroll={{ x: 'max-content' }}
                onRow={(record) => ({ onClick: () => { setSelectedRole(record); setViewPermissionsModal(true); } })}
            />
            
            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiShield style={{ color: '#6366f1' }} />
                        <span>Role Permissions: {selectedRole?.role_name}</span>
                    </div>
                }
                open={viewPermissionsModal}
                onCancel={() => setViewPermissionsModal(false)}
                footer={null}
                width={700}
                centered
            >
                <div style={{ maxHeight: '60vh', overflowY: 'auto', padding: '8px' }}>
                    {selectedRole?.permissions && Object.entries(typeof selectedRole.permissions === 'string' ? JSON.parse(selectedRole.permissions) : selectedRole.permissions).map(([mod, data]) => (
                        <div key={mod} style={{ marginBottom: '16px', padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                            <div style={{ fontWeight: 600, marginBottom: '8px', color: '#475569', textTransform: 'capitalize' }}>{mod.replace(/-/g, ' ')}</div>
                            <Space wrap>
                                {(data[0]?.permissions || []).map(p => (
                                    <Tag key={p} color="success" icon={<FiCheck />} style={{ borderRadius: '4px', border: 'none' }}>{p.toUpperCase()}</Tag>
                                ))}
                            </Space>
                        </div>
                    ))}
                </div>
            </Modal>
        </>
    );
};

export default RoleList;