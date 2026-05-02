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
              <Space direction="vertical" size={8}>
                <div className="date-badge-pill">
                  <FiCalendar />
                  <span>{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
                </div>
                <div className="greeting-text-group">
                  <Title level={1} style={{ margin: 0, fontSize: "clamp(20px, 3vw, 24px)", fontWeight: 800, letterSpacing: '-0.02em', color: '#1e293b' }}>
                    {getGreeting()}, <span className="highlight-name">{displayName}</span>
                  </Title>
                  <Text style={{ fontSize: '13px', color: '#64748b', display: 'block', marginTop: '2px', maxWidth: '600px' }}>
                    Welcome back to {displayCompany}. Your business performance is looking <span style={{ color: '#10b981', fontWeight: 600 }}>healthy</span> today.
                  </Text>
                </div>
                <Space size={6}>
                   <Tag color="blue" style={{ borderRadius: '4px', padding: '1px 8px', fontWeight: 600, fontSize: '11px' }}>{user?.roleName || 'Administrator'}</Tag>
                   <Tag color="purple" style={{ borderRadius: '4px', padding: '1px 8px', fontWeight: 600, fontSize: '11px' }}>{displayCompany}</Tag>
                </Space>
              </Space>
            </div>
          </Col>

          <Col xs={24} lg={8}>
            <div className="analytics-cta-container">
               <div className="profile-mini-preview">
                  <Avatar size={40} src={user?.profilePic} style={{ border: '2px solid #fff', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                     {!user?.profilePic && (user?.firstName?.[0] || "U")}
                  </Avatar>
                  <div className="profile-info-mini">
                     <Text strong style={{ fontSize: '14px', display: 'block', lineHeight: 1.2 }}>{displayName}</Text>
                     <Text type="secondary" style={{ fontSize: '11px' }}>{user?.email || 'no-email'}</Text>
                  </div>
               </div>
               <Button
                type="primary"
                icon={showAnalytics ? <FiActivity /> : <FiBarChart2 />}
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="premium-action-btn"
                block
                style={{ height: '36px', borderRadius: '6px', fontWeight: 600, marginTop: '12px', fontSize: '13px' }}
              >
                {showAnalytics ? "Return to Dashboard" : "View Analytics"}
              </Button>
            </div>
          </Col>
        </Row>
      </Card>
    </motion.div>
  );
};

export default WelcomeSection;