import React, { useState, useRef, useEffect } from 'react';
import { Form, Input, Button, message } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiMail, 
    FiBox, 
    FiArrowLeft, 
    FiLock, 
    FiShield,
    FiActivity,
    FiMessageSquare,
    FiTrendingUp,
    FiLayers,
    FiArrowRight
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import './forgot-password.scss';
import { useSendResetEmailMutation, useVerifyOtpMutation } from './services/forgot-passwordApi';
import BrandConfig from '../../utils/brandName';

// Custom Styled CSS Mockups for the visual split screen matching register page
const PipelineMockup = () => (
    <div className="mockup-container pipeline-mockup">
        <div className="mockup-header">
            <span className="dot red"></span>
            <span className="dot yellow"></span>
            <span className="dot green"></span>
            <span className="mockup-title">Lead Deal Pipeline</span>
        </div>
        <div className="mockup-body">
            <div className="mock-column">
                <span className="column-title">Leads</span>
                <motion.div 
                    className="mock-card"
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                >
                    <div className="card-header">
                        <span className="lead-name">Acme Corp</span>
                        <span className="lead-tag tag-new">New</span>
                    </div>
                    <div className="card-footer">
                        <span className="lead-value">$12,500</span>
                        <span className="lead-time">Just now</span>
                    </div>
                </motion.div>
                <div className="mock-card">
                    <div className="card-header">
                        <span className="lead-name">Lex Luthor Co.</span>
                        <span className="lead-tag tag-new">New</span>
                    </div>
                    <div className="card-footer">
                        <span className="lead-value">$8,200</span>
                        <span className="lead-time">1h ago</span>
                    </div>
                </div>
            </div>

            <div className="mock-column">
                <span className="column-title">Contacted</span>
                <motion.div 
                    className="mock-card active-card"
                    animate={{ 
                        boxShadow: ["0px 4px 12px rgba(37,99,235,0.05)", "0px 10px 24px rgba(37,99,235,0.18)"],
                        borderColor: ["#e5e7eb", "#3b82f6"]
                    }}
                    transition={{ repeat: Infinity, repeatType: "reverse", duration: 2.5 }}
                >
                    <div className="card-header">
                        <span className="lead-name">Wayne Ent.</span>
                        <span className="lead-tag tag-progress">In Progress</span>
                    </div>
                    <div className="card-footer">
                        <span className="lead-value">$45,000</span>
                        <span className="lead-time">Follow up</span>
                    </div>
                </motion.div>
            </div>

            <div className="mock-column">
                <span className="column-title">Won</span>
                <div className="mock-card">
                    <div className="card-header">
                        <span className="lead-name">Stark Industries</span>
                        <span className="lead-tag tag-won">Won</span>
                    </div>
                    <div className="card-footer">
                        <span className="lead-value">$95,000</span>
                        <span className="lead-time">Completed</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const ChatMockup = () => (
    <div className="mockup-container chat-mockup">
        <div className="mockup-header">
            <span className="dot red"></span>
            <span className="dot yellow"></span>
            <span className="dot green"></span>
            <span className="mockup-title">WhatsApp AI Lead Chat</span>
        </div>
        <div className="mockup-body">
            <div className="chat-bubble user">
                <p>Hey, I want to book a CRM trial for our 15 representatives.</p>
                <span className="chat-time">09:15 AM</span>
            </div>
            <motion.div 
                className="chat-bubble ai"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.4 }}
            >
                <div className="ai-header">
                    <span className="ai-badge">AI Assistant ✨</span>
                </div>
                <p>I'd love to help! I've set up an appointment link and initialized your team pipeline. Click here to confirm!</p>
                <span className="chat-time">09:16 AM</span>
            </motion.div>
            <div className="chat-status">
                <span className="status-dot green-glow"></span>
                <span className="status-text">AI Automation Active & Auto-Responding</span>
            </div>
        </div>
    </div>
);

const AnalyticsMockup = () => (
    <div className="mockup-container analytics-mockup">
        <div className="mockup-header">
            <span className="dot red"></span>
            <span className="dot yellow"></span>
            <span className="dot green"></span>
            <span className="mockup-title">Performance Analytics</span>
        </div>
        <div className="mockup-body">
            <div className="stats-grid">
                <div className="stat-card">
                    <span className="stat-label">Conversion Rate</span>
                    <div className="stat-val-container">
                        <span className="stat-value">22.8%</span>
                        <span className="stat-change positive">+6.4%</span>
                    </div>
                </div>
                <div className="stat-card">
                    <span className="stat-label">Active Leads</span>
                    <div className="stat-val-container">
                        <span className="stat-value">2,854</span>
                        <span className="stat-change positive">+14.2%</span>
                    </div>
                </div>
            </div>
            <div className="chart-preview">
                <div className="chart-bars">
                    <motion.div className="bar" animate={{ height: "35%" }} transition={{ duration: 0.8 }}></motion.div>
                    <motion.div className="bar" animate={{ height: "55%" }} transition={{ duration: 0.8 }}></motion.div>
                    <motion.div className="bar active-bar" animate={{ height: "90%" }} transition={{ duration: 0.8 }}></motion.div>
                    <motion.div className="bar" animate={{ height: "45%" }} transition={{ duration: 0.8 }}></motion.div>
                    <motion.div className="bar" animate={{ height: "75%" }} transition={{ duration: 0.8 }}></motion.div>
                </div>
                <div className="chart-labels">
                    <span>Mon</span>
                    <span>Tue</span>
                    <span>Wed</span>
                    <span>Thu</span>
                    <span>Fri</span>
                </div>
            </div>
        </div>
    </div>
);

