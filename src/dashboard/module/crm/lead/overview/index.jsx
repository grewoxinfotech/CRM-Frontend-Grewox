import React, { useMemo, useState } from 'react';
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
    FiFolder,
    FiTrendingUp,
    FiTrendingDown,
    FiMinusCircle,
    FiPhoneCall,
    FiBox,
} from 'react-icons/fi';
import { useGetLeadQuery } from '../services/LeadApi';
import { useGetAllCurrenciesQuery, useGetAllCountriesQuery } from '../../../../module/settings/services/settingsApi';
import CreateDeal from '../../deal/CreateDeal';
import { useGetPipelinesQuery } from '../../crmsystem/pipeline/services/pipelineApi';

import LeadActivity from './activity';
import LeadNotes from './notes';
import LeadFiles from './files';
import LeadMembers from './members';
import LeadFollowup from './followup/index.jsx';
import './LeadOverview.scss';
import {
    useGetCategoriesQuery,
    useGetSourcesQuery,
    useGetStatusesQuery,
} from '../../crmsystem/souce/services/SourceApi';
import { useGetLeadStagesByPipelineQuery, useGetLeadStagesQuery } from '../../crmsystem/leadstage/services/leadStageApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../../../auth/services/authSlice';

const { Title, Text } = Typography;

