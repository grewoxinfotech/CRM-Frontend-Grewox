import React, { useState, useRef, useEffect } from 'react';
import { Form, Input, Button, message, Modal, Progress } from 'antd';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    FiBox, 
    FiArrowLeft, 
    FiCpu, 
    FiDatabase, 
    FiActivity, 
    FiSettings, 
    FiShield, 
    FiMessageSquare, 
    FiTrendingUp, 
    FiLayers, 
    FiArrowRight 
} from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import './otp.scss';
import { useResendSignupOtpMutation, useVerifySignupMutation } from '../../dashboard/module/user-management/users/services/userApi';
import BrandConfig from '../../utils/brandName';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../services/authSlice';
import { resetState, resetApiState } from '../../store/actions';

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

export default function OTPVerification() {
    const [loading, setLoading] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '']);
    const inputRefs = useRef([]);
    const [timer, setTimer] = useState(30);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [verifySignup] = useVerifySignupMutation();
    const [resendSignupOtp] = useResendSignupOtpMutation();

    const [setupModalOpen, setSetupModalOpen] = useState(false);
    const [setupProgress, setSetupProgress] = useState(0);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
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

    const workspaceSteps = [
        { label: "Securing account credentials...", icon: <FiCpu /> },
        { label: "Importing standard CRM pipelines...", icon: <FiDatabase /> },
        { label: "Seeding default stages and statuses...", icon: <FiActivity /> },
        { label: "Configuring global workflow paths...", icon: <FiSettings /> },
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

    const handleChange = (value, index) => {
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
                message.success('New OTP has been sent to your registered mobile number!');
                if (result.data?.sessionToken) {
                    localStorage.setItem('verificationToken', result.data.sessionToken);
                }
            } else {
                message.error(result.message || 'Failed to resend OTP');
            }
        } catch (error) {
            message.error(error?.data?.message || error.message || 'Failed to resend OTP');
        }
    };

    const runWorkspaceProgress = (onComplete) => {
        let progress = 0;
        let stepIndex = 0;
        const totalDuration = 4000;
        const intervalTime = 100;
        const totalSteps = workspaceSteps.length;

        const timer = setInterval(() => {
            progress += (intervalTime / totalDuration) * 100;
            if (progress >= 100) {
                progress = 100;
            }
            setSetupProgress(Math.floor(progress));

            const calculatedStep = Math.min(
                Math.floor((progress / 100) * totalSteps),
                totalSteps - 1
            );
            if (calculatedStep !== stepIndex) {
                stepIndex = calculatedStep;
                setCurrentStepIndex(stepIndex);
            }

            if (progress >= 100) {
                clearInterval(timer);
                setTimeout(() => {
                    onComplete();
                }, 400);
            }
        }, intervalTime);
    };

    const onFinish = async () => {
        if (loading) return;
        const otpString = otp.join('');
        if (otpString.length !== 4) {
            message.error('Please enter a valid verification code');
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('verificationToken');
            if (!token) {
                message.error('Verification token not found. Please try registering again.');
                navigate('/register');
                return;
            }

            const result = await verifySignup({ otp: otpString }).unwrap();
            if (result.success) {
                setSetupModalOpen(true);
                setSetupProgress(0);
                setCurrentStepIndex(0);

                runWorkspaceProgress(() => {
                    setSetupModalOpen(false);
                    dispatch(loginSuccess({
                        token: result.data.token,
                        user: result.data.user
                    }));
                    dispatch(resetState());
                    dispatch(resetApiState());
                    localStorage.removeItem('verificationToken');
                    message.success('Account verified and workspace launched successfully!');
                    navigate('/dashboard', { replace: true });
                });
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

            {/* Right Side: Form Panel matching register/login structure */}
            <div className="form-panel">
                <div className="form-inner-container">
                    <Link to="/register" className="back-link">
                        <FiArrowLeft /> <span>Back</span>
                    </Link>

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
                            We've sent a verification code to your mobile number.<br />
                            Please enter the code below to verify your account.
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
                                    onChange={e => handleChange(e.target.value, index)}
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
                            onClick={onFinish}
                            loading={loading}
                            disabled={loading}
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
            </div>

            {/* Workspace Setup Progress Modal */}
            <Modal
                open={setupModalOpen}
                footer={null}
                closable={false}
                maskClosable={false}
                centered
                className="workspace-setup-modal"
                width={480}
            >
                <div className="modal-setup-header">
                    <div className="brand-icon-wrapper">
                        <FiBox />
                    </div>
                    <h2>Setting Up Workspace</h2>
                    <p>Please wait while we initialize your premium CRM workspace</p>
                </div>

                <div className="progress-wrapper">
                    <Progress
                        type="circle"
                        percent={setupProgress}
                        strokeColor={{
                            '0%': '#10b981',
                            '100%': '#3b82f6',
                        }}
                        strokeWidth={6}
                        width={120}
                    />
                </div>

                <div className="setup-steps-list">
                    {workspaceSteps.map((step, idx) => (
                        <div
                            key={idx}
                            className={`setup-step-item ${idx === currentStepIndex ? 'active' : ''} ${idx < currentStepIndex ? 'completed' : ''}`}
                        >
                            <div className="step-icon-box">
                                {step.icon}
                            </div>
                            <span className="step-label">{step.label}</span>
                            <span className={`step-badge ${idx === currentStepIndex ? 'running' : ''} ${idx < currentStepIndex ? 'done' : ''} ${idx > currentStepIndex ? 'pending' : ''}`}>
                                {idx === currentStepIndex ? 'Running' : idx < currentStepIndex ? 'Done' : 'Pending'}
                            </span>
                        </div>
                    ))}
                </div>
            </Modal>
        </div>
    );
}