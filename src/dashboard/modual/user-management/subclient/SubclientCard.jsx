import React from 'react';
import { Card, Tag, Space, Button, Tooltip, Avatar } from 'antd';
import { FiEdit2, FiTrash2, FiEye, FiMail, FiUser } from 'react-icons/fi';
import { useGetAllSubclientsQuery } from './services/subClientApi';

const SubclientCard = ({ onEdit, onDelete, onView }) => {
    const { data: subclientsData, isLoading } = useGetAllSubclientsQuery();

    // Transform the data to ensure it's an array
    const subclients = subclientsData?.data || [];

    return (
        <div className="subclient-grid">
            {subclients.map((subclient) => (
                <Card
                    key={subclient.id}
                    className="subclient-card"
                    loading={isLoading}
                    actions={[
                        <Space key="actions" size="middle">
                            <Tooltip title="View Details">
                                <Button
                                    type="text"
                                    icon={<FiEye />}
                                    onClick={() => onView(subclient)}
                                    style={{ color: '#1890ff' }}
                                />
                            </Tooltip>
                            <Tooltip title="Edit">
                                <Button
                                    type="text"
                                    icon={<FiEdit2 />}
                                    onClick={() => onEdit(subclient)}
                                    style={{ color: '#52c41a' }}
                                />
                            </Tooltip>
                            <Tooltip title="Delete">
                                <Button
                                    type="text"
                                    icon={<FiTrash2 />}
                                    onClick={() => onDelete(subclient)}
                                    style={{ color: '#ff4d4f' }}
                                />
                            </Tooltip>
                        </Space>
                    ]}
                >
                    <div className="subclient-card-content">
                        <div className="subclient-header">
                            <Avatar
                                size={64}
                                icon={<FiUser />}
                                src={subclient.profilePic}
                                style={{ backgroundColor: '#1890ff' }}
                            />
                            <div className="subclient-info">
                                <h3>{subclient.username}</h3>
                                <Tag color={subclient.status === 'active' ? 'green' : subclient.status === 'pending' ? 'orange' : 'red'}>
                                    {subclient.status?.toUpperCase()}
                                </Tag>
                            </div>
                        </div>
                        <div className="subclient-details">
                            <div className="detail-item">
                                <FiMail style={{ color: '#1890ff' }} />
                                <span>{subclient.email}</span>
                            </div>
                            <div className="detail-item">
                                <FiUser style={{ color: '#1890ff' }} />
                                <span>Created: {new Date(subclient.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default SubclientCard;
