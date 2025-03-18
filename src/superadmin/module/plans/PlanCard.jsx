import React from 'react';
import { Card, Typography, Button, Tag, Dropdown, Switch } from 'antd';
import {
    FiEye,
    FiEdit2,
    FiTrash2,
    FiMoreVertical,
    FiDollarSign,
    FiUsers,
    FiHardDrive,
    FiCheckCircle,
    FiXCircle,
    FiCheck
} from 'react-icons/fi';

const { Text, Title } = Typography;

const PlanCard = ({ plan, onEdit, onDelete, onView, onToggleStatus }) => {
    const statusInfo = {
        active: {
            color: '#52c41a',
            icon: <FiCheckCircle style={{ marginRight: '4px' }} />
        },
        inactive: {
            color: '#ff4d4f',
            icon: <FiXCircle style={{ marginRight: '4px' }} />
        }
    };

    const status = plan.status || 'inactive';

    const actionItems = [
        {
            key: 'view',
            icon: <FiEye />,
            label: 'View Details',
            onClick: () => onView?.(plan)
        },
        {
            key: 'edit',
            icon: <FiEdit2 />,
            label: 'Edit Plan',
            onClick: () => onEdit?.(plan.id)
        },
        {
            key: 'delete',
            icon: <FiTrash2 />,
            label: 'Delete Plan',
            danger: true,
            onClick: () => onDelete?.(plan.id)
        }
    ];

    const handleToggleStatus = (checked) => {
        onToggleStatus?.(plan.id, checked ? 'active' : 'inactive');
    };

    return (
        <Card
            className="plan-card"
            hoverable
            bodyStyle={{
                padding: '24px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}
            extra={
                <div className="card-actions">
                    <div className={`status-switch ${status}`}>
                        <Switch
                            checked={status === 'active'}
                            onChange={handleToggleStatus}
                            checkedChildren="Active"
                            unCheckedChildren="Inactive"
                            className={`switch-${status}`}
                        />
                    </div>
                    <Dropdown
                        menu={{ items: actionItems }}
                        trigger={['click']}
                        placement="bottomRight"
                    >
                        <Button
                            type="text"
                            icon={<FiMoreVertical />}
                            className="more-actions-button"
                        />
                    </Dropdown>
                </div>
            }
        >
            <div className="plan-card-header">
                <Title level={3} className="plan-name">
                    {plan.name}
                </Title>
                <div className="price-section">
                    <FiDollarSign className="currency-icon" />
                    <span className="amount">{Number(plan.price).toFixed(2)}</span>
                    <span className="duration">/{plan.duration.toLowerCase()}</span>
                </div>
            </div>

            <div className="plan-features">
                <div className="features-group">
                    <Title level={5} className="features-title">
                        <FiUsers className="section-icon" /> User Limits
                    </Title>
                    <ul className="features-list">
                        <li>
                            <FiCheck className="check-icon" />
                            <span><strong>{plan.max_users}</strong> Users</span>
                        </li>
                        <li>
                            <FiCheck className="check-icon" />
                            <span><strong>{plan.max_clients}</strong> Clients</span>
                        </li>
                        <li>
                            <FiCheck className="check-icon" />
                            <span><strong>{plan.max_vendors}</strong> Vendors</span>
                        </li>
                        <li>
                            <FiCheck className="check-icon" />
                            <span><strong>{plan.max_customers}</strong> Customers</span>
                        </li>
                    </ul>
                </div>

                <div className="features-group">
                    <Title level={5} className="features-title">
                        <FiHardDrive className="section-icon" /> Resources
                    </Title>
                    <ul className="features-list">
                        <li>
                            <FiCheck className="check-icon" />
                            <span><strong>{plan.storage_limit} GB</strong> Storage Space</span>
                        </li>
                        <li>
                            <FiCheck className="check-icon" />
                            <span><strong>{plan.trial_period} Days</strong> Free Trial</span>
                        </li>
                    </ul>
                </div>
            </div>
        </Card>
    );
};

export default PlanCard;