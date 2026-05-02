import React, { useState } from 'react';
import {
    Card, Typography, Button, Row, Col, message, Tag, Progress, Divider, Spin
} from 'antd';
import {
    FiHome, FiCalendar, FiHardDrive, FiUsers, FiDollarSign, FiRefreshCw, FiCheck
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
import PageHeader from '../../../../components/PageHeader';

const { Title, Text } = Typography;

const Plan = () => {
    const [isRenewModalOpen, setIsRenewModalOpen] = useState(false);
    const [selectedPlanForInquiry, setSelectedPlanForInquiry] = useState(null);
    const [isBuyPlanModalOpen, setIsBuyPlanModalOpen] = useState(false);
    const [selectedPlanToBuy, setSelectedPlanToBuy] = useState(null);
    const loggedInUser = useSelector(selectCurrentUser);

    const id = loggedInUser.client_plan_id;
    const { data: subscriptionData, isLoading } = useGetsubcriptionByIdQuery(id);
    const { data: plansData, isLoading: isPlansLoading } = useGetAllPlansQuery({ page: 1, limit: 100, status: 'active' });
    const { data: currencies } = useGetAllCurrenciesQuery({ page: 1, limit: 100 });

    if (isLoading || isPlansLoading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}><Spin size="large" /></div>;
    }

    const subscription = subscriptionData?.data;

    const getCurrencyIcon = (currencyId) => {
        const currency = currencies?.find(c => c.id === currencyId);
        return currency?.currencyIcon || '₹';
    };

    const formatStorageSize = (sizeInMB) => {
        const size = parseFloat(sizeInMB);
        return size >= 1024 ? `${(size / 1024).toFixed(2)} GB` : `${Math.round(size)} MB`;
    };

    return (
        <div className="plan-page standard-page-container">
            <PageHeader
                title="Subscription Details"
                subtitle="Your current plan and usage"
                breadcrumbItems={[
                    { title: <Link to="/dashboard"><FiHome style={{ marginRight: '4px' }} /> Home</Link> },
                    { title: "Settings" },
                    { title: "Subscription" },
                ]}
                extraActions={moment(subscription?.end_date).isBefore(moment()) ? [
                    <Button key="renew" type="primary" icon={<FiRefreshCw />} onClick={() => setIsRenewModalOpen(true)}>
                        Renew Plan
                    </Button>
                ] : []}
            />

            <Row gutter={[16, 16]} style={{ marginTop: '12px' }}>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="standard-content-card" title={<><FiHardDrive /> Storage Usage</>} extra={<Tag color={subscription?.storage?.percentage > 90 ? 'error' : 'success'}>{subscription?.storage?.percentage > 90 ? 'Critical' : 'Healthy'}</Tag>}>
                        <Progress percent={subscription?.storage?.percentage} status={subscription?.storage?.percentage > 90 ? 'exception' : 'normal'} />
                        <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between' }}>
                            <Text type="secondary">Used: {subscription?.storage?.used.toFixed(2)} GB</Text>
                            <Text type="secondary">Total: {subscription?.storage?.total} GB</Text>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="standard-content-card" title={<><FiDollarSign /> Plan Details</>} extra={<Tag color="processing">Active</Tag>}>
                        <Text strong style={{ fontSize: '18px', display: 'block' }}>{subscription?.Plan?.name}</Text>
                        <Text type="secondary">Price: ₹{subscription?.Plan?.price}</Text>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="standard-content-card" title={<><FiCalendar /> Subscription Period</>} extra={<Tag color="success">{subscription?.status?.toUpperCase()}</Tag>}>
                        <Text strong>{moment(subscription?.start_date).format('DD MMM')} - {moment(subscription?.end_date).format('DD MMM YYYY')}</Text>
                        <Progress percent={Math.min(100, Math.round((moment(subscription?.end_date).diff(moment(), 'days') / 365) * 100))} strokeWidth={4} style={{ marginTop: '8px' }} />
                        <Text type="secondary" style={{ fontSize: '12px' }}>{moment(subscription?.end_date).diff(moment(), 'days')} days left</Text>
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card className="standard-content-card" title={<><FiUsers /> User Limits</>}>
                        <Row gutter={[8, 8]}>
                            {['Users', 'Clients', 'Vendors', 'Customers'].map(label => (
                                <Col span={12} key={label}>
                                    <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '6px' }}>
                                        <Text type="secondary" style={{ fontSize: '11px' }}>{label}</Text>
                                        <div style={{ fontWeight: 600 }}>{subscription?.[`current_${label.toLowerCase()}_count`] || 0}</div>
                                    </div>
                                </Col>
                            ))}
                        </Row>
                    </Card>
                </Col>
            </Row>

            {moment(subscription?.end_date).isBefore(moment()) && (
                <div style={{ marginTop: '24px' }}>
                    <Divider orientation="left"><Title level={4}>Available Plans</Title></Divider>
                    <Row gutter={[16, 16]}>
                        {plansData?.data?.filter(p => p.status === 'active').map(plan => (
                            <Col xs={24} sm={12} lg={6} key={plan.id}>
                                <Card className="standard-content-card" hoverable>
                                    <Title level={4}>{plan.name}</Title>
                                    <div style={{ fontSize: '24px', fontWeight: 700, color: '#4f46e5', margin: '12px 0' }}>
                                        {getCurrencyIcon(plan.currency)}{plan.price} <Text type="secondary" style={{ fontSize: '14px', fontWeight: 400 }}>/{plan.duration}</Text>
                                    </div>
                                    <ul style={{ padding: 0, listStyle: 'none', margin: '16px 0' }}>
                                        {[{ l: 'Users', v: plan.max_users }, { l: 'Clients', v: plan.max_clients }, { l: 'Storage', v: formatStorageSize(plan.storage_limit) }].map(f => (
                                            <li key={f.l} style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <FiCheck style={{ color: '#059669' }} /> <Text style={{ fontSize: '13px' }}>{f.v} {f.l}</Text>
                                            </li>
                                        ))}
                                    </ul>
                                    <Button type="primary" block onClick={() => { setSelectedPlanToBuy(plan); setIsBuyPlanModalOpen(true); }}>Buy Now</Button>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>
            )}

            <CreateUpgradePlan open={isBuyPlanModalOpen} onCancel={() => setIsBuyPlanModalOpen(false)} companyId={loggedInUser?.id} preselectedPlanId={selectedPlanToBuy?.id} modalTitle="Buy This Plan" buttonText="Buy This Plan" initialStartDate={moment()} initialStatus="active" initialPaymentStatus="unpaid" />
            <CreateInquaryModal open={isRenewModalOpen} onCancel={() => setIsRenewModalOpen(false)} loggedInUser={loggedInUser} initialValues={{ subject: 'Plan Renewal Request', message: `Requesting plan renewal for ${subscription?.Plan?.name} plan.` }} />
        </div>
    );
};

export default Plan;