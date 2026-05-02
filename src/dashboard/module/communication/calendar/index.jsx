import React, { useState, useEffect } from 'react';
import { Calendar, Typography, Card, message, Button, Empty, Tag, Modal, Tooltip, Row, Col, Space } from 'antd';
import { FiHome, FiCalendar, FiPlus, FiTrash2, FiTag, FiClock } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import './calender.scss';
import CreateEvent from './CreateCalender';
import { useGetAllCalendarEventsQuery, useDeleteCalendarEventMutation } from './services/calendarApi';
import PageHeader from '../../../../components/PageHeader';

const { Title, Text } = Typography;

const CalendarPage = () => {
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [events, setEvents] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [moreEvents, setMoreEvents] = useState({ visible: false, events: [], date: null });

    const { data: calendarEvents, isLoading } = useGetAllCalendarEventsQuery();
    const [deleteCalendarEvent] = useDeleteCalendarEventMutation();

    useEffect(() => {
        if (calendarEvents) {
            const eventsArray = Array.isArray(calendarEvents) ? calendarEvents : calendarEvents?.data || [];
            setEvents(eventsArray);
            setUpcomingEvents(eventsArray.filter(e => dayjs(e.startDate).isSameOrAfter(dayjs(), 'day')).sort((a, b) => dayjs(a.startDate).diff(dayjs(b.startDate))));
        }
    }, [calendarEvents]);

    const handleDeleteEvent = async (eventId) => {
        try {
            await deleteCalendarEvent(eventId).unwrap();
            message.success('Event deleted successfully');
        } catch (error) {
            message.error('Failed to delete event');
        }
    };

    const getEventLabelColor = (label) => {
        const colors = { personal: '#3b82f6', work: '#10b981', important: '#ef4444', other: '#f59e0b' };
        return colors[label] || '#3b82f6';
    };

    const dateCellRender = (date) => {
        const dayEvents = events.filter(e => dayjs(e.startDate).format('YYYY-MM-DD') === date.format('YYYY-MM-DD'));
        if (dayEvents.length === 0) return null;
        return (
            <div className="calendar-event-cell-wrapper" onClick={(e) => { e.stopPropagation(); setMoreEvents({ visible: true, events: dayEvents, date: date.format('DD MMM') }); }}>
                {dayEvents.slice(0, 2).map((event, idx) => (
                    <div key={idx} className="calendar-event-item-mini" style={{ borderLeft: `2px solid ${event.color || getEventLabelColor(event.label)}` }}>
                        <span className="event-time-mini">{dayjs(event.startDate).format('HH:mm')}</span>
                        <span className="event-name-mini">{event.name}</span>
                    </div>
                ))}
                {dayEvents.length > 2 && <div className="more-events-indicator">+{dayEvents.length - 2} more</div>}
            </div>
        );
    };

    return (
        <div className="calendar-page standard-page-container">
            <PageHeader
                title="Calendar"
                subtitle="Manage your events and schedules"
                breadcrumbItems={[
                    { title: <Link to="/dashboard"><FiHome style={{ marginRight: '4px' }} /> Home</Link> },
                    { title: "Calendar" },
                ]}
                onAdd={() => setIsModalVisible(true)}
                addText="Add Event"
            />

            <Row gutter={[16, 16]} style={{ marginTop: '12px' }}>
                <Col xs={24} lg={7} xl={6}>
                    <Card className="standard-content-card" title={<><FiCalendar /> Upcoming Events</>}>
                        {upcomingEvents.length === 0 ? (
                            <Empty description="No upcoming events" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        ) : (
                            <div className="upcoming-events-sidebar-list">
                                {upcomingEvents.slice(0, 6).map(event => (
                                    <div key={event.id} className="upcoming-event-item-premium">
                                        <div className="event-accent-bar" style={{ background: event.color || getEventLabelColor(event.label) }} />
                                        <div className="event-info-box">
                                            <div className="event-title-main">{event.name}</div>
                                            <Space size={8}>
                                                <Tag icon={<FiClock size={10} />} style={{ fontSize: '10px', borderRadius: '4px', margin: 0 }}>{dayjs(event.startDate).format('MMM DD, HH:mm')}</Tag>
                                                {event.label && <Tag color="blue" style={{ fontSize: '10px', borderRadius: '4px', margin: 0, textTransform: 'capitalize' }}>{event.label}</Tag>}
                                            </Space>
                                        </div>
                                        <Button type="text" danger icon={<FiTrash2 size={14} />} onClick={() => handleDeleteEvent(event.id)} size="small" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>
                </Col>
                <Col xs={24} lg={17} xl={18}>
                    <Card className="standard-content-card calendar-main-card" bodyStyle={{ padding: '8px' }}>
                        <Calendar
                            dateCellRender={dateCellRender}
                            onSelect={(date) => { setSelectedDate(date); setIsModalVisible(true); }}
                            value={selectedDate}
                            className="premium-calendar-view"
                        />
                    </Card>
                </Col>
            </Row>

            <CreateEvent open={isModalVisible} onCancel={() => setIsModalVisible(false)} selectedDate={selectedDate} />

            <Modal
                open={moreEvents.visible}
                title={`Events for ${moreEvents.date}`}
                footer={null}
                onCancel={() => setMoreEvents({ visible: false, events: [], date: null })}
                centered
            >
                {moreEvents.events.map((event, idx) => (
                    <div key={idx} className="event-detail-item-modal" style={{ borderLeft: `4px solid ${event.color || getEventLabelColor(event.label)}` }}>
                        <div className="modal-event-time">{dayjs(event.startDate).format('HH:mm')}</div>
                        <div className="modal-event-title">{event.name}</div>
                        <div className="modal-event-meta">
                             <Tag icon={<FiTag />} style={{ border: 'none', background: '#f1f5f9' }}>{event.label || 'Event'}</Tag>
                        </div>
                    </div>
                ))}
            </Modal>
        </div>
    );
};

export default CalendarPage;
