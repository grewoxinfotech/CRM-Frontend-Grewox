import React, { useState } from 'react';
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
    FiBox,
    FiGlobe,
    FiMapPin as FiLocation,
    FiBriefcase,
} from 'react-icons/fi';
import dayjs from 'dayjs';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGetContactsQuery, useUpdateContactMutation } from '../services/contactApi';
import { useGetLeadsQuery } from '../../../crm/lead/services/LeadApi';
import { useGetDealsQuery } from '../../../crm/deal/services/dealApi';
import { useGetCompanyAccountsQuery } from '../../companyacoount/services/companyAccountApi';
import { useGetUsersQuery } from '../../../user-management/users/services/userApi';
import './contactoverview.scss';
// import ContactOverview from './ContactOverview';

const { Title, Text } = Typography;

const ContactDetails = () => {
    const { contactId } = useParams();
    const navigate = useNavigate();
    const { data: contactsResponse, isLoading } = useGetContactsQuery();
    const { data: lead } = useGetLeadsQuery();
    const { data: deal } = useGetDealsQuery();
    const { data: companyAccounts } = useGetCompanyAccountsQuery();
    const { data: usersData } = useGetUsersQuery();
    const [updateContact] = useUpdateContactMutation();

    const leadsData = lead?.data || [];
    const dealsData = deal || [];
    const contacts = Array.isArray(contactsResponse?.data)
        ? contactsResponse.data
        : Array.isArray(contactsResponse)
            ? contactsResponse
            : [];

    const contact = contacts.find(contact => contact.id === contactId);

    if (!contact) return <div>Contact not found</div>;

    const leads = leadsData?.filter(lead => lead.contact_id === contactId) || [];
    const deals = dealsData?.filter(deal => deal.contact_id === contactId) || [];

    const totalLeadValue = leads.reduce((sum, lead) => sum + (Number(lead.leadValue) || 0), 0);
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

    return (
        <div className="overview-content">
            {/* Contact Details Card */}
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
                <div className="profile-stats">
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
                            <FiLocation />
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

            {/* Metrics Row */}
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
                                {contact?.createdAt ? dayjs(contact.createdAt).format('MMM DD, YYYY') : '-'}
                            </div>
                            <div className="metric-subtitle">
                                {contact?.updatedAt ? `Updated ${dayjs(contact.updatedAt).format('MMM DD, YYYY')}` : '-'}
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Details Row */}
            <Row gutter={[24, 24]} className="details-row">
                <Col xs={24} sm={12} md={6}>
                    <div className="detail-card source-card">
                        <div className="detail-content">
                            <div className="detail-icon">
                                <FiActivity />
                            </div>
                            <div className="detail-info">
                                <div className="detail-label">SOURCE</div>
                                <div className="detail-value">
                                    {contact?.contact_source || '-'}
                                </div>
                            </div>
                        </div>
                    </div>
                </Col>

                <Col xs={24} sm={12} md={6}>
                    <div className="detail-card category-card">
                        <div className="detail-content">
                            <div className="detail-icon">
                                <FiBriefcase />
                            </div>
                            <div className="detail-info">
                                <div className="detail-label">COMPANY</div>
                                <div className="detail-value">
                                    {companyDetails?.company_name || 'No Company Associated'}
                                </div>
                            </div>
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
                                <div className="detail-label">CONTACT OWNER</div>
                                <div className="detail-value">
                                    {contactOwnerName}
                                </div>
                            </div>
                        </div>
                    </div>
                </Col>

                <Col xs={24} sm={12} md={6}>
                    <div className="detail-card fax-card">
                        <div className="detail-content">
                            <div className="detail-icon">
                                <FiGlobe />
                            </div>
                            <div className="detail-info">
                                <div className="detail-label">COUNTRY</div>
                                <div className="detail-value">
                                    {contact?.country || '-'}
                                </div>
                            </div>
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

export default ContactDetails;
