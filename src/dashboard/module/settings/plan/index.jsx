import React, { useState } from 'react';
import {
    Card, Typography, Button, Row, Col, Breadcrumb, message, Tag, Progress
} from 'antd';
import {
    FiHome, FiCalendar, FiClock, FiHardDrive, FiUsers, FiDollarSign, FiRefreshCw
} from 'react-icons/fi';
import moment from 'moment';
import { Link } from 'react-router-dom';
import './plan.scss';
import { selectCurrentUser } from '../../../../auth/services/authSlice';
import { useSelector } from 'react-redux';
import { useGetsubcriptionByIdQuery } from '../../../../superadmin/module/SubscribedUser/services/SubscribedUserApi';
import CreateInquaryModal from '../../../../superadmin/module/inquary/CreateInquaryModal';

const { Title, Text, Paragraph } = Typography;

const Plan = () => {
    const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
    const loggedInUser = useSelector(selectCurrentUser);

    console.log("logedinuser",loggedInUser);
    const id = loggedInUser.client_plan_id;

    const { data: subscriptionData, error, isLoading } = useGetsubcriptionByIdQuery(id);

    if (error) {
        message.error('Failed to load subscription details');
        return null;
    }

    const subscription = subscriptionData?.data;

    const handleRenewPlan = () => {
        setIsRenewModalOpen(true);
    };

    const handleRenewModalClose = () => {
        setIsRenewModalOpen(false);
    };

    const renderStorageUsage = () => {
        if (!subscription?.storage) return null;
        const { used, total, percentage } = subscription.storage;
        return (
            <Card 
                className="plan-card storage-card"
                title={
                    <div style={{ display: 'flex', alignItems: 'center', color: '#1890ff' }}>
                        <FiHardDrive style={{ marginRight: '8px', fontSize: '20px' }} />
                        <span style={{ fontWeight: 600 }}>Storage Usage</span>
                    </div>
                } 
                extra={
                    <Tag 
                        color={percentage > 90 ? 'error' : 'success'}
                        style={{ fontWeight: 500 }}
                    >
                        {percentage > 90 ? 'Critical' : 'Healthy'}
                    </Tag>
                }
            >
                <Progress 
                    percent={percentage} 
                    status={percentage > 90 ? 'exception' : 'normal'} 
                    strokeColor={{
                        '0%': '#108ee9',
                        '100%': '#87d068',
                    }}
                    style={{ marginBottom: '12px' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong>Used: {used.toFixed(2)} GB</Text>
                    <Text type="secondary">Total: {total} GB</Text>
                </div>
            </Card>
        );
    };

    const renderPlanDetails = () => {
        if (!subscription?.Plan) return null;
        const { name, price, storage_limit } = subscription.Plan;
        return (
            <Card 
                className="plan-card plan-details-card"
                title={
                    <div style={{ display: 'flex', alignItems: 'center', color: '#52c41a' }}>
                        <FiDollarSign style={{ marginRight: '8px', fontSize: '20px' }} />
                        <span style={{ fontWeight: 600 }}>Plan Details</span>
                    </div>
                }
                extra={
                    <Tag color="processing" style={{ fontWeight: 500 }}>
                        Current Plan
                    </Tag>
                }
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                        <Text type="secondary" style={{ display: 'block', marginBottom: '4px' }}>Plan Name</Text>
                        <Text strong style={{ fontSize: '16px' }}>{name}</Text>
                    </div>
                    <div>
                        <Text type="secondary" style={{ display: 'block', marginBottom: '4px' }}>Price</Text>
                        <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>₹{price}</Text>
                    </div>
                    <div>
                        <Text type="secondary" style={{ display: 'block', marginBottom: '4px' }}>Storage Limit</Text>
                        <Text strong style={{ fontSize: '16px' }}>{storage_limit} GB</Text>
                    </div>
                </div>
            </Card>
        );
    };

    const renderSubscriptionPeriod = () => {
        if (!subscription) return null;
        const { start_date, end_date, status } = subscription;
        const daysRemaining = moment(end_date).diff(moment(), 'days');
        return (
            <Card 
                className="plan-card subscription-period-card"
                title={
                    <div style={{ display: 'flex', alignItems: 'center', color: '#faad14' }}>
                        <FiCalendar style={{ marginRight: '8px', fontSize: '20px' }} />
                        <span style={{ fontWeight: 600 }}>Subscription Period</span>
                    </div>
                }
                extra={
                    <Tag 
                        color={status === 'active' ? 'success' : 'error'} 
                        style={{ fontWeight: 500 }}
                    >
                        {status.toUpperCase()}
                    </Tag>
                }
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                        <Text type="secondary" style={{ display: 'block', marginBottom: '4px' }}>Start Date</Text>
                        <Text strong>{moment(start_date).format('DD MMM YYYY')}</Text>
                    </div>
                    <div>
                        <Text type="secondary" style={{ display: 'block', marginBottom: '4px' }}>End Date</Text>
                        <Text strong>{moment(end_date).format('DD MMM YYYY')}</Text>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <Text type="secondary" style={{ display: 'block', marginBottom: '4px' }}>Days Remaining</Text>
                        <Progress 
                            percent={Math.round((daysRemaining / 30) * 100)} 
                            status={daysRemaining < 7 ? 'exception' : 'normal'}
                            strokeColor={{
                                '0%': '#ff4d4f',
                                '100%': '#52c41a',
                            }}
                        />
                        <Text strong style={{ color: daysRemaining < 7 ? '#ff4d4f' : '#52c41a' }}>
                            {daysRemaining} days left
                        </Text>
                    </div>
                </div>
            </Card>
        );
    };

    const renderUserLimits = () => {
        if (!subscription) return null;
        const { 
            current_users_count, 
            current_clients_count, 
            current_vendors_count, 
            current_customers_count 
        } = subscription;
        return (
            <Card 
                className="plan-card user-limits-card"
                title={
                    <div style={{ display: 'flex', alignItems: 'center', color: '#722ed1' }}>
                        <FiUsers style={{ marginRight: '8px', fontSize: '20px' }} />
                        <span style={{ fontWeight: 600 }}>User Limits</span>
                    </div>
                }
            >
                <Row gutter={[16, 16]}>
                    {[
                        { label: 'Users', value: current_users_count, icon: <FiUsers /> },
                        { label: 'Clients', value: current_clients_count, icon: <FiUsers /> },
                        { label: 'Vendors', value: current_vendors_count, icon: <FiUsers /> },
                        { label: 'Customers', value: current_customers_count, icon: <FiUsers /> }
                    ].map(({ label, value, icon }) => (
                        <Col key={label} span={12}>
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                background: 'rgba(114, 46, 209, 0.05)', 
                                padding: '12px', 
                                borderRadius: '8px' 
                            }}>
                                {React.cloneElement(icon, { 
                                    style: { 
                                        marginRight: '8px', 
                                        color: '#722ed1', 
                                        fontSize: '20px' 
                                    } 
                                })}
                                <div>
                                    <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>{label}</Text>
                                    <Text strong style={{ fontSize: '16px', color: '#722ed1' }}>{value}</Text>
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>
            </Card>
        );
    };

    return (
        <div className="plan-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/dashboard">
                            <FiHome style={{ marginRight: '4px' }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Settings</Breadcrumb.Item>
                    <Breadcrumb.Item>Subscription</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Subscription Details</Title>
                    <Text type="secondary">Your current plan and usage</Text>
                    <Button 
                        type="primary" 
                        icon={<FiRefreshCw />} 
                        onClick={handleRenewPlan}
                        style={{
                            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                            border: 'none',
                            borderRadius: '10px',
                            marginLeft: '16px'
                        }}
                    >
                        Renew Plan
                    </Button>
                </div>
            </div>

            <Row gutter={[16, 16]} style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
                gap: '16px',
                margin: 0 // Remove default margin
            }}>
                {renderStorageUsage()}
                {renderPlanDetails()}
                {renderSubscriptionPeriod()}
                {renderUserLimits()}
            </Row>

            <CreateInquaryModal 
                open={isRenewModalOpen} 
                onCancel={handleRenewModalClose}
                loggedInUser={loggedInUser}
                initialValues={{
                    subject: 'Plan Renewal Request',
                    message: `Requesting plan renewal for ${subscription?.Plan?.name} plan. Current plan details:\n` +
                             `- Plan Name: ${subscription?.Plan?.name}\n` +
                             `- Current Storage: ${subscription?.storage?.used.toFixed(2)}/${subscription?.storage?.total} GB\n` +
                             `- Subscription End Date: ${moment(subscription?.end_date).format('DD MMM YYYY')}`
                }}
            />
        </div>
    );
};

export default Plan;