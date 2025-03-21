import React, { useState } from 'react';
import { Calendar, Badge, Typography, Breadcrumb, Card, List, message, Button, Popconfirm } from 'antd';
import { FiHome, FiCalendar, FiPlus, FiTrash2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import './interviews.scss';
import CreateInterview from './CreateInterview';

const { Title, Text } = Typography;

const Interviews = () => {
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [interviews, setInterviews] = useState([
        {
            id: 1,
            candidate: 'John Doe',
            type: 'technical',
            date: '2024-03-21',
            time: '10:00 am',
        },
        {
            id: 2,
            candidate: 'Jane Smith',
            type: 'hr',
            date: '2024-03-21',
            time: '2:00 pm',
        },
        // Add more mock data as needed
    ]);

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setIsModalVisible(true);
    };

    const handleCreateInterview = async (values) => {
        const newInterview = {
            id: interviews.length + 1,
            ...values,
            date: selectedDate.format('YYYY-MM-DD')
        };
        setInterviews([...interviews, newInterview]);
        setIsModalVisible(false);
        message.success('Interview scheduled successfully');
    };

    const handleDeleteInterview = (interviewId) => {
        setInterviews(interviews.filter(interview => interview.id !== interviewId));
        message.success('Interview deleted successfully');
    };

    const dateCellRender = (date) => {
        const dayInterviews = interviews.filter(
            interview => interview.date === date.format('YYYY-MM-DD')
        );

        return (
            <div className="interview-cell">
                {dayInterviews.map(interview => (
                    <div key={interview.id} className="interview-item">
                        <div className="interview-details">
                            <div className="interview-time">{interview.time}</div>
                            <div className="interview-candidate">{interview.candidate}</div>
                            <div className="interview-type">{interview.type}</div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="interviews-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/dashboard">
                            <FiHome style={{ marginRight: '4px' }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <Link to="/dashboard/job">Job</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Interviews</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Interviews</Title>
                    <Text type="secondary">Manage upcoming interviews</Text>
                </div>
            </div>

            <div className="interviews-content">
                <Card className="upcoming-interviews">
                    <div className="section-header">
                        <Title level={4}>
                            <FiCalendar style={{ marginRight: '8px' }} />
                            Upcoming Interviews
                        </Title>
                    </div>
                    <div className="interview-cards">
                        {interviews.map(interview => (
                            <div key={interview.id} className="interview-card">
                                <div className="card-content">
                                    <div className="candidate-name">{interview.candidate}</div>
                                    <div className="interview-datetime">
                                        {dayjs(interview.date).format('MMM DD, YYYY')}
                                        <br />
                                        {interview.time} · {interview.status || 'Online'}
                                    </div>
                                </div>
                                <Popconfirm
                                    title="Delete Interview"
                                    description="Are you sure you want to delete this interview?"
                                    onConfirm={() => handleDeleteInterview(interview.id)}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <Button 
                                        className="delete-btn"
                                        type="text" 
                                        danger 
                                        icon={<FiTrash2 />}
                                    />
                                </Popconfirm>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="calendar-card">
                    <Calendar
                        dateCellRender={dateCellRender}
                        onSelect={handleDateSelect}
                    />
                </Card>
            </div>

            <CreateInterview
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onSubmit={handleCreateInterview}
                selectedDate={selectedDate}
            />
        </div>
    );
};

export default Interviews;
