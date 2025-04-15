import React, { useEffect } from 'react';
import { Card, Timeline, Tag, Avatar, Tooltip, Spin, Empty, message } from 'antd';
import {
    FiPlus, FiEdit2, FiTrash2, FiFileText, FiDollarSign,
    FiFlag, FiCheckSquare, FiMessageSquare, FiUser, FiClock
} from 'react-icons/fi';
import './activity.scss';
import { useGetActivitiesQuery } from './services/activityApi';
import moment from 'moment';

const LeadActivity = ({ leadId }) => {
    const { data: activitiesData, isLoading, error } = useGetActivitiesQuery(leadId, {
        skip: !leadId // Skip the query if leadId is not available
    });

    useEffect(() => {
        if (!leadId) {
            message.warning('Lead ID is required to fetch activities');
        }
    }, [leadId]);

    const getActionColor = (action) => {
        switch (action?.toLowerCase()) {
            case 'created':
                return '#1890ff';
            case 'completed':
                return '#52c41a';
            case 'added':
                return '#722ed1';
            case 'updated':
                return '#52c41a';
            case 'uploaded':
                return '#faad14';
            case 'deleted':
                return '#ff4d4f';
            default:
                return '#1890ff';
        }
    };

    const getActivityIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'task':
                return <FiCheckSquare />;
            case 'milestone':
                return <FiFlag />;
            case 'note':
                return <FiMessageSquare />;
            case 'status':
                return <FiDollarSign />;
            case 'file':
                return <FiFileText />;
            case 'meeting':
                return <FiUser />;
            default:
                return <FiMessageSquare />;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return moment(dateString).format('DD MMM YYYY, hh:mm A');
    };

    if (!leadId) {
        return (
            <div className="lead-activity">
                <Card title="Lead Activity">
                    <Empty description="Please select a lead to view activities" />
                </Card>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="lead-activity">
                <Card title="Lead Activity">
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <Spin size="large" />
                    </div>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="lead-activity">
                <Card title="Lead Activity">
                    <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
                        Error loading activities
                    </div>
                </Card>
            </div>
        );
    }

    const activities = activitiesData?.data || [];

    if (activities.length === 0) {
        return (
            <div className="lead-activity">
                <Card title="Lead Activity">
                    <Empty description="No activities found for this lead" />
                </Card>
            </div>
        );
    }

    return (
        <div className="lead-activity">
            <Card title="Lead Activity">
                <Timeline
                    items={activities.map(activity => ({
                        dot: (
                            <div
                                className="timeline-dot"
                                style={{ color: getActionColor(activity.action) }}
                            >
                                {getActivityIcon(activity.type)}
                            </div>
                        ),
                        children: (
                            <div className="activity-item">
                                <div className="activity-content">
                                    <div className="activity-header">
                                        <Tag color={getActionColor(activity.action)}>
                                            {activity.action?.charAt(0)?.toUpperCase() + activity.action?.slice(1)}
                                        </Tag>
                                        <h4>{activity.title || 'Untitled Activity'}</h4>
                                    </div>
                                    <div className="activity-meta">
                                        <span className="user-info">
                                            <FiUser />
                                            <Avatar src={activity.user?.avatar} size="small">
                                                {activity.user?.name?.charAt(0)?.toUpperCase()}
                                            </Avatar>
                                            {activity.user?.name || 'Unknown User'}
                                        </span>
                                        <span className="timestamp">
                                            <FiClock />
                                            {formatDate(activity.timestamp || activity.createdAt)}
                                        </span>
                                    </div>
                                    {activity.description && (
                                        <div className="activity-description">
                                            {activity.description}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    }))}
                />
            </Card>
        </div>
    );
};

export default LeadActivity;