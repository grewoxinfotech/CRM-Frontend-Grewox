import React, { useEffect, useState } from "react";
import { Row, Col, Card, Tag, Typography } from "antd";
import { FiDollarSign, FiTarget, FiFileText, FiUsers, FiBarChart2 } from "react-icons/fi";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "../auth/services/authSlice";
import "./dashboard.scss";
import { motion } from "framer-motion";
import { useGetAllCurrenciesQuery } from "./module/settings/services/settingsApi";
import { useGetAllTasksQuery } from "./module/crm/task/services/taskApi";
import { useGetLeadsQuery } from "./module/crm/lead/services/LeadApi";
import { useGetDealsQuery } from "./module/crm/deal/services/dealApi";
import { useGetStatusesQuery } from "./module/crm/crmsystem/souce/services/SourceApi";
import { useNavigate } from "react-router-dom";
import { useGetLeadStagesQuery } from "./module/crm/crmsystem/leadstage/services/leadStageApi";
import { useGetMeetingsQuery } from "./module/hrm/Meeting/services/meetingApi";
import WelcomeSection from "./DashboardComponents/WelcomeSection";
import StatsCards from "./DashboardComponents/StatsCards";
import LeadsTable from "./DashboardComponents/LeadsTable";
import DealsTable from "./DashboardComponents/DealsTable";
import TasksTable from "./DashboardComponents/TasksTable";
import MeetingsTable from './DashboardComponents/MeetingsTable';
import Analytics from "./DashboardComponents/Analytics/index.jsx";
import { useGetRevenueQuery } from "./module/sales/revenue/services/revenueApi";


const { Text } = Typography;

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const id = user?.client_id;
  const companyName = "Grewox Software";
  const { data: currencies } = useGetAllCurrenciesQuery();
  const { data: tasksData, isLoading: tasksLoading } = useGetAllTasksQuery(id);
  const { data: leadsData } = useGetLeadsQuery();
  const { data: statusesData } = useGetStatusesQuery(user?.id);
  const { data: stagesData } = useGetLeadStagesQuery(user?.id);
  const { data: meetings, isLoading: meetingsLoading } = useGetMeetingsQuery();
  const [leadsDateFilter, setLeadsDateFilter] = useState('all');
  const { data: deal } = useGetDealsQuery();
  const dealsData = deal || [];
  const [dealsDateFilter, setDealsDateFilter] = useState('all');
  const [tasksDateFilter, setTasksDateFilter] = useState('all');
  const [meetingsDateFilter, setMeetingsDateFilter] = useState('all');
  const [showAnalytics, setShowAnalytics] = useState(false);

  const { data: revenueData } = useGetRevenueQuery();

  // Calculate real revenue data
  const calculateRevenue = () => {
    if (!revenueData?.data) return { total: 0, pending: 0 };

    const total = revenueData.data.reduce((sum, rev) => sum + (Number(rev.amount) || 0), 0);
    const pending = revenueData.data
      .filter(rev => rev.status?.toLowerCase() === 'pending')
      .reduce((sum, rev) => sum + (Number(rev.amount) || 0), 0);

    return { total, pending };
  };

  const { total: totalRevenue, pending: openRevenue } = calculateRevenue();

  useEffect(() => {
    // Remove the existing useEffect since we're using dummy data
  }, []);

  const openLeads = leadsData?.data ? leadsData.data.filter(lead =>
    lead.status && lead.status.toLowerCase() !== 'closed'
  ).length : 0;

  const openDeals = dealsData ? dealsData.filter(deal =>
    deal.status && deal.status.toLowerCase() !== 'closed'
  ).length : 0;

  // Add this after other useEffect hooks
  const getActiveCustomersCount = () => {
    if (!revenueData?.data) return 0;

    // Get unique customer IDs from invoices
    const uniqueCustomers = new Set(
      revenueData.data.map(invoice => invoice.customer)
    );

    return uniqueCustomers.size;
  };

  const activeCustomers = getActiveCustomersCount();

  const stats = [
    {
      title: "Customers",
      value: activeCustomers,
      description: "Active customers",
      icon: <FiUsers className="stats-icon" />,
      gradient: "linear-gradient(145deg, #ffffff, #f0f2ff)",
      iconGradient: "linear-gradient(135deg, #7c3aed, #a78bfa)",
      color: "#7c3aed",
      tag: `Total customers with orders: ${activeCustomers}`,
      link: "/dashboard/crm/companies"
    },
    {
      title: "Leads",
      value: openLeads,
      description: "Active leads in pipeline",
      icon: <FiTarget className="stats-icon" />,
      gradient: "linear-gradient(145deg, #ffffff, #fff0f6)",
      iconGradient: "linear-gradient(135deg, #eb2f96, #ff85c0)",
      color: "#eb2f96",
      tag: `Total: ${leadsData?.data?.length || 0}`,
      link: "/dashboard/crm/lead"
    },
    {
      title: "Deals",
      value: openDeals,
      description: "Active deals in pipeline",
      icon: <FiFileText className="stats-icon" />,
      gradient: "linear-gradient(145deg, #ffffff, #f0f7ff)",
      iconGradient: "linear-gradient(135deg, #1890ff, #69c0ff)",
      color: "#1890ff",
      tag: `Total: ${deal?.data?.length || 0}`,
      link: "/dashboard/crm/deal"
    },
    {
      title: "TOTAL REVENUE",
      value: totalRevenue,
      description: "Total revenue",
      currencySymbol: '₹',
      icon: <FiDollarSign className="stats-icon" />,
      gradient: "linear-gradient(145deg, #ffffff, #f0fff4)",
      iconGradient: "linear-gradient(135deg, #52c41a, #95de64)",
      color: "#52c41a",
      tag: `Profit: ₹10`,
      link: "/dashboard/sales/revenue",
      format: "currency"
    }
  ];

  return (
    <motion.div className="dashboard-container" initial="initial" animate="animate" variants={staggerContainer}>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <WelcomeSection
            user={user}
            companyName={companyName}
            showAnalytics={showAnalytics}
            setShowAnalytics={setShowAnalytics}
          />
        </Col>

        <StatsCards stats={stats} />

        {showAnalytics ? (
          <Col span={24}>
            <Analytics
              deals={dealsData}
              leads={leadsData?.data}
              tasks={tasksData?.data}
              meetings={meetings?.data}
            />
          </Col>
        ) : (
          <>
            <Col xs={24} lg={12}>
              <LeadsTable
                leads={leadsData?.data}
                loading={!leadsData}
                currencies={currencies}
                statusesData={statusesData?.data}
                dateFilter={leadsDateFilter}
                setDateFilter={setLeadsDateFilter}
                navigate={navigate}
              />
            </Col>

            <Col xs={24} lg={12}>
              <DealsTable
                deals={dealsData}
                loading={!dealsData}
                currencies={currencies}
                stagesData={stagesData}
                dateFilter={dealsDateFilter}
                setDateFilter={setDealsDateFilter}
                navigate={navigate}
              />
            </Col>

            <Col span={24} lg={12}>
              <TasksTable
                tasks={tasksData?.data}
                loading={tasksLoading}
                users={[user]}
                dateFilter={tasksDateFilter}
                setDateFilter={setTasksDateFilter}
                navigate={navigate}
              />
            </Col>

            <Col xs={24} lg={12}>
              <MeetingsTable
                meetings={meetings?.data}
                loading={meetingsLoading}
                dateFilter={meetingsDateFilter}
                setDateFilter={setMeetingsDateFilter}
                navigate={navigate}
              />
            </Col>
          </>
        )}
      </Row>
    </motion.div>
  );
}
