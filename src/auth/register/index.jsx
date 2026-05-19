import React, { useEffect, useState } from "react";
import { Form, Input, Button, Checkbox, notification, Select } from "antd";
import { motion, AnimatePresence } from "framer-motion";
import { FiLock, FiMail, FiArrowRight, FiActivity, FiMessageSquare, FiTrendingUp, FiLayers, FiUser, FiPhone, FiBriefcase, FiHash, FiArrowLeft, FiGlobe, FiMapPin } from "react-icons/fi";
import * as yup from "yup";
import { useNavigate, Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectIsLogin } from "../services/authSlice";
import "./register.scss";
import { useRegisterMutation, useCheckAvailabilityMutation, useGetAllCountriesQuery } from "../services/authApi";
import BrandConfig from "../../utils/brandName";
import CreateDemoRequestModal from "../../superadmin/module/demo-request/CreateDemoRequestModal";
import citiesData from "../../utils/Indian_Cities_In_States_JSON.json";
import industriesData from "../../utils/industries.json";

const allCitiesList = Array.from(new Set(Object.values(citiesData).flat())).sort();
const industriesList = [...industriesData.industries].sort();

const validationSchema = yup.object().shape({
  email: yup.string().email("Invalid email format").required("Email is required").trim(),
  password: yup.string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters long")
    .matches(/^[a-zA-Z0-9!@#$%^&*]{8,30}$/, "Create a strong password"),
  firstName: yup.string().required("First name is required").trim(),
  lastName: yup.string().required("Last name is required").trim(),
  phone: yup.string().required("Phone number is required").trim(),
  industry: yup.string().required("Industry sector is required").trim(),
  customIndustry: yup.string().optional().trim(),
  city: yup.string().required("City name is required").trim(),
  customCity: yup.string().optional().trim(),
  website: yup.string().optional().trim(),
  gstIn: yup.string().optional().trim(),
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

export default function Register() {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsLogin);
  const [form] = Form.useForm();
  const [register, { isLoading }] = useRegisterMutation();
  const [checkAvailability, { isLoading: isCheckingAvailability }] = useCheckAvailabilityMutation();
  const { data: countriesResponse } = useGetAllCountriesQuery();
  const dbCountries = countriesResponse?.data || [];

  const phoneCodesList = dbCountries.map(c => ({ code: c.phoneCode, country: c.countryCode, name: c.countryName }));

  const [api, contextHolder] = notification.useNotification();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [step, setStep] = useState(1);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [selectedIndustry, setSelectedIndustry] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  const handleNextStep = async () => {
    try {
      await form.validateFields(["email", "password"]);
      const values = form.getFieldsValue(["email"]);
      const checkResult = await checkAvailability({ email: values.email }).unwrap();
      if (checkResult.success) {
        setStep(2);
      } else {
        showNotification("error", "Email Unavailable", checkResult.message || "Email is already registered.");
      }
    } catch (err) {
      console.log("Validation/Availability failed:", err);
      if (err.errorFields) {
        // Field validation failed (e.g. invalid format or empty)
        return;
      }
      let errorMessage = "Validation failed";
      if (err.data?.message) {
        errorMessage = err.data.message;
      } else if (err.error) {
        errorMessage = typeof err.error === "string" ? err.error : "Server error";
      } else if (err.message) {
        errorMessage = err.message;
      }
      showNotification("error", "Registration Check Failed", errorMessage);
    }
  };

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

  const handleRegister = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (step !== 2) {
      handleNextStep();
      return;
    }
    try {
      await form.validateFields();
      const values = form.getFieldsValue();

      // Automatically generate a unique, clean username from the email prefix in the background
      const emailPrefix = values.email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, "");
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const generatedUsername = `${emailPrefix}${randomSuffix}`;

      // If "Other" is chosen, map the custom specified industry
      const finalIndustry = values.industry === "Other" ? values.customIndustry : values.industry;
      // If "Other" is chosen, map the custom specified city
      const finalCity = values.city === "Other" ? values.customCity : values.city;

      // Auto-detect State and Country based on selected City from our JSON dataset
      let detectedState = "";
      let detectedCountry = "India"; // Default country since they are Indian cities

      if (values.city !== "Other") {
        for (const [state, cities] of Object.entries(citiesData)) {
          if (cities.includes(values.city)) {
            detectedState = state;
            break;
          }
        }
      } else {
        detectedState = "Other";
      }

      const registerPayload = {
        ...values,
        username: generatedUsername,
        industry: finalIndustry,
        city: finalCity,
        state: detectedState || "Other",
        country: detectedCountry,
      };
      delete registerPayload.customIndustry;
      delete registerPayload.customCity;

      const result = await register(registerPayload).unwrap();
      if (result.success) {
        showNotification("success", "Registration initiated", "Please verify your email to complete registration");
        localStorage.setItem('registrationData', JSON.stringify(registerPayload));
        navigate("/otp"); 
      } else {
        showNotification(
          "error",
          "Registration Failed",
          result.message || "Registration failed"
        );
      }
    } catch (error) {
      // If it is an Ant Design validation error, ignore showing a global toast
      if (error.errorFields) {
        console.log("Validation failed:", error);
        return;
      }

      let errorMessage = "Registration failed";
      if (error.data?.message) {
        errorMessage = error.data.message;
      } else if (error.error) {
        errorMessage = typeof error.error === "string" ? error.error : "Server error";
      } else if (error.message) {
        errorMessage = error.message;
      }
      showNotification("error", "Registration Failed", errorMessage);
    }
  };

  return (
    <div className="register-redesign-container">
      {contextHolder}
      
      {/* Decorative ambient glowing background circles */}
      <div className="ambient-blob blob-1"></div>
      <div className="ambient-blob blob-2"></div>
      <div className="ambient-blob blob-3"></div>

      <div className="register-card-wrapper">
        
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
                Create Account
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Start organizing your workflows and lead channels today
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Form
                form={form}
                name="register"
                className="register-form-redesign"
                layout="vertical"
                preserve={true}
                validateTrigger={["onBlur", "onChange"]}
              >
                {/* Step indicator header */}
                <div className="form-steps-indicator">
                  <div className={`step-item ${step >= 1 ? 'active' : ''}`}>
                    <span className="step-number">1</span>
                    <span className="step-label">Account Setup</span>
                  </div>
                  <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
                  <div className={`step-item ${step >= 2 ? 'active' : ''}`}>
                    <span className="step-number">2</span>
                    <span className="step-label">Business Info</span>
                  </div>
                </div>

                <div style={{ display: step === 1 ? "block" : "none" }}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={step === 1 ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.2 }}
                  >
                    <Form.Item
                      label="Email Address"
                      name="email"
                      required
                      validateTrigger={["onBlur", "onChange"]}
                      rules={[
                        {
                          type: "email",
                          message: "Invalid email format",
                        },
                        {
                          required: true,
                          message: "Email is required",
                        },
                      ]}
                    >
                      <Input
                        prefix={<FiMail className="input-field-icon" />}
                        placeholder="Enter your professional email"
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
                        {
                          min: 8,
                          message: "Password must be at least 8 characters long",
                        },
                        {
                          pattern: /^[a-zA-Z0-9!@#$%^&*]{8,30}$/,
                          message: "Create a strong password",
                        },
                      ]}
                    >
                      <Input.Password
                        prefix={<FiLock className="input-field-icon" />}
                        placeholder="Choose a strong password"
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
                        onClick={handleNextStep}
                        loading={isCheckingAvailability}
                        className="submit-register-button"
                        block
                      >
                        {isCheckingAvailability ? "Verifying Credentials..." : "Next: Business Profile"}
                        {!isCheckingAvailability && <FiArrowRight className="btn-arrow-icon" />}
                      </Button>
                    </Form.Item>
                  </motion.div>
                </div>

                <div style={{ display: step === 2 ? "block" : "none" }}>
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={step === 2 ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Back button */}
                    <button 
                      type="button" 
                      className="back-step-btn"
                      onClick={() => setStep(1)}
                    >
                      <FiArrowLeft className="back-arrow-icon" /> Back to Account Credentials
                    </button>

                    {/* Side-by-side Contact Name (First Name & Last Name) */}
                    <div className="form-row-grid">
                      <Form.Item
                        label="First Name"
                        name="firstName"
                        required
                        validateTrigger={["onBlur", "onChange"]}
                        rules={[
                          {
                            required: true,
                            message: "First name is required",
                          },
                        ]}
                      >
                        <Input
                          prefix={<FiUser className="input-field-icon" />}
                          placeholder="John"
                          size="large"
                        />
                      </Form.Item>

                      <Form.Item
                        label="Last Name"
                        name="lastName"
                        required
                        validateTrigger={["onBlur", "onChange"]}
                        rules={[
                          {
                            required: true,
                            message: "Last name is required",
                          },
                        ]}
                      >
                        <Input
                          prefix={<FiUser className="input-field-icon" />}
                          placeholder="Doe"
                          size="large"
                        />
                      </Form.Item>
                    </div>

                    {/* Phone Number with Country Code Dropdown */}
                    <Form.Item label="Phone Number" required style={{ marginBottom: '24px' }}>
                      <div className="phone-input-group" style={{ display: 'flex', gap: '8px' }}>
                        <Form.Item
                          name="phoneCode"
                          noStyle
                          initialValue="+91"
                        >
                          <Select 
                            showSearch
                            size="large" 
                            className="phone-code-select" 
                            style={{ width: '120px' }}
                            optionFilterProp="children"
                          >
                            {phoneCodesList.map((pc) => (
                              <Select.Option key={`${pc.country}-${pc.code}`} value={pc.code}>
                                {pc.code} ({pc.country})
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>
                        <Form.Item
                          name="phone"
                          noStyle
                          rules={[
                            {
                              required: true,
                              message: "Phone number is required",
                            },
                          ]}
                        >
                          <Input
                            prefix={<FiPhone className="input-field-icon" />}
                            placeholder="98765 43210"
                            size="large"
                            style={{ flex: 1 }}
                          />
                        </Form.Item>
                      </div>
                    </Form.Item>

                    {/* Industry Sector Dropdown */}
                    <Form.Item
                      label="Industry Sector"
                      name="industry"
                      required
                      validateTrigger={["onBlur", "onChange"]}
                      rules={[
                        {
                          required: true,
                          message: "Industry sector is required",
                        },
                      ]}
                    >
                      <Select
                        showSearch
                        placeholder="Select your industry sector"
                        size="large"
                        onChange={(val) => {
                          setSelectedIndustry(val);
                          form.setFieldsValue({ industry: val });
                        }}
                        className="compact-select-redesign"
                        suffixIcon={<FiBriefcase className="input-field-icon-select" />}
                        optionFilterProp="children"
                      >
                        {industriesList.map((ind) => (
                          <Select.Option key={ind} value={ind}>{ind}</Select.Option>
                        ))}
                        <Select.Option value="Other">Other (Please Specify)</Select.Option>
                      </Select>
                    </Form.Item>

                    {/* Custom Industry Input (revealed dynamically) */}
                    <AnimatePresence>
                      {selectedIndustry === "Other" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                          animate={{ opacity: 1, height: "auto", marginBottom: 14 }}
                          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                          transition={{ duration: 0.2 }}
                          style={{ overflow: "hidden" }}
                        >
                          <Form.Item
                            label="Specify Industry Name"
                            name="customIndustry"
                            required
                            validateTrigger={["onBlur", "onChange"]}
                            rules={[
                              {
                                required: true,
                                message: "Please specify your industry",
                              },
                            ]}
                          >
                            <Input
                              prefix={<FiBriefcase className="input-field-icon" />}
                              placeholder="Enter your custom industry sector"
                              size="large"
                            />
                          </Form.Item>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* GSTIN (Optional) */}
                    <Form.Item
                      label="GSTIN / Business Tax ID (Optional)"
                      name="gstIn"
                      validateTrigger={["onBlur", "onChange"]}
                    >
                      <Input
                        prefix={<FiHash className="input-field-icon" />}
                        placeholder="24AAAAA1111A1Z1"
                        size="large"
                      />
                    </Form.Item>

                    {/* Side-by-side City & Website */}
                    <div className="form-row-grid">
                      <Form.Item
                        label="City"
                        name="city"
                        required
                        validateTrigger={["onBlur", "onChange"]}
                        rules={[
                          {
                            required: true,
                            message: "City is required",
                          },
                        ]}
                      >
                        <Select
                          showSearch
                          placeholder="Select city"
                          size="large"
                          onChange={(val) => {
                            setSelectedCity(val);
                            form.setFieldsValue({ city: val });
                          }}
                          className="compact-select-redesign"
                          suffixIcon={<FiMapPin className="input-field-icon-select" />}
                          optionFilterProp="children"
                        >
                          {allCitiesList.map((city) => (
                            <Select.Option key={city} value={city}>{city}</Select.Option>
                          ))}
                          <Select.Option value="Other">Other (Please Specify)</Select.Option>
                        </Select>
                      </Form.Item>

                      <Form.Item
                        label="Business Website (Optional)"
                        name="website"
                        validateTrigger={["onBlur", "onChange"]}
                      >
                        <Input
                          prefix={<FiGlobe className="input-field-icon" />}
                          placeholder="www.grewox.com"
                          size="large"
                        />
                      </Form.Item>
                    </div>

                    {/* Custom City Input (revealed dynamically) */}
                    <AnimatePresence>
                      {selectedCity === "Other" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                          animate={{ opacity: 1, height: "auto", marginBottom: 14 }}
                          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                          transition={{ duration: 0.2 }}
                          style={{ overflow: "hidden" }}
                        >
                          <Form.Item
                            label="Specify City Name"
                            name="customCity"
                            required
                            validateTrigger={["onBlur", "onChange"]}
                            rules={[
                              {
                                required: true,
                                message: "Please specify your city name",
                              },
                            ]}
                          >
                            <Input
                              prefix={<FiMapPin className="input-field-icon" />}
                              placeholder="Enter your custom city name"
                              size="large"
                            />
                          </Form.Item>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Form.Item className="submit-form-item">
                      <Button
                        type="primary"
                        onClick={handleRegister}
                        loading={isLoading}
                        className="submit-register-button"
                        block
                      >
                        {isLoading ? "Initializing Workspace..." : "Complete Setup & Launch"}
                        {!isLoading && <FiArrowRight className="btn-arrow-icon" />}
                      </Button>
                    </Form.Item>
                  </motion.div>
                </div>
              </Form>
            </motion.div>

            <motion.div 
              className="login-redirect-area"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <p>
                Already have an account?{" "}
                <Link to="/login" className="nav-login-link">
                  Sign In
                </Link>
              </p>
              <p style={{ marginTop: '12px' }}>
                Want to see it in action?{" "}
                <a onClick={() => setIsDemoModalOpen(true)} className="nav-login-link" style={{ cursor: 'pointer', color: '#2563eb', fontWeight: '600' }}>
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
