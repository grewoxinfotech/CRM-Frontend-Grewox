import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Typography, Card, message, Button, Empty, Tag, Modal, Space, Row, Col } from 'antd';
import { FiHome, FiCalendar, FiTrash2, FiTag, FiClock } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';
import './calender.scss';
import CreateEvent from './CreateCalender';
import { useGetAllCalendarEventsQuery, useDeleteCalendarEventMutation } from './services/calendarApi';
import { useGetGlobalFollowupsQuery } from '../../crm/lead/services/LeadApi';
import { useGetMeetingsQuery } from '../../hrm/Meeting/services/meetingApi';
import PageHeader from '../../../../components/PageHeader';

const { Title, Text } = Typography;

const CalendarPage = () => {
    const [selectedDate, setSelectedDate] = useState(dayjs());
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [events, setEvents] = useState([]);
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [moreEvents, setMoreEvents] = useState({ visible: false, events: [], date: null });

    // Fetch Custom Events
    const { data: calendarEvents, isLoading: customLoading } = useGetAllCalendarEventsQuery();
    const [deleteCalendarEvent] = useDeleteCalendarEventMutation();

    // Fetch CRM Followups & HRM Meetings
    const { data: followupsResponse } = useGetGlobalFollowupsQuery();
    const { data: meetingsResponse } = useGetMeetingsQuery({ page: 1, pageSize: 1000 });

    // Merge all events dynamically
    const allEvents = useMemo(() => {
        const customList = Array.isArray(calendarEvents) ? calendarEvents : calendarEvents?.data || [];
        const formattedCustom = customList.map(e => ({
            ...e,
            isCustom: true
        }));

        // Parse CRM Follow-ups
        const crmList = followupsResponse?.data || [];
        const formattedCrm = crmList.map(f => {
            const timeStr = f.time || '12:00:00';
            const timeFormatted = timeStr.includes(':') && timeStr.split(':').length === 2 ? `${timeStr}:00` : timeStr;
            const startDateTime = `${f.date}T${timeFormatted}`;
            return {
                id: `crm-${f.id}`,
                name: `[CRM ${f.type.toUpperCase()}] ${f.name} (${f.relatedName || ''})`,
                startDate: startDateTime,
                label: `CRM ${f.type}`,
                color: f.type === 'meeting' ? '#ec4899' : f.type === 'task' ? '#f59e0b' : '#3b82f6',
                isCustom: false
            };
        });

        // Parse HRM Meetings
        const hrmList = meetingsResponse?.data || [];
        const formattedHrm = hrmList.map(m => {
            const timeStr = m.startTime || '12:00:00';
            const dateStr = m.date ? dayjs(m.date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
            const startDateTime = `${dateStr}T${timeStr}`;
            return {
                id: `hrm-${m.id}`,
                name: `[HRM MEETING] ${m.title}`,
                startDate: startDateTime,
                label: 'HRM Meeting',
                color: '#8b5cf6',
                isCustom: false
            };
        });

        return [...formattedCustom, ...formattedCrm, ...formattedHrm];
    }, [calendarEvents, followupsResponse, meetingsResponse]);

    // Keep events arrays in sync with memoized merged events
    useEffect(() => {
        setEvents(allEvents);
        setUpcomingEvents(allEvents.filter(e => dayjs(e.startDate).isSameOrAfter(dayjs(), 'day')).sort((a, b) => dayjs(a.startDate).diff(dayjs(b.startDate))));
    }, [allEvents]);

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
                                {upcomingEvents.slice(0, 8).map(event => (
                                    <div key={event.id} className="upcoming-event-item-premium">
                                        <div className="event-accent-bar" style={{ background: event.color || getEventLabelColor(event.label) }} />
                                        <div className="event-info-box">
                                            <div className="event-title-main" style={{ fontSize: '12px', fontWeight: '600' }}>{event.name}</div>
                                            <Space size={8}>
                                                <Tag icon={<FiClock size={10} />} style={{ fontSize: '10px', borderRadius: '4px', margin: 0 }}>{dayjs(event.startDate).format('MMM DD, HH:mm')}</Tag>
                                                {event.label && <Tag color="blue" style={{ fontSize: '10px', borderRadius: '4px', margin: 0, textTransform: 'capitalize' }}>{event.label}</Tag>}
                                            </Space>
                                        </div>
                                        {event.isCustom && <Button type="text" danger icon={<FiTrash2 size={14} />} onClick={() => handleDeleteEvent(event.id)} size="small" />}
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
                    <div key={idx} className="event-detail-item-modal" style={{ borderLeft: `4px solid ${event.color || getEventLabelColor(event.label)}`, padding: '10px', marginBottom: '8px', background: '#f8fafc', borderRadius: '4px' }}>
                        <div className="modal-event-time" style={{ fontWeight: '600', color: '#4f46e5' }}>{dayjs(event.startDate).format('HH:mm')}</div>
                        <div className="modal-event-title" style={{ fontWeight: '500', margin: '4px 0' }}>{event.name}</div>
                        <div className="modal-event-meta">
                             <Tag icon={<FiTag />} style={{ border: 'none', background: '#e0e7ff', color: '#4f46e5' }}>{event.label || 'Event'}</Tag>
                        </div>
                    </div>
                ))}
            </Modal>
        </div>
    );
};

export default CalendarPage;
