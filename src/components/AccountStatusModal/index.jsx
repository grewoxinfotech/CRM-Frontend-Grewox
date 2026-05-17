import React from 'react';
import { Modal, Button, Typography } from 'antd';
import { FiLock, FiAlertTriangle, FiUserX, FiLogOut, FiMail } from 'react-icons/fi';

const { Text, Title } = Typography;

const AccountStatusModal = ({ visible, status, userRole, onLogout }) => {

    // Determine status styling
    const getStatusConfig = () => {
        switch (status?.toLowerCase()) {
            case 'suspended':
                return {
                    color: '#d97706',
                    bgColor: '#fef3c7',
                    icon: <FiAlertTriangle size={32} />,
                    label: 'Suspended'
                };
            case 'blocked':
                return {
                    color: '#dc2626',
                    bgColor: '#fee2e2',
                    icon: <FiLock size={32} />,
                    label: 'Temporarily Blocked'
                };
            case 'inactive':
            default:
                return {
                    color: '#4b5563',
                    bgColor: '#f3f4f6',
                    icon: <FiUserX size={32} />,
                    label: 'Deactivated'
                };
        }
    };

    const config = getStatusConfig();
    const isEmployee = userRole?.toLowerCase() !== 'client' && userRole?.toLowerCase() !== 'super-admin';

    // Handle Contact Action
    const handleContact = () => {
        if (isEmployee) {
            // Employee contacting company admin
            window.location.href = 'mailto:admin@company.com?subject=CRM%20Account%20Restricted';
        } else {
            // Client contacting platform support
            window.location.href = 'mailto:support@grewox.com?subject=Company%20Account%20Status%20Inquiry';
        }
    };

    return (
        <Modal
            title={null}
            open={visible}
            footer={null}
            closable={false}
            keyboard={false}
            maskClosable={false}
            width={480}
            centered
            destroyOnClose
            styles={{
                body: {
                    padding: 0,
                    borderRadius: '16px',
                    overflow: 'hidden'
                }
            }}
        >
            <div style={{
                padding: '40px 32px',
                textAlign: 'center',
                background: '#ffffff',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)'
            }}>
                {/* Icon Container */}
                <div style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '24px',
                    background: config.bgColor,
                    color: config.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 24px',
                    boxShadow: `0 8px 16px -4px ${config.bgColor}`,
                    transform: 'rotate(-5deg)',
                    transition: 'all 0.3s ease'
                }}>
                    {config.icon}
                </div>

                {/* Status Badge */}
                <span style={{
                    background: `${config.bgColor}80`,
                    color: config.color,
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '700',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    display: 'inline-block',
                    marginBottom: '16px'
                }}>
                    {config.label}
                </span>

                {/* Title */}
                <Title level={3} style={{ 
                    marginBottom: '12px', 
                    color: '#1f2937',
                    fontWeight: '700',
                    fontSize: '22px'
                }}>
                    Access Restricted
                </Title>
                
                {/* Description Message */}
                <Text style={{ 
                    fontSize: '15px', 
                    color: '#6b7280', 
                    display: 'block', 
                    marginBottom: '32px',
                    lineHeight: '1.6'
                }}>
                    {isEmployee ? (
                        <>
                            Your user account has been <strong>{config.label?.toLowerCase()}</strong>. Please contact your <strong>Company Administrator</strong> to resolve this issue and restore access.
                        </>
                    ) : (
                        <>
                            Your company CRM account is currently <strong>{config.label?.toLowerCase()}</strong>. Please contact the <strong>Platform Support Team</strong> to reactivate your services.
                        </>
                    )}
                </Text>

                {/* Action Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <Button
                        type="primary"
                        size="large"
                        block
                        onClick={handleContact}
                        icon={<FiMail style={{ marginRight: '6px' }} />}
                        style={{
                            height: '48px',
                            borderRadius: '10px',
                            background: `linear-gradient(135deg, ${config.color} 0%, #111827 100%)`,
                            border: 'none',
                            fontSize: '15px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: `0 4px 12px ${config.bgColor}`
                        }}
                    >
                        {isEmployee ? 'Contact Company Admin' : 'Contact Platform Support'}
                    </Button>

                    <Button
                        type="text"
                        size="large"
                        block
                        onClick={onLogout}
                        icon={<FiLogOut style={{ marginRight: '6px' }} />}
                        style={{
                            height: '48px',
                            color: '#dc2626',
                            borderRadius: '10px',
                            fontWeight: '600',
                            fontSize: '15px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#fef2f2',
                            border: '1px solid #fee2e2'
                        }}
                    >
                        Sign Out / Return to Login
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

export default AccountStatusModal;
