import React from 'react';
import { Table, Button, Tag, Dropdown, Typography, Modal, message } from 'antd';
import {
    FiEdit2,
    FiTrash2,
    FiMoreVertical,
    FiUsers,
} from 'react-icons/fi';
import { useGetAllDepartmentsQuery, useDeleteDepartmentMutation } from './services/departmentApi';
import { useGetAllBranchesQuery } from '../Branch/services/branchApi';
import dayjs from 'dayjs';

const { Text } = Typography;

const DepartmentList = ({ onEdit, searchText = '', filters = {}, loading: parentLoading }) => {
    const { data: response = {}, isLoading: localLoading } = useGetAllDepartmentsQuery({
        search: searchText,
        ...filters
    });
    const { data: branchesData = [] } = useGetAllBranchesQuery();
    const [deleteDepartment] = useDeleteDepartmentMutation();

    const departments = response.data || [];
    const loading = parentLoading || localLoading;

    const branchMap = React.useMemo(() => {
        const map = {};
        const data = branchesData.data || branchesData;
        if (Array.isArray(data)) {
            data.forEach(branch => { map[branch.id] = branch.branchName; });
        }
        return map;
    }, [branchesData]);

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Delete Department',
            content: 'Are you sure?',
            onOk: async () => {
                try {
                    await deleteDepartment(id).unwrap();
                    message.success('Deleted successfully');
                } catch (error) {
                    message.error('Failed to delete');
                }
            },
        });
    };

    const columns = [
        {
            title: 'Department Name',
            dataIndex: 'department_name',
            key: 'department_name',
            render: (text) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
                        <FiUsers size={14} />
                    </div>
                    <Text strong style={{ color: '#1e293b' }}>{text}</Text>
                </div>
            ),
        },
        {
            title: 'Branch',
            dataIndex: 'branch',
            key: 'branch',
            render: (branchId) => <Tag style={{ borderRadius: '4px', border: 'none' }}>{branchMap[branchId] || 'N/A'}</Tag>
        },
        {
            title: 'Created By',
            dataIndex: 'created_by',
            key: 'created_by',
            render: (text) => <Text type="secondary" style={{ fontSize: '12px' }}>{text || '-'}</Text>
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => <Text type="secondary" style={{ fontSize: '12px' }}>{dayjs(date).format('DD MMM YYYY')}</Text>
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 80,
            fixed: 'right',
            render: (_, record) => (
                <Dropdown
                    menu={{
                        items: [
                            { key: 'edit', icon: <FiEdit2 />, label: 'Edit', onClick: () => onEdit(record) },
                            { key: 'delete', icon: <FiTrash2 />, label: 'Delete', danger: true, onClick: () => handleDelete(record.id) }
                        ]
                    }}
                    trigger={['click']}
                    placement="bottomRight"
                >
                    <Button type="text" icon={<FiMoreVertical />} className="action-dropdown-button" />
                </Dropdown>
            ),
        },
    ];

    return (
        <div className='department-list-container'>
            <Table
                columns={columns}
                dataSource={departments}
                loading={loading}
                rowKey="id"
                size="small"
                className="compact-table"
                pagination={{
                    showTotal: (total) => `Total ${total} items`,
                    pageSize: 10
                }}
                scroll={{ x: 'max-content' }}
            />
        </div>
    );
};

export default DepartmentList;