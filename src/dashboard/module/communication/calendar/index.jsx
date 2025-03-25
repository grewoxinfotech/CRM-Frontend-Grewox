import React, { useState, useEffect } from 'react';
import { Calendar, Typography, Breadcrumb, Card, message, Button, Empty, Popconfirm, Tag, Badge } from 'antd';
import { FiHome, FiCalendar, FiPlus, FiTrash2, FiTag, FiClock, FiMapPin, FiPhone } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import './calender.scss';
import CreateEvent from './CreateCalender';

const { Title, Text } = Typography;

const defaultColor = '#1890ff';

const CalendarPage = () => {
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [events, setEvents] = useState([
        {
            id: 1,
            title: 'Team Meeting',
            startDate: dayjs().format('YYYY-MM-DD'),
            startTime: '10:00',
            endTime: '11:30',
            color: '#ff4d4f',
            label: 'work',
            event_type: 'meeting'
        },
        {
            id: 2,
            title: 'Doctor Appointmentasdsadsadasdasddfdsfsdfsf',
            startDate: dayjs().add(1, 'day').format('YYYY-MM-DD'),
            startTime: '14:00',
            endTime: '15:00',
            color: '#52c41a',
            label: 'personal',
            event_type: 'appointment'
        },
        {
            id: 3,
            title: 'Client Call',
            startDate: dayjs().add(2, 'day').format('YYYY-MM-DD'),
            startTime: '09:30',
            endTime: '10:30',
            color: '#1890ff',
            label: 'important',
            event_type: 'call'
        }
    ]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);

    useEffect(() => {
        updateUpcomingEvents();
    }, [events]);

    const updateUpcomingEvents = () => {
        const today = dayjs();
        const upcoming = events
            .filter(event => dayjs(event.startDate).isSameOrAfter(today, 'day'))
            .sort((a, b) => dayjs(a.startDate).diff(dayjs(b.startDate)))
            .slice(0, 5);
        setUpcomingEvents(upcoming);
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setIsModalVisible(true);
    };

    const handleCreateEvent = (values) => {
        const newEvent = {
            id: events.length ? events.length + 1 : 1,
            title: values.title,
            startDate: values.startDate,
            startTime: values.start_time,
            endTime: values.end_time,
            color: values.color,
            label: values.label,
            event_type: values.event_type
        };
        
      
        setEvents(prevEvents => [...prevEvents, newEvent]);
        message.success('Event created successfully');
        setIsModalVisible(false);
    };

    const handleDeleteEvent = (eventId) => {
        setEvents(events.filter(event => event.id !== eventId));
        message.success('Event deleted successfully');
    };

    const getEventLabelColor = (label) => {
        switch(label) {
            case 'personal': return '#1890ff';
            case 'work': return '#52c41a';
            case 'important': return '#ff4d4f';
            case 'other': return '#faad14';
            default: return '#1890ff';
        }
    };

    const getEventLabelText = (label) => {
        switch(label) {
            case 'personal': return 'Personal';
            case 'work': return 'Work';
            case 'important': return 'Important';
            case 'other': return 'Other';
            default: return 'Event';
        }
    };

    const getEventTypeIcon = (type) => {
        switch(type) {
            case 'meeting': return <FiCalendar style={{ fontSize: '16px' }} />;
            case 'call': return <FiPhone style={{ fontSize: '16px' }} />;
            case 'appointment': return <FiClock style={{ fontSize: '16px' }} />;
            case 'reminder': return <FiTag style={{ fontSize: '16px' }} />;
            default: return <FiCalendar style={{ fontSize: '16px' }} />;
        }
    };

    const dateCellRender = (date) => {
        const dayEvents = events.filter(
            event => dayjs(event.startDate).format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
        );

        return dayEvents.length > 0 ? (
            <div className="event-cell" style={{
                height: '100%',
                width: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                backgroundColor: `${dayEvents[0].color}15`,
                borderLeft: `4px solid ${dayEvents[0].color}`,
                padding: '4px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
            }}>
                {dayEvents.map(event => (
                    <div 
                        key={event.id} 
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
                                <span className="event-time" style={{ 
                                    color: event.color || defaultColor,
                                    fontSize: '15px',
                                    fontWeight: '750'
                                }}>
                                    {event.startTime}
                                </span>
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
                                    {event.title}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        ) : null;
    };

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
                        <Link to="/dashboard/communication">Communication</Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Item>Calendar</Breadcrumb.Item>
                </Breadcrumb>
            </div>

            <div className="page-header">
                <div className="page-title">
                    <Title level={2}>Calendar</Title>
                    <Text type="secondary">Manage your events and schedules</Text>
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
                            Upcoming Events
                        </Title>
                    </div>
                    <div className="event-cards" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                        {!upcomingEvents.length ? (
                            <Empty 
                                description="No upcoming events" 
                                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                            />
                        ) : (
                            upcomingEvents.map(event => (
                                <div 
                                    key={event.id} 
                                    className="event-card"
                                    style={{ 
                                        backgroundColor: `${event.color}15`,
                                        borderLeft: `4px solid ${event.color || defaultColor}`,
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
                                                    {getEventTypeIcon(event.event_type)}
                                                    <span className="event-title" style={{
                                                        fontSize: '16px',
                                                        fontWeight: '500',
                                                        color: '#333',
                                                        maxWidth: '200px',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap'
                                                    }}>{event.title}</span>
                                                </div>
                                                {event.label && (
                                                    <Tag 
                                                        color={getEventLabelColor(event.label)}
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
                                                        {getEventLabelText(event.label)}
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
                                                    color: event.color || defaultColor,
                                                    fontSize: '14px',
                                                    fontWeight: '500'
                                                }}>
                                                    <FiCalendar style={{ marginRight: '8px' }} />
                                                    {dayjs(event.startDate).format('MMM DD, YYYY')}
                                                </div>
                                                <div className="event-time" style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    color: event.color || defaultColor,
                                                    fontSize: '14px',
                                                    fontWeight: '500'
                                                }}>
                                                    <FiClock style={{ marginRight: '8px' }} />
                                                    {event.startTime} - {event.endTime}
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
                                            title="Delete Event"
                                            description="Are you sure you want to delete this event?"
                                            onConfirm={() => handleDeleteEvent(event.id)}
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

            {/* <Button
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
            /> */}

            <CreateEvent
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onSubmit={handleCreateEvent}
                selectedDate={selectedDate}
            />
        </div>
    );
};

export default CalendarPage;
