import React from "react";
import { Card, Avatar, Button, Typography, Tag, Row, Col, Space } from "antd";
import { FiBarChart2, FiCalendar, FiBriefcase, FiUser } from "react-icons/fi";
import { motion } from "framer-motion";

const { Text, Title } = Typography;

const WelcomeSection = ({ user, companyName, showAnalytics, setShowAnalytics }) => {
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    };

    const getRoleOrCompanyDisplay = () => {
        if (!user) return {
            text: "Guest",
            icon: <FiUser />,
            color: "default"
        };

        if (user.roleName?.toLowerCase() === "client") {
            return {
                text: user.companyName || "Company",
                icon: <FiBriefcase />,
                color: "blue"
            };
        }

        return {
            text: user.roleName || "Administrator",
            icon: <FiUser />,
            color: "cyan"
        };
    };

    const roleDisplay = getRoleOrCompanyDisplay();
    const displayName = user?.firstName || user?.username || "User";
    const displayCompany = companyName || "Your Company";
    const displayEmail = user?.email || "no-email";

  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="welcome-section-wrapper"
    >
      <Card className="welcome-card white-label-welcome" bodyStyle={{ padding: 24 }}>
        <Row gutter={[20, 20]} align="middle">
          <Col xs={24} md={15}>
            <Space direction="vertical" size={10} style={{ width: "100%" }}>
              <Space align="center" size={8}>
                <FiCalendar style={{ color: "#64748b" }} />
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </Space>
              <Title level={2} style={{ margin: 0, color: "#0f172a", fontSize: "clamp(24px,4vw,32px)" }}>
                {getGreeting()}, {displayName}
              </Title>
              <Text style={{ color: "#475569", fontSize: 15 }}>
                Welcome to your white-label dashboard. Track pipeline health and take action from one place.
              </Text>
              <Tag color="blue" style={{ width: "fit-content", margin: 0 }}>
                {displayCompany}
              </Tag>
            </Space>
          </Col>

          <Col xs={24} md={9}>
            <div className="white-label-profile-box">
              <div className="white-label-profile-header">
                <Space align="center" size={10} className="white-label-user-meta">
                  <Avatar size={46} src={user?.profilePic} style={{ background: "#1d4ed8" }}>
                    {!user?.profilePic && (user?.firstName?.[0] || "U")}
                  </Avatar>
                  <div className="white-label-user-text" style={{ minWidth: 0 }}>
                    <Text strong style={{ color: "#0f172a", display: "block" }}>
                      {displayName}
                    </Text>
                    <Text
                      type="secondary"
                      className="white-label-user-email"
                      style={{ fontSize: 12, display: "block" }}
                    >
                      {displayEmail}
                    </Text>
                  </div>
                </Space>
                <div className="white-label-role-chip">
                  <span className="white-label-role-icon">{roleDisplay.icon}</span>
                  <span className="white-label-role-text">{roleDisplay.text}</span>
                </div>
              </div>
              <Button
                type="primary"
                icon={<FiBarChart2 />}
                onClick={() => setShowAnalytics(!showAnalytics)}
                className="white-label-cta-btn"
                block
              >
                {showAnalytics ? "View Dashboard" : "View Analytics"}
              </Button>
            </div>
          </Col>
        </Row>
      </Card>
    </motion.div>
  );
};

export default WelcomeSection; 