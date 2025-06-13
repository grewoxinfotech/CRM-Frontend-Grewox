import React, { useState } from 'react';
import { Modal, Form, Input, Button, Steps, message } from 'antd';
import { FiMail, FiLock, FiX } from 'react-icons/fi';
import { useSendResetEmailMutation, useVerifyOtpMutation, useResetPasswordMutation } from '../../../auth/forgot-password/services/forgot-passwordApi';

const { Step } = Steps;

const ResetPasswordModal = ({ visible, onCancel, company }) => {
    const [form] = Form.useForm();
    const [otpForm] = Form.useForm();
    const [passwordForm] = Form.useForm();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(30);
    const inputRefs = React.useRef([]);

    // RTK Query hooks
    const [sendResetEmail] = useSendResetEmailMutation();
    const [verifyOtp] = useVerifyOtpMutation();
    const [resetPassword] = useResetPasswordMutation();

    // Timer for OTP resend
    React.useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    // Reset state when modal is opened or closed
    React.useEffect(() => {
        if (visible) {
            setCurrentStep(0);
            setOtp(['', '', '', '', '', '']);
            setTimer(30);
            form.resetFields();
            otpForm.resetFields();
            passwordForm.resetFields();
        }
    }, [visible, form, otpForm, passwordForm]);

    // Handle OTP input changes
    const handleOtpChange = (value, index) => {
        if (value.length > 1) {
            value = value[value.length - 1];
        }

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Move to next input if value is entered
        if (value !== '' && index < 5) {
            inputRefs.current[index + 1].focus();
        }
    };

    const handleKeyDown = (e, index) => {
        // Move to previous input on backspace if current input is empty
        if (e.key === 'Backspace' && index > 0 && otp[index] === '') {
            inputRefs.current[index - 1].focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        const newOtp = [...otp];

        for (let i = 0; i < pastedData.length; i++) {
            if (i < 6) {
                newOtp[i] = pastedData[i];
            }
        }

        setOtp(newOtp);
        if (newOtp[5]) {
            inputRefs.current[5].focus();
        }
    };

    // Step 1: Send reset email
    const handleSendEmail = async () => {
        try {
            setLoading(true);
            
            // Use company email if available, otherwise use the form input
            const email = company?.email || form.getFieldValue('email');
            
            if (!email) {
                message.error('Email is required');
                return;
            }

            const response = await sendResetEmail({ email }).unwrap();

            // Ensure the session token is stored properly
            if (response.sessionToken) {
                const tokenWithBearer = `Bearer ${response.sessionToken}`;
                localStorage.setItem('resetToken', tokenWithBearer);
            }

            message.success({
                content: response.message || 'Verification code sent successfully!',
                icon: <span className="success-icon">✓</span>
            });

            setCurrentStep(1);
            setTimer(30);
        } catch (error) {
            console.error('Error sending reset email:', error);
            message.error({
                content: error.error || error.data?.message || 'Failed to send verification code',
                icon: <span className="error-icon">×</span>
            });
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async () => {
        const otpString = otp.join('');
        if (otpString.length !== 6) {
            message.error({
                content: 'Please enter complete verification code',
                icon: <span className="error-icon">×</span>
            });
            return;
        }

        setLoading(true);
        try {
            const email = company?.email || form.getFieldValue('email');
            
            // Check if resetToken exists
            const resetToken = localStorage.getItem('resetToken');
            if (!resetToken) {
                message.error('Session token not found. Please try again.');
                setCurrentStep(0);
                return;
            }

            const response = await verifyOtp({
                email,
                otp: otpString
            }).unwrap();

            if (response.success) {
                // Update token if provided in response
                if (response.sessionToken) {
                    const tokenWithBearer = `Bearer ${response.sessionToken}`;
                    localStorage.setItem('resetToken', tokenWithBearer);
                }

                message.success({
                    content: response.message || 'OTP verified successfully!',
                    icon: <span className="success-icon">✓</span>
                });
                setCurrentStep(2);
            }
        } catch (error) {
            console.error('OTP verification error:', error);

            // Handle specific OTP error cases
            if (error.isOtpError) {
                message.error({
                    content: error.error,
                    icon: <span className="error-icon">×</span>,
                    duration: 5
                });
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            } else if (error.isOtpExpired) {
                message.error({
                    content: error.error,
                    icon: <span className="error-icon">×</span>,
                    duration: 5
                });
                setTimer(0);
                setOtp(['', '', '', '', '', '']);
            } else {
                message.error({
                    content: error.error || 'Verification failed. Please try again.',
                    icon: <span className="error-icon">×</span>,
                    duration: 5
                });
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (values) => {
        if (values.newPassword !== values.confirmPassword) {
            message.error('Passwords do not match');
            return;
        }

        // Check if resetToken exists
        const resetToken = localStorage.getItem('resetToken');
        if (!resetToken) {
            message.error('Session token not found. Please restart the reset process.');
            setCurrentStep(0);
            return;
        }

        try {
            setLoading(true);
            const response = await resetPassword({
                newPassword: values.newPassword,
                confirmPassword: values.confirmPassword
            }).unwrap();

            if (response.success) {
                message.success({
                    content: response.message || 'Password reset successfully!',
                    icon: <span className="success-icon">✓</span>
                });
                localStorage.removeItem('resetToken');
                onCancel();
            }
        } catch (error) {
            const errorMsg = error?.error || error?.data?.message || 'Failed to reset password';
            
            if (errorMsg.includes('Invalid authorization') || errorMsg.includes('token')) {
                message.error({
                    content: 'Your reset session has expired. Please restart the reset process.',
                    icon: <span className="error-icon">×</span>
                });
                localStorage.removeItem('resetToken');
                setCurrentStep(0);
            } else {
                message.error({
                    content: errorMsg,
                    icon: <span className="error-icon">×</span>
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const resendOTP = async () => {
        if (timer > 0) return;

        try {
            setLoading(true);
            const email = company?.email || form.getFieldValue('email');
            const response = await sendResetEmail({ email }).unwrap();

            setTimer(30);
            message.success({
                content: response.message || 'New verification code sent!',
                icon: <span className="success-icon">✓</span>
            });
        } catch (error) {
            console.error('Resend OTP error:', error);
            message.error({
                content: error.error || 'Failed to send new code. Please try again.',
                icon: <span className="error-icon">×</span>,
                duration: 5
            });
            // If resend fails, allow immediate retry
            setTimer(0);
        } finally {
            setLoading(false);
        }
    };

    // Render different content based on current step
    const renderStepContent = () => {
        switch (currentStep) {
            case 0:
                return (
                    <Form form={form} layout="vertical" initialValues={{ email: company?.email || '' }}>
                        <Form.Item
                            name="email"
                            label={
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    Email Address <span style={{ color: "#ff4d4f" }}>*</span>
                                </span>
                            }
                            rules={[
                                { required: true, message: 'Please enter email address' },
                                { type: 'email', message: 'Please enter a valid email address' }
                            ]}
                        >
                            <Input 
                                prefix={<FiMail style={{ color: '#1890ff', fontSize: '16px' }} />}
                                placeholder="Enter email address"
                                size="large"
                                disabled={!!company?.email}
                                style={{
                                    borderRadius: '10px',
                                    padding: '8px 16px',
                                    height: '48px',
                                    backgroundColor: '#f8fafc',
                                    border: '1px solid #e6e8eb',
                                    transition: 'all 0.3s ease',
                                }}
                            />
                        </Form.Item>
                        <Form.Item style={{ marginTop: '24px' }}>
                            <Button
                                type="primary"
                                onClick={handleSendEmail}
                                loading={loading}
                                block
                                style={{
                                    padding: '8px 32px',
                                    height: '44px',
                                    borderRadius: '10px',
                                    fontWeight: '500',
                                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                                    border: 'none',
                                    boxShadow: '0 4px 12px rgba(24, 144, 255, 0.15)',
                                }}
                            >
                                {loading ? 'Sending...' : 'Send Verification Code'}
                            </Button>
                        </Form.Item>
                    </Form>
                );
            case 1:
                return (
                    <Form form={otpForm} layout="vertical">
                        <div className="otp-header" style={{ marginBottom: '24px', textAlign: 'center' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', margin: '0 0 8px' }}>Enter Verification Code</h3>
                            <p style={{ fontSize: '14px', color: '#8c8c8c', margin: 0 }}>
                                We've sent a 6-digit code to the email address. Enter the code below to verify.
                            </p>
                        </div>

                        <div className="otp-inputs" style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '20px 0' }}>
                            {otp.map((digit, index) => (
                                <Input
                                    key={index}
                                    ref={el => inputRefs.current[index] = el}
                                    value={digit}
                                    onChange={e => handleOtpChange(e.target.value, index)}
                                    onKeyDown={e => handleKeyDown(e, index)}
                                    onPaste={handlePaste}
                                    maxLength={1}
                                    style={{ 
                                        width: '45px', 
                                        height: '50px', 
                                        textAlign: 'center',
                                        fontSize: '18px',
                                        borderRadius: '8px',
                                        fontWeight: '600',
                                        backgroundColor: '#f8fafc',
                                        border: '1px solid #e6e8eb',
                                    }}
                                    size="large"
                                />
                            ))}
                        </div>

                        <Button
                            type="primary"
                            onClick={handleVerifyOtp}
                            loading={loading}
                            block
                            style={{
                                padding: '8px 32px',
                                height: '44px',
                                borderRadius: '10px',
                                fontWeight: '500',
                                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                                border: 'none',
                                boxShadow: '0 4px 12px rgba(24, 144, 255, 0.15)',
                                marginTop: '24px'
                            }}
                        >
                            {loading ? 'Verifying...' : 'Verify Code'}
                        </Button>

                        <div style={{ marginTop: '20px', textAlign: 'center' }}>
                            <p style={{ fontSize: '14px', color: '#8c8c8c', margin: '0 0 8px' }}>Didn't receive the code?</p>
                            <Button
                                type="link"
                                onClick={resendOTP}
                                disabled={timer > 0}
                                style={{ padding: '0 4px' }}
                            >
                                {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
                            </Button>
                        </div>
                    </Form>
                );
            case 2:
                return (
                    <Form
                        form={passwordForm}
                        layout="vertical"
                        onFinish={handleResetPassword}
                    >
                        <Form.Item
                            name="newPassword"
                            label={
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    New Password <span style={{ color: "#ff4d4f" }}>*</span>
                                </span>
                            }
                            rules={[
                                { required: true, message: 'Please enter new password' },
                                { min: 8, message: 'Password must be at least 8 characters' }
                            ]}
                            extra={
                                <span style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px', display: 'block' }}>
                                    Password must be at least 8 characters long
                                </span>
                            }
                        >
                            <Input.Password
                                prefix={<FiLock style={{ color: '#1890ff', fontSize: '16px' }} />}
                                size="large"
                                placeholder="New Password"
                                style={{
                                    borderRadius: '10px',
                                    padding: '8px 16px',
                                    height: '48px',
                                    backgroundColor: '#f8fafc',
                                    border: '1px solid #e6e8eb',
                                    transition: 'all 0.3s ease',
                                }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="confirmPassword"
                            label={
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    Confirm Password <span style={{ color: "#ff4d4f" }}>*</span>
                                </span>
                            }
                            rules={[
                                { required: true, message: 'Please confirm your password' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || getFieldValue('newPassword') === value) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject('Passwords do not match');
                                    },
                                }),
                            ]}
                            style={{ marginTop: '22px' }}
                        >
                            <Input.Password
                                prefix={<FiLock style={{ color: '#1890ff', fontSize: '16px' }} />}
                                size="large"
                                placeholder="Confirm Password"
                                style={{
                                    borderRadius: '10px',
                                    padding: '8px 16px',
                                    height: '48px',
                                    backgroundColor: '#f8fafc',
                                    border: '1px solid #e6e8eb',
                                    transition: 'all 0.3s ease',
                                }}
                            />
                        </Form.Item>

                        <Form.Item style={{ marginTop: '24px' }}>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={loading}
                                block
                                style={{
                                    padding: '8px 32px',
                                    height: '44px',
                                    borderRadius: '10px',
                                    fontWeight: '500',
                                    background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
                                    border: 'none',
                                    boxShadow: '0 4px 12px rgba(24, 144, 255, 0.15)',
                                }}
                            >
                                {loading ? 'Resetting Password...' : 'Reset Password'}
                            </Button>
                        </Form.Item>
                    </Form>
                );
            default:
                return null;
        }
    };

    const getStepTitle = () => {
        switch (currentStep) {
            case 0: return 'Reset Password';
            case 1: return 'Verify OTP';
            case 2: return 'Create New Password';
            default: return 'Reset Password';
        }
    };

    const getStepIcon = () => {
        switch (currentStep) {
            case 0: return <FiMail style={{ fontSize: '24px', color: '#ffffff' }} />;
            case 1: return <FiLock style={{ fontSize: '24px', color: '#ffffff' }} />;
            case 2: return <FiLock style={{ fontSize: '24px', color: '#ffffff' }} />;
            default: return <FiMail style={{ fontSize: '24px', color: '#ffffff' }} />;
        }
    };

    const getStepDescription = () => {
        switch (currentStep) {
            case 0: return 'Enter email to send verification code';
            case 1: return 'Enter the code sent to your email';
            case 2: return 'Create your new secure password';
            default: return 'Reset your password';
        }
    };

    return (
        <Modal
            title={null}
            open={visible}
            onCancel={onCancel}
            footer={null}
            width={520}
            destroyOnClose
            centered
            closeIcon={null}
            className="pro-modal custom-modal"
            styles={{
                body: {
                    padding: 0,
                    overflow: "hidden",
                    borderRadius: "8px",
                },
            }}
        >
            <div
                className="modal-header"
                style={{
                    background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)",
                    padding: "24px",
                    color: "#ffffff",
                    position: "relative",
                    borderTopLeftRadius: "8px",
                    borderTopRightRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                }}
            >
                <Button
                    type="text"
                    onClick={onCancel}
                    style={{
                        position: "absolute",
                        top: "16px",
                        right: "16px",
                        color: "#ffffff",
                        width: "32px",
                        height: "32px",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "rgba(255, 255, 255, 0.2)",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        backdropFilter: "blur(8px)",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
                    }}
                >
                    <FiX style={{ fontSize: "20px" }} />
                </Button>
                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div
                        style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "12px",
                            background: "rgba(255, 255, 255, 0.2)",
                            backdropFilter: "blur(8px)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                        }}
                    >
                        {getStepIcon()}
                    </div>
                    <div>
                        <h2
                            style={{
                                margin: "0",
                                fontSize: "24px",
                                fontWeight: "600",
                                color: "#ffffff",
                                textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
                            }}
                        >
                            {getStepTitle()}
                        </h2>
                        <p
                            style={{
                                margin: "4px 0 0",
                                fontSize: "14px",
                                color: "rgba(255, 255, 255, 0.85)",
                            }}
                        >
                            {getStepDescription()}
                        </p>
                    </div>
                </div>
            </div>

            <div style={{ padding: "24px" }}>
                <Steps current={currentStep} size="small" style={{ marginBottom: "24px" }}>
                    <Step title="Email" />
                    <Step title="Verify" />
                    <Step title="Reset" />
                </Steps>
                {renderStepContent()}
            </div>
        </Modal>
    );
};

export default ResetPasswordModal; 