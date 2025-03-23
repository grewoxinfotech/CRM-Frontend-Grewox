import React from 'react';
import { Card, Tag, Button, Tooltip, Avatar, Dropdown } from 'antd';
import { FiEdit2, FiTrash2, FiEye, FiMail, FiUser, FiMoreVertical, FiPhone, FiDollarSign } from 'react-icons/fi';

const DealCard = ({ onEdit, onDelete, onView }) => {
    const getDropdownItems = (deal) => ({
        items: [
            {
                key: 'view',
                icon: <FiEye />,
                label: 'View Details',
                onClick: () => onView(deal),
            },
            {
                key: 'edit',
                icon: <FiEdit2 />,
                label: 'Edit',
                onClick: () => onEdit(deal),
            },
            {
                key: 'delete',
                icon: <FiTrash2 />,
                label: 'Delete',
                onClick: () => onDelete(deal),
                danger: true,
            },
        ],
    });

    // Dummy data for demonstration
    const deals = [
        {
            id: 1,
            dealTitle: 'New Software Deal',
            value: '50000',
            currency: 'USD',
            stage: 'Negotiation',
            probability: '75',
            contact: 'John Smith',
            email: 'john@example.com',
            phone: '+1234567890',
            status: 'Active',
            createdAt: new Date(),
        },
        // Add more dummy data as needed
    ];

    return (
        <div className="deal-grid">
            {deals.map((deal) => (
                <Card
                    key={deal.id}
                    className="deal-card"
                    bordered={false}
                >
                    <div className="deal-card-header">
                        <div className="deal-main-info">
                            <Avatar
                                size={64}
                                icon={<FiDollarSign />}
                                className="deal-avatar"
                                style={{ backgroundColor: '#1890ff' }}
                            />
                            <div className="deal-info">
                                <h3>{deal.dealTitle}</h3>
                                <Tag color="blue">{deal.stage}</Tag>
                            </div>
                        </div>

                        <Dropdown
                            menu={getDropdownItems(deal)}
                            trigger={['click']}
                            placement="bottomRight"
                            overlayClassName="deal-actions-dropdown"
                        >
                            <Button
                                type="text"
                                icon={<FiMoreVertical />}
                                className="action-dropdown-button"
                                onClick={(e) => e.preventDefault()}
                            />
                        </Dropdown>
                    </div>

                    <div className="deal-details">
                        <div className="detail-item">
                            <FiDollarSign className="detail-icon" />
                            <Tooltip title="Deal Value">
                                <span className="detail-text">
                                    {deal.currency} {deal.value}
                                </span>
                            </Tooltip>
                        </div>
                        <div className="detail-item">
                            <FiUser className="detail-icon" />
                            <span className="detail-text">{deal.contact}</span>
                        </div>
                        <div className="detail-item">
                            <FiMail className="detail-icon" />
                            <Tooltip title={deal.email}>
                                <span className="detail-text">{deal.email}</span>
                            </Tooltip>
                        </div>
                        <div className="detail-item">
                            <FiPhone className="detail-icon" />
                            <span className="detail-text">{deal.phone}</span>
                        </div>
                    </div>


                </Card>
            ))}
        </div>
    );
};

export default DealCard; 