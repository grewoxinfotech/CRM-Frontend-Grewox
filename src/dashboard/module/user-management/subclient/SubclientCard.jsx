import React from 'react';
import { Card, Tag, Space, Button, Tooltip, Avatar, Dropdown } from 'antd';
import { FiEdit2, FiTrash2, FiEye, FiMail, FiUser, FiMoreVertical } from 'react-icons/fi';
import { useGetAllSubclientsQuery } from './services/subClientApi';

const SubclientCard = ({ onEdit, onDelete, onView }) => {
    const { data: subclientsData, isLoading } = useGetAllSubclientsQuery();
    const subclients = subclientsData?.data || [];

    const getDropdownItems = (subclient) => ({
        items: [
            {
                key: 'view',
                icon: <FiEye />,
                label: 'View Details',
                onClick: () => onView(subclient),
            },
            {
                key: 'edit',
                icon: <FiEdit2 />,
                label: 'Edit',
                onClick: () => onEdit(subclient),
            },
            {
                key: 'delete',
                icon: <FiTrash2 />,
                label: 'Delete',
                onClick: () => onDelete(subclient),
                danger: true,
            },
        ],
    });

    return (
        <div className="subclient-grid">
            {subclients.map((subclient) => (
                <Card
                    key={subclient.id}
                    className="subclient-card"
                    loading={isLoading}
                    bordered={false}
                >
                    <div className="subclient-card-header">
                        <div className="subclient-main-info">
                            <Avatar
                                size={64}
                                icon={<FiUser />}
                                src={subclient.profilePic}
                                className="subclient-avatar"
                            />
                            <div className="subclient-info">
                                <h3>{subclient.username}</h3>
                            </div>
                        </div>
                        
                        <Dropdown
                            menu={getDropdownItems(subclient)}
                            trigger={['click']}
                            placement="bottomRight"
                            overlayClassName="subclient-actions-dropdown"
                        >
                            <Button
                                type="text"
                                icon={<FiMoreVertical />}
                                className="action-dropdown-button"
                                onClick={(e) => e.preventDefault()}
                            />
                        </Dropdown>
                    </div>

                    <div className="subclient-details">
                        <div className="detail-item">
                            <FiMail className="detail-icon" />
                            <Tooltip title={subclient.email}>
                                <span className="detail-text">{subclient.email}</span>
                            </Tooltip>
                        </div>
                        <div className="detail-item">
                            <FiUser className="detail-icon" />
                            <span className="detail-text">
                                Created: {new Date(subclient.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default SubclientCard;
