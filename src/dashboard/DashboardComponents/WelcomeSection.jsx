import React from "react";
import { Card, Avatar, Button, Typography, Badge, Tag } from "antd";
import { FiBarChart2, FiClock, FiBriefcase, FiUser } from "react-icons/fi";
import { motion } from "framer-motion";

const { Text } = Typography;

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

    return (
        <motion.div
            initial={{ scale: 0.97, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            <Card
                className="welcome-card"
                bodyStyle={{ padding: '24px' }}
                style={{
                    background: 'linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)',
                    border: '1px solid #e6f4ff',
                    borderRadius: '12px'
                }}
            >
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '24px'
                }}>
                    <div style={{ flex: 1, minWidth: '280px' }}>
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '4px'
                            }}
                        >
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            >
                                <FiClock style={{ color: '#1890ff' }} />
                            </motion.div>
                            <Text type="secondary" style={{ fontSize: '13px' }}>
                                {new Date().toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </Text>
                        </motion.div>
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                            style={{ marginBottom: '8px' }}
                        >
                            <Text style={{
                                fontSize: '28px',
                                fontWeight: '600',
                                background: 'linear-gradient(90deg, #1890ff, #69c0ff)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                display: 'block'
                            }}>
                                {getGreeting()}, {user?.firstName || user?.username}!
                            </Text>
                        </motion.div>
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.4, delay: 0.4 }}
                        >
                            <Text type="secondary" style={{ fontSize: '14px' }}>
                                Welcome back to your enterprise dashboard.
                            </Text>
                        </motion.div>
                    </div>

                    <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ duration: 0.4, delay: 0.5 }}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px'
                        }}
                    >
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                background: '#fff',
                                padding: '8px 16px',
                                borderRadius: '12px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                                border: '1px solid #f0f0f0'
                            }}
                        >
                            <Badge dot color="#52c41a" offset={[-4, 4]}>
                                <Avatar
                                    size={44}
                                    src={user?.profilePic}
                                    style={{
                                        background: "linear-gradient(135deg, #1890ff 0%, #69c0ff 100%)",
                                        border: "2px solid #fff"
                                    }}
                                >
                                    {!user?.profilePic && (user?.firstName?.[0] || 'U')}
                                </Avatar>
                            </Badge>
                            <div>
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.3, delay: 0.6 }}
                                    style={{ marginBottom: '4px' }}
                                >
                                    <Tag
                                        icon={roleDisplay.icon}
                                        color={roleDisplay.color}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '4px',
                                            padding: '2px 8px',
                                            borderRadius: '6px',
                                            fontSize: '13px',
                                            lineHeight: '20px',
                                            margin: 0
                                        }}
                                    >
                                        {roleDisplay.text}
                                    </Tag>
                                </motion.div>
                                <motion.div
                                    initial={{ y: 5, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ duration: 0.3, delay: 0.7 }}
                                >
                                    <Text type="secondary" style={{
                                        fontSize: '12px',
                                        display: 'block'
                                    }}>
                                        {user?.email}
                                    </Text>
                                </motion.div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.4, delay: 0.8 }}
                            style={{ display: 'flex', gap: '8px' }}
                        >
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button
                                    type="primary"
                                    icon={<FiBarChart2 />}
                                    onClick={() => setShowAnalytics(!showAnalytics)}
                                    style={{
                                        background: showAnalytics ? '#52c41a' : 'linear-gradient(135deg, #1890ff 0%, #69c0ff 100%)',
                                        border: 'none',
                                        height: '40px',
                                        borderRadius: '8px',
                                        boxShadow: '0 2px 8px rgba(24, 144, 255, 0.15)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}
                                >
                                    {showAnalytics ? 'View Dashboard' : 'Analytics'}
                                </Button>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                </div>
            </Card>
        </motion.div>
    );
};

export default WelcomeSection; 