import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Tabs, Breadcrumb, Button, Typography, Tag, Space, Row, Col, Descriptions } from 'antd';
import {
    FiArrowLeft,
    FiHome,
    FiUser,
    FiMail,
    FiPhone,
    FiMapPin,
    FiDollarSign,
    FiTarget,
    FiCalendar,
    FiActivity,
    FiFileText,
    FiUsers,
    FiClock,
    FiPaperclip,
    FiInfo,
} from 'react-icons/fi';
import { useGetLeadQuery } from '../services/LeadApi';
import LeadActivity from './activity';
import LeadNotes from './notes';
import LeadFiles from './files';
import LeadMembers from './members';
import './LeadOverview.scss';
import {
    useGetSourcesQuery,
    useGetStatusesQuery,
} from '../../../crm/crmsystem/souce/services/SourceApi';
import { useGetLeadStagesQuery } from '../../../crm/crmsystem/leadstage/services/leadStageApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../../../auth/services/authSlice';

const { Title, Text } = Typography;

const LeadOverviewContent = ({ leadData, formatCurrency, getInterestLevel }) => {
    const interestLevel = getInterestLevel(leadData?.interest_level);

    return (
        <Card className="overview-card">
            <Descriptions title="Lead Information" bordered column={2}>
                <Descriptions.Item label="Contact Person">
                    <Space>
                        <FiUser className="icon" />
                        {leadData?.contact_person || '-'}
                    </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                    <Space>
                        <FiMail className="icon" />
                        <a href={`mailto:${leadData?.email}`}>{leadData?.email || '-'}</a>
                    </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Phone">
                    <Space>
                        <FiPhone className="icon" />
                        <a href={`tel:${leadData?.phone}`}>{leadData?.phone || '-'}</a>
                    </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Company">
                    <Space>
                        <FiMapPin className="icon" />
                        {leadData?.company_name || '-'}
                    </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Lead Value">
                    <Space>
                        <FiDollarSign className="icon" />
                        <span className="currency-value">
                            {leadData?.leadValue ? formatCurrency(leadData.leadValue, leadData.currency) : '-'}
                        </span>
                    </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Source">
                    <Space>
                        <FiTarget className="icon" />
                        <Tag color="blue">{leadData?.source || '-'}</Tag>
                    </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Stage">
                    <Space>
                        <FiTarget className="icon" />
                        <Tag color="purple">{leadData?.stage || '-'}</Tag>
                    </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Interest Level">
                    <Space>
                        <div
                            className={`interest-level ${leadData?.interest_level || 'medium'}`}
                            style={{
                                backgroundColor: interestLevel.bg,
                                color: interestLevel.color
                            }}
                        >
                            {interestLevel.text}
                        </div>
                    </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Created Date" span={2}>
                    <Space>
                        <FiCalendar className="icon" />
                        <span className="date-value">
                            {leadData?.created_at ? new Date(leadData.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            }) : '-'}
                        </span>
                    </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Description" span={2}>
                    <div className="description-value">
                        {leadData?.description || '-'}
                    </div>
                </Descriptions.Item>
            </Descriptions>
        </Card>
    );
};

const LeadOverview = () => {
    const { leadId } = useParams();
    const navigate = useNavigate();
    const loggedInUser = useSelector(selectCurrentUser);
    const { data: lead, isLoading } = useGetLeadQuery(leadId);
    const { data: sourcesData } = useGetSourcesQuery(loggedInUser?.id);
    const { data: statusesData } = useGetStatusesQuery(loggedInUser?.id);
    const { data: stagesData } = useGetLeadStagesQuery(loggedInUser?.id);
    const leadData = lead?.data;
    const stages = stagesData?.find(stage => stage.id === leadData?.leadStage) || [];
    const sources = sourcesData?.data || [];

    const getInterestLevel = (level) => {
        const levels = {
            "high": {
                color: "#52c41a",
                bg: "rgba(82, 196, 26, 0.1)",
                text: "High Interest"
            },
            "medium": {
                color: "#faad14",
                bg: "rgba(250, 173, 20, 0.1)",
                text: "Medium Interest"
            },
            "low": {
                color: "#ff4d4f",
                bg: "rgba(255, 77, 79, 0.1)",
                text: "Low Interest"
            }
        };
        return levels[level] || levels.medium;
    };

    const formatCurrency = (value, currency = "INR") => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0
        }).format(value);
    };

    const items = [
        {
            key: 'overview',
            label: (
                <span>
                    <FiFileText /> Overview
                </span>
            ),
            children: <LeadOverviewContent
                leadData={leadData}
                formatCurrency={formatCurrency}
                getInterestLevel={getInterestLevel}
            />,
        },
        {
            key: 'activity',
            label: (
                <span>
                    <FiActivity /> Activity
                </span>
            ),
            children: <LeadActivity leadId={leadId} />,
        },
        {
            key: 'notes',
            label: (
                <span>
                    <FiFileText /> Notes
                </span>
            ),
            children: <LeadNotes leadId={leadId} />,
        },
        {
            key: 'files',
            label: (
                <span>
                    <FiPaperclip /> Files
                </span>
            ),
            children: <LeadFiles leadId={leadId} />,
        },
        {
            key: 'members',
            label: (
                <span>
                    <FiUsers /> Lead Members
                </span>
            ),
            children: <LeadMembers leadId={leadId} />,
        }
    ];

    return (
        <div className="project-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/dashboard">
                            <FiHome /> Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <Link to="/dashboard/crm/lead">
                            <FiUser /> Leads
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        {leadData?.leadTitle || 'Lead Details'}
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>{leadData?.leadTitle}</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="header-left">
                    <Title level={2}>{leadData?.leadTitle || 'Lead Details'}</Title>
                    <Text type="secondary" className="subtitle">
                        Manage lead details and activities
                    </Text>
                </div>
                <div className="header-right">
                    <Space>
                        <Button
                            type="primary"
                            icon={<FiArrowLeft />}
                            onClick={() => navigate('/dashboard/crm/lead')}
                            style={{
                                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                                border: 'none',
                                height: '44px',
                                padding: '0 24px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                borderRadius: '10px',
                                fontWeight: '500'
                            }}
                        >
                            Back to Leads
                        </Button>
                        <Button type="primary">
                            Convert to Deal
                        </Button>
                    </Space>
                </div>
            </div>

            <div className="page-contentt">
                <div className="content-main">
                    <Card loading={isLoading}>
                        <Tabs
                            defaultActiveKey="activity"
                            items={items}
                            className="project-tabs"
                            type="card"
                            size="large"
                            animated={{ inkBar: true, tabPane: true }}
                        />
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default LeadOverview;
