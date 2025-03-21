import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Button, Typography, message } from 'antd';
import { FiMail, FiLock } from 'react-icons/fi';
import { useVerifyOTPMutation } from './services/subClientApi';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

const { Text } = Typography;

const OTPVerificationModal = ({ open, onCancel, sessionToken, onVerificationSuccess }) => {
    const [form] = Form.useForm();
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
    const [verifyOTP, { isLoading }] = useVerifyOTPMutation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft]);

    const handleSubmit = async (values) => {
        try {
            if (!sessionToken) {
                message.error('Session token is missing. Please try again.');
                return;
            }

            console.log('Verifying OTP with:', {
                otp: values.otp,
                sessionToken,
                role: 'sub-client',
                type: 'signup_verification'
            });

            const result = await verifyOTP({
                otp: values.otp,
                sessionToken,
                role: 'sub-client',
                type: 'signup_verification' 
            }).unwrap();

            console.log('OTP Verification Result:', result);

            if (result.success) {
                message.success('Email verified successfully');
                onVerificationSuccess(result.data);
                onCancel();
                // Navigate to subclient page
                navigate('/dashboard/subclient');
            } else {
                message.error(result.message || 'Invalid OTP');
                if (result.message === 'Role not found') {
                    message.error('Error: Role configuration is missing. Please contact support.');
                }
            }
        } catch (error) {
            console.error('OTP Verification Error:', error);
            if (error?.data?.message) {
                message.error(error.data.message);
            } else if (error?.data?.error) {
                message.error(error.data.error);
            } else {
                message.error('Failed to verify OTP. Please try again.');
            }
        }
    };

            const handleFormSubmit = async (e) => {
        e.preventDefault();
        try {
            const values = await form.validateFields();
            handleSubmit(values);
        } catch (error) {
            console.error('Form validation failed:', error);
        }
    };

    const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    return (
        <Modal
            title={null}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={400}
            centered
            closeIcon={null}
            className="pro-modal custom-modal"
        >
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h2 style={{ margin: '0 0 8px 0', fontSize: '24px', fontWeight: '600' }}>
                    Verify Your Email
                </h2>
                <Text type="secondary">
                    Please enter the verification code sent to your email
                </Text>
            </div>

            <Form
                form={form}
                layout="vertical"
                onFinish={handleFormSubmit}
                requiredMark={false}
            >
                <Form.Item
                    name="otp"
                    label="Verification Code"
                    rules={[
                        { required: true, message: 'Please enter verification code' },
                        { len: 6, message: 'OTP must be 6 digits' }
                    ]}
                >
                    <Input
                        prefix={<FiLock style={{ color: '#1890ff' }} />}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        style={{
                            height: '40px',
                            borderRadius: '8px'
                        }}
                    />
                </Form.Item>

                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <Text type="secondary">
                        Time remaining: {formatTime(timeLeft)}
                    </Text>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                    <Button
                        onClick={onCancel}
                        style={{
                            height: '40px',
                            borderRadius: '8px'
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={isLoading}
                        style={{
                            height: '40px',
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                            border: 'none'
                        }}
                    >
                        Verify
                    </Button>
                </div>
            </Form>
        </Modal>
    );
};

export default OTPVerificationModal; 