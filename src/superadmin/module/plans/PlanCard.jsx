import React from 'react';
import { Card, Typography, Button, Tag, Dropdown, Switch, message } from 'antd';
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
    FiCheck,
    FiUserCheck
} from 'react-icons/fi';
import { useGetAllCurrenciesQuery } from '../settings/services/settingsApi';
import { useUpdatePlanMutation } from './services/planApi';
import { useGetAllSubscribedUsersQuery } from '../SubscribedUser/services/SubscribedUserApi';

const { Text, Title } = Typography; 

const PlanCard = ({ plan, onEdit, onDelete, onView, onToggleStatus }) => {
    const [updatePlan] = useUpdatePlanMutation();
    const { data: subscribedUsersData } = useGetAllSubscribedUsersQuery();

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

    const { data: currencies } = useGetAllCurrenciesQuery({
        page: 1,
        limit: 100
    });
    const getCurrencyIcon = (currencyId) => {
        const currency = currencies?.find(c => c.id === currencyId);
        return currency?.currencyIcon || '$';
    };

    const actionItems = [
        // {
        //     key: 'view',
        //     icon: <FiEye />,
        //     label: 'View Details',
        //     onClick: () => onView?.(plan)
        // },
        {
            key: 'edit',
            icon: <FiEdit2 />,
            label: 'Edit Plan',
            onClick: () => onEdit?.(plan)
        },
        {
            key: 'delete',
            icon: <FiTrash2 />,
            label: 'Delete Plan',
            danger: true,
            onClick: () => onDelete?.(plan)
        }
    ];

    const handleToggleStatus = (checked) => {
        onToggleStatus?.(plan.id, checked ? 'active' : 'inactive');
    };

    const handleToggleDefault = async (checked) => {
        try {
            const { features, ...restPlan } = plan;
            const updateData = {
                ...restPlan,
                is_default: checked,
                features: typeof features === 'string' ? JSON.parse(features) : features || {}
            };
            
            const response = await updatePlan({ idd: plan.id, updateData }).unwrap();
            if (response.success) {
                message.success(`Plan ${checked ? 'set as' : 'removed from'} default successfully`);
            } else {
                throw new Error(response.message || 'Failed to update plan');
            }
        } catch (error) {
            console.error('Update error:', error);
            message.error(error?.data?.message || error?.message || 'Failed to update plan default status');
        }
    };

    const formatStorageSize = (sizeInMB) => {
        const size = parseFloat(sizeInMB);
        if (size >= 1024) {
            const gbValue = size / 1024;
            // Remove decimals if it's a whole number
            return `${Number.isInteger(gbValue) ? gbValue.toFixed(0) : gbValue.toFixed(2)} GB`;
        }
        return `${Math.round(size)} MB`;
    };

    const getAssignedUsersCount = () => {
        if (!subscribedUsersData?.data || !Array.isArray(subscribedUsersData.data)) return 0;
        return subscribedUsersData.data.filter(user => 
            user.plan_id === plan.id && user.status !== 'cancelled'
        ).length;
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
                            checked={plan.status === 'active'}
                            onChange={handleToggleStatus}
                            checkedChildren="Active"
                            unCheckedChildren="Inactive"
                            className={`switch-${status}`}
                        />
                    </div>
                    <div className="default-switch">
                        <Switch
                            checked={plan.is_default}
                            onChange={handleToggleDefault}
                            checkedChildren="Default"
                            unCheckedChildren="Not Default"
                            className={`switch-${plan.is_default ? 'default' : 'not-default'}`}
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
                <div className="plan-title-section">
                    <Title level={3} className="plan-name">
                        {plan.name}
                    </Title>
                    {plan.is_default && (
                        <Tag color="blue" className="default-tag">
                            Default Plan
                        </Tag>
                    )}
                </div>
                <div className="price-section">
                    <div className="price-amount">
                        <span className="currency-icon">
                            {getCurrencyIcon(plan.currency)}
                        </span>
                        <span className="amount">{Number(plan.price || 0).toFixed(2)}</span>
                    </div>
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
                        <FiHardDrive className="section-icon" /> Resources & Usage
                    </Title>
                    <ul className="features-list">
                        <li>
                            <FiCheck className="check-icon" />
                            <span><strong>{formatStorageSize(plan.storage_limit)}</strong> Storage Space</span>
                        </li>
                        <li>
                            <FiCheck className="check-icon" />
                            <span><strong>{plan.trial_period} Days</strong> Free Trial</span>
                        </li>
                        <li>
                            <FiUserCheck className="check-icon" />
                            <span><strong>{getAssignedUsersCount()} Users</strong> Currently Assigned</span>
                        </li>
                    </ul>
                </div>
            </div>

            <style jsx>{`
                .plan-card-header {
                    text-align: left;
                    margin-bottom: 24px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
                }

                .plan-title-section {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 12px;

                    .plan-name {
                        margin: 0 !important;
                        font-size: 20px;
                        color: #1e293b;
                        font-weight: 600;
                    }

                    .default-tag {
                        font-size: 12px;
                        padding: 2px 8px;
                        border-radius: 4px;
                        font-weight: 500;
                        background: rgba(24, 144, 255, 0.1);
                        border: none;
                    }
                }

                .price-section {
                    display: flex;
                    align-items: baseline;
                    gap: 4px;

                    .price-amount {
                        display: flex;
                        align-items: baseline;
                        gap: 2px;
                        color: #1e293b;

                        .currency-icon {
                            font-size: 16px;
                            color: #1890ff;
                            font-weight: 500;
                        }

                        .amount {
                            font-size: 24px;
                            font-weight: 600;
                            line-height: 1;
                        }
                    }

                    .duration {
                        color: #64748b;
                        font-size: 14px;
                        font-weight: 400;
                    }
                }

                @media (max-width: 576px) {
                    .plan-card-header {
                        margin-bottom: 16px;
                        padding-bottom: 12px;
                    }

                    .plan-title-section {
                        margin-bottom: 8px;

                        .plan-name {
                            font-size: 18px;
                        }

                        .default-tag {
                            font-size: 11px;
                            padding: 1px 6px;
                        }
                    }

                    .price-section {
                        .price-amount {
                            .currency-icon {
                                font-size: 14px;
                            }

                            .amount {
                                font-size: 20px;
                            }
                        }

                        .duration {
                            font-size: 13px;
                        }
                    }
                }

                .card-actions {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .status-switch, .default-switch {
                    .ant-switch {
                        min-width: 80px;
                        height: 24px;
                        line-height: 22px;
                        
                        &.switch-active {
                            background-color: #52c41a;
                        }
                        
                        &.switch-inactive {
                            background-color: #ff4d4f;
                        }

                        &.switch-default {
                            background-color: #1890ff;
                        }

                        &.switch-not-default {
                            background-color: #8c8c8c;
                        }
                    }
                }

                .more-actions-button {
                    width: 32px;
                    height: 32px;
                    padding: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 6px;
                    
                    &:hover {
                        background-color: rgba(0, 0, 0, 0.04);
                    }
                }

                .features-list li {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 8px;
                    color: #4b5563;
                    font-size: 14px;

                    .check-icon {
                        color: #10b981;
                        font-size: 16px;
                    }

                    strong {
                        color: #1e293b;
                        font-weight: 600;
                    }
                }

                .features-group {
                    margin-bottom: 24px;

                    &:last-child {
                        margin-bottom: 0;
                    }

                    .features-title {
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        margin-bottom: 16px;
                        color: #1e293b;
                        font-size: 16px;

                        .section-icon {
                            color: #3b82f6;
                        }
                    }
                }
            `}</style>
        </Card>
    );
};

export default PlanCard;