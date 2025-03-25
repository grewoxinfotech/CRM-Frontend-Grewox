import React from 'react';
import { Card, Row, Col, Button, Typography, Space, Badge, Breadcrumb, Dropdown, Menu } from 'antd';
import { motion } from 'framer-motion';
import {
    FiEdit2,
    FiSettings,
    FiUsers,
    FiActivity,
    FiCheckCircle,
    FiServer,
    FiHome,
    FiLogOut,
    FiMoreVertical
} from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../auth/services/authSlice';
import { Link } from 'react-router-dom';
import { useLogout } from '../../../hooks/useLogout';
import './dashboard.scss';

const { Title, Text } = Typography;

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

const SuperAdminDashboard = () => {
    const user = useSelector(selectCurrentUser);
    const handleLogout = useLogout();

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    const getUserFullName = () => {
        if (user?.firstName && user?.lastName) {
            return `${user.firstName} ${user.lastName}`;
        }
        return user?.username || 'User';
    };

    const getRoleName = () => {
        return user?.roleName?.split('-').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ') || 'User Role';
    };

    const statsCards = [
        {
            title: 'Total Users',
            value: '1,234',
            description: 'Active users in the system',
            icon: <FiUsers className="stats-icon" />,
            color: '#2563eb'
        },
        {
            title: 'Active Sessions',
            value: '856',
            description: 'Current active sessions',
            icon: <FiActivity className="stats-icon" />,
            color: '#3b82f6'
        },
        {
            title: 'System Status',
            value: 'Healthy',
            description: 'All systems operational',
            icon: <FiServer className="stats-icon" />,
            color: '#22c55e'
        }
    ];

    const recentActivities = [
        {
            id: 1,
            text: 'System backup completed',
            icon: <FiCheckCircle />,
            time: '2 hours ago'
        },
        {
            id: 2,
            text: 'New user registration',
            icon: <FiUsers />,
            time: '4 hours ago'
        },
        {
            id: 3,
            text: 'Security update installed',
            icon: <FiServer />,
            time: '6 hours ago'
        },
        {
            id: 4,
            text: 'Database optimization complete',
            icon: <FiActivity />,
            time: '8 hours ago'
        }
    ];

    return (
        <motion.div
            className='dashboard-container'
            initial="initial"
            animate="animate"
            variants={staggerContainer}
        >
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/superadmin">
                            <FiHome style={{ marginRight: '4px' }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Dashboard</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <motion.div className="page-header" variants={fadeInUp}>
                <div className="page-title">
                    <Title level={2}>Dashboard</Title>
                    <Text type="secondary">Welcome back to your dashboard</Text>
                </div>
            </motion.div>

            <Row gutter={[24, 24]}>
                {statsCards.map((card, index) => (
                    <Col xs={24} lg={8} key={index}>
                        <motion.div variants={fadeInUp}>
                            <Card
                                className="stats-card"
                                variant={false}
                            >
                                <div className="stats-header">
                                    <div className="icon-wrapper" style={{ backgroundColor: card.color }}>
                                        {card.icon}
                                    </div>
                                    <h3>{card.title}</h3>
                                </div>
                                <h2>{card.value}</h2>
                                <p>{card.description}</p>
                            </Card>
                        </motion.div>
                    </Col>
                ))}
            </Row>

            <Row className="profile-section" gutter={[24, 24]} style={{ marginTop: '2rem' }}>
                <Col xs={24} md={12}>
                    <motion.div variants={fadeInUp}>
                        <Card className="profile-card" variant={false}>
                            <div className="profile-content">
                                <Badge dot status="success" offset={[-5, 85]}>
                                    <motion.div
                                        className="profile-avatar"
                                        whileHover={{ scale: 1.05 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        {user?.profilePic ? (
                                            <img src={user.profilePic} alt={getUserFullName()} />
                                        ) : (
                                            <div className="avatar-initials">
                                                {getInitials(getUserFullName())}
                                            </div>
                                        )}
                                    </motion.div>
                                </Badge>

                                <div className="profile-info">
                                    <Title level={3}>{getUserFullName()}</Title>
                                    <Text type="secondary" className="role-text">{getRoleName()}</Text>

                                    <div className="user-details">
                                        <div className="detail-item">
                                            <Text type="secondary">Email</Text>
                                            <Text strong>{user?.email}</Text>
                                        </div>
                                        <div className="detail-item">
                                            <Text type="secondary">Username</Text>
                                            <Text strong>{user?.username}</Text>
                                        </div>
                                        <div className="detail-item">
                                            <Text type="secondary">Member Since</Text>
                                            <Text strong>{new Date(user?.createdAt).toLocaleDateString()}</Text>
                                        </div>
                                    </div>

                                    <div className="action-buttons">
                                        <Space direction="horizontal" size="middle" className="desktop-buttons">
                                            <Link to="/superadmin/profile">
                                                <Button type="primary" icon={<FiEdit2 />}>
                                                    Edit Profile
                                                </Button>
                                            </Link>
                                            <Button icon={<FiSettings />}>
                                                Settings
                                            </Button>
                                            <Button
                                                danger
                                                icon={<FiLogOut />}
                                                onClick={handleLogout}
                                            >
                                                Logout
                                            </Button>
                                        </Space>
                                        
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </Col>
                <Col xs={24} md={12}>
                    <motion.div variants={fadeInUp}>
                        <Card className="activity-card" title="Recent Activity" variant="default">
                            <ul className="activity-list">
                                {recentActivities.map((activity) => (
                                    <motion.li
                                        key={activity.id}
                                        whileHover={{ x: 5 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <span className="activity-icon">{activity.icon}</span>
                                        <span className="activity-text">{activity.text}</span>
                                        <span className="activity-time">{activity.time}</span>
                                    </motion.li>
                                ))}
                            </ul>
                        </Card>
                    </motion.div>
                </Col>
            </Row>
        </motion.div>
    );
};

export default SuperAdminDashboard;
