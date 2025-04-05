import React from 'react';
import { Card, Row, Col, Typography, Tag, Space } from 'antd';
import {
    FiUser,
    FiMail,
    FiPhone,
    FiMapPin,
    FiDollarSign,
    FiTarget,
    FiCalendar,
    FiUsers,
    FiActivity,
    FiFolder,
    FiClock,
    FiCheck,
    FiX,
} from 'react-icons/fi';
import dayjs from 'dayjs';
import { useGetAllCurrenciesQuery } from '../../../../module/settings/services/settingsApi';
import { useGetLeadStagesQuery } from '../../crmsystem/leadstage/services/leadStageApi';

const { Title, Text } = Typography;

const DealOverview = ({ deal, currentStatus }) => {
    const { data: currencies = [] } = useGetAllCurrenciesQuery();
    const { data: leadStages = [] } = useGetLeadStagesQuery();

    if (!deal) return <div>Deal not found</div>;

    const formatCurrency = (value, currencyId) => {
        const currencyDetails = currencies.find(c => c.id === currencyId);
        if (!currencyDetails) return `${value}`;

        return new Intl.NumberFormat('en-US', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value).replace(/^/, currencyDetails.currencyIcon + ' ');
    };

    const getStageNameById = (stageId) => {
        const stage = leadStages.find(stage => stage.id === stageId);
        return stage ? stage.stageName : '-';
    };

    const getStatusStyle = (status) => {
        // First check is_won flag
        if (deal?.is_won === true) {
            return {
                background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                color: '#52c41a',
                icon: <FiTarget className="status-icon" />,
                text: 'Won'
            };
        } else if (deal?.is_won === false) {
            return {
                background: 'linear-gradient(135deg, #ff4d4f 0%, #cf1322 100%)',
                color: '#ff4d4f',
                icon: <FiTarget className="status-icon" />,
                text: 'Lost'
            };
        }

        // Default to pending if is_won is null
        return {
            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
            color: '#1890ff',
            icon: <FiTarget className="status-icon" />,
            text: 'Pending'
        };
    };

    const statusStyle = getStatusStyle(currentStatus || deal?.status);

    return (
        <div className="overview-content">
            <Card className="info-card contact-card">
                <div className="profile-header">
                    <div className="profile-main">
                        <div className="company-avatar">
                            {deal?.company_name ? deal.company_name[0].toUpperCase() : 'C'}
                        </div>
                        <div className="profile-info">
                            <h2 className="company-name">{deal?.company_name || 'Company Name'}</h2>
                            <div className="contact-name">
                                <FiUser className="icon" />
                                {deal?.firstName} {deal?.lastName}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="profile-stats">
                    <div className="stat-item">
                        <div className="stat-icon">
                            <FiMail />
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Email Address</div>
                            <a href={`mailto:${deal?.email}`} className="stat-value">
                                {deal?.email || '-'}
                            </a>
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon">
                            <FiPhone />
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Phone Number</div>
                            <a href={`tel:${deal?.phone}`} className="stat-value">
                                +{deal?.phone || '-'}
                            </a>
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon">
                            <FiMapPin />
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Location</div>
                            <div className="stat-value">{deal?.address || '-'}</div>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Key Metrics Cards */}
            <Row gutter={[16, 16]} className="metrics-row">
                <Col xs={24} sm={12} md={6}>
                    <Card className="metric-card lead-value-card">
                        <div className="metric-icon">
                            <FiDollarSign />
                        </div>
                        <div className="metric-content">
                            <div className="metric-label">Deal Value</div>
                            <div className="metric-value">
                                {deal?.value ? formatCurrency(deal.value, deal.currency) : '-'}
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className={`metric-card status-card ${currentStatus || deal?.status}`}>
                        <div 
                            className="metric-icon"
                            style={{
                                background: statusStyle.background
                            }}
                        >
                            {statusStyle.icon}
                        </div>
                        <div className="metric-content">
                            <div className="metric-label"  style={{ color: statusStyle.color }}>Status</div>
                            <div 
                                className="metric-value"
                                style={{ color: statusStyle.color }}
                            >
                                {statusStyle.text}
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="metric-card created-date-card">
                        <div className="metric-icon">
                            <FiCalendar />
                        </div>
                        <div className="metric-content">
                            <div className="metric-label">Created</div>
                            <div className="metric-value">
                                {deal?.createdAt ? dayjs(deal.createdAt).format('MMM DD, YYYY') : '-'}
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="metric-card members-card">
                        <div className="metric-icon">
                            <FiUsers />
                        </div>
                        <div className="metric-content">
                            <div className="metric-label">Deal Members</div>
                            <div className="metric-value">
                                {deal?.deal_members ? JSON.parse(deal.deal_members).deal_members.length : '0'}
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Deal Details Section */}
            <div className="lead-details-section">
                <Row gutter={[24, 24]}>
                    <Col xs={24} sm={12} md={6}>
                        <div className="detail-card source-card">
                            <div className="detail-content">
                                <div className="detail-icon">
                                    <FiActivity />
                                </div>
                                <div className="detail-info">
                                    <div className="detail-label">Stage</div>
                                    <div className="detail-value">
                                        {getStageNameById(deal?.stage)}
                                    </div>
                                </div>
                                <div className="detail-indicator" />
                            </div>
                        </div>
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                        <div className="detail-card stage-card">
                            <div className="detail-content">
                                <div className="detail-icon">
                                    <FiFolder />
                                </div>
                                <div className="detail-info">
                                    <div className="detail-label">Category</div>
                                    <div className="detail-value">{deal?.category || '-'}</div>
                                </div>
                                <div className="detail-indicator" />
                            </div>
                        </div>
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                        <div className="detail-card category-card">
                            <div className="detail-content">
                                <div className="detail-icon">
                                    <FiClock />
                                </div>
                                <div className="detail-info">
                                    <div className="detail-label">Expected Close Date</div>
                                    <div className="detail-value">
                                        {deal?.expectedCloseDate ? dayjs(deal.expectedCloseDate).format('MMM DD, YYYY') : '-'}
                                    </div>
                                </div>
                                <div className="detail-indicator" />
                            </div>
                        </div>
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                        <div className="detail-card status-card">
                            <div className="detail-content">
                                <div className="detail-icon">
                                    <FiTarget />
                                </div>
                                <div className="detail-info">
                                    <div className="detail-label">Priority</div>
                                    <div className="detail-value">{deal?.priority || '-'}</div>
                                </div>
                                <div className="detail-indicator" />
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default DealOverview; 