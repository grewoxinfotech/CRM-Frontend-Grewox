import React from "react";
import { Col, Card, Typography } from "antd";
import { motion } from "framer-motion";
import CountUp from 'react-countup';
import { Link } from "react-router-dom";

const { Text } = Typography;

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
};

const iconBgMap = {
    Customers: "#e0e7ff",
    Leads: "#fce7f3",
    Deals: "#dbeafe",
    "TOTAL REVENUE": "#dcfce7",
};

const StatsCards = ({ stats }) => {
    return (
        <>
            {stats.map((stat, index) => (
                <Col xs={24} sm={12} lg={6} key={index}>
                    <motion.div variants={fadeInUp}>
                        <Link to={stat.link}>
                            <Card
                                className="stats-card"
                                style={{
                                    background: "#ffffff",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: '14px',
                                    height: '154px',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                                bodyStyle={{
                                    padding: '18px',
                                    height: '100%',
                                    position: 'relative',
                                    zIndex: 1
                                }}
                                hoverable
                            >
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    height: '100%',
                                    justifyContent: 'space-between'
                                }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}>
                                        <div style={{
                                            background: iconBgMap[stat.title] || "#eff6ff",
                                            width: '42px',
                                            height: '42px',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: "1px solid #dbeafe"
                                        }}>
                                            <span style={{ color: '#1d4ed8', fontSize: '20px' }}>
                                                {stat.icon}
                                            </span>
                                        </div>
                                        <div>
                                            <Text style={{
                                                fontSize: '15px',
                                                color: '#0f172a',
                                                fontWeight: '500',
                                                display: 'block'
                                            }}>
                                                {stat.title}
                                            </Text>
                                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                                {stat.tag}
                                            </Text>
                                        </div>
                                    </div>

                                    <div>
                                        <div style={{
                                            fontSize: '30px',
                                            fontWeight: '700',
                                            color: '#0f172a',
                                            marginBottom: '4px',
                                            lineHeight: '1',
                                            letterSpacing: '-0.02em'
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
                                        </div>
                                        <Text type="secondary" style={{ fontSize: '13px', display: 'block' }}>
                                            {stat.description}
                                        </Text>
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