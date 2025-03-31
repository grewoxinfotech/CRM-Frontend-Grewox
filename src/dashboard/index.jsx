import React from "react";
import {
  Avatar,
  Card,
  Row,
  Col,
  Button,
  Typography,
  Statistic,
  Progress,
  Timeline,
  Tag,
  Divider,
} from "antd";
import {
  FiUsers,
  FiDollarSign,
  FiBarChart2,
  FiCheckCircle,
  FiClock,
  FiCalendar,
  FiBriefcase,
  FiTrendingUp,
  FiBox,
} from "react-icons/fi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../auth/services/authSlice";
import "./dashboard.scss";
import { motion } from "framer-motion";

const { Title, Text } = Typography;

export default function Dashboard() {
  const user = useSelector(selectCurrentUser);
  const companyName = "Grewox Software"; // You can get this from your config or user data

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const stats = [
    {
      title: "Total Clients",
      value: 156,
      icon: <FiUsers />,
      trend: "+12%",
      color: "#1890ff",
    },
    {
      title: "Total Revenue",
      value: "$45,678",
      icon: <FiDollarSign />,
      trend: "+8%",
      color: "#52c41a",
    },
    {
      title: "Active Projects",
      value: 24,
      icon: <FiBriefcase />,
      trend: "+5%",
      color: "#722ed1",
    },
    {
      title: "Completion Rate",
      value: "92%",
      icon: <FiCheckCircle />,
      trend: "+3%",
      color: "#13c2c2",
    },
  ];

  const recentActivities = [
    {
      title: "New client project started",
      time: "2 hours ago",
      type: "success",
    },
    {
      title: "Meeting with development team",
      time: "3 hours ago",
      type: "process",
    },
    {
      title: "Project proposal approved",
      time: "5 hours ago",
      type: "success",
    },
    {
      title: "New feature deployment",
      time: "1 day ago",
      type: "process",
    },
  ];

  const upcomingTasks = [
    {
      title: "Client Meeting",
      time: "Today, 2:00 PM",
      priority: "high",
    },
    {
      title: "Project Review",
      time: "Tomorrow, 10:00 AM",
      priority: "medium",
    },
    {
      title: "Team Sync",
      time: "Wed, 11:00 AM",
      priority: "low",
    },
  ];

  return (
    <div className="dashboard-container">
      <Row gutter={[24, 24]}>
        {/* Welcome Section */}
        <Col span={24}>
          <Card className="welcome-card">
            <Row align="middle" justify="space-between" gutter={[24, 24]}>
              <Col xs={24} md={16}>
                <div className="welcome-header">
                  <div className="company-brand">
                    <div className="logo-container">
                      <FiBox className="company-logo" />
                    </div>
                    <div className="brand-text">
                      <motion.div
                        className="company-name-wrapper"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <Text className="company-name">GREWOX</Text>
                        <div className="company-type">
                          <Text className="type-text">ENTERPRISE SOLUTIONS</Text>
                          <div className="type-line"></div>
                        </div>
                      </motion.div>
                      <Text className="company-tagline">Transforming Business Through Technology</Text>
                    </div>
                  </div>
                  <Title level={2}>{getGreeting()}, {user?.firstName || user?.username}!</Title>
                  <Text className="welcome-subtitle">
                    Welcome back to your enterprise dashboard.
                  </Text>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div className="user-welcome">
                  <div className="user-profile">
                    <Avatar
                      size={64}
                      src={user?.profilePic}
                      style={{
                        background: "linear-gradient(135deg, #4096ff 0%, #1677ff 100%)",
                        color: "#ffffff",
                        border: "4px solid rgba(64, 150, 255, 0.1)",
                        boxShadow: "0 8px 16px rgba(22, 119, 255, 0.15)"
                      }}
                    >
                      {!user?.profilePic && getInitials(user?.firstName + " " + user?.lastName)}
                    </Avatar>
                    <div className="user-info">
                      <Text strong className="user-role">{user?.roleName || "Administrator"}</Text>
                      <Text className="user-email">{user?.email}</Text>
                    </div>
                  </div>
                  <Button
                    type="primary"
                    icon={<FiBarChart2 />}
                    className="analytics-btn"
                    style={{
                      background: "linear-gradient(135deg, #4096ff 0%, #1677ff 100%)",
                      color: "#ffffff",
                      border: "none",
                    }}
                  >
                    View Analytics
                  </Button>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Stats Cards */}
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card className="stat-card" bordered={false}>
              <div className="stat-content">
                <div className="stat-header">
                  <div className="stat-icon" style={{ backgroundColor: stat.color }}>
                    {stat.icon}
                  </div>
                  <div className="stat-trend">
                    <FiTrendingUp /> {stat.trend}
                  </div>
                </div>
                <div className="stat-info">
                  <Text className="stat-title">{stat.title}</Text>
                  <Title level={3} className="stat-value">{stat.value}</Title>
                </div>
              </div>
            </Card>
          </Col>
        ))}

        {/* Project Progress */}
        <Col xs={24} lg={16}>
          <Card title="Project Progress" className="progress-card" extra={
            <Button type="text" icon={<FiBarChart2 />}>View All</Button>
          }>
            <Row gutter={[24, 24]}>
              <Col span={12}>
                <div className="progress-item">
                  <div className="progress-header">
                    <Text>Website Redesign</Text>
                    <Text type="secondary">75%</Text>
                  </div>
                  <Progress percent={75} strokeColor="#1890ff" />
                </div>
              </Col>
              <Col span={12}>
                <div className="progress-item">
                  <div className="progress-header">
                    <Text>Mobile App Development</Text>
                    <Text type="secondary">60%</Text>
                  </div>
                  <Progress percent={60} strokeColor="#52c41a" />
                </div>
              </Col>
              <Col span={12}>
                <div className="progress-item">
                  <div className="progress-header">
                    <Text>Database Migration</Text>
                    <Text type="secondary">45%</Text>
                  </div>
                  <Progress percent={45} strokeColor="#722ed1" />
                </div>
              </Col>
              <Col span={12}>
                <div className="progress-item">
                  <div className="progress-header">
                    <Text>API Integration</Text>
                    <Text type="secondary">90%</Text>
                  </div>
                  <Progress percent={90} strokeColor="#13c2c2" />
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Recent Activities */}
        <Col xs={24} lg={8}>
          <Card title="Recent Activities" className="activities-card">
            <Timeline>
              {recentActivities.map((activity, index) => (
                <Timeline.Item key={index} color={activity.type === 'success' ? 'green' : 'blue'}>
                  <div className="activity-item">
                    <Text strong>{activity.title}</Text>
                    <Text type="secondary">{activity.time}</Text>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </Card>
        </Col>

        {/* Upcoming Tasks */}
        <Col xs={24} lg={12}>
          <Card title="Upcoming Tasks" className="tasks-card">
            {upcomingTasks.map((task, index) => (
              <div key={index} className="task-item">
                <div className="task-info">
                  <Text strong>{task.title}</Text>
                  <div className="task-meta">
                    <Tag color={
                      task.priority === 'high' ? 'red' :
                        task.priority === 'medium' ? 'orange' : 'green'
                    }>
                      {task.priority}
                    </Tag>
                    <Text type="secondary">
                      <FiClock style={{ marginRight: 4 }} />
                      {task.time}
                    </Text>
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </Col>

        {/* Calendar Events */}
        <Col xs={24} lg={12}>
          <Card title="Upcoming Events" className="events-card">
            {/* Add calendar events here */}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
