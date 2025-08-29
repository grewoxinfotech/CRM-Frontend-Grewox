import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { motion } from 'framer-motion';
import { FiBox, FiArrowLeft, FiMail, FiLock } from 'react-icons/fi';
import form_graphic from '../../assets/auth/form_grapihc.png';
import { Link, useNavigate } from 'react-router-dom';
import { useResetPasswordMutation } from '../forgot-password/services/forgot-passwordApi';
import './resend.scss';
import BrandConfig from '../../utils/brandName';

export default function ResetPassword() {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [resetPassword] = useResetPasswordMutation();

    // Check for reset token on component mount
    useEffect(() => {
        const resetToken = localStorage.getItem('resetToken');
        if (!resetToken) {
            message.error('Please verify your email first');
            navigate('/forgot-password');
            return;
        }

        // Validate token format
        if (!resetToken.startsWith('Bearer ')) {
            message.error('Invalid token format. Please try the reset process again.');
            localStorage.removeItem('resetToken');
            navigate('/forgot-password');
        }
    }, [navigate]);

    const handleResetPassword = async (values) => {
        if (values.newPassword !== values.confirmPassword) {
            message.error('Passwords do not match');
            return;
        }

        const resetToken = localStorage.getItem('resetToken');
        if (!resetToken || !resetToken.startsWith('Bearer ')) {
            message.error('Invalid or expired session. Please restart the reset process.');
            navigate('/forgot-password');
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
                navigate('/login');
            }
        } catch (error) {
            const errorMsg = error?.error || error?.data?.message || 'Failed to reset password';

            if (errorMsg.includes('Invalid authorization') || errorMsg.includes('token')) {
                message.error('Your reset session has expired. Please restart the reset process.');
                localStorage.removeItem('resetToken');
                navigate('/forgot-password');
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

    return (
        <div className="otp-container">
            <div className="otp-split">
                <motion.div
                    className="illustration-side"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="brand">
                        <FiLock className="logo" />
                        <span className="brand-name">{BrandConfig.appCapitalName} CRM</span>

                    </div>
                    <motion.img
                        src={form_graphic}
                        alt="Work illustration"
                        className="illustration"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                    />
                    <motion.div
                        className="illustration-text"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        <h2>Reset Password</h2>
                        <p>Create your new password</p>
                    </motion.div>
                </motion.div>

                <motion.div
                    className="form-side"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    <Link to="/forgot-password" className="back-link">
                        <FiArrowLeft /> Back
                    </Link>

                    <div className="otp-header">
                        <div className="header-icon">
                            <FiLock />
                        </div>
                        <h1>Reset Your Password</h1>
                        <p>Enter your new password below</p>
                    </div>

                    <Form
                        form={form}
                        onFinish={handleResetPassword}
                        className="otp-form"
                        layout="vertical"
                    >
                        <Form.Item
                            name="newPassword"
                            rules={[
                                { required: true, message: 'Please enter your new password' },
                                { min: 8, message: 'Password must be at least 8 characters' }
                            ]}
                        >
                            <Input.Password
                                prefix={<FiLock className="site-form-item-icon" />}
                                size="large"
                                placeholder="New Password"
                                className="password-input"
                            />
                        </Form.Item>

                        <Form.Item
                            name="confirmPassword"
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
                        >
                            <Input.Password
                                prefix={<FiLock className="site-form-item-icon" />}
                                size="large"
                                placeholder="Confirm Password"
                                className="password-input"
                            />
                        </Form.Item>

                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            className="verify-button"
                            block
                        >
                            {loading ? 'Resetting Password...' : 'Reset Password'}
                        </Button>

                        <div className="resend-section">
                            <p>Remember your password?</p>
                            <Button
                                type="link"
                                onClick={() => navigate('/login')}
                                className="resend-button"
                            >
                                Login
                            </Button>
                        </div>
                    </Form>
                </motion.div>
            </div>
        </div>
    );
}
