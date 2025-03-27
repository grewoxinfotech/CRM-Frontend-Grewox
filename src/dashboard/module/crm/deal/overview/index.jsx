import React from 'react';
import { Card, Row, Col, Statistic, Progress, Timeline, Typography, Descriptions } from 'antd';
import { FiDollarSign, FiUsers, FiClock, FiBriefcase, FiMail, FiPhone, FiGlobe } from 'react-icons/fi';
import './overview.scss';
import { useParams } from 'react-router-dom';
import { useGetDealsQuery } from '../services/DealApi';
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
        <div className="deal-overview">
            <Row gutter={[24, 24]}>
                {/* Deal Info Card */}
                <Col xs={24}>
                    <Card bordered={false} className="info-card">
                        <Title level={4}>{deal.dealName}</Title>
                        <Descriptions column={{ xs: 1, sm: 2, md: 3 }}>
                            <Descriptions.Item label="Company">
                                <Text><FiBriefcase className="icon" /> {deal.company_name || '-'}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Contact">
                                <Text>{`${deal.firstName || ''} ${deal.lastName || ''}`}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Email">
                                <Text><FiMail className="icon" /> {deal.email || '-'}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Phone">
                                <Text><FiPhone className="icon" /> {deal.phone || '-'}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Website">
                                <Text><FiGlobe className="icon" /> {deal.website || '-'}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label="Status">
                                <Text className={`status-tag ${deal.status?.toLowerCase()}`}>
                                    {deal.status || 'Unknown'}
                                </Text>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>

                {/* Statistics Cards */}
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="stat-card">
                        <Statistic
                            title="Deal Value"
                            value={deal.value}
                            prefix={<FiDollarSign className="stat-icon" />}
                            formatter={(value) => formatCurrency(value, deal.currency)}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="stat-card">
                        <Statistic
                            title="Created Date"
                            value={dayjs(deal.createdAt).format('MMM DD, YYYY')}
                            prefix={<FiClock className="stat-icon" />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="stat-card">
                        <Statistic
                            title="Label"
                            value={deal.label || 'No Label'}
                            prefix={<FiUsers className="stat-icon" />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card bordered={false} className="stat-card">
                        <Statistic
                            title="Closed Date"
                            value={deal.closedDate ? dayjs(deal.closedDate).format('MMM DD, YYYY') : 'Not Closed'}
                            prefix={<FiClock className="stat-icon" />}
                        />
                    </Card>
                </Col>

                {/* Timeline Section */}
                <Col xs={24}>
                    <Card title="Deal Timeline" bordered={false}>
                        <Timeline
                            items={[
                                {
                                    color: 'blue',
                                    children: `Deal Created on ${dayjs(deal.createdAt).format('MMM DD, YYYY')}`,
                                },
                                {
                                    color: 'green',
                                    children: `Last Updated on ${dayjs(deal.updatedAt).format('MMM DD, YYYY')}`,
                                },
                                deal.closedDate && {
                                    color: 'red',
                                    children: `Deal Closed on ${dayjs(deal.closedDate).format('MMM DD, YYYY')}`,
                                },
                            ].filter(Boolean)}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default DealOverview; 