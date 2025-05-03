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
import { useGetSourcesQuery } from '../../crmsystem/souce/services/SourceApi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from "../../../../../auth/services/authSlice.js";

const { Title, Text } = Typography;

const CompanyDetails = () => {
    const { accountId } = useParams();
    const navigate = useNavigate();
    const { data: companyAccountsResponse, isLoading } = useGetCompanyAccountsQuery();
    const { data: usersData } = useGetUsersQuery();
    const { data: lead } = useGetLeadsQuery();
    const { data: deal } = useGetDealsQuery();
    const [updateCompanyAccount] = useUpdateCompanyAccountMutation();
    // const [ownerName, setOwnerName] = useState('');
    const loggedInUser = useSelector(selectCurrentUser);
    const { data: sourcesData } = useGetSourcesQuery(loggedInUser?.id);

    const companies = Array.isArray(companyAccountsResponse?.data)
        ? companyAccountsResponse.data
        : Array.isArray(companyAccountsResponse)
            ? companyAccountsResponse
            : [];

    const sources = sourcesData?.data || [];

    const company = companies.find(company => company.id === accountId);

    const leadsData = lead?.data || [];
    const dealsData = deal || [];

    const leads = leadsData?.filter(lead => lead.company_id === accountId) || [];
    const deals = dealsData?.filter(deal => deal.company_id === accountId) || [];

    const totalLeadValue = leads.reduce((sum, lead) => sum + (Number(lead.leadValue) || 0), 0);
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

    // useEffect(() => {
    //     if (company?.account_owner && usersData?.data) {
    //         const owner = usersData.data.find(user => user.id === company.account_owner);
    //         if (owner) {
    //             setOwnerName(owner.name || `${owner.firstName} ${owner.lastName}`.trim());
    //         }
    //     }
    // }, [company?.account_owner, usersData]);

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
                    <Card className="metric-card total-revenue-card">
                        <div className="metric-icon">
                            <FiDollarSign />
                        </div>
                        <div className="metric-content">
                            <div className="metric-label">TOTAL REVENUE</div>
                            <div className="metric-value">
                                ₹{totalRevenue.toLocaleString()}
                            </div>
                            <div className="metric-subtitle">
                                {leads.length + deals.length} Total Activities
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="metric-card leads-card">
                        <div className="metric-icon">
                            <FiTarget />
                        </div>
                        <div className="metric-content">
                            <div className="metric-label">LEADS</div>
                            <div className="metric-value">
                                {leads?.length || 0}
                            </div>
                            <div className="metric-subtitle">
                                ₹{totalLeadValue.toLocaleString()} Total Value
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="metric-card deals-card">
                        <div className="metric-icon">
                            <FiBriefcase />
                        </div>
                        <div className="metric-content">
                            <div className="metric-label">DEALS</div>
                            <div className="metric-value">
                                {deals.length || 0}
                            </div>
                            <div className="metric-subtitle">
                                ₹{totalDealValue.toLocaleString()} Total Value
                            </div>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} md={6}>
                    <Card className="metric-card created-card">
                        <div className="metric-icon">
                            <FiCalendar />
                        </div>
                        <div className="metric-content">
                            <div className="metric-label">CREATED</div>
                            <div className="metric-value">
                                {company?.createdAt ? dayjs(company.createdAt).format('MMM DD, YYYY') : '-'}
                            </div>
                            <div className="metric-subtitle">
                                {company?.updatedAt ? `Updated ${dayjs(company.updatedAt).format('MMM DD, YYYY')}` : '-'}
                            </div>
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
                                    <div className="detail-value">{company?.company_category || '-'}</div>
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
