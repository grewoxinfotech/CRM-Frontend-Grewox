import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Tag, Space, Button, Tooltip } from 'antd';
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
    FiEdit2,
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import dayjs from 'dayjs';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useGetContactsQuery, useUpdateContactMutation, useGetContactByIdQuery } from '../services/contactApi';
import { useGetLeadsQuery } from '../../../crm/lead/services/LeadApi';
import { useGetDealsQuery } from '../../../crm/deal/services/DealApi';
import { useGetCompanyAccountsQuery } from '../../companyacoount/services/companyAccountApi';
import { useGetUsersQuery } from '../../../user-management/users/services/userApi';
import { useGetAllCurrenciesQuery } from '../../../../module/settings/services/settingsApi';
import './contactoverview.scss';
import {
    useGetSourcesQuery
} from "../../crmsystem/souce/services/SourceApi.js";
import { useSelector } from 'react-redux';
import { selectCurrentUser } from "../../../../../auth/services/authSlice.js";
import { useGetRolesQuery } from "../../../hrm/role/services/roleApi";
import EditContact from '../EditContact';

const { Title, Text } = Typography;

const ContactDetails = () => {
    const { contactId } = useParams();
    const navigate = useNavigate();
    const loggedInUser = useSelector(selectCurrentUser);
    const { data: contact, isLoading: isContactLoading } = useGetContactByIdQuery(contactId);
    const { data: lead } = useGetLeadsQuery();
    const { data: deal } = useGetDealsQuery();
    const { data: companyAccounts } = useGetCompanyAccountsQuery();
    const { data: usersData } = useGetUsersQuery();
    const { data: sourcesData } = useGetSourcesQuery(loggedInUser?.client_id || loggedInUser?.id);
    const { data: currencies } = useGetAllCurrenciesQuery();
    const [updateContact] = useUpdateContactMutation();
    const [editModalVisible, setEditModalVisible] = useState(false);

    const { data: rolesData } = useGetRolesQuery(undefined, {
        skip: !loggedInUser || loggedInUser.roleName === 'super-admin' || loggedInUser.roleName === 'client'
    });
    const userRoleData = rolesData?.message?.data?.find(role => role.id === loggedInUser?.role_id);
    const userPermissions = React.useMemo(() => {
        if (!userRoleData?.permissions) return null;
        try {
            return typeof userRoleData.permissions === 'object' ? userRoleData.permissions : JSON.parse(userRoleData.permissions);
        } catch (e) { return null; }
    }, [userRoleData]);
    const hasPermission = React.useCallback((action) => {
        if (!loggedInUser) return false;
        if (loggedInUser.roleName === 'super-admin' || loggedInUser.roleName === 'client') return true;
        if (!userPermissions) return false;
        const perms = userPermissions['dashboards-crm-contact'];
        if (!perms || perms.length === 0) return false;
        return (perms[0]?.permissions || []).includes(action);
    }, [loggedInUser, userPermissions]);

    const leadsData = lead?.data || [];
    const sources = sourcesData?.data || [];
    const dealsData = deal?.data || [];

    if (isContactLoading) return <div>Loading...</div>;
    if (!contact) return <div>Contact not found</div>;

    // Get all leads and separate converted/non-converted
    const allLeads = leadsData?.filter(lead => lead.contact_id === contactId) || [];
    const convertedLeads = allLeads.filter(lead => lead.is_converted);
    const activeLeads = allLeads.filter(lead => !lead.is_converted);
    const deals = dealsData?.filter(deal => deal.contact_id === contactId) || [];

    const latestLead = activeLeads[0] || allLeads[0] || null;

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
        return source?.name || sourceId || "N/A";
    };

    const formatCurrencyValue = (value, currencyId) => {
        const currencyDetails = currencies?.find(
            (c) => c.id === currencyId || c.currencyCode === currencyId
        );
        if (!currencyDetails) return `${value}`;

        return new Intl.NumberFormat("en-US", {
            style: "decimal",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        })
        .format(value)
        .replace(/^/, currencyDetails.currencyIcon + " ");
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
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <h2 className="company-name">
                                    {contact?.first_name} {contact?.last_name}
                                </h2>
                                {(!hasPermission || hasPermission('update')) && (
                                <Button
                                    type="primary"
                                    icon={<FiEdit2 />}
                                    onClick={() => setEditModalVisible(true)}
                                    style={{
                                        background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        height: '40px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '0 16px',
                                        boxShadow: '0 2px 8px rgba(24, 144, 255, 0.15)',
                                        fontWeight: '500',
                                    }}
                                >
                                    Edit
                                </Button>
                                )}
                            </div>
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <a href={`tel:${contact?.phone}`} className="stat-value">
                                    {contact?.phone || '-'}
                                </a>
                                {contact?.phone && (
                                    <Tooltip title="Start WhatsApp Chat">
                                        <Button 
                                            type="text" 
                                            icon={<FaWhatsapp style={{ color: '#25D366', fontSize: '16px' }} />} 
                                            onClick={() => {
                                                const phone = contact.phone.replace(/\D/g, '');
                                                window.location.href = `/dashboard/whatsapp-chat?phone=${phone}`;
                                            }}
                                            style={{ padding: 0, height: 'auto', display: 'flex', alignItems: 'center', minWidth: 'auto' }}
                                        />
                                    </Tooltip>
                                )}
                            </div>
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
                {/* LEAD VALUE CARD */}
                <Col xs={24} sm={12} md={12} lg={12} xl={6}>
                    <Card
                        className="Metric-card lead-value-card"
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
                                <FiDollarSign style={{ fontSize: '28px', color: 'white' }} />
                            </div>
                        </div>
                        <div style={{
                            fontSize: '14px',
                            color: '#16a34a',
                            marginBottom: '6px',
                            fontWeight: '600',
                            letterSpacing: '0.5px'
                        }}>
                            Lead Value
                        </div>
                        <div style={{
                            fontSize: '28px',
                            fontWeight: '800',
                            color: '#22c55e',
                            marginBottom: '6px',
                            lineHeight: '1.2'
                        }}>
                            {allLeads.length > 0
                                ? formatCurrencyValue(totalLeadValue, latestLead?.currency || 'INR')
                                : "-"}
                        </div>
                        {allLeads.length > 0 && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                fontSize: '11px',
                                color: '#16a34a',
                                marginTop: '8px',
                                padding: '3px 8px',
                                background: 'rgba(34, 197, 94, 0.08)',
                                borderRadius: '4px',
                                width: 'fit-content',
                                fontWeight: '600'
                            }}>
                                <span>{activeLeads.length} Active</span>
                                <span>•</span>
                                <span>{allLeads.length} Total Leads</span>
                            </div>
                        )}
                    </Card>
                </Col>

                {/* INTEREST LEVEL CARD */}
                <Col xs={24} sm={12} md={12} lg={12} xl={6}>
                    <Card
                        className="Metric-card interest-level-card"
                        style={{
                            background: 'linear-gradient(135deg, #fffbeb 0%, #fff 100%)',
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
                            background: 'linear-gradient(135deg, #fef08a 0%, #fef08a 100%)',
                            borderRadius: '50%',
                            opacity: '0.15'
                        }} />
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '12px'
                        }}>
                            <div style={{
                                background: 'linear-gradient(135deg, #eab308 0%, #fde047 100%)',
                                borderRadius: '10px',
                                padding: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 3px 10px rgba(234, 179, 8, 0.15)'
                            }}>
                                <FiTarget style={{ fontSize: '28px', color: 'white' }} />
                            </div>
                        </div>
                        <div style={{
                            fontSize: '14px',
                            color: '#ca8a04',
                            marginBottom: '6px',
                            fontWeight: '600',
                            letterSpacing: '0.5px'
                        }}>
                            Interest Level
                        </div>
                        <div style={{
                            fontSize: '24px',
                            fontWeight: '800',
                            color: '#eab308',
                            marginBottom: '6px',
                            lineHeight: '1.2'
                        }}>
                            {latestLead?.interest_level === "high" ? (
                                <span style={{ color: '#22c55e' }}>High Interest</span>
                            ) : latestLead?.interest_level === "low" ? (
                                <span style={{ color: '#ef4444' }}>Low Interest</span>
                            ) : latestLead?.interest_level === "medium" ? (
                                <span style={{ color: '#f59e0b' }}>Medium Interest</span>
                            ) : "-"}
                        </div>
                    </Card>
                </Col>

                {/* CREATED DATE CARD */}
                <Col xs={24} sm={12} md={12} lg={12} xl={6}>
                    <Card
                        className="Metric-card created-card"
                        style={{
                            background: 'linear-gradient(135deg, #eff6ff 0%, #fff 100%)',
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
                            background: 'linear-gradient(135deg, #bfdbfe 0%, #bfdbfe 100%)',
                            borderRadius: '50%',
                            opacity: '0.15'
                        }} />
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '12px'
                        }}>
                            <div style={{
                                background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                                borderRadius: '10px',
                                padding: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 3px 10px rgba(59, 130, 246, 0.15)'
                            }}>
                                <FiCalendar style={{ fontSize: '28px', color: 'white' }} />
                            </div>
                        </div>
                        <div style={{
                            fontSize: '14px',
                            color: '#2563eb',
                            marginBottom: '6px',
                            fontWeight: '600',
                            letterSpacing: '0.5px'
                        }}>
                            Created
                        </div>
                        <div style={{
                            fontSize: '28px',
                            fontWeight: '800',
                            color: '#3b82f6',
                            marginBottom: '6px',
                            lineHeight: '1.2'
                        }}>
                            {latestLead?.createdAt 
                                ? dayjs(latestLead.createdAt).format('MM/DD/YYYY') 
                                : (contact?.createdAt ? dayjs(contact.createdAt).format('MM/DD/YYYY') : "-")}
                        </div>
                    </Card>
                </Col>

                {/* LEAD MEMBERS CARD */}
                <Col xs={24} sm={12} md={12} lg={12} xl={6}>
                    <Card
                        className="Metric-card members-card"
                        style={{
                            background: 'linear-gradient(135deg, #faf5ff 0%, #fff 100%)',
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
                            background: 'linear-gradient(135deg, #e9d5ff 0%, #e9d5ff 100%)',
                            borderRadius: '50%',
                            opacity: '0.15'
                        }} />
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '12px'
                        }}>
                            <div style={{
                                background: 'linear-gradient(135deg, #a855f7 0%, #c084fc 100%)',
                                borderRadius: '10px',
                                padding: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 3px 10px rgba(168, 85, 247, 0.15)'
                            }}>
                                <FiUsers style={{ fontSize: '28px', color: 'white' }} />
                            </div>
                        </div>
                        <div style={{
                            fontSize: '14px',
                            color: '#7e22ce',
                            marginBottom: '6px',
                            fontWeight: '600',
                            letterSpacing: '0.5px'
                        }}>
                            Lead Members
                        </div>
                        <div style={{
                            fontSize: '28px',
                            fontWeight: '800',
                            color: '#a855f7',
                            marginBottom: '6px',
                            lineHeight: '1.2'
                        }}>
                            {(() => {
                                try {
                                    if (!latestLead?.lead_members) return "0";
                                    const parsed = typeof latestLead.lead_members === 'string'
                                        ? JSON.parse(latestLead.lead_members)
                                        : latestLead.lead_members;
                                    return parsed?.lead_members?.length || "0";
                                } catch {
                                    return "0";
                                }
                            })()}
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

            {/* Edit Modal */}
            {editModalVisible && (
                <EditContact
                    open={editModalVisible}
                    onCancel={() => setEditModalVisible(false)}
                    contactData={contact}
                />
            )}
        </div>
    );
};

export default ContactDetails;
