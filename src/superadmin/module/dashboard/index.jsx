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
import PageHeader from '../../../components/PageHeader';
import StatCard from '../../../components/StatCard';
import './dashboard.scss';

const { Title, Text } = Typography;

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

    return (
        <motion.div
            className="dashboard-container"
            initial="initial"
            animate="animate"
            variants={{
                animate: { transition: { staggerChildren: 0.1 } }
            }}
        >
            <PageHeader
                title="Overview"
                subtitle="Welcome back! Super Admin"
                breadcrumbItems={[
                    {
                        title: (
                            <Link to="/superadmin">
                                <FiHome style={{ marginRight: '4px' }} />
                                Home
                            </Link>
                        )
                    },
                    { title: 'Dashboard' }
                ]}
            />

            <Row gutter={[12, 12]}>
                <StatCard 
                    icon={<FiUsers />}
                    title="Total Companies"
                    value={totalClients}
                    subtitle="Total registered clients"
                    tag={`Paid Users: ${activeSubscriptions}`}
                    color="#1890ff"
                    gradient="linear-gradient(135deg, #1890ff, #096dd9)"
                />
                <StatCard 
                    icon={<FiCreditCard />}
                    title="Total Plans"
                    value={plansData?.data?.length || 0}
                    subtitle="Available subscription plans"
                    tag={`Most Purchase Plan: ${mostPurchasedPlan}`}
                    color="#722ed1"
                    gradient="linear-gradient(135deg, #722ed1, #531dab)"
                />
                <StatCard 
                    icon={<FiDollarSign />}
                    title="Total Revenue"
                    value={totalRevenue}
                    subtitle="Revenue from active subscriptions"
                    tag={`Total Order Amount: ₹${totalRevenue.toLocaleString()}`}
                    color="#52c41a"
                    gradient="linear-gradient(135deg, #52c41a, #389e0d)"
                    prefix="₹"
                    decimals={2}
                />
            </Row>
        </motion.div>
    );
};

export default SuperAdminDashboard;
