import React, { useState } from 'react';
import { Calendar, Badge, Typography, Breadcrumb, Card, List, message, Button, Popconfirm, Empty, Modal, Tooltip } from 'antd';
import { FiHome, FiCalendar, FiPlus, FiTrash2, FiChevronDown, FiChevronUp, FiClock, FiUser, FiVideo } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import './interviews.scss';
import CreateInterview from './CreateInterview';
import { useDeleteInterviewMutation, useGetAllInterviewsQuery } from './services/interviewApi';
import { useGetAllJobApplicationsQuery } from '../job applications/services/jobApplicationApi';
import { useGetAllJobsQuery } from '../jobs/services/jobApi';

const { Title, Text } = Typography;

const Interviews = () => {
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [showAllInterviews, setShowAllInterviews] = useState(false);
    const [moreEvents, setMoreEvents] = useState({ visible: false, events: [], date: null });
    const { data: interviews, isLoading } = useGetAllInterviewsQuery();
    const { data: jobApplications } = useGetAllJobApplicationsQuery();
    const [deleteInterview] = useDeleteInterviewMutation();
    const { data: jobsData } = useGetAllJobsQuery();

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setIsModalVisible(true);
    };

    const handleDelete = (interviewId) => {
        Modal.confirm({
            title: 'Delete Interview',
            content: 'Are you sure you want to delete this interview?',
            okText: 'Yes',
            okType: 'danger',
            cancelText: 'No',
            bodyStyle: {
                padding: '20px',
            },
            onOk: async () => {
                try {
                    await deleteInterview(interviewId).unwrap();
                    message.success('Interview deleted successfully');
                } catch (error) {
                    message.error(error?.data?.message || 'Failed to delete interview');
                }
            },
        });
    };

    const handleCreateInterview = async (values) => {
        const newInterview = {
            id: interviews?.length ? interviews.length + 1 : 1,
            ...values,
            date: selectedDate.format('YYYY-MM-DD')
        };
        // Here you would call the API to create the interview
        setIsModalVisible(false);
        message.success('Interview scheduled successfully');
    };

    // Helper: Get candidate name by id
    const getCandidateName = (candidateId) => {
        const application = jobApplications?.data?.find(app => app.id === candidateId);
        return application?.name || 'Unknown Candidate';
    };

    // Helper: Get job name by id
    const getJobName = (jobId) => {
        // jobsData?.data should be an array of jobs with id and title/name
        const job = jobsData?.data?.find(j => j.id === jobId);
        return job?.title || job?.name || jobId || 'Unknown Job';
    };

    // Helper: Get round name (if you have a mapping, otherwise just show the string)
    const getRoundName = (round) => {
        try {
            const parsed = JSON.parse(round);
            if (Array.isArray(parsed) && parsed.length > 0) {
                // You can map to a display name if you have a mapping, e.g.:
                // const roundMap = { hr: 'HR Round', technical: 'Technical Round', ... }
                // return roundMap[parsed[0]] || parsed[0];
                return parsed[0];
            }
            return '-';
        } catch {
            return round || '-';
        }
    };

    const dateCellRender = (date) => {
        if (!interviews?.data) return null;

        // Filter interviews for the current date
        const dayInterviews = interviews.data.filter(
            interview => dayjs(interview.startOn).format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
        );

        if (dayInterviews.length === 0) return null;

        return (
            <div className="interview-cell">
                <Tooltip
                    title={
                        <>
                            <div><strong>{getCandidateName(dayInterviews[0].candidate)}</strong></div>
                            <div>Time: {dayInterviews[0].startTime?.slice(0, 5)}</div>
                            <div>Type: {dayInterviews[0].interviewType}</div>
                        </>
                    }
                    placement="top"
                >
                    <div
                        className="interview-item"
                        style={{ cursor: 'pointer' }}
                        onClick={e => {
                            e.stopPropagation();
                            setMoreEvents({ visible: true, events: dayInterviews, date: date.format('DD-MM-YYYY') });
                        }}
                    >
                        <div className="interview-details">
                            <div className="interview-info">
                                <span className="interview-candidate">
                                    {getCandidateName(dayInterviews[0].candidate)}
                                </span>
                            </div>
                            <div className="interview-time">
                                {dayInterviews[0].startTime?.slice(0, 5)}
                            </div>
                        </div>
                    </div>
                </Tooltip>
                {dayInterviews.length > 1 && (
                    <div
                        className="more-events-link"
                        onClick={e => {
                            e.stopPropagation();
                            setMoreEvents({ visible: true, events: dayInterviews, date: date.format('DD-MM-YYYY') });
                        }}
                        style={{ color: '#1890ff', cursor: 'pointer', fontSize: 12, marginTop: 2 }}
                    >
                        +{dayInterviews.length - 1} more
                    </div>
                )}
            </div>
        );
    };

    const getInterviewTypeColor = (type) => {
        switch ((type || '').toLowerCase()) {
            case 'online':
                return { color: '#1890ff', bg: '#e6f7ff', border: '1px solid #91caff' };
            case 'offline':
                return { color: '#52c41a', bg: '#f6ffed', border: '1px solid #b7eb8f' };
            default:
                return { color: '#8c8c8c', bg: '#f5f5f5', border: '1px solid #d9d9d9' };
        }
    };

    // Update displayedInterviews to handle show more functionality
    const displayedInterviews = showAllInterviews 
        ? interviews?.data 
        : interviews?.data?.slice(0, 2);

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
                <Card className="upcoming-interviews" loading={isLoading}>
                    <div className="section-header">
                        <Title level={4}>
                            <FiCalendar style={{ marginRight: '8px', color: '#1890ff' }} />
                            Upcoming Interviews
                        </Title>
                    </div>
                    <div className="interview-cards">
                        {!interviews?.data?.length ? (
                            <Empty
                                description="No interviews scheduled"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        ) : (
                            <>
                                {displayedInterviews.map(interview => {
                                    const typeStyle = getInterviewTypeColor(interview.interviewType);
                                    return (
                                        <div key={interview.id} className="interview-card">
                                            <div className="card-content">
                                                <div className="candidate-info">
                                                    <div className="candidate-name">
                                                        {getCandidateName(interview.candidate)}
                                                    </div>
                                                    <div className="interview-datetime">
                                                        <div className="date">
                                                            <FiCalendar style={{ marginRight: '4px', color: '#1890ff' }} />
                                                            {dayjs(interview.startOn).format('MMM DD, YYYY')}
                                                        </div>
                                                        <div className="time">
                                                            <FiClock style={{ marginRight: '4px', color: '#722ed1' }} />
                                                            {interview.startTime?.slice(0, 5)}
                                                        </div>
                                                        <div className="type" style={{ 
                                                            background: typeStyle.bg,
                                                            color: typeStyle.color,
                                                            border: typeStyle.border
                                                        }}>
                                                            {typeStyle.icon}
                                                            {interview.interviewType}
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button
                                                    className="delete-button"
                                                    type="text"
                                                    danger
                                                    icon={<FiTrash2 size={16} />}
                                                    onClick={() => handleDelete(interview.id)}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                                {interviews.data.length > 2 && (
                                    <Button
                                        type="text"
                                        className="show-more-button"
                                        onClick={() => setShowAllInterviews(!showAllInterviews)}
                                        icon={showAllInterviews ? <FiChevronUp /> : <FiChevronDown />}
                                    >
                                        {showAllInterviews ? 'Show Less' : `Show ${interviews.data.length - 2} More`}
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </Card>

                <Card className="calendar-card" loading={isLoading}>
                    <Calendar
                        className='calendar'
                        dateCellRender={dateCellRender}
                        onSelect={handleDateSelect}
                    />
                </Card>
            </div>

            <Modal
                open={moreEvents.visible}
                title={<span style={{ color: '#fff' }}>{`Interviews for ${moreEvents.date}`}</span>}
                footer={null}
                onCancel={() => setMoreEvents({ visible: false, events: [], date: null })}
            >
                {moreEvents.events.map((interview, idx) => {
                    const typeStyle = getInterviewTypeColor(interview.interviewType);
                    return (
                        <div
                            key={idx}
                            style={{
                                marginBottom: 12,
                                padding: 16,
                                borderRadius: 10,
                                background: '#f5faff',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 8,
                                minHeight: 48
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div style={{ fontWeight: 600, fontSize: 15 }}>
                                    {getCandidateName(interview.candidate)}
                                </div>
                                <div style={{ color: '#1890ff', fontWeight: 700, fontSize: 15, minWidth: 48, textAlign: 'right' }}>
                                    {interview.startTime?.slice(0, 5)}
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                <span
                                    className="colorful-type"
                                    style={{
                                        background: typeStyle.bg,
                                        color: typeStyle.color,
                                        border: typeStyle.border,
                                        borderRadius: 12,
                                        fontSize: 13,
                                        fontWeight: 500,
                                        padding: '3px 16px',
                                        minWidth: 60,
                                        textAlign: 'center',
                                        letterSpacing: 0.5,
                                        marginTop: 0
                                    }}
                                >
                                    {interview.interviewType}
                                </span>
                               
                                <span style={{ color: '#888', fontSize: 13 }}>
                                    <b>Job:</b> {getJobName(interview.job)}
                                </span>
                                <span style={{ color: '#888', fontSize: 13 }}>
                                    <b>Candidate:</b> {getCandidateName(interview.candidate)}
                                </span>
                            </div>
                            <div style={{ color: '#888', fontSize: 13 }}>
                                {/* <b>Comment for Interviewer:</b> {interview.commentForInterviewer || '-'} */}
                            </div>
                            <div style={{ color: '#888', fontSize: 13 }}>
                                {/* <b>Comment for Candidate:</b> {interview.commentForCandidate || '-'} */}
                            </div>
                        </div>
                    );
                })}
            </Modal>

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