export default function ForgotPassword() {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [showOtpVerification, setShowOtpVerification] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '']);
    const [userEmail, setUserEmail] = useState('');
    const inputRefs = useRef([]);
    const [timer, setTimer] = useState(0);
    const navigate = useNavigate();

    const [sendResetEmail] = useSendResetEmailMutation();
    const [verifyOtp] = useVerifyOtpMutation();
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            title: "Interactive Lead & Deal Pipeline",
            description: "Organize leads, move stages seamlessly, and automate deal workflows visually.",
            icon: <FiActivity />,
            component: <PipelineMockup />
        },
        {
            title: "Smart AI-Assisted WhatsApp Chat",
            description: "Automate inbound lead generation with responsive AI assistant templates 24/7.",
            icon: <FiMessageSquare />,
            component: <ChatMockup />
        },
        {
            title: "Real-time Metrics & Insights",
            description: "Track conversion rates, team performance, and monthly growth in one unified space.",
            icon: <FiTrendingUp />,
            component: <AnalyticsMockup />
        }
    ];

    // Slide cycle interval
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handlePaste = (e) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '');
        if (pasteData) {
            const newOtp = [...otp];
            const digits = pasteData.split('');
            for (let i = 0; i < Math.min(otp.length, digits.length); i++) {
                newOtp[i] = digits[i];
            }
            setOtp(newOtp);

            const lastFilledIndex = Math.min(otp.length, digits.length) - 1;
            if (inputRefs.current[lastFilledIndex]) {
                inputRefs.current[lastFilledIndex].focus();
            }
        }
    };

    const handleOtpChange = (value, index) => {
        const val = value.replace(/[^0-9]/g, '');
        const newOtp = [...otp];
        newOtp[index] = val;
        setOtp(newOtp);

        if (val && index < otp.length - 1) {
            if (inputRefs.current[index + 1]) {
                inputRefs.current[index + 1].focus();
            }
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace') {
            if (!otp[index] && index > 0) {
                const newOtp = [...otp];
                newOtp[index - 1] = '';
                setOtp(newOtp);
                if (inputRefs.current[index - 1]) {
                    inputRefs.current[index - 1].focus();
                }
            } else {
                const newOtp = [...otp];
                newOtp[index] = '';
                setOtp(newOtp);
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            if (inputRefs.current[index - 1]) {
                inputRefs.current[index - 1].focus();
            }
        } else if (e.key === 'ArrowRight' && index < otp.length - 1) {
            if (inputRefs.current[index + 1]) {
                inputRefs.current[index + 1].focus();
            }
        }
    };

    const onFinish = async (values) => {
        try {
            setLoading(true);
            setUserEmail(values.email);

            // Call the sendResetEmail API
            const response = await sendResetEmail({ email: values.email }).unwrap();

            message.success({
                content: response.message || 'Verification code sent to your registered mobile number!',
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
            form.setFields([{
                name: 'email',
                errors: [error.data?.message || 'Verification failed. Please try again.']
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        const otpString = otp.join('');
        if (otpString.length !== 4) {
            message.error('Please enter a valid verification code');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('verificationToken');
            const response = await verifyOtp({
                email: userEmail,
                otp: otpString,
                token
            }).unwrap();

            message.success({
                content: response.message || 'Verification successful!',
                icon: <span className="success-icon">✓</span>
            });

            if (response.data?.sessionToken) {
                localStorage.setItem('resetToken', response.data.sessionToken);
            }
            localStorage.removeItem('verificationToken');
            navigate('/reset-password');
        } catch (error) {
            message.error({
                content: error.data?.message || error.message || 'Invalid code. Please try again.',
                icon: <span className="error-icon">×</span>,
                duration: 5
            });
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
            setTimer(0);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-redesign-container">
            {/* Left Side: Showcase Panel matching register page */}
            <div className="showcase-panel">
                <div className="showcase-brand">
                    <div className="brand-logo-container">
                        <FiLayers className="brand-logo-icon" />
                    </div>
                    <span className="brand-title">{BrandConfig.appCapitalName} CRM</span>
                </div>

                <div className="showcase-content-area">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentSlide}
                            className="showcase-slide"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -12 }}
                            transition={{ duration: 0.35 }}
                        >
                            {slides[currentSlide].component}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Interactive Feature List Selection */}
                <div className="interactive-features-list">
                    {slides.map((slide, index) => (
                        <div
                            key={index}
                            className={`feature-item-card ${currentSlide === index ? "active" : ""}`}
                            onClick={() => setCurrentSlide(index)}
                        >
                            <div className="feature-icon-box">
                                {slide.icon}
                            </div>
                            <div className="feature-info-box">
                                <h4>{slide.title}</h4>
                                <p>{slide.description}</p>
                            </div>
                            {currentSlide === index && (
                                <motion.div 
                                    className="active-indicator-bar"
                                    layoutId="activeFeatureBar"
                                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                />
                            )}
                        </div>
                    ))}
                </div>

                {/* Mini dot indicators */}
                <div className="slide-dots">
                    {slides.map((_, index) => (
                        <span
                            key={index}
                            className={`dot-indicator ${currentSlide === index ? "active" : ""}`}
                            onClick={() => setCurrentSlide(index)}
                        ></span>
                    ))}
                </div>
            </div>

            {/* Right Side: Form Panel */}
            <div className="form-panel">
                <div className="form-inner-container">
                    <Link to="/login" className="back-link">
                        <FiArrowLeft /> <span>Back</span>
                    </Link>

                    {showOtpVerification ? (
                        <div className="otp-verification-step-wrapper">
                            <div className="form-header-area" style={{ marginBottom: '32px' }}>
                                <motion.h1 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    Enter Verification Code
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    We've sent a verification code to your registered mobile number.<br />
                                    Please enter the code below to verify your identity.
                                </motion.p>
                            </div>

                            <motion.div
                                className="otp-form-panel-content"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <div className="otp-inputs" style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '32px' }}>
                                    {otp.map((digit, index) => (
                                        <Input
                                            key={index}
                                            ref={el => inputRefs.current[index] = el}
                                            value={digit}
                                            onChange={e => handleOtpChange(e.target.value, index)}
                                            onKeyDown={e => handleKeyDown(e, index)}
                                            onPaste={handlePaste}
                                            maxLength={1}
                                            className="otp-input-field"
                                            size="large"
                                            style={{
                                                width: '48px',
                                                height: '52px',
                                                fontSize: '22px',
                                                fontWeight: '700',
                                                textAlign: 'center',
                                                borderRadius: '10px',
                                                border: '1.5px solid #d1d5db',
                                                background: '#f9fafb'
                                            }}
                                        />
                                    ))}
                                </div>

                                <Button
                                    type="primary"
                                    onClick={handleVerifyCode}
                                    loading={loading}
                                    className="submit-register-button"
                                    block
                                    style={{ height: '48px', fontSize: '15px', fontWeight: '600', borderRadius: '10px', marginBottom: '24px' }}
                                >
                                    {loading ? 'Verifying...' : 'Verify Code'}
                                    {!loading && <FiArrowRight className="btn-arrow-icon" />}
                                </Button>

                                <div className="resend-section" style={{ textAlign: 'center', borderTop: '1px solid #f3f4f6', paddingTop: '20px' }}>
                                    <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '6px' }}>Didn't receive the code?</p>
                                    {timer > 0 ? (
                                        <div style={{ color: '#3b82f6', fontWeight: '500', fontSize: '14px' }}>
                                            Resend code in <strong>{timer}s</strong>
                                        </div>
                                    ) : (
                                        <Button
                                            type="link"
                                            onClick={resendOTP}
                                            style={{ color: '#3b82f6', fontWeight: '600', padding: 0 }}
                                        >
                                            Resend Code
                                        </Button>
                                    )}
                                </div>
                            </motion.div>
                        </div>
                    ) : (
                        <div className="email-entry-step-wrapper">
                            <div className="form-header-area" style={{ marginBottom: '32px' }}>
                                <motion.h1 
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                >
                                    Forgot Password?
                                </motion.h1>
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    Enter your email address and we'll send you<br />
                                    instructions to verify and reset your password.
                                </motion.p>
                            </div>

                            <motion.div
                                className="forgot-password-form-content"
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Form
                                    form={form}
                                    name="forgot-password"
                                    onFinish={onFinish}
                                    layout="vertical"
                                >
                                    <Form.Item
                                        label="Professional Email Address"
                                        name="email"
                                        rules={[
                                            { required: true, message: 'Please enter your email address' },
                                            { type: 'email', message: 'Please enter a valid email address' }
                                        ]}
                                    >
                                        <Input
                                            prefix={<FiMail className="input-field-icon" />}
                                            placeholder="Enter your registered email"
                                            size="large"
                                            style={{ height: '48px', borderRadius: '10px' }}
                                        />
                                    </Form.Item>

                                    <Form.Item style={{ marginBottom: 0 }}>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            className="submit-register-button"
                                            loading={loading}
                                            block
                                            style={{ height: '48px', fontSize: '15px', fontWeight: '600', borderRadius: '10px' }}
                                        >
                                            {loading ? 'Sending Request...' : 'Send Reset Code'}
                                            {!loading && <FiArrowRight className="btn-arrow-icon" />}
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </motion.div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}