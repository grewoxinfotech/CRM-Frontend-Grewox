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
                title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <FiHardDrive style={{ marginRight: '8px', color: '#1890ff' }} />
                        Storage
                    </div>
                } 
                style={{ marginBottom: '16px' }}
            >
                <Progress 
                    percent={percentage} 
                    status={percentage > 90 ? 'exception' : 'normal'} 
                    strokeColor="#1890ff"
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                    <Text>Used: {used.toFixed(2)} GB</Text>
                    <Text>Total: {total} GB</Text>
                </div>
            </Card>
        );
    };

    const renderPlanDetails = () => {
        if (!subscription?.Plan) return null;
        const { name, price, storage_limit } = subscription.Plan;
        return (
            <Card 
                title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <FiDollarSign style={{ marginRight: '8px', color: '#52c41a' }} />
                        Plan Details
                    </div>
                } 
                style={{ marginBottom: '16px' }}
            >
                <Paragraph>
                    <Text strong>Name: </Text>{name}
                </Paragraph>
                <Paragraph>
                    <Text strong>Price: </Text>₹{price}
                </Paragraph>
                <Paragraph>
                    <Text strong>Storage Limit: </Text>{storage_limit} GB
                </Paragraph>
            </Card>
        );
    };

    const renderSubscriptionPeriod = () => {
        if (!subscription) return null;
        const { start_date, end_date, status } = subscription;
        return (
            <Card 
                title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <FiCalendar style={{ marginRight: '8px', color: '#faad14' }} />
                        Subscription Period
                    </div>
                } 
                style={{ marginBottom: '16px' }}
            >
                <Paragraph>
                    <Text strong>Start Date: </Text>{moment(start_date).format('DD MMM YYYY')}
                </Paragraph>
                <Paragraph>
                    <Text strong>End Date: </Text>{moment(end_date).format('DD MMM YYYY')}
                </Paragraph>
                <Paragraph>
                    <Text strong>Status: </Text>
                    <Tag color={status === 'active' ? 'green' : 'red'}>{status}</Tag>
                </Paragraph>
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
                title={
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <FiUsers style={{ marginRight: '8px', color: '#722ed1' }} />
                        User Limits
                    </div>
                }
            >
                <Row guter={[16, 16]}>
                    <Col span={12}>
                        <Paragraph>
                            <Text strong>Users: </Text>{current_users_count}
                        </Paragraph>
                    </Col>
                    <Col span={12}>
                        <Paragraph>
                            <Text strong>Clients: </Text>{current_clients_count}
                        </Paragraph>
                    </Col>
                    <Col span={12}>
                        <Paragraph>
                            <Text strong>Vendors: </Text>{current_vendors_count}
                        </Paragraph>
                    </Col>
                    <Col span={12}>
                        <Paragraph>
                            <Text strong>Customers: </Text>{current_customers_count}
                        </Paragraph>
                    </Col>
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

            <Row guter={[16, 16]} style={{ gap: '16px' }}>
                <Col xs={24} sm={24} md={12} lg={8} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {renderStorageUsage()}
                    {renderPlanDetails()}
                </Col>
                <Col xs={24} sm={24} md={12} lg={8} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {renderSubscriptionPeriod()}
                    {renderUserLimits()}
                </Col>
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