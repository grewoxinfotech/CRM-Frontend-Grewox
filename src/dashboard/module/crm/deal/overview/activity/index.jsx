import React from 'react';
import { Card, Timeline, Tag, Avatar, Tooltip, Spin, Empty } from 'antd';
import {
    FiPlus, FiEdit2, FiTrash2, FiFileText, FiDollarSign,
    FiFlag, FiCheckSquare, FiMessageSquare, FiUser, FiClock
} from 'react-icons/fi';
import './activity.scss';
import { useGetActivitiesQuery } from '../../../lead/overview/activity/services/activityApi';
import moment from 'moment';

const DealActivity = ({ deal }) => {
    const { data: response, isLoading, error } = useGetActivitiesQuery(deal.id, {
        skip: !deal.id // Skip the query if deal.id is not available
    });

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

    const getActivityIcon = (activityFrom) => {
        switch (activityFrom?.toLowerCase()) {
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

    if (isLoading) {
        return (
            <div className="deal-activity">
                <Card title="Deal Activity">
                    <div style={{ textAlign: 'center', padding: '20px' }}>
                        <Spin size="large" />
                    </div>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="deal-activity">
                <Card title="Deal Activity">
                    <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>
                        Error loading activities
                    </div>
                </Card>
            </div>
        );
    }

    const activities = response?.data || [];

    if (activities.length === 0) {
        return (
            <div className="deal-activity">
                <Card title="Deal Activity">
                    <Empty description="No activities found for this deal" />
                </Card>
            </div>
        );
    }

    return (
        <div className="deal-activity">
            <Card title="Deal Activity">
                <Timeline
                    items={activities.map(activity => ({
                        dot: (
                            <div
                                className="timeline-dot"
                                style={{ color: getActionColor(activity.action) }}
                            >
                                {getActivityIcon(activity.activity_from)}
                            </div>
                        ),
                        children: (
                            <div className="activity-item">
                                <div className="activity-content">
                                    <div className="activity-header">
                                        <Tag color={getActionColor(activity.action)}>
                                            {activity.action?.charAt(0)?.toUpperCase() + activity.action?.slice(1)}
                                        </Tag>
                                        <h4>{activity.activity_message || 'Untitled Activity'}</h4>
                                    </div>
                                    <div className="activity-meta">
                                        <span className="user-info">
                                            <FiUser />
                                            <Avatar size="small">
                                                {activity.performed_by?.charAt(0)?.toUpperCase()}
                                            </Avatar>
                                            {activity.performed_by || 'Unknown User'}
                                        </span>
                                        <span className="timestamp">
                                            <FiClock />
                                            {formatDate(activity.createdAt)}
                                        </span>
                                    </div>
                                    {activity.activity_message && (
                                        <div className="activity-description">
                                            {activity.activity_message}
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

export default DealActivity; 