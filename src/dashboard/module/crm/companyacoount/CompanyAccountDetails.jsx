import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, Tabs, Breadcrumb, Button, Typography, Space, Row, Col, Tag, message } from 'antd';
import {
    FiArrowLeft, FiHome, FiBriefcase, FiUsers, FiFile,
    FiFlag, FiCheckSquare, FiFileText, FiDollarSign,
    FiCreditCard, FiBookmark, FiActivity, FiMail, FiPhone,
    FiMapPin, FiGlobe, FiCalendar, FiUser, 
} from 'react-icons/fi';
import { useGetCompanyAccountsQuery, useUpdateCompanyAccountMutation } from './services/companyAccountApi';
import dayjs from 'dayjs';
import './companyaccount.scss';

const { Title, Text } = Typography;

const CompanyAccountDetails = () => {
    const { accountId } = useParams();
    const navigate = useNavigate();
    const { data: companyAccountsResponse, isLoading } = useGetCompanyAccountsQuery();
    const [updateCompanyAccount] = useUpdateCompanyAccountMutation();
    
    // Get companies array first
    const companies = Array.isArray(companyAccountsResponse?.data) 
        ? companyAccountsResponse.data 
        : Array.isArray(companyAccountsResponse) 
            ? companyAccountsResponse 
            : [];
    // Then find the company
    const company = companies.find(company => company.id === accountId);

    const handleStatusChange = async (status) => {
        try {
            await updateCompanyAccount({
                id: accountId,
                status: status
            }).unwrap();
            
            message.success(`Company status updated to ${status}`);
        } catch (error) {
            message.error('Failed to update company status');
        }
    };

    const items = [
        {
            key: 'overview',
            label: (
                <span className="nav-item">
                    <FiBriefcase className="nav-icon" /> Overview
                </span>
            ),
            children: (
                <div className="company-overview">
                    <Row gutter={[16, 16]} className="metrics-row">
                        <Col xs={24} sm={12} md={6}>
                            <Card className="metric-card">
                                <div className="metric-icon">
                                    <FiUser />
                                </div>
                                <div className="metric-content">
                                    <div className="metric-label">Account Owner</div>
                                    <div className="metric-value">
                                        {company?.account_owner || '-'}
                                    </div>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card className="metric-card">
                                <div className="metric-icon">
                                    <FiPhone />
                                </div>
                                <div className="metric-content">
                                    <div className="metric-label">Phone</div>
                                    <div className="metric-value">
                                        {company?.phone_number || '-'}
                                    </div>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card className="metric-card">
                                <div className="metric-icon">
                                    <FiMail />
                                </div>
                                <div className="metric-content">
                                    <div className="metric-label">Email</div>
                                    <div className="metric-value">
                                        {company?.email || '-'}
                                    </div>
                                </div>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card className="metric-card">
                                <div className="metric-icon">
                                    <FiMapPin />
                                </div>
                                <div className="metric-content">
                                    <div className="metric-label">Location</div>
                                    <div className="metric-value">
                                        {company?.billing_city || '-'}
                                    </div>
                                </div>
                            </Card>
                        </Col>
                    </Row>

                    <div className="company-details-section">
                        <Row gutter={[24, 24]}>
                            <Col xs={24} sm={12} md={6}>
                                <div className="detail-card">
                                    <div className="detail-content">
                                        <div className="detail-icon">
                                            {/* <FiBuilding /> */}
                                        </div>
                                        <div className="detail-info">
                                            <div className="detail-label">Company Type</div>
                                            <div className="detail-value">{company?.company_type || '-'}</div>
                                        </div>
                                    </div>
                                </div>
                            </Col>

                            <Col xs={24} sm={12} md={6}>
                                <div className="detail-card">
                                    <div className="detail-content">
                                        <div className="detail-icon">
                                            <FiUsers />
                                        </div>
                                        <div className="detail-info">
                                            <div className="detail-label">Employees</div>
                                            <div className="detail-value">{company?.number_of_employees || '-'}</div>
                                        </div>
                                    </div>
                                </div>
                            </Col>

                            <Col xs={24} sm={12} md={6}>
                                <div className="detail-card">
                                    <div className="detail-content">
                                        <div className="detail-icon">
                                            <FiDollarSign />
                                        </div>
                                        <div className="detail-info">
                                            <div className="detail-label">Revenue</div>
                                            <div className="detail-value">{company?.company_revenue || '-'}</div>
                                        </div>
                                    </div>
                                </div>
                            </Col>

                            <Col xs={24} sm={12} md={6}>
                                <div className="detail-card">
                                    <div className="detail-content">
                                        <div className="detail-icon">
                                            <FiGlobe />
                                        </div>
                                        <div className="detail-info">
                                            <div className="detail-label">Website</div>
                                            <div className="detail-value">{company?.website || '-'}</div>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </div>

                    <Card title="Company Information" className="info-card">
                        <Row gutter={[24, 24]}>
                            <Col xs={24} md={12}>
                                <div className="info-section">
                                    <h3>Billing Address</h3>
                                    <p>{company?.billing_address || '-'}</p>
                                    <p>{company?.billing_city || '-'}, {company?.billing_state || '-'} {company?.billing_pincode || ''}</p>
                                    <p>{company?.billing_country || '-'}</p>
                                </div>
                            </Col>
                            <Col xs={24} md={12}>
                                <div className="info-section">
                                    <h3>Shipping Address</h3>
                                    <p>{company?.shipping_address || '-'}</p>
                                    <p>{company?.shipping_city || '-'}, {company?.shipping_state || '-'} {company?.shipping_pincode || ''}</p>
                                    <p>{company?.shipping_country || '-'}</p>
                                </div>
                            </Col>
                        </Row>
                    </Card>
                </div>
            ),
        },
        {
            key: 'deal',
            label: (
                <span className="nav-item">
                    <FiUsers className="nav-icon" /> Deals
                </span>
            ),
            children: <div>Deal content will go here</div>,
        },
        {
            key: 'contact',
            label: (
                <span className="nav-item">
                    <FiFile className="nav-icon" /> Contacts
                </span>
            ),
            children: <div>Contact content will go here</div>,
        },
        {
            key: 'proposal',
            label: (
                <span className="nav-item">
                    <FiBookmark className="nav-icon" /> Proposals
                </span>
            ),
            children: <div>Proposals content will go here</div>,
        },
        {
            key: 'products',
            label: (
                <span className="nav-item">
                    <FiActivity className="nav-icon" /> Products
                </span>
            ),
            children: <div>Products content will go here</div>,
        },
        
        {
            key: 'attechments',
            label: (
                <span className="nav-item">
                    <FiActivity className="nav-icon" /> Attechments
                </span>
            ),
            children: <div>Attechments content will go here</div>,
        },
       
        {
            key: 'invoice',
            label: (
                <span className="nav-item">
                    <FiActivity className="nav-icon" /> Invoices
                </span>
            ),
            children: <div>Invoices content will go here</div>,
        },
        {
            key: 'notes',
            label: (
                <span className="nav-item">
                    <FiBookmark className="nav-icon" /> Notes
                </span>
            ),
            children: <div>Notes content will go here</div>,
        },
        {
            key: 'activity',
            label: (
                <span className="nav-item">
                    <FiActivity className="nav-icon" /> Activity
                </span>
            ),
            children: <div>Activity content will go here</div>,
        },
    ];

    return (
        <div className="company-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/dashboard">
                            <FiHome /> Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <Link to="/dashboard/crm/company-account">
                            <FiBriefcase /> Companies
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        {company?.company_name || 'Company Details'}
                    </Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="header-left">
                    <Title level={2}>{company?.company_name || 'Company Details'}</Title>
                    <Text type="secondary" className="subtitle">
                        Manage company details and activities
                    </Text>
                </div>
                <div className="header-right">
                    <Space>
                        <Button 
                            icon={<FiArrowLeft />}
                            onClick={() => navigate('/dashboard/crm/company-account')}
                        >
                            Back to Companies
                        </Button>
                        <Button 
                            type="primary"
                            onClick={() => navigate(`/dashboard/crm/company-account/edit/${accountId}`)}
                        >
                            Edit Company
                        </Button>
                    </Space>
                </div>
            </div>

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
    );
};

export default CompanyAccountDetails;
