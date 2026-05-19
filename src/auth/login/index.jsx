import React, { useEffect, useState } from "react";
import { Form, Input, Button, Checkbox, notification } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { FiLock, FiMail, FiArrowRight, FiActivity, FiMessageSquare, FiTrendingUp, FiLayers } from "react-icons/fi";
import * as yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsLogin } from "../services/authSlice";
import "./login.scss";
import { useLoginMutation } from "../services/authApi";
import BrandConfig from "../../utils/brandName";
import CreateDemoRequestModal from "../../superadmin/module/demo-request/CreateDemoRequestModal";

const validationSchema = yup.object().shape({
  login: yup.string().required("Email/Username is required").trim(),
  password: yup.string().required("Password is required"),
  remember: yup.boolean(),
});

// Custom Styled CSS Mockups for the visual split screen
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

export default function Login() {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsLogin);
  const [form] = Form.useForm();
  const [login, { isLoading }] = useLoginMutation();
  const [api, contextHolder] = notification.useNotification();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

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

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/auth-redirect", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    localStorage.removeItem("persist:root");
    sessionStorage.clear();
  }, []);

  // Slide cycle interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const showNotification = (type, message, description = "") => {
    api[type]({
      message: message,
      description: description,
      placement: "topRight",
      duration: 3,
    });
  };

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
          errors: [errors[key]],
        }))
      );
      return false;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const values = await form.validateFields();
      const isValid = await validateForm(values);
      if (!isValid) return;

      const result = await login(values).unwrap();
      if (result.success) {
        showNotification("success", "Login Successful", result.message);
        navigate("/auth-redirect", { replace: true });
      } else {
        showNotification(
          "error",
          "Login Failed",
          result.message || "Invalid credentials"
        );
      }
    } catch (error) {
      let errorMessage = "Invalid credentials";
      if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (error.error) {
        errorMessage = typeof error.error === "string" ? error.error : "Server error";
      } else if (error.message) {
        errorMessage = error.message;
      }
      showNotification("error", "Login Failed", errorMessage);
    }
  };

  return (
    <div className="login-redesign-container">
      {contextHolder}
      
      {/* Decorative ambient glowing background circles */}
      <div className="ambient-blob blob-1"></div>
      <div className="ambient-blob blob-2"></div>
      <div className="ambient-blob blob-3"></div>

      <div className="login-card-wrapper">
        
        {/* Left Side: Dynamic Feature Showcase */}
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
            <div className="form-header-area">
              <motion.h1 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                Welcome Back
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Sign in to manage and accelerate your sales workflows
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Form
                form={form}
                name="login"
                className="login-form-redesign"
                layout="vertical"
                validateTrigger={["onBlur", "onChange"]}
              >
                <Form.Item
                  label="Email or Username"
                  name="login"
                  required
                  validateTrigger={["onBlur", "onChange"]}
                  rules={[
                    {
                      validator: async (_, value) => {
                        if (!value) return Promise.reject("Email or Username is required");
                        return Promise.resolve();
                      },
                    },
                  ]}
                >
                  <Input
                    prefix={<FiMail className="input-field-icon" />}
                    placeholder="Enter your email or username"
                    size="large"
                  />
                </Form.Item>

                <Form.Item
                  label="Password"
                  name="password"
                  validateTrigger={["onBlur", "onChange"]}
                  rules={[
                    {
                      required: true,
                      message: "Password is required",
                    },
                  ]}
                >
                  <Input.Password
                    prefix={<FiLock className="input-field-icon" />}
                    placeholder="Enter your password"
                    size="large"
                  />
                </Form.Item>

                <div className="remember-forgot-row">
                  <Form.Item
                    name="remember"
                    valuePropName="checked"
                    noStyle
                  >
                    <Checkbox className="remember-me-checkbox">Remember me</Checkbox>
                  </Form.Item>
                  <Link to="/forgot-password" className="forgot-password-link">
                    Forgot Password?
                  </Link>
                </div>

                <Form.Item className="submit-form-item">
                  <Button
                    type="primary"
                    onClick={handleLogin}
                    loading={isLoading}
                    className="submit-login-button"
                    block
                  >
                    {isLoading ? "Verifying Credentials..." : "Sign In"}
                    {!isLoading && <FiArrowRight className="btn-arrow-icon" />}
                  </Button>
                </Form.Item>
              </Form>
            </motion.div>

            <motion.div 
              className="register-redirect-area"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p>
                New to {BrandConfig.appCapitalName}?{" "}
                <Link to="/register" className="nav-register-link">
                  Create a new account
                </Link>
              </p>
              <p style={{ marginTop: '12px' }}>
                Want to see it in action?{" "}
                <a onClick={() => setIsDemoModalOpen(true)} className="nav-register-link" style={{ cursor: 'pointer', color: '#2563eb', fontWeight: '600' }}>
                  Request a Free Demo
                </a>
              </p>
            </motion.div>

          </div>

          {/* India Proud Badge */}
          <motion.div
            className="india-badge-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span>Made with <span className="heart-pulse">❤️</span> in India</span>
          </motion.div>
        </div>

      </div>
      <CreateDemoRequestModal
        open={isDemoModalOpen}
        onCancel={() => setIsDemoModalOpen(false)}
        onSubmit={() => setIsDemoModalOpen(false)}
      />
    </div>
  );
}
