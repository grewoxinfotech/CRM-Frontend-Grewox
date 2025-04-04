import React, { useState } from 'react';
import { Card, Avatar, Button, Table, Tag, Modal, Form, Select, message } from 'antd';
import { FiUserPlus, FiTrash2, FiUser } from 'react-icons/fi';
import { useUpdateDealMutation,useGetDealsQuery } from '../../services/dealApi';
import { useGetUsersQuery } from "../../../../user-management/users/services/userApi";
import { useGetRolesQuery } from "../../../../hrm/role/services/roleApi";
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../../../../auth/services/authSlice';
import './projectMember.scss';

const DealMember = ({ deal }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [updateDeal] = useUpdateDealMutation();
    const { data: usersResponse = { data: [] } } = useGetUsersQuery();
    const { refetch } = useGetDealsQuery();
    const { data: rolesData } = useGetRolesQuery();
    const loggedInUser = useSelector(selectCurrentUser);
    
    // Get users array from response
     // Get subclient role ID to filter it out
     const subclientRoleId = rolesData?.data?.find(role => role?.role_name === 'sub-client')?.id;

     // Filter users to get team members (excluding subclients)
     const users = usersResponse?.data?.filter(user =>
         user?.created_by === loggedInUser?.username &&
         user?.role_id !== subclientRoleId
     ) || [];

    // Parse assigned_to from deal
    const assignedMembers = deal?.assigned_to ? 
        JSON.parse(deal.assigned_to)?.assigned_to || [] 
        : [];

    // Get assigned users details
    const assignedUsers = users.filter(user => 
        assignedMembers.includes(user.id)
    );

    // Get roles data
    const roles = rolesData?.data || [];

    // Function to get role name from role_id
    const getRoleName = (roleId) => {
        const role = roles.find(role => role.id === roleId);
        return role ? role.role_name : 'N/A';
    };

    const columns = [
        {
            title: 'Member',
            dataIndex: 'username',
            key: 'username',
            render: (_, record) => (
                <div className="member-info">
                    <Avatar size={40}>{record.username?.[0]?.toUpperCase()}</Avatar>
                    <div className="member-details">
                        <h4>{record.username}</h4>
                        <span>{record.email}</span>
                    </div>
                </div>
            ),
        },
        {
            title: 'Role',
            dataIndex: 'role_id',
            key: 'role',
            render: (roleId) => {
                const roleName = getRoleName(roleId);
                return (
                    <Tag style={{ 
                        color: '#595959', 
                        fontSize: '14px',
                        padding: '4px 8px',
                        background: '#f5f5f5',
                        borderRadius: '4px',
                        display: 'inline-block',
                        border: 'none'
                    }}>
                        {roleName}
                    </Tag>
                );
            },
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div className="action-buttons">
                    <Button
                        type="text"
                        icon={<FiTrash2 />}
                        className="delete-button"
                        onClick={() => handleRemoveMember(record.id)}
                    />
                </div>
            ),
        },
    ];

    const handleAddMember = () => {
        setIsModalVisible(true);
    };

    const handleRemoveMember = async (userId) => {
        try {
            const newAssignedTo = assignedMembers.filter(id => id !== userId);
            
            await updateDeal({
                id: deal.id,
                assigned_to: {
                    assigned_to: newAssignedTo
                }
            }).unwrap();
            
            await refetch();
            message.success('Member removed successfully');
        } catch (error) {
            message.error('Failed to remove member');
        }
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            const newAssignedTo = [...new Set([...assignedMembers, ...values.members])];
            
            await updateDeal({
                id: deal.id,
                assigned_to: {
                    assigned_to: newAssignedTo
                }
            }).unwrap();

            await refetch();
            message.success('Members added successfully');
            setIsModalVisible(false);
            form.resetFields();
        } catch (error) {
            message.error('Failed to add members');
        }
    };

    return (
        <div className="deal-member">
            <Card
                title={
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px',
                        fontSize: '16px',
                        fontWeight: '500',
                        color: '#262626'
                    }}>
                        <FiUser /> Deal Members
                    </div>
                }
                extra={
                    <Button
                        type="primary"
                        icon={<FiUserPlus />}
                        onClick={handleAddMember}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}
                    >
                        Add Member
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={assignedUsers}
                    rowKey="id"
                    pagination={false}
                    className="member-table"
                />
            </Card>

            <Modal
                title="Add Members"
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => setIsModalVisible(false)}
                okText="Add Members"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="members"
                        label="Select Members"
                        rules={[{ required: true, message: 'Please select members' }]}
                    >
                        <Select
                            mode="multiple"
                            placeholder="Select members"
                            optionFilterProp="children"
                        >
                            {users.map(user => (
                                <Select.Option 
                                    key={user.id} 
                                    value={user.id}
                                    disabled={assignedMembers.includes(user.id)}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>{user.username}</span>
                                        <span style={{ color: '#8c8c8c' }}>
                                            {getRoleName(user.role_id)}
                                        </span>
                                    </div>
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            <style jsx>{`
                .member-table {
                    .ant-table-thead > tr > th {
                        background: #fafafa;
                        font-weight: 600;
                    }
                    
                    .member-info {
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        
                        .member-details {
                            h4 {
                                margin: 0;
                                font-size: 14px;
                                color: #262626;
                            }
                            
                            span {
                                font-size: 12px;
                                color: #8c8c8c;
                            }
                        }
                    }
                }
            `}</style>
        </div>
    );
};

export default DealMember;
