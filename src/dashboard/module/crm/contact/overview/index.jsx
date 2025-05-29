import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Tag, Space } from 'antd';
import {
    FiUser,
    FiMail,
    FiPhone,
    FiMapPin,

    FiTarget,
    FiCalendar,
    FiUsers,
    FiActivity,
    FiFolder,
    FiGlobe,
    FiBriefcase,
    FiDollarSign,
} from 'react-icons/fi';
import dayjs from 'dayjs';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGetContactsQuery, useUpdateContactMutation } from '../services/contactApi';
import { useGetLeadsQuery } from '../../../crm/lead/services/LeadApi';
import { useGetDealsQuery } from '../../../crm/deal/services/DealApi';
import { useGetCompanyAccountsQuery } from '../../companyacoount/services/companyAccountApi';
import { useGetUsersQuery } from '../../../user-management/users/services/userApi';
import './contactoverview.scss';
import {
    useGetSourcesQuery
} from "../../crmsystem/souce/services/SourceApi.js";
import { useSelector } from 'react-redux';
import { selectCurrentUser } from "../../../../../auth/services/authSlice.js";

const { Title, Text } = Typography;

const ContactDetails = () => {
    const { contactId } = useParams();
    const navigate = useNavigate();
    const loggedInUser = useSelector(selectCurrentUser);
    const { data: contactsResponse, isLoading } = useGetContactsQuery();
    const { data: lead } = useGetLeadsQuery();
    const { data: deal } = useGetDealsQuery();
    const { data: companyAccounts } = useGetCompanyAccountsQuery();
    const { data: usersData } = useGetUsersQuery();
    const { data: sourcesData } = useGetSourcesQuery(loggedInUser?.id);
    const [updateContact] = useUpdateContactMutation();

    const leadsData = lead?.data || [];
    const sources = sourcesData?.data || [];
    const dealsData = deal || [];
    const contacts = Array.isArray(contactsResponse?.data)
        ? contactsResponse.data
        : Array.isArray(contactsResponse)
            ? contactsResponse
            : [];

    const contact = contacts.find(contact => contact.id === contactId);

    if (!contact) return <div>Contact not found</div>;

    // Get all leads and separate converted/non-converted
    const allLeads = leadsData?.filter(lead => lead.contact_id === contactId) || [];
    const convertedLeads = allLeads.filter(lead => lead.is_converted);
    const activeLeads = allLeads.filter(lead => !lead.is_converted);
    const deals = dealsData?.filter(deal => deal.contact_id === contactId) || [];

    const totalLeadValue = activeLeads.reduce((sum, lead) => sum + (Number(lead.leadValue) || 0), 0);
    const totalDealValue = deals.reduce((sum, deal) => sum + (Number(deal.value) || 0), 0);
    const totalRevenue = totalLeadValue + totalDealValue;

    // Find company details if company_name exists
    const companyDetails = contact?.company_name
        ? companyAccounts?.data?.find(company => company.id === contact.company_name)
        : null;

    // Find contact owner's name
    const contactOwnerName = contact?.contact_owner && usersData?.data
        ? usersData.data.find(user => user.id === contact.contact_owner)?.username || contact.contact_owner
        : 'Not Assigned';

    const getSourceName = (sourceId) => {
        const source = sources.find((s) => s.id === sourceId);
        return source?.name || "N/A";
    };

    return (
        <div className="overview-content">
            <Card className="info-card contact-card">
                <div className="profile-header">
                    <div className="profile-main">
                        <div className="company-avatar">
                            {contact?.first_name ? contact.first_name[0].toUpperCase() : ''}
                            {contact?.last_name ? contact.last_name[0].toUpperCase() : ''}
                        </div>
                        <div className="profile-info">
                            <h2 className="company-name">
                                {contact?.first_name} {contact?.last_name}
                            </h2>
                            <div className="contact-name">
                                <FiUser className="icon" />
                                {contact?.email || 'No Email'}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="profile-stats" style={{ padding: '24px' }}>
                    <div className="stat-item">
                        <div className="stat-icon">
                            <FiMail />
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Email Address</div>
                            <a href={`mailto:${contact?.email}`} className="stat-value">
                                {contact?.email || '-'}
                            </a>
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon">
                            <FiPhone />
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Phone Number</div>
                            <a href={`tel:${contact?.phone}`} className="stat-value">
                                {contact?.phone || '-'}
                            </a>
                        </div>
                    </div>
                    <div className="stat-item">
                        <div className="stat-icon">
                            <FiMapPin />
                        </div>
                        <div className="stat-content">
                            <div className="stat-label">Location</div>
                            <div className="stat-value">
                                {[contact?.address, contact?.city, contact?.state, contact?.country]
                                    .filter(Boolean)
                                    .join(', ') || '-'}
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <Row gutter={[16, 16]} className="metrics-row">
                <Col xs={24} sm={12} md={12} lg={12} xl={6}>
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
                            color: 'rgba(244, 63, 94, 0.75)',
                            marginBottom: '4px'
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

                <Col xs={24} sm={12} md={12} lg={12} xl={6}>
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
                            color: 'rgba(34, 197, 94, 0.75)',
                            marginBottom: '4px'
                        }}>
                            ₹{totalDealValue.toLocaleString()} Total Value
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} md={12} lg={12} xl={6}>
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
                            color: 'rgba(139, 92, 246, 0.75)',
                            marginBottom: '4px'
                        }}>
                            {allLeads.length + deals.length} Total Activities
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} md={12} lg={12} xl={6}>
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
                            {contact?.createdAt ? dayjs(contact.createdAt).format('MMM DD, YYYY') : '-'}
                        </div>
                        <div style={{
                            fontSize: '13px',
                            fontWeight: 'bold',
                            color: 'rgba(249, 115, 22, 0.75)',
                            marginBottom: '4px'
                        }}>
                            {contact?.updatedAt ? `Updated ${dayjs(contact.updatedAt).format('MMM DD, YYYY')}` : '-'}
                        </div>
                    </Card>
                </Col>
            </Row>

            <div className="lead-details-section" style={{ padding:'24px' }}>
                <Row gutter={[24, 24]}>
                    <Col xs={24} sm={12} md={12} lg={12} xl={6}>
                        <div className="detail-card source-card">
                            <div className="detail-content">
                                <div className="detail-icon">
                                    <FiActivity />
                                </div>
                                <div className="detail-info" >
                                    <div className="detail-label" style={{ fontSize: '14px' }}>SOURCE</div>
                                    <div className="detail-value" style={{ fontSize: '14px' }}>
                                        {getSourceName(contact?.contact_source) || '-'}
                                    </div>
                                </div>
                                <div className="detail-indicator" />
                            </div>
                        </div>
                    </Col>

                    <Col xs={24} sm={12} md={12} lg={12} xl={6}>
                        <div className="detail-card stage-card">
                            <div className="detail-content">
                                <div className="detail-icon">
                                    <FiFolder />
                                </div>
                                <div className="detail-info">
                                    <div className="detail-label" style={{ fontSize: '14px' }}>Company</div>
                                    <div className="detail-value" style={{ fontSize: '14px' }}>
                                        {companyDetails?.company_name || '-'}
                                    </div>
                                </div>
                                <div className="detail-indicator" />
                            </div>
                        </div>
                    </Col>

                    <Col xs={24} sm={12} md={12} lg={12} xl={6}>
                        <div className="detail-card ownership-card">
                            <div className="detail-content">
                                <div className="detail-icon">
                                    <FiUsers />
                                </div>
                                <div className="detail-info">
                                    <div className="detail-label" style={{ fontSize: '14px' }}>OWNERSHIP</div>
                                    <div className="detail-value" style={{ fontSize: '14px' }}>
                                        {contactOwnerName}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Col>

                    <Col xs={24} sm={12} md={12} lg={12} xl={6}>
                        <div className="detail-card status-card">
                            <div className="detail-content">
                                <div className="detail-icon">
                                    <FiGlobe />
                                </div>
                                <div className="detail-info">
                                    <div className="detail-label" style={{ fontSize: '14px' }}>Website</div>
                                    <div className="detail-value" style={{ fontSize: '14px' }}>
                                        <a href={contact?.website} target="_blank" rel="noopener noreferrer">
                                            {contact?.website || '-'}
                                        </a>
                                    </div>
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

export default ContactDetails;
