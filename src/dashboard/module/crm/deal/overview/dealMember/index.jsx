import React, { useState } from 'react';
import { Card, Avatar, Button, Table, Tag, Modal, Form, Select, message } from 'antd';
import { FiUserPlus, FiTrash2 } from 'react-icons/fi';
import { useUpdateDealMutation } from '../../services/DealApi';
import { useGetUsersQuery } from "../../../../user-management/users/services/userApi";
import './projectMember.scss';

const DealMember = ({ deal }) => {
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [updateDeal] = useUpdateDealMutation();
    const { data: usersResponse = { data: [] } } = useGetUsersQuery();

    // Get users array from response
    const users = usersResponse.data || [];

    // Parse assigned_to from deal
    const assignedMembers = deal?.assigned_to ? 
        JSON.parse(deal.assigned_to)?.assigned_to || [] 
        : [];

    // Get assigned users details
    const assignedUsers = users.filter(user => 
        assignedMembers.includes(user.id)
    );

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
            render: (role) => (
                <Tag color="blue">{role || 'Member'}</Tag>
            ),
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
                assigned_to: JSON.stringify({ assigned_to: newAssignedTo })
            }).unwrap();
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
                assigned_to: JSON.stringify({ assigned_to: newAssignedTo })
            }).unwrap();

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
                title="Deal Members"
                extra={
                    <Button
                        type="primary"
                        icon={<FiUserPlus />}
                        onClick={handleAddMember}
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
                                    {user.username}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default DealMember;
