import React, { useEffect, useState } from "react";
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
import CountUp from 'react-countup';
import { useGetAllSubclientsQuery } from "../dashboard/module/user-management/subclient/services/subClientApi";
import { useGetAllProjectsQuery } from "./module/crm/project/services/projectApi";
import { useGetRevenueQuery } from "./module/sales/revenue/services/revenueApi";
import { useGetAllCurrenciesQuery } from "./module/settings/services/settingsApi";
import { useGetAllTasksQuery } from "./module/crm/task/services/taskApi";
import { useGetAllCalendarEventsQuery } from "./module/communication/calendar/services/calendarApi";
import { Link } from "react-router-dom";

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

export default function Dashboard() {
  const user = useSelector(selectCurrentUser);
  const id = user?.client_id;
  const companyName = "Grewox Software"; // You can get this from your config or user data
  const { data: subclients, isSuccess } = useGetAllSubclientsQuery();
  const { data: projectsData, isSuccess: isProjectSuccess } = useGetAllProjectsQuery();
  const { data: revenueData } = useGetRevenueQuery();
  const { data: currencies } = useGetAllCurrenciesQuery();
  // const { data: tasksData } = useGetAllTasksQuery();
   // Fetch tasks using RTK Query
   const { data: tasks = [], isLoading: tasksLoading, refetch } = useGetAllTasksQuery(id);
   const tasksData = tasks?.data || [];
  const [currencySymbol, setCurrencySymbol] = useState('');
  const { data: calendarData = [], isLoading: calendarLoading } = useGetAllCalendarEventsQuery();
  const calendarEvents = calendarData?.data || [];
  
  const totalSubclients = isSuccess && subclients?.data ? subclients.data.length : 0;
  const totalProjects = isProjectSuccess && projectsData?.data ? projectsData.data.length : 0;

  // Calculate total revenue and profit from revenue logs
  const totalRevenue = revenueData?.data?.reduce((sum, item) => sum + Number(item.amount), 0) || 0;
  const totalProfit = revenueData?.data?.reduce((sum, item) => sum + Number(item.profit), 0) || 0;

  // Calculate average profit margin percentage
  const profitPercentage = revenueData?.data?.reduce((sum, item) => sum + Number(item.profit_margin_percentage), 0) / (revenueData?.data?.length || 1) || 0;

  // Get the currency symbol based on revenue data
  useEffect(() => {
    if(revenueData?.data && revenueData.data.length > 0 && currencies) {
      // Get the currency ID from the first revenue item
      const currencyId = revenueData.data[0].currency;
      
      // Find the matching currency in the currencies data
      const currency = currencies.find(c => c.id === currencyId);
      
      if(currency) {
        setCurrencySymbol(currency.currencyIcon);
      }
    }
  }, [revenueData, currencies]);

  // Get upcoming tasks from tasks data
  const getUpcomingTasks = () => {
    if (!tasksData) return [];
    
    // Sort tasks by due date
    const sortedTasks = [...tasksData]
      .filter(task => task.status !== 'completed') // Filter out completed tasks
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 3); // Get only the next 3 tasks
      
    return sortedTasks.map(task => ({
      id: task.id,
      taskName: task.taskName,
      time: new Date(task.dueDate).toLocaleDateString('en-US', { 
        weekday: 'short', 
        // month: 'short', 
        // day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      priority: task.priority.toLowerCase() || 'medium',
      status: task.status
    }));
  };

  // Use the function to get upcoming tasks
  const upcomingTasks = getUpcomingTasks();

  // Format calendar data
  const getUpcomingEvents = () => {
    if (!calendarEvents || calendarEvents.length === 0) return [];
    
    const now = new Date();
    // Filter and sort events
    const upcomingEvents = [...calendarEvents]
      .filter(event => new Date(event.startDate) > now) // Only future events
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate)) // Sort by start date
      .slice(0, 3); // Take only the next 3 events
    
    return upcomingEvents.map(event => {
      // Format the date and time
      const startDate = new Date(event.startDate);
      const endDate = new Date(event.endDate);
      
      // Format date
      const dateOptions = { weekday: 'short', month: 'short', day: 'numeric' };
      const formattedDate = startDate.toLocaleDateString('en-US', dateOptions);
      
      // Format time
      const timeOptions = { hour: '2-digit', minute: '2-digit' };
      const startTime = startDate.toLocaleTimeString('en-US', timeOptions);
      const endTime = endDate.toLocaleTimeString('en-US', timeOptions);
      
      // Calculate duration in hours (with 1 decimal place)
      const durationHours = ((endDate - startDate) / (1000 * 60 * 60)).toFixed(1);
      
      return {
        id: event.id,
        name: event.name,
        date: formattedDate,
        time: `${startTime} - ${endTime}`,
        duration: `${durationHours} hr${durationHours !== '1.0' ? 's' : ''}`,
        color: event.color || '#1890ff',
      };
    });
  };
  
  const upcomingEvents = getUpcomingEvents();

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
      value: totalSubclients,
      description: "Total registered clients",
      icon: <FiUsers className="stats-icon" />,
      gradient: "linear-gradient(145deg, #ffffff, #f0f7ff)",
      iconGradient: "linear-gradient(135deg, #1890ff, #69c0ff)",
      color: "#1890ff",
      tag: `Active: ${totalSubclients}`
    },
    {
      title: "Active Projects",
      value: totalProjects,
      description: "Ongoing projects",
      icon: <FiBriefcase className="stats-icon" />,
      gradient: "linear-gradient(145deg, #ffffff, #f6f3ff)",
      iconGradient: "linear-gradient(135deg, #722ed1, #b37feb)",
      color: "#722ed1",
      tag: `Total: ${totalProjects}`
    },
    {
      title: "Total Revenue",
      value: totalRevenue,
      description: "Total earnings",
      icon: <FiDollarSign className="stats-icon" />,
      gradient: "linear-gradient(145deg, #ffffff, #f0fff4)",
      iconGradient: "linear-gradient(135deg, #52c41a, #95de64)",
      color: "#52c41a",
      tag: `Monthly: ${currencySymbol}${(totalRevenue/12).toFixed(2)}`
    },
    {
      title: "Revenue Profit",
      value: totalProfit,
      description: "Net profit from revenue",
      icon: <FiTrendingUp className="stats-icon" />,
      gradient: "linear-gradient(145deg, #ffffff, #e6fffb)",
      iconGradient: "linear-gradient(135deg, #13c2c2, #5cdbd3)",
      color: "#13c2c2",
      tag: `Margin: ${profitPercentage.toFixed(1)}%`
    }
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

  const getProjectStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in progress':
        return 'processing';
      case 'not started':
        return 'default';
      case 'on hold':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage < 30) return '#ff4d4f';
    if (percentage < 60) return '#faad14';
    return '#52c41a';
  };

  // Get client name from subclients data
  const getClientName = (clientId) => {
    if (!subclients?.data) return 'Unknown Client';
    const client = subclients.data.find(c => c.id === clientId);
    return client ? client.username : 'Unknown Client';
  };


  

  return (
    <motion.div 
      className="dashboard-container"
      initial="initial"
      animate="animate"
      variants={staggerContainer}
    >
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
            <motion.div variants={fadeInUp}>
              <Card
                className="stats-card"
                style={{
                  background: stat.gradient,
                  border: '1px solid rgba(255, 255, 255, 0.8)'
                }}
              >
                <div className="stats-content">
                  <div className="stats-header">
                    <div
                      className="icon-wrapper"
                      style={{ background: stat.iconGradient }}
                    >
                      {stat.icon}
                    </div>
                    <div
                      className="tag-wrapper"
                      style={{
                        color: stat.color,
                        background: 'rgba(255, 255, 255, 0.9)'
                      }}
                    >
                      {stat.tag}
                    </div>
                  </div>
                  <div className="stats-info">
                    <h3 style={{ color: '#1f2937' }}>{stat.title}</h3>
                    <div className="stats-value" style={{ color: stat.color }}>
                      {(stat.title === 'Total Revenue' || stat.title === 'Revenue Profit') && currencySymbol}
                      <CountUp
                        start={0}
                        end={stat.value}
                        duration={2}
                        separator=","
                        decimal="."
                        decimals={(stat.title === 'Total Revenue' || stat.title === 'Revenue Profit') ? 2 : 0}
                      />
                    </div>
                    <p style={{ color: '#6b7280' }}>{stat.description}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          </Col>
        ))}

        {/* Project Progress - Updated to show real projects */}
        <Col xs={24} lg={24}>
          <Card 
            title={
              <div className="card-title-with-icon">
                <FiBriefcase className="title-icon" />
                <span>Project Progress</span>
              </div>
            }
            className="progress-card" 
            extra={
              <Link to="/dashboard/crm/project">
                <Button type="text" icon={<FiBarChart2 />}>View All</Button>
              </Link>
            }
          >
            {projectsData?.data && projectsData.data.length > 0 ? (
              <Row gutter={[24, 24]}>
                {projectsData.data.slice(0, 4).map((project, index) => {
                  // Find the subclient data for this project
                  const subclient = subclients?.data?.find(sc => sc.id === project.client);
                  
                  return (
                    <Col span={12} key={project.id || index}>
                      <div className="progress-item">
                        <div className="progress-header">
                          <div className="project-info" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Text strong className="project-name">{project.project_name}</Text>
                            <Tag color={getProjectStatusColor(project.status)}>
                              {project.status}
                            </Tag>
                          </div>
                          <Text type="secondary" className="progress-percentage">
                            {project.progress || Math.floor(Math.random() * 100)}%
                          </Text>
                        </div>
                        <Progress 
                          percent={project.progress || Math.floor(Math.random() * 100)} 
                          strokeColor={getProgressColor(project.progress || Math.floor(Math.random() * 100))}
                          strokeWidth={8}
                          showInfo={false}
                        />
                        <div className="project-meta">
                          <div className="project-deadline" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FiCalendar className="meta-icon" />
                            <Text type="secondary">
                              {project.endDate ? new Date(project.endDate).toLocaleDateString('en-GB') : 'No deadline'}
                            </Text>
                          </div>
                          <div className="project-client" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <FiUsers className="meta-icon" />
                            <Text type="secondary">
                              {subclient?.username || 'Unknown Client'}
                            </Text>
                          </div>
                        </div>
                      </div>
                    </Col>
                  );
                })}
              </Row>
            ) : (
              <div className="empty-projects">
                <div className="empty-icon-container">
                  <FiBriefcase className="empty-icon" />
                </div>
                <Text className="empty-text">No active projects</Text>
                <Text type="secondary" className="empty-subtext">
                  Start by creating your first project
                </Text>
              </div>
            )}
          </Card>
        </Col>

        {/* Recent Activities */}
        {/* <Col xs={24} lg={8}>
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
        </Col> */}

        {/* Upcoming Tasks - Updated to use real task data */}
        <Col xs={24} lg={12}>
          <Card 
            title="Upcoming Tasks" 
            className="tasks-card"
            extra={
              <Link to="/dashboard/crm/tasks">
                <Button type="text" icon={<FiBarChart2 />}>View All</Button>
              </Link>
            }
          >
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map((task, index) => (
                <div key={task.id || index} className="task-item">
                  <div className="task-info">
                    <Text strong>{task.taskName}</Text>
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
              ))
            ) : (
              <div className="empty-tasks" style={{ textAlign: 'center', padding: '20px 0' }}>
                <Text type="secondary">No upcoming tasks</Text>
              </div>
            )}
            
          </Card>
        </Col>

        {/* Calendar Events - Updated with improved UI */}
        <Col xs={24} lg={12}>
          <Card 
            title="Upcoming Events" 
            className="events-card"
            extra={
              <Link to="/dashboard/communication/calendar">
                <Button type="text" icon={<FiCalendar />}>View Calendar</Button>
              </Link>
            }
          >
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
                <div key={event.id} className="event-item">
                  <div className="event-color-bar" style={{ backgroundColor: event.color }}></div>
                  <div className="event-content">
                    <div className="event-header">
                      <Text strong className="event-title">{event.name}</Text>
                      <Tag color={event.color} className="event-duration">
                        {event.duration}
                      </Tag>
                    </div>
                    <div className="event-details">
                      <div className="event-date">
                        <FiCalendar className="event-icon" />
                        <Text type="secondary">{event.date}</Text>
                      </div>
                      <div className="event-time">
                        <FiClock className="event-icon" />
                        <Text type="secondary">{event.time}</Text>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-events">
                <FiCalendar className="empty-icon" />
                <Text type="secondary">No upcoming events</Text>
              </div>
            )}
            
          </Card>
        </Col>
      </Row>
    </motion.div>
  );
}
