import React, { useEffect, useState } from 'react';
import { Card, Empty, Typography, Badge, Button, Popconfirm, Calendar, Breadcrumb, Modal, Tag } from 'antd';
import { FiCalendar, FiTrash2 } from 'react-icons/fi';
import dayjs from 'dayjs';
import { useDispatch, useSelector } from 'react-redux';
import { getInterviews, deleteInterview } from '../../actions/job/interviews';
import { getCandidateName } from '../../utils/candidateUtils';

const { Title, Text } = Typography;

const Interviews = () => {
    const dispatch = useDispatch();
    const interviews = useSelector(state => state.interviews);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        dispatch(getInterviews());
    }, [dispatch]);

    const handleDelete = async (id) => {
        try {
            await dispatch(deleteInterview(id));
            dispatch(getInterviews());
        } catch (error) {
            console.error('Error deleting interview:', error);
        }
    };

    const dateCellRender = (value) => {
        if (!interviews?.data) return null;

        // Filter interviews for the current date
        const dayInterviews = interviews.data.filter(
            interview => dayjs(interview.date).format('YYYY-MM-DD') === value.format('YYYY-MM-DD')
        );

        return dayInterviews.length > 0 ? (
            <div className="calendar-cell-content">
                {dayInterviews.map(interview => (
                    <div key={interview.id} className="calendar-interview-item">
                        <div className="interview-time">{interview.startTime}</div>
                        <div className="interview-candidate">
                            {getCandidateName(interview.candidate)}
                        </div>
                    </div>
                ))}
                {dayInterviews.length > 2 && (
                    <div className="more-interviews">
                        +{dayInterviews.length - 2} more
                    </div>
                )}
            </div>
        ) : null;
    };

    const handleDateSelect = (value) => {
        // Implementation of handleDateSelect
    };

    return (
        <div className="interviews-page">
            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>
                        <FiCalendar style={{ color: '#1890ff', marginRight: '12px' }} />
                        Interview Management
                    </Title>
                    <Text type="secondary">Schedule and manage your upcoming interviews</Text>
                </div>
            </div>

            <div className="interviews-content">
                <Card 
                    className="upcoming-interviews" 
                    loading={isLoading}
                    title={
                        <div className="section-header">
                            <Title level={4}>
                                <span style={{ color: '#1890ff' }}>Upcoming Interviews</span>
                            </Title>
                        </div>
                    }
                >
                    <div className="interview-cards">
                        {!interviews?.data?.length ? (
                            <Empty 
                                description={
                                    <span style={{ color: '#666' }}>No interviews scheduled</span>
                                }
                                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                            />
                        ) : (
                            interviews.data.map(interview => (
                                <Card
                                    key={interview.id}
                                    className="interview-card"
                                    hoverable
                                    bordered={false}
                                >
                                    <div className="card-content">
                                        <div className="candidate-info">
                                            <div className="candidate-avatar">
                                                {getCandidateName(interview.candidate).charAt(0)}
                                            </div>
                                            <div className="candidate-details">
                                                <div className="candidate-name">
                                                    {getCandidateName(interview.candidate)}
                                                </div>
                                                <div className="interview-datetime">
                                                    <Badge 
                                                        status="processing" 
                                                        color="#1890ff"
                                                    />
                                                    <span>{dayjs(interview.date).format('MMM DD, YYYY')}</span>
                                                    <span className="time-badge">
                                                        {interview.startTime}
                                                    </span>
                                                    <Tag color="blue">{interview.status || 'Online'}</Tag>
                                                </div>
                                            </div>
                                        </div>
                                        <Popconfirm
                                            title="Delete Interview"
                                            description="Are you sure you want to delete this interview?"
                                            onConfirm={() => handleDelete(interview.id)}
                                            okText="Yes"
                                            cancelText="No"
                                            placement="left"
                                        >
                                            <Button
                                                className="delete-button"
                                                type="text"
                                                danger
                                                icon={<FiTrash2 size={16} />}
                                            />
                                        </Popconfirm>
                                    </div>
                                </Card>
                            ))
                        )}
                    </div>
                </Card>

                <Card 
                    className="calendar-card" 
                    loading={isLoading}
                    bordered={false}
                    title={
                        <div className="calendar-header">
                            <FiCalendar style={{ color: '#1890ff', marginRight: '8px' }} />
                            <span>Interview Calendar</span>
                        </div>
                    }
                >
                    <Calendar
                        dateCellRender={dateCellRender}
                        onSelect={handleDateSelect}
                        className="custom-calendar"
                        mode="month"
                        fullscreen={true}
                    />
                </Card>
            </div>
        </div>
    );
};

export default Interviews; 