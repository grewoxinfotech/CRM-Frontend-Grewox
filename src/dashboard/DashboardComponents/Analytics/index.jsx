import React, { useState } from 'react';
import { Card, Tabs } from 'antd';
import { FiBarChart2, FiTarget, FiFileText, FiCalendar, FiCheckSquare } from 'react-icons/fi';
import DealsAnalytics from './DealsAnalytics';
import LeadsAnalytics from './LeadsAnalytics';
import TasksAnalytics from './TasksAnalytics';
import MeetingsAnalytics from './MeetingsAnalytics';

const Analytics = ({ deals, leads, tasks, meetings }) => {
    const [activeTab, setActiveTab] = useState('1');

    const items = [
        {
            key: '1',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiBarChart2 />
                    Deals Analytics
                </span>
            ),
            children: <DealsAnalytics deals={deals} />
        },
        {
            key: '2',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiTarget />
                    Leads Analytics
                </span>
            ),
            children: <LeadsAnalytics leads={leads} />
        },
        {
            key: '3',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiCheckSquare />
                    Tasks Analytics
                </span>
            ),
            children: <TasksAnalytics tasks={tasks} />
        },
        {
            key: '4',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiCalendar />
                    Meetings Analytics
                </span>
            ),
            children: <MeetingsAnalytics meetings={meetings} />
        }
    ];

    return (
        <Card
            style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #f0f7ff 100%)',
                border: '1px solid #e6f4ff',
                borderRadius: '12px'
            }}
        >
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={items}
                size="large"
                style={{ marginTop: '-12px' }}
                tabBarStyle={{
                    marginBottom: '24px',
                    borderBottom: '1px solid #e6f4ff'
                }}
            />
        </Card>
    );
};

export default Analytics; 