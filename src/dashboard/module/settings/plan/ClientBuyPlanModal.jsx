import React, { useState } from 'react';
import {
    Modal,
    Button,
    Typography,
    Divider,
    message,
    Tag
} from 'antd';
import { FiX, FiCheck, FiShield, FiCreditCard, FiPackage, FiCalendar } from 'react-icons/fi';
import moment from 'moment';
import { useSelector } from 'react-redux';
import { selectCurrentToken } from '../../../../auth/services/authSlice';

const { Text, Title } = Typography;

const ClientBuyPlanModal = ({ open, onCancel, plan, companyId }) => {
    const [loading, setLoading] = useState(false);
    const token = useSelector(selectCurrentToken);

    if (!plan) return null;

    // Calculate end date for dynamic display
    const calculateEndDate = (startDate, duration) => {
        if (!startDate || !duration) return null;

        if (duration.toLowerCase() === 'lifetime') {
            return moment(startDate).add(100, 'years');
        }

        let endDate = moment(startDate);
        const durationMatch = duration.match(/^(\d+)\s*(Month|Year)s?$/i);

        if (durationMatch) {
            const value = parseInt(durationMatch[1], 10);
            const unit = durationMatch[2].toLowerCase();

            switch (unit) {
                case 'month':
                    endDate = endDate.add(value, 'months');
                    break;
                case 'year':
                    endDate = endDate.add(value, 'years');
                    break;
                default:
                    break;
            }
        }

        return endDate;
    };

    const startDate = moment();
    const endDate = calculateEndDate(startDate, plan.duration);

    const getCurrencyIcon = (currency) => {
        if (!currency) return '₹';
        const lower = currency.toLowerCase();
        if (lower.includes('usd') || lower.includes('dollar')) return '$';
        if (lower.includes('eur') || lower.includes('euro')) return '€';
        if (lower.includes('gbp') || lower.includes('pound')) return '£';
        return '₹';
    };

    const handlePayment = async () => {
        try {
            console.log('=== CLIENT SECURE PAYMENT INITIATED ===');
            if (!companyId) {
                message.error('Company/User details are missing');
                return;
            }

            setLoading(true);

            const formattedValues = {
                client_id: companyId,
                plan_id: plan.id,
                start_date: startDate.format('YYYY-MM-DD'),
                end_date: endDate ? endDate.format('YYYY-MM-DD') : moment().add(1, 'month').format('YYYY-MM-DD'),
                status: 'active',
                payment_status: 'unpaid'
            };

            console.log('Creating secure payment order for plan:', plan.name);

            const orderResponse = await fetch(`${import.meta.env.VITE_API_URL}/subscriptions/razorpay/order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formattedValues)
            });

            if (!orderResponse.ok) {
                const errorData = await orderResponse.json();
                console.error('Order API Error:', errorData);
                throw new Error('Failed to create secure payment checkout');
            }

            const orderData = await orderResponse.json();
            const { orderId, keyId, amount, planName } = orderData.data;

            const options = {
                key: keyId,
                amount: amount,
                currency: 'INR',
                name: `${planName}`,
                description: `Upgrade to ${planName}`,
                order_id: orderId,
                handler: async function (response) {
                    try {
                        setLoading(true);
                        console.log('Payment checkout successful, verifying transaction...');
                        
                        const verifyPayload = {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            ...formattedValues
                        };

                        const verifyResponse = await fetch(`${import.meta.env.VITE_API_URL}/subscriptions/razorpay/verify`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${token}`
                            },
                            body: JSON.stringify(verifyPayload)
                        });

                        if (!verifyResponse.ok) {
                            throw new Error('Payment verification failed');
                        }

                        const verifyData = await verifyResponse.json();

                        if (verifyData.success) {
                            message.success('Payment verified successfully! Welcome to your new plan.');
                            setTimeout(() => {
                                localStorage.clear();
                                window.location.href = '/login';
                            }, 2000);
                        } else {
                            throw new Error(verifyData.message || 'Payment verification failed');
                        }
                    } catch (error) {
                        message.error(error.message || 'Failed to verify payment');
                        setLoading(false);
                    }
                },
                prefill: {
                    name: '',
                    email: '',
                    contact: ''
                },
                theme: {
                    color: '#2563eb'
                },
                modal: {
                    ondismiss: function() {
                        setLoading(false);
                        message.info('Secure payment checkout cancelled');
                    }
                }
            };

            const razorpay = new window.Razorpay(options);
            razorpay.open();
        } catch (error) {
            console.error('Payment checkout exception:', error);
            message.error(error.message || 'Failed to start payment checkout');
            setLoading(false);
        }
    };

    return (
        <Modal
            title={null}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={480}
            destroyOnClose={true}
            centered
            closeIcon={null}
            styles={{
                body: {
                    padding: 0,
                    borderRadius: '16px',
                    overflow: 'hidden'
                }
            }}
        >
            {/* Elegant Header with Royal Blue Gradient */}
            <div style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                padding: '28px 24px',
                color: '#ffffff',
                position: 'relative'
            }}>
                <Button
                    type="text"
                    onClick={onCancel}
                    style={{
                        position: 'absolute',
                        top: '16px',
                        right: '16px',
                        color: '#ffffff',
                        width: '32px',
                        height: '32px',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                    }}
                >
                    <FiX style={{ fontSize: '18px' }} />
                </Button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <FiPackage style={{ fontSize: '20px', color: '#ffffff' }} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#ffffff' }}>Confirm Plan Upgrade</h3>
                        <Text style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)' }}>Review your subscription checkout details</Text>
                    </div>
                </div>
            </div>

            {/* Content Body */}
            <div style={{ padding: '24px' }}>
                
                {/* Plan Summary Section */}
                <div style={{ 
                    background: '#f8fafc', 
                    border: '1px solid #e2e8f0', 
                    borderRadius: '12px', 
                    padding: '20px',
                    marginBottom: '20px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <Text style={{ fontSize: '12px', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Selected Plan</Text>
                            <Title level={3} style={{ margin: '4px 0 0 0', color: '#1e293b', fontWeight: 800 }}>{plan.name}</Title>
                        </div>
                        <Tag color="blue" style={{ borderRadius: '6px', fontWeight: 700, padding: '2px 8px', fontSize: '11px', margin: 0 }}>
                            {plan.duration || '1 Month'}
                        </Tag>
                    </div>

                    <Divider style={{ margin: '16px 0' }} />

                    {/* Price Breakdown */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <span style={{ fontSize: '14px', color: '#475569', fontWeight: 500 }}>Total Amount Due</span>
                        <div>
                            <span style={{ fontSize: '28px', fontWeight: 800, color: '#2563eb' }}>
                                {getCurrencyIcon(plan.currency)}{plan.price}
                            </span>
                            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                                /{plan.duration || 'Month'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Date Summary */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', padding: '0 4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                            <FiCalendar size={15} style={{ color: '#2563eb' }} />
                            <span style={{ fontSize: '13px', fontWeight: 500 }}>Start Date</span>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                            {startDate.format('DD MMM YYYY')}
                        </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                            <FiCalendar size={15} style={{ color: '#2563eb' }} />
                            <span style={{ fontSize: '13px', fontWeight: 500 }}>End Date</span>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>
                            {endDate ? endDate.format('DD MMM YYYY') : 'Lifetime'}
                        </span>
                    </div>
                </div>

                {/* Secure Badge */}
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    gap: '8px', 
                    background: '#ecfdf5', 
                    border: '1px solid #a7f3d0', 
                    borderRadius: '8px', 
                    padding: '10px',
                    marginBottom: '24px'
                }}>
                    <FiShield style={{ color: '#16a34a', fontSize: '16px', flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', color: '#065f46', fontWeight: 600 }}>
                        Secure checkout via Razorpay • 100% SSL Encrypted
                    </span>
                </div>

                {/* Footer Buttons */}
                <div style={{ display: 'flex', gap: '12px' }}>
                    <Button
                        size="large"
                        onClick={onCancel}
                        disabled={loading}
                        style={{
                            flex: 1,
                            height: '46px',
                            borderRadius: '10px',
                            fontWeight: '600',
                            border: '1px solid #cbd5e1',
                            color: '#475569',
                            transition: 'all 0.2s'
                        }}
                    >
                        Cancel
                    </Button>
                    
                    <Button
                        size="large"
                        type="primary"
                        icon={<FiCreditCard />}
                        loading={loading}
                        onClick={handlePayment}
                        style={{
                            flex: 2,
                            height: '46px',
                            borderRadius: '10px',
                            fontWeight: '600',
                            background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                            border: 'none',
                            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '6px'
                        }}
                    >
                        Pay & Activate Plan
                    </Button>
                </div>

                {/* Legal Summary */}
                <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <Text style={{ fontSize: '11px', color: '#94a3b8', lineHeight: '1.4' }}>
                        By purchasing, you agree to our{' '}
                        <a href="/terms-and-conditions" target="_blank" style={{ color: '#2563eb', textDecoration: 'none' }}>Terms</a>
                        ,{' '}
                        <a href="/privacy-policy" target="_blank" style={{ color: '#2563eb', textDecoration: 'none' }}>Privacy Policy</a>
                        , &{' '}
                        <a href="/refund-policy" target="_blank" style={{ color: '#2563eb', textDecoration: 'none' }}>Refunds</a>.
                    </Text>
                </div>
            </div>
        </Modal>
    );
};

export default ClientBuyPlanModal;
