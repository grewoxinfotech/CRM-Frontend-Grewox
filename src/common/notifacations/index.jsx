import React from 'react';
import { Tabs, Typography, Button, Badge, Empty, Dropdown } from 'antd';
import { BiBell, BiCalendarEvent } from 'react-icons/bi';
import { useGetAllNotificationsQuery, useMarkAsReadMutation, useClearAllNotificationsMutation } from './services/notificationApi';
import './notifications.scss';

const { Title } = Typography;

const NotificationsComponent = () => {
    const { data: notificationsData, isLoading } = useGetAllNotificationsQuery();
    const [markAsRead] = useMarkAsReadMutation();
    const [clearAll] = useClearAllNotificationsMutation();

    const notifications = notificationsData?.data || [];
    const normalNotifications = notifications.filter(n => n.notification_type === 'normal');
    const reminders = notifications.filter(n => n.notification_type === 'reminder');

    const handleMarkAsRead = async (id) => {
        try {
            await markAsRead(id);
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    };

    const handleClearAll = async () => {
        try {
            await clearAll();
        } catch (error) {
            console.error('Error clearing notifications:', error);
        }
    };

    const items = [
        {
            key: '1',
            label: (
                <Badge count={normalNotifications.length} size="small">
                    <span>Notifications</span>
                </Badge>
            ),
            children: (
                <div className="notifications-list">
                    {normalNotifications.length > 0 ? (
                        normalNotifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`notification-item ${!notification.read ? 'unread' : ''}`}
                                onClick={() => handleMarkAsRead(notification.id)}
                            >
                                <div className="notification-content">
                                    <div className="notification-icon-wrapper">
                                        <BiBell className="notification-icon info" />
                                    </div>
                                    <div className="notification-details">
                                        <Typography.Text strong>{notification.title}</Typography.Text>
                                        <Typography.Text type="secondary">{notification.message}</Typography.Text>
                                        <span className="notification-time">
                                            {new Date(notification.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <Empty description="No notifications" />
                    )}
                </div>
            ),
        },
        {
            key: '2',
            label: (
                <Badge count={reminders.length} size="small">
                    <span>Reminders</span>
                </Badge>
            ),
            children: (
                <div className="notifications-list">
                    {reminders.length > 0 ? (
                        reminders.map((reminder) => (
                            <div
                                key={reminder.id}
                                className={`notification-item ${!reminder.read ? 'unread' : ''}`}
                                onClick={() => handleMarkAsRead(reminder.id)}
                            >
                                <div className="notification-content">
                                    <div className="notification-icon-wrapper">
                                        <BiCalendarEvent className="notification-icon reminder" />
                                    </div>
                                    <div className="notification-details">
                                        <Typography.Text strong>{reminder.title}</Typography.Text>
                                        <Typography.Text type="secondary">{reminder.message}</Typography.Text>
                                        <span className="notification-time">
                                            {new Date(reminder.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <Empty description="No reminders" />
                    )}
                </div>
            ),
        },
    ];

    const notificationPanel = (
        <div className="notifications-dropdown">
            <div className="notifications-header">
                <Title level={5}>Notifications</Title>
                <Button type="link" onClick={handleClearAll}>
                    Clear all
                </Button>
            </div>
            <Tabs
                defaultActiveKey="1"
                items={items}
                className="notification-tabs"
            />
            <div className="notifications-footer">
                <Button type="primary" block>
                    View Analytics
                </Button>
            </div>
        </div>
    );

    const totalUnread = notifications.filter(n => !n.read).length;

    return (
        <Dropdown
            overlay={notificationPanel}
            trigger={['click']}
            placement="bottomRight"
            overlayClassName="notification-dropdown-overlay"
        >
            <Badge count={totalUnread} className="notification-badge">
                <Button type="text" className="notification-button">
                    <BiBell className="notification-bell-icon" />
                </Button>
            </Badge>
        </Dropdown>
    );
};

export default NotificationsComponent;
