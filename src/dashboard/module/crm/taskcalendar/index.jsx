import React, { useState, useEffect } from 'react';
import { Calendar, Typography, Breadcrumb, Card, message, Button, Empty, Popconfirm, Tag, Badge } from 'antd';
import { FiHome, FiCalendar, FiPlus, FiTrash2, FiTag, FiClock, FiMapPin, FiPhone } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import './taskcalender.scss';
import CreateTaskCalendar from './CreateTaskCalender';
import { useGetAllTaskCalendarEventsQuery, useDeleteTaskCalendarEventMutation } from './services/taskCalender';

const { Title, Text } = Typography;

const defaultColor = '#1890ff';

const TaskCalendarPage = () => {
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [tasks, setTasks] = useState([]);
    const [upcomingTasks, setUpcomingTasks] = useState([]);
    
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
            .filter(task => dayjs(task.startDate).isSameOrAfter(today, 'day'))
            .sort((a, b) => dayjs(a.startDate).diff(dayjs(b.startDate)))
            .slice(0, 5);
        setUpcomingTasks(upcoming);
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setIsModalVisible(true);
    };

    const handleCreateTask = (values) => {
        const newTask = {
            id: tasks.length ? tasks.length + 1 : 1,
            title: values.title,
            startDate: values.startDate,
            startTime: values.start_time,
            endTime: values.end_time,
            color: values.color,
            priority: values.priority,
            task_type: values.task_type || 'task'
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
        switch(priority) {
            case 'high': return '#ff4d4f';
            case 'medium': return '#faad14';
            case 'low': return '#52c41a';
            case 'normal': return '#1890ff';
            default: return '#1890ff';
        }
    };

    const getPriorityText = (priority) => {
        switch(priority) {
            case 'high': return 'High Priority';
            case 'medium': return 'Medium Priority';
            case 'low': return 'Low Priority';
            case 'normal': return 'Normal';
            default: return 'Normal';
        }
    };

    const getTaskTypeIcon = (type) => {
        switch(type) {
            case 'task': return <FiCalendar style={{ fontSize: '16px' }} />;
            case 'call': return <FiPhone style={{ fontSize: '16px' }} />;
            case 'meeting': return <FiClock style={{ fontSize: '16px' }} />;
            case 'reminder': return <FiTag style={{ fontSize: '16px' }} />;
            default: return <FiCalendar style={{ fontSize: '16px' }} />;
        }
    };

    const dateCellRender = (date) => {
        if (!Array.isArray(tasks)) {
            return null;
        }

        const dayTasks = tasks.filter(
            task => dayjs(task.startDate).format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
        );

        return dayTasks.length > 0 ? (
            <div className="event-cell" style={{
                height: '100%',
                width: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                backgroundColor: `${dayTasks[0].color}15`,
                borderLeft: `4px solid ${dayTasks[0].color}`,
                padding: '4px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
            }}>
                {dayTasks.map(task => (
                    <div 
                        key={task.id} 
                        className="event-item"
                        style={{
                            marginBottom: '4px',
                            borderRadius: '4px',
                            padding: '4px 8px',
                            width: '95%',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <div className="event-details">
                            <div style={{ 
                                display: 'flex', 
                                flexDirection: 'column',
                                alignItems: 'start',
                                gap: '2px'
                            }}>
                               
                                <span className="event-title" style={{
                                    fontSize: '14px',
                                    color: '#333',
                                    textAlign: 'left',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    width: '100%',
                                    maxWidth: '120px'
                                }}>
                                    {task.taskName}
                                </span>
                                <span className="event-time" style={{ 
                                    color: task.color || defaultColor,
                                    fontSize: '15px',
                                    fontWeight: '750'
                                }}>
                                    {task.taskTime}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : null;
    };

    if (isLoading) {
        return (
            <div className="calendar-page">
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
        <div className="calendar-page">
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
                    <Text type="secondary">Manage your tasks and schedules</Text>
                </div>
            </div>

            <div className="calendar-content" style={{ display: 'flex', gap: '24px' }}>
                <Card 
                    className="upcoming-events" 
                    style={{ 
                        width: '380px',
                        
                        height: 'fit-content',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                >
                    <div className="section-header" style={{ marginBottom: '16px' }}>
                        <Title level={4} style={{ margin: 0 }}>
                            <FiCalendar style={{ marginRight: '8px' }} />
                            Upcoming Tasks
                        </Title>
                    </div>
                    <div className="event-cards" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                        {isLoading ? (
                            <div style={{ textAlign: 'center', padding: '20px' }}>Loading tasks...</div>
                        ) : isError ? (
                            <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>Error loading tasks</div>
                        ) : !upcomingTasks.length ? (
                            <Empty 
                                description="No upcoming tasks" 
                                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                            />
                        ) : (
                            upcomingTasks.map(task => (
                                <div 
                                    key={task.id} 
                                    className="event-card"
                                    style={{ 
                                        backgroundColor: `${task.color}15`,
                                        borderLeft: `4px solid ${task.color || defaultColor}`,
                                        padding: '16px',
                                        borderRadius: '8px',
                                        marginBottom: '12px',
                                        position: 'relative',
                                        transition: 'all 0.3s ease',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <div className="card-content">
                                        <div className="event-info" style={{ width: '100%' }}>
                                            <div className="event-header" style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'start',
                                                marginBottom: '12px',
                                                textAlign: 'center'
                                            }}>
                                                <div className="event-title-container" style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    marginBottom: '8px'
                                                }}>
                                                    {getTaskTypeIcon(task.task_type)}
                                                    <span className="event-title" style={{
                                                        fontSize: '16px',
                                                        fontWeight: '500',
                                                        color: '#333',
                                                        maxWidth: '200px',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}>{task.taskName}</span>
                                                </div>
                                                {task.priority && (
                                                    <Tag 
                                                        color={getPriorityColor(task.priority)}
                                                        style={{ 
                                                            padding: '4px 12px',
                                                            borderRadius: '4px',
                                                            fontSize: '12px'
                                                        }}
                                                    >
                                                        <FiTag 
                                                            style={{ 
                                                                marginRight: '4px', 
                                                                fontSize: '12px',
                                                                verticalAlign: 'middle' 
                                                            }} 
                                                        />
                                                        {getPriorityText(task.priority)}
                                                    </Tag>
                                                )}
                                            </div>
                                            <div className="event-datetime" style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'start',
                                                gap: '8px'
                                            }}>
                                                <div className="event-date" style={{
                                                    display: 'flex',
                                                    alignItems: '   ',
                                                    color: task.color || defaultColor,
                                                    fontSize: '14px',
                                                    fontWeight: '500'
                                                }}>
                                                    <FiCalendar style={{ marginRight: '8px' }} />
                                                    {dayjs(task.startDate).format('MMM DD, YYYY')}
                                                </div>
                                               
                                                <div className="event-time" style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    color: task.color || defaultColor,
                                                    fontSize: '14px',
                                                    fontWeight: '500'
                                                }}>
                                                    <FiClock style={{ marginRight: '8px' }} />
                                                     {task.taskTime}
                                                </div>
                                            </div>
                                            <div className="event-header" style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'start',
                                                marginBottom: '12px',
                                                textAlign: 'center'
                                            }}>
                                                
                                            </div>
                                        </div>
                                        <Popconfirm
                                            title="Delete Task"
                                            description="Are you sure you want to delete this task?"
                                            onConfirm={() => handleDeleteTask(task.id)}
                                            okText="Yes"
                                            cancelText="No"
                                            placement="left"
                                        >
                                            <Button 
                                                className="delete-button"
                                                type="text" 
                                                danger
                                                icon={<FiTrash2 size={16} />}
                                                style={{
                                                    position: 'absolute',
                                                    top: '12px',
                                                    right: '12px',
                                                    opacity: 0.6,
                                                    transition: 'opacity 0.3s ease',
                                                    ':hover': {
                                                        opacity: 1
                                                    }
                                                }}
                                            />
                                        </Popconfirm>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </Card>

                <Card 
                    className="calendar-card"
                    style={{ 
                        flex: 1,
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}
                >
                    <Calendar
                        dateCellRender={dateCellRender}
                        onSelect={handleDateSelect}
                        value={selectedDate}
                    />
                </Card>
            </div>

            <Button
                type="primary"
                icon={<FiPlus />}
                onClick={() => setIsModalVisible(true)}
                className="create-event-button"
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '24px',
                    height: '48px',
                    width: '48px',
                    borderRadius: '24px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px'
                }}
            />

            <CreateTaskCalendar
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onSubmit={handleCreateTask}
                selectedDate={selectedDate}
            />
        </div>
    );
};

export default TaskCalendarPage;
