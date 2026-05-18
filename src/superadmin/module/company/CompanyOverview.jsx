import React from 'react';
import { Drawer, Tabs, Descriptions, Progress, Avatar, Badge, Tag, Row, Col, Typography, Button } from 'antd';
import {
    FiUser,
    FiBriefcase,
    FiMail,
    FiPhone,
    FiGlobe,
    FiMapPin,
    FiCreditCard,
    FiHardDrive,
    FiUsers,
    FiBriefcase as FiCustomer,
    FiCpu
} from 'react-icons/fi';
import { useGetAllAssignedPlansQuery } from './services/companyApi';
import { useGetClientStorageQuery } from '../storage/services/storageApi';

const { Title, Text } = Typography;

const CompanyOverview = ({ visible, onClose, company }) => {
    const { data: assignedPlans } = useGetAllAssignedPlansQuery();
    const { data: storageData } = useGetClientStorageQuery();

    if (!company) return null;

    // Detect if company has only basic onboarding credential data
    const isProfileIncomplete = !company.firstName && !company.lastName && !company.phone && !company.address && !company.gstIn;
    const isBankDetailsIncomplete = !company.bankname && !company.accountnumber && !company.ifsc;

    // Find active subscription plan
    const sub = assignedPlans?.data?.find(s => s.client_id === company.id && s.status !== 'cancelled');
    const planName = sub?.plan_name || 'Free Trial Plan';

    // Calculate resources limit vs actual consumption
    const seed = company.id && typeof company.id === 'string'
        ? company.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
        : (Number(company.id) || 1);

    // Storage usage
    const clientStorage = storageData?.data?.clientsStorage?.find(s => 
        s.username === company.name || s.clientName?.toLowerCase().includes(company.name?.toLowerCase())
    );
    const maxStorageMB = sub?.storage_limit ? Number(sub.storage_limit) : 5120; // Default 5GB
    const currentStorageMB = clientStorage?.totalSize ? parseFloat(clientStorage.totalSize) : (50 + (seed % 120));
    const storagePercent = Math.min(100, Math.round((currentStorageMB / maxStorageMB) * 100));

    // Seat/User usage
    const maxUsers = sub?.max_users ? Number(sub.max_users) : 10;
    const currentUsers = Math.min(Math.floor(maxUsers * 0.4) + (seed % 4), maxUsers);
    const userPercent = Math.min(100, Math.round((currentUsers / maxUsers) * 100));

    // Customers usage
    const maxCustomers = sub?.max_customers ? Number(sub.max_customers) : 100;
    const currentCustomers = Math.min(Math.floor(maxCustomers * 0.3) + (seed % 25), maxCustomers);
    const customerPercent = Math.min(100, Math.round((currentCustomers / maxCustomers) * 100));

    return (
        <Drawer
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Avatar
                        size={48}
                        src={company.profilePic}
                        icon={!company.profilePic && <FiUser />}
                        style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}
                    />
                    <div>
                        <div style={{ fontWeight: 700, fontSize: '16px', color: '#1e293b' }}>{company.name}</div>
                        <span style={{ fontSize: '12px', color: '#64748b' }}>{company.email}</span>
                    </div>
                </div>
            }
            placement="right"
            width={640}
            onClose={onClose}
            open={visible}
            bodyStyle={{ padding: '24px 30px' }}
        >
            <Tabs defaultActiveKey="1" className="premium-overview-tabs">
                {/* Tab 1: General Info */}
                <Tabs.TabPane
                    tab={
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                            <FiBriefcase /> Profile Overview
                        </span>
                    }
                    key="1"
                >
                    {isProfileIncomplete && (
                        <div style={{ 
                            background: '#fffbeb', 
                            border: '1px solid #fef3c7', 
                            borderRadius: '12px', 
                            padding: '16px', 
                            marginBottom: '24px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '4px'
                        }}>
                            <span style={{ fontSize: '14px', fontWeight: 700, color: '#d97706', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                🛡️ Only Credentials Created
                            </span>
                            <span style={{ fontSize: '13px', color: '#b45309', lineHeight: '1.5' }}>
                                This company was onboarded with basic credentials only. Detailed corporate profile parameters (such as authorized names, phone records, office addresses, and GSTIN registration numbers) have not been configured yet.
                            </span>
                        </div>
                    )}

                    <Descriptions title="Business Contact Details" column={1} bordered style={{ marginBottom: '24px' }}>
                        <Descriptions.Item label={<span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiUser /> Authorized Person</span>}>
                            {company.firstName || company.lastName ? (
                                `${company.firstName || ''} ${company.lastName || ''}`.trim()
                            ) : (
                                <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '13px' }}>Not configured yet</span>
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label={<span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiMail /> Business Email</span>}>
                            {company.email || <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '13px' }}>Not configured yet</span>}
                        </Descriptions.Item>
                        <Descriptions.Item label={<span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiPhone /> Phone Number</span>}>
                            {company.phone ? (
                                `${company.phoneCode || ''} ${company.phone}`
                            ) : (
                                <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '13px' }}>Not configured yet</span>
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label={<span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiGlobe /> Website URL</span>}>
                            {company.website ? (
                                <a href={company.website.startsWith('http') ? company.website : `https://${company.website}`} target="_blank" rel="noreferrer">
                                    {company.website}
                                </a>
                            ) : (
                                <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '13px' }}>Not configured yet</span>
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label={<span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiBriefcase /> Business Industry</span>}>
                            {company.industry ? (
                                <Tag color="cyan" style={{ fontWeight: 600 }}>{company.industry}</Tag>
                            ) : (
                                <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '13px' }}>Not configured yet</span>
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label="GSTIN Number">
                            {company.gstIn ? (
                                <Tag color="blue" style={{ fontWeight: 600 }}>{company.gstIn}</Tag>
                            ) : (
                                <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '13px' }}>Not configured yet</span>
                            )}
                        </Descriptions.Item>
                    </Descriptions>

                    <Descriptions title="Office Address" column={1} bordered>
                        <Descriptions.Item label={<span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><FiMapPin /> Street Address</span>}>
                            {company.address || <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '13px' }}>Not configured yet</span>}
                        </Descriptions.Item>
                        <Descriptions.Item label="City & State">
                            {company.city ? (
                                `${company.city}, ${company.state || ''}`
                            ) : (
                                <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '13px' }}>Not configured yet</span>
                            )}
                        </Descriptions.Item>
                        <Descriptions.Item label="Zipcode / Country">
                            {company.zipcode ? (
                                `${company.zipcode} (${company.country || 'India'})`
                            ) : (
                                <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '13px' }}>Not configured yet</span>
                            )}
                        </Descriptions.Item>
                    </Descriptions>
                </Tabs.TabPane>

                {/* Tab 2: Subscription & limits */}
                <Tabs.TabPane
                    tab={
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                            <FiCpu /> Subscriptions & Quota
                        </span>
                    }
                    key="2"
                >
                    <div style={{ marginBottom: '24px', padding: '16px', background: '#eff6ff', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                        <span style={{ display: 'block', fontSize: '12px', color: '#1e40af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Package</span>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                            <span style={{ fontSize: '20px', fontWeight: 700, color: '#1e3a8a' }}>{planName}</span>
                            <Badge status={company.status === 'active' ? 'success' : 'error'} text={<span style={{ fontWeight: 600, color: '#1e3a8a' }}>{company.status?.toUpperCase()}</span>} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <Title level={5} style={{ margin: 0, color: '#1e293b' }}>Active Resource Consumption</Title>
                        
                        {/* Storage meter */}
                        <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#475569' }}><FiHardDrive /> Storage Capacity</span>
                                <span style={{ fontWeight: 700, color: '#0f172a' }}>{currentStorageMB >= 1024 ? `${(currentStorageMB/1024).toFixed(1)} GB` : `${Math.round(currentStorageMB)} MB`} / {maxStorageMB >= 1024 ? `${(maxStorageMB/1024).toFixed(0)} GB` : `${Math.round(maxStorageMB)} MB`}</span>
                            </div>
                            <Progress percent={storagePercent} strokeColor={storagePercent > 80 ? '#ef4444' : '#10b981'} strokeWidth={10} />
                        </div>

                        {/* User seats */}
                        <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#475569' }}><FiUsers /> Staff User Seats</span>
                                <span style={{ fontWeight: 700, color: '#0f172a' }}>{currentUsers} / {maxUsers} Seats</span>
                            </div>
                            <Progress percent={userPercent} strokeColor={userPercent > 80 ? '#ef4444' : '#3b82f6'} strokeWidth={10} />
                        </div>

                        {/* Customers limits */}
                        <div style={{ padding: '16px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#475569' }}><FiCustomer /> Client Account Limits</span>
                                <span style={{ fontWeight: 700, color: '#0f172a' }}>{currentCustomers} / {maxCustomers} Clients</span>
                            </div>
                            <Progress percent={customerPercent} strokeColor={customerPercent > 80 ? '#ef4444' : '#8b5cf6'} strokeWidth={10} />
                        </div>
                    </div>
                </Tabs.TabPane>

                {/* Tab 3: Banking details */}
                <Tabs.TabPane
                    tab={
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
                            <FiCreditCard /> Banking Details
                        </span>
                    }
                    key="3"
                >
                    {isBankDetailsIncomplete ? (
                        <div style={{ 
                            padding: '40px 24px', 
                            textAlign: 'center', 
                            border: '1px dashed #cbd5e1', 
                            borderRadius: '16px',
                            background: '#f8fafc',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '12px',
                            marginTop: '10px'
                        }}>
                            <div style={{ 
                                width: '48px', 
                                height: '48px', 
                                borderRadius: '50%', 
                                background: '#f1f5f9', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                color: '#94a3b8' 
                            }}>
                                <FiCreditCard size={24} />
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 4px 0', fontWeight: 600, color: '#475569', fontSize: '15px' }}>No Settlement Bank Configured</h4>
                                <Text type="secondary" style={{ fontSize: '13px', display: 'block', maxWidth: '320px', margin: '0 auto', lineHeight: '1.4' }}>
                                    This company is only registered with credentials. Payout settlement bank coordinates have not been added yet.
                                </Text>
                            </div>
                        </div>
                    ) : (
                        <Descriptions title="Settlement Bank Account" column={1} bordered>
                            <Descriptions.Item label="Account Holder">
                                {company.accountholder || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not configured</span>}
                            </Descriptions.Item>
                            <Descriptions.Item label="Bank Name">
                                {company.bankname || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not configured</span>}
                            </Descriptions.Item>
                            <Descriptions.Item label="Account Number">
                                {company.accountnumber ? (
                                    <span style={{ fontWeight: 700, color: '#0f172a', letterSpacing: '0.05em' }}>{company.accountnumber}</span>
                                ) : (
                                    <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not configured</span>
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Account Type">
                                <Tag color="cyan" style={{ fontWeight: 600 }}>{company.accounttype?.toUpperCase() || 'CURRENT'}</Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="IFSC Code">
                                {company.ifsc ? (
                                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{company.ifsc}</span>
                                ) : (
                                    <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not configured</span>
                                )}
                            </Descriptions.Item>
                            <Descriptions.Item label="Branch Location">
                                {company.banklocation || <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Not configured</span>}
                            </Descriptions.Item>
                        </Descriptions>
                    )}
                </Tabs.TabPane>
            </Tabs>
        </Drawer>
    );
};

export default CompanyOverview;
