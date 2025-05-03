import React, { useState, useRef } from 'react';
import { Form, Input, Button, message } from 'antd';
import { motion } from 'framer-motion';
import { FiMail, FiBox, FiArrowLeft, FiLock } from 'react-icons/fi';
import * as yup from 'yup';
import form_graphic from '../../assets/auth/form_grapihc.png';
import { Link, useNavigate } from 'react-router-dom';
import { useSendResetEmailMutation, useVerifyOtpMutation } from './services/forgot-passwordApi';
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
    const [showOtpVerification, setShowOtpVerification] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [timer, setTimer] = useState(30);
    const inputRefs = useRef([]);
    const [form] = Form.useForm();
    const [userEmail, setUserEmail] = useState('');
    const navigate = useNavigate();

    // RTK Query hooks
    const [sendResetEmail] = useSendResetEmailMutation();
    const [verifyOtp] = useVerifyOtpMutation();

    React.useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

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

    const onFinish = async (values) => {
        try {
            const isValid = await validationSchema.validate(values, { abortEarly: false });
            if (!isValid) return;

            setLoading(true);
            setUserEmail(values.email);

            // Call the sendResetEmail API
            const response = await sendResetEmail({ email: values.email }).unwrap();

            message.success({
                content: response.message || 'Verification code sent to your email!',
                icon: <span className="success-icon">✓</span>
            });

            setShowOtpVerification(true);
            setTimer(30);
        } catch (error) {
            console.error('Error details:', error); // For debugging
            message.error({
                content: error.error || error.data?.message || 'An unexpected error occurred',
                icon: <span className="error-icon">×</span>,
                duration: 5 // Show error for 5 seconds
            });
            // Clear form on error if needed
            form.setFields([{
                name: 'email',
                errors: [error.error || error.data?.message || 'Please check your email and try again']
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async () => {
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
            const response = await verifyOtp({
                email: userEmail,
                otp: otpString
            }).unwrap();

            if (response.success) {
                message.success({
                    content: response.message || 'OTP verified successfully!',
                    icon: <span className="success-icon">✓</span>
                });
                navigate('/reset-password');
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
                const resendButton = document.querySelector('.resend-button');
                if (resendButton) {
                    resendButton.click();
                }
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

    const resendOTP = async () => {
        if (timer > 0) return;

        try {
            setLoading(true);
            const response = await sendResetEmail({ email: userEmail }).unwrap();

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
                        <h2>{showOtpVerification ? 'Verify Your Email' : 'Reset Password'}</h2>
                        <p>{showOtpVerification ? 'Enter the code we sent to your email' : "We'll help you get back into your account"}</p>
                    </motion.div>
                </motion.div>

                <motion.div
                    className="form-side"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                >
                    <Link to="/login" className="back-link">
                        <FiArrowLeft /> Back
                    </Link>

                    {showOtpVerification ? (
                        <div className="otp-verification">
                            <div className="otp-header">
                                <h1>Enter Verification Code</h1>
                                <p>We've sent a 6-digit code to your email address. Enter the code below to verify.</p>
                            </div>

                            <div className="otp-form">
                                <div className="otp-inputs">
                                    {otp.map((digit, index) => (
                                        <Input
                                            key={index}
                                            ref={el => inputRefs.current[index] = el}
                                            value={digit}
                                            onChange={e => handleOtpChange(e.target.value, index)}
                                            onKeyDown={e => handleKeyDown(e, index)}
                                            onPaste={handlePaste}
                                            maxLength={1}
                                            className="otp-input"
                                            size="large"
                                        />
                                    ))}
                                </div>

                                <Button
                                    type="primary"
                                    onClick={handleVerifyCode}
                                    loading={loading}
                                    className="verify-button"
                                    block
                                >
                                    {loading ? 'Verifying...' : 'Verify Code'}
                                </Button>

                                <div className="resend-section">
                                    <p>Didn't receive the code?</p>
                                    <Button
                                        type="link"
                                        onClick={resendOTP}
                                        disabled={timer > 0}
                                        className="resend-button"
                                    >
                                        {timer > 0 ? `Resend in ${timer}s` : 'Resend Code'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="forgot-password-header">
                                <div className="header-icon">
                                    <FiLock />
                                </div>
                                <h1>Forgot Password?</h1>
                                <p>Enter your email address and we'll send you instructions to reset your password.</p>
                            </div>

                            <Form
                                form={form}
                                name="forgot-password"
                                className="forgot-password-form"
                                onFinish={onFinish}
                                layout="vertical"
                            >
                                <Form.Item
                                    name="email"
                                    rules={[
                                        { required: true, message: 'Please enter your email address' },
                                        { type: 'email', message: 'Please enter a valid email address' }
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
                                        className="submit-button"
                                        loading={loading}
                                        block
                                    >
                                        {loading ? 'Sending...' : 'Send Reset Instructions'}
                                    </Button>
                                </Form.Item>
                            </Form>
                        </>
                    )}
                </motion.div>
            </div>
        </div>
    );
} 