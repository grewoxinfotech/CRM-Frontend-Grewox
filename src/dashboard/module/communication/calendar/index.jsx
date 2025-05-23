import React, { useState, useEffect } from 'react';
import { Calendar, Typography, Breadcrumb, Card, message, Button, Empty, Popconfirm, Tag, Badge, Modal, Tooltip } from 'antd';
import { FiHome, FiCalendar, FiPlus, FiTrash2, FiTag, FiClock, FiMapPin, FiPhone, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import './calender.scss';
import CreateEvent from './CreateCalender';
import { useGetAllCalendarEventsQuery, useDeleteCalendarEventMutation } from './services/calendarApi';

const { Title, Text } = Typography;

const defaultColor = '#1890ff';

const CalendarPage = () => {
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [events, setEvents] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [showAllEvents, setShowAllEvents] = useState(false);
    const [moreEvents, setMoreEvents] = useState({ visible: false, events: [], date: null });

    console.log('Upcoming Events:', upcomingEvents);

    const { data: calendarEvents, isLoading, isError } = useGetAllCalendarEventsQuery();
    const [deleteCalendarEvent, { isLoading: isDeleting }] = useDeleteCalendarEventMutation();

    useEffect(() => {
        if (calendarEvents) {
            const eventsArray = Array.isArray(calendarEvents)
                ? calendarEvents
                : calendarEvents?.data || [];

            setEvents(eventsArray);
        }
    }, [calendarEvents]);

    useEffect(() => {
        updateUpcomingEvents();
    }, [events]);

    const updateUpcomingEvents = () => {
        if (!Array.isArray(events)) {
            setUpcomingEvents([]);
            return;
        }

        const today = dayjs();
        // const upcoming = events
        //     .filter(event => dayjs(event.startDate).isSameOrAfter(today, 'day'))
        //     .sort((a, b) => dayjs(a.startDate).diff(dayjs(b.startDate)))
        //     .slice(0, 5);
        // setUpcomingEvents(upcoming);
        const upcoming = events
        .filter(event => dayjs(event.startDate).isSameOrAfter(today, 'day'))
        .sort((a, b) => dayjs(a.startDate).diff(dayjs(b.startDate)));
    setUpcomingEvents(upcoming);
    };

    const handleDateSelect = (date) => {
        setSelectedDate(date);
        setIsModalVisible(true);
    };

    const handleCreateEvent = (values) => {
        const newEvent = {
            id: events.length ? events.length + 1 : 1,
            name: values.name,
            startDate: values.startDate,
            endDate: values.endDate,
            color: values.color,
            label: values.label,
            event_type: values.event_type
        };

        setEvents(prevEvents => [...prevEvents, newEvent]);
        message.success('Event created successfully');
        setIsModalVisible(false);
    };

    const handleDeleteEvent = async (eventId) => {
        try {
            await deleteCalendarEvent(eventId).unwrap();
            message.success('Event deleted successfully');
        } catch (error) {
            console.error('Failed to delete event:', error);
            message.error('Failed to delete event');
        }
    };

    const getEventLabelColor = (label) => {
        switch (label) {
            case 'personal': return '#1890ff';
            case 'work': return '#52c41a';
            case 'important': return '#ff4d4f';
            case 'other': return '#faad14';
            default: return '#1890ff';
        }
    };

    const getEventLabelText = (label) => {
        switch (label) {
            case 'personal': return 'Personal';
            case 'work': return 'Work';
            case 'important': return 'Important';
            case 'other': return 'Other';
            default: return 'Event';
        }
    };

    const getEventTypeIcon = (type) => {
        switch (type) {
            case 'meeting': return <FiCalendar style={{ fontSize: '16px' }} />;
            case 'call': return <FiPhone style={{ fontSize: '16px' }} />;
            case 'appointment': return <FiClock style={{ fontSize: '16px' }} />;
            case 'reminder': return <FiTag style={{ fontSize: '16px' }} />;
            default: return <FiCalendar style={{ fontSize: '16px' }} />;
        }
    };

    const dateCellRender = (date) => {
        if (!Array.isArray(events)) {
            return null;
        }
        const dayEvents = events.filter(
            event => dayjs(event.startDate).format('YYYY-MM-DD') === date.format('YYYY-MM-DD')
        );
        if (dayEvents.length === 0) return null;
        return (
            <div className="event-cell">
                <Tooltip
                    title={
                        <>
                            <div><strong>{dayEvents[0].name}</strong></div>
                            <div>Time: {dayEvents[0].startDate ? dayjs(dayEvents[0].startDate).format('HH:mm') : ''}</div>
                            {dayEvents[0].label && (
                                <div>Type: {getEventLabelText(dayEvents[0].label)}</div>
                            )}
                        </>
                    }
                    placement="top"
                >
                    <div
                        className="calendar-event"
                        style={{ cursor: 'pointer' }}
                        onClick={e => {
                            e.stopPropagation();
                            setMoreEvents({ visible: true, events: dayEvents, date: date.format('DD-MM-YYYY') });
                        }}
                    >
                        <div className="event-name">{dayEvents[0].name}</div>
                        <div className="event-time">{dayEvents[0].startDate ? dayjs(dayEvents[0].startDate).format('HH:mm') : ''}</div>
                        {dayEvents[0].label && (
                            <div className="event-label" style={{
                                fontSize: '11px',
                                color: dayEvents[0].color,
                                marginTop: '2px'
                            }}>
                                {getEventLabelText(dayEvents[0].label)}
                            </div>
                        )}
                    </div>
                </Tooltip>
                {dayEvents.length > 1 && (
                    <div
                        className="more-events-link"
                        onClick={e => {
                            e.stopPropagation();
                            setMoreEvents({ visible: true, events: dayEvents, date: date.format('DD-MM-YYYY') });
                        }}
                        style={{ color: '#1890ff', cursor: 'pointer', fontSize: 12, marginTop: 2 }}
                    >
                        +{dayEvents.length - 1} more
                    </div>
                )}
            </div>
        );
    };

    const displayedEvents = showAllEvents ? upcomingEvents : upcomingEvents.slice(0, 2);

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
                            <Link to="/dashboard/communication">Communication</Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>Calendar</Breadcrumb.Item>
                    </Breadcrumb>
                </div>
                <div className="page-header">
                    <div className="page-title">
                        <Title level={2}>Calendar</Title>
                        <Text type="secondary">Loading calendar data...</Text>
                    </div>
                </div>
                <Card style={{ textAlign: 'center', padding: '50px' }}>
                    Loading calendar...
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
                    <div className="event-cards-list">
                        <div className="event-cards">
                        {isLoading ? (
                            <div style={{ textAlign: 'center', padding: '20px' }}>Loading events...</div>
                        ) : isError ? (
                            <div style={{ textAlign: 'center', padding: '20px', color: 'red' }}>Error loading events</div>
                        ) : !upcomingEvents.length ? (
                            <Empty
                                description="No upcoming events"
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                            />
                        ) : (
                                <>
                                    {displayedEvents.map(event => (
                                <div key={event.id} className="interview-card" style={{ marginBottom: '8px' }}>
                                    <div className="card-content">
                                        <div className="candidate-info">
                                            <div className="candidate-name" style={{ fontSize: '14px', marginBottom: '8px' }}>
                                                {event.name}
                                            </div>
                                            <div className="interview-datetime" style={{ flexWrap: 'wrap', gap: '4px' }}>
                                                <div className="date" style={{ fontSize: '12px', padding: '2px 8px' }}>
                                                    <FiCalendar style={{ marginRight: '4px', color: '#1890ff' }} />
                                                    {dayjs(event.startDate).format('MMM DD')}
                                                </div>
                                                <div className="time" style={{ fontSize: '12px', padding: '2px 8px' }}>
                                                    <FiClock style={{ marginRight: '4px', color: '#722ed1' }} />
                                                    {dayjs(event.startDate).format('HH:mm')}
                                                </div>
                                                {event.label && (
                                                    <div className="type" style={{
                                                        background: getEventLabelColor(event.label),
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: '20px',
                                                        padding: '2px 8px',
                                                        fontSize: '12px',
                                                        fontWeight: 500
                                                    }}>
                                                        {getEventLabelText(event.label)}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            className="delete-button"
                                            type="text"
                                            danger
                                            icon={<FiTrash2 size={14} />}
                                            onClick={() => handleDeleteEvent(event.id)}
                                            style={{ padding: '4px' }}
                                        />
                                    </div>
                                </div>
                                    ))}
                                </>
                            )}
                        </div>
                        {upcomingEvents.length > 2 && (
                            <Button
                                type="text"
                                className="show-more-button"
                                onClick={() => setShowAllEvents(!showAllEvents)}
                                icon={showAllEvents ? <FiChevronUp /> : <FiChevronDown />}
                                style={{
                                    margin: '0 auto',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#1890ff',
                                    fontWeight: 500,
                                    background: '#f0f7ff',
                                    border: '1px solid #91caff',
                                    borderRadius: 8,
                                    marginTop: 8,
                                    width: '90%'
                                }}
                            >
                                {showAllEvents ? 'Show Less' : `Show ${upcomingEvents.length - 2} More`}
                            </Button>
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
                        className='calendar'
                        dateCellRender={dateCellRender}
                        onSelect={handleDateSelect}
                        value={selectedDate}
                    />
                </Card>
            </div>

            <CreateEvent
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onSubmit={handleCreateEvent}
                selectedDate={selectedDate}
            />

            <Modal
                open={moreEvents.visible}
                title={<span style={{ color: '#fff' }}>{`Events for ${moreEvents.date}`}</span>}
                footer={null}
                onCancel={() => setMoreEvents({ visible: false, events: [], date: null })}
                width={600}
                className="event-details-modal"
            >
                {moreEvents.events.map((event, idx) => (
                    <div
                        key={idx}
                        style={{
                            marginBottom: 16,
                            padding: 16,
                            borderRadius: 12,
                            background: '#f5faff',
                            border: `1px solid ${event.color || '#1890ff'}20`,
                            borderLeft: `4px solid ${event.color || '#1890ff'}`,
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ 
                                    fontWeight: 600, 
                                    fontSize: 16,
                                    color: '#1f2937',
                                    marginBottom: 8
                                }}>
                                    {event.name}
                                </div>
                                
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {/* <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <FiCalendar style={{ color: '#64748b' }} />
                                        <span style={{ color: '#64748b', fontSize: 14 }}>
                                            {dayjs(event.startDate).format('MMM DD, YYYY')}
                                        </span>
                                    </div> */}
                                    
                                    {/* <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <FiClock style={{ color: '#64748b' }} />
                                        <span style={{ color: '#64748b', fontSize: 14 }}>
                                            {dayjs(event.startDate).format('HH:mm')} - {dayjs(event.endDate).format('HH:mm')}
                                        </span>
                                    </div> */}

                                    {event.label && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <FiTag style={{ color: '#64748b' }} />
                                            <span style={{ 
                                                display: 'inline-block',
                                                background: `${event.color}15`,
                                                color: event.color,
                                                padding: '4px 12px',
                                                borderRadius: 6,
                                                fontSize: 13,
                                                fontWeight: 500
                                            }}>
                                                {getEventLabelText(event.label)}
                                            </span>
                                        </div>
                                    )}

                                    {/* <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                        <FiHome style={{ color: '#64748b' }} />
                                        <span style={{ color: '#64748b', fontSize: 14 }}>
                                            Created by: {event.created_by}
                                        </span>
                                    </div> */}
                                </div>
                            </div>

                            <div style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'flex-end',
                                gap: 8
                            }}>
                                <div style={{ 
                                    color: event.color || '#1890ff',
                                    fontWeight: 600,
                                    fontSize: 15,
                                    padding: '4px 12px',
                                    background: `${event.color}15`,
                                    borderRadius: 6
                                }}>
                                    {dayjs(event.startDate).format('HH:mm')}
                                </div>
                                
                                {/* <Popconfirm
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
                                    />
                                </Popconfirm> */}
                            </div>
                        </div>
                    </div>
                ))}
            </Modal>
        </div>
    );
};

export default CalendarPage;
