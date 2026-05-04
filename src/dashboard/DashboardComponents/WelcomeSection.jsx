import React from "react";
import { Card, Avatar, Button, Typography, Tag, Row, Col, Space } from "antd";
import { FiBarChart2, FiCalendar, FiBriefcase, FiUser, FiActivity } from "react-icons/fi";
import { motion } from "framer-motion";
import "./WelcomeSection.scss";

const { Text, Title } = Typography;

const WelcomeSection = ({ user, companyName, showAnalytics, setShowAnalytics }) => {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    };

    const displayName = user?.firstName || user?.username || "User";
    const displayCompany = companyName || "Grewox Infotech";

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="welcome-section-premium-container"
    >
      <Card className="standard-content-card welcome-premium-card" bodyStyle={{ padding: '16px' }}>
        <Row gutter={[16, 12]} align="middle">
          <Col xs={24} lg={16}>
            <div className="welcome-main-content">
              <Space direction="vertical" size={6}>
                <Space size={8} wrap align="center">
                  <div className="date-badge-pill">
                    <FiCalendar />
                    <span>{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
                  </div>
                  <Tag className="custom-pill-tag blue-pill">
                    <FiUser style={{ marginRight: '4px' }} />
                    {user?.roleName || 'Administrator'}
                  </Tag>
                  <Tag className="custom-pill-tag purple-pill">
                    <FiBriefcase style={{ marginRight: '4px' }} />
                    {displayCompany}
                  </Tag>
                </Space>
                <div className="greeting-text-group" style={{ marginTop: '4px' }}>
                  <Title level={1} style={{ margin: 0, fontSize: "clamp(22px, 3vw, 26px)", fontWeight: 800, letterSpacing: '-0.02em', color: '#0f172a' }}>
                    {getGreeting()}, <span className="highlight-name">{displayName}</span>
                  </Title>
                  <Text style={{ fontSize: '14px', color: '#475569', display: 'block', marginTop: '4px', maxWidth: '650px', lineHeight: 1.5 }}>
                    Welcome back to <strong style={{ color: '#1e293b', fontWeight: 600 }}>{displayCompany}</strong>. Your business performance is looking <span style={{ color: '#10b981', fontWeight: 600, background: 'rgba(16, 185, 129, 0.1)', padding: '0 4px', borderRadius: '4px' }}>healthy</span> today.
                  </Text>
                </div>
              </Space>
            </div>
          </Col>

          <Col xs={24} lg={8}>
            <div className="analytics-cta-container">
               <div className="profile-mini-preview">
                  <Avatar size={44} src={user?.profilePic} style={{ border: '2px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.08)', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                     {!user?.profilePic && (user?.firstName?.[0] || "U")}
                  </Avatar>
                  <div className="profile-info-mini">
                     <Text strong style={{ fontSize: '14px', display: 'block', lineHeight: 1.2, color: '#1e293b' }}>{displayName}</Text>
                     <Text type="secondary" style={{ fontSize: '12px', color: '#64748b' }}>{user?.email || 'no-email'}</Text>
                  </div>
               </div>
               <Button
                type="primary"
                icon={showAnalytics ? <FiActivity /> : <FiBarChart2 />}
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="premium-action-btn"
                style={{ height: '38px', borderRadius: '8px', fontWeight: 600, fontSize: '13px', padding: '0 16px' }}
              >
                {showAnalytics ? "Dashboard" : "Analytics"}
              </Button>
            </div>
          </Col>
        </Row>
      </Card>
    </motion.div>
  );
};

export default WelcomeSection;