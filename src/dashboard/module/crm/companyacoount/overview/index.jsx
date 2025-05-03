import React, { useState, useEffect } from 'react';
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
    FiBriefcase,
    FiGlobe,
} from 'react-icons/fi';
import dayjs from 'dayjs';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGetCompanyAccountsQuery, useUpdateCompanyAccountMutation } from '../services/companyAccountApi';
import { useGetUsersQuery } from '../../../user-management/users/services/userApi';
import { useGetLeadsQuery } from '../../lead/services/LeadApi';
import { useGetDealsQuery } from '../../deal/services/dealApi';
import { useGetSourcesQuery, useGetCategoriesQuery } from '../../crmsystem/souce/services/SourceApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from "../../../../../auth/services/authSlice.js";
import './companyoverview.scss';

const { Title, Text } = Typography;

const CompanyDetails = () => {
    const { accountId } = useParams();
    const navigate = useNavigate();
    const { data: companyAccountsResponse, isLoading } = useGetCompanyAccountsQuery();
    const { data: usersData } = useGetUsersQuery();
    const { data: lead } = useGetLeadsQuery();
    const { data: deal } = useGetDealsQuery();
    const [updateCompanyAccount] = useUpdateCompanyAccountMutation();
    const loggedInUser = useSelector(selectCurrentUser);
    const { data: sourcesData } = useGetSourcesQuery(loggedInUser?.id);

    const companies = Array.isArray(companyAccountsResponse?.data)
        ? companyAccountsResponse.data
        : Array.isArray(companyAccountsResponse)
            ? companyAccountsResponse
            : [];

    const sources = sourcesData?.data || [];

    const company = companies.find(company => company.id === accountId);

    const { data: categoriesData } = useGetCategoriesQuery(loggedInUser?.id);
    const categories = categoriesData?.data || [];

    const getCategoryName = (categoryId) => {
        const category = categories.find((c) => c.id === categoryId);
        return category?.name || "N/A";
    };

    const leadsData = lead?.data || [];
    const dealsData = deal || [];

    // Get all leads and separate converted/non-converted
    const allLeads = leadsData?.filter(lead => lead.company_id === accountId) || [];
    const convertedLeads = allLeads.filter(lead => lead.is_converted);
    const activeLeads = allLeads.filter(lead => !lead.is_converted);
    const deals = dealsData?.filter(deal => deal.company_id === accountId) || [];

    const totalLeadValue = activeLeads.reduce((sum, lead) => sum + (Number(lead.leadValue) || 0), 0);
    const totalDealValue = deals.reduce((sum, deal) => sum + (Number(deal.value) || 0), 0);
    const totalRevenue = totalLeadValue + totalDealValue;

    // Find contact owner's name
    const ownerName = company?.account_owner && usersData?.data
        ? usersData.data.find(user => user.id === company.account_owner)?.username || company.account_owner
        : 'Not Assigned';

    const getSourceName = (sourceId) => {
        const source = sources.find((s) => s.id === sourceId);
        return source?.name || "N/A";
    };

    if (!company) return <div>Company not found</div>;

    return (
        <div className="overview-content">
            <Card className="info-card contact-card">
                <div className="profile-header">
                    <div className="profile-main">
                        <div className="company-avatar">
                            {company?.company_name ? company.company_name[0].toUpperCase() : 'C'}
                        </div>
                        <div className="profile-info">
                            <h2 className="company-name">{company?.company_name || 'Company Name'}</h2>
                            <div className="contact-name">
                                <FiMail className="icon" />
                                <a href={company?.email} target="_blank">
                                    {company?.email || '-'}
                                </a>
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
                            <div className="stat-label">Email</div>
                            <a href={company?.email} target="_blank" className="stat-value">
                                {company?.email || '-'}
                            </a>
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon">
                            <FiPhone />
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Phone Number</div>
                            <a href={`tel:${company?.phone_number}`} className="stat-value">
                                {company?.phone_number || '-'}
                            </a>
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon">
                            <FiMapPin />
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Location</div>
                            <div className="stat-value">{company?.billing_city || '-'}</div>
                        </div>
                    </div>
                </div>
            </Card >

            <Row gutter={[16, 16]} className="metrics-row">
                <Col xs={24} sm={12} md={6}>
                    <Card
                        className="Metric-card leads-card"
                        style={{
                            background: 'linear-gradient(135deg, #fff1f2 0%, #fff 100%)',
                            borderRadius: '12px',
                            border: 'none',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
                        }}
                        bodyStyle={{
                            padding: '20px',
                            position: 'relative',
                            zIndex: 1
                        }}
                    >
                        <div style={{
                            position: 'absolute',
                            top: '-15px',
                            right: '-15px',
                            width: '80px',
                            height: '80px',
                            background: 'linear-gradient(135deg, #fecdd3 0%, #fecdd3 100%)',
                            borderRadius: '50%',
                            opacity: '0.15'
                        }} />
                        <div style={{
                            position: 'absolute',
                            bottom: '-25px',
                            left: '-25px',
                            width: '100px',
                            height: '100px',
                            background: 'linear-gradient(135deg, #fecdd3 0%, #fecdd3 100%)',
                            borderRadius: '50%',
                            opacity: '0.1'
                        }} />
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '12px'
                        }}>
                            <div style={{
                                background: 'linear-gradient(135deg, #ff4d6d 0%, #ff758f 100%)',
                                borderRadius: '10px',
                                padding: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 3px 10px rgba(255, 77, 109, 0.15)'
                            }}>
                                <FiTarget style={{ fontSize: '28px', color: 'white' }} />
                            </div>
                        </div>
                        <div style={{
                            fontSize: '14px',
                            color: '#e11d48',
                            marginBottom: '6px',
                            fontWeight: '600',
                            letterSpacing: '0.5px'
                        }}>
                            LEADS
                        </div>
                        <div style={{
                            fontSize: '28px',
                            fontWeight: '800',
                            color: '#ff4d6d',
                            marginBottom: '6px',
                            lineHeight: '1.2'
                        }}>
                            {activeLeads?.length || 0}
                        </div>
                        <div style={{
                            fontSize: '13px',
                            fontWeight: 'bold',
                            color: 'rgba(244, 63, 94, 0.75)'
                        }}>
                            ₹{totalLeadValue.toLocaleString()} Total Value
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            fontSize: '11px',
                            color: '#ff4d6d',
                            marginTop: '6px',
                            padding: '3px 6px',
                            background: 'rgba(255, 77, 109, 0.08)',
                            borderRadius: '4px',
                            width: 'fit-content'
                        }}>
                            <span>{convertedLeads.length} Converted</span>
                            <span>•</span>
                            <span>{allLeads.length} Total</span>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} md={6}>
                    <Card
                        className="Metric-card deals-card"
                        style={{
                            background: 'linear-gradient(135deg, #f0fdf4 0%, #fff 100%)',
                            borderRadius: '12px',
                            border: 'none',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
                        }}
                        bodyStyle={{
                            padding: '20px',
                            position: 'relative',
                            zIndex: 1
                        }}
                    >
                        <div style={{
                            position: 'absolute',
                            top: '-15px',
                            right: '-15px',
                            width: '80px',
                            height: '80px',
                            background: 'linear-gradient(135deg, #bbf7d0 0%, #bbf7d0 100%)',
                            borderRadius: '50%',
                            opacity: '0.15'
                        }} />
                        <div style={{
                            position: 'absolute',
                            bottom: '-25px',
                            left: '-25px',
                            width: '100px',
                            height: '100px',
                            background: 'linear-gradient(135deg, #bbf7d0 0%, #bbf7d0 100%)',
                            borderRadius: '50%',
                            opacity: '0.1'
                        }} />
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '12px'
                        }}>
                            <div style={{
                                background: 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)',
                                borderRadius: '10px',
                                padding: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 3px 10px rgba(34, 197, 94, 0.15)'
                            }}>
                                <FiBriefcase style={{ fontSize: '28px', color: 'white' }} />
                            </div>
                        </div>
                        <div style={{
                            fontSize: '14px',
                            color: '#16a34a',
                            marginBottom: '6px',
                            fontWeight: '600',
                            letterSpacing: '0.5px'
                        }}>
                            DEALS
                        </div>
                        <div style={{
                            fontSize: '28px',
                            fontWeight: '800',
                            color: '#22c55e',
                            marginBottom: '6px',
                            lineHeight: '1.2'
                        }}>
                            {deals.length || 0}
                        </div>
                        <div style={{
                            fontSize: '13px',
                            fontWeight: 'bold',
                            color: 'rgba(34, 197, 94, 0.75)'
                        }}>
                            ₹{totalDealValue.toLocaleString()} Total Value
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} md={6}>
                    <Card
                        className="Metric-card revenue-card"
                        style={{
                            background: 'linear-gradient(135deg, #f5f3ff 0%, #fff 100%)',
                            borderRadius: '12px',
                            border: 'none',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
                        }}
                        bodyStyle={{
                            padding: '20px',
                            position: 'relative',
                            zIndex: 1
                        }}
                    >
                        <div style={{
                            position: 'absolute',
                            top: '-15px',
                            right: '-15px',
                            width: '80px',
                            height: '80px',
                            background: 'linear-gradient(135deg, #ddd6fe 0%, #ddd6fe 100%)',
                            borderRadius: '50%',
                            opacity: '0.15'
                        }} />
                        <div style={{
                            position: 'absolute',
                            bottom: '-25px',
                            left: '-25px',
                            width: '100px',
                            height: '100px',
                            background: 'linear-gradient(135deg, #ddd6fe 0%, #ddd6fe 100%)',
                            borderRadius: '50%',
                            opacity: '0.1'
                        }} />
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '12px'
                        }}>
                            <div style={{
                                background: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
                                borderRadius: '10px',
                                padding: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 3px 10px rgba(139, 92, 246, 0.15)'
                            }}>
                                <FiDollarSign style={{ fontSize: '28px', color: 'white' }} />
                            </div>
                        </div>
                        <div style={{
                            fontSize: '14px',
                            color: '#7c3aed',
                            marginBottom: '6px',
                            fontWeight: '600',
                            letterSpacing: '0.5px'
                        }}>
                            TOTAL REVENUE
                        </div>
                        <div style={{
                            fontSize: '28px',
                            fontWeight: '800',
                            color: '#8b5cf6',
                            marginBottom: '6px',
                            lineHeight: '1.2'
                        }}>
                            ₹{totalRevenue.toLocaleString()}
                        </div>
                        <div style={{
                            fontSize: '13px',
                            fontWeight: 'bold',
                            color: 'rgba(139, 92, 246, 0.75)'
                        }}>
                            {allLeads.length + deals.length} Total Activities
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} md={6}>
                    <Card
                        className="Metric-card created-card"
                        style={{
                            background: 'linear-gradient(135deg, #fff7ed 0%, #fff 100%)',
                            borderRadius: '12px',
                            border: 'none',
                            position: 'relative',
                            overflow: 'hidden',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)'
                        }}
                        bodyStyle={{
                            padding: '20px',
                            position: 'relative',
                            zIndex: 1
                        }}
                    >
                        <div style={{
                            position: 'absolute',
                            top: '-15px',
                            right: '-15px',
                            width: '80px',
                            height: '80px',
                            background: 'linear-gradient(135deg, #fed7aa 0%, #fed7aa 100%)',
                            borderRadius: '50%',
                            opacity: '0.15'
                        }} />
                        <div style={{
                            position: 'absolute',
                            bottom: '-25px',
                            left: '-25px',
                            width: '100px',
                            height: '100px',
                            background: 'linear-gradient(135deg, #fed7aa 0%, #fed7aa 100%)',
                            borderRadius: '50%',
                            opacity: '0.1'
                        }} />
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '12px'
                        }}>
                            <div style={{
                                background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
                                borderRadius: '10px',
                                padding: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 3px 10px rgba(249, 115, 22, 0.15)'
                            }}>
                                <FiCalendar style={{ fontSize: '28px', color: 'white' }} />
                            </div>
                        </div>
                        <div style={{
                            fontSize: '14px',
                            color: '#ea580c',
                            marginBottom: '6px',
                            fontWeight: '600',
                            letterSpacing: '0.5px'
                        }}>
                            CREATED
                        </div>
                        <div style={{
                            fontSize: '28px',
                            fontWeight: '800',
                            color: '#f97316',
                            marginBottom: '6px',
                            lineHeight: '1.2'
                        }}>
                            {company?.createdAt ? dayjs(company.createdAt).format('MMM DD, YYYY') : '-'}
                        </div>
                        <div style={{
                            fontSize: '13px',
                            fontWeight: 'bold',
                            color: 'rgba(249, 115, 22, 0.75)'
                        }}>
                            {company?.updatedAt ? `Updated ${dayjs(company.updatedAt).format('MMM DD, YYYY')}` : '-'}
                        </div>
                    </Card>
                </Col>
            </Row>

            <div className="lead-details-section">
                <Row gutter={[24, 24]}>
                    <Col xs={24} sm={12} md={6}>
                        <div className="detail-card source-card">
                            <div className="detail-content">
                                <div className="detail-icon">
                                    <FiActivity />
                                </div>
                                <div className="detail-info">
                                    <div className="detail-label">SOURCE</div>
                                    <div className="detail-value">
                                        {getSourceName(company?.company_source) || '-'}
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
                                    <div className="detail-label">Company Category</div>
                                    <div className="detail-value">{getCategoryName(company?.company_category) || '-'}</div>
                                </div>
                                <div className="detail-indicator" />
                            </div>
                        </div>
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                        <div className="detail-card ownership-card">
                            <div className="detail-content">
                                <div className="detail-icon">
                                    <FiUsers />
                                </div>
                                <div className="detail-info">
                                    <div className="detail-label">OWNERSHIP</div>
                                    <div className="detail-value">
                                        {ownerName}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Col>

                    <Col xs={24} sm={12} md={6}>
                        <div className="detail-card status-card">
                            <div className="detail-content">
                                <div className="detail-icon">
                                    <FiGlobe />
                                </div>
                                <div className="detail-info">
                                    <div className="detail-label">Website</div>
                                    <div className="detail-value">
                                        <a href={company?.website} target="_blank" rel="noopener noreferrer">
                                            {company?.website || '-'}
                                        </a>
                                    </div>
                                </div>
                                <div className="detail-indicator" />
                            </div>
                        </div>
                    </Col>
                </Row>
            </div>
        </div >
    );
};

export default CompanyDetails;
