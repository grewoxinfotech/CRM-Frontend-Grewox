import React, { useState } from 'react';
import {
    Card, Typography, Button, Row, Col, Breadcrumb, message, Tag, Progress, Divider, Spin
} from 'antd';
import {
    FiHome, FiCalendar, FiClock, FiHardDrive, FiUsers, FiDollarSign, FiRefreshCw, FiCheck, FiUserCheck
} from 'react-icons/fi';
import moment from 'moment';
import { Link } from 'react-router-dom';
import './plan.scss';
import { selectCurrentUser } from '../../../../auth/services/authSlice';
import { useSelector } from 'react-redux';
import { useGetsubcriptionByIdQuery } from '../../../../superadmin/module/SubscribedUser/services/SubscribedUserApi';
import { useGetAllPlansQuery } from '../../../../superadmin/module/plans/services/planApi';
import { useGetAllCurrenciesQuery } from '../../../../superadmin/module/settings/services/settingsApi';
import CreateInquaryModal from '../../../../superadmin/module/inquary/CreateInquaryModal';
import CreateUpgradePlan from '../../../../superadmin/module/company/CreateUpgradePlan';

const { Title, Text, Paragraph } = Typography;

const Plan = () => {
    const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
    const [selectedPlanForInquiry, setSelectedPlanForInquiry] = useState(null);
    const [isBuyPlanModalOpen, setIsBuyPlanModalOpen] = useState(false);
    const [selectedPlanToBuy, setSelectedPlanToBuy] = useState(null);
    const loggedInUser = useSelector(selectCurrentUser);

    const id = loggedInUser.client_plan_id;

    const { data: subscriptionData, error, isLoading } = useGetsubcriptionByIdQuery(id);
    
    // Fetch available plans
    const { data: plansData, isLoading: isPlansLoading, error: plansError } = useGetAllPlansQuery({ 
        page: 1, 
        limit: 100,
        status: 'active' 
    });
    
    
    // Fetch currencies for display
    const { data: currencies } = useGetAllCurrenciesQuery({
        page: 1,
        limit: 100
    });

    if (isLoading || isPlansLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '60vh',
                flexDirection: 'column',
                gap: '16px'
            }}>
                <Spin size="large" />
                <Text type="secondary">Loading subscription details...</Text>
            </div>
        );
    }

    if (error) {
        message.error('Failed to load subscription details');
        return null;
    }

    const subscription = subscriptionData?.data;

    const handleRenewPlan = (selectedPlan = null) => {
        setSelectedPlanForInquiry(selectedPlan);
        setIsRenewModalOpen(true);
    };

    const handleRenewModalClose = () => {
        setIsRenewModalOpen(false);
        setSelectedPlanForInquiry(null);
    };

    const handleBuyPlan = (plan) => {
        setSelectedPlanToBuy(plan);
        setIsBuyPlanModalOpen(true);
    };

    const handleBuyPlanModalClose = () => {
        setIsBuyPlanModalOpen(false);
        setSelectedPlanToBuy(null);
    };

    // Check if plan has expired or about to expire
    const shouldShowRenewButton = () => {
        if (!subscription?.end_date) return false;
        const currentDate = moment();
        const endDate = moment(subscription.end_date);
        // Show button only if end date is in the past
        return endDate.isBefore(currentDate);
    };


    const renderStorageUsage = () => {
        if (!subscription?.storage) return null;
        const { used, total, percentage } = subscription.storage;
        return (
            <Card 
                className="plan-card storage-card"
                bordered={false}
                title={
                    <div style={{ display: 'flex', alignItems: 'center', color: '#1890ff' }}>
                        <FiHardDrive style={{ marginRight: '8px', fontSize: '18px' }} />
                        <span style={{ fontWeight: 600, fontSize: '15px' }}>Storage Usage</span>
                    </div>
                } 
                extra={
                    <Tag 
                        color={percentage > 90 ? 'error' : 'success'}
                        style={{ fontWeight: 500, fontSize: '12px' }}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <Text strong style={{ fontSize: '14px' }}>Used: {used.toFixed(2)} GB</Text>
                    <Text type="secondary" style={{ fontSize: '14px' }}>Total: {total} GB</Text>
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
                bordered={false}
                title={
                    <div style={{ display: 'flex', alignItems: 'center', color: '#52c41a' }}>
                        <FiDollarSign style={{ marginRight: '8px', fontSize: '18px' }} />
                        <span style={{ fontWeight: 600, fontSize: '15px' }}>Plan Details</span>
                    </div>
                }
                extra={
                    <Tag color="processing" style={{ fontWeight: 500, fontSize: '12px' }}>
                        Current Plan
                    </Tag>
                }
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                        <Text type="secondary" style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>Plan Name</Text>
                        <Text strong style={{ fontSize: '15px' }}>{name}</Text>
                    </div>
                    <div>
                        <Text type="secondary" style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>Price</Text>
                        <Text strong style={{ fontSize: '15px', color: '#1890ff' }}>₹{price}</Text>
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                        <Text type="secondary" style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>Storage Limit</Text>
                        <Text strong style={{ fontSize: '15px' }}>{storage_limit} GB</Text>
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
                bordered={false}
                title={
                    <div style={{ display: 'flex', alignItems: 'center', color: '#faad14' }}>
                        <FiCalendar style={{ marginRight: '8px', fontSize: '18px' }} />
                        <span style={{ fontWeight: 600, fontSize: '15px' }}>Subscription Period</span>
                    </div>
                }
                extra={
                    <Tag 
                        color={status === 'active' ? 'success' : 'error'} 
                        style={{ fontWeight: 500, fontSize: '12px' }}
                    >
                        {status.toUpperCase()}
                    </Tag>
                }
            >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                        <Text type="secondary" style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>Start Date</Text>
                        <Text strong style={{ fontSize: '14px' }}>{moment(start_date).format('DD MMM YYYY')}</Text>
                    </div>
                    <div>
                        <Text type="secondary" style={{ display: 'block', marginBottom: '6px', fontSize: '13px' }}>End Date</Text>
                        <Text strong style={{ fontSize: '14px' }}>{moment(end_date).format('DD MMM YYYY')}</Text>
                    </div>
                    <div style={{ gridColumn: '1 / -1', marginTop: '8px' }}>
                        <Text type="secondary" style={{ display: 'block', marginBottom: '8px', fontSize: '13px' }}>Days Remaining</Text>
                        <Progress 
                            percent={Math.min(100, Math.round((daysRemaining / 365) * 100))} 
                            status={daysRemaining < 7 ? 'exception' : 'normal'}
                            strokeColor={{
                                '0%': '#ff4d4f',
                                '100%': '#52c41a',
                            }}
                            strokeWidth={8}
                        />
                        <Text strong style={{ color: daysRemaining < 7 ? '#ff4d4f' : '#52c41a', fontSize: '14px', marginTop: '4px', display: 'block' }}>
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
                bordered={false}
                title={
                    <div style={{ display: 'flex', alignItems: 'center', color: '#722ed1' }}>
                        <FiUsers style={{ marginRight: '8px', fontSize: '18px' }} />
                        <span style={{ fontWeight: 600, fontSize: '15px' }}>User Limits</span>
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

    const getCurrencyIcon = (currencyId) => {
        const currency = currencies?.find(c => c.id === currencyId);
        return currency?.currencyIcon || '₹';
    };

    const formatStorageSize = (sizeInMB) => {
        const size = parseFloat(sizeInMB);
        if (size >= 1024) {
            const gbValue = size / 1024;
            return `${Number.isInteger(gbValue) ? gbValue.toFixed(0) : gbValue.toFixed(2)} GB`;
        }
        return `${Math.round(size)} MB`;
    };

    const renderAvailablePlans = () => {
        // API returns {success: true, message: '...', data: [...]}
        // RTK Query returns full response, so plansData.data is the plans array
        const plans = plansData?.data || [];
        
        if (!plans || plans.length === 0) return null;

        return (
            <div className="available-plans-section">
                <Divider orientation="left">
                    <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                        Available Plans
                    </Title>
                </Divider>
                <Text type="secondary" style={{ display: 'block', marginBottom: '24px', fontSize: '15px' }}>
                    Choose a plan that best fits your needs
                </Text>
                
                <Row gutter={[24, 24]}>
                    {plans.filter(plan => plan.status === 'active').map((plan) => (
                        <Col xs={24} sm={24} md={12} lg={8} xl={6} key={plan.id}>
                            <Card
                                className="available-plan-card"
                                bordered={false}
                                hoverable
                            >
                                <div className="plan-card-header">
                                    <div className="plan-title-section">
                                        <Title level={4} style={{ margin: 0, fontSize: '18px' }}>
                                            {plan.name}
                                        </Title>
                                        {plan.is_default && (
                                            <Tag color="blue" style={{ fontSize: '11px', padding: '2px 8px' }}>
                                                Popular
                                            </Tag>
                                        )}
                                    </div>
                                    <div className="price-section" style={{ marginTop: '12px' }}>
                                        <div className="price-amount">
                                            <span className="currency-icon" style={{ fontSize: '16px', color: '#1890ff' }}>
                                                {getCurrencyIcon(plan.currency)}
                                            </span>
                                            <span className="amount" style={{ fontSize: '24px', fontWeight: 600 }}>
                                                {Number(plan.price || 0).toFixed(2)}
                                            </span>
                                        </div>
                                        <span className="duration" style={{ color: '#64748b', fontSize: '14px' }}>/{plan.duration?.toLowerCase()}</span>
                                    </div>
                                </div>

                                <div className="plan-features" style={{ marginTop: '20px' }}>
                                    <div className="features-group" style={{ marginBottom: '16px' }}>
                                        <Text strong style={{ display: 'block', marginBottom: '12px', fontSize: '14px' }}>
                                            <FiUsers style={{ marginRight: '6px' }} /> User Limits
                                        </Text>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '13px' }}>
                                                <FiCheck style={{ color: '#10b981', fontSize: '14px' }} />
                                                <span><strong>{plan.max_users}</strong> Users</span>
                                            </li>
                                            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '13px' }}>
                                                <FiCheck style={{ color: '#10b981', fontSize: '14px' }} />
                                                <span><strong>{plan.max_clients}</strong> Clients</span>
                                            </li>
                                            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '13px' }}>
                                                <FiCheck style={{ color: '#10b981', fontSize: '14px' }} />
                                                <span><strong>{plan.max_vendors}</strong> Vendors</span>
                                            </li>
                                            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '13px' }}>
                                                <FiCheck style={{ color: '#10b981', fontSize: '14px' }} />
                                                <span><strong>{plan.max_customers}</strong> Customers</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="features-group">
                                        <Text strong style={{ display: 'block', marginBottom: '12px', fontSize: '14px' }}>
                                            <FiHardDrive style={{ marginRight: '6px' }} /> Resources
                                        </Text>
                                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '13px' }}>
                                                <FiCheck style={{ color: '#10b981', fontSize: '14px' }} />
                                                <span><strong>{formatStorageSize(plan.storage_limit)}</strong> Storage</span>
                                            </li>
                                            <li style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '13px' }}>
                                                <FiCheck style={{ color: '#10b981', fontSize: '14px' }} />
                                                <span><strong>{plan.trial_period} Days</strong> Free Trial</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>

                                <Button
                                    type="primary"
                                    block
                                    onClick={() => handleBuyPlan(plan)}
                                    style={{
                                        marginTop: '20px',
                                        height: '40px',
                                        borderRadius: '8px',
                                        fontWeight: 500
                                    }}
                                >
                                    Buy This Plan
                                </Button>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
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
                    {shouldShowRenewButton() && (
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
                    )}
                </div>
            </div>

            <Row 
                gutter={[24, 24]} 
                style={{ 
                    marginTop: '24px'
                }}
            >
                <Col xs={24} sm={24} md={12} lg={6} xl={6}>
                    {renderStorageUsage()}
                </Col>
                <Col xs={24} sm={24} md={12} lg={6} xl={6}>
                    {renderPlanDetails()}
                </Col>
                <Col xs={24} sm={24} md={12} lg={6} xl={6}>
                    {renderSubscriptionPeriod()}
                </Col>
                <Col xs={24} sm={24} md={12} lg={6} xl={6}>
                    {renderUserLimits()}
                </Col>
            </Row>

            {shouldShowRenewButton() && renderAvailablePlans()}

            <CreateUpgradePlan
                open={isBuyPlanModalOpen}
                onCancel={handleBuyPlanModalClose}
                companyId={loggedInUser?.id}
                preselectedPlanId={selectedPlanToBuy?.id}
                modalTitle="Buy This Plan"
                buttonText="Buy This Plan"
                initialStartDate={moment()}
                initialStatus="active"
                initialPaymentStatus="unpaid"
            />

            <CreateInquaryModal
                open={isRenewModalOpen} 
                onCancel={handleRenewModalClose}
                loggedInUser={loggedInUser}
                initialValues={{
                    subject: selectedPlanForInquiry 
                        ? `Plan Request - ${selectedPlanForInquiry.name}` 
                        : 'Plan Renewal Request',
                    message: selectedPlanForInquiry
                        ? `I am interested in the ${selectedPlanForInquiry.name} plan.\n\nPlan Details:\n` +
                          `- Plan Name: ${selectedPlanForInquiry.name}\n` +
                          `- Price: ${getCurrencyIcon(selectedPlanForInquiry.currency)}${selectedPlanForInquiry.price}/${selectedPlanForInquiry.duration}\n` +
                          `- Storage: ${formatStorageSize(selectedPlanForInquiry.storage_limit)}\n` +
                          `- Users: ${selectedPlanForInquiry.max_users} | Clients: ${selectedPlanForInquiry.max_clients}\n` +
                          `- Trial Period: ${selectedPlanForInquiry.trial_period} days\n\n` +
                          `Please provide more information about this plan.`
                        : `Requesting plan renewal for ${subscription?.Plan?.name} plan. Current plan details:\n` +
                          `- Plan Name: ${subscription?.Plan?.name}\n` +
                          `- Current Storage: ${subscription?.storage?.used.toFixed(2)}/${subscription?.storage?.total} GB\n` +
                          `- Subscription End Date: ${moment(subscription?.end_date).format('DD MMM YYYY')}`
                }}
            />
        </div>
    );
};

export default Plan;