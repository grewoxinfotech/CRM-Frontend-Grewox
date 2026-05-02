import React, { useMemo } from 'react';
import { Table, Button, Tag, Dropdown, Typography, Modal, message } from 'antd';
import {
    FiEdit2,
    FiTrash2,
    FiMoreVertical,
} from 'react-icons/fi';
import { FaCodeBranch } from "react-icons/fa6";
import { useGetAllBranchesQuery, useDeleteBranchMutation } from './services/branchApi';
import dayjs from 'dayjs';
import { useGetUsersQuery } from '../../user-management/users/services/userApi';

const { Text } = Typography;

const BranchList = ({ onEdit, searchText = '', loading: parentLoading }) => {
    const { data: branchesResponse = {}, isLoading: localLoading } = useGetAllBranchesQuery({
        search: searchText,
    });
    const [deleteBranch] = useDeleteBranchMutation();
    const { data: userData } = useGetUsersQuery();

    const branches = branchesResponse.data || [];
    const loading = parentLoading || localLoading;

    const userMap = useMemo(() => {
        const map = {};
        if (userData?.data) {
            userData.data.forEach(user => { if (user && user.id) map[user.id] = user.username; });
        }
        return map;
    }, [userData]);

    const handleDelete = (id) => {
        Modal.confirm({
            title: 'Delete Branch',
            content: 'Are you sure?',
            onOk: async () => {
                try {
                    await deleteBranch(id).unwrap();
                    message.success('Deleted successfully');
                } catch (error) {
                    message.error('Failed to delete');
                }
            },
        });
    };

    const columns = [
        {
            title: 'Branch Name',
            dataIndex: 'branchName',
            key: 'branchName',
            render: (text) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '6px', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0284c7' }}>
                        <FaCodeBranch size={12} />
                    </div>
                    <Text strong style={{ color: '#1e293b' }}>{text}</Text>
                </div>
            ),
        },
        {
            title: 'Manager',
            dataIndex: 'branchManager',
            key: 'branchManager',
            render: (managerId) => <Tag style={{ borderRadius: '4px', border: 'none' }}>{userMap[managerId] || 'N/A'}</Tag>
        },
        {
            title: 'Address',
            dataIndex: 'branchAddress',
            key: 'branchAddress',
            render: (text) => <Text type="secondary" style={{ fontSize: '12px' }}>{text || '-'}</Text>
        },
        {
            title: 'Created At',
            dataIndex: 'created_at',
            key: 'created_at',
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
        <div className='branch-list-container'>
            <Table
                columns={columns}
                dataSource={branches}
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

export default BranchList;