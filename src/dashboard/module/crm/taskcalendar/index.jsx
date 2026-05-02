import React, { useState, useEffect } from 'react';
import { Calendar, Typography, Card, message, Button, Empty, Tooltip, Modal, Space } from 'antd';
import { FiHome, FiCalendar, FiPlus, FiTrash2, FiTag, FiClock, FiPhone, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import './taskcalender.scss';
import CreateTaskCalendar from './CreateTaskCalender';
import { useGetAllTaskCalendarEventsQuery, useDeleteTaskCalendarEventMutation } from './services/taskCalender';
import PageHeader from '../../../../components/PageHeader';

dayjs.extend(isSameOrAfter);

const { Title, Text } = Typography;

const getTypeColor = (type) => {
    switch ((type || '').toLowerCase()) {
        case 'task':
            return { bg: '#e6f7ff', color: '#1890ff' };
        case 'meeting':
            return { bg: '#fffbe6', color: '#faad14' };
        case 'call':
            return { bg: '#f6ffed', color: '#52c41a' };
        case 'reminder':
            return { bg: '#fff0f6', color: '#eb2f96' };
        default:
            return { bg: '#f5f5f5', color: '#8c8c8c' };
    }
};

const TaskCalendarPage = () => {
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [upcomingTasks, setUpcomingTasks] = useState([]);
    const [showAllTasks, setShowAllTasks] = useState(false);
    const [moreEvents, setMoreEvents] = useState({ visible: false, events: [], date: null });

    const { data: calendarTasks, isLoading } = useGetAllTaskCalendarEventsQuery();
    const [deleteTaskCalendarEvent] = useDeleteTaskCalendarEventMutation();

    useEffect(() => {
        if (calendarTasks) {
            const tasksArray = Array.isArray(calendarTasks)
                ? calendarTasks
                : calendarTasks?.data || [];
            setTasks(tasksArray);
        }
    }, [calendarTasks]);

    useEffect(() => {
        if (!Array.isArray(tasks)) {
            setUpcomingTasks([]);
            return;
        }
        const today = dayjs();
        const upcoming = tasks
            .filter(task => dayjs(task.taskDate).isSameOrAfter(today, 'day'))
            .sort((a, b) => dayjs(a.taskDate).diff(dayjs(b.taskDate)));
        setUpcomingTasks(upcoming);
    }, [tasks]);

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setIsModalVisible(true);
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await deleteTaskCalendarEvent(taskId).unwrap();
            message.success('Task deleted successfully');
        } catch (error) {
            message.error('Failed to delete task');
        }
    };

    const dateCellRender = (date) => {
        const dayTasks = tasks.filter(
            task => dayjs(task.taskDate).format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
        );

        if (dayTasks.length === 0) return null;

        return (
            <div className="task-cell">
                <Tooltip
                    title={
                        <>
                            <div><strong>{dayTasks[0].taskName}</strong></div>
                            <div>Time: {dayTasks[0].taskTime?.slice(0, 5)}</div>
                        </>
                    }
                    placement="top"
                >
                    <div
                        className="calendar-event"
                        onClick={e => {
                            e.stopPropagation();
                            setMoreEvents({ visible: true, events: dayTasks, date: date.format('DD-MM-YYYY') });
                        }}
                    >
                        <div className="event-name">{dayTasks[0].taskName}</div>
                        <div className="event-time">{dayTasks[0].taskTime?.slice(0, 5)}</div>
                    </div>
                </Tooltip>
                {dayTasks.length > 1 && (
                    <div
                        className="more-events-link"
                        onClick={e => {
                            e.stopPropagation();
                            setMoreEvents({ visible: true, events: dayTasks, date: date.format('DD-MM-YYYY') });
                        }}
                    >
                        +{dayTasks.length - 1} more
                    </div>
                )}
            </div>
        );
    };

    const displayedTasks = showAllTasks ? upcomingTasks : upcomingTasks.slice(0, 2);

    return (
        <div className="task-calendar-page standard-page-container">
            <PageHeader
                title="Task Calendar"
                subtitle="Manage your tasks and events"
                breadcrumbItems={[
                    { title: <Link to="/dashboard"><FiHome style={{ marginRight: '4px' }} /> Home</Link> },
                    { title: "CRM" },
                    { title: "Task Calendar" },
                ]}
                onAdd={() => setIsModalVisible(true)}
                addText="Create Task"
            />

            <div className="task-calendar-content">
                <Card className="upcoming-tasks standard-content-card" loading={isLoading}>
                    <div className="section-header">
                        <Title level={4} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FiCalendar style={{ color: '#4f46e5' }} />
                            Upcoming Tasks
                        </Title>
                    </div>
                    <div className="task-cards">
                        {!upcomingTasks.length ? (
                            <Empty description="No tasks scheduled" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        ) : (
                            <>
                                {displayedTasks.map(task => (
                                    <div key={task.id} className="task-card">
                                        <div className="card-content">
                                            <div className="task-info">
                                                <div className="task-name">{task.taskName}</div>
                                                <div className="task-datetime">
                                                    <div className="date">
                                                        <FiCalendar size={12} />
                                                        {dayjs(task.taskDate).format('MMM DD, YYYY')}
                                                    </div>
                                                    <div className="time">
                                                        <FiClock size={12} />
                                                        {task.taskTime}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                type="text"
                                                danger
                                                icon={<FiTrash2 size={14} />}
                                                onClick={() => handleDeleteTask(task.id)}
                                                className="delete-button"
                                            />
                                        </div>
                                    </div>
                                ))}
                                {upcomingTasks.length > 2 && (
                                    <Button
                                        type="text"
                                        className="show-more-button"
                                        onClick={() => setShowAllTasks(!showAllTasks)}
                                        icon={showAllTasks ? <FiChevronUp /> : <FiChevronDown />}
                                        style={{ width: '100%', marginTop: '8px' }}
                                    >
                                        {showAllTasks ? 'Show Less' : `Show ${upcomingTasks.length - 2} More`}
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

            <CreateTaskCalendar
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onSubmit={() => { setIsModalVisible(false); message.success('Task scheduled'); }}
                selectedDate={selectedDate}
            />

            <Modal
                open={moreEvents.visible}
                title={<span style={{ color: '#1e293b', fontWeight: 600 }}>{`Events for ${moreEvents.date}`}</span>}
                footer={null}
                onCancel={() => setMoreEvents({ visible: false, events: [], date: null })}
                centered
                width={400}
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {moreEvents.events.map((task, idx) => (
                        <div
                            key={idx}
                            style={{
                                padding: '12px',
                                borderRadius: '8px',
                                background: '#f8fafc',
                                border: '1px solid #f1f5f9',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}
                        >
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: 600, fontSize: '14px', color: '#1e293b' }}>{task.taskName}</div>
                                {task.taskType && (
                                    <Tag
                                        style={{
                                            background: getTypeColor(task.taskType).bg,
                                            color: getTypeColor(task.taskType).color,
                                            border: 'none',
                                            borderRadius: '4px',
                                            fontSize: '11px',
                                            margin: '4px 0 0 0'
                                        }}
                                    >
                                        {task.taskType.toUpperCase()}
                                    </Tag>
                                )}
                            </div>
                            <div style={{ color: '#4f46e5', fontWeight: 700, fontSize: '14px' }}>
                                {task.taskTime?.slice(0, 5)}
                            </div>
                        </div>
                    ))}
                </div>
            </Modal>
        </div>
    );
};

export default TaskCalendarPage;
