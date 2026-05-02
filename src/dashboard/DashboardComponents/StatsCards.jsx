import React from "react";
import { Col, Card, Typography, Space, Tag } from "antd";
import { motion } from "framer-motion";
import CountUp from 'react-countup';
import { Link } from "react-router-dom";
import { FiTrendingUp } from "react-icons/fi";

const { Text, Title } = Typography;

const iconBgMap = {
    Customers: "linear-gradient(135deg, #6366f1, #818cf8)",
    Leads: "linear-gradient(135deg, #ec4899, #f472b6)",
    Deals: "linear-gradient(135deg, #3b82f6, #60a5fa)",
    "TOTAL REVENUE": "linear-gradient(135deg, #10b981, #34d399)",
};

const StatsCards = ({ stats }) => {
    return (
        <>
            {stats.map((stat, index) => (
                <Col xs={24} sm={12} lg={6} key={index}>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                    >
                        <Link to={stat.link}>
                            <Card
                                className="standard-content-card stat-premium-card"
                                bodyStyle={{ padding: '12px 16px' }}
                                hoverable
                            >
                                <div className="stat-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div className="stat-icon-wrapper" style={{ background: iconBgMap[stat.title] || "linear-gradient(135deg, #64748b, #94a3b8)", width: '32px', height: '32px', borderRadius: '8px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: '16px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>
                                        {stat.icon}
                                    </div>
                                    <div className="stat-trend-mini" style={{ display: 'flex', alignItems: 'center', gap: '4px', background: stat.color ? `${stat.color}1A` : 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '6px' }}>
                                        <FiTrendingUp style={{ color: stat.color || '#10b981', fontSize: '12px' }} />
                                        <span style={{ color: stat.color || '#10b981', fontWeight: 700, fontSize: '11px' }}>+12%</span>
                                    </div>
                                </div>
                                
                                <div className="stat-card-body" style={{ marginTop: '8px' }}>
                                    <Text style={{ fontSize: '12px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        {stat.title}
                                    </Text>
                                    <div className="stat-value-display" style={{ marginTop: '0px' }}>
                                        <Title level={2} style={{
                                            margin: 0,
                                            fontWeight: 800,
                                            letterSpacing: '-0.02em',
                                            fontSize: '26px',
                                            background: iconBgMap[stat.title] || '#0f172a',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            display: 'inline-block',
                                            lineHeight: '1.2'
                                        }}>
                                            <CountUp
                                                start={0}
                                                end={stat.value}
                                                duration={2}
                                                separator=","
                                                decimal="."
                                                decimals={stat.format === 'currency' ? 2 : 0}
                                                prefix={stat.format === 'currency' ? stat.currencySymbol : ''}
                                            />
                                        </Title>
                                    </div>
                                    <div className="stat-card-footer" style={{ marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text type="secondary" style={{ fontSize: '13px', fontWeight: 500 }}>{stat.description}</Text>
                                        <Tag style={{ border: 'none', background: stat.color ? `${stat.color}1A` : '#f1f5f9', color: stat.color || '#64748b', fontSize: '12px', borderRadius: '6px', padding: '2px 8px', lineHeight: '18px', fontWeight: 700 }}>{stat.tag}</Tag>
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    </motion.div>
                </Col>
            ))}
        </>
    );
};

export default StatsCards;