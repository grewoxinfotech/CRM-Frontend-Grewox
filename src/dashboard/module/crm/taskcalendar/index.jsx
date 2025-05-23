import React, { useState, useEffect } from 'react';
import { Calendar, Typography, Breadcrumb, Card, message, Button, Empty, Popconfirm, Tag, Badge, Tooltip, Modal } from 'antd';
import { FiHome, FiCalendar, FiPlus, FiTrash2, FiTag, FiClock, FiMapPin, FiPhone, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import './taskcalender.scss';
import CreateTaskCalendar from './CreateTaskCalender';
import { useGetAllTaskCalendarEventsQuery, useDeleteTaskCalendarEventMutation } from './services/taskCalender';

const { Title, Text } = Typography;

const defaultColor = '#1890ff';

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

    const { data: calendarTasks, isLoading, isError } = useGetAllTaskCalendarEventsQuery();
    const [deleteTaskCalendarEvent, { isLoading: isDeleting }] = useDeleteTaskCalendarEventMutation();

    useEffect(() => {
        if (calendarTasks) {
            const tasksArray = Array.isArray(calendarTasks)
                ? calendarTasks
                : calendarTasks?.data || [];

            setTasks(tasksArray);
        }
    }, [calendarTasks]);

    useEffect(() => {
        updateUpcomingTasks();
    }, [tasks]);

    const updateUpcomingTasks = () => {
        if (!Array.isArray(tasks)) {
            setUpcomingTasks([]);
            return;
        }

        const today = dayjs();
        const upcoming = tasks
            .filter(task => dayjs(task.taskDate).isSameOrAfter(today, 'day'))
            .sort((a, b) => dayjs(a.taskDate).diff(dayjs(b.taskDate)));
        setUpcomingTasks(upcoming);
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setIsModalVisible(true);
    };

    const handleCreateTask = (values) => {
        const newTask = {
            taskName: values.title,
            taskDate: values.startDate,
            taskTime: values.start_time,
            taskDescription: values.description,
            client_id: values.client_id,
            created_by: values.created_by
        };

        setTasks(prevTasks => [...prevTasks, newTask]);
        message.success('Task created successfully');
        setIsModalVisible(false);
    };

    const handleDeleteTask = async (taskId) => {
        try {
            await deleteTaskCalendarEvent(taskId).unwrap();
            message.success('Task deleted successfully');
        } catch (error) {
            console.error('Failed to delete task:', error);
            message.error('Failed to delete task');
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return '#ff4d4f';
            case 'medium': return '#faad14';
            case 'low': return '#52c41a';
            case 'normal': return '#1890ff';
            default: return '#1890ff';
        }
    };

    const getPriorityText = (priority) => {
        switch (priority) {
            case 'high': return 'High Priority';
            case 'medium': return 'Medium Priority';
            case 'low': return 'Low Priority';
            case 'normal': return 'Normal';
            default: return 'Normal';
        }
    };

    const getTaskTypeIcon = (type) => {
        switch (type) {
            case 'task': return <FiCalendar style={{ fontSize: '16px' }} />;
            case 'call': return <FiPhone style={{ fontSize: '16px' }} />;
            case 'meeting': return <FiClock style={{ fontSize: '16px' }} />;
            case 'reminder': return <FiTag style={{ fontSize: '16px' }} />;
            default: return <FiCalendar style={{ fontSize: '16px' }} />;
        }
    };

    const dateCellRender = (date) => {
        if (!Array.isArray(tasks)) return null;

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
                        style={{ cursor: 'pointer' }}
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
                        style={{ color: '#1890ff', cursor: 'pointer', fontSize: 12, marginTop: 2 }}
                    >
                        +{dayTasks.length - 1} more
                    </div>
                )}
            </div>
        );
    };

    const displayedTasks = showAllTasks ? upcomingTasks : upcomingTasks.slice(0, 2);

    if (isLoading) {
        return (
            <div className="task-calendar-page">
                <div className="page-breadcrumb">
                    <Breadcrumb>
                        <Breadcrumb.Item>
                            <Link to="/dashboard">
                                <FiHome style={{ marginRight: '4px' }} />
                                Home
                            </Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>
                            <Link to="/dashboard/crm">CRM</Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>Task Calendar</Breadcrumb.Item>
                    </Breadcrumb>
                </div>
                <div className="page-header">
                    <div className="page-title">
                        <Title level={2}>Task Calendar</Title>
                        <Text type="secondary">Loading task calendar data...</Text>
                    </div>
                </div>
                <Card style={{ textAlign: 'center', padding: '50px' }}>
                    Loading task calendar...
                </Card>
            </div>
        );
    }

    return (
        <div className="task-calendar-page">
            <div className="page-breadcrumb">
                <Breadcrumb>
                    <Breadcrumb.Item>
                        <Link to="/dashboard">
                            <FiHome style={{ marginRight: '4px' }} />
                            Home
                        </Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>
                        <Link to="/dashboard/crm">CRM</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Task Calendar</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Task Calendar</Title>
                    <Text type="secondary">Manage your tasks and events</Text>
                </div>
            </div>

            <div className="task-calendar-content">
                <Card className="upcoming-tasks" loading={isLoading}>
                    <div className="section-header">
                        <Title level={4}>
                            <FiCalendar style={{ marginRight: '8px' }} />
                            Upcoming Tasks
                        </Title>
                    </div>
                    <div className="task-cards">
                        {!upcomingTasks.length ? (
                            <Empty
                                description="No tasks scheduled"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        ) : (
                            <>
                                {displayedTasks.map(task => (
                                    <div key={task.id} className="task-card">
                                        <div className="card-content">
                                            <div className="task-info">
                                                <div className="task-name">
                                                    {task.taskName}
                                                </div>
                                                <div className="task-datetime">
                                                    <div className="date">
                                                        <FiCalendar style={{ marginRight: '4px', color: '#1890ff' }} />
                                                        {dayjs(task.taskDate).format('MMM DD, YYYY')}
                                                    </div>
                                                    <div className="time">
                                                        <FiClock style={{ marginRight: '4px', color: '#1890ff' }} />
                                                        {task.taskTime}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                className="delete-button"
                                                type="text"
                                                danger
                                                icon={<FiTrash2 size={16} />}
                                                onClick={() => handleDeleteTask(task.id)}
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
                                    >
                                        {showAllTasks ? 'Show Less' : `Show ${upcomingTasks.length - 2} More`}
                                    </Button>
                                )}
                            </>
                        )}
                    </div>
                </Card>

                <Card className="calendar-card" loading={isLoading}>
                    <Calendar
                        className="calendar"
                        dateCellRender={dateCellRender}
                        onSelect={handleDateSelect}
                    />
                </Card>
            </div>

            <CreateTaskCalendar
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onSubmit={handleCreateTask}
                selectedDate={selectedDate}
            />

            <Modal
                open={moreEvents.visible}
                title={<span style={{ color: '#fff' }}>{`Events for ${moreEvents.date}`}</span>}
                footer={null}
                onCancel={() => setMoreEvents({ visible: false, events: [], date: null })}
            >
                {moreEvents.events.map((task, idx) => (
                    <div
                        key={idx}
                        style={{
                            marginBottom: 12,
                            padding: 12,
                            borderRadius: 10,
                            background: '#f5faff',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            minHeight: 48
                        }}
                    >
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 15 }}>{task.taskName}</div>
                            {task.taskType && (
                                <span
                                    style={{
                                        display: 'inline-block',
                                        background: getTypeColor(task.taskType).bg,
                                        color: getTypeColor(task.taskType).color,
                                        borderRadius: 8,
                                        fontSize: 12,
                                        fontWeight: 500,
                                        padding: '2px 10px',
                                        marginTop: 4
                                    }}
                                >
                                    {task.taskType}
                                </span>
                            )}
                        </div>
                        <div style={{ color: '#1890ff', fontWeight: 700, fontSize: 15, minWidth: 48, textAlign: 'right' }}>
                            {task.taskTime?.slice(0, 5)}
                        </div>
                    </div>
                ))}
            </Modal>
        </div>
    );
};

export default TaskCalendarPage;
