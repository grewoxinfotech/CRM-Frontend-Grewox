import React, { useState } from 'react';
import { Calendar, Typography, Card, message, Button, Empty, Modal, Tooltip, Space, Tag } from 'antd';
import { FiHome, FiCalendar, FiPlus, FiTrash2, FiChevronDown, FiChevronUp, FiClock, FiUser } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import './interviews.scss';
import CreateInterview from './CreateInterview';
import { useDeleteInterviewMutation, useGetAllInterviewsQuery } from './services/interviewApi';
import { useGetAllJobApplicationsQuery } from '../job applications/services/jobApplicationApi';
import { useGetAllJobsQuery } from '../jobs/services/jobApi';
import PageHeader from '../../../../components/PageHeader';

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
            centered: true,
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

    const getCandidateName = (candidateId) => {
        const application = jobApplications?.data?.find(app => app.id === candidateId);
        return application?.name || 'Unknown Candidate';
    };

    const getJobName = (jobId) => {
        const job = jobsData?.data?.find(j => j.id === jobId);
        return job?.title || job?.name || 'Unknown Job';
    };

    const dateCellRender = (date) => {
        if (!interviews?.data) return null;
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
                        onClick={e => {
                            e.stopPropagation();
                            setMoreEvents({ visible: true, events: dayInterviews, date: date.format('DD-MM-YYYY') });
                        }}
                    >
                        <div className="interview-details">
                            <div className="interview-candidate">{getCandidateName(dayInterviews[0].candidate)}</div>
                            <div className="interview-time">{dayInterviews[0].startTime?.slice(0, 5)}</div>
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
                    >
                        +{dayInterviews.length - 1} more
                    </div>
                )}
            </div>
        );
    };

    const getInterviewTypeColor = (type) => {
        switch ((type || '').toLowerCase()) {
            case 'online': return { color: '#0284c7', bg: '#f0f9ff' };
            case 'offline': return { color: '#059669', bg: '#ecfdf5' };
            default: return { color: '#4b5563', bg: '#f3f4f6' };
        }
    };

    const displayedInterviews = showAllInterviews 
        ? interviews?.data 
        : interviews?.data?.slice(0, 2);

    return (
        <div className="interviews-page standard-page-container">
            <PageHeader
                title="Interviews"
                subtitle="Manage upcoming interviews"
                breadcrumbItems={[
                    { title: <Link to="/dashboard"><FiHome style={{ marginRight: '4px' }} /> Home</Link> },
                    { title: "Job" },
                    { title: "Interviews" },
                ]}
                onAdd={() => setIsModalVisible(true)}
                addText="Schedule Interview"
            />

            <div className="interviews-content">
                <Card className="upcoming-interviews standard-content-card" loading={isLoading}>
                    <div className="section-header">
                        <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiCalendar style={{ color: '#4f46e5' }} />
                            Upcoming Interviews
                        </Title>
                    </div>
                    <div className="interview-cards">
                        {!interviews?.data?.length ? (
                            <Empty description="No interviews scheduled" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        ) : (
                            <>
                                {displayedInterviews.map(interview => {
                                    const typeStyle = getInterviewTypeColor(interview.interviewType);
                                    return (
                                        <div key={interview.id} className="interview-card">
                                            <div className="card-content">
                                                <div className="candidate-info">
                                                    <div className="candidate-name">{getCandidateName(interview.candidate)}</div>
                                                    <div className="interview-datetime">
                                                        <div className="date">
                                                            <FiCalendar size={12} />
                                                            {dayjs(interview.startOn).format('MMM DD, YYYY')}
                                                        </div>
                                                        <div className="time">
                                                            <FiClock size={12} />
                                                            {interview.startTime?.slice(0, 5)}
                                                        </div>
                                                        <Tag style={{ 
                                                            background: typeStyle.bg,
                                                            color: typeStyle.color,
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            fontSize: '11px',
                                                            margin: 0
                                                        }}>
                                                            {interview.interviewType.toUpperCase()}
                                                        </Tag>
                                                    </div>
                                                </div>
                                                <Button
                                                    type="text"
                                                    danger
                                                    icon={<FiTrash2 size={14} />}
                                                    onClick={() => handleDelete(interview.id)}
                                                    className="delete-button"
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
                                        style={{ width: '100%', marginTop: '8px' }}
                                    >
                                        {showAllInterviews ? 'Show Less' : `Show ${interviews.data.length - 2} More`}
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </Card>

                <Card className="calendar-card standard-content-card" loading={isLoading} bodyStyle={{ padding: '16px' }}>
                    <Calendar
                        className="calendar compact-calendar"
                        dateCellRender={dateCellRender}
                        onSelect={handleDateSelect}
                    />
                </Card>
            </div>

            <Modal
                open={moreEvents.visible}
                title={<span style={{ color: '#1e293b', fontWeight: 600 }}>{`Interviews for ${moreEvents.date}`}</span>}
                footer={null}
                onCancel={() => setMoreEvents({ visible: false, events: [], date: null })}
                centered
                width={450}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {moreEvents.events.map((interview, idx) => {
                        const typeStyle = getInterviewTypeColor(interview.interviewType);
                        return (
                            <div
                                key={idx}
                                style={{
                                    padding: '16px',
                                    borderRadius: '8px',
                                    background: '#f8fafc',
                                    border: '1px solid #f1f5f9',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '8px'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Text strong style={{ fontSize: '15px', color: '#1e293b' }}>
                                        {getCandidateName(interview.candidate)}
                                    </Text>
                                    <Text style={{ color: '#4f46e5', fontWeight: 700 }}>
                                        {interview.startTime?.slice(0, 5)}
                                    </Text>
                                </div>
                                <Space wrap>
                                    <Tag style={{ background: typeStyle.bg, color: typeStyle.color, border: 'none', borderRadius: '4px', fontSize: '11px' }}>
                                        {interview.interviewType.toUpperCase()}
                                    </Tag>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                        <b>Job:</b> {getJobName(interview.job)}
                                    </Text>
                                </Space>
                            </div>
                        );
                    })}
                </div>
            </Modal>

            <CreateInterview
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onSubmit={() => { setIsModalVisible(false); message.success('Interview scheduled'); }}
                selectedDate={selectedDate}
            />
        </div>
    );
};

export default Interviews;