const LeadOverviewContent = ({ leadData, formatCurrency, getInterestLevel }) => {
    const loggedInUser = useSelector(selectCurrentUser);
    const { data: currencies = [] } = useGetAllCurrenciesQuery();

    // Fetch data from APIs
    const { data: stagesData } = useGetLeadStagesByPipelineQuery();
    const { data: sourcesData } = useGetSourcesQuery(loggedInUser?.id);
    const { data: statusesData } = useGetStatusesQuery(loggedInUser?.id);
    const { data: categoriesData } = useGetCategoriesQuery(loggedInUser?.id);

    // Filter stages to only show lead type stages
    const stages = stagesData?.filter(stage => stage.stageType === "lead") || [];
    const sources = sourcesData?.data || [];
    const statuses = statusesData?.data || [];
    const categories = categoriesData?.data || [];

    // Helper functions to get names and colors
    const getStageInfo = (stageId) => {
        const stage = stages.find(s => s.id === stageId);
        return {
            name: stage?.stageName || '-',
            color: stage?.color || '#1890ff'
        };
    };

    const getSourceInfo = (sourceId) => {
        const source = sources.find(s => s.id === sourceId);
        return {
            name: source?.name || '-',
            color: source?.color || '#1890ff'
        };
    };

    const getStatusInfo = (statusId) => {
        const status = statuses.find(s => s.id === statusId);
        return {
            name: status?.name || '-',
            color: status?.color || '#1890ff'
        };
    };

    const getCategoryInfo = (categoryId) => {
        const category = categories.find(c => c.id === categoryId);
        return {
            name: category?.name || '-',
            color: category?.color || '#1890ff'
        };
    };

    const formatCurrencyValue = (value, currencyId) => {
        const currencyDetails = currencies?.find(c => c.id === currencyId);
        if (!currencyDetails) return `${value}`;
        
        return new Intl.NumberFormat('en-US', {
            style: 'decimal',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value).replace(/^/, currencyDetails.currencyIcon + ' ');
    };

    const interestLevel = getInterestLevel(leadData?.interest_level);

    return (
        <div className="overview-content">
            <Card className="info-card contact-card">
                <div className="profile-header">
                    <div className="profile-main">
                        <div className="company-avatar">
                            <FiBox size={24} />
                        </div>
                        <div className="profile-info">
                            <h2 className="company-name">{leadData?.company_name || 'Company Name'}</h2>
                            <div className="contact-name">
                                <FiUser className="icon" />
                                {leadData?.firstName} {leadData?.lastName}
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
                            <a href={`mailto:${leadData?.email}`} className="stat-value">
                                {leadData?.email || '-'}
                            </a>
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon">
                            <FiPhone />
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Phone Number</div>
                            <a href={`tel:${leadData?.telephone}`} className="stat-value">
                                {leadData?.telephone || '-'}
                            </a>
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon">
                            <FiMapPin />
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Location</div>
                            <div className="stat-value">{leadData?.address || '-'}</div>
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
                            <div className="metric-label">Lead Value</div>
                            <div className="metric-value">
                                {leadData?.leadValue ? formatCurrencyValue(leadData.leadValue, leadData.currency) : '-'}
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className={`metric-card interest-level-card ${leadData?.interest_level || 'medium'}`}>
                        <div className={`metric-icon ${leadData?.interest_level || 'medium'}`}>
                            <FiTarget />
                        </div>
                        <div className="metric-content">
                            <div className={`metric-label ${leadData?.interest_level || 'medium'}`}>Interest Level</div>
                            <div className="metric-value">
                                {leadData?.interest_level === 'high' ? (
                                    <span className="interest-text high">
                                        <FiTrendingUp className="icon" /> High Interest
                                    </span>
                                ) : leadData?.interest_level === 'low' ? (
                                    <span className="interest-text low">
                                        <FiTrendingDown className="icon" /> Low Interest
                                    </span>
                                ) : (
                                    <span className="interest-text medium">
                                        <FiMinusCircle className="icon" /> Medium Interest
                                    </span>
                                )}
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="metric-card created-date-card">
                        <div className="metric-icon">
                            <FiCalendar className='icon' />
                        </div>
                        <div className="metric-content">
                            <div className="metric-label">Created</div>
                            <div className="metric-value">
                                {leadData?.createdAt ? new Date(leadData.createdAt).toLocaleDateString() : '-'}
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
                            <div className="metric-label">Lead Members</div>
                            <div className="metric-value">
                                {leadData?.lead_members ? JSON.parse(leadData.lead_members).lead_members.length : '0'}
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Lead Details Section */}
            <div className="lead-details-section">
                <Row gutter={[24, 24]}>
                    {/* Source Card */}
                    <Col xs={24} sm={12} md={6}>
                        <div className="detail-card source-card">
                            <div className="detail-content">
                                <div className="detail-icon">
                                    <FiPhone />
                                </div>
                                <div className="detail-info">
                                    <div className="detail-label">Source</div>
                                    <div className="detail-value">Phone</div>
                                </div>
                                <div className="detail-indicator" />
                            </div>
                        </div>
                    </Col>

                    {/* Stage Card */}
                    <Col xs={24} sm={12} md={6}>
                        <div className="detail-card stage-card">
                            <div className="detail-content">
                                <div className="detail-icon">
                                    <FiActivity />
                                </div>
                                <div className="detail-info">
                                    <div className="detail-label">Stage</div>
                                    <div className="detail-value">Qualified</div>
                                </div>
                                <div className="detail-indicator" />
                            </div>
                        </div>
                    </Col>

                    {/* Category Card */}
                    <Col xs={24} sm={12} md={6}>
                        <div className="detail-card category-card">
                            <div className="detail-content">
                                <div className="detail-icon">
                                    <FiFolder />
                                </div>
                                <div className="detail-info">
                                    <div className="detail-label">Category</div>
                                    <div className="detail-value">Manufacturing</div>
                                </div>
                                <div className="detail-indicator" />
                            </div>
                        </div>
                    </Col>

                    {/* Status Card */}
                    <Col xs={24} sm={12} md={6}>
                        <div className="detail-card status-card">
                            <div className="detail-content">
                                <div className="detail-icon">
                                    <FiClock />
                                </div>
                                <div className="detail-info">
                                    <div className="detail-label">Status</div>
                                    <div className="detail-value">Cancelled</div>
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

const LeadOverview = () => {
    const { leadId } = useParams();
    const navigate = useNavigate();
    const loggedInUser = useSelector(selectCurrentUser);
    const { data: lead, isLoading } = useGetLeadQuery(leadId);
    const { data: sourcesData } = useGetSourcesQuery(loggedInUser?.id);
    const { data: statusesData } = useGetStatusesQuery(loggedInUser?.id);
    const { data: stagesData } = useGetLeadStagesQuery(loggedInUser?.id);
    const { data: pipelines = [] } = useGetPipelinesQuery();
    const [isCreateDealModalOpen, setIsCreateDealModalOpen] = useState(false);
    const leadData = lead?.data;
    const stages = stagesData?.find(stage => stage.id === leadData?.leadStage) || [];
    const sources = sourcesData?.data || [];

    // Format lead data for CreateDeal
    const formattedLeadData = useMemo(() => {
        if (!leadData) return null;

        return {
            id: leadData.id,
            leadTitle: leadData.leadTitle,
            firstName: leadData.firstName,
            lastName: leadData.lastName,
            email: leadData.email,
            phone: leadData.telephone?.split(' ')[1] || '',
            phoneCode: leadData.phoneCode,
            company: leadData.company_name,
            source: leadData.source,
            pipeline: leadData.pipeline,
            stage: leadData.leadStage,
            currency: leadData.currency,
            value: leadData.leadValue,
            category: leadData.category,
            address: leadData.address,
            status: leadData.status,
            interest_level: leadData.interest_level,
            lead_members: leadData.lead_members ? JSON.parse(leadData.lead_members).lead_members : []
        };
    }, [leadData]);

    const handleConvertToDeal = () => {
        setIsCreateDealModalOpen(true);
    };

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
            key: 'members',
            label: (
                <span>
                    <FiUsers /> Lead Members
                </span>
            ),
            children: <LeadMembers leadId={leadId} />,
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
            key: 'followup',
            label: (
                <span>
                    <FiPhoneCall /> Follow-up
                </span>
            ),
            children: <LeadFollowup leadId={leadId} />,
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
                        <Button 
                            type="primary"
                            onClick={handleConvertToDeal}
                            style={{
                                background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
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
                            Convert to Deal
                        </Button>
                    </Space>
                </div>
            </div>

            <div className="page-contentt">
                <div className="content-main">
                    <Card loading={isLoading}>
                        <Tabs
                            defaultActiveKey="overview"
                            items={items}
                            className="project-tabs"
                            type="card"
                            size="large"
                            animated={{ inkBar: true, tabPane: true }}
                        />
                    </Card>
                </div>
            </div>

            <CreateDeal 
                open={isCreateDealModalOpen}
                onCancel={() => setIsCreateDealModalOpen(false)}
                leadData={formattedLeadData}
                pipelines={pipelines}
            />
        </div>
    );
};

export default LeadOverview;
