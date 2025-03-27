import React from 'react';
import { Card, List, Typography, Button, Space, Avatar, Tag, Tooltip } from 'antd';
import { FiPlus, FiTrash2, FiMail, FiPhone, FiStar } from 'react-icons/fi';

const { Text } = Typography;

const LeadMembers = ({ leadId }) => {
    // You'll need to implement the API calls to fetch and manage members
    const members = []; // Replace with actual API data

    const handleAddMember = () => {
        // Implement member addition
    };

    const handleRemoveMember = (memberId) => {
        // Implement member removal
    };

    const getRoleColor = (role) => {
        switch (role.toLowerCase()) {
            case 'owner':
                return '#1890ff';
            case 'manager':
                return '#52c41a';
            case 'member':
                return '#faad14';
            default:
                return '#bfbfbf';
        }
    };

    return (
        <div className="lead-members">
            <div className="members-header">
                <Button
                    type="primary"
                    icon={<FiPlus />}
                    onClick={handleAddMember}
                >
                    Add Member
                </Button>
            </div>

            <List
                className="members-list"
                itemLayout="horizontal"
                dataSource={members}
                renderItem={member => (
                    <Card className="member-item" key={member.id}>
                        <div className="member-info">
                            <Space size={16}>
                                <Avatar
                                    size={48}
                                    src={member.avatar}
                                    style={{
                                        backgroundColor: !member.avatar ? '#1890ff' : undefined
                                    }}
                                >
                                    {!member.avatar && member.name.charAt(0)}
                                </Avatar>
                                <div className="member-details">
                                    <Space>
                                        <Text strong>{member.name}</Text>
                                        {member.isOwner && (
                                            <Tooltip title="Lead Owner">
                                                <FiStar style={{ color: '#faad14' }} />
                                            </Tooltip>
                                        )}
                                    </Space>
                                    <div className="member-meta">
                                        <Tag color={getRoleColor(member.role)}>
                                            {member.role}
                                        </Tag>
                                        <Space size={16}>
                                            <Text type="secondary">
                                                <FiMail style={{ marginRight: 4 }} />
                                                {member.email}
                                            </Text>
                                            {member.phone && (
                                                <Text type="secondary">
                                                    <FiPhone style={{ marginRight: 4 }} />
                                                    {member.phone}
                                                </Text>
                                            )}
                                        </Space>
                                    </div>
                                </div>
                            </Space>
                            {!member.isOwner && (
                                <Button
                                    type="text"
                                    danger
                                    icon={<FiTrash2 />}
                                    onClick={() => handleRemoveMember(member.id)}
                                />
                            )}
                        </div>
                    </Card>
                )}
            />
        </div>
    );
};

export default LeadMembers; 