import React from 'react';
import { Row, Col, Card, Typography, Breadcrumb } from 'antd';
import { motion } from 'framer-motion';
import {
    FiUsers,
    FiDollarSign,
    FiHome,
    FiCreditCard,
} from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '../../../auth/services/authSlice';
import { Link } from 'react-router-dom';
import { useGetAllCompaniesQuery } from '../company/services/companyApi';
import { useGetAllPlansQuery } from '../plans/services/planApi';
import { useGetAllSubscribedUsersQuery } from '../SubscribedUser/services/SubscribedUserApi';
import CountUp from 'react-countup';
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
    const { data: companiesData } = useGetAllCompaniesQuery();
    const { data: plansData } = useGetAllPlansQuery({ page: 1, limit: 100 });
    const { data: subscribedUsersData } = useGetAllSubscribedUsersQuery();

    // Calculate statistics
    const totalClients = companiesData?.data?.length || 0;
    const activeSubscriptions = subscribedUsersData?.data?.filter(sub =>
        sub.status === 'active'
    ).length || 0;

    const totalRevenue = subscribedUsersData?.data?.reduce((total, sub) => {
        if (sub.status === 'active' && sub.payment_status === 'paid') {
            const plan = plansData?.data?.find(p => p.id === sub.plan_id);
            return total + Number(plan?.price || 0);
        }
        return total;
    }, 0) || 0;

    const mostPurchasedPlan = plansData?.data?.[0]?.name || 'Basic';

    const statsCards = [
        {
            title: 'Total Companies',
            value: totalClients,
            description: 'Total registered clients',
            icon: <FiUsers />,
            iconGradient: 'linear-gradient(135deg, #1890ff, #096dd9)',
            color: '#1890ff',
            tag: `Paid Users: ${activeSubscriptions}`
        },
        {
            title: 'Total Plans',
            value: plansData?.data?.length || 0,
            description: 'Available subscription plans',
            icon: <FiCreditCard />,
            iconGradient: 'linear-gradient(135deg, #722ed1, #531dab)',
            color: '#722ed1',
            tag: `Most Purchase Plan: ${mostPurchasedPlan}`
        },
        {
            title: 'Total Revenue',
            value: totalRevenue,
            description: 'Revenue from active subscriptions',
            icon: <FiDollarSign />,
            iconGradient: 'linear-gradient(135deg, #52c41a, #389e0d)',
            color: '#52c41a',
            tag: `Total Order Amount: ₹${totalRevenue.toLocaleString()}`
        },
    ];

    return (
        <motion.div
            className="dashboard-container"
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

            <div className="overview-header">
                <h1>Overview</h1>
                <p>Welcome back! Super Admin</p>
            </div>

            <Row gutter={[24, 24]}>
                {statsCards.map((card, index) => (
                    <Col xs={24} lg={8} key={index}>
                        <motion.div variants={fadeInUp}>
                            <Card className="stats-card">
                                <div className="stats-content">
                                    <div className="stats-header">
                                        <div
                                            className="icon-wrapper"
                                            style={{ background: card.iconGradient }}
                                        >
                                            {card.icon}
                                        </div>
                                        <div
                                            className="tag-wrapper"
                                            style={{ color: card.color }}
                                        >
                                            {card.tag}
                                        </div>
                                    </div>
                                    <div className="stats-info">
                                        <h3>{card.title}</h3>
                                        <div className="stats-value" style={{ color: card.color }}>
                                            {card.title === 'Total Revenue' && '₹'}
                                            <CountUp
                                                start={0}
                                                end={card.value}
                                                duration={2}
                                                separator=","
                                                decimal="."
                                                decimals={card.title === 'Total Revenue' ? 2 : 0}
                                            />
                                        </div>
                                        <p>{card.description}</p>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    </Col>
                ))}
            </Row>
        </motion.div>
    );
};

export default SuperAdminDashboard;
