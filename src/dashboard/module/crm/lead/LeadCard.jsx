import React from 'react';
import { Card, Tag, Button, Tooltip, Avatar, Dropdown } from 'antd';
import { FiEdit2, FiTrash2, FiEye, FiMail, FiUser, FiMoreVertical, FiPhone } from 'react-icons/fi';

const LeadCard = ({ onEdit, onDelete, onView }) => {
    const getDropdownItems = (lead) => ({
        items: [
            {
                key: 'view',
                icon: <FiEye />,
                label: 'View Details',
                onClick: () => onView(lead),
            },
            {
                key: 'edit',
                icon: <FiEdit2 />,
                label: 'Edit',
                onClick: () => onEdit(lead),
            },
            {
                key: 'delete',
                icon: <FiTrash2 />,
                label: 'Delete',
                onClick: () => onDelete(lead),
                danger: true,
            },
        ],
    });

    // Dummy data for demonstration
    const leads = [
        {
            id: 1,
            leadTitle: 'Update Lead',
            email: 'john@example.com',
            phone: '+1234567890',
            status: 'New',
            createdAt: new Date(),
        },
        // Add more dummy data as needed
    ];

    return (
        <div className="lead-grid">
            {leads.map((lead) => (
                <Card
                    key={lead.id}
                    className="lead-card"
                    bordered={false}
                >
                    <div className="lead-card-header">
                        <div className="lead-main-info">
                            <Avatar
                                size={64}
                                icon={<FiUser />}
                                className="lead-avatar"
                            />
                            <div className="lead-info">
                                <h3>{lead.name}</h3>
                                <Tag color="blue">{lead.status}</Tag>
                            </div>
                        </div>
                        
                        <Dropdown
                            menu={getDropdownItems(lead)}
                            trigger={['click']}
                            placement="bottomRight"
                            overlayClassName="lead-actions-dropdown"
                        >
                            <Button
                                type="text"
                                icon={<FiMoreVertical />}
                                className="action-dropdown-button"
                                onClick={(e) => e.preventDefault()}
                            />
                        </Dropdown>
                    </div>

                    <div className="lead-details">
                        <div className="detail-item">
                            <FiMail className="detail-icon" />
                            <Tooltip title={lead.email}>
                                <span className="detail-text">{lead.email}</span>
                            </Tooltip>
                        </div>
                        <div className="detail-item">
                            <FiPhone className="detail-icon" />
                            <span className="detail-text">{lead.phone}</span>
                        </div>
                        <div className="detail-item">
                            <FiUser className="detail-icon" />
                            <span className="detail-text">
                                Created: {new Date(lead.createdAt).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default LeadCard; 