import React from 'react';
import { Timeline, Card, Typography, Tag } from 'antd';
import { FiActivity, FiEdit2, FiMail, FiPhone, FiFileText, FiUsers } from 'react-icons/fi';

const { Text } = Typography;

const LeadActivity = ({ leadId }) => {
    // You'll need to implement the API call to fetch activities
    const activities = []; // Replace with actual API data

    const getActivityIcon = (type) => {
        switch (type) {
            case 'edit':
                return <FiEdit2 />;
            case 'email':
                return <FiMail />;
            case 'call':
                return <FiPhone />;
            case 'note':
                return <FiFileText />;
            case 'member':
                return <FiUsers />;
            default:
                return <FiActivity />;
        }
    };

    return (
        <div className="lead-activity">
            <Timeline
                items={activities.map(activity => ({
                    dot: getActivityIcon(activity.type),
                    children: (
                        <div className="activity-item">
                            <div className="activity-header">
                                <Text strong>{activity.title}</Text>
                                <Tag color="blue">{activity.type}</Tag>
                            </div>
                            <Text type="secondary">{activity.description}</Text>
                            <div className="activity-meta">
                                <Text type="secondary">
                                    {new Date(activity.timestamp).toLocaleString()}
                                </Text>
                                <Text type="secondary">by {activity.user}</Text>
                            </div>
                        </div>
                    ),
                }))}
            />
        </div>
    );
};

export default LeadActivity; 