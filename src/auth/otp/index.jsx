import React, { useState, useRef, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { motion } from 'framer-motion';
import { FiBox, FiArrowLeft } from 'react-icons/fi';
import form_graphic from '../../assets/auth/form_grapihc.png';
import { Link, useNavigate } from 'react-router-dom';
import './otp.scss';
import { useResendSignupOtpMutation, useVerifySignupMutation } from '../../dashboard/module/user-management/users/services/userApi';

export default function OTPVerification() {
    const [loading, setLoading] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef([]);
    const [timer, setTimer] = useState(30);
    const navigate = useNavigate();
    const [verifySignup] = useVerifySignupMutation();
    const [resendSignupOtp] = useResendSignupOtpMutation();

    useEffect(() => {
        // Check if we have verification token
        const token = localStorage.getItem('verificationToken');
        if (!token) {
            navigate('/register');
            return;
        }

        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer, navigate]);

    const handleChange = (value, index) => {
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

    const resendOTP = async () => {
        try {
            const token = localStorage.getItem('verificationToken');
            if (!token) {
                message.error('Verification token not found. Please try registering again.');
                navigate('/register');
                return;
            }
            const result = await resendSignupOtp({ token }).unwrap();
            if (result.success) {
                setTimer(30);
                message.success('New OTP has been sent to your email!');
                if (result.data?.sessionToken) {
                    localStorage.setItem('verificationToken', result.data.sessionToken);
                }
            } else {
                message.error(result.message || 'Failed to resend OTP');
            }
        } catch (error) {
            message.error(error?.data?.message || 'Failed to resend OTP');
        }
    };

    const onFinish = async () => {
        try {
            setLoading(true);
            const otpString = otp.join('');

            if (otpString.length !== 6) {
                throw new Error('Please enter complete OTP');
            }

            const token = localStorage.getItem('verificationToken');
            if (!token) {
                message.error('Verification token not found. Please try registering again.');
                navigate('/register');
                return;
            }

            const result = await verifySignup({ 
                otp: otpString,
                token: token
            }).unwrap();

            if (result.success) {
                // Clear stored data
                localStorage.removeItem('verificationToken');
                localStorage.removeItem('registrationData');
                message.success('Registration completed successfully!');

                // Redirect to login
                navigate('/login', { replace: true });
            } else {
                throw new Error(result.message || 'Verification failed');
            }
        } catch (error) {
            message.error(error?.data?.message || error.message || 'Failed to verify OTP');
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
                        <h2>Verify Your Email</h2>
                        <p>Enter the code we sent to your email</p>
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
                                    onChange={e => handleChange(e.target.value, index)}
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
                            onClick={onFinish}
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
                </motion.div>
            </div>
        </div>
    );
} 