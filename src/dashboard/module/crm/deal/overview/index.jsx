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
    FiTrendingUp,
    FiTrendingDown,
    FiMinusCircle,
} from 'react-icons/fi';
import './overview.scss';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../../../auth/services/authSlice';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const DealOverview = ({ deal }) => {
    if (!deal) return <div>Deal not found</div>;

    const formatCurrency = (value, currency = "INR") => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0
        }).format(value);
    };

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
                                {deal?.phone || '-'}
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
                    <Card className="metric-card status-card">
                        <div className="metric-icon">
                            <FiTarget />
                        </div>
                        <div className="metric-content">
                            <div className="metric-label">Status</div>
                            <div className="metric-value">
                                {deal?.status || '-'}
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
                                    <div className="detail-value">{deal?.stage || '-'}</div>
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