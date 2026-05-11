import React from 'react';
import { Card, Col, Typography } from 'antd';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import './StatCard.scss';

const { Text } = Typography;

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
};

/**
 * Reusable StatCard Component
 * @param {ReactNode} icon - Icon to display
 * @param {string} title - Card title
 * @param {number|string} value - Value to display (supports CountUp for numbers)
 * @param {string} subtitle - Secondary text below value
 * @param {string} tag - Small tag text in header
 * @param {string} color - Primary color for text/tag
 * @param {string} gradient - Background gradient for icon wrapper
 * @param {boolean} isNumeric - Whether to use CountUp animation
 */
const StatCard = ({ 
    icon, 
    title, 
    value, 
    subtitle, 
    tag, 
    color, 
    gradient, 
    isNumeric = true,
    prefix = '',
    decimals = 0,
    colSpan = { xs: 24, md: 12, lg: 8 }
}) => (
    <Col {...colSpan}>
        <motion.div variants={fadeInUp} initial="initial" animate="animate" className="custom-stat-wrapper">
            <Card className="custom-stat-card">
                <div className="stat-card-content">
                    <div className="stat-card-header">
                        <div className="stat-icon-wrapper" style={{ background: gradient }}>
                            {icon}
                        </div>
                        {tag && (
                            <div className="stat-tag-wrapper" style={{ color: color }}>
                                {tag}
                            </div>
                        )}
                    </div>
                    <div className="stat-card-info">
                        <h3 className="stat-title">{title}</h3>
                        <div className="stat-value" style={{ color: color, fontSize: typeof value === 'string' && value.length > 10 ? '20px' : '24px' }}>
                            {isNumeric && typeof value === 'number' ? (
                                <>
                                    {prefix}
                                    <CountUp start={0} end={value} duration={2} separator="," decimals={decimals} />
                                </>
                            ) : (
                                <>{prefix}{value}</>
                            )}
                        </div>
                        {subtitle && <p className="stat-subtitle">{subtitle}</p>}
                    </div>
                </div>
            </Card>
        </motion.div>
    </Col>
);

export default StatCard;
