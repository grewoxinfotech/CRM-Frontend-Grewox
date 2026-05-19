import React, { useState } from 'react';
import {
    Card, Typography, Button, Row, Col, message, Tag, Progress, Divider, Spin
} from 'antd';
import {
    FiHome, FiCalendar, FiHardDrive, FiUsers, FiDollarSign, FiRefreshCw, FiCheck, FiX, FiTag, FiBriefcase, FiGrid, FiTruck, FiAlertTriangle
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
import ClientBuyPlanModal from './ClientBuyPlanModal';
import PageHeader from '../../../../components/PageHeader';

const { Title, Text } = Typography;

const Plan = () => {
    const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
    const [selectedPlanForInquiry, setSelectedPlanForInquiry] = useState(null);
    const [isBuyPlanModalOpen, setIsBuyPlanModalOpen] = useState(false);
    const [selectedPlanToBuy, setSelectedPlanToBuy] = useState(null);
    const loggedInUser = useSelector(selectCurrentUser);

    const id = loggedInUser.client_plan_id;
    const { data: subscriptionData, isLoading } = useGetsubcriptionByIdQuery(id, { skip: !id });
    const { data: plansData, isLoading: isPlansLoading } = useGetAllPlansQuery({ page: 1, limit: 10, status: 'active' });
    const { data: currenciesData } = useGetAllCurrenciesQuery({ page: 1, limit: 100 });

    const currencyMap = React.useMemo(() => {
        const map = {};
        currenciesData?.forEach(c => {
            map[c.id] = c.currencyIcon;
        });
        return map;
    }, [currenciesData]);

    const activePlans = React.useMemo(() => {
        return plansData?.data?.filter(p => p.status === 'active') || [];
    }, [plansData]);

    if (isLoading || isPlansLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><Spin size="large" /></div>;
    }

    const subscription = subscriptionData?.data;
    const aiCreditsLimit = subscription?.ai_credits_limit || subscription?.Plan?.ai_credits || 0;

    const getCurrencyIcon = (currencyId) => {
        return currencyMap[currencyId] || '₹';
    };

    const formatStorageSize = (sizeInMB) => {
        const size = parseFloat(sizeInMB);
        return size >= 1024 ? `${(size / 1024).toFixed(2)} GB` : `${Math.round(size)} MB`;
    };

    const userRole = loggedInUser?.role_name || loggedInUser?.Role?.role_name;
    const isEmployee = userRole && userRole !== 'super-admin' && userRole !== 'super admin' && userRole !== 'client';
    const daysLeft = subscription?.end_date ? moment(subscription.end_date).diff(moment(), 'days') : 0;
    const isExpired = subscription?.end_date ? moment(subscription.end_date).isBefore(moment()) : false;
    const hasNoActivePlan = !subscription || isExpired || subscription?.status === 'cancelled';

    return (
        <div className="plan-page standard-page-container" style={{ background: '#f8fafc', minHeight: '100vh', paddingBottom: '40px' }}>
            <PageHeader
                title="Subscription Details"
                subtitle="Manage your current plan, usage metrics, limits, and pricing plan details"
                breadcrumbItems={[
                    { title: <Link to="/dashboard"><FiHome style={{ marginRight: '4px' }} /> Home</Link> },
                    { title: "Subscription" },
                ]}
                extraActions={isEmployee ? [] : hasNoActivePlan ? [
                    <Button key="renew" type="primary" icon={<FiRefreshCw />} onClick={() => setIsRenewModalOpen(true)} style={{ borderRadius: '8px', background: '#4f46e5', borderColor: '#4f46e5' }}>
                        Renew / Upgrade Plan
                    </Button>
                ] : [
                    <Button key="upgrade" type="primary" icon={<FiRefreshCw />} onClick={() => setIsRenewModalOpen(true)} style={{ borderRadius: '8px', background: '#4f46e5', borderColor: '#4f46e5' }}>
                        Upgrade / Change Plan
                    </Button>
                ]}
            />

            {/* Premium Active Plan Hero Banner */}
            <div style={{
                background: hasNoActivePlan ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)' : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                borderRadius: '16px',
                padding: '32px',
                color: 'white',
                boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.15)',
                marginBottom: '24px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Background decorative elements */}
                <div style={{
                    position: 'absolute',
                    top: '-20%',
                    right: '-10%',
                    width: '300px',
                    height: '300px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.06)',
                    pointerEvents: 'none'
                }} />
                <div style={{
                    position: 'absolute',
                    bottom: '-40%',
                    left: '-5%',
                    width: '200px',
                    height: '200px',
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.04)',
                    pointerEvents: 'none'
                }} />

                <Row gutter={[24, 24]} align="middle">
                    <Col xs={24} md={16}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                            <Tag color={hasNoActivePlan ? 'error' : 'success'} style={{
                                borderRadius: '20px',
                                padding: '4px 16px',
                                fontWeight: 700,
                                fontSize: '12px',
                                border: 'none',
                                background: 'white',
                                color: hasNoActivePlan ? '#ef4444' : '#10b981',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                            }}>
                                {!subscription ? 'NO ACTIVE PLAN' : isExpired ? 'EXPIRED' : 'ACTIVE PLAN'}
                            </Tag>
                            {subscription?.Plan && (
                                <span style={{ fontSize: '14px', opacity: 0.9, fontWeight: 500 }}>
                                    billing cycle: {subscription?.Plan?.duration || 'yearly'}
                                </span>
                            )}
                        </div>
                        <Title level={1} style={{ color: 'white', margin: 0, fontSize: '32px', fontWeight: 800, letterSpacing: '-0.5px' }}>
                            {subscription?.Plan?.name || 'No Plan Active'}
                        </Title>
                        <p style={{ margin: '8px 0 0 0', opacity: 0.9, fontSize: '15px', fontWeight: 500 }}>
                            {!subscription 
                                ? 'You do not have any subscription plan assigned. Please purchase or choose a plan below to continue.' 
                                : isExpired 
                                    ? 'Your plan has expired. Please renew or upgrade now to restore all features.' 
                                    : `Your subscription is active and will auto-renew or expire on ${moment(subscription?.end_date).format('MMMM DD, YYYY')}.`}
                        </p>
                    </Col>
                    <Col xs={24} md={8} style={{ textAlign: 'right' }}>
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.12)',
                            backdropFilter: 'blur(8px)',
                            borderRadius: '12px',
                            padding: '20px',
                            display: 'inline-block',
                            textAlign: 'left',
                            minWidth: '220px',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <Text style={{ color: 'white', opacity: 0.85, fontSize: '12px', display: 'block', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                                Time Remaining
                            </Text>
                            <span style={{ fontSize: '32px', fontWeight: 800, color: 'white', display: 'block', lineHeight: 1.2, margin: '4px 0' }}>
                                {hasNoActivePlan ? 0 : daysLeft} <span style={{ fontSize: '18px', fontWeight: 500 }}>Days</span>
                            </span>
                            <Progress 
                                percent={hasNoActivePlan ? 0 : Math.min(100, Math.round((daysLeft / 365) * 100))} 
                                showInfo={false} 
                                strokeColor="white" 
                                trailColor="rgba(255,255,255,0.2)"
                                strokeWidth={6}
                                style={{ margin: '10px 0 0 0' }}
                            />
                        </div>
                    </Col>
                </Row>
            </div>

            {/* Usage and Limit Cards Grid */}
            <Row gutter={[20, 20]}>
                {/* Storage Usage Card */}
                <Col xs={24} sm={12} lg={8}>
                    <Card 
                        bordered={false} 
                        style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', height: '100%', border: '1px solid #e2e8f0' }}
                        title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ background: '#e0e7ff', color: '#4f46e5', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                                    <FiHardDrive size={18} />
                                </div>
                                <span style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b' }}>Storage Usage</span>
                            </div>
                        }
                        extra={
                            <Tag color={subscription?.storage?.percentage > 90 ? 'error' : 'success'} style={{ borderRadius: '8px', fontWeight: 600 }}>
                                {subscription?.storage?.percentage > 90 ? 'Critical' : 'Healthy'}
                            </Tag>
                        }
                    >
                        <div style={{ padding: '4px 0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <Text style={{ color: '#64748b', fontWeight: 500 }}>Used Capacity</Text>
                                <Text style={{ color: '#1e293b', fontWeight: 600 }}>{Number(subscription?.storage?.percentage || 0).toFixed(2)}%</Text>
                            </div>
                            <Progress 
                                percent={Number(subscription?.storage?.percentage || 0).toFixed(2)} 
                                strokeColor={subscription?.storage?.percentage > 90 ? '#ef4444' : '#4f46e5'} 
                                trailColor="#f1f5f9"
                                strokeWidth={8}
                                showInfo={false}
                            />
                            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', background: '#f8fafc', padding: '12px', borderRadius: '10px' }}>
                                <div>
                                    <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Used</Text>
                                    <Text strong style={{ color: '#334155' }}>{formatStorageSize(subscription?.storage?.used)}</Text>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Allocated</Text>
                                    <Text strong style={{ color: '#334155' }}>{formatStorageSize(subscription?.storage?.total)}</Text>
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>

                {/* AI Credits Usage Card */}
                <Col xs={24} sm={12} lg={8}>
                    <Card 
                        bordered={false} 
                        style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', height: '100%', border: '1px solid #e2e8f0' }}
                        title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ background: '#fae8ff', color: '#d946ef', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                                    <FiTag size={18} />
                                </div>
                                <span style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b' }}>AI Credits Usage</span>
                            </div>
                        }
                        extra={
                            <Tag color={((aiCreditsLimit) - (subscription?.ai_credits_used || 0)) <= 0 ? 'error' : 'success'} style={{ borderRadius: '8px', fontWeight: 600 }}>
                                {((aiCreditsLimit) - (subscription?.ai_credits_used || 0)) <= 0 ? 'Exhausted' : 'Active'}
                            </Tag>
                        }
                    >
                        <div style={{ padding: '4px 0' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                <Text style={{ color: '#64748b', fontWeight: 500 }}>Credits Used</Text>
                                <Text style={{ color: '#1e293b', fontWeight: 600 }}>
                                    {Math.min(100, Math.round(((subscription?.ai_credits_used || 0) / (aiCreditsLimit || 1)) * 100))}%
                                </Text>
                            </div>
                            <Progress 
                                percent={Math.min(100, Math.round(((subscription?.ai_credits_used || 0) / (aiCreditsLimit || 1)) * 100))} 
                                strokeColor="#d946ef" 
                                trailColor="#f1f5f9"
                                strokeWidth={8}
                            />
                            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', background: '#f8fafc', padding: '12px', borderRadius: '10px' }}>
                                <div>
                                    <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Used</Text>
                                    <Text strong style={{ color: '#334155' }}>{subscription?.ai_credits_used || 0}</Text>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>Allocated</Text>
                                    <Text strong style={{ color: '#334155' }}>{aiCreditsLimit}</Text>
                                </div>
                            </div>
                        </div>
                    </Card>
                </Col>

                {/* Plan Pricing & Period Info */}
                <Col xs={24} sm={24} lg={8}>
                    <Card 
                        bordered={false} 
                        style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', height: '100%', border: '1px solid #e2e8f0' }}
                        title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ background: '#fef3c7', color: '#d97706', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                                    <FiDollarSign size={18} />
                                </div>
                                <span style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b' }}>Payment & Plan Pricing</span>
                            </div>
                        }
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px dashed #e2e8f0' }}>
                                <Text style={{ color: '#64748b', fontWeight: 500 }}>Base Price</Text>
                                <Text style={{ color: '#1e293b', fontWeight: 700, fontSize: '16px' }}>₹{subscription?.Plan?.price || 0}</Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px dashed #e2e8f0' }}>
                                <Text style={{ color: '#64748b', fontWeight: 500 }}>Start Date</Text>
                                <Text style={{ color: '#1e293b', fontWeight: 600 }}>{subscription?.start_date ? moment(subscription.start_date).format('DD MMM YYYY') : 'N/A'}</Text>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '4px' }}>
                                <Text style={{ color: '#64748b', fontWeight: 500 }}>End Date</Text>
                                <Text style={{ color: '#ef4444', fontWeight: 600 }}>{subscription?.end_date ? moment(subscription.end_date).format('DD MMM YYYY') : 'N/A'}</Text>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '8px 12px' }}>
                                <FiAlertTriangle size={16} style={{ color: '#d97706', marginTop: '2px', flexShrink: 0 }} />
                                <span style={{ fontSize: '12px', color: '#b45309', fontWeight: 500, lineHeight: 1.4 }}>
                                    Keep your billing info up to date to avoid subscription interruptions.
                                </span>
                            </div>
                        </div>
                    </Card>
                </Col>

                {/* Highly Beautiful Unified User Limits Card */}
                <Col xs={24}>
                    <Card 
                        bordered={false} 
                        style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}
                        title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ background: '#ecfdf5', color: '#10b981', padding: '8px', borderRadius: '10px', display: 'flex' }}>
                                    <FiUsers size={18} />
                                </div>
                                <span style={{ fontWeight: 700, fontSize: '15px', color: '#1e293b' }}>User & Business Limits Control Center</span>
                            </div>
                        }
                    >
                        <Row gutter={[16, 16]}>
                            {[
                                { label: 'Users', key: 'users', icon: <FiUsers size={16} />, color: '#4f46e5', bg: '#eef2ff' },
                                { label: 'Vendors', key: 'vendors', icon: <FiTruck size={16} />, color: '#10b981', bg: '#ecfdf5' },
                                { label: 'Customers', key: 'customers', icon: <FiGrid size={16} />, color: '#f59e0b', bg: '#fffbeb' },
                            ].map(item => {
                                const current = subscription?.[`current_${item.key}_count`] || 0;
                                const max = subscription?.Plan?.[`max_${item.key}`] || '∞';
                                const isExceeded = max !== '∞' && Number(current) > Number(max);
                                const percent = max === '∞' ? 0 : Math.min(100, Math.round((Number(current) / Number(max)) * 100));

                                return (
                                    <Col xs={24} sm={12} lg={8} key={item.label}>
                                        <div style={{ 
                                            background: '#f8fafc', 
                                            padding: '16px', 
                                            borderRadius: '12px', 
                                            border: isExceeded ? '1px solid #ef4444' : '1px solid #e2e8f0',
                                            transition: 'transform 0.2s ease',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                                        }}
                                        className="limit-metric-box"
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ background: item.bg, color: item.color, padding: '6px', borderRadius: '8px', display: 'flex' }}>
                                                        {item.icon}
                                                    </div>
                                                    <span style={{ fontWeight: 600, color: '#475569', fontSize: '14px' }}>{item.label}</span>
                                                </div>
                                                <Tag color={isExceeded ? 'error' : percent > 85 ? 'warning' : 'default'} style={{ borderRadius: '6px', fontWeight: 600, margin: 0 }}>
                                                    {isExceeded ? 'Exceeded' : max === '∞' ? 'Unlimited' : `${percent}%`}
                                                </Tag>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '8px' }}>
                                                <span style={{ fontSize: '24px', fontWeight: 800, color: isExceeded ? '#ef4444' : '#1e293b' }}>{current}</span>
                                                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>/ {max} Limit</span>
                                            </div>

                                            {max !== '∞' && (
                                                <Progress 
                                                    percent={percent} 
                                                    showInfo={false} 
                                                    strokeColor={isExceeded ? '#ef4444' : percent > 85 ? '#f59e0b' : item.color}
                                                    trailColor="#e2e8f0"
                                                    strokeWidth={6}
                                                    style={{ margin: 0 }}
                                                />
                                            )}
                                        </div>
                                    </Col>
                                );
                            })}
                        </Row>
                    </Card>
                </Col>
            </Row>

            {/* Available Plans for expiration or change */}
            <div className="available-plans-section">
                <Divider orientation="left">Available Plans</Divider>
                
                <Row gutter={[24, 24]}>
                    {activePlans.map(plan => {
                        const features = typeof plan.features === 'string' ? JSON.parse(plan.features) : (plan.features || {});
                        const isCurrentPlan = plan.id === subscription?.Plan?.id || plan.id === subscription?.plan_id;
                        const isRecommended = features?.is_recommended;
                        
                        // Human-readable limit text
                        const maxUsersText = !plan.max_users || plan.max_users === '0' || plan.max_users === 'unlimited' 
                            ? 'Unlimited Team Users' 
                            : `Up to ${plan.max_users} Team Users`;
                        
                        const maxVendorsText = !plan.max_vendors || plan.max_vendors === '0' || plan.max_vendors === 'unlimited'
                            ? 'Unlimited Vendor Access'
                            : `Up to ${plan.max_vendors || '50'} Vendor Accounts`;

                        const storageText = `${formatStorageSize(plan.storage_limit)} Secure Cloud Storage`;
                        
                        // Robust boolean checks for database feature objects (handling undefined, alternate keys, stringified formats)
                        const hasWhatsApp = !!features?.whatsapp;
                        const hasAi = !!(features?.ai_features || features?.ai || Number(plan.ai_credits) > 0);
                        const hasReports = !!features?.reports;
                        const hasBulk = !!features?.bulk_operations;
                        const hasWorkflows = !!features?.workflows;

                        return (
                            <Col xs={24} sm={12} lg={6} key={plan.id}>
                                <Card 
                                    className={`available-plan-card ${isCurrentPlan ? 'current-plan-card' : (isRecommended ? 'recommended-plan-card' : '')}`}
                                    bordered={false}
                                    hoverable
                                    style={{
                                        border: isCurrentPlan ? '2px solid #16a34a' : (isRecommended ? '2px solid #2563eb' : '1px solid #e2e8f0'),
                                        position: 'relative',
                                        borderRadius: '16px',
                                        transition: 'all 0.3s ease'
                                    }}
                                >
                                    {isCurrentPlan ? (
                                        <div style={{
                                            position: 'absolute',
                                            top: '0',
                                            right: '24px',
                                            background: '#16a34a',
                                            color: '#ffffff',
                                            padding: '5px 14px',
                                            borderBottomLeftRadius: '8px',
                                            borderBottomRightRadius: '8px',
                                            fontSize: '10px',
                                            fontWeight: 700,
                                            letterSpacing: '1px',
                                            boxShadow: '0 2px 8px rgba(22, 163, 74, 0.25)',
                                            zIndex: 10
                                        }}>
                                            CURRENT PLAN
                                        </div>
                                    ) : (
                                        isRecommended && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '0',
                                                right: '24px',
                                                background: '#2563eb',
                                                color: '#ffffff',
                                                padding: '5px 14px',
                                                borderBottomLeftRadius: '8px',
                                                borderBottomRightRadius: '8px',
                                                fontSize: '10px',
                                                fontWeight: 700,
                                                letterSpacing: '1px',
                                                boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
                                                zIndex: 10
                                            }}>
                                                RECOMMENDED
                                            </div>
                                        )
                                    )}
                                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                                        <div className="plan-card-header">
                                            <div className="plan-title-section" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
                                                <Title level={4} style={{ margin: 0, color: '#1e293b', fontWeight: 700 }}>{plan.name}</Title>
                                                <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                                    {isCurrentPlan && (
                                                        <Tag color="success" style={{ fontWeight: 700, borderRadius: '4px', margin: 0, padding: '2px 8px' }}>CURRENT PLAN</Tag>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="price-section" style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginTop: '8px', marginBottom: '20px' }}>
                                                <span className="currency-icon" style={{ fontSize: '20px', fontWeight: 600, color: '#2563eb' }}>
                                                    {getCurrencyIcon(plan.currency)}
                                                </span>
                                                <span className="amount" style={{ fontSize: '36px', fontWeight: 800, color: '#1e293b' }}>
                                                    {plan.price}
                                                </span>
                                                <span className="duration" style={{ fontSize: '14px', color: '#64748b', fontWeight: 500, marginLeft: '2px' }}>
                                                    / {plan.duration || 'Month'}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="plan-features" style={{ flexGrow: 1 }}>
                                            <div className="features-group">
                                                <span style={{ display: 'block', textTransform: 'uppercase', fontSize: '11px', fontWeight: 700, color: '#94a3b8', letterSpacing: '1px', marginBottom: '16px' }}>PLAN INCLUDES</span>
                                                <ul style={{ padding: 0, listStyle: 'none', margin: 0 }}>
                                                    {[
                                                        maxUsersText,
                                                        maxVendorsText,
                                                        storageText
                                                    ].map((item, idx) => (
                                                        <li key={idx} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                                                            <FiCheck size={16} style={{ color: '#16a34a', marginRight: '10px', flexShrink: 0 }} />
                                                            <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>
                                                                {item}
                                                            </span>
                                                        </li>
                                                    ))}

                                                    {/* AI Features */}
                                                    <li style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                                                        {hasAi ? (
                                                            <>
                                                                <FiCheck size={16} style={{ color: '#16a34a', marginRight: '10px', flexShrink: 0 }} />
                                                                <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>
                                                                    {plan.ai_credits > 0 ? `${plan.ai_credits} Premium AI Credits` : 'AI Analysis & Chat'}
                                                                </span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FiX size={16} style={{ color: '#ef4444', marginRight: '10px', flexShrink: 0 }} />
                                                                <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500, textDecoration: 'line-through' }}>
                                                                    AI Features Not Enabled
                                                                </span>
                                                            </>
                                                        )}
                                                    </li>

                                                    {/* WhatsApp Automation */}
                                                    <li style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                                                        {hasWhatsApp ? (
                                                            <>
                                                                <FiCheck size={16} style={{ color: '#16a34a', marginRight: '10px', flexShrink: 0 }} />
                                                                <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>WhatsApp Automation</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FiX size={16} style={{ color: '#ef4444', marginRight: '10px', flexShrink: 0 }} />
                                                                <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500, textDecoration: 'line-through' }}>WhatsApp Automation</span>
                                                            </>
                                                        )}
                                                    </li>

                                                    {/* Advanced Reports */}
                                                    <li style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                                                        {hasReports ? (
                                                            <>
                                                                <FiCheck size={16} style={{ color: '#16a34a', marginRight: '10px', flexShrink: 0 }} />
                                                                <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>Advanced Reports</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FiX size={16} style={{ color: '#ef4444', marginRight: '10px', flexShrink: 0 }} />
                                                                <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500, textDecoration: 'line-through' }}>Advanced Reports</span>
                                                            </>
                                                        )}
                                                    </li>

                                                    {/* Bulk Import/Export */}
                                                    <li style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                                                        {hasBulk ? (
                                                            <>
                                                                <FiCheck size={16} style={{ color: '#16a34a', marginRight: '10px', flexShrink: 0 }} />
                                                                <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>Bulk Import/Export</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FiX size={16} style={{ color: '#ef4444', marginRight: '10px', flexShrink: 0 }} />
                                                                <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500, textDecoration: 'line-through' }}>Bulk Import/Export</span>
                                                            </>
                                                        )}
                                                    </li>

                                                    {/* Automated Workflows */}
                                                    <li style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                                                        {hasWorkflows ? (
                                                            <>
                                                                <FiCheck size={16} style={{ color: '#16a34a', marginRight: '10px', flexShrink: 0 }} />
                                                                <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>Automated Workflows</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <FiX size={16} style={{ color: '#ef4444', marginRight: '10px', flexShrink: 0 }} />
                                                                <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 500, textDecoration: 'line-through' }}>Automated Workflows</span>
                                                            </>
                                                        )}
                                                    </li>

                                                    {/* Custom dynamic features checklist */}
                                                    {features.custom_features && Array.isArray(features.custom_features) && features.custom_features.map((feat, idx) => (
                                                        <li key={`custom-${idx}`} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                                                            <FiCheck size={16} style={{ color: '#16a34a', marginRight: '10px', flexShrink: 0 }} />
                                                            <span style={{ fontSize: '13px', color: '#475569', fontWeight: 500 }}>
                                                                {feat}
                                                            </span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>

                                        <Button 
                                            type={isCurrentPlan ? 'default' : 'primary'} 
                                            block 
                                            disabled={isEmployee}
                                            onClick={() => { setSelectedPlanToBuy(plan); setIsBuyPlanModalOpen(true); }}
                                            style={{ 
                                                borderRadius: '8px', 
                                                fontWeight: 600, 
                                                height: '40px',
                                                marginTop: '24px',
                                                background: isEmployee
                                                    ? '#e2e8f0'
                                                    : isCurrentPlan 
                                                        ? '#ffffff' 
                                                        : (isRecommended 
                                                            ? 'linear-gradient(135deg, #2563eb, #3b82f6)' 
                                                            : '#2563eb'),
                                                borderColor: isEmployee
                                                    ? '#cbd5e1'
                                                    : isCurrentPlan 
                                                        ? '#16a34a' 
                                                        : '#2563eb',
                                                color: isEmployee
                                                    ? '#94a3b8'
                                                    : isCurrentPlan ? '#16a34a' : '#ffffff',
                                                boxShadow: isCurrentPlan || isEmployee ? 'none' : '0 4px 10px rgba(37, 99, 235, 0.15)',
                                                transition: 'all 0.3s ease',
                                                cursor: isEmployee ? 'not-allowed' : 'pointer'
                                            }}
                                        >
                                            {isEmployee 
                                                ? 'Contact Admin to Upgrade' 
                                                : isCurrentPlan 
                                                    ? 'Buy / Extend Plan' 
                                                    : 'Upgrade Plan'}
                                        </Button>
                                    </div>
                                </Card>
                            </Col>
                        );
                    })}
                </Row>
            </div>

            <ClientBuyPlanModal open={isBuyPlanModalOpen} onCancel={() => setIsBuyPlanModalOpen(false)} plan={selectedPlanToBuy} companyId={loggedInUser?.id} />
            <CreateInquaryModal open={isRenewModalOpen} onCancel={() => setIsRenewModalOpen(false)} loggedInUser={loggedInUser} initialValues={{ subject: 'Plan Renewal / Upgrade Request', message: `Requesting plan renewal or upgrade/change plan query for ${subscription?.Plan?.name} plan.` }} />
        </div>
    );
};

export default Plan;