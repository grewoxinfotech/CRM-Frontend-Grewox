import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { motion } from 'framer-motion';
import { FiMail, FiBox, FiArrowLeft } from 'react-icons/fi';
import * as yup from 'yup';
import form_graphic from '../../assets/auth/form_grapihc.png';
import { Link } from 'react-router-dom';
import './forgot-password.scss';

const validationSchema = yup.object().shape({
    email: yup
        .string()
        .email('Please enter a valid email address')
        .required('Email is required')
        .trim()
});

export default function ForgotPassword() {
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const [form] = Form.useForm();

    const validateForm = async (values) => {
        try {
            await validationSchema.validate(values, { abortEarly: false });
            return true;
        } catch (err) {
            const errors = {};
            err.inner.forEach((error) => {
                errors[error.path] = error.message;
            });
            form.setFields(
                Object.keys(errors).map((key) => ({
                    name: key,
                    errors: [errors[key]]
                }))
            );
            return false;
        }
    };

    const onFinish = async (values) => {
        try {
            const isValid = await validateForm(values);
            if (!isValid) return;

            setLoading(true);
            // Add your password reset logic here
            console.log('Reset password for:', values.email);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            setEmailSent(true);
            message.success({
                content: 'Reset instructions sent to your email!',
                icon: <span className="success-icon">✓</span>
            });
        } catch (error) {
            console.error('Reset password error:', error);
            message.error({
                content: error?.response?.data?.message || 'Failed to send reset instructions. Please try again.',
                icon: <span className="error-icon">×</span>
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="forgot-password-container">
            <div className="forgot-password-split">
                <motion.div
                    className="illustration-side"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    <div className="brand">
                        <FiBox className="logo" />
                        <span className="brand-name">Work Software</span>
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
                        <p>We'll help you get back into your account</p>
                    </motion.div>
                </motion.div>

                <motion.div
                    className="form-side"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    <Link to="/login" className="back-link">
                        <FiArrowLeft /> Back to Login
                    </Link>

                    <div className="forgot-password-header">
                        <h1>Forgot Password?</h1>
                        <p>Enter your email address and we'll send you instructions to reset your password.</p>
                    </div>

                    {emailSent ? (
                        <motion.div
                            className="success-message"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="success-icon-large">✓</div>
                            <h2>Check Your Email</h2>
                            <p>We've sent password reset instructions to your email address. Please check your inbox.</p>
                            <Button
                                type="primary"
                                onClick={() => form.resetFields()}
                                className="send-again-button"
                            >
                                Send Again
                            </Button>
                        </motion.div>
                    ) : (
                        <Form
                            form={form}
                            name="forgot-password"
                            className="forgot-password-form"
                            onFinish={onFinish}
                            layout="vertical"
                            validateTrigger={['onBlur', 'onChange']}
                        >
                            <Form.Item
                                label="Email Address"
                                name="email"
                                validateTrigger={['onBlur', 'onChange']}
                                rules={[
                                    {
                                        validator: async (_, value) => {
                                            if (!value) return Promise.reject('Email is required');
                                            try {
                                                await yup.string().email('Please enter a valid email address').validate(value);
                                                return Promise.resolve();
                                            } catch (err) {
                                                return Promise.reject(err.message);
                                            }
                                        }
                                    }
                                ]}
                            >
                                <Input
                                    prefix={<FiMail className="site-form-item-icon" />}
                                    placeholder="Enter your email"
                                    size="large"
                                />
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    className="submit-button"
                                    block
                                >
                                    {loading ? 'Sending Instructions...' : 'Send Reset Instructions'}
                                </Button>
                            </Form.Item>
                        </Form>
                    )}
                </motion.div>
            </div>
        </div>
    );
} 